import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Get all donors (admin only)
 */
export const getDonors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let query = supabase.from('donor').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch donors', error.message, 500);
    }

    return paginatedResponse(
      res,
      data,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      'Donors retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all charities
 */
export const getCharities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, is_verified } = req.query;

    let query = supabase.from('charity').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (is_verified !== undefined) {
      query = query.eq('verified_status', is_verified === 'true' ? 'verified' : 'pending');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch charities', error.message, 500);
    }

    return paginatedResponse(
      res,
      data,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      'Charities retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get charity by ID
 */
export const getCharityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('charity')
      .select('*')
      .eq('charity_id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Charity not found', error?.message, 404);
    }

    return successResponse(res, data, 'Charity details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending charity approvals (admin only)
 */
export const getPendingCharities = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charity')
      .select('*')
      .eq('verified_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse(res, 'Failed to fetch pending charities', error.message, 500);
    }

    return successResponse(res, data, 'Pending charities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve charity (admin only)
 */
export const approveCharity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('charity')
      .update({ verified_status: 'verified' })
      .eq('charity_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to approve charity', error?.message, 400);
    }

    // Log admin action (safely)
    try {
      await supabase.from('admin_actions').insert({
        admin_id: req.user?.id || 1, // Default to 1
        action: 'approve_charity',
        target_id: id,
        details: { charity_name: `${data.first_name} ${data.last_name}` }
      });
    } catch (e) {
      console.warn('Failed to log admin action:', e.message);
    }

    return successResponse(res, data, 'Charity approved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Reject charity (admin only)
 */
export const rejectCharity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Rejection reason is required', null, 400);
    }

    // Get charity info before update
    const { data: charity } = await supabase
      .from('charity')
      .select('*')
      .eq('charity_id', id)
      .single();

    if (!charity) {
      return errorResponse(res, 'Charity not found', null, 404);
    }

    // Update charity with rejection reason instead of deleting
    const { error } = await supabase
      .from('charity')
      .update({
        verified_status: 'rejected',
        rejection_reason: reason
      })
      .eq('charity_id', id);

    if (error) {
      return errorResponse(res, 'Failed to reject charity', error.message, 400);
    }

    // Log admin action (safely)
    try {
      await supabase.from('admin_actions').insert({
        admin_id: req.user?.id || 1,
        action: 'reject_charity',
        target_id: id,
        details: { charity_name: `${charity.first_name} ${charity.last_name}`, reason }
      });
    } catch (e) {
      console.warn('Failed to log admin action:', e.message);
    }

    return successResponse(res, null, 'Charity rejected successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Reapply charity after rejection
 */
export const reapplyCharity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get charity info
    const { data: charity } = await supabase
      .from('charity')
      .select('*')
      .eq('charity_id', id)
      .single();

    if (!charity) {
      return errorResponse(res, 'Charity not found', null, 404);
    }

    if (!charity.rejection_reason) {
      return errorResponse(res, 'Charity was not rejected', null, 400);
    }

    // Clear rejection reason and set back to pending
    const { error } = await supabase
      .from('charity')
      .update({
        rejection_reason: null,
        verified_status: 'pending' // Pending review
      })
      .eq('charity_id', id);

    if (error) {
      return errorResponse(res, 'Failed to reapply charity', error.message, 400);
    }

    return successResponse(res, null, 'Charity reapplication submitted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No authentication required - allow access to all

    // Try donor first (using donor_id)
    let { data: user, error } = await supabase
      .from('donor')
      .select('*')
      .eq('donor_id', id)
      .single();

    if (!user) {
      // Try charities
      const result = await supabase
        .from('charity')
        .select('*')
        .eq('charity_id', id)
        .single();

      user = result.data;
      error = result.error;
    }

    if (error || !user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    return successResponse(res, user, 'User retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No authentication required - allow updates

    const updates = req.body;
    delete updates.donor_id; // Don't allow updating primary key
    delete updates.id;
    delete updates.email; // Email should be updated through auth
    delete updates.password; // Don't allow updating password here
    delete updates.password_hash;
    if (req.user?.role !== 'admin') {
      delete updates.verified_status; // Only admins can change this
    }

    // Determine which table to update
    let { data: donor } = await supabase
      .from('donor')
      .select('donor_id')
      .eq('donor_id', id)
      .single();

    const tableName = donor ? 'donor' : 'charity';
    const idField = donor ? 'donor_id' : 'charity_id';

    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq(idField, id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to update user', error?.message, 400);
    }

    return successResponse(res, data, 'User updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user account
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No authentication required - allow deactivation

    // Soft delete by updating a status field or actually deleting
    // For now, we'll delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      return errorResponse(res, 'Failed to deactivate user', authError.message, 400);
    }

    return successResponse(res, null, 'User deactivated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's donation history
 */
export const getUserDonations = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No authentication required - allow updates

    // Use donor_id for querying donations
    const donorId = req.user?.donor_id || req.user?.profile?.donor_id || id;
    const { data, error } = await supabase
      .from('donation')
      .select(`
        *,
        campaign:campaign_id (
          campaign_id,
          title
        )
      `)
      .eq('donor_id', parseInt(donorId))
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse(res, 'Failed to fetch donations', error.message, 500);
    }

    return successResponse(res, data, 'Donations retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's campaigns (charity)
 */
export const getUserCampaigns = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No authentication required - allow updates

    const { data, error } = await supabase
      .from('campaign')
      .select('*')
      .eq('charity_id', id)
      .order('start_date', { ascending: false });

    if (error) {
      return errorResponse(res, 'Failed to fetch campaigns', error.message, 500);
    }

    return successResponse(res, data, 'Campaigns retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

