# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
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

    def __init__(self):
        raise TypeError("Config cannot be instantiated. Use class attributes directly.")

    DATABASE_URL = DATABASE_URL
    SECRET_KEY = os.environ.get("SECRET_KEY")
    APP_URL = os.environ.get("APP_URL")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS")
    SESSION_DURATION_DAYS = int(os.environ.get("SESSION_DURATION_DAYS"))
    GMAIL_CREDENTIALS_FILE = os.environ.get("GMAIL_CREDENTIALS_FILE")
    GMAIL_TOKEN_FILE = os.environ.get("GMAIL_TOKEN_FILE")
    GMAIL_SENDER = os.environ.get("GMAIL_SENDER")
