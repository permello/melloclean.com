# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Token generation and hashing utilities.

Provides functions to generate cryptographically secure URL-safe tokens
and to hash/verify them using SHA-256.
"""

import hashlib
import secrets


def generate_token(nbytes: int = 32) -> str:
    """Generate a cryptographically secure URL-safe token.

    Args:
        nbytes: Number of random bytes. Defaults to 32 (256 bits of entropy).

    Returns:
        A URL-safe string (~43 characters for 32 bytes).
    """
    return secrets.token_urlsafe(nbytes)


def hash_token(token: str) -> str:
    """Hash a plaintext token using SHA-256.

    Args:
        token: The plaintext token to hash.

    Returns:
        The hex-encoded SHA-256 digest (64 characters).
    """
    return hashlib.sha256(token.encode()).hexdigest()


def verify_token(token: str, hashed: str) -> bool:
    """Verify a plaintext token against a SHA-256 hash.

    Args:
        token: The plaintext token to check.
        hashed: The stored SHA-256 hex digest to verify against.

    Returns:
        True if the token matches the hash, False otherwise.
    """
    return hash_token(token) == hashed
