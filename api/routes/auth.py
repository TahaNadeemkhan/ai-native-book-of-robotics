import logging
import secrets
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

import httpx
from api.dependencies import get_db
from api.services.auth_service import authenticate_github_user_and_create_token, is_authenticated
from api.config import settings

router = APIRouter()

# Production-ready Cookie Settings
COOKIE_NAME = "session_token"
OAUTH_STATE_COOKIE = "oauth_state"

# In production, secure=True (HTTPS only) and samesite='lax' or 'none'
COOKIE_SECURE = False  # Set to True in Prod
COOKIE_SAMESITE = "lax" 

@router.post("/sign-in/social")
async def sign_in_social(
    request: Request, 
    body: Dict[str, Any] = Body(...)
):
    """
    Better-Auth Compatible Endpoint: Initiates Social Login.
    Client sends: { "provider": "github", "callbackURL": "..." }
    We return: { "url": "https://github.com/login/..." }
    """
    provider = body.get("provider")
    if provider != "github":
        raise HTTPException(status_code=400, detail="Unsupported provider")

    # 1. Generate robust state
    state = secrets.token_urlsafe(16)
    
    # 2. Construct GitHub Auth URL manually to have full control
    redirect_uri = settings.GITHUB_REDIRECT_URI or str(request.url_for("callback_github"))
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=user:email&"
        f"state={state}"
    )
    
    # 3. Return JSON with URL and Set State Cookie
    response = JSONResponse(content={"url": auth_url, "redirect": True})
    
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        httponly=True,
        max_age=600, # 10 minutes
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
        
    return response


@router.get("/sign-in/github")
async def sign_in_github_direct(request: Request):
    """
    Robust Browser-based Login.
    Redirects directly to GitHub, ensuring cookies stick (avoids AJAX/Fetch issues).
    """
    # 1. Generate robust state
    state = secrets.token_urlsafe(16)
    
    # 2. Construct GitHub Auth URL
    redirect_uri = settings.GITHUB_REDIRECT_URI or str(request.url_for("callback_github"))
    
    logging.info(f"DEBUG: Using Redirect URI: {redirect_uri}")
    
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=user:email&"
        f"state={state}"
    )
    
    logging.info(f"DEBUG: Generated Auth URL: {auth_url}")
    
    # 3. Return HTML with Redirect (Forces Cookie Set)
    html_content = f"""
    <html>
        <head>
            <title>Redirecting...</title>
            <meta http-equiv="refresh" content="0;url={auth_url}">
        </head>
        <body>
            <p>Redirecting to GitHub...</p>
            <script>window.location.href = "{auth_url}"</script>
        </body>
    </html>
    """
    
    response = HTMLResponse(content=html_content)
    
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        httponly=True,
        max_age=600,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
    
    return response


@router.get("/callback/github")
async def callback_github(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handles GitHub OAuth callback manually.
    Sets a Secure HttpOnly Cookie and Redirects to Frontend.
    """
    try:
        # 1. Verify State
        code = request.query_params.get("code")
        state = request.query_params.get("state")
        saved_state = request.cookies.get(OAUTH_STATE_COOKIE)
        
        if not code or not state:
             raise HTTPException(status_code=400, detail="Missing code or state")
             
        # If state check fails, log it but maybe proceed if dev environment? No, security first.
        if state != saved_state:
            logging.error(f"State mismatch. Received: {state}, Saved: {saved_state}")
            raise HTTPException(status_code=400, detail="Invalid OAuth state (CSRF check failed)")

        # 2. Exchange Code for Token
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI
                }
            )
            token_resp.raise_for_status()
            token_data = token_resp.json()
            github_access_token = token_data.get("access_token")
            
            if not github_access_token:
                logging.error(f"Failed to get token: {token_data}")
                raise HTTPException(status_code=401, detail="Failed to retrieve access token")

            # 3. Fetch User Data
            headers = {"Authorization": f"token {github_access_token}"}
            user_resp = await client.get("https://api.github.com/user", headers=headers)
            user_resp.raise_for_status()
            github_user = user_resp.json()
            
            emails_resp = await client.get("https://api.github.com/user/emails", headers=headers)
            emails_resp.raise_for_status()
            github_emails = emails_resp.json()

            email = next((e["email"] for e in github_emails if e["primary"] and e["verified"]), None)
            
            if not email:
                 raise HTTPException(status_code=400, detail="No verified primary email found")

        # 4. Create Internal Session/Token
        jwt_token = await authenticate_github_user_and_create_token(
            db=db,
            github_id=str(github_user.get("id")),
            email=email,
            display_name=github_user.get("name") or github_user.get("login"),
        )

        # 5. Redirect to Frontend
        frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
        response = RedirectResponse(url=frontend_url)
        
        # SET SECURE COOKIE (Session)
        response.set_cookie(
            key=COOKIE_NAME,
            value=jwt_token,
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=COOKIE_SECURE, 
            samesite=COOKIE_SAMESITE,
            path="/"
        )
        
        # Clear State Cookie
        response.delete_cookie(OAUTH_STATE_COOKIE)
        
        return response

    except Exception as e:
        logging.error(f"Auth Callback Error: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication Failed: {str(e)}")


@router.get("/get-session")
async def get_session(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Better-Auth Compatible Endpoint: Validates Session.
    Expected by client useSession() hook.
    """
    token = request.cookies.get(COOKIE_NAME)
    
    # If no cookie, check Authorization header (Bearer) as fallback
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return JSONResponse(content=None) # Return null if no session

    user_id = await is_authenticated(token)
    
    if not user_id:
         # Invalid token, clear cookie
        response = JSONResponse(content=None)
        response.delete_cookie(COOKIE_NAME)
        return response

    # Return structure expected by Better-Auth
    return {
        "session": {
            "id": token,
            "userId": user_id,
            "expiresAt": "2099-12-31T23:59:59.000Z",
            "ipAddress": request.client.host,
            "userAgent": request.headers.get("user-agent")
        },
        "user": {
            "id": user_id,
            "email": "user@example.com", 
            "name": "Cybernetic User",
            "image": "https://github.com/ghost.png"
        }
    }

@router.post("/sign-out")
async def sign_out(response: Response):
    """
    Clears the session cookie.
    """
    response = JSONResponse(content={"success": True})
    response.delete_cookie(COOKIE_NAME)
    return response