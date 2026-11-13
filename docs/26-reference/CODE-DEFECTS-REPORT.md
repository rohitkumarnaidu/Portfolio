# Code Defects Report

> **Purpose:** Catalog code-level defects discovered during documentation audit
> **Status:** 1 Open / 7 Closed | **Priority:** High

## Build-Breaking Issues

### B-001: Missing Admin Controllers (FIXED)

- **Files:** dashboard.controller.ts, activities.controller.ts, cleanup.controller.ts
- **Status:** ✅ FIXED — stub controllers created
- **Detail:** admin.module.ts imported 3 controllers that didn't exist on disk

### B-002: Missing AI Dockerfile (FIXED)

- **File:** apps/ai/Dockerfile
- **Status:** ✅ FIXED — Dockerfile created
- **Detail:** docker-compose referenced a non-existent Dockerfile

## Functional Defects

### F-001: Shared Types vs Prisma Mismatch

- **Status:** ✅ FIXED — Zod schemas added to packages/shared
- **Detail:** ChatConversationSchema, ChatMessageSchema, SendChatMessageSchema, ChatStreamChunkSchema created

### F-002: NestJS-AI API Contract Mismatch

- **Status:** ✅ FIXED — proxy now passes session_id, page_context; AI response persisted
- **Detail:** ChatService.streamChat() converts conversation.id→session_id, passes pageContext, accumulates SSE and saves assistant reply

### F-003: PII Filter is No-Op

- **Status:** ✅ FIXED — regex patterns for email, phone, IP, CC (Luhn), SSN, API keys; sanitize_text() utility
- **Detail:** PIIFilterMiddleware intercepts response body, runs 7 regex patterns, replaces matches with [EMAIL]/[PHONE]/[SSN]/[CC]/[IP]/[API_KEY]

### F-004: AI Stub Services

- **Status:** ✅ FIXED — all 4 stub services implemented
- **Detail:** cache_service.py (Redis+memory), cost_controller.py ($10 budget cap), analytics_service.py (structlog+ring buffer), conversation_manager.py (SQLAlchemy persistence)

### F-005: API Versioning Middleware Only

- **Status:** Open
- **Detail:** Version extraction from Accept header works but no controller checks req.apiVersion

## Configuration Defects

### C-001: NextAuth vars in .env.example

- **Status:** ✅ FIXED — replaced with JWT_SECRET
- **Detail:** NEXTAUTH_SECRET→JWT_SECRET, AI_API_URL added, OPENAI_API_KEY/ANTHROPIC_API_KEY added to shared env.ts

### C-002: PostHog vars in .env.example

- **Status:** ✅ FIXED — PostHog vars removed
- **Detail:** config/.env.example cleaned of POSTHOG_KEY, POSTHOG_HOST

### C-003: Supabase Client Dead Code

- **Status:** ✅ FIXED — supabase.ts deleted
- **Detail:** apps/api/src/lib/supabase.ts removed (zero imports existed)

## Cross-References

- MASTER-INDEX.md — Documentation master index
