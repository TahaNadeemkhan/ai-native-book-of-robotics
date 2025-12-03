import logging
from typing import Optional

from fastapi import Depends, FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from api.config import settings
from api.services.auth_service import is_authenticated

from .routes import auth as auth_router
from .routes import users as users_router
from .routes import ai as ai_router

# Explicitly configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(
    logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger.addHandler(handler)

app = FastAPI()

# Add SessionMiddleware for authlib's OAuth flow
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.SECRET_KEY, 
    https_only=False, 
    same_site="lax"
)

origins = [
    "http://localhost:3000",  # Allow Docusaurus dev server
    # Add other origins as needed for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router.router, prefix="/users", tags=["users"])
app.include_router(ai_router.router, prefix="/api/ai", tags=["ai"])


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
