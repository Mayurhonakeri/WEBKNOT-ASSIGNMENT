# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user (admin or student).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu", 
  "password": "password123",
  "role": "student",
  "collegeId": "66f5e8d2a1b2c3d4e5f67890",
  "studentId": "STU001",
  "department": "Computer Science",
  "year": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "66f5e8d2a1b2c3d4e5f67891",
      "name": "John Doe",
      "email": "john@college.edu",
      "role": "student",
      "collegeId": "66f5e8d2a1b2c3d4e5f67890"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@college.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "66f5e8d2a1b2c3d4e5f67891",
      "name": "John Doe",
      "email": "john@college.edu",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67891",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "collegeId": "66f5e8d2a1b2c3d4e5f67890",
    "studentId": "STU001"
  }
}
```

### POST /auth/logout
Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Event Management Endpoints

### GET /events
Get all events with optional filtering.

**Query Parameters:**
- `collegeId` (optional): Filter by college ID
- `eventType` (optional): Filter by event type (workshop, seminar, fest, hackathon)
- `status` (optional): Filter by status (active, cancelled, completed)
- `date` (optional): Filter by date (YYYY-MM-DD)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /events?collegeId=66f5e8d2a1b2c3d4e5f67890&eventType=workshop&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "66f5e8d2a1b2c3d4e5f67892",
        "eventId": "EVT001_CLG001",
        "name": "Web Development Workshop",
        "description": "Learn modern web development",
        "eventType": "workshop",
        "date": "2025-09-15T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "16:00",
        "venue": "Computer Lab A",
        "capacity": 50,
        "totalRegistrations": 25,
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5
    }
  }
}
```

### POST /events
Create a new event (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "React.js Workshop",
  "description": "Learn React.js fundamentals and build a project",
  "eventType": "workshop",
  "date": "2025-09-20",
  "startTime": "10:00",
  "endTime": "16:00",
  "venue": "Computer Lab B",
  "capacity": 40,
  "registrationDeadline": "2025-09-18",
  "registrationFee": 0,
  "tags": ["react", "javascript", "frontend"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67893",
    "eventId": "EVT002_CLG001",
    "name": "React.js Workshop",
    "description": "Learn React.js fundamentals and build a project",
    "eventType": "workshop",
    "date": "2025-09-20T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "16:00",
    "venue": "Computer Lab B",
    "capacity": 40,
    "status": "active",
    "totalRegistrations": 0,
    "createdAt": "2025-09-07T11:33:00.000Z"
  }
}
```

### GET /events/:id
Get specific event details.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67892",
    "eventId": "EVT001_CLG001",
    "name": "Web Development Workshop", 
    "description": "Learn modern web development",
    "eventType": "workshop",
    "date": "2025-09-15T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "16:00",
    "venue": "Computer Lab A",
    "capacity": 50,
    "totalRegistrations": 25,
    "status": "active",
    "college": {
      "_id": "66f5e8d2a1b2c3d4e5f67890",
      "name": "Tech University",
      "collegeId": "CLG001"
    }
  }
}
```

### PUT /events/:id
Update event details (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "Advanced Web Development Workshop",
  "capacity": 60,
  "venue": "Main Auditorium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67892",
    "name": "Advanced Web Development Workshop",
    "capacity": 60,
    "venue": "Main Auditorium",
    "updatedAt": "2025-09-07T11:35:00.000Z"
  }
}
```

### DELETE /events/:id
Delete an event (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

## Registration Endpoints

### POST /registrations
Register for an event.

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "eventId": "66f5e8d2a1b2c3d4e5f67892",
  "specialRequirements": "Wheelchair accessible seating"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67894",
    "registrationId": "REG001_EVT001_STU001",
    "studentId": "66f5e8d2a1b2c3d4e5f67891",
    "eventId": "66f5e8d2a1b2c3d4e5f67892",
    "registrationStatus": "registered",
    "registrationDate": "2025-09-07T11:33:00.000Z"
  }
}
```

### GET /registrations/student/:studentId
Get all registrations for a student.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66f5e8d2a1b2c3d4e5f67894",
      "registrationId": "REG001_EVT001_STU001",
      "registrationStatus": "registered",
      "registrationDate": "2025-09-07T11:33:00.000Z",
      "event": {
        "_id": "66f5e8d2a1b2c3d4e5f67892",
        "name": "Web Development Workshop",
        "date": "2025-09-15T00:00:00.000Z",
        "venue": "Computer Lab A"
      }
    }
  ]
}
```

### GET /registrations/event/:eventId
Get all registrations for an event (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "66f5e8d2a1b2c3d4e5f67892",
      "name": "Web Development Workshop",
      "capacity": 50
    },
    "registrations": [
      {
        "_id": "66f5e8d2a1b2c3d4e5f67894",
        "registrationStatus": "registered",
        "registrationDate": "2025-09-07T11:33:00.000Z",
        "student": {
          "_id": "66f5e8d2a1b2c3d4e5f67891",
          "name": "John Doe",
          "email": "john@college.edu",
          "studentId": "STU001"
        }
      }
    ],
    "stats": {
      "totalRegistrations": 25,
      "availableSpots": 25
    }
  }
}
```

### DELETE /registrations/:id
Cancel a registration.

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "cancellationReason": "Schedule conflict"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

## Attendance Endpoints

