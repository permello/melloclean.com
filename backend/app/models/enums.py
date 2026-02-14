"""Role enum for user authorization levels."""

import enum


class Role(str, enum.Enum):
    """User role determining access permissions.

    Inherits from str so the enum value is stored as a plain string
    in the database column (e.g. "CLIENT", not Role.CLIENT).
    """

    CLIENT = "CLIENT"
    WORKER = "WORKER"
    ADMIN = "ADMIN"
