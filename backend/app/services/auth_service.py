# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Auth service — orchestrates signup, login, logout, and token flows.

Coordinates the session service, email service, and database models
to implement all authentication business logic.
"""

import logging
import uuid
from datetime import datetime, timezone

from sqlmodel import select

from app.config import Config
from app.database import get_session
from app.errors import AuthError
from app.models.email_verification import EmailVerificationToken
from app.models.enums import Role
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services import email_service, session_service
from app.utils.password import hash_password, verify_password
from app.utils.tokens import generate_token, hash_token

logger = logging.getLogger(__name__)


def signup(
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    street: str = "",
    city: str = "",
    state: str = "",
    zip_code: str = "",
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    """Register a new user account.

    Creates the user, an email verification token, a session, and
    fires off a verification email. The email send is best-effort —
    failures are logged but do not prevent signup.

    Args:
        email: User's email address (will be lowercased).
        password: Plaintext password (min 8 chars).
        first_name: User's first name.
        last_name: User's last name.
        street: Street address.
        city: City name.
        state: US state abbreviation.
        zip_code: 5-digit US zip code.
        ip_address: Optional client IP for session auditing.
        user_agent: Optional client user-agent for session auditing.

    Returns:
        A dict with ``session_token`` (str) and ``user`` (User).

    Raises:
        AuthError: With code ``EMAIL_TAKEN`` if the email is already registered.
    """
    email = email.lower()

    with get_session() as db:
        existing = db.exec(select(User).where(User.email == email)).first()
        if existing is not None:
            raise AuthError("A user with this email already exists.", "EMAIL_TAKEN")

        user = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            street=street,
            city=city,
            state=state,
            zip_code=zip_code,
            role=Role.CLIENT,
        )
        db.add(user)
        db.flush()

        raw_token = generate_token()
        verification = EmailVerificationToken(
            user_id=user.id,
            token=hash_token(raw_token),
        )
        db.add(verification)
        db.commit()

    session_token = session_service.create_session(
        user.id, ip_address=ip_address, user_agent=user_agent
    )

    verification_url = f"{Config.APP_URL}/verify-email?token={raw_token}"
    try:
        email_service.send_verification_email(
            first_name=first_name,
            email=email,
            verification_url=verification_url,
        )
    except Exception:
        logger.exception("Failed to send verification email to %s", email)

    return {"session_token": session_token, "user": user}


def login(
    email: str,
    password: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    """Authenticate a user with email and password.

    Uses the same error for unknown email and wrong password to
    prevent user enumeration.

    Args:
        email: User's email address (will be lowercased).
        password: Plaintext password to verify.
        ip_address: Optional client IP for session auditing.
        user_agent: Optional client user-agent for session auditing.

    Returns:
        A dict with ``session_token`` (str) and ``user`` (User).

    Raises:
        AuthError: With code ``INVALID_CREDENTIALS`` if email or password is wrong.
    """
    email = email.lower()

    with get_session() as db:
        user = db.exec(select(User).where(User.email == email)).first()
        if user is None:
            raise AuthError("Invalid email or password.", "INVALID_CREDENTIALS")

        if not verify_password(password, user.password_hash):
            raise AuthError("Invalid email or password.", "INVALID_CREDENTIALS")

    session_token = session_service.create_session(
        user.id, ip_address=ip_address, user_agent=user_agent
    )

    return {"session_token": session_token, "user": user}


def logout(session_token: str) -> None:
    """Log out a user by revoking their session.

    Args:
        session_token: The raw session token to revoke.
    """
    session_service.revoke_session(session_token)


def verify_email(token: str) -> None:
    """Verify a user's email address using a verification token.

    Marks the user as verified and deletes all verification tokens
    for that user.

    Args:
        token: The raw verification token from the email link.

    Raises:
        AuthError: With code ``INVALID_TOKEN`` if the token is not found.
        AuthError: With code ``TOKEN_EXPIRED`` if the token has expired.
    """
    hashed = hash_token(token)

    with get_session() as db:
        row = db.exec(
            select(EmailVerificationToken).where(EmailVerificationToken.token == hashed)
        ).first()

        if row is None:
            raise AuthError("Invalid verification token.", "INVALID_TOKEN")

        expires = row.expires_at if row.expires_at.tzinfo else row.expires_at.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            raise AuthError("Verification token has expired.", "TOKEN_EXPIRED")

        user = db.get(User, row.user_id)
        user.email_verified = True
        user.email_verified_at = datetime.now(timezone.utc)

        all_tokens = db.exec(
            select(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id)
        ).all()
        for t in all_tokens:
            db.delete(t)

        db.commit()


def resend_verification_email(user_id: uuid.UUID) -> None:
    """Resend a verification email for an unverified user.

    Deletes any existing verification tokens before creating a new one.

    Args:
        user_id: The user's UUID.

    Raises:
        AuthError: With code ``USER_NOT_FOUND`` if the user doesn't exist.
        AuthError: With code ``ALREADY_VERIFIED`` if the user is already verified.
    """
    with get_session() as db:
        user = db.get(User, user_id)
        if user is None:
            raise AuthError("User not found.", "USER_NOT_FOUND")

        if user.email_verified:
            raise AuthError("Email is already verified.", "ALREADY_VERIFIED")

        old_tokens = db.exec(
            select(EmailVerificationToken).where(EmailVerificationToken.user_id == user_id)
        ).all()
        for t in old_tokens:
            db.delete(t)

        raw_token = generate_token()
        verification = EmailVerificationToken(
            user_id=user_id,
            token=hash_token(raw_token),
        )
        db.add(verification)
        db.commit()

    verification_url = f"{Config.APP_URL}/verify-email?token={raw_token}"
    email_service.send_verification_email(
        first_name=user.first_name,
        email=user.email,
        verification_url=verification_url,
    )


def request_password_reset(email: str) -> None:
    """Request a password reset email.

    Returns silently if the email is not found to prevent user enumeration.
    Deletes any existing reset tokens before creating a new one.

    Args:
        email: The user's email address (will be lowercased).
    """
    email = email.lower()

    with get_session() as db:
        user = db.exec(select(User).where(User.email == email)).first()
        if user is None:
            return

        old_tokens = db.exec(
            select(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
        ).all()
        for t in old_tokens:
            db.delete(t)

        raw_token = generate_token()
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=hash_token(raw_token),
        )
        db.add(reset_token)
        db.commit()

    reset_url = f"{Config.APP_URL}/reset-password?token={raw_token}"
    email_service.send_password_reset_email(
        first_name=user.first_name,
        email=user.email,
        reset_url=reset_url,
    )


def reset_password(token: str, new_password: str) -> None:
    """Reset a user's password using a password reset token.

    Updates the password hash, marks the token as used, and revokes
    all existing sessions for the user.

    Args:
        token: The raw reset token from the email link.
        new_password: The new plaintext password (min 8 chars).

    Raises:
        AuthError: With code ``INVALID_TOKEN`` if the token is not found or already used.
        AuthError: With code ``TOKEN_EXPIRED`` if the token has expired.
    """
    hashed = hash_token(token)

    with get_session() as db:
        row = db.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == hashed)
        ).first()

        if row is None or row.used_at is not None:
            raise AuthError("Invalid reset token.", "INVALID_TOKEN")

        expires = row.expires_at if row.expires_at.tzinfo else row.expires_at.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            raise AuthError("Reset token has expired.", "TOKEN_EXPIRED")

        user = db.get(User, row.user_id)
        user.password_hash = hash_password(new_password)
        row.used_at = datetime.now(timezone.utc)
        db.commit()

    session_service.revoke_all_user_sessions(user.id)
