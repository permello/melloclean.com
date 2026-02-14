"""Token generation and hashing utilities.

Provides functions to generate cryptographically secure URL-safe tokens
and to hash/verify them using bcrypt.
"""

import secrets

from app.utils.hashing import bcrypt_hash, bcrypt_verify


def generate_token(nbytes: int = 32) -> str:
    """Generate a cryptographically secure URL-safe token.

    Args:
        nbytes: Number of random bytes. Defaults to 32 (256 bits of entropy).

    Returns:
        A URL-safe string (~43 characters for 32 bytes).
    """
    return secrets.token_urlsafe(nbytes)


def hash_token(token: str) -> str:
    """Hash a plaintext token using bcrypt with cost factor 12.

    Args:
        token: The plaintext token to hash.

    Returns:
        The bcrypt hash as a UTF-8 string.
    """
    return bcrypt_hash(token)


def verify_token(token: str, hashed: str) -> bool:
    """Verify a plaintext token against a bcrypt hash.

    Args:
        token: The plaintext token to check.
        hashed: The stored bcrypt hash to verify against.

    Returns:
        True if the token matches the hash, False otherwise.
    """
    return bcrypt_verify(token, hashed)
