# AI Testing Strategy

> **Document:** `ai-testing-strategy.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** Ã°Å¸â€â€ž Draft | **Owner:** AI Architect | **Review Cadence:** Monthly  
> **Related:** [TestingArchitecture.md](./TestingArchitecture.md) | [AI Requirements (PRD Ã‚Â§18)](../product/ProductRequirements.md#18-ai-requirements)

---

## Current State Assessment

The AI service (`apps/ai/`) is a FastAPI application that is **partially implemented**. The following reflects actual (not aspirational) capabilities:

| Component | Status | Notes |
|-----------|--------|-------|
| FastAPI app skeleton | Ã¢Å“â€¦ Implemented | `app/main.py` with basic health endpoint |
| Embedding service | Ã¢ÂÅ’ Not implemented | Design exists in docs only |
| RAG pipeline | Ã¢ÂÅ’ Not implemented | Retrieval + generation not wired |
| Chat API | Ã¢ÂÅ’ Not implemented | No chat endpoint deployed |
| Cost controller | Ã¢ÂÅ’ Not implemented | No budget enforcement |
| Model router | Ã¢ÂÅ’ Not implemented | Single-model direct call only |
| LLM integration | Ã°Å¸Å¸Â¡ Partial | OpenAI SDK installed, no production usage |

**This strategy defines the testing approach for each component as it is built.** Sections marked "[PLANNED]" are not yet implemented.

---

## AI Test Types

```mermaid
graph LR
    A[AI System] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    A --> E[Hallucination Tests]
    A --> F[Safety Tests]
    A --> G[Performance Tests]
    B --> B1[Embedding Service]
    B --> B2[Cost Controller]
    B --> B3[Model Router]
    C --> C1[RAG Pipeline]
    C --> C2[Chat API]
    C --> C3[Vector DB Integration]
    D --> D1[Full Chat Flow]
    D --> D2[Error States]
    E --> E1[Factual Consistency]
    F --> F1[Prompt Injection]
    F --> F2[Content Filtering]
    G --> G1[TTFT < 500ms]
    G --> G2[Response Time < 5s]
