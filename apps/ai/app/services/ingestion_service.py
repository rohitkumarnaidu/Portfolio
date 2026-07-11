from app.services.embedding_service import EmbeddingService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from langchain_text_splitters import RecursiveCharacterTextSplitter

class IngestionService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.embedding_service = EmbeddingService()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
        )
        
    async def ingest_content(self, source_type: str, source_id: str, content: str):
        # 1. Chunk content
        chunks = self.text_splitter.split_text(content)
        
        if not chunks:
            return
            
        # 2. Generate embeddings for all chunks in batch
        embeddings = await self.embedding_service.generate_embeddings_batch(chunks)
        
        # 3. Store in database
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            embedding_str = f"[{','.join(map(str, embedding))}]"
            
            sql = text("""
                INSERT INTO content_embeddings 
                (id, source_type, source_id, chunk_index, chunk_text, vector, updated_at)
                VALUES 
                (gen_random_uuid(), :source_type, :source_id, :chunk_index, :chunk_text, :vector::vector, NOW())
                ON CONFLICT (source_type, source_id, chunk_index) 
                DO UPDATE SET 
                chunk_text = EXCLUDED.chunk_text, 
                vector = EXCLUDED.vector,
                updated_at = NOW()
            """)
            
            await self.db_session.execute(sql, {
                "source_type": source_type,
                "source_id": source_id,
                "chunk_index": i,
                "chunk_text": chunk,
                "vector": embedding_str
            })
            
        await self.db_session.commit()

