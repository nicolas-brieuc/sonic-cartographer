# Deployment Configuration

## Environment Variables

JWT_SECRET: Secret key for JWT token signing and verification
SPOTIFY_CLIENT_ID: Spotify API client identifier
SPOTIFY_CLIENT_SECRET: Spotify API client secret
SPOTIFY_REDIRECT_URI: OAuth callback URL for Spotify authentication
DISCOGS_API_KEY: Discogs API authentication key
EMAIL_API_KEY: Email service provider API key
EMAIL_FROM_ADDRESS: Sender email address for outbound emails
FRONTEND_URL: Vultr-hosted frontend URL for CORS configuration
RATE_LIMIT_REQUESTS: Maximum requests per time window (default: 100)
RATE_LIMIT_WINDOW_MS: Rate limit time window in milliseconds (default: 60000)

## Secrets

JWT_SECRET: Required for authentication token security
SPOTIFY_CLIENT_SECRET: Required for Spotify API integration
DISCOGS_API_KEY: Required for album cover image retrieval
EMAIL_API_KEY: Required for sending recommendation emails

## Resource Requirements

Default Raindrop resource allocations are sufficient for initial deployment.
