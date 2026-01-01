import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Upload image (campaign images, profile pictures, etc.)
 */
export const uploadImage = async (req, res, next) => {
  try {
    // In a real implementation, you would use multer or similar to handle file uploads
    // For now, this is a placeholder structure

    const { file, folder = 'images' } = req.body;

    if (!file) {
      return errorResponse(res, 'No file provided', null, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(res, 'Invalid file type', 'Only images are allowed', 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return errorResponse(res, 'File too large', 'Maximum file size is 5MB', 400);
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file.buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return errorResponse(res, 'Failed to upload image', error.message, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return successResponse(
      res,
      {
        url: urlData.publicUrl,
        path: filePath,
        id: data.id
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload document (charity registration documents, etc.)
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { file, folder = 'documents' } = req.body;

    if (!file) {
      return errorResponse(res, 'No file provided', null, 400);
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(res, 'Invalid file type', 'Only PDF and images are allowed', 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse(res, 'File too large', 'Maximum file size is 10MB', 400);
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file.buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return errorResponse(res, 'Failed to upload document', error.message, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return successResponse(
      res,
      {
        url: urlData.publicUrl,
        path: filePath,
        id: data.id
      },
      'Document uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete uploaded file
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { path } = req.body;

    if (!path) {
      return errorResponse(res, 'File path is required', null, 400);
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .remove([path]);

    if (error) {
      return errorResponse(res, 'Failed to delete file', error.message, 500);
    }

    return successResponse(res, null, 'File deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

