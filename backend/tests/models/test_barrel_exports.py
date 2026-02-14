from app.models import (
    EmailVerificationToken,
    PasswordResetToken,
    Role,
    Session,
    User,
)


class TestBarrelExports:
    def test_role_exported(self):
        assert Role.CLIENT.value == "CLIENT"

    def test_user_exported(self):
        assert User.__tablename__ == "users"

    def test_session_exported(self):
        assert Session.__tablename__ == "sessions"

    def test_email_verification_token_exported(self):
        assert EmailVerificationToken.__tablename__ == "email_verification_tokens"

    def test_password_reset_token_exported(self):
        assert PasswordResetToken.__tablename__ == "password_reset_tokens"
