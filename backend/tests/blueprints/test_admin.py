# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for admin blueprint routes.

Verifies all three /api/admin endpoints: list users, create user,
and revoke sessions. Each test uses a Flask test client with mocked
service-layer dependencies and validates auth/role enforcement.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from app import create_app
from app.errors import AuthError
from app.middleware import COOKIE_NAME
from app.models.enums import Role


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _valid_session_result(role=Role.ADMIN, **user_overrides):
    """Return a dict matching validate_session's success shape."""
    user_id = user_overrides.pop("id", uuid.uuid4())
    return {
        "session_id": uuid.uuid4(),
        "user": {
            "id": user_id,
            "email": user_overrides.get("email", "admin@example.com"),
            "first_name": user_overrides.get("first_name", "Admin"),
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


def _valid_create_user_payload(**overrides):
    """Return a valid create-user payload dict with sensible defaults."""
    defaults = {
        "email": "new@test.com",
        "password": "strongpassword",
        "confirmPassword": "strongpassword",
        "firstName": "New",
        "lastName": "User",
        "role": "CLIENT",
    }
    defaults.update(overrides)
    return defaults


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
# GET /api/admin/users
# ---------------------------------------------------------------------------


class TestListUsers:
    """Tests for GET /api/admin/users."""

    def _mock_user_objs(self, count=2):
        """Create a list of mock user objects."""
        objs = []
        for i in range(count):
            obj = MagicMock()
            obj.id = uuid.uuid4()
            obj.email = f"user{i+1}@test.com"
            obj.first_name = "User"
            obj.last_name = f"#{i+1}"
            obj.role = MagicMock()
            obj.role.value = "CLIENT"
            obj.email_verified = i == 0
            obj.created_at = datetime(2026, 1, i + 1, tzinfo=timezone.utc)
            objs.append(obj)
        return objs

    def test_returns_paginated_response(self, client):
        """Admin listing users returns 200 with paginated response shape."""
        session_result = _valid_session_result(role=Role.ADMIN)
        mock_user_objs = self._mock_user_objs(2)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.all.return_value = mock_user_objs
                resp = client.get("/api/admin/users")

        assert resp.status_code == 200
        data = resp.get_json()
        assert "users" in data
        assert "page" in data
        assert "per_page" in data
        assert "total" in data
        assert len(data["users"]) == 2

    def test_pagination_defaults(self, client):
        """Default pagination returns page 1 with per_page 25."""
        session_result = _valid_session_result(role=Role.ADMIN)
        mock_user_objs = self._mock_user_objs(2)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.all.return_value = mock_user_objs
                resp = client.get("/api/admin/users")

        data = resp.get_json()
        assert data["page"] == 1
        assert data["per_page"] == 25

    def test_pagination_custom(self, client):
        """Custom page and per_page are reflected in response."""
        session_result = _valid_session_result(role=Role.ADMIN)
        mock_user_objs = self._mock_user_objs(1)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.all.return_value = mock_user_objs
                resp = client.get("/api/admin/users?page=2&per_page=10")

        data = resp.get_json()
        assert data["page"] == 2
        assert data["per_page"] == 10

    def test_all_flag(self, client):
        """?all=true returns all users without pagination."""
        session_result = _valid_session_result(role=Role.ADMIN)
        mock_user_objs = self._mock_user_objs(3)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.all.return_value = mock_user_objs
                resp = client.get("/api/admin/users?all=true")

        data = resp.get_json()
        assert data["page"] == 1
        assert data["per_page"] == 3
        assert data["total"] == 3
        assert len(data["users"]) == 3

    def test_returns_401_without_auth(self, client):
        """Unauthenticated request returns 401."""
        resp = client.get("/api/admin/users")
        assert resp.status_code == 401

    def test_returns_403_for_non_admin(self, client):
        """Non-admin user returns 403."""
        session_result = _valid_session_result(role=Role.CLIENT)
        with _auth_client(client, session_result):
            resp = client.get("/api/admin/users")
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# POST /api/admin/users
# ---------------------------------------------------------------------------


class TestCreateUser:
    """Tests for POST /api/admin/users."""

    def test_returns_201_on_success(self, client):
        """Admin creating a user returns 201."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get, \
                 patch("app.blueprints.admin.hash_password") as mock_hash:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.first.return_value = None
                mock_hash.return_value = "$2b$12$fakehash"

                resp = client.post("/api/admin/users", json=_valid_create_user_payload())

        assert resp.status_code == 201
        data = resp.get_json()
        assert data["email"] == "new@test.com"

    def test_returns_401_without_auth(self, client):
        """Unauthenticated request returns 401."""
        resp = client.post("/api/admin/users", json=_valid_create_user_payload())
        assert resp.status_code == 401

    def test_returns_403_for_non_admin(self, client):
        """Non-admin user returns 403."""
        session_result = _valid_session_result(role=Role.CLIENT)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=_valid_create_user_payload())
        assert resp.status_code == 403

    def test_missing_email_returns_400(self, client):
        """Missing email returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["email"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_missing_password_returns_400(self, client):
        """Missing password returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["password"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_missing_first_name_returns_400(self, client):
        """Missing firstName returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["firstName"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_missing_last_name_returns_400(self, client):
        """Missing lastName returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["lastName"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_missing_role_returns_400(self, client):
        """Missing role returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["role"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_invalid_role_returns_400(self, client):
        """Invalid role value returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=_valid_create_user_payload(
                role="SUPERUSER",
            ))
        assert resp.status_code == 400

    def test_short_password_returns_400(self, client):
        """Password shorter than 8 chars returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=_valid_create_user_payload(
                password="short", confirmPassword="short",
            ))
        assert resp.status_code == 400

    def test_invalid_email_format_returns_400(self, client):
        """Invalid email format returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=_valid_create_user_payload(
                email="not-an-email",
            ))
        assert resp.status_code == 400
        assert "email" in resp.get_json()["error"].lower()

    def test_missing_confirm_password_returns_400(self, client):
        """Missing confirmPassword returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        payload = _valid_create_user_payload()
        del payload["confirmPassword"]
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=payload)
        assert resp.status_code == 400

    def test_confirm_password_mismatch_returns_400(self, client):
        """Mismatched confirmPassword returns 400."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users", json=_valid_create_user_payload(
                confirmPassword="differentpassword",
            ))
        assert resp.status_code == 400
        assert "match" in resp.get_json()["error"].lower()

    def test_duplicate_email_returns_409(self, client):
        """Duplicate email returns 409."""
        session_result = _valid_session_result(role=Role.ADMIN)
        existing_user = MagicMock()
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.get_session") as mock_get:
                mock_db = MagicMock()
                mock_get.return_value.__enter__ = lambda s: mock_db
                mock_get.return_value.__exit__ = MagicMock(return_value=False)
                mock_db.exec.return_value.first.return_value = existing_user

                resp = client.post("/api/admin/users", json=_valid_create_user_payload(
                    email="dupe@test.com",
                ))

        assert resp.status_code == 409
        assert resp.get_json()["code"] == "EMAIL_TAKEN"


# ---------------------------------------------------------------------------
# POST /api/admin/users/:id/revoke-sessions
# ---------------------------------------------------------------------------


class TestRevokeSessions:
    """Tests for POST /api/admin/users/:id/revoke-sessions."""

    def test_returns_200_on_success(self, client):
        """Admin revoking sessions returns 200."""
        user_id = uuid.uuid4()
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            with patch("app.blueprints.admin.revoke_all_user_sessions") as mock_revoke:
                resp = client.post(f"/api/admin/users/{user_id}/revoke-sessions")
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True
        mock_revoke.assert_called_once_with(user_id)

    def test_returns_401_without_auth(self, client):
        """Unauthenticated request returns 401."""
        user_id = uuid.uuid4()
        resp = client.post(f"/api/admin/users/{user_id}/revoke-sessions")
        assert resp.status_code == 401

    def test_returns_403_for_non_admin(self, client):
        """Non-admin user returns 403."""
        user_id = uuid.uuid4()
        session_result = _valid_session_result(role=Role.CLIENT)
        with _auth_client(client, session_result):
            resp = client.post(f"/api/admin/users/{user_id}/revoke-sessions")
        assert resp.status_code == 403

    def test_invalid_uuid_returns_404(self, client):
        """Invalid UUID format returns 404."""
        session_result = _valid_session_result(role=Role.ADMIN)
        with _auth_client(client, session_result):
            resp = client.post("/api/admin/users/not-a-uuid/revoke-sessions")
        assert resp.status_code == 404
