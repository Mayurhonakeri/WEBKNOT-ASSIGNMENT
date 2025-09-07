const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.details[0].message
        }
      });
    }

    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    role: Joi.string().valid('admin', 'student').required(),
    collegeId: Joi.string().required(),

    // Student-specific fields
    studentId: Joi.when('role', {
      is: 'student',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    department: Joi.when('role', {
      is: 'student',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    year: Joi.when('role', {
      is: 'student',
      then: Joi.number().min(1).max(4).required(),
      otherwise: Joi.forbidden()
    }),

    // Admin-specific fields
    adminLevel: Joi.when('role', {
      is: 'admin',
      then: Joi.string().valid('super_admin', 'college_admin').required(),
      otherwise: Joi.forbidden()
    }),
    permissions: Joi.when('role', {
      is: 'admin',
      then: Joi.array().items(
        Joi.string().valid('create_events', 'manage_users', 'view_reports', 'manage_registrations')
      ),
      otherwise: Joi.forbidden()
    }),

    // Optional fields
    phone: Joi.string().pattern(/^[\+]?[1-9]?[0-9]{7,12}$/),
    dateOfBirth: Joi.date().max('now')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[\+]?[1-9]?[0-9]{7,12}$/),
    dateOfBirth: Joi.date().max('now')
  })
};

// Event validation schemas
const eventSchemas = {
  create: Joi.object({
    name: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(2000).required(),
    eventType: Joi.string().valid('workshop', 'seminar', 'fest', 'hackathon', 'sports', 'cultural').required(),
    category: Joi.string().valid('technical', 'non-technical', 'sports', 'cultural').required(),
    date: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    venue: Joi.string().required(),
    venueCapacity: Joi.number().min(1).max(10000),
    capacity: Joi.number().min(1).max(10000).required(),
    registrationDeadline: Joi.date().required(),
    registrationFee: Joi.number().min(0).default(0),
    isVirtual: Joi.boolean().default(false),
    virtualLink: Joi.when('isVirtual', {
      is: true,
      then: Joi.string().uri().required(),
      otherwise: Joi.string().uri().allow('')
    }),
    requiresApproval: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()),
    prerequisites: Joi.array().items(Joi.string())
  }),

  update: Joi.object({
    name: Joi.string().min(5).max(200),
    description: Joi.string().max(2000),
    eventType: Joi.string().valid('workshop', 'seminar', 'fest', 'hackathon', 'sports', 'cultural'),
    category: Joi.string().valid('technical', 'non-technical', 'sports', 'cultural'),
    date: Joi.date().min('now'),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    venue: Joi.string(),
    venueCapacity: Joi.number().min(1).max(10000),
    capacity: Joi.number().min(1).max(10000),
    registrationDeadline: Joi.date(),
    registrationFee: Joi.number().min(0),
    isVirtual: Joi.boolean(),
    virtualLink: Joi.string().uri().allow(''),
    requiresApproval: Joi.boolean(),
    status: Joi.string().valid('draft', 'active', 'cancelled', 'completed'),
    isRegistrationOpen: Joi.boolean(),
    tags: Joi.array().items(Joi.string()),
    prerequisites: Joi.array().items(Joi.string())
  })
};

// Registration validation schemas
const registrationSchemas = {
  create: Joi.object({
    eventId: Joi.string().required(),
    specialRequirements: Joi.string().max(500).allow('')
  }),

  cancel: Joi.object({
    cancellationReason: Joi.string().max(500).allow('')
  })
};

// Attendance validation schemas
const attendanceSchemas = {
  checkIn: Joi.object({
    eventId: Joi.string().required(),
    checkInMethod: Joi.string().valid('qr_code', 'manual', 'mobile_app').default('mobile_app'),
    checkInLocation: Joi.string().allow('')
  }),

  checkOut: Joi.object({
    attendanceId: Joi.string().required()
  })
};

// Feedback validation schemas
const feedbackSchemas = {
  create: Joi.object({
    eventId: Joi.string().required(),
    overallRating: Joi.number().min(1).max(5).required(),
    contentRating: Joi.number().min(1).max(5),
    organizationRating: Joi.number().min(1).max(5),
    venueRating: Joi.number().min(1).max(5),
    comments: Joi.string().max(1000).allow(''),
    suggestions: Joi.string().max(1000).allow(''),
    wouldRecommend: Joi.boolean().default(true),
    isAnonymous: Joi.boolean().default(false),
    categories: Joi.object({
      content: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500).allow('')
      }),
      speaker: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500).allow('')
      }),
      organization: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500).allow('')
      }),
      venue: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500).allow('')
      })
    })
  })
};

// College validation schemas
const collegeSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('India')
    }).required(),
    contactInfo: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[\+]?[1-9]?[0-9]{7,12}$/).required(),
      website: Joi.string().uri()
    }).required(),
    settings: Joi.object({
      maxEventsPerSemester: Joi.number().min(1).max(100).default(20),
      maxStudents: Joi.number().min(10).max(10000).default(500),
      academicYear: Joi.string().pattern(/^[0-9]{4}-[0-9]{2}$/).required(),
      currentSemester: Joi.string().valid('Spring', 'Summer', 'Fall', 'Winter').required()
    })
  })
};

module.exports = {
  validate,
  userSchemas,
  eventSchemas,
  registrationSchemas,
  attendanceSchemas,
  feedbackSchemas,
  collegeSchemas
};
