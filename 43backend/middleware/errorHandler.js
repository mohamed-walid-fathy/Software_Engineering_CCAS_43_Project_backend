/**
 * Error Handler Middleware
 * Standardizes error responses according to API standards
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Standard error response format
  const errorResponse = {
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.stack,
      originalError: err.message
    })
  };

  // Add validation errors if present
  if (err.details) {
    errorResponse.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;



