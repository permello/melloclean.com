"""Tests for the database module.

Verifies that get_session returns a working SQLModel Session
and that the engine is properly configured.
"""

from sqlmodel import Session as DBSession, text

from app.database import get_session, engine


class TestEngine:
    """Tests for the database engine."""

    def test_engine_is_not_none(self):
        """Engine should be created on module import."""
        assert engine is not None


class TestGetSession:
    """Tests for the get_session context manager."""

    def test_returns_session(self):
        """get_session should yield a SQLModel Session."""
        with get_session() as session:
            assert isinstance(session, DBSession)

    def test_session_can_execute_query(self):
        """Session should be able to execute a simple query."""
        with get_session() as session:
            result = session.exec(text("SELECT 1"))
            assert result.scalar() == 1
