Database Design Document

 Overview
This document outlines the database schema design for the Campus Event Management Platform. The system uses MongoDB as the primary database to store all application data with proper relationships and indexing for optimal performance.

 Database Schema Design

 1. Colleges Collection

javascript
{
  _id: ObjectId,
  collegeId: String, // Unique identifier (e.g., "CLG001")
  name: String, // College name
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  settings: {
    maxEventsPerSemester: Number, // Default: 20
    maxStudents: Number, // Default: 500
    academicYear: String, // e.g., "2025-26"
    currentSemester: String // e.g., "Fall 2025"
  },
  isActive: Boolean, // Default: true
  createdAt: Date,
  updatedAt: Date
}


 2. Users Collection

javascript
{
  _id: ObjectId,
  userId: String, // Unique across system (e.g., "USR001", "STU001")
  name: String,
  email: String, // Unique
  password: String, // Hashed using bcrypt
  role: String, // enum: ['admin', 'student']
  
  // College relationship
  collegeId: ObjectId, // Reference to Colleges collection
  
  // Student-specific fields
  studentId: String, // Unique within college (only for students)
  department: String, // Only for students
  year: Number, // Academic year (1-4, only for students)
  
  // Admin-specific fields
  adminLevel: String, // enum: ['super_admin', 'college_admin'] (only for admins)
  permissions: [String], // Array of permission strings
  
  // Profile information
  profilePicture: String, // URL to profile image
  phone: String,
  dateOfBirth: Date,
  
  // Account status
  isActive: Boolean, // Default: true
  isVerified: Boolean, // Email verification status
  lastLogin: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}


 3. Events Collection
javascript
{
  _id: ObjectId,
  eventId: String, // Unique across all colleges (e.g., "EVT001_CLG001")
  name: String,
  description: String,
  
  // Event classification
  eventType: String, // enum: ['workshop', 'seminar', 'fest', 'hackathon', 'sports', 'cultural']
  category: String, // enum: ['technical', 'non-technical', 'sports', 'cultural']
  
  // Scheduling
  date: Date,
  startTime: String, // Format: "HH:MM"
  endTime: String, // Format: "HH:MM" 
  duration: Number, // Duration in minutes
  
  // Location
  venue: String,
  venueCapacity: Number,
  isVirtual: Boolean, // Default: false
  virtualLink: String, // For online events
  
  // Registration details
  capacity: Number, // Max registrations allowed
  registrationDeadline: Date,
  registrationFee: Number, // Default: 0 (free events)
  
  // Relationships
  collegeId: ObjectId, // Reference to Colleges collection
  createdBy: ObjectId, // Reference to Users collection (admin who created)
  
  // Event status and management
  status: String, // enum: ['draft', 'active', 'cancelled', 'completed']
  isRegistrationOpen: Boolean, // Default: true
  requiresApproval: Boolean, // Default: false
  
  // Event metadata
  tags: [String], // For better searchability
  imageUrl: String, // Event poster/image
  prerequisites: [String], // Any requirements
  
  // Statistics (will be calculated)
  totalRegistrations: Number, // Default: 0
  totalAttendance: Number, // Default: 0
  averageRating: Number, // Default: 0
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}


 4. Registrations Collection

javascript
{
  _id: ObjectId,
  registrationId: String, // Unique (e.g., "REG001_EVT001_STU001")
  
  // Relationships
  studentId: ObjectId, // Reference to Users collection
  eventId: ObjectId, // Reference to Events collection
  collegeId: ObjectId, // Reference to Colleges collection
  
  // Registration details
  registrationDate: Date,
  registrationStatus: String, // enum: ['registered', 'cancelled', 'waitlisted']
  
  // Payment information (if applicable)
  paymentStatus: String, // enum: ['pending', 'paid', 'refunded', 'not_required']
  paymentAmount: Number,
  paymentDate: Date,
  paymentTransactionId: String,
  
  // Additional registration data
  registrationSource: String, // enum: ['web', 'mobile', 'admin']
  specialRequirements: String, // Any special needs/requirements
  
  // Cancellation details
  cancellationDate: Date,
  cancellationReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}


 5. Attendance Collection

javascript
{
  _id: ObjectId,
  attendanceId: String, // Unique (e.g., "ATT001_EVT001_STU001")
  
  // Relationships
  studentId: ObjectId, // Reference to Users collection
  eventId: ObjectId, // Reference to Events collection
  registrationId: ObjectId, // Reference to Registrations collection
  
  // Check-in details
  checkInTime: Date,
  checkInMethod: String, // enum: ['qr_code', 'manual', 'mobile_app']
  checkInLocation: String, // GPS coordinates or venue name
  
  // Check-out details (optional)
  checkOutTime: Date,
  actualDuration: Number, // Minutes attended
  
  // Attendance verification
  isVerified: Boolean, // Default: false
  verifiedBy: ObjectId, // Reference to Users collection (admin)
  verificationDate: Date,
  
  // Additional data
  notes: String, // Any additional notes about attendance
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}


 6. Feedback Collection

