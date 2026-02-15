# Copyright 2026 Eduardo Turcios. All rights reserved.
# Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
"""Shared company configuration loaded from company.json.

Exposes module-level constants so the backend can reference
the same branding values used by the frontend.
"""

import json
from pathlib import Path


_CONFIG_PATH = Path(__file__).resolve().parents[2] / "company.json"

with open(_CONFIG_PATH) as _f:
    _data = json.load(_f)

COMPANY_NAME: str = _data["Name"]
COMPANY_PHONE: str = _data["Phone"]
COMPANY_EMAIL: str = _data["Email"]
COMPANY_ADDRESS: str = _data["Address"]
COMPANY_HOURS: str = _data["Hours"]
