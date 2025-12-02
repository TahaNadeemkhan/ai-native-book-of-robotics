from typing import Optional

from fastapi import Depends, FastAPI, Header
from starlette.middleware.sessions import SessionMiddleware

from api.config import settings
from api.services.auth_service import is_authenticated

from .routes import auth as auth_router
from .routes import users as users_router
import logging

# Explicitly configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

app = FastAPI()

# Add SessionMiddleware for authlib's OAuth flow
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(users_router.router, prefix="/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "Welcome to the Cybernetic HUD Documentation Platform API"}


@app.get("/auth-status")
async def get_auth_status(authorization: Optional[str] = Header(None)):
    token = (
        authorization.split(" ")[1]
        if authorization and "Bearer" in authorization
        else None
    )
    authenticated = await is_authenticated(token)
    return {"authenticated": authenticated}
