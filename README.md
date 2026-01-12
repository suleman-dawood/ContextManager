# Context Manager

AI-powered task management system with context-aware productivity insights

## What It Does

Context Manager helps you organize tasks by **mental context** (Deep Work, Meetings, Admin, Creative, Learning) and uses **Claude AI** to intelligently suggest which tasks to tackle based on your current mode, time of day, and priorities.

### The Problem
Switching between different types of work (deep coding → quick email → meeting) is cognitively expensive. Most task managers just show a flat list.

### The Solution
- Tag tasks by the mental mode they require
- Get AI-powered suggestions for what to work on right now
- Track productivity patterns across different contexts

## ✨ Key Features

- 🤖 **AI Task Suggestions** - Claude API analyzes your tasks and context to recommend what to work on
- 🎨 **5 Pre-defined Contexts** - Deep Work, Meetings, Admin, Creative, Learning
- ✅ **Smart Task Management** - Create, organize, and complete tasks with context tags
- 📊 **Simple Analytics** - Visualize task distribution and completion rates
- 🔐 **Secure Authentication** - JWT-based user authentication

## 🛠️ Tech Stack

**Backend:**
- .NET 8 (C#)
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Claude API (Anthropic)

**Frontend:**
- React 18 + TypeScript
- TailwindCSS
- Recharts (analytics)
- Axios

**Deployment:**
- Railway (Backend + PostgreSQL)
- Vercel/Netlify (Frontend)

## 📋 Documentation

- **[PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md)** - Full project overview and architecture
- **[IMPLEMENTATION_PLAN_SIMPLE.md](IMPLEMENTATION_PLAN_SIMPLE.md)** - Step-by-step build guide (⭐ START HERE)

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+
- Anthropic API key

### Backend Setup
```bash
cd ContextManager.API

# Install dependencies (restore packages)
dotnet restore

# Update connection string in appsettings.json
# Add your Anthropic API key

# Run migrations
dotnet ef database update

# Start the API
dotnet run
# API runs at https://localhost:5001
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Update API URL in .env
echo "REACT_APP_API_URL=https://localhost:5001" > .env

# Start dev server
npm start
# App runs at http://localhost:3000
```

## 🗄️ Database Setup (Railway)

Railway makes PostgreSQL setup trivial:

1. Create Railway project: `railway init`
2. Add PostgreSQL: Railway Dashboard → Add Service → PostgreSQL
3. Railway sets `DATABASE_URL` automatically
4. Code handles conversion (see `IMPLEMENTATION_PLAN_SIMPLE.md`)

No manual database configuration needed! 🎉

## 📊 Project Scope

**Target**: Under 5000 lines of code (realistic portfolio project)

| Component | Lines |
|-----------|-------|
| Backend (.NET) | ~1,650 |
| Frontend (React) | ~2,300 |
| Config/Other | ~200 |
| **Total** | **~4,150** ✅ |

## 🎓 Skills Demonstrated

- ✅ Full-stack web development
- ✅ RESTful API design
- ✅ Database modeling with EF Core
- ✅ AI/LLM integration (Claude API)
- ✅ Modern frontend with TypeScript
- ✅ Authentication & security (JWT)
- ✅ Cloud deployment (Railway)
- ✅ Clean, maintainable code architecture

## 📸 Screenshots

*Coming soon after implementation*


**TL;DR:**
```bash
# Backend to Railway
railway init
railway up

# Frontend to Vercel
vercel deploy
```

## 📝 License

MIT License - feel free to use this for your own portfolio!

## 🙏 Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) for AI capabilities
- [Railway](https://railway.app/) for easy deployment
- Inspired by productivity research on context switching costs

---

**Status**: 🚧 In Development  
**Timeline**: 2-3 weeks  
**Focus**: Clean, simple, impressive portfolio piece under 5000 lines

