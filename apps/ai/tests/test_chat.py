import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_chat_endpoint_accepts_message(client: AsyncClient):
    response = await client.post("/api/chat", json={
        "message": "Hello",
        "session_id": "test-session-1"
    })
    # Without real LLM keys, this may return an error, but should be 200 (SSE stream)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_chat_validates_empty_message(client: AsyncClient):
    response = await client.post("/api/chat", json={
        "message": "",
    })
    assert response.status_code == 422
