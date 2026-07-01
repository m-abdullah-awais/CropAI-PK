# Datasets (Pakistan)

Data for the three capabilities, scoped to **Pakistan**. They live at **different
granularities** and do **not** join into one table - each capability is its own
model/engine, chained in the application layer.

| Capability          | Active file                       | Granularity            | Type              |
|---------------------|-----------------------------------|------------------------|-------------------|
| Crop recommendation | `pakistan_crop_recommendation.csv`| soil sample            | ML classification |
| Crop yield          | `pakistan_crop_yield.csv`         | country × crop × year  | ML regression     |
| Crop rotation       | `pakistan_crop_rotation_rules.csv`| per crop (knowledge)   | rules engine      |

Supporting file kept: `pakistan_crop_requirements.csv` (documented ranges, see below).
The generic source CSVs are **not stored** in the repo (re-downloadable - see "Provenance").

---

## 1. pakistan_crop_recommendation.csv - recommendation (classification)

15,000 rows, **15 Pakistani crops** (1,000 each, balanced), target `label`.
Columns: `N, P, K, temperature(°C), humidity(%), ph, rainfall(mm), label`.

**Crops:** wheat, rice, maize, cotton, sugarcane, chickpea, lentil, mungbean,
blackgram, mustard, sunflower, potato, sorghum, millet, barley.

### How it was built (important - read before trusting accuracy)

Measured per-field soil-NPK→crop data does **not** exist publicly for Pakistan.
So this dataset is **generated from documented requirement ranges**, two ways:

- **7 crops (`source=measured`)** - rice, maize, cotton, chickpea, lentil,
  mungbean, blackgram: ranges (mean/std/min/max per feature) computed from the
  **real measured** Indian-subcontinent dataset (`Crop_recommendation.csv`), whose
  agronomy applies to Pakistani Punjab.
- **8 crops (`source=literature`)** - wheat, sugarcane, potato, mustard,
  sunflower, sorghum, millet, barley: ranges derived from **published Pakistani
  agronomic guidelines** (FAO "Fertilizer use by crop in Pakistan", PARC/NARC crop
  guides, fertilizer-recommendation literature).

Generation: per crop, each feature is sampled from a Gaussian(mean, std) clamped to
[min, max]. See `pakistan_crop_requirements.csv` (the documented ranges) and
`../scripts/generate_reco_dataset.ps1` (reproducible, seeded generator).

⚠️ **Honesty note:** this is reference-grounded **synthetic** data, not field
measurements. It is suitable for building and demonstrating the recommendation
model, but real-world accuracy should be validated against actual soil-test +
crop-outcome records before production use.

## 2. pakistan_crop_yield.csv - yield prediction (regression)

2,916 rows, Pakistan only, years **1990-2026**, **9 crops**. Target `hg/ha_yield`.

> **Real vs projected (yield target):** the real yields come from
> `pakistan_yield_real.csv` (the source of truth, 1990-2024).
> - **1990-2024** - **real measured FAO/OWID yields** for wheat, rice, maize, potato,
>   soybean, **sugarcane**, and **barley** (Our World in Data, FAO "Production: Crops
>   and livestock products"). Sorghum & sweet potato are real only **through 2013**
>   (no OWID series).
> - **2025-2026** (all crops) and post-2013 for sorghum/sweet potato - **trend projections**.
>
> National context features (rainfall, pesticides, avg_temp) are shared across crops
> per year; the builder reuses Wheat's rows as a per-year template and swaps in each
> crop's real yield. The API flags a prediction as a projection only when the requested
> year exceeds that crop's last measured year (`yield_real_through()` in the backend).
>
> Rebuild with `scripts/extend_yield_dataset.py` (idempotent, driven by
> `pakistan_yield_real.csv`).

Columns: `Area, Item, Year, hg/ha_yield, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp`.

- Crops (9): Wheat, Rice paddy, Maize, Potatoes, Soybeans, Sorghum, Sweet potatoes,
  **Sugar cane**, **Barley**.
- ⚠️ **Remaining gap:** **cotton** has no public yield series (OWID has no cotton
  grapher; the FAOSTAT API now requires auth). Sugarcane is now covered.
- Different granularity from recommendation: national/annual, not per soil sample.

## 3. pakistan_crop_rotation_rules.csv - rotation (rules engine)

Curated agronomic table for the **same 15 crops**, so a recommended crop links to a
sensible next crop. Columns: `crop, family, season(Kharif/Rabi/annual/spring),
nitrogen_role, recommended_next(;-sep), avoid_next(;-sep), notes`.

Encodes Pakistani cropping systems: rice-wheat and cotton-wheat rotations, mungbean
as a nitrogen-fixing catch crop, don't-repeat-the-same-family, follow heavy feeders
with legumes, sugarcane/perennial handling. Validated: every referenced crop exists
in the recommendation crop list.

---

## Supporting file

- `pakistan_crop_requirements.csv` - the documented per-crop feature ranges
  (mean/std/min/max) with a `source` column (measured | literature). Auditable basis
  for the generated recommendation dataset.

## Recent real yields

- `pakistan_recent_yields.csv` - measured Pakistan yields (t/ha) for wheat, rice,
  maize, potato, soybean, **2014-2024**, from Our World in Data (FAO source):
  e.g. https://ourworldindata.org/grapher/wheat-yields (per-crop `*-yields` graphers).
  Merged into the yield dataset by `scripts/extend_yield_dataset.py`.

## Provenance (source files, not stored)

The two generic source datasets were distilled into the Pakistan files above and
then removed to keep the repo lean. Re-download if you need to re-derive ranges:

- Real Indian-subcontinent measured data (2,200 rows) - basis for the 7 `measured`
  crops' ranges in `pakistan_crop_requirements.csv`:
  https://raw.githubusercontent.com/gireesh777/Crop_Recommendation_System_using_ML/master/Dataset/Crop_recommendation.csv
- Full FAO/World-Bank yield data (28,242 rows, 101 countries) - Pakistan rows were
  filtered into `pakistan_crop_yield.csv`:
  https://raw.githubusercontent.com/ManikantaSanjay/crop_yield_prediction_regression/master/yield_df.csv

---

## Planned upgrade: government district-level yield data

To add cotton & sugarcane and move to district resolution, replace
`pakistan_crop_yield.csv` with official data. **What is needed:**

- **Source:** Pakistan Bureau of Statistics (pbs.gov.pk) or Ministry of National
  Food Security & Research "Crops Area & Production (District-wise)" - and
  Economic Survey of Pakistan agriculture chapter.
- **Form needed:** machine-readable (Excel/CSV). The official releases are mostly
  **PDF tables**, so this needs either (a) the user to supply an Excel/CSV export, or
  (b) a PDF-table extraction pass.
- **Target schema:** `province, district, crop, year, area_hectares,
  production_tonnes, yield_t_per_ha` (yield = production ÷ area).
- **Optional join:** district-level rainfall/temperature (Pakistan Met Department)
  to add climate features.

Until then, `pakistan_crop_yield.csv` (FAO Pakistan subset) is the working dataset.

---

## Prerequisite

Model training needs a real **Python** install (3.10+). The machine currently only
has the Windows Store Python stubs. The dataset generator is PowerShell so it runs
without Python; the ML pipeline will need Python.
