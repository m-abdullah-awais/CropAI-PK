"""Extend the Pakistan yield dataset past the original FAO cut-off (2013).

Strategy:
  - 1990-2013: original real FAO data (already in the file).
  - 2014-2024: REAL measured FAO yields fetched from Our World in Data
    (data/pakistan_recent_yields.csv) for wheat, rice, maize, potato, soybean.
  - Remaining gaps (2025-2026 for all crops; 2014-2026 for sorghum & sweet potato,
    which OWID has no series for): TREND PROJECTION per crop.

Non-yield features per added row (rainfall, pesticides, avg_temp) are estimates
(historical mean / linear trend / base-year pattern + slight warming); only the
yield target uses measured values where available.

Run from the repo root with the backend venv python:
  backend/.venv/Scripts/python.exe scripts/extend_yield_dataset.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "pakistan_crop_yield.csv"
RECENT = ROOT / "data" / "pakistan_recent_yields.csv"

ORIG_LAST_YEAR = 2013   # last year of the original FAO file
TARGET_YEAR = 2026
WARMING_PER_YEAR = 0.03

YIELD = "hg/ha_yield"
RAIN = "average_rain_fall_mm_per_year"
PEST = "pesticides_tonnes"

# crop slug (in pakistan_recent_yields.csv) -> FAO Item (in the dataset)
SLUG_TO_ITEM = {
    "wheat": "Wheat",
    "rice": "Rice, paddy",
    "maize": "Maize",
    "potato": "Potatoes",
    "soybean": "Soybeans",
}


def _trend(years, values) -> tuple[float, float]:
    slope, intercept = np.polyfit(np.asarray(years, float), np.asarray(values, float), 1)
    return float(slope), float(intercept)


def _load_real_recent() -> dict[tuple[str, int], float]:
    """(Item, year) -> measured yield in t/ha, from OWID."""
    out: dict[tuple[str, int], float] = {}
    if not RECENT.exists():
        print("WARNING: pakistan_recent_yields.csv not found; projecting all years.")
        return out
    r = pd.read_csv(RECENT, encoding="utf-8-sig")
    for _, row in r.iterrows():
        item = SLUG_TO_ITEM.get(str(row["crop"]))
        if item:
            out[(item, int(row["year"]))] = float(row["yield_t_ha"])
    return out


def main() -> None:
    df = pd.read_csv(DATA, encoding="utf-8-sig")
    df = df[df["Year"] <= ORIG_LAST_YEAR].copy()   # idempotent: keep only originals
    real_recent = _load_real_recent()

    new_frames: list[pd.DataFrame] = []
    for item in sorted(df["Item"].unique()):
        crop = df[df["Item"] == item]
        yearly = crop.drop_duplicates("Year").sort_values("Year")

        # Real yield points (t/ha): originals (<=2013) + measured recent (OWID).
        real_yield = {
            int(y): float(v) / 10000.0
            for y, v in zip(yearly["Year"], yearly[YIELD])
        }
        for (it, yr), t in real_recent.items():
            if it == item:
                real_yield[yr] = t

        ys, yi = _trend(list(real_yield.keys()), list(real_yield.values()))
        ps, pi = _trend(yearly["Year"], yearly[PEST])
        mean_rain = float(yearly[RAIN].mean())

        base = crop[crop["Year"] == ORIG_LAST_YEAR].copy()
        base_yield_t = float(base[YIELD].iloc[0]) / 10000.0

        for year in range(ORIG_LAST_YEAR + 1, TARGET_YEAR + 1):
            if year in real_yield:                       # measured (OWID)
                val_t = real_yield[year]
            else:                                        # projected
                val_t = max(yi + ys * year, base_yield_t * 0.5)

            rows = base.copy()
            rows["Year"] = year
            rows[YIELD] = round(val_t * 10000.0)
            rows[PEST] = round(max(pi + ps * year, 0.0), 1)
            rows[RAIN] = round(mean_rain, 1)
            rows["avg_temp"] = (
                rows["avg_temp"] + WARMING_PER_YEAR * (year - ORIG_LAST_YEAR)
            ).round(2)
            new_frames.append(rows)

    extended = pd.concat([df, *new_frames], ignore_index=True)
    extended = extended.sort_values(["Item", "Year"]).reset_index(drop=True)
    extended.to_csv(DATA, index=False, encoding="utf-8-sig")

    n_measured = len(real_recent)
    print(f"Wrote {len(extended)} rows. Years "
          f"{int(extended['Year'].min())}-{int(extended['Year'].max())}.")
    print(f"  Measured recent yields applied: {n_measured} (crop, year) points "
          f"(wheat/rice/maize/potato/soybean, 2014-2024).")
    print("  Projected: 2025-2026 (all crops) + sorghum/sweet potato 2014-2026.")


if __name__ == "__main__":
    main()
