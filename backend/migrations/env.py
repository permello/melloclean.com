"""Alembic environment configuration.

Imports all SQLModel models so that autogenerate can detect schema
changes, and reads DATABASE_URL from the shared config module.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

# Wildcard import registers every model's table with SQLModel.metadata,
# which is required for autogenerate to detect all tables.
from app.models import *  # noqa: F401, F403
from app.utils.config import DATABASE_URL

config = context.config

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Inject the database URL into Alembic's config so engine_from_config picks it up
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Alembic compares this metadata against the live database to generate migrations
target_metadata = SQLModel.metadata


def run_migrations_offline():
    """Run migrations without a live database connection (SQL script mode)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
