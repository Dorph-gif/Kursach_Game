from typing import List, Optional
from pydantic import BaseModel

from src.backend.knowlege.database.database import BlockType

class ArticleBlockCreate(BaseModel):
    block_type: BlockType
    content: str
    position: int

class ArticleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    blocks_data: List[ArticleBlockCreate]

class ArticleBlockRead(BaseModel):
    id: int
    block_type: BlockType
    content: str
    position: int

    class Config:
        from_attributes = True

class ArticleRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: str
    blocks_data: List[ArticleBlockRead]

    class Config:
        from_attributes = True

class ArticleShortRead(BaseModel):
    id: int
    title: str
    description: Optional[str]

    class Config:
        from_attributes = True

class ArticleInfoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class ArticleBlockUpdate(BaseModel):
    block_type: BlockType
    content: str
    position: int

class ArticleBlocksUpdate(BaseModel):
    blocks_data: List[ArticleBlockUpdate]
