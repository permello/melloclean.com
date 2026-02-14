"""Session model — tracks active user login sessions."""

import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Session(SQLModel, table=True):
    """Active authentication session tied to a user.

    The token column stores a hashed JWT — the raw JWT is only ever
    sent to the client and never persisted. ip_address and user_agent
    are optional metadata for auditing and session management UIs.
    """

    __tablename__ = "sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    token: str  # hashed JWT token
    expires_at: datetime
    ip_address: str | None = Field(default=None)
    user_agent: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
