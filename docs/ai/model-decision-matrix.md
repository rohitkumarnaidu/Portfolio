# AI Model Decision Matrix

**Last updated:** July 2026
**Purpose:** Guide model selection for portfolio AI features. Based on actual usage and pricing as of July 2026.

---

## 1. Primary Models

### Comparison Table

| Aspect | GPT-4o | Claude Sonnet 4 | text-embedding-3-small |
|--------|--------|-----------------|----------------------|
| **Provider** | OpenAI | Anthropic | OpenAI |
| **Purpose** | General chat, Q&A | Content analysis (large docs) | Embeddings for RAG |
| **Context Window** | 128K tokens | 200K tokens | N/A |
| **Max Output Tokens** | 16,384 | 8,192 | N/A |
| **Cost per 1M input tokens** | $2.50 | $3.00 | $0.02 |
| **Cost per 1M output tokens** | $10.00 | $15.00 | N/A |
| **Cost per 1M tokens (embedding)** | N/A | N/A | $0.02 |
| **Latency (avg first token)** | ~1.2s | ~1.5s | ~300ms |
| **Rate Limit** | 500 RPM (tier 1) | 1,000 RPM | 3,000 RPM |
| **Training Data Cutoff** | Oct 2023 | Apr 2025 | N/A |
| **Strengths** | Fast, broad knowledge, strong tool use, multimodal | Large context, nuanced analysis, lower refusal rate | Small embedding size (512d), fast, cheap |
| **Weaknesses** | Smaller context window, higher refusal rate on some topics | Slower first token, more expensive for simple tasks | Less accurate than text-embedding-3-large, but 20x cheaper per document |

### Detailed Model Cards

See separate documents for each model:
- `docs/ai/model-cards/gpt4o.md`
- `docs/ai/model-cards/claude-sonnet.md`
- `docs/ai/model-cards/text-embedding-3.md`

---

## 2. Supplemental Models

| Aspect | GPT-4o-mini |
|--------|-------------|
| **Provider** | OpenAI |
| **Purpose** | Budget tier, simple Q&A, classification |
| **Context Window** | 128K tokens |
| **Cost per 1M input tokens** | $0.15 (17x cheaper than GPT-4o) |
| **Cost per 1M output tokens** | $0.60 (17x cheaper) |
| **Latency** | ~0.8s first token |
| **Strengths** | Very cheap, fast, good for high-volume simple queries |
| **Weaknesses** | Less capable at complex reasoning, smaller knowledge base |

GPT-4o-mini is the default model in the `ModelRouter` (`apps/ai/app/services/model_router.py`) for complexity="low" queries. It handles ~60% of chat traffic by volume but only ~5% of total API cost.

### Candidate Models (Not Used)

| Model | Why Considered | Why Rejected (for now) |
|-------|---------------|----------------------|
| **GPT-4.1** | Potentially better reasoning | Not yet evaluated against current use cases |
| **Claude Opus 4** | Best-in-class for complex analysis | $15/M output tokens — not cost-justified for portfolio |
| **Gemini 2.5 Pro** | Competitive pricing, 1M context | Adds third-provider maintenance burden; no clear quality advantage |
| **text-embedding-3-large** | Higher accuracy (1536d vs 512d) | 5x cost increase for marginal accuracy gain on small dataset |
| **Cohere Embed v3** | Good multilingual support | No multilingual requirement; another API key to manage |
| **Local models (Llama 3, Mistral)** | No API costs | Quality/latency on consumer hardware too poor; GPU passthrough in Docker is complex |

---

## 3. Decision Flowchart

```
User Request
    │
    ▼
┌─────────────────────────────────────┐
│  Is this a code generation request   │
│  from the Admin Sandbox?            │
└──────────┬──────────────────────────┘
           │
    Yes ───┴───► GPT-4o (temp=0.2, max_tokens=4000)
           │
    No  ───┴───► ┌────────────────────────────────────┐
                 │  Is this an embedding operation?     │
                 └──────────┬──────────────────────────┘
                            │
                     Yes ───┴───► text-embedding-3-small → pgvector
                            │
                     No  ───┴───► ┌───────────────────────────────┐
                                  │  What complexity level?        │
                                  └──────────┬────────────────────┘
                                             │
                               "low" ────────┴───► GPT-4o-mini
                               "medium" ──────┴───► GPT-4o
                               "high" ────────┴───► Claude Sonnet 4
```

### Decision Rules (implemented in `ModelRouter`)

