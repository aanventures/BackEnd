# User & Admin Authentication API Documentation

## Overview
This documentation covers the login and signup endpoints for both regular users and admins.

## Base URL
```
http://localhost:5000/api
```

---

## User Endpoints

### 1. User Signup
**Endpoint:** `POST /users/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "mobile": 9876543210
}
```

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

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### 2. User Login
**Endpoint:** `POST /users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

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

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Admin Endpoints

### 1. Admin Signup
**Endpoint:** `POST /admins/signup`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "mobile": 9876543210
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Admin already exists with this email"
}
```

---

### 2. Admin Login
**Endpoint:** `POST /admins/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get All Admins
**Endpoint:** `GET /admins`

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

### 4. Get Admin by ID
**Endpoint:** `GET /admins/:id`

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

### 5. Update Admin
**Endpoint:** `PUT /admins/:id`

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

### 6. Delete Admin
**Endpoint:** `DELETE /admins/:id`

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
- Admin and User roles are strictly separated during login
- Passwords are excluded from response bodies for security
