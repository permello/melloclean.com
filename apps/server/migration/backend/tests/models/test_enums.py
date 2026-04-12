# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for the Role enum."""

from app.models.enums import Role


class TestRole:
    """Verify Role enum has the expected members and behaviour."""

    def test_has_three_values(self):
        """Role should contain exactly CLIENT, WORKER, and ADMIN."""
        assert len(Role) == 3

    def test_client_value(self):
        """CLIENT member stores the string 'CLIENT'."""
        assert Role.CLIENT.value == "CLIENT"

    def test_worker_value(self):
        """WORKER member stores the string 'WORKER'."""
        assert Role.WORKER.value == "WORKER"

    def test_admin_value(self):
        """ADMIN member stores the string 'ADMIN'."""
        assert Role.ADMIN.value == "ADMIN"

    def test_is_str_enum(self):
        """Role inherits from str, so members compare equal to their string value."""
        assert isinstance(Role.CLIENT, str)
        assert Role.CLIENT == "CLIENT"
