"""Build the Pakistan yield training dataset (pakistan_crop_yield.csv).

Single source of truth for real yields: data/pakistan_yield_real.csv
(crop slug, year, yield_t_ha) - real FAO/OWID measured yields 1990-2024 for the
Pakistani yield crops. National context features (rainfall, pesticides, avg_temp)
are shared across crops per year, so we reuse one crop's rows as a per-year
template and only swap in each crop's real yield.

  - 1990-2024: real measured yield per crop (where available in the real source).
  - 2025-2026: per-crop linear TREND projection.
  - sorghum / sweet potato: real only through 2013 (no OWID series), projected after.

Run from the repo root with the backend venv python:
  backend/.venv/Scripts/python.exe scripts/extend_yield_dataset.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "pakistan_crop_yield.csv"
REAL = ROOT / "data" / "pakistan_yield_real.csv"

YEAR_MIN, YEAR_MAX = 1990, 2026
YIELD = "hg/ha_yield"

# canonical slug -> FAO Item label used in the training CSV
CROP_TO_ITEM = {
    "wheat": "Wheat", "rice": "Rice, paddy", "maize": "Maize",
    "potato": "Potatoes", "soybean": "Soybeans", "sorghum": "Sorghum",
    "sweet_potato": "Sweet potatoes", "sugarcane": "Sugar cane", "barley": "Barley",
}
# Crop whose existing rows carry the national feature template per year.
TEMPLATE_ITEM = "Wheat"


def main() -> None:
    df = pd.read_csv(DATA, encoding="utf-8-sig")
    real = pd.read_csv(REAL, encoding="utf-8-sig")

    # Per-year national feature template (rainfall, pesticides, avg_temp rows).
    template: dict[int, pd.DataFrame] = {}
    for year in range(YEAR_MIN, YEAR_MAX + 1):
        rows = df[(df["Item"] == TEMPLATE_ITEM) & (df["Year"] == year)]
        if len(rows):
            template[year] = rows.copy()
    if not template:
        raise SystemExit("No template rows found - is pakistan_crop_yield.csv intact?")

    frames: list[pd.DataFrame] = []
    for slug, item in CROP_TO_ITEM.items():
        pts = real[real["crop"] == slug]
        real_by_year = {int(r.year): float(r.yield_t_ha) for r in pts.itertuples()}
        if not real_by_year:
            print(f"  WARNING: no real yields for {slug}; skipping.")
            continue
        years = np.array(sorted(real_by_year))
        vals = np.array([real_by_year[y] for y in years], dtype=float)
        slope, intercept = np.polyfit(years, vals, 1)
        floor = float(vals.min()) * 0.5

        for year in range(YEAR_MIN, YEAR_MAX + 1):
            if year not in template:
                continue
            t = real_by_year.get(year, max(intercept + slope * year, floor))
            rows = template[year].copy()
            rows["Item"] = item
            rows[YIELD] = round(t * 10000.0)
            frames.append(rows)

    out = pd.concat(frames, ignore_index=True).sort_values(["Item", "Year"])
    out = out.reset_index(drop=True)
    out.to_csv(DATA, index=False, encoding="utf-8-sig")

    crops = sorted(out["Item"].unique())
    print(f"Wrote {len(out)} rows, years {int(out['Year'].min())}-{int(out['Year'].max())}.")
    print(f"  {len(crops)} crops: {', '.join(crops)}")
    print("  Real yields to 2024 (OWID/FAO); 2025-2026 projected; "
          "sorghum/sweet potato real to 2013.")


if __name__ == "__main__":
    main()
