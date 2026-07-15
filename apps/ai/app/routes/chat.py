from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import AIService
from app.services.cache_service import CacheService
from app.services.conversation_manager import ConversationManager
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    page_context: Optional[str] = None
    history: Optional[list[dict]] = None


@router.post("/chat")
async def chat_endpoint(request: ChatRequest, http_request: Request, db: AsyncSession = Depends(get_db)):
    cache: CacheService = http_request.app.state.cache
    conversation_manager = ConversationManager()

    # Load history from ConversationManager instead of relying on client
    history = request.history or []
    if request.session_id and not history:
        history = await conversation_manager.get_history(request.session_id)

    # Cache check: return cached response if available
    cache_key = f"chat:{request.message}:{request.page_context}"
    cached_response = await cache.get(cache_key)
    if cached_response:
        async def cached_stream():
            for chunk in cached_response:
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(cached_stream(), media_type="text/event-stream")

    ai_service = AIService(db, cache_service=cache, cost_controller=http_request.app.state.cost)

    async def stream_generator():
        full_response = ""
        try:
            async for chunk in ai_service.get_chat_stream(
                message=request.message,
                history=history,
                page_context=request.page_context,
            ):
                full_response += chunk
                yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

            # Cache the full response for identical requests
            if full_response:
                await cache.set(cache_key, [full_response])

            # Persist messages via ConversationManager
            if request.session_id and full_response:
                await conversation_manager.add_message(request.session_id, "user", request.message)
                await conversation_manager.add_message(request.session_id, "assistant", full_response)
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
