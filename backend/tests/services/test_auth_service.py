# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for auth service functions.

Verifies signup, login, logout, email verification, and password
reset flows using an in-memory SQLite database with patched
dependencies.
"""

import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

from sqlmodel import Session, SQLModel, create_engine, select

from app.errors import AuthError
from app.models.email_verification import EmailVerificationToken
from app.models.enums import Role
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.auth_service import (
    login,
    logout,
    request_password_reset,
    resend_verification_email,
    reset_password,
    signup,
    verify_email,
)
from app.utils.password import hash_password
from app.utils.tokens import hash_token


def _make_engine_and_session():
    """Create an in-memory SQLite engine and session."""
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine, Session(engine)


def _make_user(db: Session, **overrides) -> User:
    """Insert a User with sensible defaults and return it."""
    defaults = {
        "id": uuid.uuid4(),
        "email": f"{uuid.uuid4().hex[:8]}@example.com",
        "password_hash": hash_password("securepassword"),
        "first_name": "Test",
        "last_name": "User",
        "role": Role.CLIENT,
        "email_verified": False,
    }
    defaults.update(overrides)
    user = User(**defaults)
    db.add(user)
    db.flush()
    return user


def _make_verification_token(db: Session, user_id: uuid.UUID, **overrides) -> tuple[str, EmailVerificationToken]:
    """Insert an EmailVerificationToken and return (raw_token, row)."""
    from app.utils.tokens import generate_token

    raw = generate_token()
    defaults = {
        "user_id": user_id,
        "token": hash_token(raw),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    defaults.update(overrides)
    row = EmailVerificationToken(**defaults)
    db.add(row)
    db.flush()
    return raw, row


def _make_password_reset_token(db: Session, user_id: uuid.UUID, **overrides) -> tuple[str, PasswordResetToken]:
    """Insert a PasswordResetToken and return (raw_token, row)."""
    from app.utils.tokens import generate_token

    raw = generate_token()
    defaults = {
        "user_id": user_id,
        "token": hash_token(raw),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    defaults.update(overrides)
    row = PasswordResetToken(**defaults)
    db.add(row)
    db.flush()
    return raw, row


@contextmanager
def _patched_session(db: Session):
    """Patch get_session to yield the test db with commit -> flush."""
    original_commit = db.commit

    def _flush_instead():
        db.flush()

    db.commit = _flush_instead

    @contextmanager
    def _fake_get_session():
        yield db

    try:
        with patch("app.services.auth_service.get_session", _fake_get_session):
            yield db
    finally:
        db.commit = original_commit


# ---------------------------------------------------------------------------
# TestSignup
# ---------------------------------------------------------------------------


class TestSignup:
    """Tests for signup."""

    def test_returns_session_and_user(self):
        """signup should return a dict with session_token and user."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "session-tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                result = signup("New@Example.com", "strongpassword", "Jane", "Doe")
            assert result["session_token"] == "session-tok"
            assert result["user"].first_name == "Jane"

    def test_normalizes_email(self):
        """signup should store email as lowercase."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                result = signup("UPPER@CASE.COM", "strongpassword", "A", "B")
            user = db.exec(select(User)).first()
            assert user.email == "upper@case.com"

    def test_creates_client_role(self):
        """signup should assign the CLIENT role by default."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                result = signup("role@test.com", "strongpassword", "A", "B")
            assert result["user"].role == Role.CLIENT

    def test_creates_verification_token(self):
        """signup should create an EmailVerificationToken for the user."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                signup("token@test.com", "strongpassword", "A", "B")
            tokens = db.exec(select(EmailVerificationToken)).all()
            assert len(tokens) == 1

    def test_calls_create_session(self):
        """signup should call session_service.create_session with user id."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                result = signup("sess@test.com", "strongpassword", "A", "B", ip_address="1.2.3.4", user_agent="Test")
            mock_session.create_session.assert_called_once()
            call_kwargs = mock_session.create_session.call_args
            assert call_kwargs[1]["ip_address"] == "1.2.3.4"
            assert call_kwargs[1]["user_agent"] == "Test"

    def test_calls_send_verification_email(self):
        """signup should call email_service.send_verification_email."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                signup("email@test.com", "strongpassword", "Jane", "Doe")
            mock_email.send_verification_email.assert_called_once()
            call_args = mock_email.send_verification_email.call_args
            assert call_args[1]["first_name"] == "Jane"
            assert call_args[1]["email"] == "email@test.com"

    def test_duplicate_email_raises_email_taken(self):
        """signup should raise AuthError with EMAIL_TAKEN for duplicate emails."""
        engine, db = _make_engine_and_session()
        with db:
            _make_user(db, email="dupe@test.com")
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                try:
                    signup("dupe@test.com", "strongpassword", "A", "B")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "EMAIL_TAKEN"

    def test_stores_phone(self):
        """signup should store the phone number when provided."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                signup("phone@test.com", "strongpassword", "A", "B", phone="555-1234")
            user = db.exec(select(User)).first()
            assert user.phone == "555-1234"

    def test_email_failure_does_not_raise(self):
        """signup should not raise if send_verification_email fails."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_email.send_verification_email.side_effect = Exception("SMTP down")
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                result = signup("fail@test.com", "strongpassword", "A", "B")
            assert result["session_token"] == "tok"

    def test_hashes_password(self):
        """signup should store a bcrypt hash, not the plaintext password."""
        engine, db = _make_engine_and_session()
        with db:
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                signup("hash@test.com", "strongpassword", "A", "B")
            user = db.exec(select(User)).first()
            assert user.password_hash != "strongpassword"
            assert user.password_hash.startswith("$2b$")


# ---------------------------------------------------------------------------
# TestLogin
# ---------------------------------------------------------------------------


class TestLogin:
    """Tests for login."""

    def test_returns_session_and_user(self):
        """login should return a dict with session_token and user."""
        engine, db = _make_engine_and_session()
        with db:
            _make_user(db, email="login@test.com")
            mock_session = MagicMock()
            mock_session.create_session.return_value = "session-tok"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                result = login("login@test.com", "securepassword")
            assert result["session_token"] == "session-tok"
            assert result["user"].email == "login@test.com"

    def test_normalizes_email(self):
        """login should normalize email to lowercase before lookup."""
        engine, db = _make_engine_and_session()
        with db:
            _make_user(db, email="norm@test.com")
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                result = login("NORM@TEST.COM", "securepassword")
            assert result["user"].email == "norm@test.com"

    def test_wrong_email_raises_invalid_credentials(self):
        """login should raise AuthError with INVALID_CREDENTIALS for unknown email."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                try:
                    login("nobody@test.com", "securepassword")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "INVALID_CREDENTIALS"

    def test_wrong_password_raises_invalid_credentials(self):
        """login should raise AuthError with INVALID_CREDENTIALS for wrong password."""
        engine, db = _make_engine_and_session()
        with db:
            _make_user(db, email="wrong@test.com")
            with _patched_session(db):
                try:
                    login("wrong@test.com", "wrongpassword")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "INVALID_CREDENTIALS"

    def test_calls_create_session(self):
        """login should call session_service.create_session with user id."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="call@test.com")
            mock_session = MagicMock()
            mock_session.create_session.return_value = "tok"
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                login("call@test.com", "securepassword", ip_address="1.2.3.4", user_agent="Test")
            mock_session.create_session.assert_called_once_with(
                user.id, ip_address="1.2.3.4", user_agent="Test"
            )


# ---------------------------------------------------------------------------
# TestLogout
# ---------------------------------------------------------------------------


class TestLogout:
    """Tests for logout."""

    def test_delegates_to_revoke_session(self):
        """logout should call session_service.revoke_session."""
        mock_session = MagicMock()
        with patch("app.services.auth_service.session_service", mock_session):
            logout("some-token")
        mock_session.revoke_session.assert_called_once_with("some-token")

    def test_does_not_raise_on_invalid_token(self):
        """logout should not raise when the token doesn't exist."""
        mock_session = MagicMock()
        with patch("app.services.auth_service.session_service", mock_session):
            logout("nonexistent-token")


