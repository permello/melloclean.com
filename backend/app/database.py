"""Database engine and session factory.

Provides a SQLModel engine connected via app.utils.config.DATABASE_URL
and a get_session() context manager for use in services.
"""

from contextlib import contextmanager

from sqlmodel import Session, create_engine

from app.utils.config import DATABASE_URL

engine = create_engine(DATABASE_URL)


@contextmanager
def get_session():
    """Yield a SQLModel Session that auto-closes on exit.

    Usage::

        with get_session() as db:
            db.exec(select(User))
    """
    with Session(engine) as session:
        yield session
