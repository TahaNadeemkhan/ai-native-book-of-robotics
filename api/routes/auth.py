import logging
import secrets
import os
from datetime import timedelta
from typing import Optional, Dict, Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from starlette.responses import RedirectResponse
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

import httpx
from api.dependencies import get_db
from api.services.auth_service import (
    authenticate_github_user_and_create_token, 
    is_authenticated,
    authenticate_user,
    get_password_hash,
    create_access_token,
    authenticate_google_user_and_create_token,
    get_current_user_id
)
from api.models.user import UserCreate, User
from api.config import settings

router = APIRouter()

# Production-ready Cookie Settings
COOKIE_NAME = "session_token"
OAUTH_STATE_COOKIE = "oauth_state"

# Determine if we are in production (Vercel)
is_vercel_prod = os.getenv("VERCEL") == "1"

# Cookie settings based on environment
COOKIE_SECURE = is_vercel_prod  # True on Vercel (HTTPS), False locally
# Use "none" for OAuth state cookie to survive cross-site redirects from GitHub
OAUTH_SAMESITE = "none" if is_vercel_prod else "lax"
# Use "lax" for session cookie (safer for normal usage)
COOKIE_SAMESITE = "lax" 

@router.post("/sign-up/email")
async def sign_up_email(
    request: Request,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Email/Password Registration.
    """
    email = body.get("email")
    password = body.get("password")
    name = body.get("name")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
        
    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
        
    hashed_pw = get_password_hash(password)
    
    new_user = User(
        email=email,
        hashed_password=hashed_pw,
        display_name=name or email.split("@")[0],
        tenant_id=uuid4(),
        email_verified=False
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Auto-login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = await create_access_token(
        data={"sub": str(new_user.id), "tenant_id": str(new_user.tenant_id)},
        expires_delta=access_token_expires,
    )
    
    response = JSONResponse(content={"success": True, "token": jwt_token})
    
    response.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
    
    return response

@router.post("/sign-in/email")
async def sign_in_email(
    request: Request,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Email/Password Login.
    """
    email = body.get("email")
    password = body.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
        
    user = await authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = await create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id)},
        expires_delta=access_token_expires,
    )
    
    response = JSONResponse(content={"success": True, "token": jwt_token})
    
    response.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
    
    return response

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
    try:
        provider = body.get("provider")
        if provider not in ["github", "google"]:
            raise HTTPException(status_code=400, detail="Unsupported provider")

        # 1. Generate robust state
        state = secrets.token_urlsafe(16)
        
        if provider == "github":
            # 2. Construct GitHub Auth URL manually to have full control
            if settings.GITHUB_REDIRECT_URI:
                redirect_uri = settings.GITHUB_REDIRECT_URI
            else:
                base = str(request.base_url)
                if base.endswith("/api/"):
                    base_root = base[:-len("/api/")]
                else:
                    base_root = base
                redirect_uri = f"{base_root}/api/auth/callback/github"

            auth_url = (
                f"https://github.com/login/oauth/authorize?"
                f"client_id={settings.GITHUB_CLIENT_ID}&"
                f"redirect_uri={redirect_uri}&"
                f"scope=user:email&"
                f"state={state}"
            )
        elif provider == "google":
            # Construct Google Auth URL
            if settings.FRONTEND_URL:
                redirect_uri = f"{settings.FRONTEND_URL}/api/auth/callback/google"
            else:
                base = str(request.base_url)
                if base.endswith("/api/"):
                    base_root = base[:-len("/api/")]
                else:
                    base_root = base
                redirect_uri = f"{base_root}/api/auth/callback/google"
            
            auth_url = (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={os.environ.get('GOOGLE_CLIENT_ID')}&"
                f"redirect_uri={redirect_uri}&"
                f"response_type=code&"
                f"scope=email%20profile&"
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
            samesite=OAUTH_SAMESITE,
            path="/"
        )

        return response
    except Exception as e:
        logging.error(f"Social Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Social Login Failed: {str(e)}")


