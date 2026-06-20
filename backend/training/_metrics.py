"""Shared helper to merge a section into models/metrics.json."""

from __future__ import annotations

import json

from app.config import settings


def merge_metrics(section: str, data: dict) -> None:
    settings.model_dir.mkdir(parents=True, exist_ok=True)
    path = settings.model_dir / "metrics.json"
    existing: dict = {}
    if path.exists():
        existing = json.loads(path.read_text(encoding="utf-8"))
    existing[section] = data
    path.write_text(json.dumps(existing, indent=2), encoding="utf-8")
