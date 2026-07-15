import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import text

from app.database import async_session_maker

logger = logging.getLogger(__name__)


class ConversationManager:
    def __init__(self):
        self._tables_checked = False

    async def _ensure_tables(self):
        if self._tables_checked:
            return
        async with async_session_maker() as session:
            try:
                await session.execute(text("""
                    CREATE TABLE IF NOT EXISTS ai_conversations (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id VARCHAR NOT NULL,
                        page_context TEXT,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                """))
                await session.execute(text("""
                    CREATE TABLE IF NOT EXISTS ai_messages (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
                        role VARCHAR NOT NULL,
                        content TEXT NOT NULL,
                        tokens_used INT DEFAULT 0,
                        response_time_ms INT DEFAULT 0,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                """))
                await session.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
                """))
                await session.commit()
                self._tables_checked = True
                logger.info("conversation_manager tables ensured")
            except Exception as e:
                await session.rollback()
                logger.warning("conversation_manager could not create tables, continuing: %s", e)
                self._tables_checked = True

    async def create_conversation(self, session_id: str, page_context: Optional[str] = None) -> dict:
        await self._ensure_tables()
        async with async_session_maker() as session:
            conv_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            await session.execute(
                text("""
                    INSERT INTO ai_conversations (id, session_id, page_context, created_at, updated_at)
                    VALUES (:id, :session_id, :page_context, :created_at, :updated_at)
                """),
                {
                    "id": conv_id,
                    "session_id": session_id,
                    "page_context": page_context,
                    "created_at": now,
                    "updated_at": now,
                },
            )
            await session.commit()
            return {
                "id": conv_id,
                "session_id": session_id,
                "page_context": page_context,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
            }

    async def get_conversation(self, session_id: str) -> Optional[dict]:
        await self._ensure_tables()
        async with async_session_maker() as session:
            result = await session.execute(
                text("""
                    SELECT id, session_id, page_context, created_at, updated_at
                    FROM ai_conversations
                    WHERE session_id = :session_id
                    ORDER BY updated_at DESC
                    LIMIT 1
                """),
                {"session_id": session_id},
            )
            row = result.mappings().first()
            if row is None:
                return None
            return dict(row)

    async def get_history(self, session_id: str, limit: int = 50) -> list[dict]:
        await self._ensure_tables()
        async with async_session_maker() as session:
            conv = await self.get_conversation(session_id)
            if conv is None:
                return []
            result = await session.execute(
                text("""
                    SELECT role, content, tokens_used, response_time_ms, created_at
                    FROM ai_messages
                    WHERE conversation_id = :conv_id
                    ORDER BY created_at ASC
                    LIMIT :limit
                """),
                {"conv_id": conv["id"], "limit": limit},
            )
            rows = result.mappings().all()
            return [{"role": r["role"], "content": r["content"]} for r in rows]

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        tokens_used: int = 0,
        response_time_ms: int = 0,
    ):
        await self._ensure_tables()
        async with async_session_maker() as session:
            conv = await self.get_conversation(session_id)
            if conv is None:
                conv = await self.create_conversation(session_id)
            await session.execute(
                text("""
                    INSERT INTO ai_messages (id, conversation_id, role, content, tokens_used, response_time_ms, created_at)
                    VALUES (:id, :conv_id, :role, :content, :tokens_used, :response_time_ms, :created_at)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "conv_id": conv["id"],
                    "role": role,
                    "content": content,
                    "tokens_used": tokens_used,
                    "response_time_ms": response_time_ms,
                    "created_at": datetime.now(timezone.utc),
                },
            )
            await session.execute(
                text("""
                    UPDATE ai_conversations SET updated_at = :now WHERE id = :id
                """),
                {"now": datetime.now(timezone.utc), "id": conv["id"]},
            )
            await session.commit()
