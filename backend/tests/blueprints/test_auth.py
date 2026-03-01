"""Tests for auth blueprint routes.

Verifies all eight /api/auth endpoints: signup, login, logout, me,
verify-email, forgot-password, reset-password, and resend-verification.
Each test uses a Flask test client with mocked service-layer dependencies.
"""

import uuid
from http.cookies import SimpleCookie
from unittest.mock import MagicMock, patch

import pytest
from flask import Flask

from app import create_app
from app.errors import AuthError
from app.middleware import COOKIE_NAME
from app.models.enums import Role
from app.models.user import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_cookie(response, name):
    """Extract a cookie morsel from a response's Set-Cookie headers."""
    for header in response.headers.getlist("Set-Cookie"):
        sc = SimpleCookie()
        sc.load(header)
        if name in sc:
            return sc[name]
    return None


def _make_user_obj(**overrides):
    """Build a User model object (not persisted) with sensible defaults."""
    defaults = {
        "id": uuid.uuid4(),
        "email": "test@example.com",
        "password_hash": "$2b$12$fakehash",
        "first_name": "Test",
        "last_name": "User",
        "phone": None,
        "role": Role.CLIENT,
        "email_verified": False,
    }
    defaults.update(overrides)
    return User(**defaults)


def _valid_session_result(role=Role.CLIENT, **user_overrides):
    """Return a dict matching validate_session's success shape."""
    user_id = user_overrides.pop("id", uuid.uuid4())
    return {
        "session_id": uuid.uuid4(),
        "user": {
            "id": user_id,
            "email": user_overrides.get("email", "test@example.com"),
            "first_name": user_overrides.get("first_name", "Test"),
            "last_name": user_overrides.get("last_name", "User"),
            "role": role,
            "email_verified": user_overrides.get("email_verified", True),
        },
    }


def _auth_client(client, session_result):
    """Return a context manager that patches validate_session for auth."""
    client.set_cookie(COOKIE_NAME, "valid-token")
    return patch(
        "app.middleware.auth.validate_session", return_value=session_result
    )


@pytest.fixture
def app():
    """Create a Flask test app with mocked config."""
    with patch("app.config.Config") as mock_config:
        mock_config.CORS_ORIGINS = "http://localhost:3000"
        mock_config.SESSION_DURATION_DAYS = 30
        test_app = create_app()
        test_app.config["TESTING"] = True
        yield test_app


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


# ---------------------------------------------------------------------------
# POST /api/auth/signup
# ---------------------------------------------------------------------------


