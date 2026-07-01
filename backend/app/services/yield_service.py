from __future__ import annotations

import pandas as pd

from app import __version__
from app.crops import YIELD_AVAILABLE, display_name, normalize
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


def predict_yield(req: YieldRequest) -> YieldResponse:
    crop = normalize(req.crop)
    display = display_name(crop)

    if crop not in YIELD_AVAILABLE:
        return YieldResponse(
            available=False,
            crop=crop,
            display=display,
            message=(
                f"Yield data is not available for '{display}'. Real yield series exist "
                f"for {len(YIELD_AVAILABLE)} crops."
            ),
            yield_available_crops=sorted(display_name(c) for c in YIELD_AVAILABLE),
        )

    bundle = registry.yield_bundle
    pipe = bundle["model"]
    year_min = bundle["year_min"]
    real_through = min(yield_real_through(crop), bundle["year_max"])

    # The dataset is real 1990-2024 (or 2013 for sorghum/sweet potato). Predict
    # within the real range; a request beyond it is flagged and uses the last real year.
    model_year = min(max(req.year, year_min), real_through)
    warning = None
    if req.year != model_year:
        warning = (
            f"No real yield data for {display} in {req.year}; showing the latest "
            f"available year ({real_through})."
        )

    row = pd.DataFrame(
        [[crop, model_year]], columns=[YIELD_CROP_FEATURE] + YIELD_NUMERIC_FEATURES
    )
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
        extrapolation_warning=warning,
        model_version=__version__,
    )


def yield_history(crop: str) -> YieldHistoryResponse:
    slug = normalize(crop)
    series = registry.yield_history.get(slug, [])
    return YieldHistoryResponse(
        available=bool(series),
        crop=slug,
        display=display_name(slug),
        series=[YieldHistoryPoint(**p) for p in series],
    )