javascript
{
  _id: ObjectId,
  feedbackId: String, // Unique (e.g., "FBK001_EVT001_STU001")
  
  // Relationships
  studentId: ObjectId, // Reference to Users collection
  eventId: ObjectId, // Reference to Events collection
  attendanceId: ObjectId, // Reference to Attendance collection
  
  // Rating and feedback
  overallRating: Number, // 1-5 scale, required
  contentRating: Number, // 1-5 scale
  organizationRating: Number, // 1-5 scale
  venueRating: Number, // 1-5 scale
  
  // Written feedback
  comments: String,
  suggestions: String,
  wouldRecommend: Boolean,
  
  // Specific feedback categories
  categories: {
    content: {
      rating: Number, // 1-5
      comment: String
    },
    speaker: {
      rating: Number, // 1-5
      comment: String
    },
    organization: {
      rating: Number, // 1-5
      comment: String
    },
    venue: {
      rating: Number, // 1-5
      comment: String
    }
  },
  
  // Feedback metadata
  isAnonymous: Boolean, // Default: false
  submissionDate: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}


 Relationships and References

 Primary Relationships
1. Users ↔ Colleges: Many-to-One (Each user belongs to one college)
2. Events ↔ Colleges: Many-to-One (Each event belongs to one college)
3. Registrations: Links Students (Users) and Events (Many-to-Many through junction)
4. Attendance: Links Students (Users) and Events through Registrations
5. Feedback: Links Students (Users) and Events through Attendance

 Reference Integrity
- All ObjectId references include proper validation
- Cascade deletion policies defined for related documents
- Orphaned document cleanup procedures implemented

 Indexes

 Primary Indexes
javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "userId": 1 }, { unique: true })
db.users.createIndex({ "collegeId": 1, "studentId": 1 }, { unique: true, sparse: true })

// Events Collection  
db.events.createIndex({ "eventId": 1 }, { unique: true })
db.events.createIndex({ "collegeId": 1, "date": 1 })
db.events.createIndex({ "eventType": 1, "status": 1 })

// Registrations Collection
db.registrations.createIndex({ "studentId": 1, "eventId": 1 }, { unique: true })
db.registrations.createIndex({ "eventId": 1, "registrationStatus": 1 })

// Attendance Collection
db.attendance.createIndex({ "studentId": 1, "eventId": 1 }, { unique: true })
db.attendance.createIndex({ "eventId": 1, "checkInTime": 1 })

// Feedback Collection
db.feedback.createIndex({ "studentId": 1, "eventId": 1 }, { unique: true })
db.feedback.createIndex({ "eventId": 1, "overallRating": 1 })


 Data Validation Rules

 College Validation
- College ID must be unique and follow format: CLG[0-9]{3}
- Name is required and must be 3-100 characters
- Email must be valid format
- Max students and events must be positive numbers

 User Validation
- Email must be unique and valid format
- Password must meet complexity requirements (8+ chars, mixed case, numbers)
- Role must be either 'admin' or 'student'
- Student ID required for students, unique within college
- Admin level required for admin users

 Event Validation
- Event ID must be unique across all colleges
- Name is required, 5-200 characters
- Date must be in the future when creating
- Start time must be before end time
- Capacity must be positive number
- Registration deadline must be before event date

 Registration Validation
- Student can only register once per event
- Registration must be before deadline
- Event must have available capacity
- Student and event must belong to same college

 Attendance Validation
- Can only check-in to registered events
- Check-in time must be within event duration
- Cannot check-in to cancelled events

 Feedback Validation
- Can only provide feedback for attended events
- Overall rating is required (1-5)
- Cannot submit multiple feedback for same event

 Query Patterns

 Common Queries

 Get Events for a College
javascript
db.events.find({ 
  collegeId: ObjectId("..."), 
  status: "active",
  date: { $gte: new Date() }
}).sort({ date: 1 })


 Get Student Registrations
javascript
db.registrations.aggregate([
  { $match: { studentId: ObjectId("...") } },
  {
    $lookup: {
      from: "events",
      localField: "eventId", 
      foreignField: "_id",
      as: "event"
    }
  },
  { $unwind: "$event" },
  { $sort: { "event.date": 1 } }
])


 Event Popularity Report
javascript
db.registrations.aggregate([
  { $match: { registrationStatus: "registered" } },
  {
    $group: {
      _id: "$eventId",
      totalRegistrations: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "events",
      localField: "_id",
      foreignField: "_id", 
      as: "event"
    }
  },
  { $unwind: "$event" },
  { $sort: { totalRegistrations: -1 } }
])

 Top Active Students
javascript
db.attendance.aggregate([
  {
    $group: {
      _id: "$studentId",
      eventsAttended: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  { $sort: { eventsAttended: -1 } },
  { $limit: 3 }
])


 Data Consistency and Integrity

 Referential Integrity Rules
1. Cannot delete a college if it has active users or events
2. Cannot delete a user if they have active registrations
3. Cannot delete an event if it has registrations
4. Attendance requires valid registration
5. Feedback requires valid attendance

 Data Consistency Measures
- Use MongoDB transactions for multi-document operations
- Implement soft delete for critical entities
- Regular data validation and cleanup jobs
- Audit trail for important changes

 Backup and Recovery Strategy

 Backup Schedule
- Daily incremental backups
- Weekly full database backups
- Monthly archive to cold storage
- Real-time replication for high availability

 Recovery Procedures
- Point-in-time recovery capability
- Automated failover mechanisms
- Data validation after recovery
- Rollback procedures for failed deployments

 Performance Considerations

 Query Optimization
- Proper indexing on frequently queried fields
- Aggregation pipeline optimization
- Query result caching for static data
- Connection pooling for database connections

 Scaling Strategy
- Horizontal scaling with sharding if needed
- Read replicas for reporting queries
- Data archiving for old event data
- Pagination for large result sets



This database design supports the scalability requirements of managing 50 colleges with 500 students each, while maintaining data integrity and query performance. The schema is optimized for the common operations of event management, student registration, and reporting functionality.