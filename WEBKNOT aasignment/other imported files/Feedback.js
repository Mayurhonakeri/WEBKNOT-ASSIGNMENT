const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  feedbackId: {
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
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true
  },

  // Rating and feedback
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  contentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  organizationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  venueRating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Written feedback
  comments: {
    type: String,
    maxlength: 1000
  },
  suggestions: {
    type: String,
    maxlength: 1000
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },

  // Specific feedback categories
  categories: {
    content: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      }
    },
    speaker: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      }
    },
    organization: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      }
    },
    venue: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      }
    }
  },

  // Feedback metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      if (doc.isAnonymous) {
        delete ret.studentId;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate feedback
feedbackSchema.index({ studentId: 1, eventId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1, overallRating: 1 });
feedbackSchema.index({ eventId: 1, submissionDate: -1 });
feedbackSchema.index({ feedbackId: 1 }, { unique: true });

// Virtual for average category rating
feedbackSchema.virtual('averageCategoryRating').get(function() {
  const ratings = [];
  if (this.categories.content?.rating) ratings.push(this.categories.content.rating);
  if (this.categories.speaker?.rating) ratings.push(this.categories.speaker.rating);
  if (this.categories.organization?.rating) ratings.push(this.categories.organization.rating);
  if (this.categories.venue?.rating) ratings.push(this.categories.venue.rating);

  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
});

// Pre-save middleware to generate feedbackId
feedbackSchema.pre('save', async function(next) {
  if (this.feedbackId) return next();

  try {
    const Event = mongoose.model('Event');
    const User = mongoose.model('User');

    const event = await Event.findById(this.eventId);
    const student = await User.findById(this.studentId);

    if (!event || !student) {
      return next(new Error('Event or Student not found'));
    }

    const count = await this.constructor.countDocuments({ eventId: this.eventId });
    this.feedbackId = `FBK${String(count + 1).padStart(3, '0')}_${event.eventId}_${student.userId}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update event average rating
feedbackSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event');

    // Calculate average rating for the event
    const feedbackStats = await this.constructor.aggregate([
      { $match: { eventId: this.eventId } },
      {
        $group: {
          _id: '$eventId',
          averageRating: { $avg: '$overallRating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    if (feedbackStats.length > 0) {
      const { averageRating } = feedbackStats[0];
      await Event.findByIdAndUpdate(this.eventId, { 
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
      });
    }
  } catch (error) {
    console.error('Error updating event average rating:', error);
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
