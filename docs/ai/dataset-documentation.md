# Dataset Documentation: Portfolio Content Embeddings

## Dataset Overview
- **Name:** Portfolio Content Embeddings
- **Purpose:** Enable semantic search and RAG for the AI assistant
- **Created:** June 2026
- **Size:** Variable (grows with content)

## Data Sources
1. Blog posts (from `BlogPost` table)
2. Project descriptions (from `Project` table)
3. Skills and experience data
4. FAQ content (from `FAQ` table)

## Collection Process
- Content is extracted from the PostgreSQL database
- Chunked into segments (default: 500 tokens, 50 token overlap)
- Embedded using text-embedding-3-small
- Stored in `ContentEmbedding` table with pgvector

## Features
- sourceType: Type of source content
- sourceId: ID of the source record
- chunkIndex: Position within the source
- chunkText: The text chunk
- embedding: Vector representation (1536 dimensions)
- metadata: JSON with source metadata

## Preprocessing
- HTML/JSX tags removed from content
- Code blocks preserved
- Personal information excluded
- Content deduplication

## Usage
- RAG retrieval: Top-K similar chunks (default K=20, rerank to 5)
- Cache: Redis with 30-day TTL
- Refresh: On content create/update

## Maintenance
- Stale embeddings cleaned via scheduled job
- Retention: 90 days for analytics-related embeddings
- Archive: Per data retention policy

## Ethical Considerations
- Only public portfolio content is embedded
- No PII in embeddings
- Users can request content removal
