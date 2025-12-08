# 🎵 Sonic Cartographer

**A music discovery app that creates personalized listening portraits and guides users through conversations to broaden their musical exploration.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)

---

## 📖 Overview

Sonic Cartographer transforms music discovery into a personalized journey. The app analyzes your listening history, identifies patterns and gaps, then uses AI-powered conversations to recommend albums that expand your musical horizons. Through structured feedback loops, it continuously refines its understanding of your taste while encouraging exploration.

### ✨ Key Features

- 🎨 **Listener Portrait Generation** - AI analyzes your artist list to identify primary genres, geographic centers, key eras, and noteworthy gaps
- 💬 **Guided Discovery Conversations** - Interactive AI conversations that probe your preferences before making recommendations
- 🎵 **Curated Album Recommendations** - Receive 5 carefully selected albums with detailed reasoning
- 📊 **Listening Experience Capture** - Structured feedback system (screening + in-depth interviews)
- 🔄 **Iterative Refinement** - Choose strategic directions (reinforced themes vs. pivots) for subsequent rounds
- 📚 **Session History** - Track all your discovery journeys and revisit past recommendations
- 🔐 **Full Authentication** - Email/password and Google OAuth support

---

## 🎨 Design Philosophy

Sonic Cartographer follows an **edgy, bold music magazine aesthetic** inspired by *The Quietus* and *Pitchfork*, featuring:

- **Charcoal Background**: `#1a1a1a` (main), `#202020` (containers)
- **White Text**: High contrast for readability
- **Hot Pink Accents**: `#ff0055` for CTAs and highlights
- **Sharp White Borders**: Clean, brutalist design elements
- **Uppercase Typography**: Bold, magazine-style headers
- **Futuristic Map Background**: Subtle topographic patterns throughout

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4.0** - Utility-first styling
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend (API Spec)
- **OpenAPI 3.0.3** - API specification
- **JWT Authentication** - Bearer token auth
- **RESTful Architecture** - 20 comprehensive endpoints

### UI Components
- Custom component library based on shadcn/ui patterns
- 40+ reusable components (Button, Card, Dialog, etc.)

---

## 📂 Project Structure

```
sonic-cartographer/
├── App.tsx                          # Main application component
├── openapi.yaml                     # Complete API specification
├── components/
│   ├── Auth.tsx                     # Authentication screen
│   ├── LandingPage.tsx              # Hero/welcome page
│   ├── ArtistInput.tsx              # Artist list input (manual/file upload)
│   ├── ListenerPortrait.tsx         # Portrait display
│   ├── ConversationInterface.tsx    # AI conversation UI
│   ├── RecommendationsDisplay.tsx   # 5 album recommendations
│   ├── ListeningExperience.tsx      # Feedback capture (screening + interview)
│   ├── SessionHistory.tsx           # Past sessions browser
│   ├── UserMenu.tsx                 # User profile dropdown
│   └── ui/                          # 40+ reusable UI components
├── styles/
│   └── globals.css                  # Design tokens & global styles
└── guidelines/
    └── Guidelines.md                # Component guidelines

```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Modern browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/nicolas-brieuc/sonic-cartographer.git
cd sonic-cartographer

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173` (or your configured port).

---

## 🎯 User Journey

### 1. **Authentication**
- Sign up with email/password or Google OAuth
- Secure JWT-based session management

### 2. **Artist Input**
- **Manual Entry**: Paste comma-separated artist names
- **File Upload**: Import from Spotify JSON, Discogs CSV, or plain text
- Minimum 5 artists required

### 3. **Listener Portrait**
AI analyzes your artists to generate:
- **Primary Genres** (e.g., Alternative Rock, Indie Folk, Dream Pop)
- **Geographic Centers** (e.g., Brooklyn, London, Montreal)
- **Key Eras** (e.g., 2000s, 2010s)
- **Noteworthy Gaps** (e.g., Hip-Hop, Latin music, Jazz)

### 4. **Guided Conversation**
AI asks 3-5 questions to refine understanding:
- *"What draws you to these artists?"*
- *"Are you more interested in lyrical storytelling or sonic experimentation?"*
- Interactive, natural dialogue

### 5. **Album Recommendations**
Receive 5 curated albums with:
- Album title, artist, year
- Cover artwork
- Detailed reasoning
- Links to reviews (Pitchfork, etc.)

### 6. **Listening Experience**
**Screening Phase**: Rate each album (1-5 stars)
**Interview Phase**: For albums rated 3+:
- *"What about this album resonated with you?"*
- *"Which specific elements stood out?"*

### 7. **Analysis & Direction**
System analyzes feedback to generate:
- **Reinforced Themes**: What you connected with
- **Strategic Pivot**: Alternative directions to explore

### 8. **Next Round**
Choose your path:
- **Reinforced**: Deeper into themes you loved
- **Pivot**: Explore complementary styles
- Loop continues with refined understanding

---

## 🔌 API Documentation

The complete API specification is available in `/openapi.yaml`.

### Base URLs
- **Production**: `https://api.soniccartographer.com/v1`
- **Staging**: `https://staging-api.soniccartographer.com/v1`
- **Local**: `http://localhost:3000/api/v1`

