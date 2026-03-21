const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest(messages.join(', '));
  }
  
  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = ApiError.conflict(`${field} '${value}' đã tồn tại`);
  }
  
  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest('ID không hợp lệ');
  }
  
  // Handle custom ApiError
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || 500,
      err.message || 'Lỗi server',
      err.errors
    );
  }
  
  // Send response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * Not found handler
 */
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Không tìm thấy: ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
