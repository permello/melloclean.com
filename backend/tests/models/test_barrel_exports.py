"""Tests for the models package barrel exports.

Ensures all models and enums are re-exported from app.models.__init__
so consumers can use: from app.models import User, Role, etc.
"""

from app.models import (
    EmailVerificationToken,
    PasswordResetToken,
    Role,
    Session,
    User,
)


class TestBarrelExports:
    """Verify every model is accessible from the top-level models package."""

    def test_role_exported(self):
        """Role enum should be importable from app.models."""
        assert Role.CLIENT.value == "CLIENT"

    def test_user_exported(self):
        """User model should map to the 'users' table."""
        assert User.__tablename__ == "users"

    def test_session_exported(self):
        """Session model should map to the 'sessions' table."""
        assert Session.__tablename__ == "sessions"

    def test_email_verification_token_exported(self):
        """EmailVerificationToken should map to the 'email_verification_tokens' table."""
        assert EmailVerificationToken.__tablename__ == "email_verification_tokens"

    def test_password_reset_token_exported(self):
        """PasswordResetToken should map to the 'password_reset_tokens' table."""
        assert PasswordResetToken.__tablename__ == "password_reset_tokens"
