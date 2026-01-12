# Sonic Cartographer

AI-powered music discovery platform that transforms algorithmic recommendations into guided exploration through listener analysis and personalized conversations.

## Overview

Sonic Cartographer addresses the fundamental challenge of music recommendation systems: they optimize for familiarity rather than discovery, trapping users in filter bubbles of their existing preferences.

Instead of serving up "more of the same," Sonic Cartographer:

1. **Analyzes Your Listening History** - Creates a detailed "listener portrait" identifying genres, geographic centers, key eras, and noteworthy gaps in your musical landscape
2. **Engages in Thoughtful Dialogue** - AI-guided conversation (3-5 adaptive questions) to understand your preferences and exploration goals
3. **Curates Personalized Recommendations** - Generates 5 album recommendations designed to expand your horizons while respecting your taste
4. **Provides Rich Context** - Each recommendation includes personalized reasoning, album covers, Spotify links, and critical acclaim references

## Project Structure

This repository contains two main components:

### 🎵 [Frontend](./frontend/README.md)
React + TypeScript single-page application providing the user interface.

**Key Features:**
- User authentication with JWT
- Artist list input and CSV upload
- Interactive listener portrait visualization
- AI-guided conversation interface
- Album recommendations with covers and Spotify links
- Email delivery of recommendations
- Session history and tracking

**Technology Stack:**
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components

[**→ Frontend Documentation**](./frontend/README.md)

### ⚙️ [Backend](./sonic-cartographer-backend/README.md)
Raindrop Framework-based backend with AI-native services and microservices architecture.

**Key Services:**
- **auth-service** - User registration and JWT authentication
- **portrait-service** - Artist analysis and portrait generation
- **conversation-service** - AI-guided adaptive questioning
- **recommendation-service** - Album curation with Discogs verification
- **data-enrichment-service** - External metadata (covers, Spotify links)
- **email-service** - HTML email delivery
- **session-service** - Session lifecycle tracking

**Technology Stack:**
- Raindrop Framework v0.14.0
- SmartSQL (AI-enhanced database)
- SmartInference (LLM-powered analysis)
- SmartMemory (conversation context)
- SmartBuckets (semantic search)

[**→ Backend Documentation**](./sonic-cartographer-backend/README.md)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Raindrop CLI (for backend): `npm install -g @liquidmetal-ai/raindrop`

### Installation

```bash
# Install all dependencies
npm install

# Or install separately
cd frontend && npm install
cd ../sonic-cartographer-backend && npm install
```

### Development

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd sonic-cartographer-backend
raindrop dev
# Runs on configured Raindrop endpoint
```

### Environment Variables

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=https://your-backend-url.com
```

**Backend** (`sonic-cartographer-backend/.env`):
```bash
JWT_SECRET=your-jwt-secret
EMAIL_API_KEY=your-resend-api-key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
DISCOGS_USER_AGENT=YourApp/1.0
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (User Interface, State Management, API Integration)    │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JWT Auth)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway                            │
│         (Public endpoint, Auth, Rate Limiting)           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌───────┐  ┌───────────┐  ┌──────────────┐
    │ Auth  │  │ Portrait  │  │ Conversation │
    │Service│  │ Service   │  │   Service    │
    └───────┘  └───────────┘  └──────────────┘
                     │                 │
        ┌────────────┼─────────────────┼──────┐
        ▼            ▼                 ▼      ▼
┌──────────────┐ ┌────────┐  ┌────────────┐ ┌────────┐
│Recommendation│ │  Data  │  │   Email    │ │Session │
│   Service    │ │Enrich. │  │  Service   │ │Service │
└──────────────┘ └────────┘  └────────────┘ └────────┘
        │            │
        ▼            ▼
┌─────────────────────────────────────────────────────────┐
│              AI-Native Resources                         │
│  SmartSQL • SmartInference • SmartMemory • SmartBuckets │
└─────────────────────────────────────────────────────────┘
```

## User Flow

1. **Landing & Authentication**
   - User lands on homepage
   - Registers or logs in with email/password

2. **Artist Input**
   - Provides list of artists (manual entry or CSV upload)
   - Submits for analysis

3. **Listener Portrait**
   - AI analyzes listening patterns
   - Displays portrait showing genres, eras, geographic centers, and gaps
   - User proceeds to conversation

4. **Guided Conversation**
   - AI asks 3-5 adaptive questions about musical preferences
   - Questions adapt based on portrait gaps and user responses
   - Conversation builds criteria for recommendations

5. **Recommendations**
   - Displays 5 curated album recommendations
   - Each includes: cover art, artist, year, personalized reasoning, Spotify link
   - Options to:
     - Email recommendations
     - Get 5 new recommendations (reuses conversation)
     - Restart exploratory conversation (start fresh)

## Key Features

### AI-Powered Analysis
- **SmartInference** analyzes artist lists to identify listening patterns
- Detects genres, geographic origins, key eras, and gaps
- Generates personalized conversation questions

### Hybrid Recommendation System
- LLM suggests albums based on conversation
- Discogs API verifies albums exist and provides metadata
- Album covers, Spotify links, and review references

### Adaptive Conversations
- Questions adapt based on portrait gaps and user responses
- 3-5 questions maximum to maintain engagement
- SmartMemory maintains conversation context

### Rich Metadata
- Album covers from Discogs
- Spotify search links for easy listening
- Personalized reasoning for each recommendation
- Email delivery with beautiful HTML formatting

## Deployment

### Current Setup
- **Frontend**: Static hosting on Vultr
- **Backend**: Raindrop Cloud (Sandbox mode)
- **Database**: SmartSQL (managed by Raindrop)

### Production Deployment

**Backend:**
```bash
cd sonic-cartographer-backend
raindrop build deploy
```

**Frontend:**
```bash
cd frontend
npm run build
# Upload dist/ folder to your hosting provider
```

## Documentation

### Component Documentation
- [Frontend README](./frontend/README.md) - React app setup, components, API integration
- [Backend README](./sonic-cartographer-backend/README.md) - Services, architecture, deployment

### Backend Documentation
- [Product Requirements](./sonic-cartographer-backend/docs/prd.md)
- [Architecture](./sonic-cartographer-backend/docs/architecture/) - Component design, database schema, interfaces
- [API Specifications](./sonic-cartographer-backend/docs/specifications/api_definitions.md)

## Design

Original Figma design: https://www.figma.com/design/UgE3da2OZLi94tIqfN1HJ4/Sonic-Cartographer

### Design System
- **Colors**: Dark theme with hot pink (#ff0055) accents
- **Typography**: Uppercase tracking for brutalist aesthetic
- **Layout**: Bold borders (2px/4px), generous spacing
- **Icons**: Lucide React icon library

## Contributing

See individual component READMEs for contribution guidelines:
- [Frontend Contributing](./frontend/README.md#contributing)
- [Backend Documentation](./sonic-cartographer-backend/README.md)

## Technology Credits

### Frontend
- React - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Radix UI - Accessible components

### Backend
- Raindrop Framework - AI-native backend platform
- SmartSQL - AI-enhanced database
- SmartInference - LLM integration
- SmartMemory - Conversation context
- SmartBuckets - Semantic search

### External APIs
- Discogs - Album metadata and covers
- Spotify - Music links and search
- Resend - Email delivery

## License

Proprietary - All rights reserved

---

Built with [Raindrop Framework](https://raindrop.ai) • Designed in Figma • Powered by AI