# Dependencies

## NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| hono | ^4.x | HTTP routing and request handling in V8 runtime |
| zod | ^3.x | Request validation and schema definitions |
| jose | ^5.x | JWT token generation and validation |
| bcrypt | ^5.x | Password hashing (if compatible with V8, otherwise use Web Crypto API) |

## External Services

| Service | Purpose |
|---------|---------|
| Discogs API | Album cover image retrieval |
| Pitchfork | Review links for album recommendations |
| AllMusic | Additional review links for albums |
| Spotify Web API | Playlist creation and Spotify URI retrieval |
| Email Service Provider | Email delivery (e.g., SendGrid, Mailgun, Resend) |

## Required Credentials

SPOTIFY_CLIENT_ID: Spotify application client ID
SPOTIFY_CLIENT_SECRET: Spotify application client secret
DISCOGS_API_KEY: Discogs personal access token
EMAIL_API_KEY: Email service provider API key
JWT_SECRET: Secret key for JWT signing
