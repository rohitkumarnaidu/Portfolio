# Runbooks

This document contains standard operating procedures (Playbooks) for known failure modes in the Ultimate Portfolio system. On-call engineers should refer to these runbooks when alerted.

---

## 1. Playbook: API High Error Rate or Latency (NestJS)

**Trigger**: Alert `[SEV-2] NestJS API High Error Rate` or `[SEV-2] NestJS API High Latency` fires.
**Symptoms**: Users cannot load portfolio data, submit contact forms, or access the admin dashboard.

### Investigation Steps

1. **Check Datadog APM**:
   - Go to the `portfolio-api` service dashboard.
   - Identify which specific endpoints are failing or slow.
2. **Check Logs**:
   - Filter logs by `service:portfolio-api` and `level:ERROR`.
   - Look for recurring stack traces.
3. **Check Dependencies**:
   - Is the Database down? (Check Supabase health).
   - Is the AI Service down? (Check `portfolio-ai` metrics).
4. **Recent Changes**:
   - Check GitHub Actions/Vercel for recent deployments in the last 60 minutes.

### Mitigation Options

- **Bad Deployment**: If a recent deployment caused the spike, immediately trigger a rollback to the previous known good commit.
- **Traffic Spike / DDoS**: If traffic is unusually high, verify if it's legitimate or abusive. If abusive, apply rate limits via WAF/Cloudflare or block offending IPs.
- **Memory Leak**: If Node.js memory is maxed out, perform a rolling restart of the NestJS pods/containers.

---

## 2. Playbook: LLM API Rate Limit / Provider Failure

**Trigger**: Alert `[SEV-2] FastAPI - LLM Provider High Error Rate` fires.
**Symptoms**: The AI Chat feature is unresponsive or returning fallback errors.

### Investigation Steps

1. **Check FastAPI Logs**: Look for `HTTP 429 Too Many Requests` or `HTTP 502/503/504` from OpenAI/Anthropic.
2. **Check Provider Status**: Visit `status.openai.com` or the respective provider's status page to see if there is an ongoing global outage.
3. **Check Datadog Token Metrics**: Ensure we haven't hit a hard spending limit or anomalous usage spike.

### Mitigation Options

- **Provider Outage**: If OpenAI is down, toggle the feature flag `USE_FALLBACK_LLM` in PostHog/Config to switch routing to Anthropic (Claude) or a local fallback model if configured.
- **Rate Limit Reached**: If we hit our tier limits, log into the OpenAI dashboard and request a quota increase. Temporarily degrade the UI gracefully (e.g., show "AI is currently experiencing high demand, please try again later").

---

## 3. Playbook: Supabase Connection Pool Exhaustion

**Trigger**: Alert `[SEV-2] Database Connection Pool > 90%` fires.
**Symptoms**: NestJS API logs show `PrismaClientInitializationError` or timeouts connecting to the database.

### Investigation Steps

1. **Check Supabase Dashboard**: Log into Supabase, go to Database -> Metrics. Check active connections and pooler statistics.
2. **Check Postgres Locks**: Look for long-running transactions or deadlocks blocking other queries.
3. **Identify Culprit**: Use Datadog APM Database view to find queries with unusually long execution times or high execution counts (N+1 queries).

### Mitigation Options

- **Kill Blocking Queries**: If a rogue long-running query is locking tables, manually terminate it via Supabase SQL editor:
  ```sql
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid();
  ```
- **Scale PgBouncer**: Ensure Prisma is connecting to the Supabase connection pooler port (6543) and not the direct port (5432).
- **Scale Instance**: If CPU/RAM is maxed, temporarily upgrade the Supabase compute instance size.

---

## 4. Playbook: Next.js WebGL / R3F Crash

**Trigger**: Alert `[SEV-3] Sentry - High Rate of WebGL Context Lost` fires.
**Symptoms**: Users experience white screens or frozen 3D scenes on the frontend portfolio.

### Investigation Steps

1. **Check Sentry**: Group the errors by browser and device type. Are the crashes isolated to mobile devices (iOS Safari) or specific older GPUs?
2. **Check PostHog Session Replays**: Watch user sessions preceding the crash to see what interaction triggered it (e.g., loading a massive glTF model).

### Mitigation Options

- **Disable Heavy 3D Assets**: Use PostHog feature flags to toggle off high-resolution textures or complex particle systems for mobile devices.
- **Fallback to 2D**: If the issue is widespread, toggle the `ENABLE_3D_SCENE` feature flag to `false` to serve the 2D fallback HTML/CSS version of the portfolio until a hotfix is developed.

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
