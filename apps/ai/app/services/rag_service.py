from app.config import settings
from app.services.embedding_service import EmbeddingService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class RAGService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.embedding_service = EmbeddingService()
        
    async def retrieve(self, query: str, limit: int = 5) -> list[str]:
        # Generate embedding for the query
        query_embedding = await self.embedding_service.generate_embedding(query)
        
        # Convert embedding to string format for pgvector
        embedding_str = f"[{','.join(map(str, query_embedding))}]"
        
        # We assume the content_embeddings table has a 'vector' column added manually
        # since Prisma doesn't natively support it yet. 
        # Using cosine distance (<=>)
        sql = text("""
            SELECT chunk_text 
            FROM content_embeddings 
            ORDER BY vector <=> :embedding::vector 
            LIMIT :limit
        """)
        
        try:
            result = await self.db_session.execute(sql, {"embedding": embedding_str, "limit": limit})
            chunks = [row[0] for row in result.fetchall()]
            return chunks
        except Exception as e:
            # If pgvector isn't set up yet, fail gracefully
            print(f"RAG retrieval failed: {e}")
            return []

