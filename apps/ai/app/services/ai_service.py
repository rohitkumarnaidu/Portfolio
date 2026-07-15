from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.services.rag_service import RAGService
from app.services.model_router import ModelRouter


class AIService:
    def __init__(self, db_session, cache_service=None, cost_controller=None):
        self.db_session = db_session
        self.rag_service = RAGService(db_session)
        self.cache = cache_service
        self.cost = cost_controller
        self.model_router = ModelRouter()
        self._llm = None

        self.system_prompt = """You are the AI assistant for my professional portfolio. 
Your primary goal is to help visitors understand my skills, experience, and projects.
Be professional, concise, and helpful. 

Use the provided context to answer questions about me.
If you don't know the answer based on the context, politely say that you don't know and suggest they contact me directly.
Do NOT invent information about my experience or projects.

Context:
{context}
"""

    def _create_llm(self, model_name: str):
        if model_name.startswith("claude"):
            return ChatAnthropic(
                model=model_name,
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                streaming=True,
            )
        return ChatOpenAI(
            model=model_name,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            streaming=True,
        )

    async def get_chat_stream(self, message: str, history: list = None, page_context: str = None, complexity: str = "medium"):
        if history is None:
            history = []

        # 1. Check cache before RAG retrieval
        rag_cache_key = f"rag:{message}"
        context_chunks = None
        if self.cache:
            context_chunks = await self.cache.get(rag_cache_key)
        if context_chunks is None:
            context_chunks = await self.rag_service.retrieve(message)
            if self.cache and context_chunks:
                await self.cache.set(rag_cache_key, context_chunks, ttl=settings.CACHE_TTL_SECONDS)

        context_text = "\n\n".join(context_chunks) if context_chunks else ""

        if page_context:
            context_text += f"\n\nThe user is currently viewing this page: {page_context}"

        # 2. Check budget before LLM call
        if self.cost and not await self.cost.check_budget():
            yield "I'm sorry, the AI service is currently unavailable due to budget limits. Please try again later."
            return

        # 3. Select model via router
        model_name = self.model_router.get_model(complexity)
        llm = self._create_llm(model_name)

        # 4. Build prompt
        messages = [
            SystemMessage(content=self.system_prompt.format(context=context_text))
        ]

        for msg in history:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content")))

        messages.append(HumanMessage(content=message))

        # 5. Stream response and estimate token usage
        full_content = ""
        async for chunk in llm.astream(messages):
            content = chunk.content if hasattr(chunk, "content") else str(chunk)
            full_content += content
            yield content

        # 6. Track usage after LLM call
        if self.cost and full_content:
            token_estimate = (len(message) + len(full_content)) // 4
            await self.cost.track_usage(token_estimate, model_name)


