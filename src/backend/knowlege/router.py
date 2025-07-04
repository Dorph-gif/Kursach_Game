from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from sqlalchemy.exc import SQLAlchemyError

from src.backend.knowlege.database.orm_db import OrmDatabaseManager, get_db_manager
from src.backend.knowlege.models import ArticleCreate, ArticleRead, ArticleBlockRead, ArticleShortRead, ArticleInfoUpdate
from src.backend.knowlege.models import ArticleBlocksUpdate, ArticleBlockUpdate
from src.backend.knowlege.utils import get_current_user, validate_user_role

router = APIRouter(
    prefix="/api/knowledge"
)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_article_endpoint(
    article_data: ArticleCreate,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        article = await db_manager.create_article(article_data)
        return { "ok": True, "article": article }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{article_id}", response_model=ArticleRead)
async def get_article_endpoint(
    article_id: int,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info)
    try:
        article = await db_manager.get_article_by_id(article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        article_data = ArticleRead(
            id=article.id,
            title=article.title,
            description=article.description,
            category=article.category,
            blocks_data=[
                ArticleBlockRead(
                    id=block.id,
                    block_type=block.block_type,
                    content=block.content,
                    position=block.position,
                )
                for block in article.blocks
            ]
        )
        return article_data

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[ArticleShortRead])
async def get_articles_by_category_endpoint(
    category: str = Query(..., description="Название категории"),
    limit: int = Query(10, ge=1, le=100, description="Сколько статей вернуть"),
    offset: int = Query(0, ge=0, description="Сдвиг для пагинации"),
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info)
    try:
        articles = await db_manager.get_articles_by_category(
            category=category,
            limit=limit,
            offset=offset
        )

        return [
            ArticleShortRead(
                id=a.id,
                title=a.title,
                description=a.description
            )
            for a in articles
        ]

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{article_id}/info", status_code=200)
async def update_article_info_endpoint(
    article_id: int,
    article_data: ArticleInfoUpdate,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        article = await db_manager.update_article_info(article_id, article_data)
        return {"ok": True, "article_id": article.id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/{article_id}/blocks", status_code=200)
async def update_article_blocks_endpoint(
    article_id: int,
    blocks_update: ArticleBlocksUpdate,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        await db_manager.update_article_blocks(article_id, blocks_update.blocks_data)
        return {"ok": True, "article_id": article_id}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/blocks/{block_id}", status_code=status.HTTP_200_OK)
async def update_article_block_endpoint(
    block_id: int,
    block_data: ArticleBlockUpdate,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        updated_block = await db_manager.update_article_block(block_id, block_data)
        return {
            "ok": True,
            "block": {
                "id": updated_block.id,
                "block_type": updated_block.block_type,
                "content": updated_block.content,
                "position": updated_block.position,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        await db_manager.delete_article(article_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")

@router.delete("/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article_block(
    block_id: int,
    user_info: dict = Depends(get_current_user),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    validate_user_role(user_info, ["admin", "editor"])
    try:
        await db_manager.delete_article_block(block_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error")
