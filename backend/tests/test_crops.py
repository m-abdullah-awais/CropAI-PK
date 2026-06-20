"""Crop normalization / consistency tests (no model artifacts needed)."""

from __future__ import annotations

from app.crops import (
    RECO_CROPS,
    ROTATION_AVAILABLE,
    YIELD_AVAILABLE,
    YIELD_ITEM_TO_CANON,
    normalize,
    yield_available,
)
from app.ml.data_loaders import load_rotation


def test_yield_items_map_to_canonical():
    assert YIELD_ITEM_TO_CANON["Rice, paddy"] == "rice"
    assert YIELD_ITEM_TO_CANON["Potatoes"] == "potato"
    assert len(YIELD_AVAILABLE) == 7


def test_every_reco_crop_has_a_rotation_row():
    rotation_crops = set(load_rotation()["crop"])
    assert set(RECO_CROPS) == rotation_crops == ROTATION_AVAILABLE


def test_cotton_has_no_yield():
    assert not yield_available("cotton")
    assert not yield_available("sugarcane")


def test_normalize_handles_fao_and_aliases():
    assert normalize("Rice, paddy") == "rice"
    assert normalize("Potatoes") == "potato"
    assert normalize("WHEAT") == "wheat"
    assert normalize("black gram") == "blackgram"
