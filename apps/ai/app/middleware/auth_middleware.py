from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from app.config import settings


EXEMPT_PATHS = {"/api/health"}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
        if not token:
            token = request.cookies.get("admin_token")
        if not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid authentication token"},
            )

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
                audience="portfolio-admin",
                issuer="portfolio-api",
            )
            request.state.user = {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role"),
            }
        except JWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired authentication token"},
            )

        return await call_next(request)
