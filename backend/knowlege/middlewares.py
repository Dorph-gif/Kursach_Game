from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import jwt, JWTError
import logging
import os

from backend.knowlege.config import settings

LOG_FILE = os.path.join("logs", "knowlege.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
)

logger = logging.getLogger(__name__)

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

        # return await call_next(request)

        # ----------------

        path = "/" + request.url.path.split("/")[-2] + "/" + request.url.path.split("/")[-1]

        if path in EXCLUDE_PATHS:
            return await call_next(request)
        
        if request.method == "OPTIONS":
            headers = {
                "Access-Control-Allow-Origin": settings.FRONTEND_HOME,
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
                "Access-Control-Allow-Headers": "Authorization,Content-Type",
                "Access-Control-Allow-Credentials": "true",
            }
            return JSONResponse(status_code=200, content={"message": "OK"}, headers=headers)

        token = request.cookies.get("access_token")

        logging.info(f"Got token: {token}")
        
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

            logging.info(f"Decoded token: {payload}")

            user_id = int(payload.get("sub"))
            role = payload.get("role")

            if user_id is None or role is None:
                raise JWTError("Missing user_id or role in token")

            request.state.user_id = int(user_id)
            request.state.role = role

        except JWTError as e:
            logging.error(f"JWT error: {e}")
            logging.error(f"Token: {token}")

            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token"},
            )
        
        response = await call_next(request)
        return response