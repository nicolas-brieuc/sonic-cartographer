# 🏗️ Sonic Cartographer Architecture

Technical architecture and design decisions for the Sonic Cartographer music discovery platform.

---

## 📑 Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend API Design](#backend-api-design)
- [Data Models](#data-models)
- [User Flow](#user-flow)
- [State Management](#state-management)
- [Design System](#design-system)
- [Security](#security)
- [Performance](#performance)
- [Scalability](#scalability)

---

## 🌐 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React SPA (This Repository)                           │ │
│  │  - TypeScript + React 18                               │ │
│  │  - Tailwind CSS 4.0                                    │ │
│  │  - Vite Build System                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST (JWT Auth)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  REST API (Backend - Separate Service)                │ │
│  │  - OpenAPI 3.0.3 Specification                         │ │
│  │  - JWT Authentication                                  │ │
│  │  - 20 Endpoints                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI/LLM     │  │   Database   │  │  OAuth       │      │
│  │   Service    │  │   (PostgreSQL│  │  Providers   │      │
│  │   (GPT-4)    │  │    MongoDB)  │  │  (Google)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **Framework**: React 18+ (Functional Components + Hooks)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4.0
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: Sonner

**Backend (API):**
- **Specification**: OpenAPI 3.0.3
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: RESTful API
- **Response Format**: JSON

**Infrastructure:**
- **Frontend Hosting**: Vercel/Netlify/AWS S3
- **Backend Hosting**: AWS/GCP/Azure
- **Database**: PostgreSQL or MongoDB (recommended)
- **CDN**: CloudFront/Cloudflare
- **AI Provider**: OpenAI (GPT-4)

---

## 💻 Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── Auth.tsx
│   ├── Email/Password Form
│   └── Google OAuth Button
│
├── LandingPage.tsx
│   ├── Hero Section
│   ├── Features Overview
│   └── CTA Button
│
├── ArtistInput.tsx
│   ├── Manual Input Textarea
│   ├── File Upload Component
│   └── Artist List Display
│
├── ListenerPortrait.tsx
│   ├── Primary Genres Display
│   ├── Geographic Centers
│   ├── Key Eras
│   └── Noteworthy Gaps
│
├── ConversationInterface.tsx
│   ├── Message List
│   │   ├── UserMessage
│   │   └── AssistantMessage
│   ├── Input Field
│   └── Send Button
│
├── RecommendationsDisplay.tsx
│   ├── AlbumCard (x5)
│   │   ├── Cover Image
│   │   ├── Metadata
│   │   ├── Reason
│   │   └── Review Link
│   └── Action Buttons
│
├── ListeningExperience.tsx
│   ├── ScreeningPhase
│   │   └── AlbumRating (x5)
│   └── InterviewPhase
│       └── FeedbackForm (for 3+ rated albums)
│
├── SessionHistory.tsx
│   ├── SessionList
│   │   └── SessionCard
│   └── SessionDetail Modal
│
└── UserMenu.tsx
    ├── Profile Info
    └── Logout Button
```

### File Structure

```
src/
├── App.tsx                          # Root component, routing logic
├── main.tsx                         # App entry point
├── components/
│   ├── Auth.tsx                     # Authentication screen
│   ├── LandingPage.tsx              # Landing/hero page
│   ├── ArtistInput.tsx              # Artist input interface
│   ├── ListenerPortrait.tsx         # Portrait display
│   ├── ConversationInterface.tsx    # AI conversation UI
│   ├── RecommendationsDisplay.tsx   # Recommendation cards
│   ├── ListeningExperience.tsx      # Feedback capture
│   ├── SessionHistory.tsx           # History browser
│   ├── UserMenu.tsx                 # User dropdown
│   └── ui/                          # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── ... (40+ components)
├── styles/
│   └── globals.css                  # Design tokens & global styles
├── types/
│   └── index.ts                     # TypeScript type definitions
└── utils/
    ├── api.ts                       # API client functions
    └── helpers.ts                   # Utility functions
```

### State Management

**Current Approach: React State (useState)**

```typescript
// App.tsx - Centralized state
const [user, setUser] = useState<User | null>(null);
const [currentStep, setCurrentStep] = useState<AppStep>('landing');
const [portrait, setPortrait] = useState<Portrait | null>(null);
const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
const [sessions, setSessions] = useState<Session[]>([]);
const [explorationContext, setExplorationContext] = useState<Context | null>(null);
```

**Props Flow:**
```
App → Component → SubComponent
```

**Future Consideration:**
- Zustand or Context API for global state
- React Query for server state management
- Local storage for persistence

---

## 🔌 Backend API Design

### API Architecture Principles

1. **RESTful Design**: Resource-based URLs
2. **Stateless**: Each request contains all necessary information
3. **JWT Authentication**: Bearer token in headers
4. **JSON Format**: All request/response bodies
5. **Versioned**: `/v1/` prefix for API versioning

### Endpoint Categories

```
/auth/*          → Authentication & session management
/portraits/*     → Listener portrait operations
/conversations/* → Discovery conversations
/recommendations/* → Album recommendations
/sessions/*      → Listening sessions & feedback
/users/*         → User profile management
```

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/register or /auth/login
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ 2. Validate credentials
       │ 3. Generate JWT token
       │ 4. Return { user, token }
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 5. Store token (memory/localStorage)
       │ 6. Include in all requests:
       │    Authorization: Bearer {token}
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ 7. Validate token
       │ 8. Process request
       │ 9. Return response
       ▼
```

### Request/Response Patterns

**Standard Success Response:**
```json
{
  "id": "resource-id",
  "data": { ... },
  "createdAt": "2024-12-05T10:00:00Z"
}
```

**Standard Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [ ... ]
  }
}
```

---

## 📊 Data Models

### User

```typescript
interface User {
  id: string;              // UUID
  email: string;           // Email address
  name: string;            // Display name
  createdAt: string;       // ISO 8601 timestamp
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
  };
}
```

### Portrait

```typescript
interface Portrait {
  id: string;                     // UUID
  userId: string;                 // User reference
  primaryGenres: string[];        // Top 5 genres
  geographicCenters: string[];    // Listening regions
  keyEras: string[];              // Time periods
  noteworthyGaps: string[];       // Unexplored genres
  artists: string[];              // Original artist list
  source: 'manual' | 'spotify' | 'discogs' | 'csv';
  createdAt: string;
}
```

### Conversation

```typescript
interface Conversation {
  id: string;                     // UUID
  userId: string;                 // User reference
  portraitId: string;             // Portrait reference
  messages: Message[];            // Message history
  status: 'active' | 'completed';
  direction?: 'reinforced' | 'pivot';
  createdAt: string;
  completedAt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
```

### Recommendation

```typescript
interface Recommendation {
  id: string;                // UUID
  title: string;             // Album title
  artist: string;            // Artist name
  year: string;              // Release year
  reason: string;            // Why recommended
  reviewLink?: string;       // External review URL
  coverImage?: string;       // Album art URL
  genres: string[];          // Genre tags
  spotifyId?: string;        // Spotify album ID
  appleMusicId?: string;     // Apple Music ID
}
```

### Session

```typescript
interface Session {
  id: string;
  userId: string;
  portraitId: string;
  portrait?: Portrait;       // Embedded portrait
  conversationId?: string;
  recommendationSetId: string;
  recommendations: Recommendation[];
  feedback: AlbumFeedback[];
  date: string;
  status: 'active' | 'completed';
}

interface AlbumFeedback {
  albumId: string;           // Recommendation ID
  rating: number;            // 1-5
  rationale?: string;        // Why this rating
  resonantElement?: string;  // What stood out
}
```

### Listening Analysis

```typescript
interface ListeningAnalysis {
  sessionId: string;
  reinforcedThemes: string;      // AI-generated analysis
  strategicPivot: string;        // Alternative direction
  topRatedAlbums: {
    albumId: string;
    title: string;
    artist: string;
    rating: number;
  }[];
  averageRating: number;
  feedbackCount: number;
  createdAt: string;
}
```

---

## 🔄 User Flow

### Complete Journey

```
1. LANDING
   ↓ Click "Start Discovery"
   
2. AUTHENTICATION
   ↓ Sign up/Login
   
3. ARTIST INPUT
   │ Option A: Manual entry
   │ Option B: File upload (Spotify/Discogs/CSV)
   ↓ Submit artist list (min 5)
   
4. PORTRAIT GENERATION
   │ AI analyzes artists
   │ Generates:
   │  - Primary Genres
   │  - Geographic Centers
   │  - Key Eras
   │  - Noteworthy Gaps
   ↓ Review portrait
   
5. GUIDED CONVERSATION
   │ 3-5 AI questions:
   │  - "What draws you to these artists?"
   │  - "Lyrical storytelling or sonic experimentation?"
   │  - "Do you prefer...?"
   ↓ Complete conversation
   
6. RECOMMENDATIONS
   │ Receive 5 curated albums
   │  - Title, Artist, Year
   │  - Cover art
   │  - Detailed reasoning
   │  - Review links
   ↓ View recommendations
   
7. LISTENING EXPERIENCE
   │ PHASE 1: Screening
   │  - Rate each album (1-5 stars)
   │
   │ PHASE 2: Interview (albums rated 3+)
   │  - "What resonated with you?"
   │  - "Which elements stood out?"
   ↓ Submit feedback
   
8. ANALYSIS
   │ AI analyzes feedback
   │ Generates:
   │  - Reinforced Themes
   │  - Strategic Pivot
   │  - Top Rated Summary
   ↓ Review analysis
   
9. DIRECTION CHOICE
   │ Choose next path:
   │  A. Reinforced → Deeper into loved themes
   │  B. Pivot → Explore complementary styles
   ↓
   
10. LOOP → Return to step 5 with context
    (Conversation informed by previous analysis)
```

### State Transitions

```
AppStep Flow:

'landing'
  ↓ (user clicks start)
'artist-input'
  ↓ (submit artists)
'portrait'
  ↓ (start conversation)
'conversation'
  ↓ (conversation complete)
'recommendations'
  ↓ (begin listening)
'listening-experience'
  ↓ (submit feedback)
'recommendations' (with analysis)
  ↓ (choose direction)
'conversation' (with context)
  ↓ ... repeat cycle
```

---

## 🎨 Design System

### Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --background: #1a1a1a;        /* Main background */
  --container: #202020;         /* Container boxes */
  --foreground: #ffffff;        /* Text */
  --accent: #ff0055;            /* Hot pink */
  --border: rgba(255,255,255,0.15);
  
  /* Typography */
  --font-size: 16px;
  --font-weight-normal: 400;
  --font-weight-medium: 700;
  
  /* Spacing */
  --radius: 0;                  /* Sharp corners */
}
```

### Typography Scale

```
Headers:  Uppercase, Bold (700)
Body:     Regular (400)
CTAs:     Uppercase, Bold (700)
```

### Spacing Scale

```
4px   → 0.25rem → gap-1
8px   → 0.5rem  → gap-2
16px  → 1rem    → gap-4
24px  → 1.5rem  → gap-6
32px  → 2rem    → gap-8
48px  → 3rem    → gap-12
```

### Component Patterns

**Container:**
```tsx
<div className="bg-[#202020] border-2 border-white p-8 max-w-6xl mx-auto">
  {/* Content */}
</div>
```

**Button (Primary):**
```tsx
<button className="bg-white text-black px-6 py-3 uppercase hover:bg-[#ff0055] hover:text-white transition-colors">
  Call to Action
</button>
```

**Button (Secondary):**
```tsx
<button className="border-2 border-white text-white px-6 py-3 uppercase hover:bg-white hover:text-black transition-colors">
  Secondary Action
</button>
```

---

## 🔒 Security

### Authentication

- **JWT Tokens**: Stateless authentication
- **HTTPS Only**: All communication encrypted
- **Token Expiry**: 24-hour token lifetime
- **Secure Storage**: Tokens stored in memory (not localStorage for production)

### API Security

- **CORS**: Configured for specific origins
- **Rate Limiting**: 100 req/min per user
- **Input Validation**: All inputs sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

### Data Privacy

- **No PII Collection**: Minimal personal data
- **Email Hashing**: Emails hashed in database
- **Password Hashing**: bcrypt with salt
- **GDPR Compliance**: Right to deletion, data export

---

## ⚡ Performance

### Frontend Optimizations

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Components loaded on-demand
- **Image Optimization**: WebP format, lazy loading
- **Bundle Size**: <200KB gzipped
- **Caching**: Service worker for assets

### API Optimizations

- **Response Caching**: Redis for frequent queries
- **Database Indexing**: Indexes on user_id, created_at
- **Pagination**: Limit/offset for list endpoints
- **Compression**: Gzip response bodies

### Metrics

- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.0s
- **Bundle Size**: ~180KB (gzipped)

---

## 📈 Scalability

### Horizontal Scaling

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│ Frontend  │    │ Frontend  │    │ Frontend  │
│ Instance 1│    │ Instance 2│    │ Instance 3│
└─────┬─────┘    └─────┬─────┘    └─────┬─────┘
      └──────────────┬─────────────────┘
                     │
              ┌──────▼──────┐
              │ Load Balancer│
              └──────┬──────┘
                     │
      ┌──────────────┼─────────────────┐
      │              │                 │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ Backend   │  │ Backend   │  │ Backend   │
│ Instance 1│  │ Instance 2│  │ Instance 3│
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      └──────────────┼─────────────────┘
                     │
              ┌──────▼──────┐
              │  Database   │
              │  (Primary)  │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │                       │
    ┌────▼────┐             ┌────▼────┐
    │ Replica │             │ Replica │
    │    1    │             │    2    │
    └─────────┘             └─────────┘
```

### Caching Strategy

```
User Request
    ↓
CDN (CloudFront)
    ↓ (cache miss)
Application Server
    ↓
Redis Cache
    ↓ (cache miss)
Database
```

### Future Enhancements

- **Microservices**: Separate AI, Auth, Data services
- **Message Queue**: RabbitMQ for async tasks
- **GraphQL**: Replace REST for flexible queries
- **WebSockets**: Real-time conversation updates

---

## 📚 Additional Documentation

- [API Guide](./API_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [OpenAPI Specification](../openapi.yaml)

---

**Questions?** Open an issue on [GitHub](https://github.com/nicolas-brieuc/sonic-cartographer/issues)
