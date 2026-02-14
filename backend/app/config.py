"""Flask configuration loaded from environment variables.

Provides a single Config class with all settings as class-level attributes.
DATABASE_URL is pulled from app.utils.config which handles .env loading.
"""

import os

from app.utils.config import DATABASE_URL


class Config:
    """Application configuration read from environment variables.

    DATABASE_URL is imported from app.utils.config. All other settings
    are read from os.environ at import time.
    """

    DATABASE_URL = DATABASE_URL
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    APP_URL = os.environ.get("APP_URL", "http://localhost:3000")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
    SESSION_DURATION_DAYS = int(os.environ.get("SESSION_DURATION_DAYS", "30"))

    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASS = os.environ.get("SMTP_PASS", "")
    SMTP_FROM = os.environ.get("SMTP_FROM", "")
