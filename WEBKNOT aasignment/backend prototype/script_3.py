# Create .env file template
env_template = '''# Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/campus-events
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/campus-events

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3001,http://localhost:3002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
'''

with open('.env.example', 'w') as f:
    f.write(env_template)

print("✅ Created .env.example - Environment variables template")
print("📝 Copy this to .env and update with your actual values")