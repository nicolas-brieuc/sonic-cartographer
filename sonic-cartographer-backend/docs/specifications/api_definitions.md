# API Definitions

## Authentication Endpoints

### POST /auth/register

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "musiclover"
}

// Response (201)
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "username": "musiclover",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation**: Email must be valid format, password minimum 8 characters, username optional

### POST /auth/login

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response (200)
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation**: Email and password required

### POST /auth/logout

```json
// Request
{}

// Response (200)
{
  "message": "Logged out successfully"
}
```

**Validation**: Valid JWT token in Authorization header

## Portrait Endpoints

### POST /portrait/generate

```json
// Request (multipart/form-data or JSON)
{
  "artistList": ["The Beatles", "Pink Floyd", "Radiohead", "..."],
  "format": "json"
}

// Response (201)
{
  "portraitId": "portrait_xyz789",
  "genres": ["rock", "progressive rock", "alternative"],
  "geographicCenters": ["United Kingdom", "United States"],
  "keyEras": ["1960s", "1970s", "1990s"],
  "noteworthyGaps": ["Limited jazz representation", "No electronic music"],
  "analysisSummary": "Strong preference for British rock from 1960s-1990s..."
}
```

**Validation**: Artist list must contain at least 5 artists, format must be "json" or "csv"

## Conversation Endpoints

### POST /conversation/start

```json
// Request
{
  "portraitId": "portrait_xyz789"
}

// Response (201)
{
  "conversationId": "conv_abc123",
  "currentQuestion": "What draws you most to 1960s British rock?",
  "questionNumber": 1,
  "totalQuestions": 5
}
```

**Validation**: Portrait ID must exist and belong to authenticated user

### POST /conversation/{conversationId}/message

```json
// Request
{
  "answer": "I love the experimental approach and innovative songwriting..."
}

// Response (200)
{
  "conversationId": "conv_abc123",
  "currentQuestion": "Are you more interested in exploring similar experimental albums or branching into different genres?",
  "questionNumber": 2,
  "totalQuestions": 5,
  "isComplete": false
}
```

**Validation**: Answer must be non-empty string

## Recommendation Endpoints

### POST /recommendations/generate

```json
// Request
{
  "portraitId": "portrait_xyz789",
  "conversationId": "conv_abc123"
}

// Response (201)
{
  "recommendationId": "rec_def456",
  "albums": [
    {
      "title": "In the Court of the Crimson King",
      "artist": "King Crimson",
      "year": 1969,
      "coverImageUrl": "https://i.discogs.com/...",
      "spotifyUri": "spotify:album:...",
      "reviewLinks": {
        "pitchfork": "https://pitchfork.com/reviews/albums/...",
        "allmusic": "https://www.allmusic.com/album/..."
      },
      "reasoning": "This pioneering progressive rock album aligns with your interest in experimental 1960s British music..."
    }
  ]
}
```

**Validation**: Portrait ID and conversation ID must exist and belong to user

## Listening Experience Endpoints

### POST /listening-experience

```json
// Request
{
  "recommendationId": "rec_def456",
  "albumTitle": "In the Court of the Crimson King",
  "artistName": "King Crimson",
  "rating": 5,
  "whatResonated": "The mellotron introduction was stunning, complex time signatures",
  "notes": "Added to favorites playlist"
}

// Response (201)
{
  "experienceId": "exp_ghi789",
  "message": "Listening experience recorded successfully"
}
```

**Validation**: Rating must be 1-5, album title and artist required

## Session Endpoints

### POST /session/create

```json
// Request
{}

// Response (201)
{
  "sessionId": "session_jkl012",
  "status": "active",
  "startedAt": "2024-01-15T10:30:00Z"
}
```

### PUT /session/{sessionId}/status

```json
// Request
{
  "status": "completed"
}

// Response (200)
{
  "sessionId": "session_jkl012",
  "status": "completed",
  "completedAt": "2024-01-15T11:45:00Z"
}
```

**Validation**: Status must be "active", "completed", or "archived"

## Spotify Integration Endpoints

### POST /spotify/create-playlist

```json
// Request
{
  "recommendationId": "rec_def456",
  "playlistName": "Sonic Cartographer Discoveries"
}

// Response (201)
{
  "playlistId": "spotify_mno345",
  "spotifyPlaylistId": "37i9dQZF1DXcBWIGoYBM5M",
  "playlistUrl": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
}
```

**Validation**: Recommendation ID must exist, user must have valid Spotify OAuth token

## Email Endpoints

### POST /email/send-recommendations

```json
// Request
{
  "recommendationId": "rec_def456",
  "recipientEmail": "user@example.com"
}

// Response (202)
{
  "deliveryId": "email_pqr678",
  "status": "pending",
  "message": "Email queued for delivery"
}
```

**Validation**: Email must be valid format, recommendation ID must exist
