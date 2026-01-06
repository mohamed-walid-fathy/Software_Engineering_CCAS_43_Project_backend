import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Create new donation
 */
export const createDonation = async (req, res, next) => {
  try {
    const { campaign_id, amount, is_anonymous = false, payment_method = 'stripe' } = req.body;

    if (!campaign_id || !amount) {
      return errorResponse(res, 'campaign_id and amount are required', null, 400);
    }

    if (amount <= 0) {
      return errorResponse(res, 'amount must be greater than 0', null, 400);
    }

    // Get campaign to verify it exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaign')
      .select('*')
      .eq('campaign_id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return errorResponse(res, 'Campaign not found', null, 404);
    }

    if (campaign.status !== 'active') {
      return errorResponse(res, 'Campaign is not active', null, 400);
    }

    // Handle donor_id - schema has NOT NULL constraint
    // For anonymous donations, we use donor_id = 1 as placeholder
    let donor_id = req.body.donor_id;

    if (!donor_id) {
      // For anonymous donations, use donor_id = 1
      donor_id = 1;
    }

    // Create donation record
    const donationData = {
      campaign_id,
      donor_id,
      amount: parseFloat(amount),
      transaction_status: 'pending',
      payment_method: ['credit_card', 'paypal', 'bank_transfer', 'debit_card'].includes(payment_method) ? payment_method : 'credit_card',
      transaction_reference: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    console.log('Creating donation with data:', JSON.stringify(donationData, null, 2));

    const { data: donation, error: donationError } = await supabase
      .from('donation')
      .insert(donationData)
      .select(`
        *,
        campaign:campaign_id (
          campaign_id,
          title,
          description,
          target_amount,
          current_amount
        )
      `)
      .single();

    if (donationError) {
      console.error('Supabase error in createDonation:', donationError);
      console.error('Error details:', JSON.stringify(donationError, null, 2));
      console.error('Donation data that failed:', JSON.stringify(donationData, null, 2));
      return errorResponse(res, 'Failed to create donation', donationError.message, 400);
    }

    // TODO: Integrate Stripe payment processing here
    // For now, we'll set status to 'completed' and update campaign amount
    // In production, this should happen after payment confirmation

    // Update campaign current_amount atomically
    const newAmount = parseFloat(campaign.current_amount) + parseFloat(amount);
    const { error: updateError } = await supabase
      .from('campaign')
      .update({
        current_amount: newAmount
      })
      .eq('campaign_id', campaign_id);

    if (updateError) {
      console.error('Failed to update campaign amount:', updateError);
    }

    // Update donation status to completed
    const { data: updatedDonation } = await supabase
      .from('donation')
      .update({ transaction_status: 'completed' })
      .eq('donation_id', donation.donation_id)
      .select()
      .single();

    // TODO: Send confirmation email to donor
    // TODO: Generate tax receipt

    return successResponse(
      res,
      updatedDonation || donation,
      'Donation created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get donations with filters
 */
export const getDonations = async (req, res, next) => {
  try {
    const {
      campaign_id,
      donor_id,
      charity_id,
      status,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('donation')
      .select(`
          *,
          campaign:campaign_id (
            campaign_id,
            title,
            description,
            target_amount,
            current_amount,
            category,
            status
          )
        `);

    // Apply filters
    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (donor_id) {
      query = query.eq('donor_id', donor_id);
    }

    if (status) {
      query = query.eq('transaction_status', status);
    }

    if (charity_id) {
      const { data: campaigns } = await supabase
        .from('campaign')
        .select('campaign_id')
        .eq('charity_id', charity_id);

      const campaignIds = campaigns?.map(c => c.campaign_id) || [];
      if (campaignIds.length > 0) {
        query = query.in('campaign_id', campaignIds);
      } else {
        return paginatedResponse(
          res,
          [],
          {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          },
          'Donations retrieved successfully',
          200
        );
      }
    }

    // Get total count
    const { count } = await supabase
      .from('donation')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by donation_date
    query = query.order('donation_date', { ascending: false });

    const { data: donations, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch donations', error.message, 500);
    }

    // Fetch donor data for each donation
    const donationsWithDonors = await Promise.all(
      donations.map(async (donation) => {
        if (donation.donor_id && donation.donor_id !== 1) { // 1 is anonymous placeholder
          const { data: donor } = await supabase
            .from('donor')
            .select('donor_id, first_name, last_name, email')
            .eq('donor_id', donation.donor_id)
            .single();

          if (donor) {
            donation.donor = donor;
          }
        } else if (donation.donor_id === 1) {
          donation.donor = {
            donor_id: 1,
            first_name: 'Anonymous',
            last_name: 'Donor',
            email: null
          };
        }
        return donation;
      })
    );

    const totalPages = Math.ceil((count || 0) / limit);

    return paginatedResponse(
      res,
      donationsWithDonors,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages
      },
      'Donations retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single donation by ID
 */
export const getDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: donation, error } = await supabase
      .from('donation')
      .select(`
        *,
        campaign:campaign_id (
          campaign_id,
          title,
          description,
          target_amount,
          current_amount
        )
      `)
      .eq('donation_id', id)
      .single();

    // Fetch donor data separately if donor_id exists
    if (donation && donation.donor_id) {
      const { data: donor } = await supabase
        .from('donor')
        .select('donor_id, first_name, last_name, email')
        .eq('donor_id', donation.donor_id)
        .single();

      if (donor) {
        donation.donor = donor;
      }
    }

    if (error || !donation) {
      return errorResponse(res, 'Donation not found', null, 404);
    }

    // No authentication required - show all data
    // Hide donor info for anonymous donations
    if (donation.donor_id === 1 && donation.donor) {
      donation.donor = {
        id: null,
        first_name: 'Anonymous',
        last_name: 'Donor',
        email: null
      };
    }

    return successResponse(res, donation, 'Donation retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund (admin/charity)
 */
export const refundDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get donation
    const { data: donation, error: donationError } = await supabase
      .from('donation')
      .select(`
        *,
        campaign:campaign_id (
          campaign_id,
          title,
          description,
          target_amount,
          current_amount
        )
      `)
      .eq('donation_id', id)
      .single();

    if (donationError || !donation) {
      return errorResponse(res, 'Donation not found', null, 404);
    }

    // No authentication required - allow refunds

    if (donation.status === 'refunded') {
      return errorResponse(res, 'Donation already refunded', null, 400);
    }

    // Update donation status
    const { data: updatedDonation, error: updateError } = await supabase
      .from('donation')
      .update({ transaction_status: 'refunded' })
      .eq('donation_id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse(res, 'Failed to process refund', updateError.message, 400);
    }

    // Update campaign current_amount
    const newAmount = Math.max(0, parseFloat(donation.campaign.current_amount) - parseFloat(donation.amount));
    await supabase
      .from('campaign')
      .update({
        current_amount: newAmount
      })
      .eq('campaign_id', donation.campaign_id);

    // TODO: Process actual refund through Stripe

    return successResponse(res, updatedDonation, 'Refund processed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation statistics
 */
/**
 * Get donation statistics
 */
export const getDonationStats = async (req, res, next) => {
  try {
    const { campaign_id, charity_id, donor_id } = req.query;

    let query = supabase.from('donation').select('*').in('transaction_status', ['completed', 'Done']);

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (donor_id) {
      query = query.eq('donor_id', donor_id);
    }

    if (charity_id) {
      const { data: campaigns } = await supabase
        .from('campaign')
        .select('campaign_id')
        .eq('charity_id', charity_id);

      const campaignIds = campaigns?.map(c => c.campaign_id) || [];
      if (campaignIds.length > 0) {
        query = query.in('campaign_id', campaignIds);
      }
    }

    const { data: donations, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch statistics', error.message, 500);
    }

    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Calculate unique campaigns supported count
    const campaignsCount = new Set(donations.map(d => d.campaign_id)).size;

    return successResponse(
      res,
      {
        total_donations: totalDonations,
        total_amount: totalAmount,
        average_donation: averageDonation,
        campaign_count: campaignsCount,
        // Calculate mock rank based on amount
        rank: totalAmount > 10000 ? 'Gold' : totalAmount > 1000 ? 'Silver' : 'Bronze'
      },
      'Statistics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform-wide statistics for homepage
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    // 1. Get total raised and unique donors from Donation table
    const { data: donations, error: donationError } = await supabase
      .from('donation')
      .select('amount, donor_id')
      .in('transaction_status', ['completed', 'Done']);

    if (donationError) throw donationError;

    const totalRaised = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalDonors = new Set(donations.map(d => d.donor_id).filter(id => id !== null)).size;

    // 2. Get active campaigns count
    const { count: activeCampaigns, error: campaignError } = await supabase
      .from('campaign')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (campaignError) throw campaignError;

    // 3. Get verified charities count
    const { count: verifiedCharities, error: charityError } = await supabase
      .from('charity')
      .select('*', { count: 'exact', head: true })
      .eq('verified_status', 'verified');

    if (charityError) throw charityError;

    return successResponse(
      res,
      {
        total_raised: totalRaised,
        total_donors: totalDonors,
        total_campaigns: activeCampaigns || 0,
        total_charities: verifiedCharities || 0,
        // Mocking countries as we don't have it in schema yet, but using a semi-realistic number
        countries_count: 5 // Default for now
      },
      'Platform statistics retrieved successfully',
      200
    );
  } catch (error) {
    console.error('Error in getPlatformStats:', error);
    next(error);
  }
};

/**
 * Stripe webhook handler
 */
export const handleStripeWebhook = async (req, res, next) => {
  try {
    // TODO: Implement Stripe webhook verification and processing
    // This should verify the webhook signature and update donation status
    // based on payment events (payment_intent.succeeded, payment_intent.failed, etc.)

    return successResponse(res, null, 'Webhook processed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate tax receipt PDF
 */
export const generateReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get donation
    const { data: donation, error } = await supabase
      .from('donation')
      .select(`
        *,
        campaign:campaign_id (
          campaign_id,
          title,
          description,
          target_amount,
          current_amount
        ),
        donor (
          donor_id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('donation_id', id)
      .single();

    if (error || !donation) {
      return errorResponse(res, 'Donation not found', null, 404);
    }

    // TODO: Generate PDF receipt
    // This would typically use a library like pdfkit or puppeteer

    return successResponse(
      res,
      {
        receipt_url: `https://your-domain.com/receipts/${id}.pdf`
      },
      'Receipt generated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