@router.get("/sign-in/github")
async def sign_in_github_direct(request: Request):
    """
    Robust Browser-based Login.
    Redirects directly to GitHub, ensuring cookies stick (avoids AJAX/Fetch issues).
    """
    # 1. Generate robust state
    state = secrets.token_urlsafe(16)
    
    # 2. Construct GitHub Auth URL
    if settings.GITHUB_REDIRECT_URI:
        redirect_uri = settings.GITHUB_REDIRECT_URI
    else:
        base = str(request.base_url)
        if base.endswith("/api/"):
            base_root = base[:-len("/api/")]
        else:
            base_root = base
        redirect_uri = f"{base_root}/api/auth/callback/github"
    
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
        samesite=OAUTH_SAMESITE,
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
        # Dynamically determine frontend URL
        if settings.FRONTEND_URL:
            frontend_url = settings.FRONTEND_URL
        else:
            # If FRONTEND_URL is not explicitly set, derive it from the request
            # This is robust for Vercel where the API is hosted under /api/
            # and the frontend is at the root.
            base = str(request.base_url)
            # Remove /api/ from the base URL if present
            if base.endswith("/api/"):
                frontend_url = base[:-len("/api/")]
            else:
                frontend_url = base # Fallback if structure is different
            logging.info(f"DEBUG: Derived Frontend URL: {frontend_url}")

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
        response.delete_cookie(OAUTH_STATE_COOKIE, path="/")

        return response

    except Exception as e:
        logging.error(f"Auth Callback Error: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication Failed: {str(e)}")

@router.get("/callback/google")
async def callback_google(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handles Google OAuth callback manually.
    """
    try:
        # 1. Verify State
        code = request.query_params.get("code")
        state = request.query_params.get("state")
        saved_state = request.cookies.get(OAUTH_STATE_COOKIE)
        
        if not code or not state:
             raise HTTPException(status_code=400, detail="Missing code or state")
             
        if state != saved_state:
            logging.error(f"State mismatch. Received: {state}, Saved: {saved_state}")
            raise HTTPException(status_code=400, detail="Invalid OAuth state (CSRF check failed)")

        # 2. Exchange Code for Token
        # Dynamically determine redirect_uri for Google OAuth
        if settings.FRONTEND_URL:
            google_redirect_uri = f"{settings.FRONTEND_URL}/api/auth/callback/google"
        else:
            # Derive from request base URL
            base = str(request.base_url)
            if base.endswith("/api/"):
                google_redirect_uri = f"{base[:-len('/api/')]}/api/auth/callback/google"
            else:
                google_redirect_uri = f"{base}/api/auth/callback/google" # Fallback
            logging.info(f"DEBUG: Derived Google Redirect URI: {google_redirect_uri}")
        
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
                    "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": google_redirect_uri
                }
            )
            token_resp.raise_for_status()
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                 raise HTTPException(status_code=401, detail="Failed to retrieve access token")

            # 3. Fetch User Data
            headers = {"Authorization": f"Bearer {access_token}"}
            user_resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
            user_resp.raise_for_status()
            google_user = user_resp.json()
            
            email = google_user.get("email")
            if not email:
                 raise HTTPException(status_code=400, detail="No email found")

        # 4. Create Internal Session/Token
        jwt_token = await authenticate_google_user_and_create_token(
            db=db,
            google_id=str(google_user.get("sub")),
            email=email,
            display_name=google_user.get("name")
        )

        # 5. Redirect to Frontend
        if settings.FRONTEND_URL:
            frontend_url = settings.FRONTEND_URL
        else:
            base = str(request.base_url)
            if base.endswith("/api/"):
                frontend_url = base[:-len("/api/")]
            else:
                frontend_url = base
            logging.info(f"DEBUG: Derived Frontend URL (post Google Auth): {frontend_url}")

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
        response.delete_cookie(OAUTH_STATE_COOKIE, path="/")

        return response

    except Exception as e:
        logging.error(f"Google Auth Callback Error: {e}")
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

    user_id = await get_current_user_id(token)
    
    if not user_id:
         # Invalid token, clear cookie
        response = JSONResponse(content=None)
        response.delete_cookie(COOKIE_NAME)
        return response

    # Get user details
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        return JSONResponse(content=None)

    # Return structure expected by Better-Auth
    return {
        "session": {
            "id": token,
            "userId": str(user_id),
            "expiresAt": "2099-12-31T23:59:59.000Z",
            "ipAddress": request.client.host,
            "userAgent": request.headers.get("user-agent")
        },
        "user": {
            "id": str(user.id),
            "email": user.email, 
            "name": user.display_name,
            "image": "https://github.com/ghost.png" # Placeholder
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