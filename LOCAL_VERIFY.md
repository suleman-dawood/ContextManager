# 🔍 Local Build Verification (No Database Required)

Since you're deploying everything to Railway, you only need to verify the builds work locally.

## Install .NET 8 SDK

```bash
sudo apt install dotnet-sdk-8.0

# Verify
dotnet --version  # Should show 8.0.x
```

## Verify Backend Builds

```bash
cd ContextManager.API
dotnet restore
dotnet build
```

✅ **Expected output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## Verify Frontend Builds

```bash
cd ../frontend
npm install
npm run build
```

✅ **Expected output:**
```
✓ built in 2.5s
```

## Run Frontend Locally (Optional)

```bash
cd frontend
npm run dev
```

Opens at: http://localhost:3000

**Note:** API calls will fail without backend, but you can verify:
- ✅ Pages load
- ✅ UI looks good
- ✅ No TypeScript errors

---

## That's It!

Your local setup is complete. Everything else runs on Railway.

Next step: See `RAILWAY_DEPLOY.md` for deployment instructions.

