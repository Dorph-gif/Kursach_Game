from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import jwt, JWTError
from src.backend.authorization.config import settings

EXCLUDE_PATHS = [
    "/auth/callback",
    "/auth/refresh",
    "/auth/login",
    "/docs",
    "/openapi.json",
]

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # ----------------

        return await call_next(request)

        # ----------------

        if request.url.path in EXCLUDE_PATHS:
            return await call_next(request)

        token = request.cookies.get("access_token")
        
        if not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
            )

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            user_id = payload.get("sub")
            role = payload.get("role")

            if user_id is None or role is None:
                raise JWTError("Missing user_id or role in token")

            request.state.user_id = int(user_id)
            request.state.role = role

        except JWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token"},
            )
        
        response = await call_next(request)
        return response