# 🔌 Sonic Cartographer API Guide

Complete guide to integrating with the Sonic Cartographer API.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Request/Response Format](#requestresponse-format)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
- [SDK & Tools](#sdk--tools)

---

## 🌐 Overview

The Sonic Cartographer API is a RESTful API that powers personalized music discovery experiences. It uses:

- **JSON** for request/response bodies
- **JWT** for authentication
- **OpenAPI 3.0.3** specification
- **Bearer token** authorization

### Quick Start

1. Register a user account
2. Obtain JWT token
3. Create a listener portrait
4. Start a conversation
5. Get recommendations
6. Capture feedback
7. Analyze and iterate

---

## 🔐 Authentication

All endpoints (except auth endpoints) require JWT authentication.

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-12-05T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-12-06T10:00:00Z"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as registration

### Google OAuth

```http
POST /auth/social
Content-Type: application/json

{
  "provider": "google",
  "token": "ya29.a0AfH6SMBx..."
}
```

### Using the Token

Include the JWT token in all subsequent requests:

```http
GET /portraits
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌍 Base URLs

- **Production**: `https://api.soniccartographer.com/v1`
- **Staging**: `https://staging-api.soniccartographer.com/v1`
- **Local Dev**: `http://localhost:3000/api/v1`

Example:
```
https://api.soniccartographer.com/v1/portraits
```

---

## 📨 Request/Response Format

### Content Type

All requests must use JSON:
```http
Content-Type: application/json
```

### Standard Response Format

**Success (200-299):**
```json
{
  "id": "...",
  "data": { ... }
}
```

**Error (400-599):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "artists",
        "message": "Must provide at least 5 artists"
      }
    ]
  }
}
```

---

## 📍 Endpoints

### 🎨 Portraits

#### Parse Artist File

Upload and parse artist files (Spotify JSON, Discogs CSV, TXT).

```http
POST /portraits/parse-file
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
fileType: "spotify" | "discogs" | "csv" | "txt"
```

**Response:**
```json
{
  "artists": [
    "Radiohead",
    "Bon Iver",
    "Fleet Foxes"
  ],
  "count": 47,
  "source": "spotify"
}
```

#### Generate Portrait

```http
POST /portraits
Authorization: Bearer {token}
Content-Type: application/json

