# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Auth Routes

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "jwt-token-here"
}
```

#### GET /auth/me
Get current user info. **Requires authentication.**

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "createdAt": "..." }
}
```

---

### Roadmap Routes

#### POST /roadmap/generate
Generate a new AI-powered learning roadmap. **Requires authentication.**

**Request Body:**
```json
{
  "currentSkills": "I know HTML, CSS, and basic JavaScript",
  "targetGoal": "Become a full-stack React developer",
  "hoursPerWeek": 10,
  "totalWeeks": 8
}
```

**Response:** `201 Created`
```json
{
  "message": "Roadmap generated successfully!",
  "roadmap": { ... }
}
```

#### GET /roadmap
Get all roadmaps for current user. **Requires authentication.**

#### GET /roadmap/:id
Get a specific roadmap. **Requires authentication.**

#### PATCH /roadmap/topic/:topicId/complete
Mark a topic as complete/incomplete. **Requires authentication.**

**Request Body:**
```json
{
  "isCompleted": true
}
```

#### DELETE /roadmap/:id
Delete a roadmap. **Requires authentication.**

---

### Quiz Routes

#### POST /quiz/generate/:weekId
Generate a quiz for a specific week. **Requires authentication.**

#### GET /quiz/:quizId
Get quiz details. **Requires authentication.**

#### POST /quiz/:quizId/submit
Submit quiz answers. **Requires authentication.**

**Request Body:**
```json
{
  "answers": [
    { "questionId": "...", "selectedIndex": 0 },
    { "questionId": "...", "selectedIndex": 2 }
  ]
}
```

#### POST /quiz/:quizId/reset
Reset quiz to retake. **Requires authentication.**
