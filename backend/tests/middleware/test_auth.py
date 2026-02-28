# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for auth decorators (@require_auth, @require_role).

Verifies authentication and role-based access control using a minimal
Flask test app with decorated routes and a mocked validate_session.
"""

import uuid
from unittest.mock import patch

from flask import Flask, g, jsonify

from app.middleware.auth import require_auth, require_role
from app.models.enums import Role


def _create_test_app():
    """Create a minimal Flask app with decorated test routes."""
    app = Flask(__name__)
    app.config["TESTING"] = True

    @app.route("/auth-only")
    @require_auth
    def auth_only():
        return jsonify({
            "user_id": str(g.user["id"]),
            "token": g.session_token,
        })

    @app.route("/admin-only")
    @require_auth
    @require_role("ADMIN")
    def admin_only():
        return jsonify({"role": g.user["role"]})

    @app.route("/worker-or-admin")
    @require_auth
    @require_role("WORKER", "ADMIN")
    def worker_or_admin():
        return jsonify({"role": g.user["role"]})

    return app


def _valid_session_result(role=Role.CLIENT):
    """Return a dict matching validate_session's success shape."""
    return {
        "session_id": uuid.uuid4(),
        "user": {
            "id": uuid.uuid4(),
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "role": role,
            "email_verified": True,
        },
    }


class TestRequireAuth:
    """Tests for the @require_auth decorator."""

    def test_returns_401_when_no_cookie(self):
        """Request without mello_session cookie should get 401."""
        app = _create_test_app()
        with app.test_client() as client:
            resp = client.get("/auth-only")
            assert resp.status_code == 401
            assert resp.get_json()["error"] == "Authentication required"

    def test_returns_401_when_session_invalid(self):
        """Request with an invalid/expired token should get 401."""
        app = _create_test_app()
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=None):
                client.set_cookie("mello_session", "bad-token")
                resp = client.get("/auth-only")
                assert resp.status_code == 401
                assert resp.get_json()["error"] == "Authentication required"

    def test_sets_g_user_and_g_session_token(self):
        """Valid session should set g.user and g.session_token."""
        app = _create_test_app()
        result = _valid_session_result()
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/auth-only")
                assert resp.status_code == 200
                data = resp.get_json()
                assert data["user_id"] == str(result["user"]["id"])
                assert data["token"] == "valid-token"

    def test_passes_cookie_value_to_validate_session(self):
        """The raw cookie value should be forwarded to validate_session."""
        app = _create_test_app()
        result = _valid_session_result()
        with app.test_client() as client:
            with patch(
                "app.middleware.auth.validate_session", return_value=result
            ) as mock_validate:
                client.set_cookie("mello_session", "my-secret-token")
                client.get("/auth-only")
                mock_validate.assert_called_once_with("my-secret-token")


class TestRequireRole:
    """Tests for the @require_role decorator."""

    def test_returns_403_for_wrong_role(self):
        """CLIENT accessing an ADMIN-only route should get 403."""
        app = _create_test_app()
        result = _valid_session_result(role=Role.CLIENT)
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/admin-only")
                assert resp.status_code == 403
                assert resp.get_json()["error"] == "Forbidden"

    def test_passes_for_matching_role(self):
        """ADMIN accessing an ADMIN-only route should succeed."""
        app = _create_test_app()
        result = _valid_session_result(role=Role.ADMIN)
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/admin-only")
                assert resp.status_code == 200
                assert resp.get_json()["role"] == "ADMIN"

    def test_variadic_roles_worker_passes(self):
        """WORKER accessing a WORKER|ADMIN route should succeed."""
        app = _create_test_app()
        result = _valid_session_result(role=Role.WORKER)
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/worker-or-admin")
                assert resp.status_code == 200
                assert resp.get_json()["role"] == "WORKER"

    def test_variadic_roles_admin_passes(self):
        """ADMIN accessing a WORKER|ADMIN route should succeed."""
        app = _create_test_app()
        result = _valid_session_result(role=Role.ADMIN)
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/worker-or-admin")
                assert resp.status_code == 200
                assert resp.get_json()["role"] == "ADMIN"

    def test_variadic_roles_client_rejected(self):
        """CLIENT accessing a WORKER|ADMIN route should get 403."""
        app = _create_test_app()
        result = _valid_session_result(role=Role.CLIENT)
        with app.test_client() as client:
            with patch("app.middleware.auth.validate_session", return_value=result):
                client.set_cookie("mello_session", "valid-token")
                resp = client.get("/worker-or-admin")
                assert resp.status_code == 403
                assert resp.get_json()["error"] == "Forbidden"
