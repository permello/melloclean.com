# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Shared bcrypt hashing helpers.

Provides low-level hash and verify functions used by both
the password and token utility modules.
"""

import bcrypt

COST_FACTOR = 12


def bcrypt_hash(value: str) -> str:
    """Hash a string using bcrypt with the configured cost factor.

    Args:
        value: The plaintext string to hash.

    Returns:
        The bcrypt hash as a UTF-8 string.
    """
    salt = bcrypt.gensalt(rounds=COST_FACTOR)
    return bcrypt.hashpw(value.encode("utf-8"), salt).decode("utf-8")


def bcrypt_verify(value: str, hashed: str) -> bool:
    """Verify a plaintext string against a bcrypt hash.

    Args:
        value: The plaintext string to check.
        hashed: The bcrypt hash to verify against.

    Returns:
        True if the value matches the hash, False otherwise.
    """
    return bcrypt.checkpw(value.encode("utf-8"), hashed.encode("utf-8"))
