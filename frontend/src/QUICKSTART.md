# ⚡ Quick Start Guide

Get Sonic Cartographer up and running in 5 minutes.

---

## 🚀 Installation (2 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/nicolas-brieuc/sonic-cartographer.git
cd sonic-cartographer

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

✅ App running at `http://localhost:5173`

---

## 🎯 First-Time Setup

### 1. Create Account (30 seconds)

- Click "Sign Up"
- Enter email, password, name
- Or use "Continue with Google"

### 2. Input Artists (1 minute)

**Option A - Manual:**
```
Radiohead, Bon Iver, Fleet Foxes, Arcade Fire, The National
```

**Option B - File Upload:**
- Export your Spotify library
- Upload JSON/CSV file

### 3. View Your Portrait (30 seconds)

See your music analysis:
- **Primary Genres**: Alternative Rock, Indie Folk
- **Geographic Centers**: Brooklyn, London
- **Key Eras**: 2000s, 2010s
- **Gaps**: Hip-Hop, Latin, Jazz

### 4. Start Conversation (2 minutes)

Answer 3-5 AI questions:
- *"What draws you to these artists?"*
- *"Lyrical storytelling or sonic experimentation?"*

### 5. Get Recommendations (instant)

Receive 5 curated albums with:
- Cover art
- Detailed reasoning
- Review links

### 6. Capture Feedback (2 minutes)

**Screening:** Rate 1-5 stars

**Interview:** For 3+ rated albums:
- What resonated?
- Which elements stood out?

### 7. View Analysis & Repeat

Get personalized insights and start next round!

---

## 📁 File Uploads

### Spotify Export

1. Go to Spotify → Privacy Settings
2. Download "Extended Streaming History"
3. Upload JSON file

### Discogs Export

1. Export collection as CSV
2. Upload to Sonic Cartographer

### Manual CSV

```csv
artist
Radiohead
Bon Iver
Fleet Foxes
```

---

## 🔧 Development

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deploy (5 minutes)

### Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### GitHub Pages

```bash
npm run deploy
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3001
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules
npm install
```

### API Connection Issues
```bash
# Check environment variables
echo $VITE_API_BASE_URL

# Set manually
export VITE_API_BASE_URL=https://api.soniccartographer.com/v1
```

---

## 📚 Next Steps

- [ ] Read [Full Documentation](./README.md)
- [ ] Review [API Guide](./docs/API_GUIDE.md)
- [ ] Check [Architecture](./docs/ARCHITECTURE.md)
- [ ] Explore [Components](./guidelines/Guidelines.md)
- [ ] Join [Discussions](https://github.com/nicolas-brieuc/sonic-cartographer/discussions)

---

## ❓ Common Questions

**Q: Do I need a backend to run this?**
A: Yes, this is the frontend. Deploy the backend separately using `/openapi.yaml`.

**Q: Can I use my Spotify account?**
A: Google OAuth only for now. Spotify integration coming soon.

**Q: Is this free to use?**
A: Yes! Open source under MIT license.

**Q: How do I contribute?**
A: See [Contributing Guide](./CONTRIBUTING.md)

---

## 🎵 Example Use Case

```
1. Input: "Kendrick Lamar, J. Cole, Anderson .Paak"
   
2. Portrait:
   - Genres: Hip-Hop, Conscious Rap, Neo-Soul
   - Gaps: Rock, Electronic, Jazz

3. Conversation:
   - "Do you prefer political commentary or personal stories?"
   - "More interested in lyrical complexity or groove?"

4. Recommendations:
   - To Pimp a Butterfly (Kendrick)
   - Some Rap Songs (Earl Sweatshirt)
   - Blonde (Frank Ocean)
   - [2 more albums]

5. Feedback:
   - Rate each album
   - Share what resonated

6. Analysis:
   - "You love jazz-influenced Hip-Hop with introspective lyrics"
   - Pivot: "Try experimental R&B or conscious soul"

7. Next Round:
   - Get 5 new recommendations based on analysis
```

---

**Ready to discover new music? Let's go! 🎵**

For detailed documentation, see [README.md](./README.md)
