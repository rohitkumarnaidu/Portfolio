from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Very simple in-memory rate limiter for now
        self.requests = {}
        self.RATE_LIMIT_REQUESTS = 30
        self.RATE_LIMIT_WINDOW_SECONDS = 60

    async def dispatch(self, request: Request, call_next) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean up old requests
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < self.RATE_LIMIT_WINDOW_SECONDS
            ]
        else:
            self.requests[client_ip] = []
            
        if len(self.requests[client_ip]) >= self.RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(self.RATE_LIMIT_WINDOW_SECONDS)}
            )
            
        self.requests[client_ip].append(current_time)
        return await call_next(request)
