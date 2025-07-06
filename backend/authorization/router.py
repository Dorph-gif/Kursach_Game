from fastapi import APIRouter, Response, Request, HTTPException, status, Cookie, Depends
from fastapi.responses import RedirectResponse, JSONResponse
import secrets
import time

from backend.authorization.yandex_client import build_auth_url, exchange_code_for_token, get_user_info
from backend.authorization.jwt_utils import create_access_token, decode_access_token

from backend.authorization.database.orm_db import OrmDatabaseManager, get_db_manager
from backend.authorization.models import User, UserRead, UserUpdate, UserFilter
from backend.authorization.config import settings

auth_router = APIRouter(prefix="/api/auth")

@auth_router.get("/login")
def login():
    url = build_auth_url()
    return RedirectResponse(url)

@auth_router.get("/callback")
async def callback(
    code: str,
    response: Response,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    yandex_token = await exchange_code_for_token(code)
    userinfo = await get_user_info(yandex_token)
    email = userinfo.get("default_email")

    # if not email or not email.endswith(settings.CORPORATE_DOMAIN):
    #     raise HTTPException(status_code=403, detail="Access denied")

    user = await db_manager.get_user_by_email(email)
    if not user:
        user = User(
            name="",
            surname="",
            patronymic="",
            email=email,
            phone="",
            telegram_link="",
            post="",
            team="",
            role="user",
        )
        user = await db_manager.register_user(user)

    access_token = create_access_token(user_id=user.id, role=user.role.value)
    refresh_token = secrets.token_hex(32)

    await db_manager.save_refresh_token(user_id=user.id, refresh_token=refresh_token)

    response = RedirectResponse(url=settings.FRONTEND_HOME)
    response.set_cookie("access_token", access_token, httponly=True, secure=True, max_age=settings.ACCESS_TOKEN_EXPIRE_SEC)
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, max_age=settings.REFRESH_TOKEN_EXPIRE_SEC)
    return response

@auth_router.post("/refresh")
async def refresh(
    response: Response,
    request: Request,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    token = request.cookies.get("refresh_token")

    if not token:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or expired refresh token"},
        )
    
    token_data = await db_manager.get_refresh_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if not token_data.get("user_id") or not token_data.get("role"):
        raise HTTPException(status_code=401, detail="Invalid token data")

    new_access_token = create_access_token(user_id=token_data["user_id"], role=token_data["role"].value)

    response = JSONResponse({"message": "refreshed"})
    response.set_cookie("access_token", new_access_token, httponly=True, secure=True, max_age=settings.ACCESS_TOKEN_EXPIRE_SEC)
    return response

user_router = APIRouter(prefix="/api/users")

@user_router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: User,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    existing = await db_manager.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    return await db_manager.register_user(user)

@user_router.get("/me", response_model=UserRead)
async def get_myself(
    request: Request,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    user_id = request.state.user_id
    user = await db_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@user_router.patch("/me", response_model=UserRead)
async def update_current_user(
    update: UserUpdate,
    request: Request,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    user_id = request.state.user_id
    user = await db_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    updated = await db_manager.update_user(user_id, update)
    return updated

@user_router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    update: UserUpdate,
    request: Request,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    user = await db_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    updated = await db_manager.update_user(user_id, update)
    return updated

@user_router.get("/{user_id}", response_model=UserRead)
async def get_user_by_id(
    user_id: int,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
    request: Request = None,
):
    return await db_manager.get_user_by_id(user_id)

@user_router.get("/", response_model=list[UserRead])
async def get_users(
    filters: UserFilter = Depends(),
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
):
    users = await db_manager.search_users(filters)
    return users

@user_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db_manager: OrmDatabaseManager = Depends(get_db_manager),
    request: Request = None,
):
    await db_manager.delete_user(user_id)
