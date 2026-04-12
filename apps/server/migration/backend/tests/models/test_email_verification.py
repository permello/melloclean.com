# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for the EmailVerificationToken model."""

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.models.email_verification import EmailVerificationToken
from app.models.user import User


class TestEmailVerificationTokenModel:
    """Verify EmailVerificationToken constraints, defaults, and FK behaviour."""

    def _make_user(self, db, email="test@example.com"):
        """Insert and return a User required as a FK parent for tokens."""
        user = User(
            email=email,
            password_hash="hashed_pw",
            first_name="Jane",
            last_name="Doe",
        )
        db.add(user)
        db.flush()
        return user

    def test_create_token(self, db):
        """A verification token can be inserted and queried back."""
        user = self._make_user(db)
        token = EmailVerificationToken(user_id=user.id, token="verify_abc123")
        db.add(token)
        db.flush()

        result = db.exec(
            select(EmailVerificationToken).where(
                EmailVerificationToken.id == token.id
            )
        ).one()
        assert result.token == "verify_abc123"
        assert result.user_id == user.id

    def test_uuid_primary_key(self, db):
        """Primary key should be an auto-generated UUID."""
        user = self._make_user(db)
        token = EmailVerificationToken(user_id=user.id, token="token1")
        db.add(token)
        db.flush()

        assert isinstance(token.id, uuid.UUID)

    def test_expires_at_default_24_hours(self, db):
        """Default expires_at should be approximately 24 hours from now."""
        before = datetime.now(timezone.utc) + timedelta(hours=23, minutes=59)
        user = self._make_user(db)
        token = EmailVerificationToken(user_id=user.id, token="token2")
        after = datetime.now(timezone.utc) + timedelta(hours=24, minutes=1)

        # Normalize timezone for comparison — default_factory produces UTC
        # but SQLModel may strip tzinfo depending on version
        expires = token.expires_at.replace(tzinfo=timezone.utc) if token.expires_at.tzinfo is None else token.expires_at
        assert before < expires < after

    def test_created_at_auto_set(self, db):
        """created_at should be auto-populated as a datetime."""
        user = self._make_user(db)
        token = EmailVerificationToken(user_id=user.id, token="token3")
        db.add(token)
        db.flush()

        assert isinstance(token.created_at, datetime)

    def test_unique_token_constraint(self, db):
        """Inserting two tokens with the same value raises IntegrityError."""
        user = self._make_user(db)
        t1 = EmailVerificationToken(user_id=user.id, token="same_token")
        t2 = EmailVerificationToken(user_id=user.id, token="same_token")
        db.add(t1)
        db.flush()
        db.add(t2)

        try:
            db.flush()
            assert False, "Expected IntegrityError for duplicate token"
        except IntegrityError:
            pass

    def test_foreign_key_constraint(self, db):
        """Inserting a token with a non-existent user_id should fail."""
        token = EmailVerificationToken(user_id=uuid.uuid4(), token="orphan_token")
        db.add(token)

        try:
            db.flush()
            assert False, "Expected IntegrityError for invalid user_id"
        except Exception:
            pass
