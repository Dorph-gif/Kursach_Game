from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import Depends
from typing import List

from src.backend.knowlege.database.database import Articles, ArticleBlocks, BlockType, get_async_session
from src.backend.knowlege.models import ArticleCreate, ArticleInfoUpdate, ArticleBlockUpdate, ArticleBlocksUpdate

class OrmDatabaseManager:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_article(
        self,
        article_data: ArticleCreate,
    ) -> Articles:
        try:
            article = Articles(title=article_data.title, description=article_data.description, category=article_data.category)
            self.session.add(article)

            for block_data in article_data.blocks_data:
                block = ArticleBlocks(
                    block_type=BlockType(block_data.block_type),
                    content=block_data.content,
                    position=block_data.position,
                    article=article,
                )
                self.session.add(block)

            await self.session.commit()
            await self.session.refresh(article)
            return article
        except Exception:
            await self.session.rollback()
            raise

    async def get_article_by_id(self, article_id: int) -> Articles | None:
        stmt = (
            select(Articles)
            .options(selectinload(Articles.blocks))
            .where(Articles.id == article_id)
        )
        result = await self.session.execute(stmt)
        article = result.scalars().first()
        return article
    
    async def get_articles_by_category(
        self,
        category: str,
        limit: int,
        offset: int
    ) -> list[Articles]:
        stmt = (
            select(Articles)
            .where(Articles.category == category)
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        articles = result.scalars().all()
        return articles

    async def update_article_info(self, article_id: int, data: ArticleInfoUpdate):
        stmt = select(Articles).where(Articles.id == article_id)
        result = await self.session.execute(stmt)
        article = result.scalar_one_or_none()

        if not article:
            raise ValueError("Article not found")

        if data.title is not None:
            article.title = data.title
        if data.description is not None:
            article.description = data.description
        if data.category is not None:
            article.category = data.category

        await self.session.commit()
        return article

    async def update_article_blocks(self, article_id: int, blocks_data: List[ArticleBlockUpdate]):
        await self.session.execute(
            delete(ArticleBlocks).where(ArticleBlocks.article_id == article_id)
        )

        for block_data in blocks_data:
            block = ArticleBlocks(
                article_id=article_id,
                block_type=block_data.block_type,
                content=block_data.content,
                position=block_data.position,
            )
            self.session.add(block)

        await self.session.commit()
        return True

    async def update_article_block(self, block_id: int, block_data: ArticleBlockUpdate):
        result = await self.session.execute(
            select(ArticleBlocks).where(ArticleBlocks.id == block_id)
        )
        block = result.scalar_one_or_none()

        if not block:
            raise ValueError(f"Block with id {block_id} not found")

        block.block_type = block_data.block_type
        block.content = block_data.content
        block.position = block_data.position

        await self.session.commit()
        return block

    async def delete_article(self, article_id: int) -> None:
        stmt = delete(Articles).where(Articles.id == article_id)
        result = await self.session.execute(stmt)
        if result.rowcount == 0:
            raise ValueError(f"Article with id={article_id} not found")
        await self.session.commit()

    async def delete_article_block(self, block_id: int) -> None:
        stmt = delete(ArticleBlocks).where(ArticleBlocks.id == block_id)
        result = await self.session.execute(stmt)
        if result.rowcount == 0:
            raise ValueError(f"Block with id={block_id} not found")
        await self.session.commit()

async def get_db_manager(session: AsyncSession = Depends(get_async_session)) -> OrmDatabaseManager:
    return OrmDatabaseManager(session)
