# CodeQuarry Deployment Guide

This guide covers deploying CodeQuarry to production with separate frontend and backend hosting.

## Architecture Overview

CodeQuarry consists of two parts:
- **Frontend**: React SPA (Vite) - can be deployed to Cloudflare Pages, Netlify, Vercel, etc.
- **Backend**: Node.js Express server - needs to be deployed to a service that supports Node.js

## Prerequisites

- Node.js 18+ installed locally
- Git repository access
- Cloudflare account (or other static hosting for frontend)
- Backend hosting service (Railway, Render, Fly.io, VPS, etc.)

---

## Part 1: Backend Deployment

### Option A: Railway (Recommended - Free Tier Available)

1. **Prepare Backend**
   ```bash
   # Make sure package.json has start script
   "scripts": {
     "start": "node server.js",
     "server": "node server.js"
   }
   ```

2. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your CodeQuarry repository
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
   Go to your project → Variables tab and add:
   ```
   NODE_ENV=production
   PORT=5000
   ADMIN_PASSWORD=your_secure_admin_password
   MOD_PASSWORD=your_secure_mod_password
   CORS_ORIGIN=https://your-frontend-url.pages.dev
   API_ENDPOINT=https://emkc.org/api/v2/piston/execute
   ```

4. **Deploy**
   - Railway will automatically deploy
   - Copy your deployment URL (e.g., `https://codequarry-production.up.railway.app`)

### Option B: Render

1. **Create New Web Service**
   - Go to https://render.com
   - New → Web Service
   - Connect your GitHub repo

2. **Configure Service**
   - Name: `codequarry-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Add Environment Variables** (same as Railway above)

4. **Deploy** and copy your service URL

### Option C: VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/YourUsername/CodeQuarry.git
cd CodeQuarry

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Install PM2 for process management
sudo npm install -g pm2

# Start server
pm2 start server.js --name codequarry-backend

# Setup nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/codequarry

# Add nginx config (see below)
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.yourcodequarry.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Part 2: Frontend Deployment (Cloudflare Pages)

### 1. Prepare Frontend Build

Create `.env.production` file in project root:
```bash
# Replace with your actual backend URL from Part 1
VITE_API_URL=https://your-backend-url.railway.app

# Security settings (optional)
VITE_MAX_CODE_ATTEMPTS=100
VITE_SESSION_TIMEOUT=30
VITE_CODE_EXEC_TIMEOUT=5000
```

### 2. Test Local Production Build

```bash
npm run build
npm run preview
```

Visit http://localhost:4173 and test:
- Login/Registration
- C code compilation (this is what we're fixing!)
- Python/JavaScript execution
- Progress saving

### 3. Deploy to Cloudflare Pages

**Option A: Via Dashboard**

1. Go to https://dash.cloudflare.com
2. Pages → Create a project → Connect to Git
3. Select your CodeQuarry repository
4. Configure build:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_MAX_CODE_ATTEMPTS=100
   VITE_SESSION_TIMEOUT=30
   VITE_CODE_EXEC_TIMEOUT=5000
   ```
6. Click "Save and Deploy"

**Option B: Via Wrangler CLI**

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build for production
npm run build

# Deploy
wrangler pages deploy dist --project-name=codequarry

# Set environment variables
wrangler pages deployment tail codequarry
```

### 4. Update Backend CORS

After frontend is deployed, update your backend's `CORS_ORIGIN` environment variable:

```bash
# On Railway/Render dashboard
CORS_ORIGIN=https://codequarry.pages.dev

# If you have a custom domain
CORS_ORIGIN=https://www.yourcodequarry.com
```

**Important**: Redeploy the backend after changing CORS settings.

---

## Part 3: Database Setup (SQLite)

The SQLite database file (`codequarry.db`) is created automatically on first run.

### For VPS Deployment

```bash
# Database will be created in project root
# Make sure the directory is writable
chmod 755 /path/to/CodeQuarry
```

### For Railway/Render

Railway and Render support persistent volumes:

**Railway:**
- Project → Settings → Volumes
- Mount path: `/app/data`
- Update `database.js` to use: `path.join(__dirname, 'data', 'codequarry.db')`

**Render:**
- Service → Environment → Disks
- Mount path: `/data`
- Update database path accordingly

---

## Part 4: Custom Domain (Optional)

### Frontend Domain

1. In Cloudflare Pages:
   - Your Project → Custom domains
   - Add `www.yourcodequarry.com`
   - Follow DNS configuration instructions

### Backend Domain

**If using Railway:**
- Project → Settings → Domains
- Add custom domain
- Update DNS with CNAME record

**If using VPS with Nginx:**
- Configure SSL with Let's Encrypt:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d api.yourcodequarry.com
  ```

