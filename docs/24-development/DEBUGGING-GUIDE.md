# Debugging Guide

## Debugging Philosophy

Systematic approach: Isolate → Reproduce → Diagnose → Fix → Verify

## API Debugging

### Enable Debug Logging

```bash
# Set environment variable
export LOG_LEVEL=debug

# Or run with verbose output
npm run dev:api
```

### Common API Issues

**Issue: Request returns 400 Bad Request**

- Check validation error response body
- Verify request body matches expected schema
- Check for missing required fields
- Check content-type header (must be application/json)

**Issue: Request returns 500 Internal Server Error**

- Check Sentry for error details
- Check API logs: http://localhost:3001/api/health/liveness
- Check for unhandled promise rejections
- Verify database connectivity

### API Server-Side Debugging (VS Code)

1. Set breakpoints in NestJS service files
2. Run: `npm run dev:api` (with --inspect flag)
3. Attach VS Code debugger: "Attach to Node Process"
4. Make a request to the API

## Frontend Debugging

### React DevTools

- Install React Developer Tools browser extension
- Inspect component tree, props, state
- Check for re-render issues

### Network Tab

- Filter by `/api/` to see API calls
- Check request/response payloads
- Verify response status codes
- Check cache headers

### Console

```javascript
// Debug API calls
localStorage.debug = 'api:*';

// Check auth state
console.log(localStorage.getItem('admin_access_token'));

// Force re-fetch
window.location.reload();

// React Query devtools
// Press Ctrl+Shift+D to open React Query devtools
```

### 3D Debugging (Three.js)

```javascript
// Show performance stats
window.__R3F_STATS = true;

// Debug 3D scene
window.__R3F_DEBUG = true;
```

## Database Debugging

### View Queries

```bash
# Enable query logging in Prisma
# Set in .env: DEBUG=prisma:*

# Or use Prisma Studio
cd apps/api && npx prisma studio
```

### Check Migration Status

```bash
cd apps/api
npx prisma migrate status
npx prisma validate
```

### Slow Query Debugging

```sql
-- In Supabase SQL Editor
SELECT * FROM pg_stat_activity;
SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC;
```

## AI Service Debugging

```bash
# Check health
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'

# View logs
docker compose logs ai --tail 100
```

## Performance Debugging

### Lighthouse Audit

```bash
npx lighthouse http://localhost:3000 --view
```

### Bundle Analysis

```bash
cd apps/web
ANALYZE=true npm run build
# Opens bundle analyzer in browser
```

### Memory Leaks

```bash
# API
node --inspect --expose-gc apps/api/dist/main.js
# Then use Chrome DevTools Memory tab
```

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
