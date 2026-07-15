import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_suggest_improve(client: AsyncClient):
    response = await client.post("/api/suggest", json={
        "content": "This is a test.",
        "suggestion_type": "summarize"
    })
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert "original_content" in data
