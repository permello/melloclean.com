"""Tests for the Flask application factory.

Verifies that create_app produces a properly configured Flask app
with health endpoint, CORS, and registered blueprints.
"""

import pytest
from flask import Flask

from app import create_app


@pytest.fixture
def app():
    """Create a Flask app."""
    return create_app()


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()


class TestCreateApp:
    """Tests for the create_app factory function."""

    def test_returns_flask_instance(self, app):
        """create_app should return a Flask application."""
        assert isinstance(app, Flask)


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_returns_ok(self, client):
        """GET /health should return status ok."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "ok"}


class TestBlueprints:
    """Tests for blueprint registration."""

    def test_auth_blueprint_registered(self, app):
        """Auth blueprint should be registered at /api/auth."""
        assert "auth" in app.blueprints

    def test_admin_blueprint_registered(self, app):
        """Admin blueprint should be registered at /api/admin."""
        assert "admin" in app.blueprints


class TestCORS:
    """Tests for CORS configuration."""

    def test_cors_preflight_returns_allowed_origin(self, client):
        """OPTIONS request should include Access-Control-Allow-Origin."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers

    def test_cors_allows_credentials(self, client):
        """CORS response should include Access-Control-Allow-Credentials."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.headers.get("Access-Control-Allow-Credentials") == "true"
