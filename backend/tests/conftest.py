"""Shared test fixtures for the backend test suite.

Provides a database session fixture that automatically rolls back
after each test, keeping the database clean between runs.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
import pytest
from sqlmodel import SQLModel, Session as DBSession, create_engine

# Wildcard import registers all model tables with SQLModel.metadata
from app.models import *
from app.utils.config import DATABASE_URL  # noqa: F401, F403

# Create a single engine shared across all tests
engine = create_engine(DATABASE_URL)


@pytest.fixture(autouse=True)
def db():
    """Yield a database session that rolls back after each test.

    Ensures tables exist via create_all, then opens a session.
    The rollback in the finally block prevents test data from
    persisting between tests.
    """
    SQLModel.metadata.create_all(engine)
    with DBSession(engine) as session:
        yield session
        session.rollback()