```

## Testing Layers for AI Features

### 1. Unit Testing (AI Service)

Test individual components of the FastAPI service in isolation.

| Component | Test Coverage | Priority | Status |
|-----------|--------------|----------|--------|
| **Embedding service** | Vector generation correctness, batch processing, error handling | High | Ã°Å¸â€Â´ Not started |
| **RAG service** | Retrieval accuracy, chunking logic, context window management | High | Ã°Å¸â€Â´ Not started |
| **Cost controller** | Budget enforcement at limits, spend tracking accuracy | Medium | Ã°Å¸â€Â´ Not started |
| **Model router** | Model selection by prompt type, fallback on failure | Medium | Ã°Å¸â€Â´ Not started |
| **Health endpoint** | Returns 200, reflects dependency status | Low | Ã°Å¸Å¸Â¢ Existing |

**Framework:** pytest with pytest-asyncio for async endpoint tests.  
**Location:** `apps/ai/tests/unit/`  
**CI trigger:** Every PR touching `apps/ai/`

### 2. Integration Testing (AI Pipeline) [PLANNED]

Test components working together with real dependencies.

| Test Suite | What It Covers | Status |
|------------|---------------|--------|
| RAG pipeline | End-to-end: embed query Ã¢â€ â€™ retrieve chunks Ã¢â€ â€™ generate answer | Ã°Å¸â€Â´ Not started |
| Chat API | Request/response cycle: validate input Ã¢â€ â€™ process Ã¢â€ â€™ format output | Ã°Å¸â€Â´ Not started |
| Context assembly | Verify context window management with variable-length inputs | Ã°Å¸â€Â´ Not started |
| Vector DB integration | Embed Ã¢â€ â€™ store Ã¢â€ â€™ search Ã¢â€ â€™ verify results | Ã°Å¸â€Â´ Not started |

**Framework:** pytest + httpx (async HTTP client).  
**Location:** `apps/ai/tests/integration/`  
**CI trigger:** Nightly (not on PR Ã¢â‚¬â€ too slow).

### 3. End-to-End Testing (AI Chat) [PLANNED]

Test the full user-facing flow through the web application.

| Test Case | What It Verifies | Status |
|-----------|------------------|--------|
| Full chat flow | Message typed Ã¢â€ â€™ AI responds Ã¢â€ â€™ response displayed in UI | Ã°Å¸â€Â´ Not started |
| Error: API down | AI service unavailable Ã¢â€ â€™ friendly error message shown | Ã°Å¸â€Â´ Not started |
| Error: timeout | Slow LLM response Ã¢â€ â€™ timeout handling Ã¢â€ â€™ retry or fallback | Ã°Å¸â€Â´ Not started |
| Error: invalid response | Malformed LLM output Ã¢â€ â€™ graceful degradation | Ã°Å¸â€Â´ Not started |
| Rate limiting | User exceeds limit Ã¢â€ â€™ 429 displayed correctly | Ã°Å¸â€Â´ Not started |
| Empty state | No messages yet Ã¢â€ â€™ welcome prompt displayed | Ã°Å¸â€Â´ Not started |

**Framework:** Playwright (via existing `apps/web` E2E setup).  
**Location:** `apps/web/e2e/ai-chat.spec.ts`  
**CI trigger:** Nightly.

### 4. Evaluation Testing [PLANNED]

Measure quality and performance metrics Ã¢â‚¬â€ distinct from pass/fail unit tests.

| Metric | Target | Measurement Method | Status |
|--------|--------|-------------------|--------|
| **Precision@K** | > 0.8 | Retrieved relevant chunks / total retrieved | Ã°Å¸â€Â´ Not started |
| **Recall@K** | > 0.7 | Retrieved relevant chunks / total relevant | Ã°Å¸â€Â´ Not started |
| **Mean Reciprocal Rank (MRR)** | > 0.85 | Rank position of first relevant result | Ã°Å¸â€Â´ Not started |
| **Response relevance** | > 4/5 avg | Human eval or LLM-as-judge scoring | Ã°Å¸â€Â´ Not started |
| **Hallucination rate** | < 5% | Factual consistency checks against source | Ã°Å¸â€Â´ Not started |
| **TTFT (time to first token)** | < 500ms (P95) | Instrumented in middleware | Ã°Å¸â€Â´ Not started |
| **Total response time** | < 5s (P95) | Instrumented in middleware | Ã°Å¸â€Â´ Not started |
| **Monthly LLM cost** | < budget | Cost controller logs | Ã°Å¸â€Â´ Not started |

**Eval framework:** Custom pytest suite in `apps/ai/tests/eval/`.  
**CI trigger:** Weekly (Sundays). Results posted to Slack.

---

## Test Data Management

### Embeddings Test Dataset [PLANNED]

- Curated set of 50 portfolio-relevant Q&A pairs
- Mix of factual (project details), conceptual (architecture decisions), and edge cases
- Stored in `apps/ai/tests/fixtures/qa-pairs.json`
- Each pair has: `question`, `expected_answer`, `source_chunks`, `difficulty`

### LLM Response Mocking

- Use `pytest-recording` (vcr.py) to record/replay LLM API responses
- Recorded cassettes stored in `apps/ai/tests/cassettes/`
- Redact API keys from recorded responses before committing
- Re-record cassettes when prompts or models change

### Factories

| Factory | Purpose | Status |
|---------|---------|--------|
| `EmbeddingFactory` | Generate deterministic embedding vectors for tests | Ã°Å¸â€Â´ Not started |
| `ChunkFactory` | Create document chunks with controlled overlap | Ã°Å¸â€Â´ Not started |
| `ContextFactory` | Build test context windows with specific token counts | Ã°Å¸â€Â´ Not started |

---

## CI/CD Integration

| Gate | Frequency | What Runs | Blocking? |
|------|-----------|-----------|-----------|
| **Unit tests** | Every PR touching `apps/ai/` | pytest unit suite | Ã¢Å“â€¦ Yes |
| **Type checking** | Every PR | mypy on `apps/ai/` | Ã¢Å“â€¦ Yes |
| **Integration tests** | Nightly | pytest integration suite | Ã¢ÂÅ’ No (report only) |
| **Eval suite** | Weekly (Sun) | pytest eval suite | Ã¢ÂÅ’ No (report only) |
| **Cost monitoring** | Daily (cron) | Budget check script | Ã¢ÂÅ’ Alert on overage |
| **Contract tests** | Every PR | Verify AI API response schema | Ã¢Å“â€¦ Yes |

### CI Steps (to be added to `.github/workflows/`)

```yaml
# ai-tests.yml (proposed)
# - Run: pytest apps/ai/tests/unit -v
# - Run: mypy apps/ai/
# - Run: pytest apps/ai/tests/contract/
```

---

## What We Have vs. What We Need

| Capability | Currently | Target (Q4 2026) |
|------------|-----------|------------------|
| Unit tests | Health endpoint only | All 5 components covered |
| Integration tests | None | RAG + Chat full pipeline |
| E2E tests | None | 6 Playwright test cases |
| Eval framework | None | Automated weekly scoring |
| Test data | None | Curated dataset + factories |
| CI integration | None | PR gate + nightly + weekly |
| Cost tracking | Manual | Automated daily |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM API costs for test suite too high | Medium | High | Use mock/record-replay for unit tests; eval runs limited to weekly |
| Non-deterministic LLM output causes flaky tests | High | Medium | Use semantic similarity assertions, not exact match; record/replay for deterministic CI |
| Staging AI service unavailable | Low | Medium | Tests should handle connection errors gracefully; mock by default |
| Embedding drift after model update | Medium | Medium | Re-record eval baselines on model change; track eval scores over time |

---

## AI Evaluation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat API
    participant M as LLM Model
    participant E as Evaluator
    participant DB as Results DB

    U->>C: Send Message
    C->>M: Forward Prompt
    M-->>C: Generate Response
    C-->>U: Stream Response
    C->>E: Send Response for Evaluation
    E->>E: Score Response
    E->>DB: Store Score
    DB-->>E: Historical Avg
    E-->>C: Pass / Fail
    alt Pass
        C-->>U: Ã¢Å“â€¦ Response Approved
    else Fail
        C-->>U: Ã¢Å¡Â Ã¯Â¸Â Response Flagged
        U->>C: Request Alternative
    end
```

*Document Version: 1.0 Ã¢â‚¬â€ AI Testing Strategy*  
*Status: Ã°Å¸â€â€ž Draft Ã¢â‚¬â€ not yet implemented. This document defines the testing strategy to be built alongside the AI service.*  
*Last Updated: July 2026*  
*Next Review Date: August 2026*

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system