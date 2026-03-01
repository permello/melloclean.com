# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Admin blueprint — HTTP endpoints for admin operations.

Provides user listing, user creation, and session revocation routes.
All routes require authentication and the ADMIN role. Registered
under the ``/api/admin`` prefix by the app factory.
"""

import uuid
from http import HTTPStatus

from flask import Blueprint, jsonify, request
from sqlmodel import select

from app.database import get_session
from app.middleware.auth import require_auth, require_role
from app.models.enums import Role
from app.models.user import User
from app.response import error, paginated, success, success_action, validation_error
from app.services.session_service import revoke_all_user_sessions
from app.utils.password import hash_password
from app.utils.validation import (
    serialize_user,
    validate_confirm_password,
    validate_email,
    validate_name,
    validate_password,
)

admin_bp = Blueprint("admin", __name__)

"""Set of valid role strings for admin user creation."""
_VALID_ROLES = {r.value for r in Role}

"""Default page size for paginated user listings."""
_DEFAULT_PER_PAGE = 25


@admin_bp.route("/users", methods=["GET"])
@require_auth
@require_role("ADMIN")
def list_users():
    """List users ordered by creation date descending.

    Supports pagination via query parameters. Returns all users when
    ``?all=true`` is passed, otherwise defaults to page 1 with 25
    results per page.

    Query params:
        page: Page number (default 1).
        per_page: Results per page (default 25).
        all: Set to ``true`` to return all users without pagination.

    Returns:
        200 with paginated user list, 401/403 for auth failures.
    """
    with get_session() as db:
        if request.args.get("all", "").lower() == "true":
            users = db.exec(
                select(User).order_by(User.created_at.desc())
            ).all()
            return paginated(
                [serialize_user(u) for u in users],
                page=1,
                page_size=len(users),
                total=len(users),
            )

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", _DEFAULT_PER_PAGE, type=int)

        total_query = db.exec(select(User)).all()
        total = len(total_query)

        offset = (page - 1) * per_page
        users = db.exec(
            select(User)
            .order_by(User.created_at.desc())
            .offset(offset)
            .limit(per_page)
        ).all()

        return paginated(
            [serialize_user(u) for u in users],
            page=page,
            page_size=per_page,
            total=total,
        )


@admin_bp.route("/users", methods=["POST"])
@require_auth
@require_role("ADMIN")
def create_user():
    """Create a new user account as an admin.

    Validates required fields, email format, password length,
    confirmPassword match, and role value. Admin-created accounts
    are pre-verified (email_verified=True).

    Returns:
        201 with created user on success, 400 for validation errors,
        409 for duplicate email, 401/403 for auth failures.
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    role_str = data.get("role")

    errors = []

    validate_email(email, errors)
    validate_password(password, errors)
    validate_name(first_name, last_name, errors)
    validate_confirm_password(confirm_password, password, errors)

    if not role_str:
        errors.append({"field": "role", "issue": "Required"})
    if role_str and role_str not in _VALID_ROLES:
        errors.append({"field": "role", "issue": f"Must be one of: {', '.join(sorted(_VALID_ROLES))}"})

    if errors:
        return validation_error(errors)

    email = email.lower()

    with get_session() as db:
        existing = db.exec(select(User).where(User.email == email)).first()
        if existing is not None:
            return error("EMAIL_TAKEN", "A user with this email already exists.", HTTPStatus.CONFLICT)

        user = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=Role(role_str),
            email_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return success(serialize_user(user), 201)


@admin_bp.route("/users/<user_id>/revoke-sessions", methods=["POST"])
@require_auth
@require_role("ADMIN")
def revoke_sessions(user_id):
    """Revoke all sessions for a specific user.

    Takes the user ID from the URL path and revokes all their
    active sessions.

    Args:
        user_id: The target user's UUID from the URL path.

    Returns:
        200 with success on success, 404 for invalid UUID,
        401/403 for auth failures.
    """
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return error("INVALID_USER_ID", "Invalid user ID.", HTTPStatus.NOT_FOUND)

    revoke_all_user_sessions(uid)
    return success_action()
