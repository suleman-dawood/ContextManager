# Context Manager

AI-powered task management application that organizes work by mental context. Uses Claude AI to automatically categorize tasks and generate optimized daily work schedules.

## Tech Stack

- Backend: .NET 8, PostgreSQL, Claude Anthropic API
- Frontend: React 18 + TypeScript

## Setup

### Prerequisites

- .NET 8 SDK
- Node.js (v18+)
- PostgreSQL
- Anthropic API Key

### Backend

1. Navigate to API directory:
   ```bash
   cd ContextManager.API
   ```

2. Configure appsettings.json:
   
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
   

3. Run:
   
   dotnet restore
   dotnet run
   

   API runs at http://localhost:5000 (migrations run automatically)

### Frontend

1. Navigate to frontend directory:
   
   cd frontend
   

2. Create .env file:
   
   VITE_API_URL=http://localhost:5000/api
   

3. Run:
   
   npm install
   npm run dev
   

   App runs at http://localhost:3000

## License

MIT License
