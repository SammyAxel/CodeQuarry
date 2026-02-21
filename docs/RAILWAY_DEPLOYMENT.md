# Railway Deployment Setup Guide

This guide walks you through deploying CodeQuarry on Railway with the new modular backend architecture.

## Prerequisites

- Railway account (railway.app)
- GitHub repository connected to Railway
- PostgreSQL database (can be created in Railway)

## Step-by-Step Deployment

### 1. Set Environment Variables in Railway

Go to your Railway project dashboard and add these environment variables:

```
# Database (Required - copy from PostgreSQL service in Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (Required - app will crash if missing)
ADMIN_PASSWORD=your_admin_password
MOD_PASSWORD=your_mod_password

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration (match your frontend URL)
CORS_ORIGIN=https://your-frontend-url.up.railway.app

# Code Compilation API
API_ENDPOINT=https://emkc.org/api/v2/piston/execute
```

**⚠️ CRITICAL:** If ADMIN_PASSWORD or MOD_PASSWORD are missing, the backend will crash immediately!

### 2. Configure Build & Start Commands

In Railway project settings, set:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server/index.js
```

(This matches the "web" process in Procfile)

### 3. Database Setup

If using Railway's PostgreSQL:

1. Create a PostgreSQL plugin in your Railway project
2. Copy the `DATABASE_URL` from the PostgreSQL service
3. Add it to your environment variables

The database tables will auto-initialize when the server starts (via `database/index.js`).

### 4. Deploy

Railway auto-deploys when you push to the connected GitHub branch (usually `main`).

To manually trigger:
- Push changes to GitHub
- Railway will automatically detect and deploy

OR use Railway CLI:
```bash
railway deploy
```

### 5. Verify Deployment

Check the Railway logs to ensure:
```
✅ Authentication passwords loaded from environment
✅ CodeQuarry API server running on http://...
✅ Connected to PostgreSQL database
✅ Database tables initialized
📚 Courses table has X courses
```

## Troubleshooting

### Server Crashes on Startup

**Problem:** Deployment succeeds but 404s on all API calls
**Likely Cause:** ADMIN_PASSWORD or MOD_PASSWORD not set
**Solution:**
1. Go to Railway dashboard → your backend service
2. Click "Variables" 
3. Ensure ADMIN_PASSWORD and MOD_PASSWORD are set
4. Click "Redeploy"

The backend will exit with code 1 if these passwords are missing!

### Database Connection Error

**Problem:** "Failed to connect to PostgreSQL"
**Solution:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running in Railway
- Ensure database exists and user has permissions

### Build Fails

**Problem:** "npm install failed" or "module not found"
**Solution:**
- Clear Railway cache and rebuild
- Check package.json has all required dependencies
- Verify Node.js version is 16+

## Frontend Configuration

The frontend (built with Vite) is served separately. For production:

1. Build frontend: `npm run build`
2. Deploy to Railway as separate service OR Vercel/Netlify
3. Set `VITE_API_URL` environment variable to point to your backend

**In `.env.production`:**
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

## File Structure

The modular backend structure is:

```
server/
├── index.js                    # Main entry point
├── config/constants.js         # Environment config
├── middleware/auth.middleware.js
└── routes/
    ├── auth.routes.js
    ├── users.routes.js
    ├── progress.routes.js
    ├── courses.routes.js
    ├── cosmetics.routes.js
    ├── admin.routes.js
    ├── translations.routes.js
    └── compile.routes.js

database/
├── connection.js
├── index.js
└── models/
    ├── User.js
    ├── Progress.js
    ├── Cosmetic.js
    ├── Course.js
    └── Admin.js
```

## API Endpoints

All endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/login`, `/api/auth/logout`
- **Users**: `/api/user/*` (registration, login, profile, password)
- **Progress**: `/api/user/progress/*` (tracking, stats, refinery)
- **Courses**: `/api/courses/*` (CRUD operations)
- **Cosmetics**: `/api/cosmetics/*` and `/api/user/cosmetics/*`
- **Admin**: `/api/admin/*` (user management, resets)
- **Translations**: `/api/translations/*` (i18n support)
- **Compile**: `/api/v1/compile-c` (code execution)

## Production Checklist

- [ ] Database credentials set in Railway
- [ ] Admin/Mod passwords configured
- [ ] CORS_ORIGIN set to frontend URL
- [ ] DATABASE_URL points to production database
- [ ] NODE_ENV=production
- [ ] Procfile configured (or start script in Railway)
- [ ] Build succeeds without errors
- [ ] Server logs show successful startup
- [ ] API endpoints respond with 200/401 (not 404)
- [ ] Frontend can authenticate and fetch data

## Rollback

If deployment fails:

1. Go to Railway project dashboard
2. View deployment history
3. Click "Redeploy" on a previous working version

OR revert on GitHub:
```bash
git revert HEAD
git push origin main
```

Railway will automatically deploy the reverted commit.
