# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Tests for email service functions.

Verifies email sending, verification email, and password reset email
using mocked Gmail API credentials and service.
"""

import base64
from unittest.mock import MagicMock, patch, mock_open

from app.services.email_service import (
    send_email,
    send_verification_email,
    send_password_reset_email,
)


def _mock_gmail_service():
    """Create a mock Gmail API service with a sendable messages resource."""
    service = MagicMock()
    service.users.return_value.messages.return_value.send.return_value.execute.return_value = {
        "id": "msg_123",
        "labelIds": ["SENT"],
    }
    return service


class TestSendEmail:
    """Tests for send_email."""

    @patch("app.services.email_service._get_gmail_service")
    def test_sends_email_via_gmail_api(self, mock_get_service):
        """send_email should call Gmail API send with correct parameters."""
        mock_service = _mock_gmail_service()
        mock_get_service.return_value = mock_service

        send_email("user@example.com", "Test Subject", "<h1>Hello</h1>")

        mock_service.users.return_value.messages.return_value.send.assert_called_once()
        call_kwargs = mock_service.users.return_value.messages.return_value.send.call_args
        assert call_kwargs[1]["userId"] == "me"

    @patch("app.services.email_service._get_gmail_service")
    def test_constructs_mime_message_with_correct_headers(self, mock_get_service):
        """send_email should build a MIME message with To, Subject, and From."""
        mock_service = _mock_gmail_service()
        mock_get_service.return_value = mock_service

        send_email("recipient@example.com", "My Subject", "<p>Body</p>")

        call_kwargs = mock_service.users.return_value.messages.return_value.send.call_args
        raw_message = call_kwargs[1]["body"]["raw"]
        decoded = base64.urlsafe_b64decode(raw_message).decode("utf-8")
        assert "recipient@example.com" in decoded
        assert "My Subject" in decoded

    @patch("app.services.email_service._get_gmail_service")
    def test_message_contains_html_body(self, mock_get_service):
        """send_email should include HTML content in the message body."""
        mock_service = _mock_gmail_service()
        mock_get_service.return_value = mock_service

        html = "<h1>Welcome</h1><p>Thanks for signing up.</p>"
        send_email("user@example.com", "Welcome", html)

        call_kwargs = mock_service.users.return_value.messages.return_value.send.call_args
        raw_message = call_kwargs[1]["body"]["raw"]
        decoded = base64.urlsafe_b64decode(raw_message).decode("utf-8")
        assert "Welcome" in decoded
        assert "Thanks for signing up." in decoded


class TestSendVerificationEmail:
    """Tests for send_verification_email."""

    @patch("app.services.email_service.send_email")
    def test_calls_send_email(self, mock_send):
        """send_verification_email should delegate to send_email."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        assert args[0] == "alice@example.com"

    @patch("app.services.email_service.send_email")
    def test_subject_contains_verification(self, mock_send):
        """Subject line should indicate email verification."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        args = mock_send.call_args[0]
        subject = args[1]
        assert "verif" in subject.lower() or "confirm" in subject.lower()

    @patch("app.services.email_service.send_email")
    def test_html_contains_user_name(self, mock_send):
        """HTML body should include the user's first name."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        args = mock_send.call_args[0]
        html = args[2]
        assert "Alice" in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_verification_url(self, mock_send):
        """HTML body should include the verification URL."""
        url = "https://example.com/verify?token=abc123"
        send_verification_email("Alice", "alice@example.com", url)

        args = mock_send.call_args[0]
        html = args[2]
        assert url in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_verify_button_text(self, mock_send):
        """HTML body should include 'Verify Email' CTA text."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        args = mock_send.call_args[0]
        html = args[2]
        assert "Verify Email" in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_24_hour_expiry(self, mock_send):
        """HTML body should mention the 24-hour link expiry."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        args = mock_send.call_args[0]
        html = args[2]
        assert "24" in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_brand_color(self, mock_send):
        """HTML body should use MelloClean emerald (#10b981) for the CTA button."""
        send_verification_email("Alice", "alice@example.com", "https://example.com/verify?token=abc")

        args = mock_send.call_args[0]
        html = args[2]
        assert "#10b981" in html.lower() or "#10B981" in html


