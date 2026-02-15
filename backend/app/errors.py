# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Application error classes for structured error handling."""


class AuthError(Exception):
    """Authentication or authorization error with a machine-readable code.

    Attributes:
        message: Human-readable error description.
        code: Machine-readable error code (e.g. ``EMAIL_TAKEN``).
    """

    def __init__(self, message: str, code: str) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
