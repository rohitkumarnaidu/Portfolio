# Troubleshooting Guide

## Common Issues

### Database Issues

#### "Can't reach database server"
**Symptoms:** API returns 503, Prisma connection errors
**Causes:** PostgreSQL not running, wrong DATABASE_URL, network issue
**Solutions:**
1. Check if Docker is running: `docker ps`
2. Start PostgreSQL: `docker compose -f infrastructure/docker/docker-compose.yml up -d postgres`
3. Verify connection: `psql $DATABASE_URL -c "SELECT 1"`
4. Check `.env` has correct DATABASE_URL

#### "Relation does not exist"
**Symptoms:** Prisma query errors
**Causes:** Migrations not applied
**Solutions:**
1. Run `cd apps/api && npx prisma migrate dev`
2. Or deploy: `npx prisma migrate deploy`

#### Migration conflicts
**Symptoms:** "Migration has already been applied"
**Causes:** Git merge conflicts with migration files
**Solutions:**
1. Resolve migration file conflict
2. Run `npx prisma migrate resolve --applied <migration-name>`

### Frontend Issues

#### "Module not found: Can't resolve '@portfolio/shared'"
**Causes:** Workspace not linked, package not built
**Solutions:**
```bash
npm ci
cd packages/shared && npm run build
cd apps/web && npm run dev
```

#### Build fails with TypeScript errors
**Causes:** Strict TypeScript catching issues
**Solutions:**
- Check type errors: `npx tsc --noEmit`
- Common issues: missing types, `any` usage, null checks

#### Three.js/R3F not rendering
**Causes:** WebGL not supported, missing canvas
**Solutions:**
- Check browser WebGL support
- Verify device supports WebGL 2.0
- Check for console errors about GPU process

### API Issues

#### 401 Unauthorized on admin endpoints
**Causes:** Missing or expired JWT token
**Solutions:**
- Re-login at `/admin/login`
- Check localStorage `admin_access_token`
- Token may be expired (default 15min)

#### 429 Too Many Requests
**Causes:** Rate limiting triggered
**Solutions:**
- Wait 60 seconds before retrying
- Check rate limit headers in response
- If using API keys, verify you're including them properly

#### CORS errors
**Causes:** Origin not whitelisted
**Solutions:**
- Check `CORS_ORIGIN` env variable
- Add origin to the whitelist

### AI Service Issues

#### AI service returns 502
**Causes:** FastAPI service down, OpenAI/Anthropic API error
**Solutions:**
- Check `http://localhost:8000/health`
- Verify API keys in environment
- Check AI service logs

#### Chat responses are slow
**Causes:** Model inference time, network latency
**Solutions:**
- Check if using streaming (`Accept: text/event-stream`)
- Verify no rate limiting on the AI provider
- Check cache hit rate

## Diagnostic Commands

```bash
# Check all services are running
curl http://localhost:3001/api/health/liveness
curl http://localhost:3000/  # Should return 200
curl http://localhost:8000/health

# Check database connection
cd apps/api && npx prisma db push --dry-run

# Check environment variables
node -e "console.log(process.env.DATABASE_URL ? 'DB configured' : 'DB missing')"

# Check disk space
df -h

# Check memory usage
free -h  # Linux/Mac
```

## Getting Help
If none of the above solves your issue:
1. Search existing GitHub issues
2. Create a new issue with:
   - Full error message
   - Steps to reproduce
   - Environment details (Node version, OS, browser)
   - Recent changes
