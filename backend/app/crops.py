"""Canonical crop registry and availability across the three real datasets.

- Recommendation / rotation: 22 crops from the real crop-recommendation dataset.
- Yield: 9 crops with real FAO/OWID yield series (canonical slugs).
The three sets do not fully overlap; everything keys off the canonical slug.
"""

from __future__ import annotations

# 22 recommendation / rotation crops (labels in the real recommendation CSV).
RECO_CROPS: list[str] = [
    "rice", "maize", "cotton", "jute", "chickpea", "lentil", "mungbean",
    "blackgram", "kidneybeans", "mothbeans", "pigeonpeas", "watermelon",
    "muskmelon", "banana", "papaya", "pomegranate", "mango", "grapes",
    "apple", "orange", "coconut", "coffee",
]

# 13 crops with real yield data (canonical slugs in pakistan_yield_real.csv).
YIELD_CROPS: list[str] = [
    "wheat", "rice", "maize", "potato", "soybean", "sorghum",
    "sweet_potato", "sugarcane", "barley", "rapeseed", "beans", "peas", "tomato",
]

YIELD_AVAILABLE: set[str] = set(YIELD_CROPS)
ROTATION_AVAILABLE: set[str] = set(RECO_CROPS)

# Full canonical universe (recommendation crops + yield-only extras).
ALL_CROPS: list[str] = RECO_CROPS + [c for c in YIELD_CROPS if c not in RECO_CROPS]

_DISPLAY_OVERRIDES = {
    "sweet_potato": "Sweet Potato",
    "blackgram": "Black Gram",
    "kidneybeans": "Kidney Beans",
    "mothbeans": "Moth Beans",
    "pigeonpeas": "Pigeon Peas",
}

_ALIASES = {
    "rice_paddy": "rice", "potatoes": "potato", "soybeans": "soybean",
    "sweet_potatoes": "sweet_potato", "black_gram": "blackgram",
    "sugar_cane": "sugarcane", "kidney_beans": "kidneybeans",
    "moth_beans": "mothbeans", "pigeon_peas": "pigeonpeas",
}


def display_name(slug: str) -> str:
    if slug in _DISPLAY_OVERRIDES:
        return _DISPLAY_OVERRIDES[slug]
    return slug.replace("_", " ").title()


def normalize(crop: str) -> str:
    c = crop.strip().lower().replace(" ", "_")
    if c in ALL_CROPS:
        return c
    return _ALIASES.get(c, c)


def yield_available(slug: str) -> bool:
    return slug in YIELD_AVAILABLE


def rotation_available(slug: str) -> bool:
    return slug in ROTATION_AVAILABLE
