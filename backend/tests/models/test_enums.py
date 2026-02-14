from app.models.enums import Role


class TestRole:
    def test_has_three_values(self):
        assert len(Role) == 3

    def test_client_value(self):
        assert Role.CLIENT.value == "CLIENT"

    def test_worker_value(self):
        assert Role.WORKER.value == "WORKER"

    def test_admin_value(self):
        assert Role.ADMIN.value == "ADMIN"

    def test_is_str_enum(self):
        assert isinstance(Role.CLIENT, str)
        assert Role.CLIENT == "CLIENT"