# ---------------------------------------------------------------------------
# TestVerifyEmail
# ---------------------------------------------------------------------------


class TestVerifyEmail:
    """Tests for verify_email."""

    def test_marks_user_verified(self):
        """verify_email should set email_verified to True and email_verified_at."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="verify@test.com")
            raw, _ = _make_verification_token(db, user.id)
            with _patched_session(db):
                verify_email(raw)
            db.refresh(user)
            assert user.email_verified is True
            assert user.email_verified_at is not None

    def test_deletes_all_tokens_for_user(self):
        """verify_email should delete all verification tokens for the user."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="deltok@test.com")
            raw, _ = _make_verification_token(db, user.id)
            _make_verification_token(db, user.id)  # extra token
            with _patched_session(db):
                verify_email(raw)
            remaining = db.exec(select(EmailVerificationToken).where(
                EmailVerificationToken.user_id == user.id
            )).all()
            assert len(remaining) == 0

    def test_invalid_token_raises(self):
        """verify_email should raise AuthError with INVALID_TOKEN for bad token."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                try:
                    verify_email("nonexistent-token")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "INVALID_TOKEN"

    def test_expired_raises(self):
        """verify_email should raise AuthError with TOKEN_EXPIRED for expired token."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="expired@test.com")
            raw, _ = _make_verification_token(
                db, user.id,
                expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
            )
            with _patched_session(db):
                try:
                    verify_email(raw)
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "TOKEN_EXPIRED"

    def test_does_not_affect_other_users(self):
        """verify_email should not mark other users as verified."""
        engine, db = _make_engine_and_session()
        with db:
            user1 = _make_user(db, email="user1@test.com")
            user2 = _make_user(db, email="user2@test.com")
            raw, _ = _make_verification_token(db, user1.id)
            _make_verification_token(db, user2.id)
            with _patched_session(db):
                verify_email(raw)
            db.refresh(user2)
            assert user2.email_verified is False


# ---------------------------------------------------------------------------
# TestResendVerificationEmail
# ---------------------------------------------------------------------------


