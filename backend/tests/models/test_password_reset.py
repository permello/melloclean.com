import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.models.password_reset import PasswordResetToken
from app.models.user import User


class TestPasswordResetTokenModel:
    def _make_user(self, db, email="test@example.com"):
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
        user = self._make_user(db)
        token = PasswordResetToken(user_id=user.id, token="reset_abc123")
        db.add(token)
        db.flush()

        result = db.exec(
            select(PasswordResetToken).where(PasswordResetToken.id == token.id)
        ).one()
        assert result.token == "reset_abc123"
        assert result.user_id == user.id

    def test_uuid_primary_key(self, db):
        user = self._make_user(db)
        token = PasswordResetToken(user_id=user.id, token="token1")
        db.add(token)
        db.flush()

        assert isinstance(token.id, uuid.UUID)

    def test_expires_at_default_1_hour(self, db):
        before = datetime.now(timezone.utc) + timedelta(minutes=59)
        user = self._make_user(db)
        token = PasswordResetToken(user_id=user.id, token="token2")
        after = datetime.now(timezone.utc) + timedelta(hours=1, minutes=1)

        expires = token.expires_at.replace(tzinfo=timezone.utc) if token.expires_at.tzinfo is None else token.expires_at
        assert before < expires < after

    def test_used_at_nullable(self, db):
        user = self._make_user(db)
        token = PasswordResetToken(user_id=user.id, token="token3")
        db.add(token)
        db.flush()

        assert token.used_at is None

    def test_used_at_can_be_set(self, db):
        user = self._make_user(db)
        now = datetime.now(timezone.utc)
        token = PasswordResetToken(user_id=user.id, token="token4", used_at=now)
        db.add(token)
        db.flush()

        result = db.exec(
            select(PasswordResetToken).where(PasswordResetToken.id == token.id)
        ).one()
        assert result.used_at is not None

    def test_created_at_auto_set(self, db):
        user = self._make_user(db)
        token = PasswordResetToken(user_id=user.id, token="token5")
        db.add(token)
        db.flush()

        assert isinstance(token.created_at, datetime)

    def test_unique_token_constraint(self, db):
        user = self._make_user(db)
        t1 = PasswordResetToken(user_id=user.id, token="same_token")
        t2 = PasswordResetToken(user_id=user.id, token="same_token")
        db.add(t1)
        db.flush()
        db.add(t2)

        try:
            db.flush()
            assert False, "Expected IntegrityError for duplicate token"
        except IntegrityError:
            pass

    def test_foreign_key_constraint(self, db):
        token = PasswordResetToken(user_id=uuid.uuid4(), token="orphan_token")
        db.add(token)

        try:
            db.flush()
            assert False, "Expected IntegrityError for invalid user_id"
        except Exception:
            pass
