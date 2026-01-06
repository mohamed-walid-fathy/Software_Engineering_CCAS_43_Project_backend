import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Register a new user (donor or charity)
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, userType, accountType, name, phone, description, orgName } = req.body;

    // Accept both userType and accountType
    const type = userType || accountType;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', null, 400);
    }

    if (!type || !['donor', 'charity'].includes(type)) {
      return errorResponse(res, 'userType/accountType must be either "donor" or "charity"', null, 400);
    }

    if (type === 'donor') {
      // Check if donor already exists
      const { data: existingDonor } = await supabase
        .from('donor')
        .select('email')
        .eq('email', email)
        .single();

      if (existingDonor) {
        return errorResponse(res, 'Email already registered', null, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Split name safely
      const names = (name || '').split(' ');
      const first_name = names[0] || '';
      const last_name = names.slice(1).join(' ') || ' ';

      // Create donor
      const { data: donor, error: donorError } = await supabase
        .from('donor')
        .insert({
          email,
          password: hashedPassword,
          first_name,
          last_name
        })
        .select()
        .single();

      if (donorError) {
        console.error('Donor creation error:', donorError);
        return errorResponse(res, 'Failed to create donor account', donorError.message, 500);
      }

      // Don't return password in response
      delete donor.password;

      return successResponse(
        res,
        {
          user: donor,
          role: 'donor'
        },
        'Donor registered successfully',
        201
      );

    } else if (type === 'charity') {
      // Check if charity already exists
      const { data: existingCharity } = await supabase
        .from('charity')
        .select('email')
        .eq('email', email)
        .single();

      if (existingCharity) {
        return errorResponse(res, 'Email already registered', null, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Split name safely
      const names = (orgName || name || '').split(' ');
      const first_name = names[0] || '';
      const last_name = names.slice(1).join(' ') || ' ';

      // Create charity
      const { data: charity, error: charityError } = await supabase
        .from('charity')
        .insert({
          email,
          first_name,
          last_name,
          description: description || null,
          verified_status: 'pending',
          password: hashedPassword // Save hashed password for charity
        })
        .select()
        .single();

      if (charityError) {
        console.error('Charity creation error:', charityError);
        return errorResponse(res, 'Failed to create charity account', charityError.message, 500);
      }

      return successResponse(
        res,
        {
          user: charity,
          role: 'charity'
        },
        'Charity registered successfully',
        201
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', null, 400);
    }

    // Check donor table first
    const { data: donor } = await supabase
      .from('donor')
      .select('*')
      .eq('email', email)
      .single();

    if (donor) {
      // Compare passwords
      const isMatch = await bcrypt.compare(password, donor.password);
      if (!isMatch) {
        return errorResponse(res, 'Invalid email or password', null, 401);
      }

      // Don't return password
      delete donor.password;

      return successResponse(
        res,
        {
          user: {
            ...donor,
            role: 'donor'
          }
        },
        'Login successful',
        200
      );
    }

    // Check Charity table
    const { data: charity } = await supabase
      .from('charity')
      .select('*')
      .eq('email', email)
      .single();

    if (charity) {
      // Compare passwords
      const isMatch = await bcrypt.compare(password, charity.password);
      if (!isMatch) {
        return errorResponse(res, 'Invalid email or password', null, 401);
      }

      return successResponse(
        res,
        {
          user: {
            ...charity,
            id: charity.charity_id, // Normalize ID
            role: 'charity'
          }
        },
        'Login successful',
        200
      );
    }

    // Check Admin table
    const { data: adminUser } = await supabase
      .from('admin') // Using 'admin' table as per schema
      .select('*')
      .eq('email', email)
      .single();

    if (adminUser) {
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (!isMatch) { // Schema uses 'password' lowercase for admin
        return errorResponse(res, 'Invalid email or password', null, 401);
      }

      return successResponse(
        res,
        {
          user: {
            ...adminUser,
            id: adminUser.admin_id,
            role: 'admin'
          }
        },
        'Login successful',
        200
      );
    }

    return errorResponse(res, 'Invalid email or password', null, 401);

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Logout successful', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return errorResponse(res, 'email is required as query parameter', null, 400);
    }

    // Check donor table
    const { data: donor } = await supabase
      .from('donor')
      .select('*')
      .eq('email', email)
      .single();

    if (donor) {
      delete donor.password; // Don't return password
      return successResponse(
        res,
        {
          role: 'donor',
          profile: donor
        },
        'User profile retrieved successfully',
        200
      );
    }

    // Check Charity table
    const { data: charity } = await supabase
      .from('charity')
      .select('*')
      .eq('email', email)
      .single();

    if (charity) {
      return successResponse(
        res,
        {
          role: 'charity',
          profile: charity
        },
        'User profile retrieved successfully',
        200
      );
    }

    return errorResponse(res, 'User not found', null, 404);

  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { email, ...updates } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', null, 400);
    }

    // Remove sensitive fields
    delete updates.password;
    delete updates.donor_id;
    delete updates.charity_id;

    // Try updating donor
    const { data: donor } = await supabase
      .from('donor')
      .select('donor_id')
      .eq('email', email)
      .single();

    if (donor) {
      const { data, error } = await supabase
        .from('donor')
        .update(updates)
        .eq('donor_id', donor.donor_id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, 'Failed to update profile', error.message, 400);
      }

      delete data.password;
      return successResponse(res, data, 'Profile updated successfully', 200);
    }

    // Try updating charity
    const { data: charity } = await supabase
      .from('charity')
      .select('charity_id')
      .eq('email', email)
      .single();

    if (charity) {
      const { data, error } = await supabase
        .from('charity')
        .update(updates)
        .eq('charity_id', charity.charity_id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, 'Failed to update profile', error.message, 400);
      }

      return successResponse(res, data, 'Profile updated successfully', 200);
    }

    return errorResponse(res, 'User not found', null, 404);

  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - send reset email
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', null, 400);
    }

    // For now, just return success
    // In production, you'd send an email with reset link
    return successResponse(
      res,
      null,
      'Password reset email sent successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', null, 400);
    }

    // Try updating donor password
    const { data: donor } = await supabase
      .from('donor')
      .select('donor_id')
      .eq('email', email)
      .single();

    if (donor) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const { error } = await supabase
        .from('donor')
        .update({ password: hashedPassword })
        .eq('donor_id', donor.donor_id);

      if (error) {
        return errorResponse(res, 'Failed to reset password', error.message, 400);
      }

      return successResponse(res, null, 'Password reset successfully', 200);
    }

    // Try updating charity password
    const { data: charity } = await supabase
      .from('charity')
      .select('charity_id')
      .eq('email', email)
      .single();

    if (charity) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const { error } = await supabase
        .from('charity')
        .update({ password: hashedPassword })
        .eq('charity_id', charity.charity_id);

      if (error) {
        return errorResponse(res, 'Failed to reset password', error.message, 400);
      }

      return successResponse(res, null, 'Password reset successfully', 200);
    }

    return errorResponse(res, 'User not found', null, 404);

  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res, next) => {
  try {
    return successResponse(
      res,
      { message: 'Token refresh not implemented for simple auth' },
      'Not implemented',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return errorResponse(res, 'Email, old password, and new password are required', null, 400);
    }

    // 1. Check Admin Table
    const { data: adminUser } = await supabase.from('admin').select('*').eq('email', email).single();
    if (adminUser) {
      const isMatch = await bcrypt.compare(oldPassword, adminUser.password);
      if (!isMatch) return errorResponse(res, 'Invalid old password', null, 401);

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const { error } = await supabase.from('admin').update({ password: hashedPassword }).eq('admin_id', adminUser.admin_id);
      if (error) throw error;
      return successResponse(res, null, 'Password changed successfully', 200);
    }

    // 2. Check Donor Table
    const { data: donor } = await supabase.from('donor').select('*').eq('email', email).single();
    if (donor) {
      const isMatch = await bcrypt.compare(oldPassword, donor.password);
      if (!isMatch) return errorResponse(res, 'Invalid old password', null, 401);

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const { error } = await supabase.from('donor').update({ password: hashedPassword }).eq('donor_id', donor.donor_id);
      if (error) throw error;
      return successResponse(res, null, 'Password changed successfully', 200);
    }

    // 3. Check Charity Table
    const { data: charity } = await supabase.from('charity').select('*').eq('email', email).single();
    if (charity) {
      const isMatch = await bcrypt.compare(oldPassword, charity.password);
      if (!isMatch) return errorResponse(res, 'Invalid old password', null, 401);

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const { error } = await supabase.from('charity').update({ password: hashedPassword }).eq('charity_id', charity.charity_id);
      if (error) throw error;
      return successResponse(res, null, 'Password changed successfully', 200);
    }

    return errorResponse(res, 'User not found', null, 404);
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};
