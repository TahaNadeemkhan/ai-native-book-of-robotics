import logging
import httpx
from authlib.integrations.starlette_client import (
    OAuthError,  # Correct exception for v1.6.5
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

from api.auth import oauth
from api.dependencies import get_db
from api.services.auth_service import authenticate_github_user_and_create_token
from api.config import settings # Import settings

router = APIRouter()


@router.get("/login/github")
async def login_github(request: Request):
    """
    Redirects the user to GitHub's OAuth login page.
    """
    redirect_uri = settings.GITHUB_REDIRECT_URI or request.url_for("callback_github")
    return await oauth.github.authorize_redirect(request, redirect_uri, scope="user:email")


@router.get("/callback/github")
async def callback_github(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handles the callback from GitHub after successful authentication.
    Exchanges the authorization code for an access token, fetches user data,
    and issues an internal JWT.
    """
    try:
        # Exchange authorization code for access token
        token = await oauth.github.authorize_access_token(request)
        github_access_token = token.get("access_token")
        if not github_access_token:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="GitHub access token not found",
            )

        # Fetch user data from GitHub
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {github_access_token}"}
            response = await client.get("https://api.github.com/user", headers=headers)
            response.raise_for_status()
            logging.info(f"GitHub API response status: {response.status_code}")
            logging.info(f"GitHub API raw response text: {response.text}")
            github_user_data = response.json()
            logging.info(f"Received user data from GitHub (parsed JSON): {github_user_data}")

            # Fetch user emails from GitHub
            emails_response = await client.get("https://api.github.com/user/emails", headers=headers)
            emails_response.raise_for_status()
            github_emails_data = emails_response.json()
            logging.info(f"Received user emails from GitHub: {github_emails_data}")

            github_id = str(github_user_data.get("id"))
            email = None
            for user_email in github_emails_data:
                if user_email.get("primary") and user_email.get("verified"):
                    email = user_email.get("email")
                    break

            display_name = github_user_data.get("name") or github_user_data.get("login")

            if not github_id or not email:
                raise HTTPException(
                    status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not retrieve essential user data from GitHub (id or email).",
                )

        # Authenticate user and create internal JWT
        jwt_token = await authenticate_github_user_and_create_token(
            db=db,
            github_id=github_id,
            email=email,
            display_name=display_name,
        )

        return {"access_token": jwt_token, "token_type": "bearer"}

    except OAuthError:  # Updated for Authlib v1.6.5
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=(
                "CSRF warning or OAuth error: state mismatch or invalid OAuth flow. "
                "Please start the login process from /auth/login/github."
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Authentication failed due to an unexpected error")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail=f"Authentication failed: {e}"
        )


# Optional logout endpoint (client-side JWT logout)
# @router.get("/logout")
# async def logout():
#     return {"message": "Successfully logged out"}