class TestSignup:
    """Tests for POST /api/auth/signup."""

    def test_returns_201_with_user(self, client):
        """Successful signup returns 201 with user data and session cookie."""
        user = _make_user_obj(email="new@test.com", first_name="Jane")
        mock_result = {"session_token": "raw-tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.return_value = mock_result
            resp = client.post("/api/auth/signup", json={
                "email": "new@test.com",
                "password": "strongpassword",
                "firstName": "Jane",
                "lastName": "Doe",
            })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["user"]["email"] == "new@test.com"
        cookie = _get_cookie(resp, COOKIE_NAME)
        assert cookie is not None
        assert cookie.value == "raw-tok"

    def test_passes_ip_and_user_agent(self, client):
        """Signup should forward IP and User-Agent to the service."""
        user = _make_user_obj()
        mock_result = {"session_token": "tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.return_value = mock_result
            client.post(
                "/api/auth/signup",
                json={
                    "email": "ip@test.com",
                    "password": "strongpassword",
                    "firstName": "A",
                    "lastName": "B",
                },
                headers={"User-Agent": "TestBrowser/1.0"},
            )
            call_kwargs = mock_svc.signup.call_args[1]
            assert "ip_address" in call_kwargs
            assert call_kwargs["user_agent"] == "TestBrowser/1.0"

    def test_optional_phone(self, client):
        """Signup should forward phone when provided."""
        user = _make_user_obj()
        mock_result = {"session_token": "tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.return_value = mock_result
            client.post("/api/auth/signup", json={
                "email": "phone@test.com",
                "password": "strongpassword",
                "firstName": "A",
                "lastName": "B",
                "phone": "555-1234",
            })
            call_kwargs = mock_svc.signup.call_args[1]
            assert call_kwargs["phone"] == "555-1234"

    def test_missing_email_returns_400(self, client):
        """Signup without email returns 400."""
        resp = client.post("/api/auth/signup", json={
            "password": "strongpassword",
            "firstName": "A",
            "lastName": "B",
        })
        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_missing_password_returns_400(self, client):
        """Signup without password returns 400."""
        resp = client.post("/api/auth/signup", json={
            "email": "a@b.com",
            "firstName": "A",
            "lastName": "B",
        })
        assert resp.status_code == 400

    def test_missing_first_name_returns_400(self, client):
        """Signup without firstName returns 400."""
        resp = client.post("/api/auth/signup", json={
            "email": "a@b.com",
            "password": "strongpassword",
            "lastName": "B",
        })
        assert resp.status_code == 400

    def test_missing_last_name_returns_400(self, client):
        """Signup without lastName returns 400."""
        resp = client.post("/api/auth/signup", json={
            "email": "a@b.com",
            "password": "strongpassword",
            "firstName": "A",
        })
        assert resp.status_code == 400

    def test_short_password_returns_400(self, client):
        """Password shorter than 8 chars returns 400."""
        resp = client.post("/api/auth/signup", json={
            "email": "a@b.com",
            "password": "short",
            "firstName": "A",
            "lastName": "B",
        })
        assert resp.status_code == 400

    def test_duplicate_email_returns_409(self, client):
        """EMAIL_TAKEN error returns 409."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.side_effect = AuthError(
                "A user with this email already exists.", "EMAIL_TAKEN"
            )
            resp = client.post("/api/auth/signup", json={
                "email": "dupe@test.com",
                "password": "strongpassword",
                "firstName": "A",
                "lastName": "B",
            })
        assert resp.status_code == 409
        data = resp.get_json()
        assert data["code"] == "EMAIL_TAKEN"


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------


class TestLogin:
    """Tests for POST /api/auth/login."""

    def test_returns_200_with_user_and_cookie(self, client):
        """Successful login returns 200 with user data and session cookie."""
        user = _make_user_obj(email="login@test.com")
        mock_result = {"session_token": "raw-tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.login.return_value = mock_result
            resp = client.post("/api/auth/login", json={
                "email": "login@test.com",
                "password": "strongpassword",
            })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == "login@test.com"
        cookie = _get_cookie(resp, COOKIE_NAME)
        assert cookie is not None
        assert cookie.value == "raw-tok"

    def test_passes_ip_and_user_agent(self, client):
        """Login should forward IP and User-Agent to the service."""
        user = _make_user_obj()
        mock_result = {"session_token": "tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.login.return_value = mock_result
            client.post(
                "/api/auth/login",
                json={"email": "ip@test.com", "password": "strongpassword"},
                headers={"User-Agent": "TestBrowser/1.0"},
            )
            call_kwargs = mock_svc.login.call_args[1]
            assert "ip_address" in call_kwargs
            assert call_kwargs["user_agent"] == "TestBrowser/1.0"

    def test_missing_email_returns_400(self, client):
        """Login without email returns 400."""
        resp = client.post("/api/auth/login", json={
            "password": "strongpassword",
        })
        assert resp.status_code == 400

    def test_missing_password_returns_400(self, client):
        """Login without password returns 400."""
        resp = client.post("/api/auth/login", json={
            "email": "a@b.com",
        })
        assert resp.status_code == 400

    def test_invalid_credentials_returns_401(self, client):
        """INVALID_CREDENTIALS error returns 401."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.login.side_effect = AuthError(
                "Invalid email or password.", "INVALID_CREDENTIALS"
            )
            resp = client.post("/api/auth/login", json={
                "email": "bad@test.com",
                "password": "wrongpassword",
            })
        assert resp.status_code == 401
        data = resp.get_json()
        assert data["code"] == "INVALID_CREDENTIALS"


# ---------------------------------------------------------------------------
# POST /api/auth/logout
# ---------------------------------------------------------------------------


class TestLogout:
    """Tests for POST /api/auth/logout."""

    def test_returns_200_and_clears_cookie(self, client):
        """Successful logout returns 200 and clears the session cookie."""
        session_result = _valid_session_result()
        with _auth_client(client, session_result):
            with patch("app.blueprints.auth.auth_service") as mock_svc:
                resp = client.post("/api/auth/logout")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        cookie = _get_cookie(resp, COOKIE_NAME)
        assert cookie is not None
        assert cookie["max-age"] == "0"

    def test_calls_logout_with_session_token(self, client):
        """Logout should call auth_service.logout with g.session_token."""
        session_result = _valid_session_result()
        with _auth_client(client, session_result):
            with patch("app.blueprints.auth.auth_service") as mock_svc:
                client.post("/api/auth/logout")
                mock_svc.logout.assert_called_once_with("valid-token")

    def test_returns_401_without_auth(self, client):
        """Logout without authentication returns 401."""
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------


class TestMe:
    """Tests for GET /api/auth/me."""

    def test_returns_200_with_user_info(self, client):
        """Authenticated /me returns 200 with user details."""
        user_id = uuid.uuid4()
        session_result = _valid_session_result(
            id=user_id,
            email="me@test.com",
            first_name="Jane",
            last_name="Doe",
            role=Role.CLIENT,
            email_verified=True,
        )
        with _auth_client(client, session_result):
            resp = client.get("/api/auth/me")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["id"] == str(user_id)
        assert data["email"] == "me@test.com"
        assert data["first_name"] == "Jane"
        assert data["last_name"] == "Doe"
        assert data["role"] == "CLIENT"
        assert data["email_verified"] is True

    def test_returns_401_without_auth(self, client):
        """Unauthenticated /me returns 401."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# POST /api/auth/verify-email
# ---------------------------------------------------------------------------


class TestVerifyEmail:
    """Tests for POST /api/auth/verify-email."""

    def test_returns_200_on_success(self, client):
        """Valid token returns 200 with success."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            resp = client.post("/api/auth/verify-email", json={
                "token": "valid-token",
            })
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
        mock_svc.verify_email.assert_called_once_with("valid-token")

    def test_missing_token_returns_400(self, client):
        """Missing token returns 400."""
        resp = client.post("/api/auth/verify-email", json={})
        assert resp.status_code == 400

    def test_invalid_token_returns_400(self, client):
        """INVALID_TOKEN error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.verify_email.side_effect = AuthError(
                "Invalid verification token.", "INVALID_TOKEN"
            )
            resp = client.post("/api/auth/verify-email", json={
                "token": "bad-token",
            })
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["code"] == "INVALID_TOKEN"

    def test_expired_token_returns_400(self, client):
        """TOKEN_EXPIRED error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.verify_email.side_effect = AuthError(
                "Verification token has expired.", "TOKEN_EXPIRED"
            )
            resp = client.post("/api/auth/verify-email", json={
                "token": "expired-token",
            })
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["code"] == "TOKEN_EXPIRED"


