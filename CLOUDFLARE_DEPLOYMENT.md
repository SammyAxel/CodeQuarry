# Cloudflare Workers Deployment Guide

## Setting Up Environment Variables in Cloudflare

### Step 1: Access Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers** → Your project
3. Click **Settings** (top navigation)

### Step 2: Environment Variables Section
1. Scroll down to **Environment Variables**
2. Click **+ Add Variable**

### Step 3: Add Admin Password
- **Variable name:** `ADMIN_PASSWORD`
- **Value:** `GemMiner2025!`
- Click **Save**

### Step 4: Add Moderator Password
- **Variable name:** `MOD_PASSWORD`
- **Value:** `GemGoblin2025!`
- Click **Save**

### Step 5: Redeploy
- Go to **Deployments**
- Click **Redeploy** on your latest deployment
- Cloudflare will restart with new environment variables

---

## How It Works

### Local Development (with `.env`)
```
Your Computer
    ↓
.env file (git ignored)
    ↓
server.js reads process.env
    ↓
Backend uses passwords
```

### Production (Cloudflare Workers)
```
Cloudflare Dashboard
    ↓
Environment Variables UI
    ↓
Cloudflare injects at runtime
    ↓
server.js reads process.env
    ↓
Backend uses passwords
```

---

## Verification

### Test Locally
```bash
# With .env file containing passwords
npm run dev:all

# Try logging in at http://localhost:4000
# Admin: GemMiner2025!
# Mod: GemGoblin2025!
```

### Test on Cloudflare
1. Deploy to Cloudflare Workers
2. Visit your Cloudflare URL
3. Try admin login with same passwords
4. Should work! ✅

---

## Security Checklist

- ✅ `.env` file is git ignored (never committed)
- ✅ `.env.example` shows structure for developers
- ✅ Passwords stored in environment (not hardcoded)
- ✅ Cloudflare env vars set for production
- ✅ Backend-only passwords (no VITE_ prefix)
- ✅ Session tokens used for API calls (not passwords)

---

## Troubleshooting

### "Invalid credentials" after deploying to Cloudflare
- Verify passwords are set in Cloudflare environment variables
- Check variable names exactly: `ADMIN_PASSWORD`, `MOD_PASSWORD`
- Redeploy after changing variables
- Check console for warnings about fallback passwords

### Local development works, but Cloudflare doesn't
- Ensure `.env` file exists locally (not in git)
- Cloudflare env vars must be set manually in dashboard
- Different passwords? Make sure they match

### Can't find Environment Variables section
- Check you're in the right project (Workers)
- Look for **Settings** tab at top
- Scroll down on Settings page
