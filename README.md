# Context Manager - AI-Powered Task Management

A task management application that organizes work by mental context (Deep Work, Meetings, Admin, Creative, Learning). Features AI-powered session planning using Claude AI to intelligently schedule tasks based on priorities, deadlines, and context grouping.

## Features

- User Authentication - JWT-based login and registration
- Context-Based Task Management - Organize tasks by mental mode
- AI Session Planning - Claude AI generates daily work schedules (Star Feature)
- Task Categorization - AI automatically categorizes tasks into appropriate contexts
- Drag-and-Drop Reordering - Customize your daily session plan
- Analytics Dashboard - Visualize productivity with charts
- Clean UI - Modern React interface with TypeScript

## Tech Stack

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
- @dnd-kit for drag-and-drop

## Project Structure

```
Context_Manager/
├── ContextManager.API/           # .NET Backend
│   ├── Models/                   # Entity classes
│   ├── Data/                     # DbContext configuration
│   ├── Controllers/              # API endpoints
│   ├── Services/                 # Business logic
│   ├── DTOs/                     # Request/Response models
│   ├── Scripts/                  # SQL migration scripts
│   └── Program.cs                # App configuration
│
└── frontend/                     # React Frontend
    ├── src/
    │   ├── components/           # UI components
    │   ├── pages/                # Main pages
    │   ├── services/             # API client
    │   ├── types/                # TypeScript interfaces
    │   └── styles/               # CSS styles
    └── package.json
```

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js (v18 or higher)
- PostgreSQL (local or Railway)
- Anthropic API Key for Claude AI

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd ContextManager.API
   ```

2. Install dependencies:
   ```bash
   dotnet restore
   ```

3. Configure `appsettings.json`:
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

4. Run the API:
   ```bash
   dotnet run
   ```

   The API will start at `http://localhost:5000`  
   Database migrations run automatically on startup
   Swagger UI available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The app will start at `http://localhost:3000`

## Database

### Schema

- **Users** - User accounts
- **Contexts** - Pre-seeded mental modes
- **Tasks** - User's tasks with context classification
- **SessionPlans** - Daily AI-generated work schedules
- **SessionPlanItems** - Individual tasks within session plans

### Pre-seeded Contexts

- **Deep Work** - Complex problem-solving, coding, writing
- **Meetings** - Collaborative sessions, discussions
- **Admin** - Email, scheduling, documentation
- **Creative** - Brainstorming, design, prototyping
- **Learning** - Reading, courses, skill development

### Migrations

Migrations are handled automatically on startup via `DatabaseMigrationService`. SQL scripts in the `Scripts/` directory are numbered and applied in order:

1. `000_migration_tracking.sql` - Creates migration tracking table
2. `001_init.sql` - Creates base tables (Users, Contexts, Tasks)
3. `002_add_session_plans.sql` - Adds SessionPlans tables
4. `003_remove_task_suggestions.sql` - Removes legacy TaskSuggestions table

The migration system:
- Tracks which migrations have been applied in `__Migrations` table
- Skips migrations that have already run
- Runs migrations in numerical order
- Ensures idempotency (safe to run multiple times)

To manually run a specific migration:
```bash
psql -d contextmanager -f ContextManager.API/Scripts/001_init.sql
```

## AI Integration

### Session Planning

The `SessionPlanService` uses Claude AI to generate intelligent daily work schedules. Work hours are 9 AM - 5 PM with a 30-minute break at 1:30 PM (7.5 hours total, 450 minutes).

Claude analyzes:
- Work hours constraint (9 AM - 5 PM)
- Task priorities and deadlines
- Estimated completion time
- Context switching costs (groups similar mental modes)
- Time of day appropriateness

The AI returns an optimized task schedule that fits within work hours, grouped by context to minimize mental switching. Users can drag-and-drop to reorder tasks.

### Task Categorization

When creating a task, Claude AI automatically suggests the appropriate context based on the task title and description.

### API Examples

**Generate Session Plan:**
```http
POST /api/sessionplan/generate
Authorization: Bearer <token>
Content-Type: application/json

  {
  "planDate": "2024-01-15"
}
```

**Categorize Task:**
```http
POST /api/suggestions/categorize
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Review design mockups",
  "description": "Feedback on new UI designs"
  }
```

## API Endpoints

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

### Session Planning
- `POST /api/sessionplan/generate` - Generate AI session plan
- `GET /api/sessionplan?date={date}` - Get session plan for date
- `GET /api/sessionplan/range?startDate={start}&endDate={end}` - Get plans in range
- `PUT /api/sessionplan/{id}/order` - Update task order

### AI Suggestions
- `POST /api/suggestions/categorize` - Categorize task

### Analytics
- `GET /api/analytics/context-distribution` - Task counts by context
- `GET /api/analytics/completion-rate` - Daily completion rates

## Deployment

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

Railway automatically sets `DATABASE_URL` which the app converts to EF Core format. Migrations run automatically on startup.

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

## Development

### Running Migrations

Migrations run automatically on application startup. To manually trigger or view migration status, check the application logs.

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Test

```bash
cd ContextManager.API
dotnet test
```

## Security Notes

- Passwords are hashed using SHA256
- JWT tokens expire after 30 days
- API endpoints protected with `[Authorize]` attribute
- CORS configured for frontend origin

## License

MIT License
