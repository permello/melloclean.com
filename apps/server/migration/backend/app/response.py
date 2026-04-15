# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Standardized API response helpers.

Provides functions to build consistent JSON response envelopes for
success, paginated, error, and validation error responses.
"""

from flask import jsonify


def success(data, status=200):
    """Build a success response wrapping data in a ``{"data": ...}`` envelope.

    Args:
        data: The payload to return under the ``data`` key.
        status: HTTP status code (default 200).

    Returns:
        A tuple of (response, status_code).
    """
    return jsonify({"data": data}), status


def success_action():
    """Build a success response for actions that return no meaningful data.

    Returns:
        A tuple of (response, 200) with ``{"data": {"status": "completed"}}``.
    """
    return jsonify({"data": {"status": "completed"}}), 200


def paginated(items, page, page_size, total):
    """Build a paginated success response.

    Args:
        items: List of serialized items for the current page.
        page: Current page number.
        page_size: Number of items per page.
        total: Total number of items across all pages.

    Returns:
        A tuple of (response, 200) with ``{"data": [...], "meta": {...}}``.
    """
    return jsonify({
        "data": items,
        "meta": {"page": page, "pageSize": page_size, "total": total},
    }), 200


def error(code, message, status):
    """Build a non-field error response.

    Args:
        code: Machine-readable error code (e.g. ``"INVALID_CREDENTIALS"``).
        message: Human-readable error message.
        status: HTTP status code.

    Returns:
        A tuple of (response, status_code).
    """
    return jsonify({"error": {"code": code, "message": message}}), status


def validation_error(details):
    """Build a validation error response with per-field details.

    Args:
        details: List of ``{"field": "...", "issue": "..."}`` dicts.

    Returns:
        A tuple of (response, 400).
    """
    return jsonify({
        "error": {
            "code": "VALIDATION_FAILED",
            "message": "One or more fields are invalid.",
            "details": details,
        },
    }), 400
