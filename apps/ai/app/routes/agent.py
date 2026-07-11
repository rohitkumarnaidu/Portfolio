from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.agent_service import AgentService

router = APIRouter()

class CodeRequest(BaseModel):
    file_content: str
    instruction: str

@router.post("/code")
async def agent_code_endpoint(request: CodeRequest):
    agent_service = AgentService()
    
    async def stream_generator():
        try:
            async for chunk in agent_service.get_code_stream(
                file_content=request.file_content,
                instruction=request.instruction
            ):
                yield f"data: {chunk}\n\n"
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"
            
    return StreamingResponse(stream_generator(), media_type="text/event-stream")
