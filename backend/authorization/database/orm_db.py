from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import Depends, HTTPException
from typing import Optional

from backend.authorization.database.database import Users, UserRole, get_async_session, UserStatus
from backend.authorization.models import User, UserRead, UserUpdate, UserFilter

class OrmDatabaseManager:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(
        self,
        user: User,
    ) -> UserRead:
        try:
            user = Users(
                name=user.name,
                surname=user.surname,
                patronymic=user.patronymic,
                email=user.email,
                phone=user.phone,
                telegram_link=user.telegram_link,
                post=user.post,
                team=user.team,
                role=UserRole(user.role),
            )
            self.session.add(user)

            await self.session.commit()
            await self.session.refresh(user)
            return user
        except Exception:
            await self.session.rollback()
            raise

    async def get_user_by_email(self, email: str) -> Optional[Users]:
        result = await self.session.execute(
            select(Users).where(Users.email == email)
        )
        return result.scalar_one_or_none()

    async def get_user_db_by_id(self, user_id: int) -> Optional[Users]:
        result = await self.session.execute(
            select(Users).where(Users.id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_user(self, user_id: int, update: UserUpdate) -> UserRead:
        user = await self.get_user_db_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for field, value in update.dict(exclude_unset=True).items():
            setattr(user, field, value)

        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_user_by_id(self, user_id: int) -> UserRead:
        stmt = select(Users).where(Users.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserRead.model_validate(user)

    async def search_users(self, filters: UserFilter) -> list[Users]:
        stmt = select(Users)

        conditions = []

        if filters.name:
            conditions.append(Users.name.ilike(f"%{filters.name}%"))
        if filters.surname:
            conditions.append(Users.surname.ilike(f"%{filters.surname}%"))
        if filters.patronymic:
            conditions.append(Users.patronymic.ilike(f"%{filters.patronymic}%"))
        if filters.email:
            conditions.append(Users.email.ilike(f"%{filters.email}%"))
        if filters.phone:
            conditions.append(Users.phone.ilike(f"%{filters.phone}%"))
        if filters.telegram_link:
            conditions.append(Users.telegram_link.ilike(f"%{filters.telegram_link}%"))
        if filters.post:
            conditions.append(Users.post.ilike(f"%{filters.post}%"))
        if filters.team:
            conditions.append(Users.team.ilike(f"%{filters.team}%"))
        if filters.role:
            conditions.append(Users.role == filters.role)
        if filters.status:
            conditions.append(Users.status == filters.status)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.limit(filters.limit).offset(filters.offset)

        result = await self.session.execute(stmt)
        users = result.scalars().all()
        return users

    async def delete_user(self, user_id: int) -> None:
            stmt = select(Users).where(Users.id == user_id)
            result = await self.session.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            await self.session.delete(user)
            await self.session.commit()

    async def save_refresh_token(self, user_id: int, refresh_token: str):
        user = await self.get_user_db_by_id(user_id)
        if user:
            user.refresh_token = refresh_token
            await self.session.commit()

    async def get_refresh_token(self, refresh_token: str) -> Optional[dict]:
        result = await self.session.execute(
            select(Users).where(Users.refresh_token == refresh_token)
        )

        user = result.scalar_one_or_none()

        if not user:
            return None
        
        return { "user_id": user.id, "role": user.role }

    async def delete_refresh_token(self, user_id: int):
        user = await self.get_user_db_by_id(user_id)
        if user:
            user.refresh_token = None
            await self.session.commit()

async def get_db_manager(session: AsyncSession = Depends(get_async_session)) -> OrmDatabaseManager:
    return OrmDatabaseManager(session)
