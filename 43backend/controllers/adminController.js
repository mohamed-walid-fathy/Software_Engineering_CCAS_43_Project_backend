import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get platform statistics
 */
export const getStats = async (req, res, next) => {
  try {
    // Get total donations
    const { count: totalDonations, data: donations } = await supabase
      .from('Donation')
      .select('amount', { count: 'exact' })
      .eq('status', 'completed');

    const totalDonationAmount = donations?.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) || 0;

    // Get active users
    const { count: totalDonors } = await supabase
      .from('donor')
      .select('*', { count: 'exact', head: true });

    const { count: totalCharities } = await supabase
      .from('charities')
      .select('*', { count: 'exact', head: true });

    const { count: verifiedCharities } = await supabase
      .from('charities')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Get pending reviews
    const { count: pendingCharities } = await supabase
      .from('charities')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false);

    const { count: flaggedCampaigns } = await supabase
      .from('flagged_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get active campaigns
    const { count: activeCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return successResponse(
      res,
      {
        total_donations: totalDonations || 0,
        total_donation_amount: totalDonationAmount,
        active_users: (totalDonors || 0) + (totalCharities || 0),
        verified_charities: verifiedCharities || 0,
        pending_reviews: (pendingCharities || 0) + (flaggedCampaigns || 0),
        active_campaigns: activeCampaigns || 0
      },
      'Statistics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent platform activity
 */
export const getActivity = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('admin_actions')
      .select(`
        *,
        admins (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return errorResponse(res, 'Failed to fetch activity', error.message, 500);
    }

    return successResponse(res, data, 'Activity retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get flagged campaigns
 */
export const getFlaggedCampaigns = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const { data, error } = await supabase
      .from('flagged_campaigns')
      .select(`
        *,
        Campaign:campaign_id (
          id,
          title,
          charity_id
        )
      `)
      .eq('status', status)
      .order('flagged_at', { ascending: false });

    if (error) {
      return errorResponse(res, 'Failed to fetch flagged campaigns', error.message, 500);
    }

    return successResponse(res, data, 'Flagged campaigns retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Flag campaign (admin)
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

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: req.user.id,
      action: 'flag_campaign',
      target_id: id,
      details: { reason }
    });

    return successResponse(res, data, 'Campaign flagged successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Unflag campaign (admin)
 */
export const unflagCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('flagged_campaigns')
      .update({ status: 'resolved' })
      .eq('campaign_id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to unflag campaign', error?.message, 400);
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: req.user.id,
      action: 'unflag_campaign',
      target_id: id
    });

    return successResponse(res, data, 'Campaign unflagged successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend campaign (admin)
 */
export const suspendCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to suspend campaign', error?.message, 400);
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: req.user.id,
      action: 'suspend_campaign',
      target_id: id,
      details: { reason: reason || 'No reason provided' }
    });

    return successResponse(res, data, 'Campaign suspended successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform reports
 */
export const getReports = async (req, res, next) => {
  try {
    const { type, start_date, end_date } = req.query;

    // This would generate various reports based on type
    // For now, return a basic structure
    return successResponse(
      res,
      {
        type: type || 'general',
        period: {
          start: start_date,
          end: end_date
        },
        message: 'Report generation not yet implemented'
      },
      'Reports retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    // Get donation trends
    const { data: donations } = await supabase
      .from('Donation')
      .select('amount, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    // Get campaign performance
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, goal_amount, current_amount, created_at')
      .order('current_amount', { ascending: false })
      .limit(10);

    return successResponse(
      res,
      {
        donation_trends: donations || [],
        top_campaigns: campaigns || []
      },
      'Analytics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

