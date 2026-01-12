# 🚂 Railway Deployment Guide

## Quick Overview

**Everything runs on Railway:**
- ✅ Backend (.NET API)
- ✅ PostgreSQL Database  
- ✅ Environment Variables (secrets)

**Locally:**
- Just verify the build works (no database needed)
- Frontend development with Vite

---

## 🔧 Part 1: Local Build Verification (No Database)

### Install Prerequisites
```bash
# Install .NET 8 SDK
sudo apt install dotnet-sdk-8.0

# Verify installation
dotnet --version
```

### Verify Backend Builds
```bash
cd ContextManager.API
dotnet restore
dotnet build

# Should output: Build succeeded
```

### Verify Frontend Builds
```bash
cd ../frontend
npm install
npm run build

# Should create dist/ folder
```

✅ **That's it for local setup!** No database needed.

---

## 🚂 Part 2: Deploy to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your repository: `suleman-dawood/ContextManager`

### Step 2: Create New Project

**Option A - From Dashboard:**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `suleman-dawood/ContextManager`
4. Railway auto-detects .NET project ✅

**Option B - Using Railway CLI:**
```bash
npm install -g @railway/cli
railway login
cd /path/to/ContextManager
railway init
railway up
```

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway automatically creates and links the database
4. Sets `DATABASE_URL` environment variable ✅

### Step 4: Configure Environment Variables

In Railway project settings, add these variables:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
JWT_SECRET=your-secure-secret-minimum-32-characters-long

# Optional (Railway sets defaults)
ASPNETCORE_ENVIRONMENT=Production
```

**To get your Anthropic API key:**
- Go to [console.anthropic.com](https://console.anthropic.com/)
- Navigate to API Keys
- Create new key or copy existing

**To generate JWT secret:**
```bash
openssl rand -base64 32
```

### Step 5: Configure Deployment

Create `railway.json` in project root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd ContextManager.API && dotnet run --urls=http://0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 6: Add Migration on Startup

Railway runs migrations automatically via `Program.cs`:
```csharp
// This code is already in your Program.cs
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate(); // Auto-applies migrations on startup
}
```

✅ **Database setup is automatic!**

### Step 7: Deploy!

**Railway auto-deploys when you push to GitHub:**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

Railway will:
1. ✅ Build your .NET app
2. ✅ Run migrations
3. ✅ Start the API
4. ✅ Provide a public URL

---

## 🎨 Part 3: Deploy Frontend on Railway

Railway can also host static sites! Deploy your frontend as a separate service:

### Option 1: Railway Static Site (Recommended)

1. In your Railway project, click "New" → "GitHub Repo"
2. Select the same repository: `suleman-dawood/ContextManager`
3. Railway detects the frontend folder
4. Configure the service:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve dist -s -l 3000`
   - **Publish Directory:** `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-service.railway.app/api
   ```
6. Deploy!

### Option 2: Serve from Backend (Simple)

You can also serve the built frontend from your .NET backend:

1. After `npm run build` in frontend, copy `frontend/dist` to `ContextManager.API/wwwroot`
2. Update `Program.cs` to serve static files:
   ```csharp
   app.UseStaticFiles();
   app.MapFallbackToFile("index.html");
   ```
3. Single Railway service serves both!

---

## 🔍 Verify Deployment

### Check Backend
```bash
# Get your Railway URL from dashboard
curl https://your-app.railway.app/health

# Should return: {"status":"healthy","timestamp":"..."}
```

### Check Swagger UI
Visit: `https://your-app.railway.app/`

### Check Frontend
Visit your Railway frontend URL and:
1. ✅ Register account
2. ✅ Create tasks
3. ✅ Test AI suggestions

---

## 🐛 Troubleshooting

### "Build Failed" on Railway
- Check build logs in Railway dashboard
- Verify `ContextManager.API.csproj` exists
- Ensure .NET 8 is specified

### "Database Migration Failed"
- Check PostgreSQL is added to project
- Verify `DATABASE_URL` is set
- Check Railway logs for error details

### "Anthropic API Error"
- Verify API key in Railway environment variables
- Check you have credits at [console.anthropic.com](https://console.anthropic.com/)
- Ensure key starts with `sk-ant-api03-`

### "CORS Error" in Frontend
- Update `Program.cs` CORS settings with your Railway frontend domain
- Add to `AllowedHosts` in appsettings.json

### Frontend Can't Connect to API
- Check `VITE_API_URL` in Railway environment variables
- Ensure URL ends with `/api`
- Verify backend service is running and accessible
- Check Railway API is running (green status)

---

## 💰 Cost Estimate

**Railway:**
- Hobby Plan: $5/month
- Includes: 500 hours runtime, PostgreSQL database
- Starter bonus: $5 free credit

**Railway Frontend:**
- Same pricing as backend ($5/month)
- Or serve static files from backend (free)

**Anthropic API:**
- Pay as you go
- ~$0.01-0.02 per suggestion request
- $5 credit usually lasts months for personal use

**Total: ~$5-10/month** (with free tiers)

---

## 🎉 Success Checklist

- [ ] ✅ Backend builds locally (`dotnet build`)
- [ ] ✅ Frontend builds locally (`npm run build`)
- [ ] ✅ Railway project created
- [ ] ✅ PostgreSQL added to Railway
- [ ] ✅ Environment variables configured
- [ ] ✅ Backend deployed and healthy
- [ ] ✅ Frontend deployed on Railway
- [ ] ✅ Can register and login
- [ ] ✅ Can create tasks
- [ ] ✅ AI suggestions work

---

## 📚 Useful Commands

```bash
# Railway CLI
railway login
railway status
railway logs
railway shell  # Access production database
railway link   # Link local folder to Railway project

# Local Testing (Frontend only)
cd frontend
npm run dev

# Check Railway database locally
railway run dotnet ef database update
```

---

**Need help?** Check Railway documentation or open an issue!