{
  "artists": [
    "Radiohead",
    "Bon Iver",
    "Fleet Foxes",
    "Arcade Fire",
    "The National"
  ],
  "source": "manual"
}
```

**Response:**
```json
{
  "id": "7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "primaryGenres": [
    "Alternative Rock",
    "Indie Folk",
    "Dream Pop"
  ],
  "geographicCenters": [
    "North America (US, Canada)",
    "United Kingdom"
  ],
  "keyEras": [
    "2000s",
    "2010s"
  ],
  "noteworthyGaps": [
    "Hip-Hop and R&B",
    "Latin American music",
    "Jazz and Blues"
  ],
  "artists": ["Radiohead", "Bon Iver", ...],
  "source": "manual",
  "createdAt": "2024-12-05T10:00:00Z"
}
```

#### List Portraits

```http
GET /portraits?limit=10&offset=0
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    { /* Portrait object */ },
    { /* Portrait object */ }
  ],
  "total": 23,
  "limit": 10,
  "offset": 0
}
```

#### Get Portrait by ID

```http
GET /portraits/{portraitId}
Authorization: Bearer {token}
```

---

### 💬 Conversations

#### Start Conversation

```http
POST /conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "portraitId": "7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d",
  "direction": "reinforced",  // Optional: "reinforced" | "pivot"
  "previousAnalysis": {       // Optional: from previous session
    "reinforcedThemes": "...",
    "strategicPivot": "..."
  }
}
```

**Response:**
```json
{
  "id": "9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "portraitId": "7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d",
  "messages": [
    {
      "id": "msg_001",
      "role": "assistant",
      "content": "I see you listen primarily to Alternative Rock and Indie Folk. What draws you to these genres?",
      "createdAt": "2024-12-05T10:05:00Z"
    }
  ],
  "status": "active",
  "direction": "reinforced",
  "createdAt": "2024-12-05T10:05:00Z"
}
```

#### Send Message

```http
POST /conversations/{conversationId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "I'm drawn to the lyrical storytelling and emotional depth"
}
```

**Response:**
```json
{
  "message": {
    "id": "msg_002",
    "role": "user",
    "content": "I'm drawn to the lyrical storytelling and emotional depth",
    "createdAt": "2024-12-05T10:06:00Z"
  },
  "response": {
    "id": "msg_003",
    "role": "assistant",
    "content": "Great! Are you more interested in introspective, personal narratives or broader social commentary?",
    "createdAt": "2024-12-05T10:06:01Z"
  },
  "isComplete": false,
  "recommendations": null
}
```

**When conversation is complete:**
```json
{
  "message": { /* user message */ },
  "response": {
    "id": "msg_007",
    "role": "assistant",
    "content": "Perfect! I have enough to create great recommendations for you.",
    "createdAt": "2024-12-05T10:10:00Z"
  },
  "isComplete": true,
  "recommendations": [
    {
      "id": "rec_001",
      "title": "To Pimp a Butterfly",
      "artist": "Kendrick Lamar",
      "year": "2015",
      "reason": "A masterpiece of conscious Hip-Hop with jazz fusion elements...",
      "reviewLink": "https://pitchfork.com/reviews/albums/20390-to-pimp-a-butterfly/",
      "coverImage": "https://example.com/cover.jpg",
      "genres": ["Hip-Hop", "Jazz Rap"],
      "spotifyId": "7ycBtnsMtyVbbwTfJwRjSP"
    }
    // ... 4 more recommendations
  ]
}
```

---

### 🎵 Recommendations

#### Generate Recommendations

```http
POST /recommendations
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f",
  "count": 5
}
```

**Response:**
```json
{
  "id": "rec_set_001",
  "conversationId": "9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f",
  "recommendations": [
    { /* Recommendation 1 */ },
    { /* Recommendation 2 */ },
    { /* Recommendation 3 */ },
    { /* Recommendation 4 */ },
    { /* Recommendation 5 */ }
  ],
  "createdAt": "2024-12-05T10:15:00Z"
}
```

#### Get Recommendation Set

```http
GET /recommendations/{recommendationSetId}
Authorization: Bearer {token}
```

---

### 📊 Sessions

#### Create Listening Session

```http
POST /sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "portraitId": "7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d",
  "recommendationSetId": "rec_set_001",
  "conversationId": "9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f"
}
```

**Response:**
```json
{
  "id": "session_001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "portraitId": "7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d",
  "portrait": { /* Portrait object */ },
  "conversationId": "9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f",
  "recommendationSetId": "rec_set_001",
  "recommendations": [ /* 5 recommendations */ ],
  "feedback": [],
  "date": "2024-12-05T10:20:00Z",
  "status": "active"
}
```

#### Submit Feedback

```http
POST /sessions/{sessionId}/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "feedback": [
    {
      "albumId": "rec_001",
      "rating": 5,
      "rationale": "Amazing production and lyrical depth",
      "resonantElement": "The jazz instrumentation and political themes really connected with me"
    },
    {
      "albumId": "rec_002",
      "rating": 4,
      "rationale": "Great songwriting but felt too long",
      "resonantElement": "The vocal harmonies were stunning"
    }
  ]
}
```

**Response:**
```json
{
  /* Updated Session object with feedback */
  "id": "session_001",
  "feedback": [
    { /* Feedback 1 */ },
    { /* Feedback 2 */ }
  ],
  "status": "completed"
}
```

#### Get Listening Analysis

Requires at least 3 album reviews.

```http
GET /sessions/{sessionId}/analysis
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sessionId": "session_001",
  "reinforcedThemes": "You strongly connected with albums featuring introspective lyricism, jazz influences, and socially conscious themes. The experimental production approaches in higher-rated albums suggest you appreciate artistic risk-taking.",
  "strategicPivot": "While you appreciated the lyrical depth, the lower ratings for more abstract experimental work suggest exploring more accessible entry points. Consider neo-soul or conscious R&B that maintains lyrical substance with more conventional structures.",
  "topRatedAlbums": [
    {
      "albumId": "rec_001",
      "title": "To Pimp a Butterfly",
      "artist": "Kendrick Lamar",
      "rating": 5
    }
  ],
  "averageRating": 4.2,
  "feedbackCount": 5,
  "createdAt": "2024-12-05T11:00:00Z"
}
```

---

### 👤 Users

#### Get User Profile

```http
GET /users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-12-01T08:00:00Z",
  "preferences": {
    "notifications": true,
    "emailUpdates": false
  }
}
```

#### Update Profile

```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "notifications": false,
    "emailUpdates": true
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid authentication
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `413 Payload Too Large` - File too large
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "artists",
        "message": "Must provide at least 5 artists"
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `UNAUTHORIZED` - Authentication failed
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_DATA` - Not enough data for operation
- `INTERNAL_ERROR` - Server error

---

## 🚦 Rate Limiting

**Production Environment:**
- 100 requests per minute per user
- 1000 requests per hour per user

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638720000
```