### Endpoint Categories

#### 🔐 Authentication (5 endpoints)
- `POST /auth/register` - Create account
- `POST /auth/login` - Email/password login
- `POST /auth/social` - Google OAuth
- `POST /auth/logout` - End session
- `GET /auth/me` - Get current user

#### 🎨 Portraits (4 endpoints)
- `POST /portraits/parse-file` - Upload artist file
- `POST /portraits` - Generate portrait
- `GET /portraits` - List user portraits
- `GET /portraits/{id}` - Get specific portrait

#### 💬 Conversations (3 endpoints)
- `POST /conversations` - Start conversation
- `GET /conversations/{id}` - Get conversation
- `POST /conversations/{id}/messages` - Send message

#### 🎵 Recommendations (2 endpoints)
- `POST /recommendations` - Generate recommendations
- `GET /recommendations/{id}` - Get recommendation set

#### 📊 Sessions (4 endpoints)
- `POST /sessions` - Create session
- `GET /sessions` - List sessions
- `GET /sessions/{id}` - Get session
- `POST /sessions/{id}/feedback` - Submit feedback
- `GET /sessions/{id}/analysis` - Get analysis

#### 👤 Users (2 endpoints)
- `GET /users/me` - Get profile
- `PATCH /users/me` - Update profile

### Authentication
All endpoints (except auth) require JWT Bearer token:
```bash
Authorization: Bearer <your-jwt-token>
```

### Interactive Documentation
Import `/openapi.yaml` into:
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)
- [Stoplight](https://stoplight.io/)

---

## 🎨 Design Tokens

### Colors
```css
--background: #1a1a1a          /* Main background */
--container: #202020           /* Container boxes */
--foreground: #ffffff          /* Text */
--accent: #ff0055              /* Hot pink highlights */
--border: rgba(255,255,255,0.15)  /* Subtle borders */
```

### Typography
- **Headers**: Uppercase, bold (font-weight: 700)
- **Body**: Normal weight (font-weight: 400)
- **Base Size**: 16px

### Spacing & Layout
- **Border Radius**: 0 (sharp corners)
- **Borders**: 2px solid white for emphasis
- **Max Width**: 1200px (content containers)

---

## 🧪 Development

### Component Guidelines
See `/guidelines/Guidelines.md` for detailed component patterns.

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- Props typed with TypeScript interfaces
- Tailwind for all styling (no inline styles)

### State Management
- React useState for local state
- Props drilling for shared state (consider Context/Zustand for scaling)

---

## 📦 Build & Deploy

### Production Build
```bash
npm run build
# or
yarn build
```

### Deploy
The app is a static frontend that can be deployed to:
- **Vercel** (recommended for Next.js/Vite apps)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

Ensure your backend API is running and environment variables are configured:
```env
VITE_API_BASE_URL=https://api.soniccartographer.com/v1
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow existing code style (TypeScript + functional React)
- Write meaningful commit messages
- Update documentation for new features
- Ensure all TypeScript types are defined

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Design inspired by [The Quietus](https://thequietus.com/) and [Pitchfork](https://pitchfork.com/)
- UI components based on [shadcn/ui](https://ui.shadcn.com/) patterns
- Icons from [Lucide](https://lucide.dev/)

---

## 📚 Additional Resources

- [OpenAPI Specification](./openapi.yaml)
- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Guide](./docs/API_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## 📧 Contact

**Nicolas Brieuc**
- GitHub: [@nicolas-brieuc](https://github.com/nicolas-brieuc)
- Repository: [sonic-cartographer](https://github.com/nicolas-brieuc/sonic-cartographer)

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Spotify API integration for automatic artist import
- [ ] Apple Music authentication
- [ ] Discogs integration
- [ ] Album playback preview
- [ ] Social sharing of portraits & recommendations
- [ ] Export listening history as PDF/JSON
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Future Considerations
- Collaborative playlists based on shared portraits
- Community discovery (explore other users' journeys)
- Advanced analytics dashboard
- Integration with Last.fm, Bandcamp

---

**Made with 🎵 by music lovers, for music lovers.**