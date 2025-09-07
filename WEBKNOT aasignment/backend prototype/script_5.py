# Create models directory and MongoDB schemas
os.makedirs('models', exist_ok=True)

# College model
college_js = '''const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  collegeId: {
    type: String,
    required: true,
    unique: true,
    match: /^CLG[0-9]{3}$/
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    },
    phone: {
      type: String,
      required: true,
      match: /^[\\+]?[1-9]?[0-9]{7,12}$/
    },
    website: {
      type: String,
      match: /^https?:\\/\\/.+/
    }
  },
  settings: {
    maxEventsPerSemester: {
      type: Number,
      default: 20,
      min: 1,
      max: 100
    },
    maxStudents: {
      type: Number,
      default: 500,
      min: 10,
      max: 10000
    },
    academicYear: {
      type: String,
      required: true,
      match: /^[0-9]{4}-[0-9]{2}$/
    },
    currentSemester: {
      type: String,
      required: true,
      enum: ['Spring', 'Summer', 'Fall', 'Winter']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
collegeSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Indexes
collegeSchema.index({ collegeId: 1 });
collegeSchema.index({ name: 1 });
collegeSchema.index({ isActive: 1 });

module.exports = mongoose.model('College', collegeSchema);
'''

with open('models/College.js', 'w') as f:
    f.write(college_js)

# User model
user_js = '''const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student'],
    default: 'student'
  },
  
  // College relationship
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  
  // Student-specific fields
  studentId: {
    type: String,
    sparse: true,
    validate: {
      validator: function(v) {
        return this.role !== 'student' || (v && v.length > 0);
      },
      message: 'Student ID is required for students'
    }
  },
  department: {
    type: String,
    validate: {
      validator: function(v) {
        return this.role !== 'student' || (v && v.length > 0);
      },
      message: 'Department is required for students'
    }
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
    validate: {
      validator: function(v) {
        return this.role !== 'student' || (v >= 1 && v <= 4);
      },
      message: 'Year must be between 1-4 for students'
    }
  },
  
  // Admin-specific fields
  adminLevel: {
    type: String,
    enum: ['super_admin', 'college_admin'],
    validate: {
      validator: function(v) {
        return this.role !== 'admin' || v;
      },
      message: 'Admin level is required for admin users'
    }
  },
  permissions: [{
    type: String,
    enum: ['create_events', 'manage_users', 'view_reports', 'manage_registrations']
  }],
  
  // Profile information
  profilePicture: String,
  phone: {
    type: String,
    match: /^[\\+]?[1-9]?[0-9]{7,12}$/
  },
  dateOfBirth: Date,
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound indexes
userSchema.index({ collegeId: 1, studentId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { role: 'student' }
});
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

// Virtual for full name with ID
userSchema.virtual('displayName').get(function() {
  return this.role === 'student' ? 
    `${this.name} (${this.studentId})` : 
    `${this.name} (Admin)`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate userId
userSchema.pre('save', async function(next) {
  if (this.userId) return next();
  
  try {
    const prefix = this.role === 'admin' ? 'ADM' : 'STU';
    const count = await this.constructor.countDocuments({ role: this.role });
    this.userId = `${prefix}${String(count + 1).padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
'''

with open('models/User.js', 'w') as f:
    f.write(user_js)

print("✅ Created models/College.js - College schema with validation")
print("✅ Created models/User.js - User schema with authentication features")