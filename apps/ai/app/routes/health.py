from fastapi import APIRouter
from sqlalchemy import text
from app.database import async_session_maker
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    db_status = "healthy"
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    if settings.OPENAI_API_KEY:
        llm_provider = "openai"
    elif settings.ANTHROPIC_API_KEY:
        llm_provider = "anthropic"
    else:
        llm_provider = "none"

    return {
        "status": "ok",
        "database": db_status,
        "llm_provider": llm_provider,
    }
