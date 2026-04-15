# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for application configuration.

Verifies that Config loads correct values from environment variables
and that DATABASE_URL matches app.utils.config.
"""

import pytest

from app.config import Config
from app.utils.config import DATABASE_URL


class TestConfig:
    """Tests for the Config class."""

    def test_database_url_from_utils_config(self):
        """DATABASE_URL should match the value from app.utils.config."""
        assert Config.DATABASE_URL == DATABASE_URL

    def test_secret_key_is_string(self):
        """SECRET_KEY should be a string."""
        assert isinstance(Config.SECRET_KEY, str)

    def test_app_url_is_string(self):
        """APP_URL should be a string."""
        assert isinstance(Config.APP_URL, str)

    def test_cors_origins_is_string(self):
        """CORS_ORIGINS should be a string."""
        assert isinstance(Config.CORS_ORIGINS, str)

    def test_session_duration_days_default(self):
        """SESSION_DURATION_DAYS should default to 30."""
        assert Config.SESSION_DURATION_DAYS == 30

    def test_cannot_be_instantiated(self):
        """Config should not be instantiable."""
        with pytest.raises(TypeError):
            Config()
