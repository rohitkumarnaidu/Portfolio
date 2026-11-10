# syntax=docker/dockerfile:1
# Build context: repository root (npm workspaces + Turborepo).
FROM node:22-alpine AS builder

WORKDIR /repo

# Workspace manifests and lockfile first so dependency layers cache well.
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/ai/package.json ./apps/ai/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN npm ci

COPY apps/api ./apps/api

RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# The Prisma client is generated to apps/api/generated (custom output path),
# so the runtime image needs the generated client, schema, and Prisma CLI.
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/package.json ./package.json
COPY --from=builder /repo/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder /repo/apps/api/prisma ./prisma
COPY --from=builder /repo/apps/api/generated ./generated
COPY --from=builder /repo/apps/api/dist ./dist

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health/liveness || exit 1

# Apply pending migrations before serving. Safe to run on every start because
# `migrate deploy` is idempotent and only applies unapplied migrations.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
