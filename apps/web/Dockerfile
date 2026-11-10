# syntax=docker/dockerfile:1
# Build context: repository root (npm workspaces + Turborepo).
FROM node:22-alpine AS builder

WORKDIR /repo

# `next.config.js` resolves the API proxy at build time for `output: standalone`.
ARG API_PROXY_TARGET=http://api:3001
ENV API_PROXY_TARGET=$API_PROXY_TARGET
ENV NEXT_TELEMETRY_DISABLED=1

# Workspace manifests and lockfile first so dependency layers cache well.
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/ai/package.json ./apps/ai/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN npm ci

COPY packages ./packages
COPY apps/web ./apps/web

RUN npm run build --workspace=apps/web

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# `outputFileTracingRoot` points at the repository root, so the standalone
# output mirrors the monorepo layout: apps/web/server.js + root node_modules.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "apps/web/server.js"]
