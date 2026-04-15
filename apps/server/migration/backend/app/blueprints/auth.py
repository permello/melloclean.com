# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Auth blueprint — HTTP endpoints for authentication flows.

Provides signup, login, logout, session check, email verification,
password reset, and verification resend routes. All routes are
registered under the ``/api/auth`` prefix by the app factory.
"""

from http import HTTPStatus

from flask import Blueprint, g, jsonify, request

from app.errors import AuthError
from app.middleware import set_session_cookie, clear_session_cookie
from app.middleware.auth import require_auth
from app.response import error, success, success_action, validation_error
from app.services import auth_service
from app.utils.validation import (
    ZIP_RE,
    serialize_user,
    validate_confirm_password,
    validate_email,
    validate_name,
    validate_password,
)

auth_bp = Blueprint("auth", __name__)

"""Maps AuthError codes to HTTP status codes."""
_ERROR_STATUS = {
    "EMAIL_TAKEN": HTTPStatus.CONFLICT,
    "INVALID_CREDENTIALS": HTTPStatus.UNAUTHORIZED,
}


def _error_response(err: AuthError):
    """Build a JSON error response from an AuthError.

    Args:
        err: The AuthError with message and code attributes.

    Returns:
        A tuple of (response, status_code).
    """
    status = _ERROR_STATUS.get(err.code, HTTPStatus.BAD_REQUEST)
    return error(err.code, err.message, status)


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

    errors = []

    validate_email(email, errors)
    validate_password(password, errors)
    validate_name(first_name, last_name, errors)
    validate_confirm_password(confirm_password, password, errors)

    if not street:
        errors.append({"field": "street", "issue": "Required"})
    if not city:
        errors.append({"field": "city", "issue": "Required"})
    if not state:
        errors.append({"field": "state", "issue": "Required"})
    if not zip_code:
        errors.append({"field": "zipCode", "issue": "Required"})
    if zip_code and not ZIP_RE.match(zip_code):
        errors.append({"field": "zipCode", "issue": "Must be 5 digits"})

    if errors:
        return validation_error(errors)

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

    resp = jsonify({"data": {"user": serialize_user(result["user"])}})
    set_session_cookie(resp, result["session_token"])
    return resp, HTTPStatus.CREATED


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

    errors = []

    validate_email(email, errors)
    if not password:
        errors.append({"field": "password", "issue": "Required"})

    if errors:
        return validation_error(errors)

    try:
        result = auth_service.login(
            email=email,
            password=password,
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent"),
        )
    except AuthError as e:
        return _error_response(e)

    resp = jsonify({"data": {"user": serialize_user(result["user"])}})
    set_session_cookie(resp, result["session_token"])
    return resp, HTTPStatus.OK


@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    """Log out the current user by revoking their session.

    Requires authentication. Clears the session cookie on the response.

    Returns:
        200 with success on success, 401 if not authenticated.
    """
    auth_service.logout(g.session_token)
    resp = jsonify({"data": {"status": "completed"}})
    clear_session_cookie(resp)
    return resp, HTTPStatus.OK


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    """Return the current authenticated user's profile.

    Requires authentication. Returns the user dict from g.user which
    was populated by the @require_auth decorator.

    Returns:
        200 with user info on success, 401 if not authenticated.
    """
    return success(serialize_user(g.user))


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
        return validation_error([{"field": "token", "issue": "Required"}])

    try:
        auth_service.verify_email(token)
    except AuthError as e:
        return _error_response(e)

    return success_action()


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
        return validation_error([{"field": "email", "issue": "Required"}])

    auth_service.request_password_reset(email)
    return success_action()


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

    errors = []

    if not token:
        errors.append({"field": "token", "issue": "Required"})
    validate_password(password, errors)
    validate_confirm_password(confirm_password, password, errors)

    if errors:
        return validation_error(errors)

    try:
        auth_service.reset_password(token, password)
    except AuthError as e:
        return _error_response(e)

    return success_action()


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

    return success_action()
