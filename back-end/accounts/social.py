"""
Verify ID tokens sent by the front-end after "Login with Google" / "Login with Apple".

The browser talks to Google/Apple, receives a signed ID token (a JWT) and posts
it to our API. We check the signature + audience here, then trust the email
inside it. Each function returns a small dict or raises SocialAuthError.
"""

import jwt
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

APPLE_ISSUER = "https://appleid.apple.com"
APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"


class SocialAuthError(Exception):
    pass


def verify_google_token(credential: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID:
        raise SocialAuthError("Google login is not configured.")
    try:
        info = google_id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError as exc:
        raise SocialAuthError("Invalid Google token.") from exc

    if not info.get("email") or not info.get("email_verified"):
        raise SocialAuthError("Google account has no verified email.")
    return {
        "email": info["email"],
        "first_name": info.get("given_name", ""),
        "last_name": info.get("family_name", ""),
    }


def verify_apple_token(token: str) -> dict:
    if not settings.APPLE_CLIENT_ID:
        raise SocialAuthError("Apple login is not configured.")
    try:
        signing_key = jwt.PyJWKClient(APPLE_KEYS_URL).get_signing_key_from_jwt(token)
        info = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.APPLE_CLIENT_ID,
            issuer=APPLE_ISSUER,
        )
    except jwt.PyJWTError as exc:
        raise SocialAuthError("Invalid Apple token.") from exc

    if not info.get("email"):
        raise SocialAuthError("Apple account has no email.")
    # Apple only sends the person's name to the browser (first login only),
    # so the view takes first/last name from the request body instead.
    return {"email": info["email"]}
