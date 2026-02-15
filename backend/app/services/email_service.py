# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Email service — sends emails via Gmail API with OAuth2.

Provides functions to send verification and password reset emails
using branded HTML templates through the Gmail API.
"""

import base64
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.config import Config


def _get_gmail_service():
    """Authenticate via OAuth2 and return a Gmail API service instance.

    Loads credentials from the token file. If the token is expired
    but has a refresh token, it will be refreshed automatically.

    Returns:
        A Gmail API service resource.
    """
    creds = Credentials.from_authorized_user_file(
        Config.GMAIL_TOKEN_FILE,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )

    if not creds.valid and creds.expired and creds.refresh_token:
        creds.refresh(Request())

        with open(Config.GMAIL_TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def send_email(to: str, subject: str, html: str) -> None:
    """Send an email via the Gmail API.

    Constructs a MIME message and sends it using the authenticated
    Gmail service.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        html: HTML body content.
    """
    service = _get_gmail_service()

    message = MIMEText(html, "html")
    message["To"] = to
    message["From"] = Config.GMAIL_SENDER
    message["Subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    service.users().messages().send(userId="me", body={"raw": raw}).execute()


def send_verification_email(first_name: str, email: str, verification_url: str) -> None:
    """Send a verification email with a branded HTML template.

    Args:
        first_name: User's first name for personalization.
        email: Recipient email address.
        verification_url: Full URL for email verification.
    """
    subject = "Verify Your Email — MelloClean"
    html = _verification_template(first_name, verification_url)
    send_email(email, subject, html)


def send_password_reset_email(first_name: str, email: str, reset_url: str) -> None:
    """Send a password reset email with a branded HTML template.

    Args:
        first_name: User's first name for personalization.
        email: Recipient email address.
        reset_url: Full URL for password reset.
    """
    subject = "Reset Your Password — MelloClean"
    html = _password_reset_template(first_name, reset_url)
    send_email(email, subject, html)


def _verification_template(first_name: str, verification_url: str) -> str:
    """Build the verification email HTML template.

    Args:
        first_name: User's first name.
        verification_url: Clickable verification link.

    Returns:
        Fully rendered HTML string with inline CSS.
    """
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#10b981;padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">MelloClean</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">Welcome, {first_name}!</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.5;">
                Thanks for signing up for MelloClean. Please verify your email address by clicking the button below.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:6px;background-color:#10b981;">
                    <a href="{verification_url}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Verify Email</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.5;">
                This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background-color:#f8fafc;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; 2026 MelloClean. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _password_reset_template(first_name: str, reset_url: str) -> str:
    """Build the password reset email HTML template.

    Args:
        first_name: User's first name.
        reset_url: Clickable password reset link.

    Returns:
        Fully rendered HTML string with inline CSS.
    """
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#10b981;padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">MelloClean</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">Hi {first_name},</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.5;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:6px;background-color:#10b981;">
                    <a href="{reset_url}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.5;">
                This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background-color:#f8fafc;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; 2026 MelloClean. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
