"""CSV loaders. All files are UTF-8 with a BOM (utf-8-sig) and may contain
quoted commas (e.g. "Rice, paddy"); pandas + utf-8-sig handles both."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.config import settings
from app.crops import YIELD_ITEM_TO_CANON


def _read(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, encoding="utf-8-sig")


def load_recommendation() -> pd.DataFrame:
    return _read(settings.data_dir / "pakistan_crop_recommendation.csv")


def load_yield() -> pd.DataFrame:
    """Return the yield CSV with a canonical `crop` slug column added."""
    df = _read(settings.data_dir / "pakistan_crop_yield.csv")
    df["crop"] = df["Item"].map(YIELD_ITEM_TO_CANON)
    return df


def load_rotation() -> pd.DataFrame:
    return _read(settings.data_dir / "pakistan_crop_rotation_rules.csv")


def load_requirements() -> pd.DataFrame:
    return _read(settings.data_dir / "pakistan_crop_requirements.csv")
