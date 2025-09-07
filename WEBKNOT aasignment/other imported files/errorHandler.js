const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    return res.status(400).json({
      success: false,
      message,
      error: {
        code: 'INVALID_ID',
        details: message
      }
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return res.status(400).json({
      success: false,
      message,
      error: {
        code: 'DUPLICATE_ENTRY',
        details: `The ${field} '${err.keyValue[field]}' is already in use`
      }
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: {
        code: 'VALIDATION_ERROR',
        details: message
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: {
        code: 'INVALID_TOKEN',
        details: 'Authentication token is invalid'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: {
        code: 'TOKEN_EXPIRED',
        details: 'Authentication token has expired'
      }
    });
  }

  // Custom application errors
  if (err.name === 'AppError') {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      error: {
        code: err.code || 'APPLICATION_ERROR',
        details: err.details || err.message
      }
    });
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    error: {
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'production' ? 'Internal server error occurred' : error.stack
    }
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
  notFound
};
