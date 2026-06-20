from __future__ import annotations

import pandas as pd

from app import __version__
from app.crops import (
    YIELD_AVAILABLE,
    display_name,
    normalize,
)
from app.ml.features import (
    YIELD_CROP_FEATURE,
    YIELD_NUMERIC_FEATURES,
    hg_per_ha_to_units,
    yield_real_through,
)
from app.registry import registry
from app.schemas.yield_ import (
    YieldHistoryPoint,
    YieldHistoryResponse,
    YieldRequest,
    YieldResponse,
)


def _default_pesticides(year: int) -> float:
    table: dict[int, float] = registry.yield_bundle["pesticides_mean_by_year"]
    if year in table:
        return table[year]
    # Nearest available year.
    nearest = min(table.keys(), key=lambda y: abs(y - year))
    return table[nearest]


def predict_yield(req: YieldRequest) -> YieldResponse:
    crop = normalize(req.crop)
    display = display_name(crop)

    if crop not in YIELD_AVAILABLE:
        return YieldResponse(
            available=False,
            crop=crop,
            display=display,
            message=(
                f"Yield prediction is not available for '{display}'. The yield model "
                f"covers only {len(YIELD_AVAILABLE)} crops with FAO data for Pakistan."
            ),
            yield_available_crops=sorted(display_name(c) for c in YIELD_AVAILABLE),
        )

    bundle = registry.yield_bundle
    pipe = bundle["model"]
    year_min, year_max = bundle["year_min"], bundle["year_max"]

    pesticides_defaulted = req.pesticides_tonnes is None
    pesticides = (
        _default_pesticides(req.year)
        if pesticides_defaulted
        else req.pesticides_tonnes
    )

    # The model covers 1990-2026 (real data to 2013, trend projections after).
    # Clamp years outside that range; flag projected years honestly.
    model_year = min(max(req.year, year_min), year_max)
    warning = None
    if req.year != model_year:
        warning = (
            f"Requested year {req.year} is outside the available range "
            f"{year_min}-{year_max}; prediction uses {model_year}."
        )
    else:
        real_through = yield_real_through(crop)
        if req.year > real_through:
            warning = (
                f"{req.year} is a trend projection - the last year of measured FAO "
                f"data for {display} is {real_through}. Treat this as an estimate, "
                f"not a record."
            )

    features = {
        YIELD_CROP_FEATURE: crop,
        "Year": model_year,
        "average_rain_fall_mm_per_year": req.rainfall_mm_per_year,
        "pesticides_tonnes": pesticides,
        "avg_temp": req.avg_temp,
    }
    row = pd.DataFrame([features], columns=[YIELD_CROP_FEATURE] + YIELD_NUMERIC_FEATURES)
    pred = float(pipe.predict(row)[0])
    units = hg_per_ha_to_units(pred)

    return YieldResponse(
        available=True,
        crop=crop,
        display=display,
        year=req.year,
        yield_hg_per_ha=units["yield_hg_per_ha"],
        yield_kg_per_ha=units["yield_kg_per_ha"],
        yield_t_per_ha=units["yield_t_per_ha"],
        pesticides_tonnes=round(float(pesticides), 2),
        pesticides_defaulted=pesticides_defaulted,
        extrapolation_warning=warning,
        model_version=__version__,
    )


def yield_history(crop: str) -> YieldHistoryResponse:
    slug = normalize(crop)
    display = display_name(slug)
    series = registry.yield_history.get(slug, [])
    return YieldHistoryResponse(
        available=bool(series),
        crop=slug,
        display=display,
        series=[YieldHistoryPoint(**p) for p in series],
    )
