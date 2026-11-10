import pytest_asyncio
from asgi_lifespan import LifespanManager
from httpx import AsyncClient, ASGITransport
from jose import jwt

from app.config import settings
from app.main import app


def _auth_headers() -> dict[str, str]:
    """Mint a token the admin auth middleware will accept."""
    token = jwt.encode(
        {
            "sub": "test-user",
            "email": "test@example.com",
            "role": "admin",
            "aud": "portfolio-admin",
            "iss": "portfolio-api",
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def client():
    # The app initialises its services in the lifespan handler, which
    # ASGITransport does not run on its own.
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport,
            base_url="http://test",
            headers=_auth_headers(),
        ) as test_client:
            yield test_client
