# Component Design

## Component Inventory

| Name | Type | Visibility | Purpose |
|------|------|------------|---------|
| api-gateway | service | public | Main HTTP API entry point, routes requests, handles CORS |
| auth-service | service | private | User authentication, JWT token management, password hashing |
| portrait-service | service | private | Artist list analysis, genre/era/geography extraction |
| conversation-service | service | private | AI-powered guided conversations, question generation |
| recommendation-service | service | private | Album recommendation generation with reasoning |
| listening-experience-service | service | private | Feedback collection and analysis |
| session-service | service | private | Session lifecycle management |
| spotify-integration-service | service | private | Spotify API integration for playlists |
| email-service | service | private | Email delivery of recommendations |
| data-enrichment-service | service | private | External API integration (Discogs, Pitchfork, AllMusic) |

## Component Responsibilities

**api-gateway**: Routes incoming HTTP requests to appropriate backend services, validates JWT tokens, applies rate limiting, handles CORS for Vultr-hosted frontend.

**auth-service**: Manages user registration and login, generates/validates JWT tokens, stores user credentials securely with bcrypt hashing.

**portrait-service**: Processes uploaded artist lists (CSV/JSON), uses AI to analyze listening patterns, identifies genres/geographic centers/key eras/gaps, stores portraits in SmartSQL.

**conversation-service**: Orchestrates AI-powered conversations with 3-5 questions, maintains conversation context in SmartMemory, generates personalized questions based on portrait and previous answers.

**recommendation-service**: Generates 5 curated album recommendations using AI with portrait and conversation context, fetches album metadata and cover images from external APIs, validates review links exist.

**listening-experience-service**: Captures user feedback (ratings, resonance notes), analyzes feedback patterns using AI, stores experiences in SmartSQL.

**session-service**: Tracks user sessions (active/completed/archived), manages session state transitions, provides session history.

**spotify-integration-service**: Authenticates with Spotify API, creates playlists from recommendations, retrieves Spotify URIs for albums.

**email-service**: Formats recommendation emails, sends via email provider API, tracks email delivery status.

**data-enrichment-service**: Fetches album cover images from Discogs API, retrieves review links from Pitchfork and AllMusic, verifies link validity before returning.

## Inter-Component Communication

```
api-gateway → auth-service.validateToken()
api-gateway → auth-service.register()
api-gateway → auth-service.login()
api-gateway → portrait-service.generatePortrait()
api-gateway → conversation-service.startConversation()
api-gateway → conversation-service.continueConversation()
api-gateway → recommendation-service.generateRecommendations()
api-gateway → listening-experience-service.createExperience()
api-gateway → session-service.createSession()
api-gateway → session-service.updateSessionStatus()
api-gateway → spotify-integration-service.createPlaylist()
api-gateway → email-service.sendRecommendations()

portrait-service → data-enrichment-service.enrichArtistData()
recommendation-service → data-enrichment-service.getAlbumMetadata()
recommendation-service → data-enrichment-service.getCoverImage()
recommendation-service → data-enrichment-service.getReviewLinks()
```

## File Structure Per Component

### Services (api-gateway, auth-service, portrait-service, etc.)
```
src/<component-name>/
├── index.ts          # Main entry point, HTTP request handlers
├── interfaces.ts     # TypeScript interfaces, Zod schemas
└── utils.ts          # Business logic, helper functions
```

### Shared Code
```
src/shared/
├── interfaces.ts     # Shared types across components
└── utils.ts          # Shared utilities (JWT helpers, validation)
```
