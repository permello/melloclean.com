# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for session service functions.

Verifies session creation, validation, revocation, and cleanup
using an in-memory SQLite database with patched get_session.
"""

import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from sqlmodel import Session, SQLModel, create_engine, select

from app.models.enums import Role
from app.models.session import Session as SessionModel
from app.models.user import User
from app.services.session_service import (
    cleanup_expired_sessions,
    create_session,
    get_user_sessions,
    revoke_all_user_sessions,
    revoke_session,
    validate_session,
)
from app.utils.tokens import hash_token


def _make_user(db: Session, **overrides) -> User:
    """Insert a User with sensible defaults and return it."""
    defaults = {
        "id": uuid.uuid4(),
        "email": f"{uuid.uuid4().hex[:8]}@example.com",
        "password_hash": "$2b$12$fakehashvalue",
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


@contextmanager
def _patched_session(db: Session):
    """Patch get_session to yield the test db with commit → flush."""
    original_commit = db.commit

    def _flush_instead():
        db.flush()

    db.commit = _flush_instead

    @contextmanager
    def _fake_get_session():
        yield db

    try:
        with patch("app.services.session_service.get_session", _fake_get_session):
            yield db
    finally:
        db.commit = original_commit


def _make_engine_and_session():
    """Create an in-memory SQLite engine and session."""
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine, Session(engine)


class TestCreateSession:
    """Tests for create_session."""

    def test_returns_token_string(self):
        """create_session should return a raw token string."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                token = create_session(user.id)
            assert isinstance(token, str)
            assert len(token) >= 40

    def test_stores_hashed_token_in_db(self):
        """The stored token should be the SHA-256 hash of the raw token."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                token = create_session(user.id)
            row = db.exec(select(SessionModel)).first()
            assert row.token == hash_token(token)

    def test_sets_30_day_expiry(self):
        """Session should expire approximately 30 days from now."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                token = create_session(user.id)
            row = db.exec(select(SessionModel)).first()
            expected = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30)
            delta = abs((row.expires_at.replace(tzinfo=None) - expected).total_seconds())
            assert delta < 5

    def test_stores_ip_and_user_agent(self):
        """create_session should store optional ip_address and user_agent."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id, ip_address="1.2.3.4", user_agent="TestBrowser")
            row = db.exec(select(SessionModel)).first()
            assert row.ip_address == "1.2.3.4"
            assert row.user_agent == "TestBrowser"


class TestValidateSession:
    """Tests for validate_session."""

    def test_valid_token_returns_user_dict(self):
        """validate_session should return a dict with session_id and user info."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db, email="valid@example.com", first_name="Alice", last_name="Smith")
            with _patched_session(db):
                token = create_session(user.id)
                result = validate_session(token)
            assert result is not None
            assert "session_id" in result
            assert result["user"]["email"] == "valid@example.com"
            assert result["user"]["first_name"] == "Alice"
            assert result["user"]["last_name"] == "Smith"
            assert result["user"]["role"] == Role.CLIENT
            assert "created_at" in result["user"]

    def test_missing_token_returns_none(self):
        """validate_session should return None for a token not in DB."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                result = validate_session("nonexistent-token")
            assert result is None

    def test_expired_token_returns_none_and_deletes(self):
        """validate_session should return None and delete expired sessions."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                token = create_session(user.id)
            # Manually expire the session
            row = db.exec(select(SessionModel)).first()
            row.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
            db.flush()
            with _patched_session(db):
                result = validate_session(token)
            assert result is None
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 0


class TestRevokeSession:
    """Tests for revoke_session."""

    def test_deletes_session(self):
        """revoke_session should remove the session from DB."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                token = create_session(user.id)
                revoke_session(token)
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 0

    def test_idempotent_on_missing_token(self):
        """revoke_session should not raise for a token not in DB."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                revoke_session("nonexistent-token")


class TestRevokeAllUserSessions:
    """Tests for revoke_all_user_sessions."""

    def test_deletes_all_user_sessions(self):
        """Should delete all sessions for the given user."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id)
                create_session(user.id)
                create_session(user.id)
                revoke_all_user_sessions(user.id)
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 0

    def test_does_not_affect_other_users(self):
        """Should only delete sessions for the specified user."""
        engine, db = _make_engine_and_session()
        with db:
            user1 = _make_user(db)
            user2 = _make_user(db)
            with _patched_session(db):
                create_session(user1.id)
                create_session(user2.id)
                revoke_all_user_sessions(user1.id)
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 1
            assert remaining[0].user_id == user2.id


class TestGetUserSessions:
    """Tests for get_user_sessions."""

    def test_returns_active_sessions_newest_first(self):
        """Should return sessions ordered by created_at descending."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id, ip_address="1.1.1.1")
                create_session(user.id, ip_address="2.2.2.2")
                sessions = get_user_sessions(user.id)
            assert len(sessions) == 2
            assert sessions[0]["ip_address"] == "2.2.2.2"
            assert sessions[1]["ip_address"] == "1.1.1.1"

    def test_excludes_expired(self):
        """Should not return expired sessions."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id)
            # Expire the session
            row = db.exec(select(SessionModel)).first()
            row.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
            db.flush()
            with _patched_session(db):
                sessions = get_user_sessions(user.id)
            assert len(sessions) == 0

    def test_empty_list_when_none(self):
        """Should return empty list when user has no sessions."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                sessions = get_user_sessions(user.id)
            assert sessions == []


class TestCleanupExpiredSessions:
    """Tests for cleanup_expired_sessions."""

    def test_deletes_expired_returns_count(self):
        """Should delete expired sessions and return the count."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id)
                create_session(user.id)
            # Expire both sessions
            for row in db.exec(select(SessionModel)).all():
                row.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
            db.flush()
            with _patched_session(db):
                count = cleanup_expired_sessions()
            assert count == 2
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 0

    def test_preserves_active(self):
        """Should not delete active sessions."""
        engine, db = _make_engine_and_session()
        with db:
            user = _make_user(db)
            with _patched_session(db):
                create_session(user.id)
                create_session(user.id)
            # Expire only one
            rows = db.exec(select(SessionModel)).all()
            rows[0].expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
            db.flush()
            with _patched_session(db):
                count = cleanup_expired_sessions()
            assert count == 1
            remaining = db.exec(select(SessionModel)).all()
            assert len(remaining) == 1

    def test_returns_zero_when_none(self):
        """Should return 0 when there are no expired sessions."""
        engine, db = _make_engine_and_session()
        with db:
            with _patched_session(db):
                count = cleanup_expired_sessions()
            assert count == 0
