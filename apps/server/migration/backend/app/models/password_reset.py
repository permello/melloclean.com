# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""PasswordResetToken model — one-time tokens for resetting forgotten passwords."""

import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import Field, SQLModel


class PasswordResetToken(SQLModel, table=True):
    """Token emailed to a user to allow a password reset.

    Expires 1 hour after creation. The used_at column marks single-use
    behaviour — once set, the token cannot be reused even if it hasn't
    expired. The token column is unique and indexed for fast lookups.
    """

    __tablename__ = "password_reset_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    token: str = Field(unique=True, index=True)
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=1)
    )
    used_at: datetime | None = Field(default=None)  # set when token is consumed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
