# Sonic Cartographer Frontend

React-based frontend for Sonic Cartographer - an AI-powered music discovery platform that creates personalized album recommendations through listener analysis and guided conversations.

## Overview

The Sonic Cartographer frontend provides an interactive interface for users to:
- Generate listener portraits from their music library
- Engage in AI-guided conversations about musical preferences
- Receive curated album recommendations with detailed reasoning
- Email recommendations for later listening
- Track and explore their music discovery journey

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI framework
- **TypeScript** - Type-safe development
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### UI Libraries
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Chart visualization
- **Embla Carousel** - Touch-friendly carousels
- **Sonner** - Toast notifications

### Form & State Management
- **React Hook Form** - Form validation and management
- Built-in React hooks for state management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `../sonic-cartographer-backend/README.md`)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Backend API URL (optional - defaults to production endpoint)
VITE_API_URL=https://your-backend-url.com

# For local development
# VITE_API_URL=http://localhost:3000
```

If `VITE_API_URL` is not set, the app will use the production backend URL configured in `src/config/api.ts`.

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg              # App favicon (compass icon)
├── src/
│   ├── components/
│   │   ├── ArtistInput.tsx      # Artist list input and CSV upload
│   │   ├── Auth.tsx             # Login/registration forms
│   │   ├── ConversationInterface.tsx  # AI conversation chat
│   │   ├── LandingPage.tsx      # Landing/home page
│   │   ├── ListenerPortrait.tsx # Portrait visualization
│   │   ├── ListeningExperience.tsx    # Feedback collection
│   │   ├── RecommendationsDisplay.tsx # Album recommendations view
│   │   ├── SessionHistory.tsx   # User session history
│   │   ├── UserMenu.tsx         # User dropdown menu
│   │   └── ui/                  # Reusable UI components (Radix)
│   ├── config/
│   │   └── api.ts               # API endpoints and auth helpers
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles and Tailwind
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## Key Components

### App.tsx
Main application orchestrator managing:
- User authentication state
- Navigation between steps (landing, auth, portrait, conversation, recommendations)
- Session management
- API integration

### Authentication Flow
1. **LandingPage** - Initial entry point
2. **Auth** - Login/registration with email/password
3. Stores JWT token in localStorage

### Music Discovery Flow
1. **ArtistInput** - User provides artist list (manual or CSV)
2. **ListenerPortrait** - AI generates portrait showing genres, eras, gaps
3. **ConversationInterface** - 3-5 adaptive questions about preferences
4. **RecommendationsDisplay** - 5 curated album recommendations
5. **ListeningExperience** - (Optional) Post-listening feedback

### Key Features

#### Recommendations Display
- Album covers from Discogs
- Personalized reasoning for each recommendation
- Spotify search links
- Email delivery option
- "Get 5 New Recommendations" - Generate fresh albums without new conversation
- "Restart Exploratory Conversation" - Start over with fresh conversation

#### User Menu
- Session history access
- Logout functionality
- Always visible when authenticated

#### Coming Soon Modal
Displays upcoming features:
- Spotify integration (playlist creation, history import)
- Advanced portrait features
- Listening experience feedback and tracking
- Personalized music discovery insights
- Social login & password recovery

## API Integration

The frontend integrates with the Sonic Cartographer backend via REST API:

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- JWT token stored in localStorage

### Portraits
- `POST /v1/portraits/generate` - Generate listener portrait
- `GET /v1/portraits/:portraitId` - Retrieve portrait
- `GET /v1/portraits/list` - List user's portraits

### Conversations
- `POST /v1/conversations` - Start new conversation
- `POST /v1/conversations/:id/messages` - Send user message

### Recommendations
- `POST /v1/conversations/:id/recommendations` - Generate recommendations
- `POST /v1/recommendations/email` - Email recommendations to user

### Configuration
API endpoints are configured in `src/config/api.ts`:
- `API_BASE_URL` - Backend URL (from env or default)
- `getAuthHeaders()` - Helper for authenticated requests
- `getAuthToken()` / `setAuthToken()` - Token management

## Styling

### Tailwind CSS
The app uses Tailwind CSS with a custom dark theme:
- Primary color: `#ff0055` (hot pink)
- Background: `#1a1a1a` (dark gray)
- Cards: `#202020` (slightly lighter)
- Text: White with gray variations

### Design System
- **Borders**: Bold 2px and 4px borders for brutalist aesthetic
- **Typography**: Uppercase tracking for headers and CTAs
- **Layout**: Max-width containers with generous spacing
- **States**: Hover transitions on all interactive elements

## State Management

### React Hooks
All state is managed using built-in React hooks:
- `useState` - Component-level state
- `useEffect` - Side effects and data fetching
- `useRef` - DOM references

### LocalStorage Persistence
The app persists:
- `auth_token` - JWT authentication token
- `userData` - User profile information
- `sessionId` - Current session identifier
- `recommendations` - Latest recommendations

## Development Workflow

### Hot Module Replacement
Vite provides instant HMR for rapid development:
```bash
npm run dev
```

### Type Checking
TypeScript provides compile-time type safety. Check types:
```bash
npx tsc --noEmit
```

### Code Organization
- Components are self-contained with their logic
- Shared types defined in component files or App.tsx
- API configuration centralized in `config/api.ts`
- Reusable UI components in `components/ui/`

## Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
The built app is a static SPA that can be hosted on:
- Vultr (current deployment)
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Environment Configuration
Set `VITE_API_URL` environment variable to point to your backend:
```bash
VITE_API_URL=https://your-backend.com npm run build
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript support required
- CSS Grid and Flexbox support required

## Accessibility

- Radix UI components provide ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader friendly labels

## Contributing

When adding new features:
1. Create new components in `src/components/`
2. Add API endpoints to `src/config/api.ts`
3. Update type definitions in component or `App.tsx`
4. Follow existing naming conventions (PascalCase for components)
5. Use Tailwind classes for styling
6. Maintain responsive design (mobile-first approach)

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors
- Ensure auth token is valid

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

### Authentication Issues
- Clear localStorage: `localStorage.clear()` in browser console
- Check JWT token expiration
- Verify backend auth service is running

## Related Documentation

- **Backend**: `../sonic-cartographer-backend/README.md`
- **API Specifications**: `../sonic-cartographer-backend/docs/specifications/api_definitions.md`
- **Architecture**: `../sonic-cartographer-backend/docs/architecture/`

## License

Proprietary - All rights reserved

---

Built with React, TypeScript, and Tailwind CSS