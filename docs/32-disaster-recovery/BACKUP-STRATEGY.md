# Backup and Recovery Strategy

## Backup Flow Diagram

```mermaid
flowchart LR
    A[Schedule] --> B[Snapshot]
    B --> C[Encrypt]
    C --> D[Store]
    D --> E[Verify]
    E --> F[Rotate]
```

This document details the disaster recovery mechanisms in place for the Ultimate Portfolio PostgreSQL database hosted on Supabase.

## Recovery Objectives

- **Recovery Point Objective (RPO)**: 1 hour (Maximum acceptable data loss in case of a catastrophic failure).
- **Recovery Time Objective (RTO)**: 4 hours (Maximum time required to restore the database to operational status).

## Backup Mechanisms

### 1. Point-in-Time Recovery (PITR)

Supabase provides automated Point-in-Time Recovery (PITR) via Write-Ahead Logging (WAL).

- **Retention**: 7 days of WAL archiving.
- **Granularity**: Allows rolling back the database to any specific second within the last 7 days.
- **Use Case**: Accidental data corruption, catastrophic bug in migration script, or malicious administrative action.

### 2. Daily Logical Backups

In addition to PITR, logical dumps (`pg_dump`) are taken daily.

- **Execution**: Automated via Supabase dashboard / GitHub Actions.
- **Storage**: Exported as `.sql` files and stored in an isolated, versioned AWS S3 / Google Cloud Storage bucket.
- **Retention**: Daily backups retained for 30 days; weekly backups retained for 3 months.

## Disaster Recovery Procedures

### Scenario A: Accidental Data Deletion (Minor)

_E.g., An admin accidentally deletes a critical blog post and the 30-day soft delete window has passed._

1. Restore a staging database instance from the last daily backup.
2. Extract the missing record using SQL.
3. Manually insert the extracted record into the production database.

### Scenario B: Database Corruption (Major)

_E.g., A Prisma migration goes wrong and corrupts multiple tables._

1. Trigger Supabase PITR from the management dashboard.
2. Select a timestamp exactly 5 minutes prior to the faulty migration deployment.
3. Wait for the restoration process to complete.
4. Verify data integrity via the staging API.
5. Update frontend routing if a database instance migration was required.

### Scenario C: Complete Region Outage

_E.g., The primary AWS region hosting the Supabase instance goes offline._

1. Provision a new Supabase project in an available region.
2. Apply Prisma schemas using `npx prisma migrate deploy` to reconstruct the schema.
3. Restore the latest daily `.sql` logical backup using `psql`.
4. Update `.env` variables (`DATABASE_URL`, `DIRECT_URL`) in Vercel and Railway/Render to point to the new instance.

## Testing and Verification

- **Quarterly Drills**: A dry-run of Scenario C is performed quarterly to ensure RTO is achievable.
- **Backup Integrity Checks**: Automated scripts test the restorability of daily `.sql` dumps in a CI/CD container weekly.

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
