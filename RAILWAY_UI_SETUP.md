# 🚂 Railway Deployment - UI Only Setup Guide

Complete step-by-step guide to deploy Context Manager using only Railway's web UI (no config files).

---

## 📋 Prerequisites

- [ ] GitHub account with `suleman-dawood/ContextManager` repository
- [ ] Railway account (sign up at [railway.app](https://railway.app))
- [ ] Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com/))

---

## 🚀 Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** (top right)
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: **`suleman-dawood/ContextManager`**
5. Railway will automatically detect it and start building

**✅ Railway will create a service automatically!**

---

## 🗄️ Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"** (top right)
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically:
   - Creates the database
   - Sets `DATABASE_URL` environment variable
   - Links it to your service

**✅ Database is ready!**

---

## ⚙️ Step 3: Configure Backend Service Settings

Click on your service (should be named `ContextManager` or similar)

### A. Builder Settings

1. Scroll to **"Build"** section
2. **Builder:** Select **"Railpack"** (or leave default if it's already Railpack)
3. **Metal Build Environment:** Toggle **ON** (faster builds)

### B. Custom Build Command

1. In **"Build"** section, find **"Custom Build Command"**
2. Click **"Edit"** or **"Override"**
3. Enter this command:
   ```bash
   cd ContextManager.API && dotnet restore && dotnet publish -c Release -o out
   ```

### C. Custom Start Command

1. Scroll to **"Deploy"** section
2. Find **"Custom Start Command"**
3. Click **"Edit"** or **"Override"**
4. Enter this command:
   ```bash
   cd ContextManager.API/out && dotnet ContextManager.API.dll --urls=http://0.0.0.0:$PORT
   ```

### D. Restart Policy

1. In **"Deploy"** section, find **"Restart Policy"**
2. Select **"On Failure"**
3. Set **"Max restart retries"** to `10`

---

## 🔐 Step 4: Set Environment Variables

1. In your service settings, click **"Variables"** tab (or **"Environment"** tab)
2. Click **"+ New Variable"**
3. Add these variables one by one:

### Required Variables:

**1. Anthropic API Key:**
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** `sk-ant-api03-YOUR_KEY_HERE`
- (Get from [console.anthropic.com](https://console.anthropic.com/))
- **Sensitive:** ✅ Check this box

**2. JWT Secret:**
- **Name:** `JWT_SECRET`
- **Value:** Generate a secure random string (32+ characters)
- You can generate one:
  ```bash
  openssl rand -base64 32
  ```
- Or use this format: `your-super-secure-random-secret-key-minimum-32-chars-long`
- **Sensitive:** ✅ Check this box

**3. Environment (Optional but recommended):**
- **Name:** `ASPNETCORE_ENVIRONMENT`
- **Value:** `Production`

### Automatic Variables (Already Set):
- ✅ `DATABASE_URL` - Automatically set by PostgreSQL service
- ✅ `PORT` - Automatically set by Railway
- ✅ `RAILWAY_ENVIRONMENT` - Automatically set

---

## 🌐 Step 5: Configure Networking

1. In service settings, scroll to **"Networking"** section
2. **Public Networking:** ✅ Toggle **ON**
3. Railway will generate a public URL like: `contextmanager-production.up.railway.app`

**✅ Your API will be publicly accessible!**

---

## ✅ Step 6: Verify Deployment

### Check Build Status

1. Go to **"Deployments"** tab in your service
2. Watch the build logs - should see:
   ```
   ✓ dotnet restore
   ✓ dotnet publish
   ✓ Build succeeded
   ```

### Test the API

1. Once deployed, copy your public URL
2. Test the health endpoint:
   ```bash
   curl https://your-service.up.railway.app/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

3. Check Swagger UI:
   - Visit: `https://your-service.up.railway.app/`
   - Should see Swagger API documentation

### Check Database Migration

1. Look at deployment logs
2. Should see: `✅ Database migrations applied successfully`

---

## 🎨 Step 7: Deploy Frontend (Optional - Same Project)

### Option 1: Separate Frontend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select same repo: `suleman-dawood/ContextManager`
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -s -l 3000`
4. Add environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-service.up.railway.app/api`

### Option 2: Serve from Backend

You can serve the built frontend from your .NET backend (single service).

---

## 🔍 Troubleshooting

### Build Fails: "Project file not found"
- **Fix:** Make sure Custom Build Command starts with `cd ContextManager.API &&`

### "Database connection failed"
- **Fix:** Check that PostgreSQL service is added and linked
- **Fix:** Verify `DATABASE_URL` is set (should be automatic)

### "Anthropic API Error"
- **Fix:** Verify `ANTHROPIC_API_KEY` is set correctly
- **Fix:** Check you have credits at [console.anthropic.com](https://console.anthropic.com/)

### Port Already in Use
- **Fix:** Make sure start command uses `$PORT` environment variable

### Service Won't Start
- **Fix:** Check deployment logs for errors
- **Fix:** Verify start command path: `cd ContextManager.API/out &&`

---

## 📊 Quick Reference: Settings Summary

### Build Section:
- **Builder:** Railpack
- **Metal Build:** ON
- **Build Command:** `cd ContextManager.API && dotnet restore && dotnet publish -c Release -o out`

### Deploy Section:
- **Start Command:** `cd ContextManager.API/out && dotnet ContextManager.API.dll --urls=http://0.0.0.0:$PORT`
- **Restart Policy:** On Failure (10 retries)

### Variables:
- `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
- `JWT_SECRET` = `your-32-char-secret`
- `ASPNETCORE_ENVIRONMENT` = `Production`
- `DATABASE_URL` = (automatic)

---

## 🎉 You're Done!

Once deployed, your API will be available at:
- **API:** `https://your-service.up.railway.app/api`
- **Swagger:** `https://your-service.up.railway.app/`
- **Health Check:** `https://your-service.up.railway.app/health`

**Auto-deploy:** Every push to `main` branch will automatically redeploy!

---

## 📝 Notes

- Railway automatically detects code changes and redeploys
- All settings are stored in Railway's dashboard (not in git)
- Environment variables are encrypted and secure
- You can update settings anytime in the UI without code changes

