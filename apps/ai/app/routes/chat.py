from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import AIService
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    page_context: Optional[str] = None
    history: Optional[list[dict]] = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    ai_service = AIService(db)
    
    async def stream_generator():
        try:
            async for chunk in ai_service.get_chat_stream(
                message=request.message,
                history=request.history,
                page_context=request.page_context
            ):
                yield f"data: {chunk}\n\n"
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"
            
    return StreamingResponse(stream_generator(), media_type="text/event-stream")

