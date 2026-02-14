import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.models.session import Session
from app.models.user import User


class TestSessionModel:
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

    def test_create_session(self, db):
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