class TestResendVerificationEmail:
    """Tests for resend_verification_email."""

    def test_creates_token_and_sends_email(self):
        """resend_verification_email should create a new token and send email."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="resend@test.com")
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                resend_verification_email(user.id)
            mock_email.send_verification_email.assert_called_once()
            tokens = db.exec(select(EmailVerificationToken).where(
                EmailVerificationToken.user_id == user.id
            )).all()
            assert len(tokens) == 1

    def test_user_not_found_raises(self):
        """resend_verification_email should raise AuthError with USER_NOT_FOUND."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                try:
                    resend_verification_email(uuid.uuid4())
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "USER_NOT_FOUND"

    def test_already_verified_raises(self):
        """resend_verification_email should raise AuthError with ALREADY_VERIFIED."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="verified@test.com", email_verified=True)
            with _patched_session(db):
                try:
                    resend_verification_email(user.id)
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "ALREADY_VERIFIED"

    def test_deletes_old_tokens_first(self):
        """resend_verification_email should delete old tokens before creating new one."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="old@test.com")
            _make_verification_token(db, user.id)
            _make_verification_token(db, user.id)
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                resend_verification_email(user.id)
            tokens = db.exec(select(EmailVerificationToken).where(
                EmailVerificationToken.user_id == user.id
            )).all()
            assert len(tokens) == 1


# ---------------------------------------------------------------------------
# TestRequestPasswordReset
# ---------------------------------------------------------------------------


class TestRequestPasswordReset:
    """Tests for request_password_reset."""

    def test_creates_token_and_sends_email(self):
        """request_password_reset should create a token and send reset email."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="reset@test.com")
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                request_password_reset("reset@test.com")
            mock_email.send_password_reset_email.assert_called_once()
            tokens = db.exec(select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id
            )).all()
            assert len(tokens) == 1

    def test_unknown_email_returns_silently(self):
        """request_password_reset should not raise for unknown emails."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                request_password_reset("nobody@test.com")

    def test_deletes_old_tokens(self):
        """request_password_reset should delete old reset tokens for the user."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="oldtok@test.com")
            _make_password_reset_token(db, user.id)
            _make_password_reset_token(db, user.id)
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                request_password_reset("oldtok@test.com")
            tokens = db.exec(select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id
            )).all()
            assert len(tokens) == 1

    def test_normalizes_email(self):
        """request_password_reset should normalize email to lowercase."""
        engine, db = _make_engine_and_session()
        with db:
            _make_user(db, email="norm@test.com")
            mock_email = MagicMock()
            mock_config = MagicMock()
            mock_config.APP_URL = "http://localhost"
            with _patched_session(db), \
                 patch("app.services.auth_service.email_service", mock_email), \
                 patch("app.services.auth_service.Config", mock_config):
                request_password_reset("NORM@TEST.COM")
            mock_email.send_password_reset_email.assert_called_once()


# ---------------------------------------------------------------------------
# TestResetPassword
# ---------------------------------------------------------------------------


class TestResetPassword:
    """Tests for reset_password."""

    def test_updates_password_hash(self):
        """reset_password should update the user's password hash."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="newpw@test.com")
            old_hash = user.password_hash
            raw, _ = _make_password_reset_token(db, user.id)
            mock_session = MagicMock()
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                reset_password(raw, "newstrongpassword")
            db.refresh(user)
            assert user.password_hash != old_hash
            assert user.password_hash.startswith("$2b$")

    def test_marks_token_used(self):
        """reset_password should set used_at on the token."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="used@test.com")
            raw, token_row = _make_password_reset_token(db, user.id)
            mock_session = MagicMock()
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                reset_password(raw, "newstrongpassword")
            db.refresh(token_row)
            assert token_row.used_at is not None

    def test_revokes_all_sessions(self):
        """reset_password should call revoke_all_user_sessions."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="revoke@test.com")
            raw, _ = _make_password_reset_token(db, user.id)
            mock_session = MagicMock()
            with _patched_session(db), \
                 patch("app.services.auth_service.session_service", mock_session):
                reset_password(raw, "newstrongpassword")
            mock_session.revoke_all_user_sessions.assert_called_once_with(user.id)

    def test_invalid_token_raises(self):
        """reset_password should raise AuthError with INVALID_TOKEN for bad token."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                try:
                    reset_password("nonexistent-token", "newstrongpassword")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "INVALID_TOKEN"

    def test_used_token_raises(self):
        """reset_password should raise AuthError with INVALID_TOKEN for used token."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="reuse@test.com")
            raw, _ = _make_password_reset_token(
                db, user.id,
                used_at=datetime.now(timezone.utc),
            )
            with _patched_session(db):
                try:
                    reset_password(raw, "newstrongpassword")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "INVALID_TOKEN"

    def test_expired_raises(self):
        """reset_password should raise AuthError with TOKEN_EXPIRED for expired token."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="exp@test.com")
            raw, _ = _make_password_reset_token(
                db, user.id,
                expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
            )
            with _patched_session(db):
                try:
                    reset_password(raw, "newstrongpassword")
                    assert False, "Expected AuthError"
                except AuthError as e:
                    assert e.code == "TOKEN_EXPIRED"
