"""Password hashing utilities.

Provides functions to hash and verify passwords using bcrypt.
Passwords must be at least 8 characters long.
"""

from app.utils.hashing import bcrypt_hash, bcrypt_verify

MIN_PASSWORD_LENGTH = 8


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with cost factor 12.

    Args:
        password: The plaintext password to hash. Must be at least
            8 characters long.

    Returns:
        The bcrypt hash as a UTF-8 string.

    Raises:
        ValueError: If the password is empty or shorter than 8 characters.
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
        )
    return bcrypt_hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash.

    Args:
        password: The plaintext password to check.
        hashed: The stored bcrypt hash to verify against.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return bcrypt_verify(password, hashed)
