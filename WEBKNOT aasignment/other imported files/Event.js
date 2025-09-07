const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Event classification
  eventType: {
    type: String,
    required: true,
    enum: ['workshop', 'seminar', 'fest', 'hackathon', 'sports', 'cultural']
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'non-technical', 'sports', 'cultural']
  },

  // Scheduling
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    validate: {
      validator: function(v) {
        const start = this.startTime.split(':').map(Number);
        const end = v.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        return endMinutes > startMinutes;
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number,
    min: 30,
    max: 720 // 12 hours max
  },

  // Location
  venue: {
    type: String,
    required: true,
    trim: true
  },
  venueCapacity: {
    type: Number,
    min: 1,
    max: 10000
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !this.isVirtual || (v && v.match(/^https?:\/\/.+/));
      },
      message: 'Virtual link is required for virtual events'
    }
  },

  // Registration details
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  registrationDeadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v < this.date;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: 0
  },

  // Relationships
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Event status and management
  status: {
    type: String,
    enum: ['draft', 'active', 'cancelled', 'completed'],
    default: 'active'
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },

  // Event metadata
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: String,
  prerequisites: [{
    type: String,
    trim: true
  }],

  // Statistics (computed fields)
  totalRegistrations: {
    type: Number,
    default: 0
  },
  totalAttendance: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.totalRegistrations);
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (this.registrationDeadline < now) return 'closed';
  if (this.totalRegistrations >= this.capacity) return 'full';
  if (!this.isRegistrationOpen) return 'closed';
  return 'open';
});

// Virtual for event duration in minutes
eventSchema.virtual('eventDuration').get(function() {
  if (this.duration) return this.duration;

  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes - startMinutes;
});

// Pre-save middleware to generate eventId
eventSchema.pre('save', async function(next) {
  if (this.eventId) return next();

  try {
    const College = mongoose.model('College');
    const college = await College.findById(this.collegeId);
    if (!college) {
      return next(new Error('College not found'));
    }

    const count = await this.constructor.countDocuments({ collegeId: this.collegeId });
    this.eventId = `EVT${String(count + 1).padStart(3, '0')}_${college.collegeId}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate duration
eventSchema.pre('save', function(next) {
  if (!this.duration) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    this.duration = endMinutes - startMinutes;
  }
  next();
});

// Indexes
eventSchema.index({ collegeId: 1, date: 1 });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ registrationDeadline: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ eventId: 1 }, { unique: true });

// Text search index
eventSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

module.exports = mongoose.model('Event', eventSchema);
