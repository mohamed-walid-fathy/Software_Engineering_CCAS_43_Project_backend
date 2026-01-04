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
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
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

    let query = supabase.from('Charity').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (is_verified !== undefined) {
      query = query.eq('Verified Status', is_verified === 'true');
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
      .from('Charity')
      .select('*')
      .eq('Charity_id', id)
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
      .from('Charity')
      .select('*')
      .eq('Verified Status', false)
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
      .from('Charity')
      .update({ 'Verified Status': true })
      .eq('Charity_id', id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Failed to approve charity', error?.message, 400);
    }

    // Log admin action (safely)
    try {
      await supabase.from('admin_actions').insert({
        admin_id: req.user?.id || 'system',
        action: 'approve_charity',
        target_id: id,
        details: { charity_name: data.name }
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
      .from('Charity')
      .select('*')
      .eq('Charity_id', id)
      .single();

    if (!charity) {
      return errorResponse(res, 'Charity not found', null, 404);
    }

    // Update charity with rejection reason instead of deleting
    const { error } = await supabase
      .from('Charity')
      .update({
        'Verified Status': false,
        rejection_reason: reason
      })
      .eq('Charity_id', id);

    if (error) {
      return errorResponse(res, 'Failed to reject charity', error.message, 400);
    }

    // Log admin action (safely)
    try {
      await supabase.from('admin_actions').insert({
        admin_id: req.user?.id || 'system',
        action: 'reject_charity',
        target_id: id,
        details: { charity_name: charity.name, reason }
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
      .from('Charity')
      .select('*')
      .eq('Charity_id', id)
      .single();

    if (!charity) {
      return errorResponse(res, 'Charity not found', null, 404);
    }

    if (!charity.rejection_reason) {
      return errorResponse(res, 'Charity was not rejected', null, 400);
    }

    // Clear rejection reason and set back to pending
    const { error } = await supabase
      .from('Charity')
      .update({
        rejection_reason: null,
        'Verified Status': false // Pending review
      })
      .eq('Charity_id', id);

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
        .from('Charity')
        .select('*')
        .eq('Charity_id', id)
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
    delete updates.password_hash; // Password should be updated through auth
    if (req.user.role !== 'admin') {
      delete updates.is_verified; // Only admins can change this
    }

    // Determine which table to update
    let { data: donor } = await supabase
      .from('donor')
      .select('donor_id')
      .eq('donor_id', id)
      .single();

    const tableName = donor ? 'donor' : 'Charity';
    const idField = donor ? 'donor_id' : 'Charity_id';

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
      .from('Donation')
      .select(`
        *,
        Campaign:campaign_id (
          id,
          title,
          image
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
      .from('Campaign')
      .select('*')
      .eq('charity_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse(res, 'Failed to fetch campaigns', error.message, 500);
    }

    return successResponse(res, data, 'Campaigns retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

