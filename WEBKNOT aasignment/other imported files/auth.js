const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken, extractToken } = require('../config/jwt');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: {
          code: 'UNAUTHORIZED',
          details: 'Authentication token is required'
        }
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).populate('collegeId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        error: {
          code: 'UNAUTHORIZED',
          details: 'Invalid authentication token'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is inactive.',
        error: {
          code: 'ACCOUNT_INACTIVE',
          details: 'User account has been deactivated'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.',
      error: {
        code: 'UNAUTHORIZED',
        details: error.message
      }
    });
  }
};

// Authorize roles middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
        error: {
          code: 'UNAUTHORIZED',
          details: 'Authentication required'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        error: {
          code: 'FORBIDDEN',
          details: `Role '${req.user.role}' is not authorized for this action`
        }
      });
    }

    next();
  };
};

// Check specific permissions middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
        error: {
          code: 'UNAUTHORIZED',
          details: 'Authentication required'
        }
      });
    }

    // Super admin has all permissions
    if (req.user.adminLevel === 'super_admin') {
      return next();
    }

    // Check if user has the specific permission
    if (req.user.role === 'admin' && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Missing required permission.',
      error: {
        code: 'FORBIDDEN',
        details: `Permission '${permission}' is required for this action`
      }
    });
  };
};

// Check college access middleware
const checkCollegeAccess = async (req, res, next) => {
  try {
    const collegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;

    if (!collegeId) {
      return next(); // Skip if no college ID specified
    }

    // Super admin can access all colleges
    if (req.user.adminLevel === 'super_admin') {
      return next();
    }

    // Users can only access their own college data
    if (req.user.collegeId.toString() !== collegeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot access other college data.',
        error: {
          code: 'FORBIDDEN',
          details: 'Users can only access data from their own college'
        }
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking college access',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).populate('collegeId');

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  checkCollegeAccess,
  optionalAuth
};
