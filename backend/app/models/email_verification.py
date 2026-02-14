"""EmailVerificationToken model — one-time tokens for confirming email ownership."""

import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import Field, SQLModel


class EmailVerificationToken(SQLModel, table=True):
    """Token sent to a user's email to verify ownership.

    Expires 24 hours after creation. The token column is unique and
    indexed for fast lookups when the user clicks the verification link.
    This is an insert-only table — tokens are never updated.
    """

    __tablename__ = "email_verification_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    token: str = Field(unique=True, index=True)
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
