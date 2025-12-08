# 🚀 Deployment Guide

Complete guide for deploying Sonic Cartographer to production.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Overview

Sonic Cartographer is a **static frontend application** that can be deployed to any static hosting service. It requires a separate backend API (see API specification in `/openapi.yaml`).

### Architecture

```
┌─────────────────┐      HTTPS/REST      ┌──────────────────┐
│                 │ ───────────────────> │                  │
│  Static Frontend│                      │   Backend API    │
│   (This Repo)   │ <─────────────────── │  (Separate)      │
│                 │      JSON/JWT         │                  │
└─────────────────┘                       └──────────────────┘
```

---

## ✅ Prerequisites

### Required
- Node.js 18+
- npm/yarn/pnpm
- Backend API deployed and accessible
- Domain name (optional but recommended)

### Recommended
- CDN for static assets
- SSL certificate (Let's Encrypt or cloud provider)
- Analytics setup (Google Analytics, Plausible, etc.)

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.soniccartographer.com/v1

# Google OAuth (if using social auth)
VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Optional: Analytics
VITE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional: Feature Flags
VITE_ENABLE_SPOTIFY_IMPORT=false
VITE_ENABLE_APPLE_MUSIC=false

# Optional: Sentry (Error Tracking)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Production Environment Variables

For production deployments, set these in your hosting platform:

**Vercel:**
```bash
vercel env add VITE_API_BASE_URL production
# Enter value when prompted
```

**Netlify:**
```bash
netlify env:set VITE_API_BASE_URL "https://api.soniccartographer.com/v1"
```

**GitHub Pages:**
Store in GitHub repository secrets.

---

## 🏗️ Build Process

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Run Production Build

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This creates an optimized production build in the `/dist` directory.

### 3. Test Build Locally

```bash
npm run preview
# or
yarn preview
```

Visit `http://localhost:4173` to test the production build.

### 4. Verify Build Output

Check that `/dist` contains:
- `index.html`
- `/assets/` directory with JS/CSS bundles
- All static assets (images, fonts, etc.)

---

## 🌍 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Excellent performance

**Deploy via CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Deploy via GitHub Integration:**

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add your variables
6. Click "Deploy"

**Custom Domain:**
```bash
vercel domains add sonic-cartographer.com
```

---

### Option 2: Netlify

**Deploy via CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

**Deploy via Git:**

1. Push to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables
7. Deploy

**`netlify.toml` Configuration:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: GitHub Pages

**Setup:**

1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://nicolas-brieuc.github.io/sonic-cartographer"
}
```

3. Configure Vite for GitHub Pages:

Create/update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sonic-cartographer/', // Repository name
})
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages:
   - Go to repository settings
   - Pages → Source → `gh-pages` branch
   - Save

---

### Option 4: AWS S3 + CloudFront

**1. Create S3 Bucket:**

```bash
aws s3 mb s3://sonic-cartographer
aws s3 website s3://sonic-cartographer \
  --index-document index.html \
  --error-document index.html
```

**2. Upload Build:**

```bash
npm run build
aws s3 sync dist/ s3://sonic-cartographer --delete
```

**3. Set Bucket Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sonic-cartographer/*"
    }
  ]
}
```

**4. Create CloudFront Distribution:**

- Origin: S3 bucket
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Default Root Object: `index.html`
- Custom Error Responses: 404 → /index.html (for SPA routing)

**5. Automate with GitHub Actions:**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Build
        run: |
          npm install
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://sonic-cartographer --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
```

---

### Option 5: Docker + Any Cloud

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Build & Run:**

```bash
# Build
docker build \
  --build-arg VITE_API_BASE_URL=https://api.soniccartographer.com/v1 \
  -t sonic-cartographer .

# Run
docker run -p 8080:80 sonic-cartographer

# Deploy to any container platform (GCP Cloud Run, AWS ECS, etc.)
```

---

## ✅ Post-Deployment

### 1. Verify Deployment

**Check List:**
- [ ] Site loads at production URL
- [ ] Google OAuth works (if enabled)
- [ ] API calls succeed
- [ ] All assets load (images, fonts, icons)
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] No console errors

**Test Flow:**
```bash
# 1. Register/login
# 2. Input artists
# 3. View portrait
# 4. Complete conversation
# 5. Get recommendations
# 6. Submit feedback
# 7. View analysis
```

### 2. Configure DNS

Point your domain to the deployment:

**Vercel:**
- Add A/CNAME records as instructed
- Wait for DNS propagation (5-60 minutes)

**Netlify:**
- Add custom domain in Netlify dashboard
- Update nameservers or add CNAME

### 3. Enable SSL/HTTPS

Most platforms (Vercel, Netlify) auto-provision SSL. For others:

**Let's Encrypt (manual):**
```bash
certbot certonly --webroot -w /path/to/dist \
  -d sonic-cartographer.com \
  -d www.sonic-cartographer.com
```

### 4. Setup Analytics

**Google Analytics:**

Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible (privacy-friendly alternative):**
```html
<script defer data-domain="sonic-cartographer.com" src="https://plausible.io/js/script.js"></script>
```

---

## 📊 Monitoring

### Error Tracking with Sentry

**1. Install Sentry:**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**2. Configure Vite:**

```typescript
// vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "sonic-cartographer",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

**3. Initialize in App:**

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

---

## 🔧 Troubleshooting

### Build Fails

**Issue:** TypeScript errors during build

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix issues or temporarily bypass (not recommended)
npm run build -- --no-typecheck
```

---

### API Calls Fail

**Issue:** CORS errors or 404s

**Check:**
1. Environment variable is set correctly
2. Backend API is running
3. CORS is configured on backend
4. API base URL has `/v1` suffix

**Debug:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

---

### OAuth Redirect Issues

**Issue:** Google OAuth fails after deploy

**Solution:**
1. Update Google OAuth settings:
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-domain.com/auth/callback`
2. Update client ID in environment variables

---

### Assets Not Loading

**Issue:** Images/fonts 404

**Check:**
1. Assets are in `/public` or imported correctly
2. Build output includes assets
3. Base URL is configured (for subdirectory deployments)

---

### SPA Routing Broken

**Issue:** Refresh returns 404

**Solution:**

**Netlify/Vercel:** Add `_redirects` file:
```
/*  /index.html  200
```

**Nginx:** Use `try_files` (see Docker section)

**S3/CloudFront:** Configure custom error response (404 → /index.html)

---

## 📋 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] Environment variables configured
- [ ] API backend deployed and tested
- [ ] OAuth credentials updated (if applicable)
- [ ] Build tested locally (`npm run preview`)

**Deployment:**
- [ ] Build succeeds
- [ ] Deploy to staging first
- [ ] Test all features in staging
- [ ] Deploy to production
- [ ] Verify production deployment

**Post-Deployment:**
- [ ] DNS configured
- [ ] SSL/HTTPS working
- [ ] Analytics installed
- [ ] Error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Performance tested (Lighthouse)
- [ ] Cross-browser tested
- [ ] Mobile tested

---

## 🚀 CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.VITE_GOOGLE_OAUTH_CLIENT_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

**Need help?** Open an issue on [GitHub](https://github.com/nicolas-brieuc/sonic-cartographer/issues)
