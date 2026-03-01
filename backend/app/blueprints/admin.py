# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Admin blueprint — HTTP endpoints for admin operations.

Provides user listing, user creation, and session revocation routes.
All routes require authentication and the ADMIN role. Registered
under the ``/api/admin`` prefix by the app factory.
"""

import uuid

from flask import Blueprint, jsonify, request
from sqlmodel import select

from app.database import get_session
from app.middleware.auth import require_auth, require_role
from app.models.enums import Role
from app.models.user import User
from app.services.session_service import revoke_all_user_sessions
from app.utils.password import hash_password

admin_bp = Blueprint("admin", __name__)

"""Minimum password length enforced at the route level."""
_MIN_PASSWORD_LENGTH = 8

"""Set of valid role strings for admin user creation."""
_VALID_ROLES = {r.value for r in Role}


@admin_bp.route("/users", methods=["GET"])
@require_auth
@require_role("ADMIN")
def list_users():
    """List all users ordered by creation date descending.

    Requires ADMIN role. Returns an array of user objects with
    id, email, name, role, verification status, and creation time.

    Returns:
        200 with array of user objects, 401/403 for auth failures.
    """
    with get_session() as db:
        users = db.exec(
            select(User).order_by(User.created_at.desc())
        ).all()

        return jsonify([
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role.value if hasattr(u.role, "value") else str(u.role),
                "email_verified": u.email_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]), 200


@admin_bp.route("/users", methods=["POST"])
@require_auth
@require_role("ADMIN")
def create_user():
    """Create a new user account as an admin.

    Validates required fields, password length, and role value.
    Admin-created accounts are pre-verified (email_verified=True).

    Returns:
        201 with created user on success, 400 for validation errors,
        409 for duplicate email, 401/403 for auth failures.
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    role_str = data.get("role")

    if not email or not password or not first_name or not last_name or not role_str:
        return jsonify({"error": "Email, password, firstName, lastName, and role are required."}), 400

    if len(password) < _MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"Password must be at least {_MIN_PASSWORD_LENGTH} characters."}), 400

    if role_str not in _VALID_ROLES:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(sorted(_VALID_ROLES))}."}), 400

    email = email.lower()

    with get_session() as db:
        existing = db.exec(select(User).where(User.email == email)).first()
        if existing is not None:
            return jsonify({"error": "A user with this email already exists.", "code": "EMAIL_TAKEN"}), 409

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

        return jsonify({
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        }), 201


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
        return jsonify({"error": "Invalid user ID."}), 404

    revoke_all_user_sessions(uid)
    return jsonify({"success": True}), 200
