# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Shared validation helpers and user serialization.

Provides reusable field validators and a single ``serialize_user``
function used by both the auth and admin blueprints.
"""

import re

from app.utils.password import MIN_PASSWORD_LENGTH

"""Email format regex matching the frontend validator."""
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

"""US zip code regex matching the frontend validator."""
ZIP_RE = re.compile(r"^\d{5}$")


def serialize_user(user):
    """Serialize a User model or session dict to a JSON-safe dict.

    Handles both SQLModel instances (from DB queries) and plain dicts
    (from ``g.user`` populated by ``validate_session``).

    Args:
        user: A User SQLModel instance or a dict with user fields.

    Returns:
        A dict with id, email, first_name, last_name, role,
        email_verified, and created_at.
    """
    if isinstance(user, dict):
        role = user["role"]
        created_at = user.get("created_at")
        uid = user["id"]
        email = user["email"]
        first_name = user["first_name"]
        last_name = user["last_name"]
        email_verified = user["email_verified"]
    else:
        role = user.role
        created_at = user.created_at
        uid = user.id
        email = user.email
        first_name = user.first_name
        last_name = user.last_name
        email_verified = user.email_verified

    role_str = role.value if hasattr(role, "value") else str(role)
    return {
        "id": str(uid),
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "role": role_str,
        "email_verified": email_verified,
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else created_at,
    }


def validate_email(email, errors):
    """Validate an email field for presence and format.

    Args:
        email: The email string (may be None).
        errors: A list to append error dicts to.
    """
    if not email:
        errors.append({"field": "email", "issue": "Required"})
    if email and not EMAIL_RE.match(email):
        errors.append({"field": "email", "issue": "Invalid format"})


def validate_password(password, errors):
    """Validate a password field for presence and minimum length.

    Args:
        password: The password string (may be None).
        errors: A list to append error dicts to.
    """
    if not password:
        errors.append({"field": "password", "issue": "Required"})
    if password and len(password) < MIN_PASSWORD_LENGTH:
        errors.append({"field": "password", "issue": f"Must be at least {MIN_PASSWORD_LENGTH} characters"})


def validate_confirm_password(confirm_password, password, errors):
    """Validate a confirmPassword field for presence and match.

    Args:
        confirm_password: The confirmation password string (may be None).
        password: The original password to compare against.
        errors: A list to append error dicts to.
    """
    if not confirm_password:
        errors.append({"field": "confirmPassword", "issue": "Required"})
    if confirm_password and password and password != confirm_password:
        errors.append({"field": "confirmPassword", "issue": "Passwords do not match"})


def validate_name(first_name, last_name, errors):
    """Validate first and last name fields for presence.

    Args:
        first_name: The first name string (may be None).
        last_name: The last name string (may be None).
        errors: A list to append error dicts to.
    """
    if not first_name:
        errors.append({"field": "firstName", "issue": "Required"})
    if not last_name:
        errors.append({"field": "lastName", "issue": "Required"})
