from typing import List, Optional
from pydantic import BaseModel

from backend.authorization.database.database import UserRole, UserStatus

class User(BaseModel):
    name: str
    surname: str
    patronymic: str
    email: str
    phone: str
    telegram_link: Optional[str] = None
    post: str
    team: str
    role: UserRole
    status: UserStatus = UserStatus.INACTIVE

class UserRead(User):
    id: int

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    phone: Optional[str] = None
    telegram_link: Optional[str] = None
    post: Optional[str] = None
    team: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

class UserFilter(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    telegram_link: Optional[str] = None
    post: Optional[str] = None
    team: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    limit: Optional[int] = 100
    offset: Optional[int] = 0

class UpdateStatus(BaseModel):
    status: UserStatus