# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Auth decorators for authentication and role-based access control.

Provides ``@require_auth`` and ``@require_role`` decorators that read the
``mello_session`` cookie, validate it via the session service, and gate
access based on user roles.
"""

from functools import wraps
from http import HTTPStatus

from flask import g, request

from app.response import error
from app.services.session_service import validate_session

COOKIE_NAME = "mello_session"


def require_auth(fn):
    """Decorator that enforces authentication via session cookie.

    Reads the ``mello_session`` cookie, calls ``validate_session``, and
    sets ``g.user`` (user dict) and ``g.session_token`` (raw token) on
    success. Returns 401 if the cookie is missing or the session is
    invalid/expired.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.cookies.get(COOKIE_NAME)

        if token is None:
            return error("AUTH_REQUIRED", "Authentication required", HTTPStatus.UNAUTHORIZED)

        result = validate_session(token)

        if result is None:
            return error("AUTH_REQUIRED", "Authentication required", HTTPStatus.UNAUTHORIZED)

        g.user = result["user"]
        g.session_token = token

        return fn(*args, **kwargs)

    return wrapper


def require_role(*allowed_roles):
    """Decorator factory that enforces role-based access control.

    Must be stacked **after** ``@require_auth`` so that ``g.user`` is
    already populated. Accepts variadic role strings, e.g.
    ``@require_role("WORKER", "ADMIN")``.

    Returns 403 if the user's role is not in the allowed set.
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = g.user["role"]
            user_role = role.value if hasattr(role, "value") else str(role)

            if user_role not in allowed_roles:
                return error("FORBIDDEN", "Forbidden", HTTPStatus.FORBIDDEN)

            return fn(*args, **kwargs)

        return wrapper

    return decorator
