from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SuggestRequest(BaseModel):
    content: str
    suggestion_type: str

@router.post("/suggest")
async def suggest(request: SuggestRequest):
    return {"suggestions": [], "original_content": request.content}
