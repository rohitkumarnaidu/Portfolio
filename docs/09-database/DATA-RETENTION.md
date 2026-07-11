# Data Retention Policy

This document outlines the data retention, archiving, and deletion policies for the Ultimate Portfolio database, ensuring compliance and optimal performance.

## Core Principles

1. **Minimize Data Footprint**: Only retain data that serves a direct business or portfolio purpose.
2. **Security & Privacy**: Adhere to privacy best practices (GDPR/CCPA principles) despite being a personal portfolio, especially regarding any visitor data.
3. **Auditability**: Maintain strict logs of administrative actions for a defined window.

## Soft Deletes vs. Hard Deletes

- **Portfolio Content (Projects, Posts, Experiences, Skills)**: Uses **Soft Deletes** (`deleted_at` timestamp). This allows for accidental deletion recovery. Soft-deleted items are excluded from public API responses.
- **AI Embeddings**: Uses **Hard Deletes**. When a project or post is updated/deleted, its corresponding vector embeddings are immediately hard-deleted and regenerated to prevent stale context in the AI pipeline.
- **Admin Users**: Uses **Soft Deletes**. Users are deactivated rather than deleted to preserve referential integrity in `AuditLogs` and `Posts`.

## Retention Schedules

| Data Category                | Retention Period | Archival/Purge Action                                                                |
| :--------------------------- | :--------------- | :----------------------------------------------------------------------------------- |
| **Active Portfolio Content** | Indefinite       | Retained as long as `deleted_at` is null.                                            |
| **Soft-Deleted Content**     | 30 Days          | Automatically hard-deleted by a scheduled cron job (NestJS `@Cron()`) after 30 days. |
| **Audit Logs**               | 90 Days          | Hard-deleted after 90 days. Aggregated metrics may be retained.                      |
| **AI Conversation History**  | 14 Days          | Chat history for the LangChain RAG agent is purged to save database space.           |
| **Orphaned Embeddings**      | Immediate        | Purged via database triggers or cascading deletes.                                   |

## Data Purging Mechanisms

- **NestJS Cron Jobs**: The `apps/api` service utilizes `@nestjs/schedule` to run daily cleanup tasks.
- **Cascade Rules**: Prisma schema enforces `onDelete: Cascade` where appropriate (e.g., deleting a `User` cascades to their `Sessions`, but restricts deletion if they have authored `Posts`).

## Compliance

Any contact form submissions or user data collected from public visitors is subject to immediate deletion upon request. General inquiries are retained for a maximum of 1 year.
