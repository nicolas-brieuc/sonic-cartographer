# Sonic Cartographer Backend

AI-powered music discovery platform that creates personalized album recommendations through listener analysis and guided conversations.

## Overview

Sonic Cartographer transforms music discovery from algorithmic recommendation into guided exploration. The system analyzes a user's listening history to create a "listener portrait" identifying genres, geographic centers, key eras, and gaps. Through AI-guided conversations, it generates curated album recommendations designed to expand musical horizons while respecting individual preferences.

## Features

- **Listener Portrait Generation** - Analyze music libraries to identify patterns and gaps
- **AI-Guided Conversations** - Adaptive questioning to understand preferences
- **Curated Recommendations** - 5 album recommendations with detailed reasoning
- **Metadata Enrichment** - Album covers, Spotify links, and review references
- **Email Delivery** - Beautiful HTML emails with recommendations
- **Session Tracking** - Maintain context across user interactions

## Technology Stack

Built with [Raindrop Framework](https://raindrop.ai) v0.14.0, an AI-native backend framework featuring:

- **SmartSQL** - AI-enhanced SQL database
- **SmartInference** - LLM-powered analysis and recommendations
- **SmartMemory** - Context-aware conversation management
- **SmartBuckets** - Document storage with semantic search
- **Service Architecture** - Microservices with API gateway pattern

## Getting Started

### Prerequisites

- Node.js 18+
- Raindrop CLI (`npm install -g @liquidmetal-ai/raindrop`)
- Environment variables (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
raindrop dev

# Deploy to production
raindrop build deploy
```

### Environment Variables

Required environment variables:

```bash
JWT_SECRET=your-jwt-secret
EMAIL_API_KEY=your-resend-api-key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
DISCOGS_USER_AGENT=YourApp/1.0
```

## Architecture

The backend uses a microservices architecture:

- **api-gateway** - Public HTTP API with authentication and routing
- **auth-service** - User registration and JWT token management
- **portrait-service** - Artist list analysis and portrait generation
- **conversation-service** - AI-guided conversation flow
- **recommendation-service** - Album recommendation generation
- **data-enrichment-service** - External metadata fetching (Discogs, Spotify)
- **email-service** - HTML email delivery
- **session-service** - Session lifecycle tracking
- **listening-experience-service** - Feedback collection and analysis
- **spotify-integration-service** - Spotify API integration

## API Endpoints

See [docs/specifications/api_definitions.md](./docs/specifications/api_definitions.md) for complete API documentation.

Key endpoints:

- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/portraits/generate` - Generate listener portrait
- `POST /v1/conversations/start` - Start recommendation conversation
- `POST /v1/conversations/:conversationId/respond` - Submit answer
- `GET /v1/recommendations/:sessionId` - Get recommendations
- `POST /v1/recommendations/email` - Email recommendations

## Documentation

Comprehensive documentation is available in the [docs/](./docs/) directory:

- **[Product Requirements](./docs/prd.md)** - Complete PRD with requirements and specifications
- **[Architecture](./docs/architecture/)** - Component design, database schema, interfaces, deployment
- **[Specifications](./docs/specifications/)** - API definitions, feature specs, dependencies

## Development

### Project Structure

```
sonic-cartographer-backend/
├── src/
│   ├── _app/              # Application-wide configuration
│   ├── api-gateway/       # Public API gateway
│   ├── auth-service/      # Authentication service
│   ├── portrait-service/  # Portrait generation
│   ├── conversation-service/
│   ├── recommendation-service/
│   ├── email-service/
│   └── ...
├── docs/                  # Documentation
├── dist/                  # Build output
└── raindrop.toml          # Raindrop configuration
```

### Running Tests

```bash
npm test
```

### Deployment

The application is deployed on Raindrop Cloud:

```bash
# Build and deploy
raindrop build deploy

# Check deployment status
raindrop status
```

## Frontend

The React frontend is located at `../frontend/`. See frontend README for setup instructions.

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

Built with [Raindrop Framework](https://raindrop.ai) - AI-native backend development
