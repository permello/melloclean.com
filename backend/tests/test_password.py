"""Tests for password hashing utilities.

Verifies that hash_password produces valid bcrypt hashes
and that verify_password correctly validates passwords.
"""

import pytest

from app.utils.password import hash_password, verify_password


class TestHashPassword:
    """Tests for hash_password."""

    def test_returns_string(self):
        """hash_password should return a string."""
        result = hash_password("validpass")
        assert isinstance(result, str)

    def test_returns_bcrypt_hash(self):
        """hash_password should return a valid bcrypt hash."""
        result = hash_password("validpass")
        assert result.startswith("$2b$")

    def test_uses_cost_factor_12(self):
        """hash_password should use bcrypt cost factor 12."""
        result = hash_password("validpass")
        assert result.startswith("$2b$12$")

    def test_different_calls_produce_different_hashes(self):
        """Each call should produce a unique hash due to random salt."""
        hash1 = hash_password("validpass")
        hash2 = hash_password("validpass")
        assert hash1 != hash2

    def test_handles_unicode_password(self):
        """hash_password should handle unicode characters."""
        result = hash_password("pässwörd")
        assert result.startswith("$2b$12$")

    def test_rejects_empty_string(self):
        """hash_password should reject an empty string."""
        with pytest.raises(ValueError):
            hash_password("")

    def test_rejects_password_shorter_than_8_characters(self):
        """hash_password should reject passwords shorter than 8 characters."""
        with pytest.raises(ValueError):
            hash_password("short")

    def test_accepts_exactly_8_characters(self):
        """hash_password should accept a password with exactly 8 characters."""
        result = hash_password("12345678")
        assert result.startswith("$2b$12$")


class TestVerifyPassword:
    """Tests for verify_password."""

    def test_correct_password_returns_true(self):
        """verify_password should return True for the correct password."""
        hashed = hash_password("validpass")
        assert verify_password("validpass", hashed) is True

    def test_wrong_password_returns_false(self):
        """verify_password should return False for the wrong password."""
        hashed = hash_password("validpass")
        assert verify_password("wrongpass", hashed) is False

    def test_returns_bool(self):
        """verify_password should return a bool."""
        hashed = hash_password("validpass")
        result = verify_password("validpass", hashed)
        assert isinstance(result, bool)

    def test_unicode_password_round_trip(self):
        """verify_password should work with unicode passwords."""
        hashed = hash_password("pässwörd")
        assert verify_password("pässwörd", hashed) is True
        assert verify_password("password", hashed) is False
