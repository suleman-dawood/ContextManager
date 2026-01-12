# Context Manager - AI-Powered Task Management

> **Built with .NET 8, React, TypeScript, and Claude AI**  
> A portfolio-ready full-stack application under 5000 lines of code

## 🎯 Project Overview

Context Manager is a task management application that organizes work by **mental context** (Deep Work, Meetings, Admin, Creative, Learning). The star feature is **AI-powered task suggestions** using Claude, which intelligently recommends which tasks to work on based on your current context, time of day, and priorities.

### Key Features

- ✅ **User Authentication** - JWT-based login and registration
- ✅ **Context-Based Task Management** - Organize tasks by mental mode
- ✅ **AI Task Suggestions** - Claude AI recommends optimal tasks (⭐ STAR FEATURE)
- ✅ **Analytics Dashboard** - Visualize productivity with charts
- ✅ **Simple & Clean UI** - Modern React interface with TypeScript

### Tech Stack

**Backend:**
- .NET 8 / C#
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Claude AI API Integration

**Frontend:**
- React 18 + TypeScript
- React Router for navigation
- Recharts for data visualization
- Axios for API calls
- Lucide React for icons

## 📦 Project Structure

```
Context_Manager/
├── ContextManager.API/           # .NET Backend
│   ├── Models/                   # Entity classes (User, Task, Context, etc.)
│   ├── Data/                     # DbContext and database configuration
│   ├── Controllers/              # API endpoints
│   ├── Services/                 # Business logic (Auth, Claude AI)
│   ├── DTOs/                     # Request/Response models
│   ├── Program.cs                # App configuration
│   └── appsettings.json          # Configuration settings
│
└── frontend/                     # React Frontend
    ├── src/
    │   ├── components/           # Reusable UI components
    │   ├── pages/                # Main pages (Login, Dashboard, etc.)
    │   ├── services/             # API client and auth
    │   ├── types/                # TypeScript interfaces
    │   └── styles/               # CSS styles
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (local or Railway)
- [Anthropic API Key](https://console.anthropic.com/) for Claude AI

### Backend Setup

1. **Navigate to the API directory:**
   ```bash
   cd ContextManager.API
   ```

2. **Install dependencies:**
   ```bash
   dotnet restore
   ```

3. **Configure connection string in `appsettings.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=contextmanager;Username=postgres;Password=yourpassword"
     },
     "JwtSettings": {
       "Secret": "your-secret-key-minimum-32-characters-long"
     },
     "Anthropic": {
       "ApiKey": "your-claude-api-key-here"
     }
   }
   ```

4. **Run database migrations:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Run the API:**
   ```bash
   dotnet run
   ```

   The API will start at `http://localhost:5000`  
   Swagger UI available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will start at `http://localhost:3000`

## 🗄️ Database Schema

### Tables

1. **Users** - User accounts
2. **Contexts** - Pre-seeded mental modes (Deep Work, Meetings, etc.)
3. **Tasks** - User's tasks with context classification
4. **TaskSuggestions** - AI suggestion history with user feedback

### Pre-seeded Contexts

- 🧠 **Deep Work** - Complex problem-solving, coding, writing
- 👥 **Meetings** - Collaborative sessions, discussions
- 📋 **Admin** - Email, scheduling, documentation
- 🎨 **Creative** - Brainstorming, design, prototyping
- 📚 **Learning** - Reading, courses, skill development

## 🤖 AI Integration (Star Feature)

The `ClaudeService` sends your pending tasks for a specific context to Claude AI, which analyzes:

- Current time of day (morning/afternoon/evening)
- Task priorities and deadlines
- Estimated completion time
- Context appropriateness

Claude returns the **top 3 recommended tasks** with confidence scores and reasoning. Users can provide feedback (helpful/not helpful) to improve future suggestions.

### Example API Call

```http
GET /api/suggestions?contextId=11111111-1111-1111-1111-111111111111
Authorization: Bearer <your-jwt-token>
```

Response:
```json
[
  {
    "id": "...",
    "taskId": "...",
    "taskTitle": "Implement authentication",
    "confidence": 0.95,
    "reasoning": "High-priority coding task ideal for deep work in the morning",
    "estimatedMinutes": 120
  }
]
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Tasks
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Contexts
- `GET /api/contexts` - List all contexts

### AI Suggestions
- `GET /api/suggestions?contextId={id}` - Get AI recommendations
- `POST /api/suggestions/{id}/feedback` - Provide feedback

### Analytics
- `GET /api/analytics/context-distribution` - Task counts by context
- `GET /api/analytics/completion-rate` - Daily completion rates

## 🚢 Deployment

### Backend (Railway)

1. Create Railway project and add PostgreSQL
2. Set environment variables:
   ```
   ANTHROPIC_API_KEY=your-claude-key
   JWT_SECRET=your-secure-secret-minimum-32-chars
   ASPNETCORE_ENVIRONMENT=Production
   ```
3. Connect GitHub repo or use Railway CLI:
   ```bash
   railway init
   railway up
   ```

Railway automatically sets `DATABASE_URL` which the app converts to EF Core format.

### Frontend (Vercel/Netlify)

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy `dist` folder to Vercel or Netlify
3. Set environment variable:
   ```
   VITE_API_URL=https://your-railway-api.railway.app/api
   ```

## 📏 Line Count

| Component | Lines | Notes |
|-----------|-------|-------|
| **Backend** | ~1,650 | Models, DbContext, Controllers, Services |
| **Frontend** | ~2,300 | Components, Pages, Services, Types |
| **Config** | ~200 | appsettings, package.json, etc |
| **TOTAL** | **~4,150** | ✅ Under 5000 lines! |

## 🎨 Features Demo

### 1. Login/Register
Simple authentication with JWT tokens

### 2. Dashboard
- View all tasks grouped by status
- Filter by context
- Quick stats cards
- Create/Edit/Delete tasks
- Mark tasks as complete

### 3. AI Suggestions (⭐ Star Feature)
- Click "Get AI Task Suggestions"
- Claude analyzes your pending tasks
- See top 3 recommendations with confidence scores
- Provide feedback to improve suggestions

### 4. Analytics
- Pie chart: Task distribution across contexts
- Line chart: Completion rate over last 7 days
- Summary statistics

## 🔐 Security Notes

- Passwords are hashed using SHA256 (consider BCrypt/Argon2 for production)
- JWT tokens expire after 30 days
- API endpoints protected with `[Authorize]` attribute
- CORS configured for frontend origin

## 🛠️ Development Commands

**Backend:**
```bash
# Run API
dotnet run

# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Run tests (if you add them)
dotnet test
```

**Frontend:**
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Future Enhancements

Potential additions (keeping it under 6000 lines total):

- [ ] Focus timer sessions
- [ ] Task templates
- [ ] Email notifications
- [ ] Dark mode
- [ ] Mobile responsive improvements
- [ ] Export tasks to CSV

## 🎯 Portfolio Highlights

**What makes this project impressive:**

1. **Practical AI Integration** - Not just a gimmick, solves real context-switching problems
2. **Clean Architecture** - Simple, maintainable code without over-engineering
3. **Full-Stack Skills** - Backend + Frontend + Database + AI
4. **Production Ready** - Deployable to Railway/Vercel
5. **Under 5000 Lines** - Demonstrates concise, quality code

## 📄 License

This is a portfolio project. Feel free to use it as inspiration for your own projects.

## 👤 Author

Built as a portfolio demonstration of full-stack development skills with AI integration.

---

**Built with ❤️ and Claude AI**

