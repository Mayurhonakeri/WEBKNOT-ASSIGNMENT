const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'campus-events-api',
    audience: 'campus-events-users'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'campus-events-api',
      audience: 'campus-events-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
