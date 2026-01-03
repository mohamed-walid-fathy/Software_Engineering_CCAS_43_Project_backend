import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get platform statistics
 */
export const getStats = async (req, res, next) => {
  try {
    // Get total donations
    const { data: donations, error: donationError } = await supabase
      .from('Donation')
      .select('amount')
      .in('transaction_status', ['completed', 'Done']);

    if (donationError) {
      console.error('Error fetching donations for stats:', donationError);
    }

    const totalDonationAmount = donations?.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) || 0;
    const totalDonations = donations?.length || 0;

    // Get active users
    const { count: totalDonors } = await supabase
      .from('donor')
      .select('*', { count: 'exact', head: true });

    const { count: totalCharities } = await supabase
      .from('Charity')
      .select('*', { count: 'exact', head: true });

    const { count: verifiedCharities } = await supabase
      .from('Charity')
      .select('*', { count: 'exact', head: true })
      .eq('Verified Status', true);

    // Get pending reviews
    let pendingCharities = 0;
    try {
      const { count } = await supabase
        .from('Charity')
        .select('*', { count: 'exact', head: true })
        .eq('Verified Status', false);
      pendingCharities = count || 0;
    } catch (e) {
      console.warn('Failed to fetch pending charities count:', e.message);
    }

    let flaggedCampaignsCount = 0;
    try {
      const { count, error: flaggedError } = await supabase
        .from('flagged_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (!flaggedError) flaggedCampaignsCount = count || 0;
    } catch (e) {
      console.warn('Failed to fetch flagged campaigns count:', e.message);
    }

    // Get active campaigns
    const { count: activeCampaigns } = await supabase
      .from('Campaign')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get pending campaigns
    const { count: pendingCampaigns } = await supabase
      .from('Campaign')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return successResponse(
      res,
      {
        total_donations: totalDonations || 0,
        total_donation_amount: totalDonationAmount,
        active_users: (totalDonors || 0) + (totalCharities || 0),
        verified_charities: verifiedCharities || 0,
        pending_reviews: (pendingCharities || 0) + (pendingCampaigns || 0),
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
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.warn('admin_actions table might be missing:', error.message);
      return successResponse(res, [], 'Activity retrieved successfully (empty)', 200);
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
          campaign_id,
          title,
          charity_id
        )
      `)
      .eq('status', status)
      .order('flagged_at', { ascending: false });

    if (error) {
      console.warn('flagged_campaigns table might be missing:', error.message);
      return successResponse(res, [], 'Flagged campaigns retrieved successfully (empty)', 200);
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
      .from('Campaign')
      .update({
        status: 'cancelled'
      })
      .eq('campaign_id', id)
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
      .in('transaction_status', ['completed', 'Done'])
      .order('created_at', { ascending: false })
      .limit(100);

    // Get campaign performance
    const { data: campaigns } = await supabase
      .from('Campaign')
      .select('campaign_id, title, target_amount, current_amount')
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

/**
 * Get pending campaigns (admin)
 */
export const getPendingCampaigns = async (req, res, next) => {
  try {
    console.log('Fetching pending campaigns...');
    const { data, error } = await supabase
      .from('Campaign')
      .select(`
        *,
        Charity (*)
      `)
      .eq('status', 'pending');

    if (error) {
      console.error('Supabase error in getPendingCampaigns:', error);
      // Return empty array instead of 500 to keep dashboard functional
      return successResponse(res, [], 'Failed to fetch pending campaigns, returning empty list', 200);
    }

    console.log(`Successfully fetched ${data?.length || 0} pending campaigns`);

    return successResponse(res, data || [], 'Pending campaigns retrieved successfully', 200);
  } catch (error) {
    console.error('Critical failure in getPendingCampaigns:', error);
    return successResponse(res, [], 'Internal error fetching campaigns', 200);
  }
};

/**
 * Approve campaign (admin)
 */
export const approveCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Campaign')
      .update({ status: 'active' })
      .eq('campaign_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to approve campaign', error?.message, 400);
    }

    // Log admin action (ignore if table missing)
    try {
      await supabase.from('admin_actions').insert({
        admin_id: req.user?.id || 'system',
        action: 'approve_campaign',
        target_id: id
      });
    } catch (e) {
      console.warn('Failed to log admin action:', e.message);
    }

    return successResponse(res, data, 'Campaign approved successfully', 200);
  } catch (error) {
    next(error);
  }
};
