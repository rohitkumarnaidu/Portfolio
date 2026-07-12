# AI Service Implementation Guide

> **Documentation for the actual `apps/ai` FastAPI service.**
> Cross-reference: [ADR-006: FastAPI for AI Service](../27-decisions/ADR-006-fastapi-ai.md)
> Status table: [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)

---

## Table of Contents

1. [Current State](#current-state)
2. [File Structure](#file-structure)
3. [How to Run Locally](#how-to-run-locally)
4. [Configuration](#configuration)
5. [Routes / Endpoints](#routes--endpoints)
6. [Services](#services)
7. [Middleware](#middleware)
8. [Database](#database)
9. [Adding a New Endpoint](#adding-a-new-endpoint)
10. [Adding a New Service](#adding-a-new-service)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Known Limitations](#known-limitations)
14. [Roadmap](#roadmap)

---

## Current State

The AI service (`apps/ai`) is a **FastAPI** application that provides:

| Capability | Status | Details |
|---|---|---|
| Health check | ✅ Working | `GET /api/health` — returns status, database state, LLM provider |
| Chat (streaming SSE) | ✅ Working | `POST /api/chat` — LangChain OpenAI streaming with RAG context |
| Analyze (stub) | ⚠️ Stub | `POST /api/analyze` — returns placeholder data |
| Suggest (stub) | ⚠️ Stub | `POST /api/suggest` — returns placeholder data |
| Agent Code Assistant | ✅ Working | `POST /api/agent/code` — streaming code assistant for admin sandbox |
| RAG Pipeline | ✅ Coded | Embedding generation, pgvector retrieval, chunk ingestion all implemented |
| Rate Limiting | ✅ Working | In-memory per-IP rate limiter (30 req/min) |
| Input Sanitizer | ⚠️ Basic | Length check only |
| PII Filter | ❌ Passthrough | Registered but does nothing |
| Analytics | ❌ Stub | `AnalyticsService` is a no-op |
| Cache | ❌ Stub | `CacheService` returns `None` for all keys |
| Cost Controller | ❌ Stub | `CostController` allows everything |
| Conversation Manager | ❌ Stub | `ConversationManager` returns empty history |

> **Important:** The service is functional but several supporting services are stubs awaiting real implementations (Redis for cache, database-backed analytics, proper PII detection).

---

## File Structure

```
apps/ai/
├── requirements.txt              # Python dependencies
├── package.json                  # npm wrapper (start/lint scripts)
└── app/
    ├── __init__.py
    ├── main.py                   # FastAPI app, lifespan, middleware, router registration
    ├── config.py                 # Pydantic Settings (env-based config)
    ├── database.py               # SQLAlchemy async engine + session factory
    ├── routes/
    │   ├── __init__.py
    │   ├── chat.py               # POST /api/chat (streaming SSE)
    │   ├── analyze.py            # POST /api/analyze (stub)
    │   ├── suggest.py            # POST /api/suggest (stub)
    │   ├── health.py             # GET /api/health
    │   └── agent.py              # POST /api/agent/code (streaming SSE)
    ├── services/
    │   ├── __init__.py
    │   ├── ai_service.py         # LangChain chat streaming + RAG context
    │   ├── agent_service.py      # LangChain code assistant streaming
    │   ├── rag_service.py        # pgvector similarity search
    │   ├── embedding_service.py  # OpenAI embeddings (with mock fallback)
    │   ├── ingestion_service.py  # Chunk → embed → store pipeline
    │   ├── model_router.py       # Tiered model selection (low/medium/high)
    │   ├── cache_service.py      # Stub (no-op)
    │   ├── cost_controller.py    # Stub (always allows)
    │   ├── analytics_service.py  # Stub (no-op)
    │   └── conversation_manager.py # Stub (returns empty)
    └── middleware/
        ├── __init__.py
        ├── rate_limit.py         # In-memory per-IP rate limiter
        ├── input_sanitizer.py    # Content-length check
        └── pii_filter.py         # Passthrough (no filtering)
```

---

## How to Run Locally

```bash
# From repo root
npm run dev:ai

# Or directly from apps/ai/
cd apps/ai
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The service starts on **port 8000**. API docs at `http://localhost:8000/docs` when `DEBUG=true`.

### Required environment variables (in `config/.env`)

```env
# At minimum:
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@host:5432/portfolio

# Optional:
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379/0
```

Configuration is loaded via `pydantic-settings` from `.env`. See `app/config.py` for all options.

---

## Configuration

Defined in `app/config.py` as a `Settings` class loaded from environment variables:

| Category | Key | Default | Description |
|---|---|---|---|
| App | `APP_NAME` | "Portfolio AI" | Service name |
| App | `DEBUG` | `False` | Enable debug mode + /docs |
| App | `CORS_ORIGINS` | localhost:3000 | Allowed origins |
| Database | `DATABASE_URL` | — | PostgreSQL connection string |
| Database | `DATABASE_POOL_SIZE` | 10 | Connection pool size |
| OpenAI | `OPENAI_API_KEY` | — | Required for chat + embeddings |
| OpenAI | `OPENAI_CHAT_MODEL` | gpt-4o | Chat model ID |
| OpenAI | `OPENAI_EMBEDDING_MODEL` | text-embedding-3-small | Embedding model ID |
| Anthropic | `ANTHROPIC_API_KEY` | — | Optional fallback provider |
| Anthropic | `ANTHROPIC_CHAT_MODEL` | claude-sonnet-4-20250514 | Premium tier model |
| Redis | `REDIS_URL` | — | Optional cache backend |
| RAG | `CHUNK_SIZE` | 500 | Text chunk size |
| RAG | `TOP_K_VECTOR` | 20 | Vector search results |
| RAG | `RERANK_TOP_K` | 5 | Final reranked count |
| Rate Limit | `RATE_LIMIT_REQUESTS` | 30 | Requests per window |
| Budget | `MONTHLY_BUDGET_USD` | 10.0 | Monthly spending cap |

---

## Routes / Endpoints

### `GET /api/health`

Returns service health. Currently hardcoded to `"unknown"` for database and LLM provider.

```json
{ "status": "ok", "database": "unknown", "llm_provider": "unknown" }
```

### `POST /api/chat`

Streaming chat endpoint. Accepts a message, optional session_id, page_context, and history. Returns SSE stream of response chunks from the LLM, terminated by `data: [DONE]`.

- Uses `AIService` which calls `RAGService.retrieve()` for context, then streams from `ChatOpenAI`
- RAG context currently depends on `content_embeddings` table existing with pgvector extension

### `POST /api/analyze`

Stub. Accepts `content` and `analysis_type`. Returns:
```json
{ "score": 0, "suggestions": [], "metrics": {} }
```

### `POST /api/suggest`

Stub. Accepts `content` and `suggestion_type`. Returns:
```json
{ "suggestions": [], "original_content": "..." }
```

### `POST /api/agent/code`

Streaming code assistant for the Admin Sandbox IDE. Accepts `file_content` and `instruction`. Uses `AgentService` (lower temperature 0.2, higher max tokens 4000) to stream code suggestions.

---

## Services

### `AIService` (`ai_service.py`)

- Wraps `ChatOpenAI` with streaming
- On each request: retrieves RAG context, builds a system prompt with context, appends history, streams LLM response
- Uses `langchain-openai` for the LLM and `langchain-core` for message types

### `AgentService` (`agent_service.py`)

- Similar to AIService but specialized for code generation
- Lower temperature (0.2), higher max tokens (4000)
- Used by the Admin Sandbox Web IDE (`/admin/sandbox`)

### `RAGService` (`rag_service.py`)

- Accepts a query, generates embedding via `EmbeddingService`, runs pgvector cosine distance search (`<=>`) on `content_embeddings.vector`
- Gracefully fails (returns empty list) if pgvector extension isn't installed
- Raw SQL via SQLAlchemy `text()` — no ORM abstraction

### `EmbeddingService` (`embedding_service.py`)

- Wraps `OpenAIEmbeddings` from `langchain-openai`
- Fallback: returns zero vector `[0.0] * 1536` when no API key configured
- Supports both single (`aembed_query`) and batch (`aembed_documents`) modes

### `IngestionService` (`ingestion_service.py`)

- Splits content with `RecursiveCharacterTextSplitter` (500 chunk, 50 overlap)
- Batch-embeds all chunks
- Upserts into `content_embeddings` table via raw SQL

### `ModelRouter` (`model_router.py`)

- Three tiers: `low` → gpt-4o-mini, `medium` → configured chat model, `high` → Claude Sonnet (if Anthropic key set)

### Stub services (all no-ops):

- `CacheService` — `get()` returns `None`, `set()` does nothing
- `CostController` — `check_budget()` returns `True`, `track_usage()` does nothing
- `AnalyticsService` — `track_event()` does nothing
- `ConversationManager` — `get_history()` returns `[]`, `add_message()` does nothing

---

## Middleware

Applied in `main.py` in this order:

1. **CORSMiddleware** — standard FastAPI CORS from `settings.CORS_ORIGINS`
2. **RateLimitMiddleware** — in-memory sliding window (30 requests / 60 seconds per IP). Returns 429 with `Retry-After` header when exceeded.
3. **InputSanitizerMiddleware** — checks `Content-Length` header, rejects payloads exceeding ~8000 bytes with 413.
4. **PIIFilterMiddleware** — registered but is a complete passthrough. Intended to strip PII from requests/responses.

---

## Database

- **SQLAlchemy async engine** (`app/database.py`) with `asyncpg` driver
- Connection pooling: default pool_size=10, max_overflow=5
- Session factory exposed as FastAPI dependency (`get_db`) for route injection
- Expected tables (via API's Prisma schema + manual pgvector extension):
  - `content_embeddings` — custom table with `vector` column for pgvector
  - Chat/conversation models are managed by the NestJS API, not the AI service

### pgvector setup

The RAG and Ingestion services rely on the `pgvector` extension being installed on the Supabase PostgreSQL instance:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS content_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    vector VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_type, source_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_content_embeddings_vector ON content_embeddings USING ivfflat (vector vector_cosine_ops);
```

---

## Adding a New Endpoint

1. Create the route file in `app/routes/` (or add to existing):
```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MyRequest(BaseModel):
    field: str

@router.post("/my-endpoint")
async def my_endpoint(request: MyRequest):
    return {"result": "ok"}
```

2. Register in `app/main.py`:
```python
from app.routes import my_module
app.include_router(my_module.router, prefix="/api")
```

3. If the endpoint needs business logic, create a service in `app/services/` and inject it.

---

## Adding a New Service

1. Create the service class in `app/services/`:
```python
class MyService:
    def __init__(self, db_session=None):
        self.db_session = db_session

    async def do_something(self) -> str:
        return "hello"
```

2. Initialize in the `lifespan` handler in `main.py` if it needs app-wide state:
```python
app.state.my_service = MyService()
```

3. Or instantiate directly in the route handler for request-scoped services.

---

## Testing

There are **no tests** for the AI service currently. The `apps/ai/package.json` has no test script, and no pytest configuration exists.

### To add tests:

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Create tests/
mkdir -p tests
```

Recommended test structure:
```
tests/
├── conftest.py        # FastAPI TestClient fixtures
├── test_health.py     # Health endpoint tests
├── test_chat.py       # Chat endpoint tests (mock LLM)
├── test_agent.py      # Agent endpoint tests
├── services/
│   ├── test_rag.py
│   ├── test_embedding.py
│   └── test_ingestion.py
└── middleware/
    └── test_rate_limit.py
```

---

## Deployment

### Via Docker (recommended)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Via the monorepo's Turbo pipeline

The `npm run dev:ai` command starts uvicorn with hot-reload. For production, add a proper Docker build step to the Turborepo pipeline configuration.

### Required runtime dependencies:
- PostgreSQL 15+ with pgvector extension
- OpenAI API key (or Anthropic key for premium tier)
- (Optional) Redis for caching

---

## Known Limitations

1. **No tests** — zero test coverage across the entire `apps/ai` package
2. **Stub services** — CacheService, CostController, AnalyticsService, ConversationManager are all no-ops
3. **PII Filter is passthrough** — registered but does not filter any content
4. **Rate limiter is in-memory** — resets on service restart, doesn't work across multiple replicas
5. **Health endpoint is hardcoded** — returns `"unknown"` for database and LLM provider status
6. **No authentication** — the AI service has no auth middleware; it relies on the API gateway
7. **No conversation persistence** — ConversationManager is a stub; chat history is passed client-side
8. **pgvector required** — RAG/Ingestion fail silently if the extension isn't installed
9. **No Redis** — CacheService is a stub; no real caching for embeddings or responses
10. **No cost tracking** — CostController is a stub; monthly budget is not enforced
11. **No analytics** — AnalyticsService is a stub; no event tracking
12. **Python/TypeScript sync** — shared types between AI service and NestJS API must be manually kept in sync (see ADR-006 negative consequences)
13. **No CI pipeline** — Python linting and type checking are not integrated into the monorepo's CI

---

## Roadmap

| Priority | Feature | Depends on |
|---|---|---|
| P0 | Real health checks (DB ping, LLM connectivity) | — |
| P0 | Authentication middleware | Shared auth contract |
| P1 | Redis-backed cache for embeddings | Redis URL config |
| P1 | Conversation persistence in PostgreSQL | ConversationManager implementation |
| P1 | Cost tracking + budget enforcement | CostController implementation |
| P1 | Pytest test suite | Test framework setup |
| P2 | PII detection (regex + NLP) | PIIFilterMiddleware rewrite |
| P2 | Analytics pipeline | AnalyticsService + DB schema |
| P2 | Distributed rate limiting (Redis) | Redis URL config |
| P3 | Multi-agent orchestration | Full agent system design |
| P3 | Agent marketplace | Marketplace API spec |
| P3 | Prompt versioning system | Prompt library design |

---

> **Last updated:** July 2026  
> **Maintainer:** AI/ML team  
> **Related:** [ADR-006](../27-decisions/ADR-006-fastapi-ai.md), [AI Strategy](./strategy.md), [Model Decision Matrix](./model-decision-matrix.md)
