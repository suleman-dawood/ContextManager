# 🚀 Context Manager - Setup Guide

## ⚠️ SECURITY FIRST

**NEVER commit sensitive data to GitHub!** This project uses configuration files to keep your secrets safe.

### Protected Files (Already in .gitignore)
- ✅ `appsettings.Development.json` - Your local secrets
- ✅ `appsettings.Production.json` - Production secrets
- ✅ `frontend/.env` - Frontend API URL

## 📋 Prerequisites

1. **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download)
2. **Node.js 18+** - [Download here](https://nodejs.org/)
3. **PostgreSQL** - [Download here](https://www.postgresql.org/download/) or use Docker:
   ```bash
   docker run --name contextmanager-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```
4. **Anthropic API Key** - [Get one here](https://console.anthropic.com/)

## 🔧 Step 1: Configure Backend Secrets

1. **Open `appsettings.Development.json`** (this file is NOT committed to GitHub)

2. **Add your Anthropic API key:**
   ```json
   {
     "Anthropic": {
       "ApiKey": "sk-ant-api03-YOUR_ACTUAL_KEY_HERE"
     }
   }
   ```

3. **Update database password if needed:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=contextmanager;Username=postgres;Password=YOUR_PASSWORD"
     }
   }
   ```

4. **Generate a secure JWT secret** (32+ characters):
   ```json
   {
     "JwtSettings": {
       "Secret": "your-super-secure-secret-key-here-minimum-32-chars"
     }
   }
   ```

   💡 **Quick generate:** Run in terminal:
   ```bash
   openssl rand -base64 32
   ```

## 🔧 Step 2: Configure Frontend

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **The default is already set:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## 🗄️ Step 3: Set Up Database

```bash
cd ContextManager.API

# Install EF Core tools (one-time setup)
dotnet tool install --global dotnet-ef

# Restore packages
dotnet restore

# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

✅ **This creates:**
- Users table
- Contexts table (pre-seeded with 5 contexts)
- Tasks table
- TaskSuggestions table

## 📦 Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🚀 Step 5: Run the Application

### Terminal 1 - Backend:
```bash
cd ContextManager.API
dotnet run
```
**Backend runs at:** http://localhost:5000  
**Swagger UI:** http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
**Frontend runs at:** http://localhost:3000

## 🎉 Step 6: Test It Out

1. **Open browser:** http://localhost:3000
2. **Register a new account**
3. **Create some tasks**
4. **Try the AI suggestions!** (Click "Get AI Task Suggestions")

## 🔐 Security Checklist

Before pushing to GitHub, verify:

- [ ] ✅ `.gitignore` includes `appsettings.Development.json`
- [ ] ✅ `.gitignore` includes `.env`
- [ ] ✅ No API keys in `appsettings.json`
- [ ] ✅ No passwords in committed files
- [ ] ✅ `appsettings.Example.json` shows structure only

## 🚢 Deployment (Railway)

### Backend:
1. Create Railway project
2. Add PostgreSQL service
3. Set environment variables in Railway dashboard:
   ```
   ANTHROPIC_API_KEY=your-key
   JWT_SECRET=your-secret-minimum-32-chars
   ASPNETCORE_ENVIRONMENT=Production
   ```
4. Railway auto-sets `DATABASE_URL`

### Frontend:
1. Deploy to Vercel/Netlify
2. Set environment variable:
   ```
   VITE_API_URL=https://your-api.railway.app/api
   ```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `psql -U postgres`
- Verify connection string in `appsettings.Development.json`

### "Authentication failed for repository"
- The project is configured for SSH: `git@github.com:suleman-dawood/ContextManager.git`
- Make sure your SSH key is added to GitHub

### "Claude API error"
- Verify your API key in `appsettings.Development.json`
- Check you have credits at https://console.anthropic.com/

### "Port 5000 already in use"
- Stop other .NET apps or change port in `Program.cs`

## 📚 Additional Resources

- [.NET Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [React Documentation](https://react.dev/)
- [Claude API Docs](https://docs.anthropic.com/)
- [Railway Docs](https://docs.railway.app/)

---

**Need help?** Check the main README.md or open an issue on GitHub!

