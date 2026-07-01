"""CSV loaders. Files are UTF-8 (with or without BOM); utf-8-sig handles both."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.config import settings


def _read(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, encoding="utf-8-sig")


def load_recommendation() -> pd.DataFrame:
    """Real crop-recommendation dataset: N,P,K,temperature,humidity,ph,rainfall,label."""
    return _read(settings.data_dir / "pakistan_crop_recommendation.csv")


def load_yield() -> pd.DataFrame:
    """Real yields: columns crop (canonical slug), year, yield_t_ha (1990-2024)."""
    return _read(settings.data_dir / "pakistan_yield_real.csv")


def load_rotation() -> pd.DataFrame:
    return _read(settings.data_dir / "pakistan_crop_rotation_rules.csv")
