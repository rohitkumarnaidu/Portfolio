# Docker Compose Quickstart Guide

**Last updated:** July 2026
**Purpose:** Get the full stack running locally via Docker in under 5 minutes

---

## 1. Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Docker Desktop | Latest | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git Bash or PowerShell | — | `pwsh --version` or `bash --version` |
| RAM | 8 GB+ free | Docker + 3 services needs ~4 GB |

**Windows users:** Ensure WSL 2 is configured for Docker Desktop (Settings → Resources → WSL Integration). Use PowerShell or Git Bash for commands below.

---

## 2. Quick Start

```bash
# 1. From the repository root, copy the environment file
copy config\.env.example config\.env

# 2. Start all services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 3. Watch logs to confirm startup
docker compose -f infrastructure/docker/docker-compose.yml logs -f
```

Services are ready when you see:
- **Web:** `▲ Next.js ... Ready in XXXms` — takes ~30s first time
- **API:** `Nest application successfully started` — takes ~20s
- **AI:** `Uvicorn running on http://0.0.0.0:8000` — takes ~5s

```bash
# 4. Verify health
curl http://localhost:3001/api/health/liveness
# → {"status":"ok","info":{...}}

curl http://localhost:3000/
# → HTML (portfolio homepage)

curl http://localhost:8000/api/health
# → {"status":"ok","database":"unknown","llm_provider":"unknown"}

# 5. Stop when done
docker compose -f infrastructure/docker/docker-compose.yml down
```

---

## 3. Services

### Service Overview

| Service | Internal Port | Host Port (default) | Health Check | Purpose |
|---------|--------------|---------------------|-------------|---------|
| **web** | 3000 | **3000** | `GET /health` | Next.js frontend |
| **api** | 3001 | **4000** | `GET /api/health/liveness` | NestJS REST API |
| **ai** | 8000 | **8000** | `GET /api/health` | FastAPI AI service |

**Note:** The API's host port is **4000** (mapped from internal 3001) to avoid conflict with the web service. The web service connects to the API via `NEXT_PUBLIC_API_URL=http://localhost:4000`.

### Service Dependencies

```
web ──depends-on──▶ api ──(calls)──▶ ai
                        │
                        └──(uses)──▶ PostgreSQL
```

**Not included in Docker Compose:**
- **Redis** — Redis is required for caching and queues; see the architecture docs for details. The `CacheService` and BullMQ queues depend on Redis.
- **pgvector** — the `content_embeddings` table uses pgvector, but it must be enabled separately in your PostgreSQL instance. Run `CREATE EXTENSION IF NOT EXISTS vector;`.

### Default URLs

| Service | Local URL |
|---------|-----------|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000 |
| API Swagger | http://localhost:4000/api/docs |
| AI (FastAPI) | http://localhost:8000 |
| AI Docs | http://localhost:8000/docs (if `DEBUG=true`) |

---

## 4. Common Commands

### Starting and Stopping

```bash
# Start all services in background
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Start specific service
docker compose -f infrastructure/docker/docker-compose.yml up -d api

# Stop all services (keeps containers, volumes intact)
docker compose -f infrastructure/docker/docker-compose.yml stop

# Stop and remove containers
docker compose -f infrastructure/docker/docker-compose.yml down

# Stop, remove containers, volumes, and orphans
docker compose -f infrastructure/docker/docker-compose.yml down -v --remove-orphans
```

### Rebuilding

```bash
# Rebuild a specific service (after dependency changes)
docker compose -f infrastructure/docker/docker-compose.yml build web

# Rebuild without cache (fresh install)
docker compose -f infrastructure/docker/docker-compose.yml build --no-cache web

# Rebuild and start
docker compose -f infrastructure/docker/docker-compose.yml up -d --build web
```

### Logs

```bash
# All services (follow)
docker compose -f infrastructure/docker/docker-compose.yml logs -f

# Specific service
docker compose -f infrastructure/docker/docker-compose.yml logs -f api

# Last 50 lines
docker compose -f infrastructure/docker/docker-compose.yml logs --tail=50 api
```

### Exec Into Containers

```bash
# Interactive shell
docker compose -f infrastructure/docker/docker-compose.yml exec api sh
docker compose -f infrastructure/docker/docker-compose.yml exec web sh

# Run a command without entering the container
docker compose -f infrastructure/docker/docker-compose.yml exec api npx prisma migrate status

# AI service (Python)
docker compose -f infrastructure/docker/docker-compose.yml exec ai python -c "print('hello from AI')"
```

### Database

```bash
# Run Prisma commands inside the API container
docker compose -f infrastructure/docker/docker-compose.yml exec api npx prisma studio
docker compose -f infrastructure/docker/docker-compose.yml exec api npm run prisma:generate
docker compose -f infrastructure/docker/docker-compose.yml exec api npx prisma migrate dev

# Direct psql (if you have it locally)
psql -h localhost -p 54322 -U postgres -d postgres
```

---

## 5. Environment Variables

