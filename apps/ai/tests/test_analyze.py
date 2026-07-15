import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analyze_readability(client: AsyncClient):
    response = await client.post("/api/analyze", json={
        "content": "This is a test sentence. It has multiple words. And several sentences too.",
        "analysis_type": "readability"
    })
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "suggestions" in data
    assert "metrics" in data
    assert data["metrics"]["word_count"] > 0
