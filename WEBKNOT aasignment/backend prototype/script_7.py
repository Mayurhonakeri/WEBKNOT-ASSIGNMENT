# Continue with Registration, Attendance, and Feedback models

# Registration model
registration_js = '''const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Relationships
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  
  // Registration details
  registrationDate: {
    type: Date,
    default: Date.now
  },
  registrationStatus: {
    type: String,
    enum: ['registered', 'cancelled', 'waitlisted'],
    default: 'registered'
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'not_required'],
    default: 'not_required'
  },
  paymentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentDate: Date,
  paymentTransactionId: String,
  
  // Additional registration data
  registrationSource: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  },
  specialRequirements: {
    type: String,
    maxlength: 500
  },
  
  // Cancellation details
  cancellationDate: Date,
  cancellationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, registrationStatus: 1 });
registrationSchema.index({ studentId: 1, registrationDate: -1 });
registrationSchema.index({ registrationId: 1 }, { unique: true });

// Virtual for days since registration
registrationSchema.virtual('daysSinceRegistration').get(function() {
  return Math.floor((new Date() - this.registrationDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate registrationId
registrationSchema.pre('save', async function(next) {
  if (this.registrationId) return next();
  
  try {
    const Event = mongoose.model('Event');
    const User = mongoose.model('User');
    
    const event = await Event.findById(this.eventId);
    const student = await User.findById(this.studentId);
    
    if (!event || !student) {
      return next(new Error('Event or Student not found'));
    }
    
    const count = await this.constructor.countDocuments({ eventId: this.eventId });
    this.registrationId = `REG${String(count + 1).padStart(3, '0')}_${event.eventId}_${student.userId}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update event registration count
registrationSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event');
    const totalRegistrations = await this.constructor.countDocuments({ 
      eventId: this.eventId, 
      registrationStatus: 'registered' 
    });
    
    await Event.findByIdAndUpdate(this.eventId, { totalRegistrations });
  } catch (error) {
    console.error('Error updating event registration count:', error);
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
'''

with open('models/Registration.js', 'w') as f:
    f.write(registration_js)

# Attendance model
attendance_js = '''const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  attendanceId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Relationships
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  
  // Check-in details
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkInMethod: {
    type: String,
    enum: ['qr_code', 'manual', 'mobile_app'],
    default: 'mobile_app'
  },
  checkInLocation: String, // GPS coordinates or venue name
  
  // Check-out details (optional)
  checkOutTime: Date,
  actualDuration: Number, // Minutes attended
  
  // Attendance verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  
  // Additional data
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ studentId: 1, eventId: 1 }, { unique: true });
attendanceSchema.index({ eventId: 1, checkInTime: 1 });
attendanceSchema.index({ studentId: 1, checkInTime: -1 });
attendanceSchema.index({ attendanceId: 1 }, { unique: true });

// Virtual for attendance duration
attendanceSchema.virtual('attendanceDuration').get(function() {
  if (this.actualDuration) return this.actualDuration;
  if (this.checkOutTime) {
    return Math.floor((this.checkOutTime - this.checkInTime) / (1000 * 60));
  }
  return null;
});

// Pre-save middleware to generate attendanceId
attendanceSchema.pre('save', async function(next) {
  if (this.attendanceId) return next();
  
  try {
    const Event = mongoose.model('Event');
    const User = mongoose.model('User');
    
    const event = await Event.findById(this.eventId);
    const student = await User.findById(this.studentId);
    
    if (!event || !student) {
      return next(new Error('Event or Student not found'));
    }
    
    const count = await this.constructor.countDocuments({ eventId: this.eventId });
    this.attendanceId = `ATT${String(count + 1).padStart(3, '0')}_${event.eventId}_${student.userId}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate actual duration on checkout
attendanceSchema.pre('save', function(next) {
  if (this.checkOutTime && !this.actualDuration) {
    this.actualDuration = Math.floor((this.checkOutTime - this.checkInTime) / (1000 * 60));
  }
  next();
});

// Post-save middleware to update event attendance count
attendanceSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event');
    const totalAttendance = await this.constructor.countDocuments({ eventId: this.eventId });
    
    await Event.findByIdAndUpdate(this.eventId, { totalAttendance });
  } catch (error) {
    console.error('Error updating event attendance count:', error);
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
'''

with open('models/Attendance.js', 'w') as f:
    f.write(attendance_js)

print("✅ Created models/Registration.js - Registration management with payment tracking")
print("✅ Created models/Attendance.js - Attendance tracking with check-in/out")