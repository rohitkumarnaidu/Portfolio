# Local Development Troubleshooting Guide

**Last updated:** July 2026
**Audience:** Developers working on this portfolio monorepo

---

## 1. Environment Setup Issues

### 1.1 Node Version Mismatch

**Error:** `engine "node" is incompatible with this module` or cryptic build failures

**Solution:**
```bash
node --version   # Must be >= 18
nvm install 22   # Or use nvm-windows to manage versions
nvm use 22
```

The monorepo specifies `"node": ">=18"` in the root `package.json`. Using Node 20+ is recommended. Node 16 and below will fail.

### 1.2 npm Install Failures

**Symptoms:**

| Error | Likely Cause |
|-------|-------------|
| `ERESOLVE unable to resolve dependency tree` | Dependency conflicts in workspaces |
| `ECONNRESET` / `ETIMEDOUT` | Network issues, proxy, registry down |
| `EPERM` / `EACCES` | Permission issues (Windows: run as admin; Mac/Linux: don't use sudo) |
| `code EINTEGRITY` | Corrupted npm cache |

**Solutions (in order):**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules across all workspaces
npx rimraf node_modules packages/*/node_modules apps/*/node_modules

# 3. Reinstall from clean lockfile
npm ci

# 4. If npm ci fails, try full install (slower but resolves fresh)
npm install
```

**Windows-specific:** If you get path-length errors (`ENAMETOOLONG`), this is a known npm issue on Windows. Use `npm ci` instead of `npm install`, or enable long path support:

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### 1.3 Prisma Generate Failures

**Symptoms:** `npx prisma generate` fails, TypeScript can't find Prisma types, import errors from `../../generated/prisma`

**Causes:** Missing DATABASE_URL, custom output path not configured, schema file missing

**Solutions:**

```bash
# 1. Verify DATABASE_URL is set
echo $env:DATABASE_URL   # PowerShell
# postgresql://postgres:postgres@localhost:54322/postgres is the default

# 2. Navigate to API workspace
cd apps/api

# 3. Generate Prisma client (uses custom output path: generated/prisma)
npm run prisma:generate

# 4. If that fails, check the schema
npx prisma validate
```

**Important:** The Prisma client is generated to `apps/api/generated/prisma` (not `node_modules/.prisma/client`). This is configured in `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../generated/prisma"
}
```

Always run `npm run prisma:generate` after pulling schema changes or switching branches.

### 1.4 Port Conflicts

One of these errors means a port is already in use:

| Error | Port | Service |
|-------|------|---------|
| `EADDRINUSE :::3000` | 3000 | Next.js web |
| `EADDRINUSE :::3001` (or 4000) | 3001/4000 | NestJS API |
| `address already in use :::8000` | 8000 | FastAPI AI |
| `port already allocated 5432` | 5432 | PostgreSQL |
| `Could not connect to Redis at 127.0.0.1:6379` | 6379 | Redis |

**Solutions:**

```powershell
# Windows: Find what's using the port
netstat -ano | findstr :3000
# Look for the PID in the last column, then:
taskkill /PID <PID> /F

# Or change the port via environment variables
$env:WEB_PORT=3002
$env:API_PORT=4001
$env:AI_PORT=8001
```

**Docker port conflicts:** If Docker containers are running on the same ports:

```powershell
docker ps
docker stop <container-id>
```

---

## 2. Database Issues

### 2.1 "Can't Reach Database"

**Symptoms:** API returns 503, `PrismaClientInitializationError`, `connect ECONNREFUSED 127.0.0.1:5432`

**Checklist:**

```
□ Is Postgres running?    → docker ps | findstr postgres
□ Is DATABASE_URL set?    → echo $env:DATABASE_URL
□ Is it in config/.env?   → type config\.env  (copy from .env.example if missing)
□ Can you connect?        → npx prisma db push --dry-run  (from apps/api)
```

**Starting Postgres:**

```powershell
# Docker (recommended)
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres

# Or via Supabase CLI (if using local Supabase)
supabase start
```

### 2.2 Migration Failures

**Symptoms:** `"relation does not exist"`, `"column X of relation Y does not exist"`, `"migration has already been applied"`

**Causes:** Schema changed but migrations not applied, git merge conflicts in migration files

**Solutions:**

```powershell
# From apps/api directory

# 1. Check current migration state
npx prisma migrate status

# 2. Apply pending migrations
npx prisma migrate dev

# 3. If "already applied" error (merge conflict, detached from git):
npx prisma migrate resolve --applied <migration-name>

