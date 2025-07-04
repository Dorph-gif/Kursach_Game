from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    YANDEX_CLIENT_ID: str = os.getenv("YANDEX_CLIENT_ID", "TODO")
    YANDEX_CLIENT_SECRET: str = os.getenv("YANDEX_CLIENT_SECRET", "TODO")
    YANDEX_REDIRECT_URI: str = os.getenv("YANDEX_REDIRECT_URI", "TODO")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "TODO")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_SEC: int = 15 * 60
    REFRESH_TOKEN_EXPIRE_SEC: int = 30 * 24 * 3600


    FRONTEND_HOME: str = "http://localhost:3000/"
    CORPORATE_DOMAIN: str = "@yourcompany.ru"

    class Config:
        env_file = ".env"

settings = Settings()
