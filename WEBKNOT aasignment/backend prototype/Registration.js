const mongoose = require('mongoose');

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
