"""Tests for token generation and hashing utilities.

Verifies that generate_token produces unique URL-safe strings,
and that hash_token/verify_token correctly handle token hashing.
"""

from app.utils.tokens import generate_token, hash_token, verify_token


class TestGenerateToken:
    """Tests for generate_token."""

    def test_returns_string(self):
        """generate_token should return a string."""
        token = generate_token()
        assert isinstance(token, str)

    def test_default_length(self):
        """generate_token with 32 bytes should produce ~43 character string."""
        token = generate_token()
        assert len(token) >= 40

    def test_unique_on_each_call(self):
        """Each call should return a unique token."""
        tokens = {generate_token() for _ in range(10)}
        assert len(tokens) == 10

    def test_url_safe_characters(self):
        """generate_token should only contain URL-safe characters."""
        token = generate_token()
        allowed = set(
            "abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "0123456789-_"
        )
        assert all(c in allowed for c in token)

    def test_custom_nbytes(self):
        """generate_token should accept a custom byte count."""
        short_token = generate_token(nbytes=16)
        long_token = generate_token(nbytes=64)
        assert len(short_token) < len(long_token)


class TestHashToken:
    """Tests for hash_token."""

    def test_returns_string(self):
        """hash_token should return a string."""
        token = generate_token()
        result = hash_token(token)
        assert isinstance(result, str)

    def test_returns_bcrypt_hash(self):
        """hash_token should return a valid bcrypt hash."""
        token = generate_token()
        result = hash_token(token)
        assert result.startswith("$2b$12$")

    def test_different_calls_produce_different_hashes(self):
        """Each call should produce a unique hash due to random salt."""
        token = generate_token()
        hash1 = hash_token(token)
        hash2 = hash_token(token)
        assert hash1 != hash2


class TestVerifyToken:
    """Tests for verify_token."""

    def test_correct_token_returns_true(self):
        """verify_token should return True for the correct token."""
        token = generate_token()
        hashed = hash_token(token)
        assert verify_token(token, hashed) is True

    def test_wrong_token_returns_false(self):
        """verify_token should return False for the wrong token."""
        token = generate_token()
        hashed = hash_token(token)
        assert verify_token("wrong-token", hashed) is False

    def test_returns_bool(self):
        """verify_token should return a bool."""
        token = generate_token()
        hashed = hash_token(token)
        result = verify_token(token, hashed)
        assert isinstance(result, bool)
