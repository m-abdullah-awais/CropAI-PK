"""Canonical crop registry and availability across the three real datasets.

- Recommendation / rotation: 22 crops from the real crop-recommendation dataset.
- Yield: 9 crops with real FAO/OWID yield series (canonical slugs).
The three sets do not fully overlap; everything keys off the canonical slug.
"""

from __future__ import annotations

# 21 recommendation / rotation crops (labels in the real recommendation CSV).
# Coffee was dropped: it is not grown commercially in Pakistan, so no real yield exists.
RECO_CROPS: list[str] = [
    "rice", "maize", "cotton", "jute", "chickpea", "lentil", "mungbean",
    "blackgram", "kidneybeans", "mothbeans", "pigeonpeas", "watermelon",
    "muskmelon", "banana", "papaya", "pomegranate", "mango", "grapes",
    "apple", "orange", "coconut",
]

# 31 crops with real yield data (FAOSTAT + Pakistan pulse/pomegranate figures).
# Covers ALL 21 recommendation crops (so recommend -> yield always works) + 10 yield-only.
YIELD_CROPS: list[str] = [
    # all 21 recommendation crops:
    "rice", "maize", "cotton", "jute", "chickpea", "lentil", "mungbean",
    "blackgram", "kidneybeans", "mothbeans", "pigeonpeas", "watermelon",
    "muskmelon", "banana", "papaya", "pomegranate", "mango", "grapes",
    "apple", "orange", "coconut",
    # yield-only:
    "wheat", "potato", "soybean", "sorghum", "sweet_potato", "sugarcane",
    "barley", "rapeseed", "peas", "tomato",
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
