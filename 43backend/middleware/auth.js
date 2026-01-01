import { supabase } from '../config/supabase.js';

/**
 * Authentication Middleware
 * Verifies JWT token or Supabase session
 * Extracts user ID and role, attaches to request object
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        details: 'Authorization header with Bearer token is required',
        status: 401
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        details: error?.message || 'Token verification failed',
        status: 401
      });
    }

    // Get user role from custom tables (donor or charities)
    // Match by email since donor table uses donor_id (integer) not UUID
    let userRole = 'donor';
    let userProfile = null;

    // Check if user is a donor (match by email)
    const { data: donor } = await supabase
      .from('donor')
      .select('*')
      .eq('email', user.email)
      .single();

    if (donor) {
      userRole = 'donor';
      userProfile = donor;
      // Add donor_id to user object for easy access
      req.user = {
        ...user,
        id: donor.donor_id, // Use donor_id as the main ID
        donor_id: donor.donor_id,
        role: userRole,
        profile: userProfile
      };
    } else {
      // Check if user is a charity
      const { data: charity } = await supabase
        .from('charities')
        .select('*')
        .eq('email', user.email)
        .single();

      if (charity) {
        userRole = 'charity';
        userProfile = charity;
        req.user = {
          ...user,
          id: charity.id || charity.charity_id,
          role: userRole,
          profile: userProfile
        };
      } else {
        // Check if user is an admin
        const { data: admin } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .single();

        if (admin) {
          userRole = 'admin';
          userProfile = admin;
          req.user = {
            ...user,
            id: admin.id || admin.admin_id,
            role: userRole,
            profile: userProfile
          };
        } else {
          req.user = {
            ...user,
            role: null,
            profile: null
          };
        }
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Authentication failed',
      details: error.message,
      status: 401
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Get user role and profile (match by email)
        let userRole = 'donor';
        let userProfile = null;

        const { data: donor } = await supabase
          .from('donor')
          .select('*')
          .eq('email', user.email)
          .single();

        if (donor) {
          userRole = 'donor';
          userProfile = donor;
          req.user = {
            ...user,
            id: donor.donor_id,
            donor_id: donor.donor_id,
            role: userRole,
            profile: userProfile
          };
        } else {
          const { data: charity } = await supabase
            .from('charities')
            .select('*')
            .eq('email', user.email)
            .single();

          if (charity) {
            userRole = 'charity';
            userProfile = charity;
            req.user = {
              ...user,
              id: charity.id || charity.charity_id,
              role: userRole,
              profile: userProfile
            };
          } else {
            req.user = null;
          }
        }
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};



