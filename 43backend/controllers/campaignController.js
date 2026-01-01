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
      .from('campaigns')
      .select(`
        *,
        charities (
          id,
          name,
          email,
          is_verified
        )
      `);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (charity_id) {
      query = query.eq('charity_id', charity_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Apply sorting
    if (sort === 'most-funded') {
      query = query.order('current_amount', { ascending: false });
    } else if (sort === 'ending-soon') {
      query = query.order('days_left', { ascending: true });
    } else if (sort === 'most-donors') {
      // This would require a join or separate query to count donors
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: campaigns, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch campaigns', error.message, 500);
    }

    // Calculate donor count for each campaign
    const campaignsWithDonorCount = await Promise.all(
      campaigns.map(async (campaign) => {
        const { count } = await supabase
          .from('Donation')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'completed');

        return {
          ...campaign,
          donor_count: count || 0
        };
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
      .from('campaigns')
      .select(`
        *,
        charities (
          id,
          name,
          email,
          is_verified
        )
      `)
      .eq('is_urgent', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return errorResponse(res, 'Failed to fetch featured campaigns', error.message, 500);
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
      .from('campaigns')
      .select(`
        *,
        charities (
          id,
          name,
          email,
          is_verified
        )
      `)
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return errorResponse(res, 'Campaign not found', null, 404);
    }

    // Get donor count
    const { count } = await supabase
      .from('Donation')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id)
      .eq('status', 'completed');

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
      goal_amount,
      category,
      image,
      days_left,
      is_urgent
    } = req.body;

    // Validation
    if (!title || !description || !goal_amount || !category) {
      return errorResponse(
        res,
        'Missing required fields',
        'title, description, goal_amount, and category are required',
        400
      );
    }

    if (goal_amount <= 0) {
      return errorResponse(res, 'goal_amount must be greater than 0', null, 400);
    }

    // No authentication required - charity_id must be provided in request
    const charity_id = req.body.charity_id;

    if (!charity_id) {
      return errorResponse(res, 'charity_id is required', null, 400);
    }

    const campaignData = {
      title,
      description,
      goal_amount: parseFloat(goal_amount),
      current_amount: 0,
      category,
      charity_id,
      image: image || null,
      days_left: days_left || null,
      is_urgent: is_urgent || false,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select(`
        *,
        charities (
          id,
          name,
          email,
          is_verified
        )
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
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        charities (
          id,
          name,
          email,
          is_verified
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
      .from('campaigns')
      .delete()
      .eq('id', id);

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
      .from('campaigns')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', id)
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
      .from('campaigns')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
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
      .from('campaigns')
      .select('*')
      .eq('id', id)
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
      .eq('status', 'completed');

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
          completion_percentage: (campaign.current_amount / campaign.goal_amount) * 100
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

