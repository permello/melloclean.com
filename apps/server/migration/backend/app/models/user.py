# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""User model — core account table for all authenticated users."""

import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel

from app.models.enums import Role


class User(SQLModel, table=True):
    """Registered user account.

    UUID primary key prevents enumeration attacks. The email column
    has a unique index for fast login lookups. updated_at is only on
    this model because User is the only table that receives updates;
    token tables are insert-only.
    """

    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str  # bcrypt hash — never store plaintext
    first_name: str
    last_name: str
    street: str = Field(default="")
    city: str = Field(default="")
    state: str = Field(default="")
    zip_code: str = Field(default="")
    role: Role = Field(default=Role.CLIENT)
    email_verified: bool = Field(default=False)
    email_verified_at: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
