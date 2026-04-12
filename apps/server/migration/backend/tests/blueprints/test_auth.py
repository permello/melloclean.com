# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for auth blueprint routes.

Verifies all eight /api/auth endpoints: signup, login, logout, me,
verify-email, forgot-password, reset-password, and resend-verification.
Each test uses a Flask test client with mocked service-layer dependencies.
"""

import uuid
from datetime import datetime, timezone
from http import HTTPStatus
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
        "role": Role.CLIENT,
        "email_verified": False,
    }
    defaults.update(overrides)
    return User(**defaults)


def _valid_signup_payload(**overrides):
    """Return a valid signup payload dict with sensible defaults."""
    defaults = {
        "email": "new@test.com",
        "password": "strongpassword",
        "confirmPassword": "strongpassword",
        "firstName": "Jane",
        "lastName": "Doe",
        "street": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "zipCode": "62701",
    }
    defaults.update(overrides)
    return defaults


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
            "created_at": datetime.now(tz=timezone.utc),
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
            resp = client.post("/api/auth/signup", json=_valid_signup_payload())
        assert resp.status_code == HTTPStatus.CREATED
        data = resp.get_json()
        assert data["data"]["user"]["email"] == "new@test.com"
        assert "id" in data["data"]["user"]
        assert data["data"]["user"]["role"] == "CLIENT"
        assert "created_at" in data["data"]["user"]
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
                json=_valid_signup_payload(email="ip@test.com"),
                headers={"User-Agent": "TestBrowser/1.0"},
            )
            call_kwargs = mock_svc.signup.call_args[1]
            assert "ip_address" in call_kwargs
            assert call_kwargs["user_agent"] == "TestBrowser/1.0"

    def test_passes_address_fields_to_service(self, client):
        """Signup should forward address fields to auth_service.signup."""
        user = _make_user_obj()
        mock_result = {"session_token": "tok", "user": user}
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.return_value = mock_result
            client.post("/api/auth/signup", json=_valid_signup_payload())
            call_kwargs = mock_svc.signup.call_args[1]
            assert call_kwargs["street"] == "123 Main St"
            assert call_kwargs["city"] == "Springfield"
            assert call_kwargs["state"] == "IL"
            assert call_kwargs["zip_code"] == "62701"

    def test_missing_email_returns_400(self, client):
        """Signup without email returns 400 with validation details."""
        payload = _valid_signup_payload()
        del payload["email"]
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        assert data["error"]["code"] == "VALIDATION_FAILED"
        fields = [d["field"] for d in data["error"]["details"]]
        assert "email" in fields

    def test_missing_password_returns_400(self, client):
        """Signup without password returns 400."""
        payload = _valid_signup_payload()
        del payload["password"]
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_missing_first_name_returns_400(self, client):
        """Signup without firstName returns 400."""
        payload = _valid_signup_payload()
        del payload["firstName"]
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_missing_last_name_returns_400(self, client):
        """Signup without lastName returns 400."""
        payload = _valid_signup_payload()
        del payload["lastName"]
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_short_password_returns_400(self, client):
        """Password shorter than 8 chars returns 400."""
        resp = client.post("/api/auth/signup", json=_valid_signup_payload(
            password="short", confirmPassword="short",
        ))
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_confirm_password_mismatch_returns_400(self, client):
        """Mismatched confirmPassword returns 400."""
        resp = client.post("/api/auth/signup", json=_valid_signup_payload(
            confirmPassword="differentpassword",
        ))
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        details = data["error"]["details"]
        match_issues = [d for d in details if d["field"] == "confirmPassword"]
        assert any("match" in d["issue"].lower() for d in match_issues)

    def test_invalid_email_format_returns_400(self, client):
        """Invalid email format returns 400."""
        resp = client.post("/api/auth/signup", json=_valid_signup_payload(
            email="not-an-email",
        ))
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        details = data["error"]["details"]
        email_issues = [d for d in details if d["field"] == "email"]
        assert len(email_issues) > 0

    def test_missing_address_fields_returns_400(self, client):
        """Missing address fields returns 400."""
        payload = _valid_signup_payload()
        del payload["street"]
        del payload["city"]
        del payload["state"]
        del payload["zipCode"]
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_invalid_zip_code_returns_400(self, client):
        """Invalid zip code format returns 400."""
        resp = client.post("/api/auth/signup", json=_valid_signup_payload(
            zipCode="1234",
        ))
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        details = data["error"]["details"]
        zip_issues = [d for d in details if d["field"] == "zipCode"]
        assert len(zip_issues) > 0

    def test_duplicate_email_returns_409(self, client):
        """EMAIL_TAKEN error returns 409."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.signup.side_effect = AuthError(
                "A user with this email already exists.", "EMAIL_TAKEN"
            )
            resp = client.post("/api/auth/signup", json=_valid_signup_payload(
                email="dupe@test.com",
            ))
        assert resp.status_code == HTTPStatus.CONFLICT
        data = resp.get_json()
        assert data["error"]["code"] == "EMAIL_TAKEN"

    def test_collects_all_validation_errors(self, client):
        """Signup with multiple invalid fields returns all errors at once."""
        resp = client.post("/api/auth/signup", json={})
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        assert data["error"]["code"] == "VALIDATION_FAILED"
        fields = [d["field"] for d in data["error"]["details"]]
        assert "email" in fields
        assert "password" in fields
        assert "firstName" in fields
        assert "lastName" in fields


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
        assert resp.status_code == HTTPStatus.OK
        data = resp.get_json()
        assert data["data"]["user"]["email"] == "login@test.com"
        assert "id" in data["data"]["user"]
        assert data["data"]["user"]["role"] == "CLIENT"
        assert "created_at" in data["data"]["user"]
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
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_missing_password_returns_400(self, client):
        """Login without password returns 400."""
        resp = client.post("/api/auth/login", json={
            "email": "a@b.com",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_invalid_email_format_returns_400(self, client):
        """Invalid email format returns 400."""
        resp = client.post("/api/auth/login", json={
            "email": "not-an-email",
            "password": "strongpassword",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        details = data["error"]["details"]
        email_issues = [d for d in details if d["field"] == "email"]
        assert len(email_issues) > 0

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
        assert resp.status_code == HTTPStatus.UNAUTHORIZED
        data = resp.get_json()
        assert data["error"]["code"] == "INVALID_CREDENTIALS"


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
        assert resp.status_code == HTTPStatus.OK
        data = resp.get_json()
        assert data["data"]["status"] == "completed"
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
        assert resp.status_code == HTTPStatus.UNAUTHORIZED


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
        assert resp.status_code == HTTPStatus.OK
        data = resp.get_json()
        assert data["data"]["id"] == str(user_id)
        assert data["data"]["email"] == "me@test.com"
        assert data["data"]["first_name"] == "Jane"
        assert data["data"]["last_name"] == "Doe"
        assert data["data"]["role"] == "CLIENT"
        assert data["data"]["email_verified"] is True
        assert "created_at" in data["data"]

    def test_returns_401_without_auth(self, client):
        """Unauthenticated /me returns 401."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == HTTPStatus.UNAUTHORIZED


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
        assert resp.status_code == HTTPStatus.OK
        assert resp.get_json()["data"]["status"] == "completed"
        mock_svc.verify_email.assert_called_once_with("valid-token")

    def test_missing_token_returns_400(self, client):
        """Missing token returns 400."""
        resp = client.post("/api/auth/verify-email", json={})
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_invalid_token_returns_400(self, client):
        """INVALID_TOKEN error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.verify_email.side_effect = AuthError(
                "Invalid verification token.", "INVALID_TOKEN"
            )
            resp = client.post("/api/auth/verify-email", json={
                "token": "bad-token",
            })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        assert data["error"]["code"] == "INVALID_TOKEN"

    def test_expired_token_returns_400(self, client):
        """TOKEN_EXPIRED error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.verify_email.side_effect = AuthError(
                "Verification token has expired.", "TOKEN_EXPIRED"
            )
            resp = client.post("/api/auth/verify-email", json={
                "token": "expired-token",
            })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        assert data["error"]["code"] == "TOKEN_EXPIRED"


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
        assert resp.status_code == HTTPStatus.OK
        assert resp.get_json()["data"]["status"] == "completed"
        mock_svc.request_password_reset.assert_called_once_with("any@test.com")

    def test_missing_email_returns_400(self, client):
        """Missing email returns 400."""
        resp = client.post("/api/auth/forgot-password", json={})
        assert resp.status_code == HTTPStatus.BAD_REQUEST


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
                "confirmPassword": "newstrongpassword",
            })
        assert resp.status_code == HTTPStatus.OK
        assert resp.get_json()["data"]["status"] == "completed"
        mock_svc.reset_password.assert_called_once_with(
            "valid-token", "newstrongpassword"
        )

    def test_missing_token_returns_400(self, client):
        """Missing token returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "password": "newstrongpassword",
            "confirmPassword": "newstrongpassword",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_missing_password_returns_400(self, client):
        """Missing password returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_short_password_returns_400(self, client):
        """Password shorter than 8 chars returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
            "password": "short",
            "confirmPassword": "short",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_missing_confirm_password_returns_400(self, client):
        """Missing confirmPassword returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
            "password": "newstrongpassword",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST

    def test_confirm_password_mismatch_returns_400(self, client):
        """Mismatched confirmPassword returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "valid-token",
            "password": "newstrongpassword",
            "confirmPassword": "differentpassword",
        })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        data = resp.get_json()
        details = data["error"]["details"]
        match_issues = [d for d in details if d["field"] == "confirmPassword"]
        assert any("match" in d["issue"].lower() for d in match_issues)

    def test_invalid_token_returns_400(self, client):
        """INVALID_TOKEN error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.reset_password.side_effect = AuthError(
                "Invalid reset token.", "INVALID_TOKEN"
            )
            resp = client.post("/api/auth/reset-password", json={
                "token": "bad-token",
                "password": "newstrongpassword",
                "confirmPassword": "newstrongpassword",
            })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.get_json()["error"]["code"] == "INVALID_TOKEN"

    def test_expired_token_returns_400(self, client):
        """TOKEN_EXPIRED error returns 400."""
        with patch("app.blueprints.auth.auth_service") as mock_svc:
            mock_svc.reset_password.side_effect = AuthError(
                "Reset token has expired.", "TOKEN_EXPIRED"
            )
            resp = client.post("/api/auth/reset-password", json={
                "token": "expired-token",
                "password": "newstrongpassword",
                "confirmPassword": "newstrongpassword",
            })
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.get_json()["error"]["code"] == "TOKEN_EXPIRED"


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
        assert resp.status_code == HTTPStatus.OK
        assert resp.get_json()["data"]["status"] == "completed"
        mock_svc.resend_verification_email.assert_called_once_with(user_id)

    def test_returns_401_without_auth(self, client):
        """Unauthenticated resend returns 401."""
        resp = client.post("/api/auth/resend-verification")
        assert resp.status_code == HTTPStatus.UNAUTHORIZED

    def test_already_verified_returns_400(self, client):
        """ALREADY_VERIFIED error returns 400."""
        session_result = _valid_session_result()
        with _auth_client(client, session_result):
            with patch("app.blueprints.auth.auth_service") as mock_svc:
                mock_svc.resend_verification_email.side_effect = AuthError(
                    "Email is already verified.", "ALREADY_VERIFIED"
                )
                resp = client.post("/api/auth/resend-verification")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.get_json()["error"]["code"] == "ALREADY_VERIFIED"
