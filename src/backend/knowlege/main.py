from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
import logging
from dotenv import load_dotenv
import os

from src.backend.knowlege.router import router as knowledge_router
from src.backend.knowlege.database.database import create_tables, delete_tables

load_dotenv()

LOG_FILE = os.path.join("logs", "knowlege.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up the knowledge service...")
    try:
        await create_tables()
        logger.info("Knowledge service database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating knowledge service database tables: {e}")
        raise HTTPException(status_code=500, detail="Database initialization failed")
    yield

    # await delete_tables()

    logger.info("Shutting down the knowledge service...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(knowledge_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)