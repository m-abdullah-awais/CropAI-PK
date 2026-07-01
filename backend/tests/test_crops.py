"""Crop normalization / consistency tests (no model artifacts needed)."""

from __future__ import annotations

from app.crops import (
    RECO_CROPS,
    ROTATION_AVAILABLE,
    YIELD_AVAILABLE,
    normalize,
    yield_available,
)
from app.ml.data_loaders import load_rotation


def test_crop_set_sizes():
    assert len(RECO_CROPS) == 22
    assert len(YIELD_AVAILABLE) == 13


def test_every_reco_crop_has_a_rotation_row():
    rotation_crops = set(load_rotation()["crop"])
    assert set(RECO_CROPS) == rotation_crops == ROTATION_AVAILABLE


def test_yield_availability():
    assert yield_available("wheat")
    assert yield_available("sugarcane")
    assert not yield_available("coffee")   # in recommendation, not yield
    assert not yield_available("apple")


def test_normalize_aliases():
    assert normalize("Rice") == "rice"
    assert normalize("black gram") == "blackgram"
    assert normalize("Sugar cane") == "sugarcane"
