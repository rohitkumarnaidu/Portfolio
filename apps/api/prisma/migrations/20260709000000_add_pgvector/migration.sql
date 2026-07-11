CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE content_embeddings ADD COLUMN embedding vector(1536);