# 4. In emergency (will reset data):
npx prisma migrate reset
```

**Never** edit existing migration files. Always create a new migration via `npx prisma migrate dev --name <description>`.

### 2.3 Seed Failures

**Symptoms:** `npm run prisma:seed` fails, TypeScript errors in seed.ts

**Solutions:**

```powershell
# 1. Check seed.ts for errors
npx tsc --noEmit apps/api/prisma/seed.ts

# 2. Truncate tables before reseeding (to avoid unique constraint violations)
# Run this in your SQL client:
TRUNCATE TABLE "ChatConversation", "ChatMessage" CASCADE;

# 3. Run seed
npx prisma db seed
```

**Typical seed errors:**

| Error | Fix |
|-------|-----|
| `Unique constraint failed` | Truncate tables first, or use `upsert` instead of `create` |
| `Foreign key constraint fails` | Check insertion order — parent tables first |
| `Column "X" is of type Y but expression is of type Z` | Check Prisma schema type vs seed data type |

---

## 3. API Issues

### 3.1 401 Unauthorized

**Cause:** Missing or expired JWT token.

**Solutions:**

```
□ Re-login at /admin/login
□ Check localStorage for "admin_access_token" in browser dev tools
□ Token expiry: 15 minutes default. Use refresh token flow.
□ Is the token being sent? Check Authorization: Bearer <token> header
```

**Test with curl:**
```powershell
# Get token
$token = (curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"...\",\"password\":\"...\"}' | ConvertFrom-Json).data.accessToken

# Use token
curl -H "Authorization: Bearer $token" http://localhost:3001/api/admin/chat/conversations
```

### 3.2 403 Forbidden

**Cause:** Authenticated but wrong role. Endpoint requires a role you don't have.

**Check:**

```
□ What role does your user have? Check the Users table in Prisma Studio
□ What role does the endpoint require? Look at @Roles() decorator
  - admin: full access
  - editor: content management, no user management
  - viewer: read-only access
```

**Fix:** Update your role via Prisma Studio:
```powershell
npx prisma studio    # Navigate to Users table, update your role
```

### 3.3 429 Too Many Requests

**Cause:** Rate limited by `RateLimitMiddleware` (30 requests per 60 seconds per IP).

**Solution:** Wait 60 seconds. Check `Retry-After` header in the response.

### 3.4 CORS Errors

**Symptoms:** Browser console shows CORS errors when making API requests from the frontend

**Causes:** Request origin not whitelisted in the API's CORS configuration

**Solutions:**
```
□ Check CORS_ORIGIN env variable in config/.env
  - Development: NEXT_PUBLIC_API_URL should be a relative path ("/api")
  - Make sure your frontend origin (e.g., http://localhost:3000) is in the allowed origins list
□ Restart the API server after changing CORS_ORIGIN
□ For custom domains, add them to the CORS_ORIGIN comma-separated list
```

### 3.5 500 Internal Server Error

**Diagnostic steps:**
```
□ Check terminal running the API — stack trace is printed there
□ Check Sentry (if DSN is configured) — go to your Sentry dashboard
□ Enable debug logging: Set DEBUG=true in config/.env, restart
□ Check the request payload — Zod validation errors often look like 500s
```

**Common 500 causes:**
- Prisma query error (check your query matches schema)
- Missing environment variable (check config/.env against .env.example)
- Type error in service code (Prisma type mismatch)

---

## 4. Web Frontend Issues

### 4.1 "Module not found: @portfolio/shared"

**Cause:** Workspace packages not built.

**Solution:**
```powershell
# Build from root — this builds shared, ui, and config packages
npm run build

# Or build just the shared package
npm run build --workspace=packages/shared
```

This is required because `@portfolio/shared` is a TypeScript source package that needs to be compiled to JS before apps can import it.

### 4.2 Three.js / WebGL Errors

**Symptoms:** Blank 3D scene, `WEBGL NOT SUPPORTED`, `THREE.WebGLRenderer: Error`, canvas showing nothing

**Causes:**
- Browser GPU process crashed
- WebGL 2.0 not supported
- Outdated graphics drivers
- Hardware acceleration disabled

**Solutions:**
```
□ Check browser WebGL support: visit https://get.webgl.org/
□ Check console for GPU process errors
□ Disable WebGL in preferences: The 3D portfolio section still
  works as a non-3D fallback (check src/components/3d/ for fallback logic)
□ Update graphics drivers
□ Try a different browser (Chrome has best WebGL support)
```

### 4.3 Styles Not Loading

**Symptoms:** Unstyled HTML, missing Tailwind classes, layout broken

**Solutions:**
```powershell
# 1. Clear Next.js cache
Remove-Item -Recurse -Force apps/web/.next -ErrorAction SilentlyContinue

# 2. Restart the dev server
npm run dev:web

# 3. If using Docker, rebuild
docker compose build web
docker compose up -d web
```

### 4.4 TanStack Query Devtools Not Showing

Press the **Toggle Devtools** button (bottom-left corner, looks like a bug icon). If it's not there, check that:
- You're in development mode
- `NEXT_PUBLIC_DEBUG=true` is set in your environment

### 4.5 TypeScript Build Errors

**Symptoms:** `npx tsc --noEmit` fails, build process reports type errors

**Causes:** Strict TypeScript configuration catching type issues

**Solutions:**
```powershell
# Check type errors
npx tsc --noEmit

# Common issues:
# - Missing types for external packages (install @types/package-name)
# - `any` usage where explicit types are required
# - Null checks on optional properties
```

### 4.6 API Connection Refused (Client-Side)

**Symptom:** Fetch calls to `/api/...` fail, but the API is running.

**Cause:** The Next.js proxy isn't configured properly. In development, Next.js proxies `/api/...` requests to the NestJS API.

**Solutions:**
```
□ Check NEXT_PUBLIC_API_URL in config/.env
  - Client-side: should be relative (omit or use "/api")
  - Server-side: should be http://localhost:3001 (or 4000 in Docker)
□ Restart both web and API dev servers
```

---

## 5. AI Service Issues

### 5.1 Chat Not Responding

**Symptoms:** Chat widget shows "Connecting..." or no response, browser console shows failed fetch to `/api/chat`

**Diagnostic Checklist:**

```
□ Is FastAPI running?       → Check http://localhost:8000/api/health
□ Is the NestJS API running? → Check http://localhost:3001/api/health/liveness
□ Check AI service logs      → Look at terminal running uvicorn
□ Check NestJS logs          → Look for "Error proxying chat stream" messages
```

### 5.2 Chat Responses Are Slow

**Symptoms:** AI responses take a long time (>10s) to start or complete

**Causes:** Model inference time, network latency, API rate limiting

**Solutions:**
```
□ Check if streaming is working (Accept: text/event-stream)
□ Verify no rate limiting on the AI provider (check response headers)
□ Check cache hit rate — repeated identical queries should be cached
□ Verify the selected model — larger models (Sonnet, GPT-4) are slower than smaller ones (Haiku, GPT-4o-mini)
□ Check network latency to the AI provider's API endpoint
```

### 5.3 API Key Errors

**Symptoms:** `401 Unauthorized` from OpenAI, `AuthenticationError`, empty responses

**Check:**

```bash
# Are the keys set?
echo $OPENAI_API_KEY            # Should not be empty
echo $ANTHROPIC_API_KEY         # Optional — can be empty

# Check in config/.env
grep OPENAI_API_KEY config/.env
grep ANTHROPIC_API_KEY config/.env
```

**Common issues:**
- Key is expired — regenerate in OpenAI dashboard
- Key is from wrong organization — check OpenAI org ID
- Key has no credits — check billing in OpenAI dashboard
- `.env` file is in wrong location — must be at `config/.env` (monorepo root config)

### 5.3 Embedding Failures

**Symptoms:** Chat responds without context (no RAG), "RAG retrieval failed" in AI logs

**Causes:**

| Cause | Check |
|-------|-------|
| pgvector extension not enabled | `SELECT * FROM pg_extension WHERE extname='vector'` |
| content_embeddings table missing | `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='content_embeddings')` |
| No content ingested | `SELECT COUNT(*) FROM content_embeddings` |
| Embedding API key missing | Check `OPENAI_API_KEY` |
| Redis down (for cache) | `redis-cli ping` — expects PONG |

**Fixes:**
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Check the table exists
SELECT * FROM content_embeddings LIMIT 1;
```

### 5.4 Conversation Not Persisting

**Symptom:** Chat works but conversation history is lost on page refresh.

**Cause:** The NestJS `ChatService` saves messages to PostgreSQL, but if the AI service returns an error, the message is still saved in NestJS but the assistant response isn't persisted. The NestJS `streamChat` method only saves the user message — the AI response is streamed directly to the client without saving.

**Fix:** This is a known gap. The assistant response needs to be saved after streaming completes. Currently not implemented.

### 5.5 Agent (Sandbox) Not Working

**Symptom:** `POST /api/agent/code` returns 404 or empty response

**Check:**
```
□ Is the agent router mounted? → Look at main.py: app.include_router(agent.router, prefix="/api/agent")
□ Is the request correct?      → Requires file_content + instruction in JSON body
□ Is the model responding?     → Check FastAPI logs for streaming output
```

---

## 6. Docker Issues

### 6.1 Container Won't Start

**Symptoms:** `docker compose up -d` succeeds but container exits immediately, or stays in "starting" state

**Diagnostic:**
```bash
# Check all containers status
docker compose -f infrastructure/docker/docker-compose.yml ps

# View logs for the failing container
docker compose -f infrastructure/docker/docker-compose.yml logs web
docker compose -f infrastructure/docker/docker-compose.yml logs api
docker compose -f infrastructure/docker/docker-compose.yml logs ai
```

**Common causes:**
- Port mapping conflict (change `WEB_PORT`, `API_PORT`, `AI_PORT` in `.env`)
- Missing `.env` file (copy from `config/.env.example`)
- Node modules not installed in container (check volume mounts)

### 6.2 Health Check Failing

**Symptoms:** Container status shows "unhealthy", `docker ps` shows health check failing

**Health check endpoints:**

| Service | Health Check |
|---------|-------------|
| Web | `http://localhost:3000/health` |
| API | `http://localhost:3001/api/health/liveness` |
| AI | `http://localhost:8000/api/health` |

**Fixes:**
- **Web:** The health check uses `wget` inside the container. If it fails, the web app isn't serving on port 3000. Check startup logs.
- **API:** Same as web. Check NestJS compilation errors.
- **AI:** The `/api/health` endpoint returns `{"status": "ok", "database": "unknown", "llm_provider": "unknown"}`. If it's not responding, the FastAPI app failed to start.

### 6.3 Volume Mounting Issues

**Symptoms:** Changes to source code aren't reflected in the container, or container has stale code.

**Fix:**
```powershell
# Rebuild the container (clears cached layers)
docker compose -f infrastructure/docker/docker-compose.yml build --no-cache web

# For the AI service (no local Dockerfile — uses pip install directly),
# volume mount behavior depends on the Docker configuration.
# Check infrastructure/docker/docker-compose.yml for volume definitions.
```

**Windows-specific:** Volume mounts on Windows can have performance issues. If the dev server is slow in Docker, consider running natively (see Day 1 of developer-onboarding.md).

### 6.4 Postgres in Docker

**Connection string for local Docker Postgres:**
```
postgresql://postgres:postgres@localhost:54322/postgres
```

This is the default in `config/.env.example`. Port mapping: `54322:5432` (Docker host port : container port).

---

## 7. Git Issues

### 7.1 Husky Pre-commit Hooks Failing

**Symptoms:** `husky - pre-commit hook exited with code 1` (non-zero)

**Causes:** Lint-staged runs ESLint + Prettier on staged files. Any warning or error fails the commit.

**Solutions:**
```bash
# Fix lint errors
npm run lint

# Fix formatting
npm run format

# Or bypass hooks (emergency only — do not make a habit of this):
git commit --no-verify -m "message"
```

**If husky isn't running at all:**
```bash
npx husky install
```

### 7.2 Lint-Staged Specific Failures

| Error | Fix |
|-------|-----|
| `Prettier: File has been modified since last commit` | Stage the file again: `git add <file>` |
| `ESLint: X errors, Y warnings` | Run `npx eslint --fix <file>` on the failing files |
| `Unknown command: "lint-staged"` | `npm install` (lint-staged is a dev dependency) |

### 7.3 Merge Conflicts in package-lock.json

**Symptom:** `package-lock.json` has conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)

