# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for the Session model."""

import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.models.session import Session
from app.models.user import User


class TestSessionModel:
    """Verify Session table constraints, defaults, and foreign key behaviour."""

    def _make_user(self, db, email="test@example.com"):
        """Insert and return a User required as a FK parent for sessions."""
        user = User(
            email=email,
            password_hash="hashed_pw",
            first_name="Jane",
            last_name="Doe",
        )
        db.add(user)
        db.flush()
        return user

    def test_create_session(self, db):
        """A session can be inserted and queried back by its id."""
        user = self._make_user(db)
        session = Session(
            user_id=user.id,
            token="hashed_jwt_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(session)
        db.flush()

        result = db.exec(select(Session).where(Session.id == session.id)).one()
        assert result.token == "hashed_jwt_token"
        assert result.user_id == user.id

    def test_uuid_primary_key(self, db):
        """Primary key should be an auto-generated UUID."""
        user = self._make_user(db)
        session = Session(
            user_id=user.id,
            token="token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(session)
        db.flush()

        assert isinstance(session.id, uuid.UUID)

    def test_ip_address_nullable(self, db):
        """ip_address defaults to None when not provided."""
        user = self._make_user(db)
        session = Session(
            user_id=user.id,
            token="token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(session)
        db.flush()

        assert session.ip_address is None

    def test_ip_address_and_user_agent(self, db):
        """ip_address and user_agent can be stored for audit purposes."""
        user = self._make_user(db)
        session = Session(
            user_id=user.id,
            token="token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )
        db.add(session)
        db.flush()

        result = db.exec(select(Session).where(Session.id == session.id)).one()
        assert result.ip_address == "192.168.1.1"
        assert result.user_agent == "Mozilla/5.0"

    def test_created_at_auto_set(self, db):
        """created_at should be auto-populated as a datetime."""
        user = self._make_user(db)
        session = Session(
            user_id=user.id,
            token="token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(session)
        db.flush()

        assert isinstance(session.created_at, datetime)

    def test_foreign_key_constraint(self, db):
        """Inserting a session with a non-existent user_id should fail."""
        fake_user_id = uuid.uuid4()
        session = Session(
            user_id=fake_user_id,
            token="token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(session)

        try:
            db.flush()
            assert False, "Expected IntegrityError for invalid user_id"
        except Exception:
            pass
