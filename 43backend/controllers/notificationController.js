import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    // No authentication required - userId can be passed as query param
    const userId = req.query.user_id || req.user?.id;
    
    if (!userId) {
      return errorResponse(res, 'user_id is required', null, 400);
    }
    const { page = 1, limit = 20, is_read } = req.query;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (is_read !== undefined) {
      query = query.eq('is_read', is_read === 'true');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch notifications', error.message, 500);
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
      'Notifications retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    // No authentication required - userId can be passed in body or query
    const userId = req.body.user_id || req.query.user_id || req.user?.id;
    
    if (!userId) {
      return errorResponse(res, 'user_id is required', null, 400);
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 'Notification not found', error?.message, 404);
    }

    return successResponse(res, data, 'Notification marked as read', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    // No authentication required - userId can be passed in body or query
    const userId = req.body.user_id || req.query.user_id || req.user?.id;
    
    if (!userId) {
      return errorResponse(res, 'user_id is required', null, 400);
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return errorResponse(res, 'Failed to mark notifications as read', error.message, 500);
    }

    return successResponse(res, null, 'All notifications marked as read', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    // No authentication required - userId and userType must be provided
    const userId = req.body.user_id || req.user?.id;
    const userType = req.body.user_type || req.user?.role || 'donor';
    const preferences = req.body.preferences || req.body;

    if (!userId) {
      return errorResponse(res, 'user_id is required', null, 400);
    }

    // Store preferences in user profile or separate table
    const tableName = userType === 'donor' ? 'donor' : 'charities';

    const { data, error } = await supabase
      .from(tableName)
      .update({
        notification_preferences: preferences
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 'Failed to update preferences', error.message, 400);
    }

    return successResponse(res, data, 'Notification preferences updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