**Solution:**
```bash
# Don't manually edit package-lock.json!
# Regenerate it instead:
git checkout --theirs package-lock.json   # Accept one side
npm install                                # Regenerate
```

Or if both sides have incompatible changes:
```bash
git checkout --ours package-lock.json
npm install          # Regenerates with our changes + merges dependency updates
```

### 7.4 Migration File Conflicts

Prisma migration files are timestamped and WILL conflict during git merges.

**Fix:**
```bash
# 1. Accept one side's migration
git checkout --ours apps/api/prisma/migrations/<migration-folder>

# 2. Mark as applied in the database
cd apps/api
npx prisma migrate resolve --applied <migration-name>

# 3. Create a new migration for the combined changes
npx prisma migrate dev --name resolve-merge-conflicts
```

---

## Quick Diagnostic Commands

Run these from the repository root to quickly diagnose issues:

```bash
# Environment
node --version && npm --version && docker --version

# Service health
curl -s http://localhost:3001/api/health/liveness
curl -s http://localhost:3000/
curl -s http://localhost:8000/api/health

# Database
cd apps/api && npx prisma db push --dry-run

# Dependencies
npm ls --depth=0 2>/dev/null | head -20

# Disk space (if experiencing slow builds)
Get-PSDrive C | Select-Object Used, Free

# Docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Getting Help

If this guide doesn't solve your issue:

1. Search existing GitHub issues for the error message
2. Check Sentry (if configured) for stack traces
3. Ask in the team's dev channel — include:
   - Exact error message and stack trace
   - Steps to reproduce
   - Environment: OS, Node version, npm version, Docker version
   - Recent changes (git log --oneline -5)
