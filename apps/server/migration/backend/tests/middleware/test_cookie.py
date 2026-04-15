# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for cookie helper functions and constants.

Verifies set_session_cookie and clear_session_cookie apply the correct
cookie attributes for both development and production environments.
"""

from unittest.mock import patch

from flask import Flask

from app.middleware import (
    COOKIE_NAME,
    SESSION_MAX_AGE,
    clear_session_cookie,
    set_session_cookie,
)


def _create_test_app():
    """Create a minimal Flask app for cookie testing."""
    app = Flask(__name__)
    app.config["TESTING"] = True
    return app


class TestConstants:
    """Tests for exported cookie constants."""

    def test_cookie_name(self):
        """COOKIE_NAME should be 'mello_session'."""
        assert COOKIE_NAME == "mello_session"

    def test_session_max_age(self):
        """SESSION_MAX_AGE should be 30 days in seconds."""
        assert SESSION_MAX_AGE == 30 * 24 * 60 * 60


class TestSetSessionCookie:
    """Tests for set_session_cookie."""

    def test_sets_cookie_value(self):
        """Cookie value should match the provided token."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            set_session_cookie(resp, "my-token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie is not None
            assert cookie.value == "my-token"

    def test_httponly_always_true(self):
        """Cookie should always have httpOnly=True."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["httponly"] is True

    def test_samesite_lax(self):
        """Cookie should have SameSite=Lax."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["samesite"] == "Lax"

    def test_path_is_root(self):
        """Cookie path should be '/'."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["path"] == "/"

    def test_max_age_30_days(self):
        """Cookie max-age should be 30 days in seconds."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert int(cookie["max-age"]) == SESSION_MAX_AGE

    def test_secure_false_in_development(self):
        """Cookie Secure should be False when FLASK_ENV is development."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            with patch("app.middleware.os.environ.get", return_value="development"):
                set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["secure"] == ""

    def test_secure_true_in_production(self):
        """Cookie Secure should be True when FLASK_ENV is production."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            with patch("app.middleware.os.environ.get", return_value="production"):
                set_session_cookie(resp, "token")
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["secure"] is True


class TestClearSessionCookie:
    """Tests for clear_session_cookie."""

    def test_expires_cookie_immediately(self):
        """clear_session_cookie should set max-age to 0."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            clear_session_cookie(resp)
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie is not None
            assert int(cookie["max-age"]) == 0

    def test_sets_empty_value(self):
        """clear_session_cookie should set the cookie value to empty."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            clear_session_cookie(resp)
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie.value == ""

    def test_preserves_httponly_and_path(self):
        """Cleared cookie should keep httpOnly and path attributes."""
        app = _create_test_app()
        with app.test_request_context():
            resp = app.make_response("ok")
            clear_session_cookie(resp)
            cookie = _get_cookie(resp, COOKIE_NAME)
            assert cookie["httponly"] is True
            assert cookie["path"] == "/"


def _get_cookie(response, name):
    """Extract a cookie morsel from a Flask response by name."""
    for cookie_header in response.headers.getlist("Set-Cookie"):
        from http.cookies import SimpleCookie

        sc = SimpleCookie()
        sc.load(cookie_header)
        if name in sc:
            return sc[name]
    return None
