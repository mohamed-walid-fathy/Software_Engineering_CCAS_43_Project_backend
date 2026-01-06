/**
 * Standardized API Response Helpers
 * Follows the API response standards
 */

export const successResponse = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    data,
    message,
    status
  });
};

export const errorResponse = (res, error, details = null, status = 400) => {
  return res.status(status).json({
    error,
    message: error,
    ...(details && { details }),
    status
  });
};

export const paginatedResponse = (res, data, pagination, message = 'Success', status = 200) => {
  return res.status(status).json({
    data,
    pagination,
    message,
    status
  });
};

