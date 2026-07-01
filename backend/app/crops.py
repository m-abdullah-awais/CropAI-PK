"""Canonical crop registry and normalization across the three datasets.

- Recommendation covers 15 crops (canonical slugs).
- Yield covers 7 crops, named differently in the FAO CSV ("Rice, paddy" etc.)
  and including two crops (soybean, sweet_potato) that recommendation/rotation lack.
- Rotation covers the same 15 as recommendation.

Everything keys off the canonical slug.
"""

from __future__ import annotations

# 15 recommendation / rotation crops (canonical slugs == labels in the CSVs).
RECO_CROPS: list[str] = [
    "wheat", "rice", "maize", "cotton", "sugarcane", "chickpea", "lentil",
    "mungbean", "blackgram", "mustard", "sunflower", "potato", "sorghum",
    "millet", "barley",
]

# FAO yield CSV `Item` value -> canonical slug.
YIELD_ITEM_TO_CANON: dict[str, str] = {
    "Maize": "maize",
    "Wheat": "wheat",
    "Rice, paddy": "rice",
    "Potatoes": "potato",
    "Sorghum": "sorghum",
    "Soybeans": "soybean",
    "Sweet potatoes": "sweet_potato",
    "Sugar cane": "sugarcane",
    "Barley": "barley",
}
CANON_TO_YIELD_ITEM: dict[str, str] = {v: k for k, v in YIELD_ITEM_TO_CANON.items()}

YIELD_AVAILABLE: set[str] = set(YIELD_ITEM_TO_CANON.values())
ROTATION_AVAILABLE: set[str] = set(RECO_CROPS)

# Full canonical universe (recommendation + yield-only extras).
ALL_CROPS: list[str] = RECO_CROPS + ["soybean", "sweet_potato"]

# Display names (slugs are already readable; only the two-word ones need help).
_DISPLAY_OVERRIDES = {"sweet_potato": "Sweet Potato", "blackgram": "Black Gram"}


def display_name(slug: str) -> str:
    if slug in _DISPLAY_OVERRIDES:
        return _DISPLAY_OVERRIDES[slug]
    return slug.replace("_", " ").title()


def normalize(crop: str) -> str:
    """Best-effort normalization of arbitrary crop input to a canonical slug."""
    c = crop.strip().lower().replace(" ", "_")
    if c in ALL_CROPS:
        return c
    # Accept the FAO display forms too.
    if crop in YIELD_ITEM_TO_CANON:
        return YIELD_ITEM_TO_CANON[crop]
    aliases = {"rice_paddy": "rice", "potatoes": "potato", "soybeans": "soybean",
               "sweet_potatoes": "sweet_potato", "black_gram": "blackgram"}
    return aliases.get(c, c)


def yield_available(slug: str) -> bool:
    return slug in YIELD_AVAILABLE


def rotation_available(slug: str) -> bool:
    return slug in ROTATION_AVAILABLE
