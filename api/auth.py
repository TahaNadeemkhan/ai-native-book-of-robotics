import os

from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

config = Config(".env") # Reads environment variables from .env file

oauth = OAuth(config)

CONF_URL = "https://accounts.google.com/.well-known/openid-configuration"

oauth.register(
    name="github",
    client_id=os.environ.get("GITHUB_CLIENT_ID"),
    client_secret=os.environ.get("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={'scope': 'user:email'},
)
