"""Tests for the User model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.models.enums import Role
from app.models.user import User


class TestUserModel:
    """Verify User table constraints, defaults, and CRUD operations."""

    def _make_user(self, **overrides):
        """Create a User instance with sensible defaults.

        Any keyword argument overrides the corresponding default field.
        """
        defaults = dict(
            email="test@example.com",
            password_hash="hashed_pw",
            first_name="Jane",
            last_name="Doe",
        )
        defaults.update(overrides)
        return User(**defaults)

    def test_create_user(self, db):
        """A user can be inserted and queried back by email."""
        user = self._make_user()
        db.add(user)
        db.flush()

        result = db.exec(select(User).where(User.email == "test@example.com")).one()
        assert result.first_name == "Jane"
        assert result.last_name == "Doe"

    def test_uuid_primary_key(self, db):
        """Primary key should be an auto-generated UUID."""
        user = self._make_user()
        db.add(user)
        db.flush()

        assert isinstance(user.id, uuid.UUID)

    def test_default_role_is_client(self, db):
        """New users default to the CLIENT role."""
        user = self._make_user()
        db.add(user)
        db.flush()

        assert user.role == Role.CLIENT

    def test_role_can_be_set(self, db):
        """Role can be explicitly set to ADMIN."""
        user = self._make_user(role=Role.ADMIN)
        db.add(user)
        db.flush()

        result = db.exec(select(User).where(User.id == user.id)).one()
        assert result.role == Role.ADMIN

    def test_role_worker(self, db):
        """Role can be explicitly set to WORKER."""
        user = self._make_user(email="worker@example.com", role=Role.WORKER)
        db.add(user)
        db.flush()

        result = db.exec(select(User).where(User.id == user.id)).one()
        assert result.role == Role.WORKER

    def test_email_verified_defaults_false(self, db):
        """New users start with email_verified=False and no verification timestamp."""
        user = self._make_user()
        db.add(user)
        db.flush()

        assert user.email_verified is False
        assert user.email_verified_at is None

    def test_phone_nullable(self, db):
        """Phone number defaults to None when not provided."""
        user = self._make_user()
        db.add(user)
        db.flush()

        assert user.phone is None

    def test_phone_can_be_set(self, db):
        """Phone number can be set to a string value."""
        user = self._make_user(phone="555-1234")
        db.add(user)
        db.flush()

        assert user.phone == "555-1234"

    def test_timestamps_auto_set(self, db):
        """created_at and updated_at should be auto-populated datetimes."""
        user = self._make_user()
        db.add(user)
        db.flush()

        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)

    def test_unique_email_constraint(self, db):
        """Inserting two users with the same email raises IntegrityError."""
        user1 = self._make_user()
        user2 = self._make_user()
        db.add(user1)
        db.flush()
        db.add(user2)

        try:
            db.flush()
            assert False, "Expected IntegrityError for duplicate email"
        except IntegrityError:
            pass
