# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Middleware package — auth decorators and cookie helpers.

Exports:
    require_auth: Decorator enforcing session-cookie authentication.
    require_role: Decorator enforcing role-based access control.
    set_session_cookie: Sets the session cookie on a Flask response.
    clear_session_cookie: Clears the session cookie on a Flask response.
    COOKIE_NAME: The cookie name (``mello_session``).
    SESSION_MAX_AGE: Cookie max-age in seconds (30 days).
"""

import os
from datetime import timedelta

from app.middleware.auth import require_auth, require_role

COOKIE_NAME = "mello_session"
SESSION_MAX_AGE = int(timedelta(days=30).total_seconds())


def set_session_cookie(response, token):
    """Set the session cookie on a Flask response.

    Applies httpOnly, SameSite=Lax, Path=/, and a 30-day max-age.
    The Secure flag is True only when FLASK_ENV is not ``development``.

    Args:
        response: A Flask response object.
        token: The raw session token string.
    """
    is_production = os.environ.get("FLASK_ENV") != "development"

    response.set_cookie(
        COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="Lax",
        secure=is_production,
        path="/",
    )


def clear_session_cookie(response):
    """Clear the session cookie on a Flask response.

    Sets the cookie value to empty with Max-Age=0 so the browser
    deletes it immediately.

    Args:
        response: A Flask response object.
    """
    response.set_cookie(
        COOKIE_NAME,
        value="",
        max_age=0,
        httponly=True,
        samesite="Lax",
        path="/",
    )
