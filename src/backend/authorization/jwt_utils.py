from jose import jwt
import time

from src.backend.authorization.config import settings

def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": time.time() + settings.ACCESS_TOKEN_EXPIRE_SEC
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
