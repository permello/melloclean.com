# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Session service — manages server-side authentication sessions.

Provides functions to create, validate, revoke, and clean up
sessions stored in PostgreSQL with SHA-256 hashed tokens.
"""

import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.config import Config
from app.database import get_session
from app.models.session import Session
from app.models.user import User
from app.utils.tokens import generate_token, hash_token


def create_session(
    user_id: uuid.UUID,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> str:
    """Create a new session for a user and return the raw token.

    Args:
        user_id: The user's UUID.
        ip_address: Optional client IP address for auditing.
        user_agent: Optional client user-agent string for auditing.

    Returns:
        The raw (unhashed) session token to send to the client.
    """
    raw_token = generate_token()
    hashed = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=Config.SESSION_DURATION_DAYS)

    session = Session(
        user_id=user_id,
        token=hashed,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    with get_session() as db:
        db.add(session)
        db.commit()

    return raw_token


def validate_session(token: str) -> dict | None:
    """Validate a session token and return user info if valid.

    If the session exists but is expired, it is deleted and None is returned.

    Args:
        token: The raw session token from the client cookie.

    Returns:
        A dict with session_id and user info, or None if invalid/expired.
    """
    hashed = hash_token(token)

    with get_session() as db:
        session = db.exec(select(Session).where(Session.token == hashed)).first()

        if session is None:
            return None

        expires = session.expires_at if session.expires_at.tzinfo else session.expires_at.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            db.delete(session)
            db.commit()
            return None

        user = db.get(User, session.user_id)

        return {
            "session_id": session.id,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "email_verified": user.email_verified,
                "created_at": user.created_at,
            },
        }


def revoke_session(token: str) -> None:
    """Revoke a session by its raw token.

    Idempotent — does nothing if the token is not found.

    Args:
        token: The raw session token to revoke.
    """
    hashed = hash_token(token)

    with get_session() as db:
        session = db.exec(select(Session).where(Session.token == hashed)).first()
        if session is not None:
            db.delete(session)
            db.commit()


def revoke_all_user_sessions(user_id: uuid.UUID) -> None:
    """Revoke all sessions for a given user.

    Args:
        user_id: The user's UUID.
    """
    with get_session() as db:
        sessions = db.exec(select(Session).where(Session.user_id == user_id)).all()
        for session in sessions:
            db.delete(session)
        db.commit()


def get_user_sessions(user_id: uuid.UUID) -> list[dict]:
    """Get all active sessions for a user, newest first.

    Args:
        user_id: The user's UUID.

    Returns:
        A list of session dicts with id, ip_address, user_agent,
        created_at, and expires_at.
    """
    now = datetime.now(timezone.utc)

    with get_session() as db:
        sessions = db.exec(
            select(Session)
            .where(Session.user_id == user_id, Session.expires_at > now)
            .order_by(Session.created_at.desc())
        ).all()

        return [
            {
                "id": s.id,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "created_at": s.created_at,
                "expires_at": s.expires_at,
            }
            for s in sessions
        ]


def cleanup_expired_sessions() -> int:
    """Delete all expired sessions from the database.

    Returns:
        The number of sessions deleted.
    """
    now = datetime.now(timezone.utc)

    with get_session() as db:
        expired = db.exec(select(Session).where(Session.expires_at <= now)).all()
        count = len(expired)
        for session in expired:
            db.delete(session)
        db.commit()

    return count
