from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.services.rag_service import RAGService
import json

class AIService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.rag_service = RAGService(db_session)
        self.llm = ChatOpenAI(
            model=settings.OPENAI_CHAT_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            streaming=True
        )
        
        self.system_prompt = """You are the AI assistant for my professional portfolio. 
Your primary goal is to help visitors understand my skills, experience, and projects.
Be professional, concise, and helpful. 

Use the provided context to answer questions about me.
If you don't know the answer based on the context, politely say that you don't know and suggest they contact me directly.
Do NOT invent information about my experience or projects.

Context:
{context}
"""

    async def get_chat_stream(self, message: str, history: list = None, page_context: str = None):
        if history is None:
            history = []
            
        # 1. Retrieve context
        context_chunks = await self.rag_service.retrieve(message)
        context_text = "\n\n".join(context_chunks)
        
        if page_context:
            context_text += f"\n\nThe user is currently viewing this page: {page_context}"
            
        # 2. Build prompt
        messages = [
            SystemMessage(content=self.system_prompt.format(context=context_text))
        ]
        
        # Add history
        for msg in history:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content")))
                
        # Add current message
        messages.append(HumanMessage(content=message))
        
        # 3. Stream response
        async for chunk in self.llm.astream(messages):
            yield chunk.content
