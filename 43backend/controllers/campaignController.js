import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Get all campaigns with filters and pagination
 */
export const getCampaigns = async (req, res, next) => {
  try {
    const {
      category,
      search,
      charity_id,
      status,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('Campaign')
      .select(`
        *,
        Charity:charity_id (*)
      `);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (charity_id) {
      query = query.eq('charity_id', charity_id);
    }

    // Default to active campaigns only (unless explicitly requesting other statuses or filtering by charity)
    if (status) {
      query = query.eq('status', status);
    } else if (!charity_id) {
      query = query.eq('status', 'active');
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('Campaign')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Apply sorting
    if (sort === 'most-funded') {
      query = query.order('current_amount', { ascending: false });
    } else if (sort === 'ending-soon') {
      query = query.order('end_date', { ascending: true });
    } else if (sort === 'most-donors') {
      query = query.order('campaign_id', { ascending: false });
    } else {
      query = query.order('campaign_id', { ascending: false });
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Supabase error in getCampaigns:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return errorResponse(res, 'Failed to fetch campaigns', error.message || JSON.stringify(error), 500);
    }

    // Calculate donor count for each campaign
    const campaignsWithDonorCount = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const { count, error: countError } = await supabase
            .from('Donation')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.campaign_id || campaign.id)
            .eq('transaction_status', 'completed');

          if (countError) console.warn('Count error for campaign:', campaign.campaign_id || campaign.id, countError);

          return {
            ...campaign,
            donor_count: count || 0
          };
        } catch (innerErr) {
          console.warn('Inner error calculating donor count:', innerErr);
          return { ...campaign, donor_count: 0 };
        }
      })
    );

    const totalPages = Math.ceil((count || 0) / limit);

    return paginatedResponse(
      res,
      campaignsWithDonorCount,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages
      },
      'Campaigns retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured/urgent campaigns
 */
export const getFeaturedCampaigns = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Campaign')
      .select(`
        *,
        Charity (*)
      `)
      .eq('status', 'active')
      .order('campaign_id', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error in getFeaturedCampaigns:', error);
      return errorResponse(res, 'Failed to fetch featured campaigns', error.message || JSON.stringify(error), 500);
    }

    return successResponse(res, data, 'Featured campaigns retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single campaign by ID
 */
export const getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: campaign, error } = await supabase
      .from('Campaign')
      .select(`
        *,
        Charity (*)
      `)
      .eq('campaign_id', id)
      .single();

    if (error || !campaign) {
      return errorResponse(res, 'Campaign not found', null, 404);
    }

    // Get donor count
    const { count, error: countError } = await supabase
      .from('Donation')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaign.campaign_id || campaign.id)
      .eq('transaction_status', 'completed');

    if (countError) console.warn('Donor count error for single campaign:', id, countError);

    return successResponse(
      res,
      {
        ...campaign,
        donor_count: count || 0
      },
      'Campaign retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new campaign
 */
export const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      target_amount,
      category,
      end_date
    } = req.body;

    // Validation
    if (!title || !description || !target_amount || !category || !end_date) {
      return errorResponse(
        res,
        'Missing required fields',
        'title, description, target_amount, category, and end_date are required',
        400
      );
    }

    if (target_amount <= 0) {
      return errorResponse(res, 'target_amount must be greater than 0', null, 400);
    }

    // No authentication required - charity_id must be provided in request
    const charity_id = req.body.charity_id;

    if (!charity_id) {
      return errorResponse(res, 'charity_id is required', null, 400);
    }

    const campaignData = {
      title,
      description,
      target_amount: parseFloat(target_amount),
      current_amount: 0,
      category,
      charity_id,
      end_date,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('Campaign')
      .insert(campaignData)
      .select(`
        *,
        Charity (*)
      `)
      .single();

    if (error) {
      return errorResponse(res, 'Failed to create campaign', error.message, 400);
    }

    return successResponse(
      res,
      {
        ...data,
        donor_count: 0
      },
      'Campaign created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update campaign
 */
export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.charity_id;
    delete updates.current_amount; // Updated through donations

    const { data, error } = await supabase
      .from('Campaign')
      .update({
        ...updates
      })
      .eq('campaign_id', id)
      .select(`
        *,
        Charity (
          Charity_id,
          name,
          email
        )
      `)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Campaign not found or update failed', error?.message, 404);
    }

    return successResponse(res, data, 'Campaign updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete campaign
 */
export const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('Campaign')
      .delete()
      .eq('campaign_id', id);

    if (error) {
      return errorResponse(res, 'Failed to delete campaign', error.message, 400);
    }

    return successResponse(res, null, 'Campaign deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Pause campaign
 */
export const pauseCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Campaign')
      .update({ status: 'paused' })
      .eq('campaign_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to pause campaign', error?.message, 400);
    }

    return successResponse(res, data, 'Campaign paused successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Resume campaign
 */
export const resumeCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Campaign')
      .update({ status: 'active' })
      .eq('campaign_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to resume campaign', error?.message, 400);
    }

    return successResponse(res, data, 'Campaign resumed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign analytics (charity only)
 */
export const getCampaignAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('Campaign')
      .select('*')
      .eq('campaign_id', id)
      .single();

    if (campaignError || !campaign) {
      return errorResponse(res, 'Campaign not found', null, 404);
    }

    // No authentication required - allow access to all

    // Get donation statistics
    const { data: donations, error: donationsError } = await supabase
      .from('Donation')
      .select('*')
      .eq('campaign_id', id)
      .eq('transaction_status', 'completed');

    if (donationsError) {
      return errorResponse(res, 'Failed to fetch analytics', donationsError.message, 500);
    }

    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    const anonymousCount = donations.filter(d => d.is_anonymous).length;

    return successResponse(
      res,
      {
        campaign,
        statistics: {
          total_donations: totalDonations,
          total_amount: totalAmount,
          average_donation: averageDonation,
          anonymous_count: anonymousCount,
          completion_percentage: (campaign.current_amount / campaign.target_amount) * 100
        },
        donations
      },
      'Campaign analytics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Flag campaign for review
 */
export const flagCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Reason is required', null, 400);
    }

    const { data, error } = await supabase
      .from('flagged_campaigns')
      .insert({
        campaign_id: id,
        reason,
        flagged_by: req.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return errorResponse(res, 'Failed to flag campaign', error.message, 400);
    }

    return successResponse(res, data, 'Campaign flagged successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Reapply campaign (charity)
 */
export const reapplyCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Campaign')
      .update({
        status: 'pending',
        rejection_reason: null
      })
      .eq('campaign_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to reapply campaign', error?.message, 400);
    }

    return successResponse(res, data, 'Campaign re-submitted successfully', 200);
  } catch (error) {
    next(error);
  }
};

