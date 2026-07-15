# Scalability Strategy

> **Document:** `SCALABILITY-STRATEGY.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Architecture Lead | **Review Cadence:** Quarterly
> **Classification:** Growth Planning | **Cross-References:** [PERFORMANCE-ARCHITECTURE.md](./PERFORMANCE-ARCHITECTURE.md) | [PERFORMANCE-BUDGET.md](./PERFORMANCE-BUDGET.md)

---

## 1. Current Scale Baseline

The portfolio platform is designed for its current organic growth trajectory. The architecture assumes gradual, predictable scaling rather than hockey-stick growth.

| Metric                 | Current Estimate | Growth Ceiling (Current Tier) | Next Tier Trigger     |
| ---------------------- | ---------------- | ----------------------------- | --------------------- |
| Monthly Visitors       | ~10K             | 50K                           | 50K+ monthly visitors |
| Monthly Page Views     | ~100K            | 500K                          | 500K+ page views      |
| AI Chat Sessions       | ~1K              | 10K                           | 10K+ sessions/month   |
| API Requests           | ~50K             | 300K                          | 300K+ requests/month  |
| Database Size          | ~100MB           | 500MB (Supabase Free)         | 500MB storage         |
| Concurrent Connections | ~5               | 15 (Supabase Free)            | 15 concurrent         |

---

## 2. Horizontal Scaling Architecture

Each service layer is independently scalable, allowing targeted resource allocation based on bottleneck analysis.

### 2.1 Frontend (Vercel Edge Network)

- **Auto-scaling:** Vercel Edge Network serves static assets and ISR pages from 40+ global regions with zero configuration
- **Request handling:** Each request is isolated; no server affinity needed
- **ISR benefits:** Incremental Static Regeneration offloads rendering to edge cache, reducing origin load
- **Limit:** Vercel Pro plan handles ~1M monthly visits before needing Enterprise plan

### 2.2 API (NestJS)

- **Stateless design:** NestJS API is horizontally scalable — no session affinity required
- **Containerization:** Docker images can be replicated behind a load balancer (HAProxy, Nginx, or Cloudflare Load Balancing)
- **Health checks:** `/api/health` endpoint for load balancer probing
- **Graceful shutdown:** SIGTERM handling for zero-downtime deployments

### 2.3 AI Service (FastAPI)

- **Stateless workers:** FastAPI is stateless by design — scale horizontally behind a queue
- **No GPU dependency:** All model inference is handled by OpenAI API, so scaling is about request throughput, not compute
- **Queue-backed:** BullMQ queue absorbs traffic spikes; workers process at sustainable rate

### 2.4 Database (Supabase Postgres)

| Plan       | Monthly Cost | Storage | Max Connections | Suitable For                 |
| ---------- | ------------ | ------- | --------------- | ---------------------------- |
| Free       | $0           | 500MB   | 15              | Development / < 10K visitors |
| Pro        | $25          | 8GB     | 120             | Production / < 100K visitors |
| Team       | $69          | 16GB    | 150             | Growth / < 500K visitors     |
| Enterprise | Custom       | Custom  | Custom          | > 500K visitors              |

### 2.5 Redis (Cache + Queue)

- **Purpose:** API response cache, BullMQ job queue, rate limit counters, session cache
- **Current:** Single instance (Upstash or Railway managed Redis)
- **Growth:** Cluster mode for sharded cache + queue isolation
- **HA:** Sentinel or managed failover for production

---

## 3. Database Scaling

### 3.1 Connection Pooling

PostgreSQL has a connection-per-worker limit. Connection pooling is the first scaling intervention.

| Strategy                     | Benefit                             | Implementation                                   |
| ---------------------------- | ----------------------------------- | ------------------------------------------------ |
| PgBouncer (Transaction mode) | Multiplex many connections into few | Supabase Pro includes built-in PgBouncer         |
| Prisma connection pool       | Limits concurrent Prisma queries    | Configure `connectionLimit` in Prisma datasource |
| Connection timeout           | Prevents connection exhaustion      | 5s connection timeout, 30s idle timeout          |

### 3.2 Query Optimization for Scale

- **Index strategy:** Composite indexes on `(published, created_at)` for listing queries; unique indexes on `slug`, `email`
- **N+1 elimination:** Eager loading via Prisma `include` or `JOIN` queries
- **Pagination:** Cursor-based pagination for large result sets (projects, blog posts, analytics)
- **Materialized views:** For analytics aggregation queries that run on a schedule

### 3.3 Read Replicas

When read traffic exceeds write traffic by >10:1, configure Supabase read replicas:

- Dedicated replica for portfolio/public queries
- Primary instance for admin mutations
- Replica lag acceptable (< 1s) for public content

---

## 4. API Scaling

### 4.1 Statelessness

NestJS controllers and services hold no in-memory session state. Authentication is token-based (JWT), so any instance can serve any request.

### 4.2 Rate Limiting (Multi-Tier)

| Tier          | Rate Limit          | Purpose                |
| ------------- | ------------------- | ---------------------- |
| Global        | 100 req/s per IP    | Prevent DDoS           |
| Portfolio API | 30 req/s per IP     | Public content         |
| Admin API     | 10 req/s per user   | Admin mutations        |
| AI Chat       | 5 req/s per session | Cost control           |
| Auth          | 3 req/min per IP    | Brute force prevention |

### 4.3 Caching Layers

- **Response cache (Redis):** Cache identical API responses for configurable TTL
- **CDN cache:** Cache-Control headers on GET endpoints
- **Data cache:** Prisma `unstable_cache` for database query results

---

## 5. AI Service Scaling

### 5.1 Stateless Workers

FastAPI workers are stateless — all state lives in Redis (conversation history) and PostgreSQL (vector embeddings).

### 5.2 Embedding Caching

- Compute embeddings once; cache in Redis with SHA-256 key of input text
- Cache hit rate target: > 60%
- Reduces OpenAI API costs proportionally

### 5.3 Queue-Based Processing

| Queue             | Purpose                         | Concurrency | Retries |
| ----------------- | ------------------------------- | ----------- | ------- |
| `ai-chat`         | Real-time chat messages         | 5 workers   | 2       |
| `ai-embedding`    | Background embedding generation | 2 workers   | 3       |
| `ai-non-critical` | Analysis, suggestions           | 1 worker    | 1       |

### 5.4 Cost Control

- Per-session token limits
- Daily spending cap
- Rate limit per IP/user
- Model tier downgrade under load (GPT-4o -> GPT-4o-mini)

---

## 6. Caching Strategy for Scale

| Layer                 | Cache Type             | Target Hit Rate | TTL                    | Invalidation           |
| --------------------- | ---------------------- | --------------- | ---------------------- | ---------------------- |
| Vercel Edge (CDN)     | ISR + static assets    | > 95%           | 60s (ISR), 1y (assets) | On-demand revalidation |
| Redis (Application)   | API responses, session | > 80%           | 30-300s                | TTL expiry + webhook   |
| Browser               | Immutable assets       | > 95%           | 365d                   | Content hash change    |
| OpenAI Response Cache | AI chat responses      | > 60%           | 1h                     | Semantic key expiry    |

---

## 7. Monitoring Thresholds & Scale Triggers

| Component        | Metric            | Warning  | Critical | Action                       |
| ---------------- | ----------------- | -------- | -------- | ---------------------------- |
| CDN              | Cache hit ratio   | < 90%    | < 80%    | Review cache rules           |
| API              | P95 response time | > 300ms  | > 500ms  | Scale API instances          |
| API              | Error rate        | > 0.5%   | > 1%     | Rollback recent deploy       |
| Database         | Connection usage  | > 70%    | > 90%    | Add PgBouncer / upgrade plan |
| Database         | Query P95         | > 100ms  | > 200ms  | Optimize queries / add index |
| Redis            | Memory usage      | > 70%    | > 85%    | Increase maxmemory / cluster |
| AI Service       | Queue depth       | > 100    | > 500    | Scale workers                |
| AI Service       | P95 TTFT          | > 1000ms | > 2000ms | Scale AI workers             |
| Monthly Visitors | Traffic volume    | > 30K    | > 50K    | Review plan upgrade          |

---

## 8. Cost Implications

| Tier            | Monthly Cost | Visitors | Infrastructure                                    |
| --------------- | ------------ | -------- | ------------------------------------------------- |
| **Development** | ~$0          | < 1K     | Vercel Hobby, Supabase Free, Railway $0           |
| **Launch**      | ~$25/mo      | < 10K    | Vercel Pro, Supabase Pro                          |
| **Growth**      | ~$100/mo     | < 100K   | Vercel Pro, Supabase Pro + Redis, Railway $20     |
| **Scale**       | ~$300/mo     | < 500K   | Vercel Enterprise, Supabase Team + read replicas  |
| **Enterprise**  | ~$1000+/mo   | > 500K   | Custom Vercel + Supabase, dedicated Redis cluster |

### 8.1 Cost Optimization Levers

- **Cache aggressively** — each 10% cache hit rate improvement reduces origin costs by ~15%
- **Image optimization** — WebP/AVIF reduces bandwidth costs by ~40%
- **AI response caching** — 60% cache hit rate cuts OpenAI costs by half
- **Connection pooling** — avoids unnecessary plan upgrades by maximizing connection efficiency
- **Auto-scaling limits** — set max replicas to prevent cost spikes under DDoS or viral traffic

---

## 9. Related Documents

- [PERFORMANCE-ARCHITECTURE.md](./PERFORMANCE-ARCHITECTURE.md) — Full performance architecture
- [PERFORMANCE-BUDGET.md](./PERFORMANCE-BUDGET.md) — Performance budgets and enforcement
- [PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md) — Optimization strategies
