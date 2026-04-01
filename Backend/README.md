# LMS Online Backend API Documentation

## Overview

LMS Online is a comprehensive Learning Management System backend built with **Express.js**, **TypeScript**, **MongoDB**, and **Redis**. This API provides a complete solution for managing courses, user authentication, orders, notifications, and dashboard analytics.

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (ioredis)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **Password Hashing**: bcryptjs
- **Validation**: Custom middleware
<!-- - **Task Scheduler**: node-cron -->

## Installation & Setup

### Prerequisites

- Node.js v14+
- MongoDB
- Redis
- npm or yarn

### Installation Steps

```bash
# Install dependencies
npm install

# Create .env file in root directory
# Add required environment variables (see .env.example)

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/lms-online
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRE=5m
REFRESH_TOKEN_EXPIRE=7d
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@lms.com
```

---

## API Endpoints


All endpoints are prefixed with `locahost:5000/api/v1`

### 1. Authentication Routes (`/auth`)

#### Register User

- **Route**: `POST /auth/register`
- **Authentication**: None
- **Description**: Create a new user account

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "User created successfully"
}
```

**Error Responses**:

- `400`: Missing required fields or user already exists

---

#### Login User

- **Route**: `POST /auth/login`
- **Authentication**: None
- **Description**: Authenticate user and receive tokens

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200 OK):

- Sets `token` (Access Token) in cookies
- Sets `refreshToken` (Refresh Token) in cookies

```json
{
  "success": true,
  "message": "Login successful"
}
```

**Error Responses**:

- `400`: Missing email or password
- `401`: Invalid email or password

---

#### Refresh Access Token

- **Route**: `GET /auth/refresh-token`
- **Authentication**: None (Uses refresh token from cookies)
- **Description**: Generate new access token using refresh token

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Access token updated successfully",
  "newAccessToken": "eyJhbGc..."
}
```

**Error Responses**:

- `401`: No refresh token found (login required)

---

#### Get User Profile

- **Route**: `GET /auth/me`
- **Authentication**: Required (Access Token)
- **Description**: Retrieve authenticated user's profile information

**Response** (200 OK):

```json
{
  "success": true,
  "user": {
    "_id": "mongodb_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": {
      "public_id": "cloudinary_id",
      "url": "https://..."
    },
    "role": "user",
    "isverified": false,
    "courses": [{ "courseId": "course_id_1" }],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses**:

- `401`: Unauthorized (no valid token)
- `404`: User not found

---

#### Update User Profile

- **Route**: `PUT /auth/me`
- **Authentication**: Required (Access Token)
- **Description**: Update user's name, email, and/or avatar

**Request Body**:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "avatar": "data:image/png;base64,..." // Optional
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    /* updated user object */
  }
}
```

**Error Responses**:

- `400`: Email already exists
- `404`: User not found

---

#### Update Password

- **Route**: `PUT /auth/me/update-password`
- **Authentication**: Required (Access Token)
- **Description**: Change user's password

**Request Body**:

```json
{
  "oldPassword": "currentpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses**:

- `400`: Missing fields, passwords don't match, or old password is incorrect
- `404`: User not found

---

#### Logout User

- **Route**: `GET /auth/logout`
- **Authentication**: Required (Access Token)
- **Description**: Clear user session and remove tokens

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### Get All Users (Admin Only)

- **Route**: `GET /auth/admin/users`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Retrieve list of all users (admin only)

**Response** (200 OK):

```json
{
  "success": true,
  "users": [
    {
      "_id": "mongodb_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isverified": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

#### Update User Role (Admin Only)

- **Route**: `PUT /auth/admin/users/:id`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Change user's role (user/admin)
- **URL Parameters**: `id` - User MongoDB ID

**Request Body**:

```json
{
  "role": "admin"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

**Error Responses**:

- `400`: Invalid role value
- `403`: Cannot change own role or insufficient permissions
- `404`: User not found

---

#### Delete User (Admin Only)

- **Route**: `DELETE /auth/admin/users/:id`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Delete a user account
- **URL Parameters**: `id` - User MongoDB ID

**Response** (200 OK):

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:

- `403`: Cannot delete own account or cannot delete admin user
- `404`: User not found

---

### 2. Course Routes (`/course`)

#### Get All Courses (Public)

- **Route**: `GET /course/all-courses`
- **Authentication**: None
- **Description**: Retrieve all courses (without detailed content for unpaid users)
- **Caching**: Results are cached in Redis

**Response** (200 OK):

```json
{
  "success": true,
  "courses": [
    {
      "_id": "course_id",
      "name": "Web Development Basics",
      "description": "Learn web development...",
      "price": 29.99,
      "estimatedPrice": 49.99,
      "thumbnail": {
        "public_id": "cloudinary_id",
        "url": "https://..."
      },
      "tags": ["web", "development"],
      "level": "beginner",
      "demoUrl": "https://...",
      "purchased": 150,
      "benefits": ["Certificate", "Lifetime access"],
      "prerequisites": ["Basic PC knowledge"],
      "createdAt": "2024-01-01T00:00:00Z"
      // Note: courseData content is NOT included for unpaid users
    }
  ]
}
```

**Error Responses**:

- `500`: Server error

---

#### Get Course by ID (Public)

- **Route**: `GET /course/all-courses/:id`
- **Authentication**: None
- **Description**: Get specific course details without full content
- **URL Parameters**: `id` - Course MongoDB ID
- **Caching**: Results are cached in Redis

**Response** (200 OK):

```json
{
  "success": true,
  "course": {
    "_id": "course_id",
    "name": "Web Development Basics",
    "description": "Learn web development...",
    "price": 29.99,
    "estimatedPrice": 49.99,
    "thumbnail": {
      /* ... */
    },
    "tags": ["web", "development"],
    "level": "beginner",
    "demoUrl": "https://...",
    "benefits": ["Certificate", "Lifetime access"],
    "prerequisites": ["Basic PC knowledge"],
    "purchased": 150
    // courseData is hidden for unpaid users
  }
}
```

**Error Responses**:

- `400`: Invalid course ID
- `404`: Course not found

---

#### Get Course Content (Authenticated Users Only)

- **Route**: `GET /course/course-content/:id`
- **Authentication**: Required (Access Token)
- **Description**: Retrieve full course content for purchased courses
- **URL Parameters**: `id` - Course MongoDB ID

**Response** (200 OK):

```json
{
  "success": true,
  "content": [
    {
      "_id": "section_id",
      "title": "Introduction",
      "description": "Course introduction",
      "videoUrl": "https://...",
      "videoThumbnail": {
        /* ... */
      },
      "videoSection": "Module 1",
      "videoLength": "45 minutes",
      "videoPlayer": "...",
      "links": [
        {
          "title": "Resource 1",
          "url": "https://..."
        }
      ],
      "suggestions": ["Read chapter 1"],
      "questions": [
        {
          "_id": "question_id",
          "user": {
            /* user info */
          },
          "question": "How do I...?",
          "replies": [
            {
              "user": {
                /* user info */
              },
              "reply": "You can..."
            }
          ]
        }
      ]
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `400`: Invalid course ID
- `403`: Forbidden (course not purchased)
- `404`: Course not found

---

#### Add Question to Course

- **Route**: `PUT /course/course-content/question`
- **Authentication**: Required (Access Token)
- **Description**: Add a question to a specific course section

**Request Body**:

```json
{
  "question": "How do I implement this feature?",
  "courseId": "course_id",
  "courseDataId": "section_id"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Question added successfully",
  "course": {
    /* full course object */
  }
}
```

**Error Responses**:

- `400`: Missing required fields or invalid ID format
- `401`: Unauthorized
- `403`: Course not purchased
- `404`: Course or section not found

---

#### Add Reply to Question

- **Route**: `PUT /course/course-content/reply`
- **Authentication**: Required (Access Token)
- **Description**: Reply to a question in a course

**Request Body**:

```json
{
  "reply": "Here's how you can do it...",
  "courseId": "course_id",
  "courseDataId": "section_id",
  "questionId": "question_id"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Reply added successfully",
  "course": {
    /* full course object */
  }
}
```

**Error Responses**:

- `400`: Missing required fields or invalid ID format
- `401`: Unauthorized
- `404`: Course, section, or question not found

---

#### Add Course Review

- **Route**: `PUT /course/review/:id`
- **Authentication**: Required (Access Token)
- **Description**: Add a review/rating to a course
- **URL Parameters**: `id` - Course MongoDB ID

**Request Body**:

```json
{
  "rating": 4.5,
  "review": "Great course, very informative!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Review added successfully",
  "course": {
    /* updated course object */
  }
}
```

**Error Responses**:

- `400`: Invalid course ID
- `401`: Unauthorized
- `404`: Course not found

---

#### Create Course (Admin Only)

- **Route**: `POST /course/admin/courses/create`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Create a new course (admin only)

**Request Body**:

```json
{
  "name": "Advanced TypeScript",
  "description": "Master TypeScript for professional development...",
  "price": 49.99,
  "estimatedPrice": 79.99,
  "thumbnail": {
    "public_id": "cloudinary_id",
    "url": "https://..."
  },
  "tags": "typescript, programming",
  "level": "advanced",
  "demoUrl": "https://...",
  "benefits": ["Certificate of completion", "Lifetime access", "Source code included"],
  "prerequisites": ["JavaScript basics", "Basic programming knowledge"],
  "courseData": [
    {
      "title": "Getting Started",
      "description": "Setup and introduction",
      "videoUrl": "https://...",
      "videoThumbnail": {
        /* ... */
      },
      "videoSection": "Module 1",
      "videoLength": "30 minutes",
      "videoPlayer": "youtube",
      "links": [
        {
          "title": "Source Code",
          "url": "https://github.com/..."
        }
      ],
      "suggestions": ["Download the starter template"]
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    /* created course object */
  }
}
```

**Error Responses**:

- `400`: Missing required fields
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

#### Get All Courses (Admin Only)

- **Route**: `GET /course/admin/courses`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Retrieve all courses with full details (admin only)

**Response** (200 OK):

```json
{
  "success": true,
  "courses": [
    {
      "_id": "course_id",
      "name": "Course Name",
      "description": "...",
      "price": 49.99,
      "estimatedPrice": 79.99,
      "thumbnail": {
        /* ... */
      },
      "tags": ["tag1", "tag2"],
      "level": "beginner",
      "demoUrl": "https://...",
      "benefits": ["Certificate"],
      "prerequisites": ["None"],
      "courseData": [
        /* all content */
      ],
      "purchased": 50,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: No courses found

---

#### Edit Course (Admin Only)

- **Route**: `PUT /course/admin/courses/:id`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Update course details
- **URL Parameters**: `id` - Course MongoDB ID

**Request Body**: Same as create course

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    /* updated course object */
  }
}
```

**Error Responses**:

- `400`: Invalid course ID
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Course not found

---

#### Delete Course (Admin Only)

- **Route**: `DELETE /course/admin/courses/:id`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Delete a course
- **URL Parameters**: `id` - Course MongoDB ID

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Responses**:

- `400`: Invalid course ID
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Course not found

---

### 3. Order Routes (`/order`)

#### Create Order

- **Route**: `POST /order/create`
- **Authentication**: Required (Access Token)
- **Description**: Create a new order for a course purchase

**Request Body**:

```json
{
  "courseId": "course_id",
  "paymentInfo": {
    "transactionId": "txn_12345",
    "paymentMethod": "credit_card",
    "status": "completed"
  }
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "userId": "user_id",
    "courseId": "course_id",
    "paymentInfo": {
      "transactionId": "txn_12345",
      "paymentMethod": "credit_card",
      "status": "completed",
      "amount": 49.99
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses**:

- `400`: Invalid course ID or course already purchased
- `401`: Unauthorized
- `404`: Course or user not found

---

#### Get All Orders (Admin Only)

- **Route**: `GET /order/admin/orders`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Retrieve all orders with user and course details

**Response** (200 OK):

```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "courseId": {
        "_id": "course_id",
        "name": "Course Name",
        "price": 49.99
      },
      "paymentInfo": {
        "transactionId": "txn_12345",
        "paymentMethod": "credit_card",
        "status": "completed",
        "amount": 49.99
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: No orders found

---

### 4. Notification Routes (`/notification`)

#### Get All Notifications (Admin Only)

- **Route**: `GET /notification/admin/all`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Retrieve all notifications sorted by newest first

**Response** (200 OK):

```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "title": "New Order",
      "message": "You have new order from course: Course Name",
      "status": "unread",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

#### Update Notification Status (Admin Only)

- **Route**: `PUT /notification/read/:id`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Mark a notification as read
- **URL Parameters**: `id` - Notification MongoDB ID

**Response** (200 OK):

```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "title": "New Order",
      "message": "You have new order from course: Course Name",
      "status": "read",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Notification not found

---

### 5. Layout Routes (public)

#### Get Layout by Type

- **Route**: `GET /layout`
- **Authentication**: None
- **Description**: Retrieve layout configuration by type (Banner, FAQ, Category)

**Query Parameters**:

- `type` (optional) - Filter by type (Banner, FAQ, Category)

**Response** (200 OK):

```json
{
  "success": true,
  "layout": {
    "_id": "layout_id",
    "type": "Banner",
    "banner": {
      "image": {
        "public_id": "cloudinary_id",
        "url": "https://..."
      },
      "title": "Welcome to LMS",
      "subtitle": "Learn at your own pace"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

Or for FAQ type:

```json
{
  "success": true,
  "layout": {
    "_id": "layout_id",
    "type": "FAQ",
    "faq": [
      {
        "question": "How do I enroll in a course?",
        "answer": "Click on the course and proceed to checkout..."
      }
    ]
  }
}
```

Or for Category type:

```json
{
  "success": true,
  "layout": {
    "_id": "layout_id",
    "type": "Category",
    "category": [
      {
        "title": "Web Development",
        "icon": "globe"
      }
    ]
  }
}
```

---

#### Create Layout (Admin Only)

- **Route**: `POST /create-layout`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Create a new layout configuration

**Request Body for Banner**:

```json
{
  "type": "Banner",
  "image": {
    "public_id": "cloudinary_id",
    "url": "https://..."
  },
  "title": "Welcome to LMS",
  "subtitle": "Learn at your own pace"
}
```

**Request Body for FAQ**:

```json
{
  "type": "FAQ",
  "faq": [
    {
      "question": "How do I enroll?",
      "answer": "Click on course..."
    },
    {
      "question": "Can I get a refund?",
      "answer": "Yes, within 30 days..."
    }
  ]
}
```

**Request Body for Category**:

```json
{
  "type": "Category",
  "category": [
    {
      "title": "Web Development",
      "icon": "globe"
    },
    {
      "title": "Mobile Development",
      "icon": "mobile"
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Layout created successfully"
}
```

**Error Responses**:

- `400`: Invalid layout type or layout already exists
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

#### Edit Layout (Admin Only)

- **Route**: `PUT /edit-layout`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Update existing layout configuration

**Request Body**: Same structure as create, with updated values

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Layout Banner updated successfully"
}
```

**Error Responses**:

- `400`: Invalid layout type
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Layout not found

---

### 6. Dashboard Routes (Admin Only) (`/admin`)

#### Get Dashboard Totals

- **Route**: `GET /admin/dashboard/totals`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Get summary statistics for dashboard

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCourses": 25,
    "totalOrders": 300,
    "totalRevenue": 14999.99,
    "totalCoursePurchases": {
      "course_id_1": 45,
      "course_id_2": 30
    }
  }
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

#### Get Dashboard Analytics

- **Route**: `GET /admin/dashboard/analytics`
- **Authentication**: Required (Access Token + Admin Role)
- **Description**: Get detailed analytics and charts data

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "month": "January",
        "count": 15
      },
      {
        "month": "February",
        "count": 22
      }
    ],
    "coursePopularity": [
      {
        "courseId": "course_id_1",
        "courseName": "Web Development",
        "purchases": 45,
        "revenue": 2249.55
      }
    ],
    "ordersOverTime": [
      {
        "date": "2024-01-01",
        "orders": 10,
        "revenue": 499.9
      }
    ]
  }
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

## Middleware & Authentication

### Authentication Middleware (`isAuth`)

- Verifies JWT token from cookies
- Attaches user object to request
- Required for protected routes

### Role Authorization Middleware (`authRole`)

- Checks if user has required role
- Commonly used roles: `user`, `admin`, `superAdmin`
- Returns 403 Forbidden if user lacks permission

### Valid ID Middleware (`validId`)

- Validates MongoDB ObjectId format
- Returns 400 Bad Request for invalid IDs

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Models

### User Model

- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `avatar` (Object with public_id and url)
- `role` (String, default: "user")
- `isverified` (Boolean, default: false)
- `courses` (Array of courseId references)
- `timestamps` (createdAt, updatedAt)

### Course Model

- `name` (String, required)
- `description` (String, required)
- `price` (Number, required)
- `estimatedPrice` (Number)
- `thumbnail` (Object)
- `tags` (Array)
- `level` (String)
- `demoUrl` (String)
- `benefits` (Array)
- `prerequisites` (Array)
- `courseData` (Array of video sections with questions & replies)
- `purchased` (Number, default: 0)
- `timestamps`

### Order Model

- `userId` (Reference to User)
- `courseId` (Reference to Course)
- `paymentInfo` (Object with transaction details)
- `timestamps`

### Notification Model

- `userId` (Reference to User)
- `title` (String)
- `message` (String)
- `status` (String, default: "unread")
- `timestamps`

### Layout Model

- `type` (String: Banner, FAQ, Category)
- `banner` (Object with image, title, subtitle)
- `faq` (Array of objects)
- `category` (Array of objects)
- `timestamps`

---

## Caching Strategy (Redis)

The application uses Redis for:

- **User Data**: Cached for 7 days
- **Course Data**: Cached with automatic invalidation on updates
- **All Courses List**: Cached and updated when courses change

### Cache Keys

- `user_id` - User profile data
- `course_id` - Individual course data
- `allCourses` - All courses list

---

<!-- ## Task Scheduling

### Automatic Notification Cleanup

- **Schedule**: Every day at midnight (0 0 0 \* \* \*)
- **Action**: Delete notifications older than 30 days with "read" status
- **File**: [dashboradAnalytics.ts](src/Utils/dashboradAnalytics.ts)

--- -->

## Email Templates

Located in `/Templates` directory:

### Activation Email (`Activation.ejs`)

Sent to users on registration/verification

### Mail Code Email (`mail-code.ejs`)

Sent for password reset and verification codes

---

## File Structure

```
src/
├── app.ts                 # Express app setup
├── server.ts              # Server entry point
├── config/                # Configuration files
│   ├── db.ts              # MongoDB connection
│   └── redis.ts           # Redis connection
├── Controllers/           # Route handlers
├── Middlewares/           # Express middleware
├── Models/                # Mongoose schemas
├── Routes/                # API routes
├── services/              # Business logic
├── Templates/             # Email templates
├── Utils/                 # Utility functions
├── @types/                # TypeScript type definitions
└── Interfaces/            # TypeScript interfaces
```

---

## Development & Testing

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests (if configured)
npm test
```

---

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ HTTP-only cookies for tokens
- ✅ CORS protection
- ✅ Role-based access control
- ✅ Input validation
- ✅ MongoDB ObjectId validation
- ✅ Error handling without exposing sensitive data

---

## Performance Optimizations

- Redis caching for frequently accessed data
- Selective field loading (using `-fields` in queries)
- Indexed database queries
- Cookie-based token management

---

## Future Enhancements

- [ ] Payment gateway integration
- [ ] File upload to cloud storage (Cloudinary)
- [ ] Email verification workflow
- [ ] Advanced analytics dashboard
- [ ] Coupon/discount codes
- [ ] User certificates generation
- [ ] Two-factor authentication
- [ ] GraphQL API support

---

## Support & Contributions

For issues or suggestions, please refer to the project repository.

---

## License

ISC License

---

**Last Updated**: January 2026  
**Version**: 1.0.0
