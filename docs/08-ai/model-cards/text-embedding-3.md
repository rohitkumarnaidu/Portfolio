# Model Card: text-embedding-3-small

> **Status:** ✅ Active — reflects actual implementation

## Model Details
- **Provider:** OpenAI
- **Model:** text-embedding-3-small
- **Type:** Text Embedding Model
- **Dimensions:** 1536
- **Max Input:** 8191 tokens

## Intended Use
- Generate vector embeddings for RAG pipeline
- Content similarity search
- Knowledge base indexing

## Performance
- **Latency:** ~50-100ms per batch
- **Batch Size:** 10 (configurable)
- **Cost:** $0.02/1M tokens

## Storage
- Vectors stored in pgvector (`ContentEmbedding` model)
- HNSW index for fast similarity search
- Cache: Redis (30-day TTL)

## Cross-References
- [../../MASTER-INDEX.md](../../MASTER-INDEX.md) â€” Documentation master index
- [../../26-reference/CROSS-REFERENCE-INDEX.md](../../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
