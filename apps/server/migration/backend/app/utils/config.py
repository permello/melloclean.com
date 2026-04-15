# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Application configuration loaded from environment variables.

Reads the .env file located at the backend root (two directories above
this file) and exposes configuration values as module-level constants.
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# Resolve path to backend/.env regardless of working directory
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

print("Looking for .env at:", env_path)
DATABASE_URL = os.environ.get( "LOCAL_DATABASE_URL", "DATABASE_URL", )
