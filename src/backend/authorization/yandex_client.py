import httpx
from src.backend.authorization.config import settings

YANDEX_AUTH_URL = "https://oauth.yandex.ru/authorize"
YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token"
YANDEX_USERINFO_URL = "https://login.yandex.ru/info"

def build_auth_url():
    return (
        f"{YANDEX_AUTH_URL}?"
        f"response_type=code&"
        f"client_id={settings.YANDEX_CLIENT_ID}&"
        f"redirect_uri={settings.YANDEX_REDIRECT_URI}&"
        f"scope=login:email"
    )

async def exchange_code_for_token(code: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            YANDEX_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.YANDEX_CLIENT_ID,
                "client_secret": settings.YANDEX_CLIENT_SECRET
            }
        )
        resp.raise_for_status()
        return resp.json()["access_token"]

async def get_user_info(yandex_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            YANDEX_USERINFO_URL,
            headers={"Authorization": f"OAuth {yandex_token}"}
        )
        resp.raise_for_status()
        return resp.json()
