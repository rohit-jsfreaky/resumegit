# ResumeGit 🚀

**Turn your GitHub commits into career wins!**

ResumeGit is an AI-powered web application that converts your GitHub activity into ATS-optimized resume bullet points. Simply enter a GitHub username, and the app analyzes public repositories, commits, and contributions to generate professional resume content.

![ResumeGit Demo](https://via.placeholder.com/800x400/1e1b4b/6366f1?text=ResumeGit+Demo)

## ✨ Features

- **GitHub Analysis**: Fetches public repos, commits, languages, and contribution patterns
- **AI-Powered Generation**: Uses Gemini 1.5 Flash to craft professional resume bullets
- **Multiple Modes**: 
  - **Standard**: Balanced technical depth and business impact
  - **Technical Lead**: Architecture, code review, mentoring focus
  - **Impact-Focused**: Heavy on metrics and business outcomes
  - **Entry Level**: Learning agility and collaboration focus
- **ATS-Optimized**: Bullets formatted to pass Applicant Tracking Systems
- **Export Options**: Plain text, PDF, and JSON formats
- **Privacy-First**: No data storage - everything processed in memory
- **Social Sharing**: Pre-composed tweets for viral potential

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (dark mode default)
- Zustand (state management)
- Headless UI (accessible components)
- Lucide React (icons)
- jsPDF (PDF export)

### Backend
- Node.js + Express
- TypeScript
- Google Generative AI SDK (Gemini)
- node-cache (in-memory caching)
- Rate limiting + Helmet security

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey) (FREE!)
- **GitHub Token** (optional, increases rate limit from 60 to 5000 req/hour)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/resumegit.git
cd resumegit
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

Or manually:
```bash
cd server && npm install && cd ../client && npm install && cd ..
```

### 3. Configure environment variables

```bash
# Copy the example env file
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:

```env
# Required - Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - Increases GitHub rate limit (60 → 5000/hour)
# Create at: https://github.com/settings/tokens (no scopes needed)
GITHUB_TOKEN=your_github_token_here

# Server settings
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Start the development servers

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 5. Open the app

Navigate to **http://localhost:5173** in your browser.

## 📁 Project Structure

```
resumegit/
├── package.json           # Root workspace config
├── README.md
├── SETUP_GUIDE.md
│
├── server/                # Backend Express API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── routes/
│   │   │   ├── github.ts  # GitHub API proxy
│   │   │   └── generate.ts # Gemini AI generation
│   │   ├── services/
│   │   │   ├── github.ts  # GitHub data fetching
│   │   │   └── gemini.ts  # AI prompt engineering
│   │   └── types/
│   │       └── index.ts   # TypeScript interfaces
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── client/                # Frontend React app
    ├── src/
    │   ├── main.tsx       # React entry point
    │   ├── App.tsx        # Root component
    │   ├── index.css      # Tailwind + global styles
    │   ├── components/
    │   │   ├── Hero.tsx       # Input form & hero section
    │   │   ├── Results.tsx    # Results dashboard
    │   │   ├── BulletList.tsx # Resume bullets display
    │   │   ├── GitHubStats.tsx # User stats sidebar
    │   │   ├── ExportPanel.tsx # Export options
    │   │   ├── ShareModal.tsx  # Social sharing
    │   │   ├── LoadingState.tsx
    │   │   └── Footer.tsx
    │   ├── services/
    │   │   └── api.ts     # API client + caching
    │   ├── store/
    │   │   └── useAppStore.ts # Zustand store
    │   └── types/
    │       └── index.ts   # TypeScript interfaces
    ├── public/
    │   └── favicon.svg
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🔑 API Keys Setup

### Gemini API Key (Required)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to `server/.env`

**Note**: Gemini API is FREE with generous limits (60 requests/minute)

### GitHub Token (Optional but Recommended)

1. Go to [GitHub Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name it "ResumeGit"
4. **No scopes needed** (public data only)
5. Generate and copy to `server/.env`

**Without token**: 60 requests/hour limit
**With token**: 5,000 requests/hour limit

## 🧪 Testing

```bash
# Test the backend health endpoint
curl http://localhost:3001/api/health

# Test GitHub data fetching
curl http://localhost:3001/api/github/octocat
```

## 🏗️ Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

For deployment, see [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 🚢 Deployment Options

### Vercel (Recommended)
- Frontend: Auto-deployed from Vite build
- Backend: Use Vercel Serverless Functions

### Railway / Render
- Full-stack deployment with Docker support

### Manual VPS
- Use PM2 for process management
- Nginx reverse proxy

## 🔒 Privacy & Security

- **No Database**: All processing is ephemeral (in-memory only)
- **No Logging**: User inputs are never logged
- **Public Data Only**: Only accesses public GitHub repos
- **Client-side Caching**: 1-hour TTL, user-deletable
- **API Key Protection**: Gemini key never exposed to browser

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- [Gemini AI](https://ai.google.dev) for powerful LLM capabilities
- [GitHub API](https://docs.github.com/en/rest) for developer data
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling
- [Lucide Icons](https://lucide.dev) for the icon library

---

**Made with ❤️ by developers, for developers.**

*Turn your commits into career wins! ⭐*
