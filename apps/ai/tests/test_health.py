import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_health_response_structure(client: AsyncClient):
    response = await client.get("/api/health")
    data = response.json()
    assert "database" in data
    assert "llm_provider" in data
