from fastapi import APIRouter, HTTPException, Depends
from starlette.requests import Request
from starlette.responses import RedirectResponse
from starlette.status import HTTP_401_UNAUTHORIZED

from api.auth import oauth

router = APIRouter()

@router.get("/login/github")
async def login_github(request: Request):
    # Redirect to GitHub's OAuth login page
    return await oauth.github.authorize_redirect(request, "/auth/callback/github")

@router.get("/callback/github")
async def callback_github(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authentication failed")

    # In a real application, you would store the token or user info in a session
    # or database and create your own session token/cookie.
    # For now, let's just demonstrate success.
    return {"message": "Successfully authenticated with GitHub", "access_token": token["access_token"]}

@router.get("/logout")
async def logout(request: Request):
    # In a real application, you would invalidate the user's session.
    # For now, let's just return a success message.
    return {"message": "Successfully logged out"}
