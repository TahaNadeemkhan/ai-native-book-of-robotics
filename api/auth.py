from authlib.integrations.starlette_client import OAuth
from api.config import settings

oauth = OAuth()

CONF_URL = "https://accounts.google.com/.well-known/openid-configuration"

oauth.register(
    name="github",
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={'scope': 'user:email'},
)