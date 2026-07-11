# Database Failover Runbook

## Overview
Procedures for handling database primary failure, read replica promotion, and recovery.

## Architecture
- **Provider:** Supabase (PostgreSQL managed)
- **High Availability:** Supabase handles automatic failover for Pro plan+
- **Backup:** Daily automated backups, 7-day retention (free tier)
- **Point-in-Time Recovery:** Available on Pro plan

## Failover Scenarios

### Scenario 1: Database Connection Failure
**Symptoms:** API 503 errors, Prisma connection refused
**Check:**
1. Verify Supabase status: https://status.supabase.com
2. Check connection string in environment
3. Verify IP allowlist not blocking
4. Check connection pool exhaustion

**Resolution:**
1. Wait for Supabase auto-recovery (typically 2-5 min)
2. If prolonged: Contact Supabase support
3. If connection pool issue: Restart API to release connections

### Scenario 2: Data Corruption
**Symptoms:** Query errors, constraint violations, missing data
**Resolution:**
1. Identify affected time range
2. Restore from backup: Supabase Dashboard → Database → Backups
3. Apply any transactions after backup from logs
4. Verify data integrity

### Scenario 3: Full Outage
**Symptoms:** Complete database unavailability
**Check:**
1. Supabase status page
2. Project health in Supabase dashboard
3. Recent changes to schema or migrations

**Resolution:**
1. Follow Supabase incident response
2. If extended (>1 hour): Switch to read-only mode
3. Display maintenance page
4. Document incident for postmortem

## Recovery Verification
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# Check table accessibility
psql $DATABASE_URL -c "SELECT count(*) FROM information_schema.tables"

# Check recent migrations
cd apps/api && npx prisma migrate status

# Verify data integrity
cd apps/api && npx prisma db push --dry-run
```

## Backup Restoration
```bash
# List available backups
# Supabase Dashboard → Database → Backups

# Download backup (if manual restore needed)
# Then restore:
pg_restore -h <host> -U <user> -d <database> backup.dump
```