# ---------------------------------------------------------------------------
# POST /api/auth/forgot-password
# ---------------------------------------------------------------------------


class TestForgotPassword:
    """Tests for POST /api/auth/forgot-password."""

    def test_returns_200_always(self, client):
        """Forgot password always returns 200 regardless of email existence."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            resp = client.post("/api/auth/forgot-password", json={
                "email": "any@test.com",
            })
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
        mock_svc.request_password_reset.assert_called_once_with("any@test.com")

    def test_missing_email_returns_400(self, client):
        """Missing email returns 400."""
        resp = client.post("/api/auth/forgot-password", json={})
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# POST /api/auth/reset-password
# ---------------------------------------------------------------------------


class TestResetPassword:
    """Tests for POST /api/auth/reset-password."""

    def test_returns_200_on_success(self, client):
        """Valid reset returns 200 with success."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            resp = client.post("/api/auth/reset-password", json={
                "token": "valid-token",
                "password": "newstrongpassword",
            })
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
        mock_svc.reset_password.assert_called_once_with(
            "valid-token", "newstrongpassword"
        )

    def test_missing_token_returns_400(self, client):
        """Missing token returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "password": "newstrongpassword",
        })
        assert resp.status_code == 400

    def test_missing_password_returns_400(self, client):
        """Missing password returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
        })
        assert resp.status_code == 400

    def test_short_password_returns_400(self, client):
        """Password shorter than 8 chars returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
            "password": "short",
        })
        assert resp.status_code == 400

    def test_invalid_token_returns_400(self, client):
        """INVALID_TOKEN error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.reset_password.side_effect = AuthError(
                "Invalid reset token.", "INVALID_TOKEN"
            )
            resp = client.post("/api/auth/reset-password", json={
                "token": "bad-token",
                "password": "newstrongpassword",
            })
        assert resp.status_code == 400
        assert resp.get_json()["code"] == "INVALID_TOKEN"

    def test_expired_token_returns_400(self, client):
        """TOKEN_EXPIRED error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.reset_password.side_effect = AuthError(
                "Reset token has expired.", "TOKEN_EXPIRED"
            )
            resp = client.post("/api/auth/reset-password", json={
                "token": "expired-token",
                "password": "newstrongpassword",
            })
        assert resp.status_code == 400
        assert resp.get_json()["code"] == "TOKEN_EXPIRED"


# ---------------------------------------------------------------------------
# POST /api/auth/resend-verification
# ---------------------------------------------------------------------------


class TestResendVerification:
    """Tests for POST /api/auth/resend-verification."""

    def test_returns_200_on_success(self, client):
        """Authenticated resend returns 200."""
        user_id = uuid.uuid4()
        session_result = _valid_session_result(id=user_id)
        with _auth_client(client, session_result):
            with patch("app.blueprints.auth.auth_service") as mock_svc:
                resp = client.post("/api/auth/resend-verification")
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
        mock_svc.resend_verification_email.assert_called_once_with(user_id)

    def test_returns_401_without_auth(self, client):
        """Unauthenticated resend returns 401."""
        resp = client.post("/api/auth/resend-verification")
        assert resp.status_code == 401

    def test_already_verified_returns_400(self, client):
        """ALREADY_VERIFIED error returns 400."""
        session_result = _valid_session_result()
        with _auth_client(client, session_result):
            with patch("app.blueprints.auth.auth_service") as mock_svc:
                mock_svc.resend_verification_email.side_effect = AuthError(
                    "Email is already verified.", "ALREADY_VERIFIED"
                )
                resp = client.post("/api/auth/resend-verification")
        assert resp.status_code == 400
        assert resp.get_json()["code"] == "ALREADY_VERIFIED"