### POST /attendance/checkin
Check-in to an event.

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "eventId": "66f5e8d2a1b2c3d4e5f67892",
  "checkInMethod": "qr_code"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully checked in to the event",
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67895",
    "attendanceId": "ATT001_EVT001_STU001",
    "checkInTime": "2025-09-15T10:05:00.000Z",
    "checkInMethod": "qr_code"
  }
}
```

### GET /attendance/event/:eventId
Get attendance for an event (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "66f5e8d2a1b2c3d4e5f67892",
      "name": "Web Development Workshop"
    },
    "attendance": [
      {
        "_id": "66f5e8d2a1b2c3d4e5f67895",
        "checkInTime": "2025-09-15T10:05:00.000Z",
        "student": {
          "_id": "66f5e8d2a1b2c3d4e5f67891",
          "name": "John Doe",
          "studentId": "STU001"
        }
      }
    ],
    "stats": {
      "totalRegistered": 25,
      "totalAttended": 20,
      "attendanceRate": 80
    }
  }
}
```

### GET /attendance/student/:studentId
Get attendance history for a student.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66f5e8d2a1b2c3d4e5f67895",
      "checkInTime": "2025-09-15T10:05:00.000Z",
      "event": {
        "_id": "66f5e8d2a1b2c3d4e5f67892",
        "name": "Web Development Workshop",
        "date": "2025-09-15T00:00:00.000Z"
      }
    }
  ]
}
```

## Feedback Endpoints

### POST /feedback
Submit feedback for an attended event.

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "eventId": "66f5e8d2a1b2c3d4e5f67892",
  "overallRating": 4,
  "contentRating": 5,
  "organizationRating": 4,
  "venueRating": 4,
  "comments": "Great workshop! Learned a lot about web development.",
  "suggestions": "More hands-on exercises would be helpful",
  "wouldRecommend": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "_id": "66f5e8d2a1b2c3d4e5f67896",
    "overallRating": 4,
    "submissionDate": "2025-09-15T18:00:00.000Z"
  }
}
```

### GET /feedback/event/:eventId
Get feedback for an event (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "66f5e8d2a1b2c3d4e5f67892",
      "name": "Web Development Workshop"
    },
    "feedback": [
      {
        "_id": "66f5e8d2a1b2c3d4e5f67896",
        "overallRating": 4,
        "comments": "Great workshop! Learned a lot.",
        "submissionDate": "2025-09-15T18:00:00.000Z",
        "student": {
          "name": "John Doe",
          "studentId": "STU001"
        }
      }
    ],
    "stats": {
      "totalFeedback": 15,
      "averageRating": 4.2,
      "recommendationRate": 85
    }
  }
}
```

## Reporting Endpoints

### GET /reports/events/popularity
Get event popularity report.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `collegeId` (optional): Filter by college
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "event": {
        "_id": "66f5e8d2a1b2c3d4e5f67892",
        "name": "Web Development Workshop",
        "eventType": "workshop",
        "date": "2025-09-15T00:00:00.000Z"
      },
      "totalRegistrations": 45,
      "totalAttendance": 38,
      "averageRating": 4.2
    }
  ]
}
```

### GET /reports/students/participation
Get student participation report.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `collegeId` (optional): Filter by college
- `studentId` (optional): Specific student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "student": {
        "_id": "66f5e8d2a1b2c3d4e5f67891",
        "name": "John Doe",
        "studentId": "STU001",
        "department": "Computer Science"
      },
      "eventsRegistered": 5,
      "eventsAttended": 4,
      "attendanceRate": 80,
      "averageFeedbackRating": 4.5
    }
  ]
}
```

### GET /reports/students/top-active
Get top 3 most active students.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "student": {
        "_id": "66f5e8d2a1b2c3d4e5f67891",
        "name": "John Doe",
        "studentId": "STU001",
        "department": "Computer Science"
      },
      "eventsAttended": 12,
      "eventsRegistered": 15,
      "attendanceRate": 80
    },
    {
      "student": {
        "_id": "66f5e8d2a1b2c3d4e5f67897",
        "name": "Jane Smith",
        "studentId": "STU002",
        "department": "Information Technology"
      },
      "eventsAttended": 10,
      "eventsRegistered": 12,
      "attendanceRate": 83
    }
  ]
}
```

### GET /reports/events/by-type
Get events filtered by type.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `eventType` (required): workshop, seminar, fest, hackathon
- `collegeId` (optional): Filter by college

**Response:**
```json
{
  "success": true,
  "data": {
    "eventType": "workshop",
    "events": [
      {
        "_id": "66f5e8d2a1b2c3d4e5f67892",
        "name": "Web Development Workshop",
        "date": "2025-09-15T00:00:00.000Z",
        "totalRegistrations": 45,
        "totalAttendance": 38
      }
    ],
    "stats": {
      "totalEvents": 8,
      "totalRegistrations": 320,
      "totalAttendance": 285,
      "averageAttendanceRate": 89
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication token |
| `FORBIDDEN` | User doesn't have permission for this action |
| `NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request data validation failed |
| `DUPLICATE_ENTRY` | Attempting to create duplicate record |
| `CAPACITY_FULL` | Event has reached maximum capacity |
| `REGISTRATION_CLOSED` | Registration deadline has passed |
| `ALREADY_REGISTERED` | Student already registered for this event |
| `NOT_REGISTERED` | Student not registered for this event |
| `EVENT_CANCELLED` | Event has been cancelled |
| `ALREADY_ATTENDED` | Student already checked in to this event |

## Rate Limiting

API requests are limited to:
- **100 requests per minute** for authenticated users
- **20 requests per minute** for registration endpoints
- **5 requests per minute** for unauthenticated endpoints

## Data Validation

### Common Validation Rules
- **Email**: Must be valid email format
- **Password**: Minimum 8 characters, at least one uppercase, one lowercase, one number
- **Date**: Must be in ISO 8601 format (YYYY-MM-DD)
- **Time**: Must be in HH:MM format (24-hour)
- **Rating**: Must be integer between 1-5
- **Event Capacity**: Must be positive integer ≤ 1000

---

This API documentation provides comprehensive information for integrating with the Campus Event Management Platform. All endpoints include proper error handling, validation, and authentication where required.