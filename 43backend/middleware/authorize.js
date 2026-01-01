/**
 * Authorization Middleware
 * Role-based access control (RBAC)
 * Checks user permissions for specific actions
 */

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'You must be logged in to access this resource',
        status: 401
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access forbidden',
        details: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
        status: 403
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
export const requireOwnership = (resourceIdParam = 'id', resourceTable = null) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required',
          status: 400
        });
      }

      // For campaigns, check if user owns the campaign
      if (resourceTable === 'campaigns' || req.path.includes('/campaigns')) {
        const { supabase } = await import('../config/supabase.js');
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('charity_id')
          .eq('id', resourceId)
          .single();

        if (!campaign) {
          return res.status(404).json({
            error: 'Resource not found',
            status: 404
          });
        }

        // Allow if user is admin or owns the campaign
        if (req.user.role === 'admin' || campaign.charity_id === req.user.id) {
          return next();
        }

        return res.status(403).json({
          error: 'Access forbidden',
          details: 'You do not have permission to access this resource',
          status: 403
        });
      }

      // For user resources, check if user is accessing their own data
      if (resourceId === req.user.id || req.user.role === 'admin') {
        return next();
      }

      return res.status(403).json({
        error: 'Access forbidden',
        details: 'You can only access your own resources',
        status: 403
      });
    } catch (error) {
      res.status(500).json({
        error: 'Authorization check failed',
        details: error.message,
        status: 500
      });
    }
  };
};

/**
 * Require verified charity
 */
export const requireVerifiedCharity = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      status: 401
    });
  }

  if (req.user.role !== 'charity') {
    return res.status(403).json({
      error: 'Access forbidden',
      details: 'This resource is only available to charities',
      status: 403
    });
  }

  if (!req.user.profile?.is_verified) {
    return res.status(403).json({
      error: 'Charity not verified',
      details: 'Your charity account must be verified to access this resource',
      status: 403
    });
  }

  next();
};

