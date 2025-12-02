from typing import Optional

# Placeholder for a simple session management or token validation
async def get_current_user_id(token: Optional[str] = None) -> Optional[str]:
    # In a real application, this would validate a token (e.g., JWT) or check a session.
    # For demonstration, let's assume a valid token is any non-empty string for now.
    if token and token != "INVALID_TOKEN":
        return "dummy-user-id"  # Replace with actual user ID extraction from token
    return None

async def is_authenticated(token: Optional[str] = None) -> bool:
    return await get_current_user_id(token) is not None
