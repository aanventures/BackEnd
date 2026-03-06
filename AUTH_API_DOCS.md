# User & Admin Authentication API Documentation

## Overview
This documentation covers the unified login and signup endpoints for both regular users and admins using role-based authentication.

## Base URL
```
http://localhost:5000/api/users
```

---

## Authentication Endpoints

### 1. Unified Signup
**Endpoint:** `POST /signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "mobile": 9876543210,
  "role": "user"
}
```

**Notes:**
- The `role` field is **required** and must be either "user" or "admin"
- Creates user or admin account based on the specified role
- If role is not provided, defaults to "user"

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 2. Unified Login
**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Notes:**
- Works for both users and admins based on email/role in database
- No need to specify role - automatically detected from user account
- Returns the user's role in the response

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Examples

### Creating a User Account
```json
POST /api/users/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "mobile": 9876543210,
  "role": "user"
}
```

### Creating an Admin Account
```json
POST /api/users/signup
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "mobile": 9876543210,
  "role": "admin"
}
```

### User/Admin Login (Same Endpoint)
```json
POST /api/users/login
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

---

## Admin Management Endpoints

### 1. Get All Admins
**Endpoint:** `GET /admin`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  ]
}
```

---

### 2. Get Admin by ID
**Endpoint:** `GET /admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 3. Update Admin
**Endpoint:** `PUT /admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Admin Name",
  "mobile": 9876543211
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "mobile": 9876543211
  }
}
```

---

### 4. Delete Admin
**Endpoint:** `DELETE /admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

---

## User Management Endpoints

### 1. Create User
**Endpoint:** `POST /`

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "Password123",
  "mobile": 9876543210
}
```

### 2. Get All Users
**Endpoint:** `GET /`

### 3. Get User by ID
**Endpoint:** `GET /:id`

### 4. Update User
**Endpoint:** `PUT /:id`

### 5. Delete User
**Endpoint:** `DELETE /:id`

---

## Using Authentication Middleware

To protect routes with JWT authentication, use the middleware in your routes:

```javascript
const { verifyToken, isAdmin, isUser } = require('../middleware/auth.middleware')

// Protect a route with token verification
router.get('/protected', verifyToken, someController)

// Protect a route and ensure user is admin
router.get('/admin-only', verifyToken, isAdmin, someAdminController)

// Protect a route and ensure user is regular user
router.get('/user-only', verifyToken, isUser, someUserController)
```

---

## Token Usage

After receiving a token from signup or login, include it in the Authorization header for protected routes:

```
Authorization: Bearer <token>
```

Or use the custom header:
```
x-auth-token: <token>
```

---

## Environment Variables

Add these to your `.env` file:

```
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

---

## Error Codes

| Status | Message |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Credentials |
| 403 | Forbidden / Access Denied |
| 404 | Not Found |
| 500 | Server Error |

---

## Notes

- Passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days by default
- Role-based authentication: specify "user" or "admin" role during signup
- Single login endpoint works for both users and admins
- Passwords are excluded from response bodies for security
- Admin management routes are available under `/admin/*` paths