---

## Troubleshooting

### C Engine Falls Back to Parser

**Problem**: C code execution shows "Using parser fallback" instead of actual compilation.

**Solution**: 
1. Check if `VITE_API_URL` is set correctly in frontend
2. Check browser console for CORS errors
3. Verify backend is accessible: `curl https://your-backend-url/api/health`
4. Check backend logs for compilation errors

### CORS Errors

**Problem**: Browser shows "CORS policy" errors

**Solution**:
1. Make sure backend `CORS_ORIGIN` matches your exact frontend URL
2. No trailing slash: `https://codequarry.pages.dev` not `https://codequarry.pages.dev/`
3. Redeploy backend after changing environment variables

### Database Not Persisting

**Problem**: User data disappears after server restart

**Solution**:
1. For Railway/Render: Set up persistent volumes (see Part 3)
2. For VPS: Check file permissions on database directory
3. Verify `codequarry.db` file is being created

### Session Expired Immediately

**Problem**: Users get logged out right after login

**Solution**:
1. Check if cookies are being set (browser devtools → Application → Cookies)
2. Verify `VITE_API_URL` includes protocol: `https://` not just `//`
3. Make sure backend and frontend are both using HTTPS (or both HTTP in dev)

---

## Environment Variables Reference

### Backend (.env on server)

```bash
NODE_ENV=production
PORT=5000
ADMIN_PASSWORD=your_secret_admin_password
MOD_PASSWORD=your_secret_mod_password
CORS_ORIGIN=https://your-frontend-url.pages.dev
API_ENDPOINT=https://emkc.org/api/v2/piston/execute
```

### Frontend (Cloudflare Pages Environment Variables)

```bash
VITE_API_URL=https://your-backend-url.railway.app
VITE_MAX_CODE_ATTEMPTS=100
VITE_SESSION_TIMEOUT=30
VITE_CODE_EXEC_TIMEOUT=5000
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible and returns health check: `GET /api/health`
- [ ] Frontend loads without console errors
- [ ] User registration works
- [ ] User login works
- [ ] C code compiles (not parser fallback)
- [ ] Python code runs
- [ ] JavaScript code runs
- [ ] Progress saves to database
- [ ] Admin login works
- [ ] Module editor works (admin)
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates valid
- [ ] Database backups configured

---

## Monitoring & Maintenance

### Health Check Endpoint

Backend provides health check at `/api/health`:
```bash
curl https://your-backend-url/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-07T...",
  "environment": "production"
}
```

### Database Backups

**Automated backups** (recommended):
```bash
# Add to crontab
0 2 * * * cp /path/to/codequarry.db /path/to/backups/codequarry-$(date +\%Y\%m\%d).db
```

### Logs

**Railway**: Project → Deployments → View Logs

**Render**: Service → Logs

**VPS**: 
```bash
pm2 logs codequarry-backend
# or
journalctl -u codequarry -f
```

---

## Security Best Practices

1. **Never commit `.env` files** - they're in `.gitignore`
2. **Use strong passwords** for `ADMIN_PASSWORD` and `MOD_PASSWORD`
3. **Enable HTTPS** - both frontend and backend should use SSL
4. **Regular backups** - schedule automatic database backups
5. **Update dependencies** - run `npm audit` and fix vulnerabilities
6. **Monitor logs** - watch for suspicious activity
7. **Rate limiting** - built into the app, but consider adding at nginx/cloudflare level

---

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Verify all environment variables are set correctly
4. Test API endpoints with curl/Postman
5. Open an issue on GitHub with details

## Further Reading

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Railway Documentation](https://docs.railway.app/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