```python
def get_model(query_complexity: str = "low") -> str:
    if query_complexity == "low":
        return "gpt-4o-mini"           # Budget: 17x cheaper
    elif query_complexity == "medium":
        return "gpt-4o"                # Standard: good general quality
    elif query_complexity == "high":
        return "claude-sonnet-4"       # Premium: best for nuance
    return "gpt-4o"                    # Default safe fallback
```

**Note:** All current routes hardcode complexity="low". The complexity detection logic does not exist yet — this is a planned improvement.

### Heuristic Guidelines (for future complexity detection)

| Complexity | Indicators |
|-----------|-----------|
| **Low** | Navigation questions ("Where is your contact page?"), greeting ("Hi"), simple facts ("What stack do you use?") |
| **Medium** | Project comparisons ("How does Project X differ from Y?"), experience questions ("Tell me about your work at Company Z"), technical deep-dives |
| **High** | Large document analysis ("Summarize this 50-page paper"), multi-step reasoning ("Compare all blog posts about AI and extract themes"), nuanced opinion ("What are the tradeoffs of this architectural decision?") |

---

## 4. Budget Allocation

| Resource | Monthly Cap | Current Usage (July '26) | Alert At | Override At |
|----------|------------|------------------------|----------|-------------|
| OpenAI GPT-4o + GPT-4o-mini + embeddings | $10.00 | ~$2.50 | $7.00 | $9.00 |
| Anthropic Claude Sonnet | $5.00 | ~$0.50 | $3.50 | $4.50 |
| **Total AI AP** | **$15.00** | **~$3.00** | **$12.00** | **$13.50** |

### Cost Breakdown by Feature

| Feature | Model | Avg Cost/Request | Requests/Month | Monthly Cost |
|---------|-------|-----------------|----------------|-------------|
| Chat (simple) | GPT-4o-mini | $0.0003 | ~60 | $0.02 |
| Chat (standard) | GPT-4o | $0.005 | ~30 | $0.15 |
| Chat (analysis) | Claude Sonnet | $0.01 | ~10 | $0.10 |
| Embeddings | text-embedding-3-small | $0.00002 | ~200 | $0.004 |
| Sandbox coding | GPT-4o | $0.01 | ~20 | $0.20 |
| **Total** | | | **~320 requests** | **~$0.47/mo*** |

\* *This is the direct API cost per request. The estimated $3.00 total accounts for periodic higher-usage months, embedding batch operations, and ingestion jobs.*

### Budget Alert Flow

```
Normal ▼
  Usage > 70% cap → Slack notification, no action
Usage > 90% cap → Route all to gpt-4o-mini, send alert
Usage > 100% cap → Reject non-authenticated requests
```

**Current status:** This alert system is not implemented. The `CostController` is a stub. Budget monitoring relies on OpenAI's dashboard.

### Cost Optimization Levers

| Lever | Savings | Effort | Priority |
|-------|---------|--------|----------|
| Embedding cache (Redis) | ~40% on embedding costs | Medium (CacheService is stub) | High |
| Response caching | ~30% on chat costs | High | Medium |
| GPT-4o-mini as default | ~80% on simple queries | Low (already the default) | Done |
| Prompt compression | ~20% on token usage | Low | Low |
| Context pruning (vs sending full history) | ~30% on chat costs | Medium | Medium |

---

## 5. Performance Benchmarks

### Latency (p50, measured from FastAPI service)

| Model | First Token | Total (100 tokens) | Total (500 tokens) |
|-------|------------|-------------------|-------------------|
| GPT-4o-mini | ~0.8s | ~2.5s | ~4.0s |
| GPT-4o | ~1.2s | ~3.0s | ~5.5s |
| Claude Sonnet 4 | ~1.5s | ~3.5s | ~6.0s |
| text-embedding-3-small | ~0.3s (per doc) | N/A | N/A |

### Quality Benchmarks (subjective, internal)

| Task | GPT-4o-mini | GPT-4o | Claude Sonnet 4 |
|------|-------------|--------|-----------------|
| Portfolio Q&A (accuracy) | 7/10 | 9/10 | 9/10 |
| Large doc analysis (5k+ words) | 4/10 | 7/10 | 9/10 |
| Code generation | 6/10 | 9/10 | 8/10 |
| Opinion/advice | 5/10 | 7/10 | 9/10 |
| Factual recall | 8/10 | 9/10 | 8/10 |

### When to Re-evaluate

- **Monthly:** Review API spend against budget. Check if new model versions are available (OpenAI/Anthropic ship frequently).
- **Quarterly:** Re-run benchmarks with test queries. Re-evaluate model choices if a new model offers significantly better price/performance.
- **On roadmap trigger:** Whenever a new feature (e.g., content suggestions, agents) is implemented, revisit model selection for that feature.