class TestSendPasswordResetEmail:
    """Tests for send_password_reset_email."""

    @patch("app.services.email_service.send_email")
    def test_calls_send_email(self, mock_send):
        """send_password_reset_email should delegate to send_email."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        assert args[0] == "bob@example.com"

    @patch("app.services.email_service.send_email")
    def test_subject_contains_reset(self, mock_send):
        """Subject line should indicate password reset."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        args = mock_send.call_args[0]
        subject = args[1]
        assert "reset" in subject.lower()

    @patch("app.services.email_service.send_email")
    def test_html_contains_user_name(self, mock_send):
        """HTML body should include the user's first name."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        args = mock_send.call_args[0]
        html = args[2]
        assert "Bob" in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_reset_url(self, mock_send):
        """HTML body should include the reset URL."""
        url = "https://example.com/reset?token=xyz789"
        send_password_reset_email("Bob", "bob@example.com", url)

        args = mock_send.call_args[0]
        html = args[2]
        assert url in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_reset_button_text(self, mock_send):
        """HTML body should include 'Reset Password' CTA text."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        args = mock_send.call_args[0]
        html = args[2]
        assert "Reset Password" in html

    @patch("app.services.email_service.send_email")
    def test_html_contains_1_hour_expiry(self, mock_send):
        """HTML body should mention the 1-hour link expiry."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        args = mock_send.call_args[0]
        html = args[2]
        assert "1 hour" in html.lower() or "one hour" in html.lower() or "60 minute" in html.lower()

    @patch("app.services.email_service.send_email")
    def test_html_contains_brand_color(self, mock_send):
        """HTML body should use MelloClean emerald (#10b981) for the CTA button."""
        send_password_reset_email("Bob", "bob@example.com", "https://example.com/reset?token=xyz")

        args = mock_send.call_args[0]
        html = args[2]
        assert "#10b981" in html.lower() or "#10B981" in html


class TestGetGmailService:
    """Tests for _get_gmail_service helper."""

    @patch("app.services.email_service.build")
    @patch("app.services.email_service.os.path.exists", return_value=True)
    @patch("app.services.email_service.Credentials.from_authorized_user_file")
    def test_builds_gmail_service_with_existing_token(self, mock_creds_load, mock_exists, mock_build):
        """_get_gmail_service should load credentials from token file and build service."""
        from app.services.email_service import _get_gmail_service

        mock_creds = MagicMock()
        mock_creds.valid = True
        mock_creds_load.return_value = mock_creds

        _get_gmail_service()

        mock_creds_load.assert_called_once()
        mock_build.assert_called_once_with("gmail", "v1", credentials=mock_creds)

    @patch("builtins.open", mock_open())
    @patch("app.services.email_service.build")
    @patch("app.services.email_service.os.path.exists", return_value=True)
    @patch("app.services.email_service.Credentials.from_authorized_user_file")
    def test_refreshes_expired_credentials(self, mock_creds_load, mock_exists, mock_build):
        """_get_gmail_service should refresh credentials when expired."""
        from app.services.email_service import _get_gmail_service

        mock_creds = MagicMock()
        mock_creds.valid = False
        mock_creds.expired = True
        mock_creds.refresh_token = "refresh_token_value"
        mock_creds_load.return_value = mock_creds

        _get_gmail_service()

        mock_creds.refresh.assert_called_once()

    @patch("builtins.open", mock_open())
    @patch("app.services.email_service.build")
    @patch("app.services.email_service.InstalledAppFlow.from_client_secrets_file")
    @patch("app.services.email_service.os.path.exists", return_value=False)
    def test_runs_oauth_flow_when_no_token_file(self, mock_exists, mock_flow_cls, mock_build):
        """_get_gmail_service should run OAuth consent flow when token file is missing."""
        from app.services.email_service import _get_gmail_service

        mock_creds = MagicMock()
        mock_creds.valid = True
        mock_flow = MagicMock()
        mock_flow.run_local_server.return_value = mock_creds
        mock_flow_cls.return_value = mock_flow

        _get_gmail_service()

        mock_flow_cls.assert_called_once()
        mock_flow.run_local_server.assert_called_once_with(port=0)
        mock_build.assert_called_once_with("gmail", "v1", credentials=mock_creds)
