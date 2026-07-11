from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import re

class PIIFilterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        return response
