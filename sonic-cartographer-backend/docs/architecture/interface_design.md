# Interface Design

## API Endpoints

| Name | Method | Path | Auth Required |
|------|--------|------|---------------|
| Register User | POST | /auth/register | No |
| Login User | POST | /auth/login | No |
| Logout User | POST | /auth/logout | Yes |
| Get User Profile | GET | /auth/profile | Yes |
| Update User Profile | PUT | /auth/profile | Yes |
| Generate Portrait | POST | /portrait/generate | Yes |
| Get Portrait | GET | /portrait/{portraitId} | Yes |
| List User Portraits | GET | /portrait/list | Yes |
| Start Conversation | POST | /conversation/start | Yes |
| Continue Conversation | POST | /conversation/{conversationId}/message | Yes |
| Get Conversation | GET | /conversation/{conversationId} | Yes |
| List Conversations | GET | /conversation/list | Yes |
| Generate Recommendations | POST | /recommendations/generate | Yes |
| Get Recommendations | GET | /recommendations/{recommendationId} | Yes |
| List Recommendations | GET | /recommendations/list | Yes |
| Create Listening Experience | POST | /listening-experience | Yes |
| Get Listening Experience | GET | /listening-experience/{experienceId} | Yes |
| List Listening Experiences | GET | /listening-experience/list | Yes |
| Create Session | POST | /session/create | Yes |
| Get Session | GET | /session/{sessionId} | Yes |
| Update Session Status | PUT | /session/{sessionId}/status | Yes |
| List Sessions | GET | /session/list | Yes |
| Create Spotify Playlist | POST | /spotify/create-playlist | Yes |
| Send Email | POST | /email/send-recommendations | Yes |

## Authentication

| Type | Scope |
|------|-------|
| JWT Bearer Token | All authenticated endpoints |
| Token in Authorization header | `Bearer <token>` format |

## Error Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - External API failure |
