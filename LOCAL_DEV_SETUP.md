# Local Development Setup - PostgreSQL

Since we migrated from SQLite to PostgreSQL, you need to set up PostgreSQL on your PC for local development.

## Option 1: Use Railway Database Directly (EASIEST)

**Recommended for quick development** - just point your local app to Railway's PostgreSQL.

1. **Get your Railway DATABASE_URL:**
   - Go to Railway dashboard
   - Click on your PostgreSQL database
   - Copy the `DATABASE_URL` connection string
   - It looks like: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

2. **Update your local `.env` file:**
   ```bash
   # Add this to your .env file
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

3. **That's it!** Your local dev will use the same database as production.

**⚠️ Warning:** You'll be sharing data with production. Test carefully!

---

## Option 2: Install PostgreSQL Locally (RECOMMENDED)

For isolated local development with your own database.

### Step 1: Install PostgreSQL

**Download PostgreSQL:**
- Go to https://www.postgresql.org/download/windows/
- Download the installer (latest version, e.g., PostgreSQL 16)
- Run the installer

**During Installation:**
1. Click Next through the setup
2. Choose installation directory (default is fine)
3. Select components: Install **PostgreSQL Server** + **pgAdmin 4** (GUI tool)
4. Choose data directory (default is fine)
5. **Set a password** - remember this! (e.g., `admin123` for local dev)
6. Port: Keep default `5432`
7. Locale: Default
8. Finish installation

### Step 2: Create Database

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to PostgreSQL (it'll ask for the password you set)
3. Right-click **Databases** → **Create** → **Database**
4. Database name: `codequarry`
5. Owner: `postgres`
6. Click **Save**

**Option B: Using Command Line**
```bash
# Open Command Prompt or PowerShell
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted

# Create database
CREATE DATABASE codequarry;

# List databases to verify
\l

# Exit
\q
```

### Step 3: Configure Your Local .env

Update your `.env` file:
```bash
# Local PostgreSQL connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/codequarry

# Example with password "admin123":
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/codequarry

# Rest of your .env stays the same
NODE_ENV=development
PORT=5000
API_ENDPOINT=https://emkc.org/api/v2/piston/execute
CORS_ORIGIN=http://localhost:4000
ADMIN_PASSWORD=your_admin_pass
MOD_PASSWORD=your_mod_pass
```

### Step 4: Test It

```bash
# Start your backend server
npm run server

# You should see:
# ✅ Connected to PostgreSQL database
# ✅ Database tables initialized
# 🚀 Server running on port 5000
```

If you see those messages, you're good to go!

---

## Option 3: Use Docker (ADVANCED)

If you prefer Docker for local development:

```bash
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name codequarry-postgres -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=codequarry -p 5432:5432 -d postgres:16

# Your DATABASE_URL:
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/codequarry
```

---

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- Make sure PostgreSQL service is running
- Windows: Check Services (Win+R → `services.msc`) → Look for `postgresql-x64-16`
- If not running, right-click → Start

### "password authentication failed"
- Check your password in DATABASE_URL matches the one you set during installation
- Default username is `postgres`

### "database does not exist"
- You forgot to create the database
- Run: `CREATE DATABASE codequarry;` in psql or pgAdmin

### Tables not creating
- Check server logs for database connection errors
- Make sure DATABASE_URL is correct in .env
- Restart server after changing .env

### Port 5432 already in use
- Another PostgreSQL instance is running
- Change port in PostgreSQL config or use a different port:
  - `DATABASE_URL=postgresql://postgres:admin123@localhost:5433/codequarry`

---

## Viewing Your Data

**pgAdmin 4:**
1. Open pgAdmin
2. Connect to your server
3. Navigate to: Databases → codequarry → Schemas → public → Tables
4. Right-click any table → View/Edit Data → All Rows

**Command Line:**
```bash
psql -U postgres -d codequarry

# View users
SELECT * FROM users;

# View module progress
SELECT * FROM module_progress;

# Exit
\q
```

---

## Migration from SQLite (If You Had Local Data)

If you had local SQLite data you want to keep, you'll need to manually export/import:

1. **Old SQLite data is backed up** at `database-sqlite.js.backup`
2. For now, you'll start fresh with PostgreSQL
3. If you need to migrate old data, let me know and I can help script it

---

## Summary

**Easiest:** Option 1 - Use Railway database directly
**Best Practice:** Option 2 - Local PostgreSQL installation
**For Docker Users:** Option 3 - PostgreSQL in Docker

Once set up, everything else works the same - just run `npm run dev:all` and code as usual!