### Configuration File

Copy `config/.env.example` to `config/.env` and adjust values:

```bash
copy config\.env.example config\.env
```

The `.env` file is loaded by Docker Compose automatically (referenced in the `env_file` directive of each service).

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:54322/postgres` | PostgreSQL connection string |
| `JWT_SECRET` | `dev-jwt-secret-change-in-production-min-32-chars!!` | JWT signing secret |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `OPENAI_API_KEY` | _(empty)_ | **Required for AI chat to work** |

### Port Overrides

Set these in `.env` to change host ports (useful when ports are already in use):

```env
WEB_PORT=3000           # Default
API_PORT=4000           # Default (maps to internal 3001)
AI_PORT=8000            # Default
```

The docker-compose.yml reads these with defaults:
```yaml
ports:
  - "${WEB_PORT:-3000}:3000"
  - "${API_PORT:-4000}:3001"
  - "${AI_PORT:-8000}:8000"
```

### Service-Specific Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | web | API URL for client-side fetch (default: `http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_URL` | web | Site URL (default: `http://localhost:3000`) |

---

## 6. Data Persistence

### Volumes

Defined in `docker-compose.yml`:

```yaml
volumes:
  supabase-data:
```

This volume persists PostgreSQL data across container restarts.

### What Persists

| Data | Location | Persists across `down`? |
|------|----------|----------------------|
| PostgreSQL data | Docker volume `supabase-data` | Yes |
| Chat messages | PostgreSQL (chat_messages table) | Yes |
| Conversations | PostgreSQL (chat_conversations table) | Yes |
| Content embeddings | PostgreSQL (content_embeddings table) | Yes |
| Node modules | Anonymous volume (`/app/node_modules`) | Only if volume is not removed |
| Next.js build cache | Anonymous volume (`/app/.next`) | Only if volume is not removed |
| NestJS build output | Anonymous volume (`/app/dist`) | Only if volume is not removed |
| Redis data | N/A (not in Docker Compose) | N/A |

### Reset Everything

```bash
# WARNING: This deletes ALL data
docker compose -f infrastructure/docker/docker-compose.yml down -v
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This removes volumes (`-v`), so PostgreSQL data is deleted. On next `up`, fresh databases are created.

---

## 7. Troubleshooting

### Port Conflicts

```powershell
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :8000

# Change ports in .env
WEB_PORT=3002
API_PORT=4001
AI_PORT=8001
```

### Containers Exit Immediately

```bash
# Check logs — the error is usually in the first few lines
docker compose -f infrastructure/docker/docker-compose.yml logs web | head -20
```

**Common causes:**
- Missing `.env` variables (copy from `.env.example`)
- Port already in use (change port in `.env`)
- Out of disk space (`docker system prune` to free space)

### Slow First Build

The first `docker compose up -d` is slow because all services build from scratch. Subsequent builds are faster due to Docker layer caching.

**Speed tips:**
- Use BuildKit caching: Docker Compose v2 uses BuildKit by default
- Add `cache_from` in build config (already configured for web and api referencing `ghcr.io`)
- Only build what you need: `docker compose build api` instead of `docker compose build`

### Volume Permission Issues

**Windows:** Files shared via WSL 2 may have permission issues. If you see `EACCES` errors inside containers:

```bash
# The NestJS Dockerfile uses user 1001 (nestjs)
# Check if your host files have correct ownership
# If permissions are wrong, you may need to:
docker compose exec api chown -R 1001:1001 /app
```

### Health Check Timeouts

If health checks always fail but the service seems to work:

```bash
# Increase the start period in docker-compose.yml
healthcheck:
  start_period: 30s   # Increase from 10s for slower machines
```

### Differences from Native Development

| Aspect | Docker | Native (npm run dev) |
|--------|--------|---------------------|
| API URL | http://localhost:4000 | http://localhost:3001 |
| Setup time | ~2 min (build) | ~30 sec (no build) |
| Hot reload | Slower (volume mount) | Instant |
| Data persistence | Via Docker volumes | Local PostgreSQL |
| Isolation | Complete (containers) | Depends on local setup |
| Debugging | Harder (inside container) | Easier (direct access) |

---

## 8. Architecture Quick Reference

```
infrastructure/docker/docker-compose.yml
├── web (Next.js, :3000)
│   └── depends_on: api
├── api (NestJS, :3001 → host :4000)
│   └── depends_on: (none — uses external PostgreSQL)
└── ai (FastAPI, :8000)
```

**Key ports at a glance:**

```
Host              Container            Service
:3000  ──mapped──▶ :3000              web (Next.js)
:4000  ──mapped──▶ :3001              api (NestJS)
:8000  ──mapped──▶ :8000              ai (FastAPI)
```

The API service connects to PostgreSQL using the `DATABASE_URL` in `.env`. By default, this points to a Supabase-hosted database (not a Docker container). To use a local Postgres in Docker, add a `postgres` service to `docker-compose.yml` and point `DATABASE_URL` to it.

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