**Rate Limit Exceeded:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds."
  }
}
```

---

## 💻 Examples

### Complete Flow (cURL)

```bash
# 1. Register
curl -X POST https://api.soniccartographer.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Create Portrait
curl -X POST https://api.soniccartographer.com/v1/portraits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artists": ["Radiohead", "Bon Iver", "Fleet Foxes", "Arcade Fire", "The National"],
    "source": "manual"
  }'

# Save portraitId from response
PORTRAIT_ID="7f8a4b2c-e5d3-4a1b-9c8d-6e5f4a3b2c1d"

# 3. Start Conversation
curl -X POST https://api.soniccartographer.com/v1/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"portraitId\": \"$PORTRAIT_ID\"}"

# Save conversationId
CONV_ID="9b7c5d3e-1f2a-4b6c-8d9e-0a1b2c3d4e5f"

# 4. Send Message
curl -X POST https://api.soniccartographer.com/v1/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "I love introspective lyrics and experimental production"}'

# 5. Continue until isComplete: true, then get recommendations
# They will be in the final message response
```

### JavaScript/Fetch Example

```javascript
const API_BASE = 'https://api.soniccartographer.com/v1';

// Register
const register = async (email, password, name) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const data = await response.json();
  return data.token;
};

// Create Portrait
const createPortrait = async (token, artists) => {
  const response = await fetch(`${API_BASE}/portraits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ artists, source: 'manual' })
  });
  return await response.json();
};

// Start Conversation
const startConversation = async (token, portraitId) => {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ portraitId })
  });
  return await response.json();
};

// Usage
const token = await register('user@example.com', 'password123', 'John');
const portrait = await createPortrait(token, ['Radiohead', 'Bon Iver']);
const conversation = await startConversation(token, portrait.id);
```

---

## 🛠️ SDK & Tools

### OpenAPI Specification

Download the full specification:
- **File**: `/openapi.yaml`
- **Format**: OpenAPI 3.0.3

### Tools

**Swagger UI**
```bash
# View interactive docs
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/openapi.yaml \
  -v $(pwd)/openapi.yaml:/openapi.yaml \
  swaggerapi/swagger-ui
```

**Postman**
1. Import `/openapi.yaml` into Postman
2. All endpoints will be available as a collection
3. Set environment variable `{{token}}` for authentication

**Code Generation**
Generate client SDKs using [OpenAPI Generator](https://openapi-generator.tech/):

```bash
# Generate TypeScript client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./sdk/typescript

# Generate Python client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./sdk/python
```

---

## 📚 Additional Resources

- [OpenAPI Specification](../openapi.yaml)
- [Main Documentation](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)

---

**Questions or issues?** Open a [GitHub Issue](https://github.com/nicolas-brieuc/sonic-cartographer/issues)
