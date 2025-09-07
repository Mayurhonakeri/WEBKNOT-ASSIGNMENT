# Create config directory and database configuration
import os

# Create config directory
os.makedirs('config', exist_ok=True)

# Database configuration
database_js = '''const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
'''

with open('config/database.js', 'w') as f:
    f.write(database_js)

# JWT configuration
jwt_js = '''const jwt = require('jsonwebtoken');

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
'''

with open('config/jwt.js', 'w') as f:
    f.write(jwt_js)

print("✅ Created config/database.js - MongoDB connection configuration")
print("✅ Created config/jwt.js - JWT token management utilities")