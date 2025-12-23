# Contributing to Sonic Cartographer

First off, thank you for considering contributing to Sonic Cartographer! It's people like you that make this music discovery tool better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Design Guidelines](#design-guidelines)

---

## 🤝 Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome diverse perspectives and experiences
- **Be Collaborative**: Work together and help each other grow
- **Be Professional**: Keep discussions focused on the project

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/sonic-cartographer.git
   cd sonic-cartographer
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/nicolas-brieuc/sonic-cartographer.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   - Open http://localhost:5173
   - Create an account
   - Test the basic flow

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `style/` - UI/styling changes
- `test/` - Test additions

### 2. Make Your Changes

- Write clean, readable code
- Follow existing patterns and conventions
- Test your changes thoroughly
- Update documentation if needed

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add album sharing feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📂 Project Structure

```
sonic-cartographer/
├── App.tsx                      # Main app component & routing
├── components/
│   ├── Auth.tsx                 # Authentication flow
│   ├── LandingPage.tsx          # Hero page
│   ├── ArtistInput.tsx          # Artist input UI
│   ├── ListenerPortrait.tsx     # Portrait display
│   ├── ConversationInterface.tsx # AI conversation
│   ├── RecommendationsDisplay.tsx # Album recommendations
│   ├── ListeningExperience.tsx  # Feedback capture
│   ├── SessionHistory.tsx       # History browser
│   ├── UserMenu.tsx             # User dropdown
│   └── ui/                      # Reusable UI components
├── styles/
│   └── globals.css              # Design tokens & global styles
├── openapi.yaml                 # API specification
└── guidelines/
    └── Guidelines.md            # Component patterns
```

### Component Organization

- **Feature Components** (`/components/*.tsx`) - Page-level components
- **UI Components** (`/components/ui/*.tsx`) - Reusable primitives
- **Utilities** (`/components/ui/utils.ts`) - Helper functions

---

## 💻 Coding Standards

### TypeScript

✅ **DO:**
```tsx
// Properly typed props
interface ArtistInputProps {
  onSubmit: (artists: string) => void;
  initialValue?: string;
}

export function ArtistInput({ onSubmit, initialValue = '' }: ArtistInputProps) {
  // Component logic
}

// Typed state
const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
```

❌ **DON'T:**
```tsx
// Avoid 'any' types
const [data, setData] = useState<any>([]);

// Missing prop types
export function ArtistInput({ onSubmit, initialValue }) {
  // ...
}
```

### React Best Practices

✅ **DO:**
```tsx
// Functional components with hooks
export function ConversationInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Event handlers with proper naming
  const handleSendMessage = (content: string) => {
    // Logic here
  };
  
  return (
    <div className="flex flex-col">
      {/* JSX */}
    </div>
  );
}
```

❌ **DON'T:**
```tsx
// Class components (unless absolutely necessary)
class ConversationInterface extends React.Component {
  // Avoid
}

// Inline arrow functions in JSX (performance issue)
<Button onClick={() => handleClick(item.id)} />

// Better:
<Button onClick={handleClick} />
```

### Tailwind CSS

✅ **DO:**
```tsx
// Use Tailwind utilities
<div className="bg-[#202020] border-2 border-white p-6">

// Use design tokens from globals.css
<div className="bg-[var(--background)] text-[var(--foreground)]">
```

❌ **DON'T:**
```tsx
// Don't use inline styles
<div style={{ backgroundColor: '#202020', padding: '24px' }}>

// Avoid font size/weight classes (we have typography presets)
<h1 className="text-4xl font-bold">  // Don't do this
<h1 className="uppercase">            // Do this instead
```

### File Naming

- **Components**: PascalCase (`ArtistInput.tsx`, `ListenerPortrait.tsx`)
- **Utilities**: camelCase (`utils.ts`, `use-mobile.ts`)
- **Styles**: kebab-case (`globals.css`)

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc. (not CSS)
- `refactor:` - Code restructuring without behavior change
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples

```bash
feat: add Spotify artist import
fix: prevent duplicate recommendations
docs: update API endpoint documentation
style: format code with prettier
refactor: simplify conversation state management
perf: optimize portrait generation algorithm
```

### Scope (Optional)

```bash
feat(auth): add Google OAuth support
fix(recommendations): handle empty portrait gaps
docs(api): update OpenAPI spec for sessions
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All TypeScript types are properly defined
- [ ] Component props are documented
- [ ] No console errors or warnings
- [ ] Tested in Chrome, Firefox, and Safari
- [ ] Mobile responsive (if UI changes)
- [ ] Documentation updated (if needed)

### PR Template

When creating a PR, include:

**Description**
- What does this PR do?
- Why is this change needed?

**Changes**
- List of specific changes made

**Screenshots** (for UI changes)
- Before/after screenshots

**Testing**
- How was this tested?
- What scenarios were covered?

**Related Issues**
- Fixes #123
- Related to #456

### Example PR Title

```
feat: add album sharing to social media
fix: resolve conversation state bug on page refresh
docs: add contribution guidelines
```

---

## 🎨 Design Guidelines

### Color Palette

Stick to the established design tokens:

```css
/* Main Colors */
--background: #1a1a1a     /* Charcoal background */
--container: #202020      /* Container boxes */
--foreground: #ffffff     /* White text */
--accent: #ff0055         /* Hot pink accents */

/* Borders */
--border: rgba(255,255,255,0.15)  /* Subtle borders */
```

### Typography

- **Headers**: Always uppercase
- **CTAs**: Uppercase, bold
- **Body**: Regular weight, proper case

```tsx
// Good
<h1 className="uppercase">LISTENER PORTRAIT</h1>
<Button>START DISCOVERY</Button>

// Bad
<h1>listener portrait</h1>
<Button className="text-lg font-bold">Start Discovery</Button>
```

### Layout Principles

1. **Sharp Borders**: Use `border-2 border-white` for emphasis
2. **No Border Radius**: Keep `rounded-none` (brutalist aesthetic)
3. **Generous Padding**: Use `p-6`, `p-8` for breathing room
4. **Max Width**: Contain content with `max-w-6xl mx-auto`

### Spacing

```tsx
// Consistent spacing scale
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px
p-6     // 24px padding
p-8     // 32px padding
```

---

## 🐛 Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Try to reproduce in latest version
- Test in multiple browsers

### Bug Report Template

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.0]
- Version: [e.g., v1.0.0]

---

## 💡 Feature Requests

We welcome feature ideas! Please:

1. Check if the feature has been requested
2. Provide clear use case
3. Explain expected behavior
4. Consider implementation complexity

**Template:**

**Feature Description**
Clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about.

---

## 📚 Resources

### Learning Materials
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [OpenAPI Specification](https://swagger.io/specification/)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Swagger Editor](https://editor.swagger.io/) - For API spec

---

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/nicolas-brieuc/sonic-cartographer/discussions)
- Check existing [Issues](https://github.com/nicolas-brieuc/sonic-cartographer/issues)
- Review the [README](README.md)

---

**Thank you for contributing to Sonic Cartographer! 🎵**
