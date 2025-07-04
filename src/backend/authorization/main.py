from fastapi import FastAPI, HTTPException, Request
import logging
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from src.backend.authorization.database.database import create_tables
from src.backend.authorization.router import auth_router as auth_router
from src.backend.authorization.router import user_router as user_router
from src.backend.authorization.middlewares import AuthMiddleware

LOG_FILE = os.path.join("logs", "knowlege.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
)

logger = logging.getLogger(__name__)

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up the user service...")
    try:
        await create_tables()
        logger.info("User service database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating user service database tables: {e}")
        raise HTTPException(status_code=500, detail="Database initialization failed")
    yield

    # await delete_tables()

    logger.info("Shutting down the user service...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

app.add_middleware(AuthMiddleware)

app.include_router(user_router)
