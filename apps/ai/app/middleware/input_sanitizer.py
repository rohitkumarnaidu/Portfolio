from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

class InputSanitizerMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.MAX_INPUT_LENGTH = 2000
        
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check input length for POST requests
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.MAX_INPUT_LENGTH * 4: # rough byte limit
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Payload too large."}
                )
        
        return await call_next(request)
