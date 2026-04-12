# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
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
