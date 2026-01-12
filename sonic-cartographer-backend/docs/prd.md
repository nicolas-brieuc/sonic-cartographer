# Product Requirements Document: Sonic Cartographer Backend

## Executive Summary

The Sonic Cartographer backend transforms music discovery from algorithmic recommendation into guided exploration through AI-powered listener analysis. This application addresses the fundamental challenge of music recommendation systems: they optimize for familiarity rather than discovery, trapping users in filter bubbles of their existing preferences. By analyzing a user's listening history to create a "listener portrait" - identifying genres, geographic centers, key eras, and noteworthy gaps - the system enables conversations about musical taste that lead to curated album recommendations designed to expand horizons while respecting individual preferences.

The backend serves a React frontend hosted on Vultr, providing RESTful APIs for user authentication, portrait generation from artist lists, AI-guided conversational preference refinement, album recommendation generation with external metadata enrichment, listening experience feedback collection, and session tracking. Integration with Spotify enables playlist creation, while email delivery ensures recommendations remain accessible. The architecture leverages Raindrop's AI-native resources - SmartSQL for structured data, SmartInference for analysis and recommendation, SmartMemory for conversation context, and SmartBuckets for document storage - to create an intelligent system that learns from each interaction while maintaining user privacy and data sovereignty.

## Requirements

### Functional Requirements

- User registration and authentication with JWT tokens
- Portrait generation from uploaded artist lists (CSV/JSON)
- AI-powered analysis identifying genres, geographic centers, key eras, and gaps
- Guided conversational interface with 3-5 adaptive questions
- Generation of 5 curated album recommendations with reasoning
- External metadata enrichment (album covers from Discogs, review links from Pitchfork/AllMusic)
- Spotify URI integration for playlist creation
- Listening experience feedback collection (ratings, resonance notes)
- Session lifecycle management tracking user journey
- Spotify playlist creation from recommendations
- Email delivery of recommendations with formatting
- CORS configuration for Vultr-hosted frontend

### Non-Functional Requirements

- JWT token expiration and refresh handling
- Password hashing with bcrypt or Web Crypto API
- Rate limiting on public endpoints
- Error handling with appropriate HTTP status codes
- Structured logging with env.logger for all components
- External API failure resilience and fallback handling
- Review link validation before returning to frontend
- V8 runtime compatibility for all dependencies
- Async/await patterns throughout codebase
- Input validation using Zod schemas

## Architecture Approach

The Sonic Cartographer backend employs a microservices architecture orchestrated through a public API gateway, with private backend services handling specialized domains. This design separates concerns while maintaining cohesive integration through Raindrop's service-to-service communication pattern. The architecture prioritizes AI-native capabilities by leveraging SmartInference for all analysis tasks, SmartMemory for conversation continuity, and SmartBuckets for semantic search over uploaded artist data.

| Component | Type | Addresses Requirements | Solution Approach |
|-----------|------|------------------------|-------------------|
| api-gateway | service | User authentication, CORS, rate limiting, request routing | Public HTTP service validating JWT tokens, applying rate limits via KV cache counters, routing to private services with structured error handling |
| auth-service | service | User registration, login, JWT token management | Private service managing user credentials with bcrypt hashing, generating signed JWT tokens using jose library, validating tokens on protected endpoints |
| portrait-service | service | Artist list processing, pattern analysis, gap identification | Private service uploading artist data to SmartBuckets, using SmartInference to analyze listening patterns, extracting genres/geography/eras, storing portraits in SmartSQL |
| conversation-service | service | AI-guided conversations, adaptive questioning | Private service initializing SmartMemory sessions for context, using SmartInference to generate 3-5 personalized questions based on portrait and previous answers, maintaining conversation state |
| recommendation-service | service | Album recommendation generation, reasoning, metadata enrichment | Private service using SmartInference with portrait and conversation context to generate 5 recommendations, orchestrating data-enrichment-service calls for covers/reviews/URIs, storing in SmartSQL |
| listening-experience-service | service | Feedback collection, pattern analysis | Private service capturing ratings and resonance notes, using SmartInference to analyze feedback patterns, storing experiences in SmartSQL linked to recommendations |
| session-service | service | Session lifecycle tracking, status management | Private service creating sessions on portrait generation, updating status as user progresses through conversation and recommendations, providing session history queries |
| spotify-integration-service | service | Spotify OAuth, playlist creation | Private service authenticating with Spotify API, creating playlists from recommendation album URIs, storing playlist references in SmartSQL |
| email-service | service | Email formatting, delivery tracking | Private service formatting recommendations as HTML emails with album metadata, sending via external email provider API, tracking delivery status in SmartSQL |
| data-enrichment-service | service | External API integration, link validation | Private service fetching album covers from Discogs API, retrieving review links from Pitchfork/AllMusic with existence validation, handling external API failures gracefully |

The architecture employs SmartSQL as the single source of truth for all relational data (users, portraits, conversations, recommendations, experiences, sessions), SmartMemory for ephemeral conversation state with session rehydration capabilities, and SmartBuckets for artist list storage with semantic search potential. All AI operations route through SmartInference to centralize model selection and prompt management. Service-to-service calls use Raindrop's typed environment bindings (env.SERVICE_NAME.method()) to ensure compile-time safety and eliminate network overhead within the application boundary.

## Detailed Artifact References

### Architecture Artifacts

- **[Interface Design](architecture/interface_design.md)** - Complete API endpoint catalog with HTTP methods, paths, authentication requirements, and error codes
- **[Component Design](architecture/component_design.md)** - Service inventory with responsibilities, inter-component communication patterns, and file structure conventions
- **[Database Design](architecture/database_design.md)** - SmartSQL schema definitions with tables, indexes, foreign key relationships for all domain entities
- **[Deployment Configuration](architecture/deployment_config.md)** - Environment variables, secrets management requirements, and resource allocation specifications

### Specification Artifacts

- **[Feature Specifications](specifications/feature_specs.md)** - User-facing feature descriptions with detailed acceptance criteria for each major capability
- **[API Definitions](specifications/api_definitions.md)** - Request/response JSON examples with validation rules for all API endpoints
- **[Dependencies](specifications/dependencies.md)** - NPM packages, external service integrations, and required API credentials
- **[Tentative Manifest](tentative_manifest.txt)** - Working raindrop.manifest configuration defining all services, resources, and environment bindings
