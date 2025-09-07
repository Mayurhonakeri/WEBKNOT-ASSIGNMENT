const mongoose = require('mongoose');

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
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      required: true,
      match: /^[\+]?[1-9]?[0-9]{7,12}$/
    },
    website: {
      type: String,
      match: /^https?:\/\/.+/
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
