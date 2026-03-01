# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Auth blueprint — HTTP endpoints for authentication flows.

Provides signup, login, logout, session check, email verification,
password reset, and verification resend routes. All routes are
registered under the ``/api/auth`` prefix by the app factory.
"""

import re

from flask import Blueprint, g, jsonify, request

from app.errors import AuthError
from app.middleware import set_session_cookie, clear_session_cookie
from app.middleware.auth import require_auth
from app.services import auth_service

auth_bp = Blueprint("auth", __name__)

"""Minimum password length enforced at the route level."""
_MIN_PASSWORD_LENGTH = 8

"""Email format regex matching the frontend validator."""
_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

"""US zip code regex matching the frontend validator."""
_ZIP_RE = re.compile(r"^\d{5}$")

"""Maps AuthError codes to HTTP status codes."""
_ERROR_STATUS = {
    "EMAIL_TAKEN": 409,
    "INVALID_CREDENTIALS": 401,
}


def _error_response(err: AuthError):
    """Build a JSON error response from an AuthError.

    Args:
        err: The AuthError with message and code attributes.

    Returns:
        A tuple of (response, status_code).
    """
    status = _ERROR_STATUS.get(err.code, 400)
    return jsonify({"error": err.message, "code": err.code}), status


def _user_dict(user):
    """Serialize a User model to a JSON-safe dict for client use.

    Excludes id and role since the frontend does not need them.

    Args:
        user: A User SQLModel instance.

    Returns:
        A dict with email, name, and verification status.
    """
    return {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email_verified": user.email_verified,
    }


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Register a new user account.

    Validates required fields, email format, password length,
    confirmPassword match, address fields, and zip code format,
    then delegates to auth_service.signup. Sets a session cookie
    on success.

    Returns:
        201 with user data on success, 400 for validation errors,
        409 for duplicate email.
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    street = data.get("street")
    city = data.get("city")
    state = data.get("state")
    zip_code = data.get("zipCode")

    if not email or not password or not first_name or not last_name:
        return jsonify({"error": "Email, password, firstName, and lastName are required."}), 400

    if not _EMAIL_RE.match(email):
        return jsonify({"error": "Invalid email address."}), 400

    if len(password) < _MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"Password must be at least {_MIN_PASSWORD_LENGTH} characters."}), 400

    if not confirm_password:
        return jsonify({"error": "confirmPassword is required."}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if not street or not city or not state or not zip_code:
        return jsonify({"error": "street, city, state, and zipCode are required."}), 400

    if not _ZIP_RE.match(zip_code):
        return jsonify({"error": "Zip code must be 5 digits."}), 400

    try:
        result = auth_service.signup(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            street=street,
            city=city,
            state=state,
            zip_code=zip_code,
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent"),
        )
    except AuthError as e:
        return _error_response(e)

    response = jsonify({"user": _user_dict(result["user"])}), 201
    resp = response[0]
    set_session_cookie(resp, result["session_token"])
    return resp, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user with email and password.

    Validates required fields and email format, then delegates to
    auth_service.login. Sets a session cookie on success.

    Returns:
        200 with user data on success, 400 for missing fields or
        invalid email format, 401 for invalid credentials.
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    if not _EMAIL_RE.match(email):
        return jsonify({"error": "Invalid email address."}), 400

    try:
        result = auth_service.login(
            email=email,
            password=password,
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent"),
        )
    except AuthError as e:
        return _error_response(e)

    resp = jsonify({"user": _user_dict(result["user"])})
    set_session_cookie(resp, result["session_token"])
    return resp, 200


@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    """Log out the current user by revoking their session.

    Requires authentication. Clears the session cookie on the response.

    Returns:
        200 with success on success, 401 if not authenticated.
    """
    auth_service.logout(g.session_token)
    resp = jsonify({"success": True})
    clear_session_cookie(resp)
    return resp, 200


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    """Return the current authenticated user's profile.

    Requires authentication. Returns the user dict from g.user which
    was populated by the @require_auth decorator. Excludes id and role
    since the frontend does not need them.

    Returns:
        200 with user info on success, 401 if not authenticated.
    """
    user = g.user
    return jsonify({
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email_verified": user["email_verified"],
    }), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    """Verify a user's email address using a verification token.

    Extracts the token from the request body and delegates to
    auth_service.verify_email.

    Returns:
        200 with success on success, 400 for missing/invalid/expired token.
    """
    data = request.get_json(silent=True) or {}
    token = data.get("token")

    if not token:
        return jsonify({"error": "Token is required."}), 400

    try:
        auth_service.verify_email(token)
    except AuthError as e:
        return _error_response(e)

    return jsonify({"success": True}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Request a password reset email.

    Always returns success to prevent email enumeration.

    Returns:
        200 with success always, 400 if email is missing.
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required."}), 400

    auth_service.request_password_reset(email)
    return jsonify({"success": True}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Reset a user's password using a reset token.

    Validates the token, new password, and confirmPassword match,
    then delegates to auth_service.reset_password.

    Returns:
        200 with success on success, 400 for validation or token errors.
    """
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not token or not password:
        return jsonify({"error": "Token and password are required."}), 400

    if len(password) < _MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"Password must be at least {_MIN_PASSWORD_LENGTH} characters."}), 400

    if not confirm_password:
        return jsonify({"error": "confirmPassword is required."}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    try:
        auth_service.reset_password(token, password)
    except AuthError as e:
        return _error_response(e)

    return jsonify({"success": True}), 200


@auth_bp.route("/resend-verification", methods=["POST"])
@require_auth
def resend_verification():
    """Resend a verification email for the current user.

    Requires authentication. Delegates to
    auth_service.resend_verification_email with the current user's ID.

    Returns:
        200 with success on success, 400 for already verified,
        401 if not authenticated.
    """
    try:
        auth_service.resend_verification_email(g.user["id"])
    except AuthError as e:
        return _error_response(e)

    return jsonify({"success": True}), 200
