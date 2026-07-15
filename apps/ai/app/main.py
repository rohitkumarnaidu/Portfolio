from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings

# Route imports
from app.routes import chat, analyze, suggest, health, agent

# Middleware imports (we will implement these)
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.input_sanitizer import InputSanitizerMiddleware
from app.middleware.pii_filter import PIIFilterMiddleware
from app.middleware.auth_middleware import AuthMiddleware

# Services
from app.services.analytics_service import AnalyticsService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize services
    # We delay full import here to avoid circular dependencies if any
    from app.services.rag_service import RAGService
    from app.services.embedding_service import EmbeddingService
    from app.services.cache_service import CacheService
    from app.services.cost_controller import CostController
    from app.database import engine

    # We will initialize these later when we implement them
    app.state.rag = RAGService()
    app.state.embedding = EmbeddingService()
    app.state.cache = CacheService()
    app.state.analytics = AnalyticsService()
    app.state.cost = CostController()
    
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(InputSanitizerMiddleware)
app.add_middleware(PIIFilterMiddleware)

app.include_router(chat.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(suggest.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
