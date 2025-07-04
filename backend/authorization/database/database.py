from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship
from sqlalchemy import Integer, String, Text, Enum, ForeignKey, func, Boolean, DateTime, text
import enum
from typing import Optional
from datetime import datetime

from dotenv import load_dotenv
import os
import logging

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

LOG_FILE = os.path.join("logs", "users.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
)
logger = logging.getLogger(__name__)

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
)

new_session = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

class Base(DeclarativeBase):
    pass

class UserRole(enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    USER = "user"
    GUEST = "guest"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    BUSY = "busy"
    INACTIVE = "inactive"

class Users(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    surname: Mapped[str] = mapped_column(String(255), nullable=False)
    patronymic: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    telegram_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    post: Mapped[str] = mapped_column(String(50), nullable=False)
    team: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.INACTIVE, nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.debug("Database tables created successfully.")

async def register_admin():
    async with new_session() as session:
        async with session.begin():
            admin = Users(
                name="Admin",
                surname="Adminov",
                patronymic="Adminovich",
                email="george.anohin@yandex.ru",
                phone="+79999999999",
                telegram_link="https://t.me/admin",
                post="Administrator",
                team="Admin Team",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                refresh_token=None,
            )

            result = await session.execute(
                text("SELECT 1 FROM users WHERE email = :email"),
                {"email": admin.email}
            )
            exists = result.first()

            if not exists:
                session.add(admin)

        await session.commit()
    logger.debug("Admin user registered successfully.")

async def delete_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.debug("Database tables deleted successfully.")

async def get_async_session():
    async with new_session() as session:
        yield session
