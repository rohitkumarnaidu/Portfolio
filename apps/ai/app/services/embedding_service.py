from app.config import settings
from langchain_openai import OpenAIEmbeddings

class EmbeddingService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.embeddings = OpenAIEmbeddings(
                model=settings.OPENAI_EMBEDDING_MODEL,
                openai_api_key=settings.OPENAI_API_KEY
            )
        else:
            # Fallback if no key is provided (for local testing/dev without hitting API)
            self.embeddings = None
        
    async def generate_embedding(self, text: str) -> list[float]:
        if self.embeddings:
            return await self.embeddings.aembed_query(text)
        # Mock fallback
        return [0.0] * 1536
        
    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        if self.embeddings:
            return await self.embeddings.aembed_documents(texts)
        # Mock fallback
        return [[0.0] * 1536 for _ in texts]

