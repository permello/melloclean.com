# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Test configuration for middleware tests.

Overrides the root-level autouse db fixture since middleware tests
use Flask test client with mocked services instead of a real database.
"""

import pytest


@pytest.fixture(autouse=True)
def db():
    """No-op override — middleware tests do not need a database session."""
    yield None
