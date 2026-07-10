# Datasets (real data only)

Every dataset here is real - no auto-generated or synthetic rows. Each capability
is its own model/engine, chained in the application layer.

| Capability          | File                              | Type              | Real source |
|---------------------|-----------------------------------|-------------------|-------------|
| Crop recommendation | `pakistan_crop_recommendation.csv`| ML classification | Kaggle/ICFA crop-recommendation dataset |
| Crop yield          | `pakistan_yield_real.csv`         | ML regression     | FAO / Our World in Data |
| Crop rotation       | `pakistan_crop_rotation_rules.csv` + `pakistan_crop_nutrient_effects.csv`| ML (projected soil -> KNN) + agronomy | recommendation KNN + curated agronomy facts |

---

## 1. pakistan_crop_recommendation.csv - recommendation (classification)

**Real** dataset, 2,100 rows, **21 crops** (100 each), target `label`.
Columns: `N, P, K, temperature(C), humidity(%), ph, rainfall(mm), label`.

- Crops: rice, maize, cotton, jute, chickpea, lentil, mungbean, blackgram,
  kidneybeans, mothbeans, pigeonpeas, watermelon, muskmelon, banana, papaya,
  pomegranate, mango, grapes, apple, orange, coconut.
- The canonical crop-recommendation dataset (Atharva Ingle / Indian Chamber of Food
  and Agriculture), built from Indian rainfall/climate/fertilizer records. **Coffee
  was removed** (it is not grown commercially in Pakistan, so no real yield exists),
  leaving 21 crops - and every one of them now has real yield data (below).
- It does NOT contain wheat or sugarcane (no real NPK -> crop data exists for those).
- Source: https://raw.githubusercontent.com/gireesh777/Crop_Recommendation_System_using_ML/master/Dataset/Crop_recommendation.csv

## 2. pakistan_yield_real.csv - yield prediction (regression)

**Real** measured yields, columns `crop, year, yield_t_ha`. One row per crop-year.
1,820 rows, **31 crops**. Covers **all 21 recommendation crops** + 10 yield-only.

- Main source: **FAOSTAT** QCL bulk (no auth), filtered to Area=Pakistan, Element=Yield
  (kg/ha -> t/ha), 1961-2024:
  `https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip`
- **mungbean / blackgram / mothbeans**: FAOSTAT reports these only as a combined
  "Other pulses n.e.c." series for Pakistan (its own per-crop stats are PDF-only), so
  the three use that real aggregate (~0.8 t/ha, matching published mungbean figures).
- **pomegranate**: real national figure 3.88 t/ha (57.8 kt on 14.9 kha; Balochistan
  ~82%) - a single documented point, so its trend is flat.
- The model is a **per-crop linear trend** (last 15 years) that FORECASTS forward:
  a real year returns the recorded value; a future year returns
  `last_value + slope*(year - last_year)` (a trend-based forecast, flagged and shown
  with the trend direction/rate). This is model inference, not fabricated rows. It is
  backtested (fit on all-but-last-5 years, forecast them; MAE in metrics.json).
- Rebuild by downloading the FAOSTAT QCL bulk and filtering Pakistan yields (see the
  script under the project scratchpad, or re-run the documented extraction).

## 3. Crop rotation - ML-driven (projected soil -> recommendation KNN + agronomy)

Rotation is **not** a static lookup any more, and there is still **no public real
rotation dataset** (only synthetic, rule-generated ones, which our real-data rule
forbids). Instead the next-crop ranking is produced by a real model:

1. Start from the field's soil/climate state (the farmer's real soil test, or the
   current crop's average profile from the recommendation dataset when left blank).
2. **Project the soil forward** by the current crop's real agronomic nutrient effect
   (a legume leaves residual N; a cereal/cotton depletes N and K, etc).
3. **Score every candidate crop** on that projected soil with the trained
   recommendation **KNN** (`recommendation.joblib`) - the same real 2,100-row model.
4. **Blend** the soil-suitability score with real agronomy facts: exclude/penalise the
   same botanical family and documented `avoid_next` crops, boost a legume after a
   heavy feeder (nitrogen break), and drop perennials as a "next" crop.

Two supporting fact tables (agronomy, not fabricated measurements):

- **`pakistan_crop_rotation_rules.csv`** - the **same 21 crops**. Columns: `crop,
  family, season(Kharif/Rabi/perennial), nitrogen_role, recommended_next(;-sep),
  avoid_next(;-sep), notes`. Botanical families, nitrogen fixing and perennial
  handling. `recommended_next`/`avoid_next` seed the agronomy blend and the avoid list.
- **`pakistan_crop_nutrient_effects.csv`** - the soil nutrient delta a crop leaves for
  the next crop, keyed by `nitrogen_role`. Columns: `nitrogen_role, delta_n, delta_p,
  delta_k, description`. Real published direction/magnitude (legume +N residual;
  heavy feeder -N -K), used for the soil projection in step 2.

The trained artifact `models/rotation.joblib` bundles each crop's average soil profile,
the nutrient-effect table and the observed feature ranges, built by
`training/train_rotation.py`. Perennials have no annual successor (see notes).

---

## Data sources & links (every resource used)

### Crop recommendation dataset (soil NPK + climate -> crop)
- Crop Recommendation Dataset (Atharva Ingle / Indian Chamber of Food and Agriculture),
  Kaggle: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
- GitHub raw mirror actually downloaded:
  https://raw.githubusercontent.com/gireesh777/Crop_Recommendation_System_using_ML/master/Dataset/Crop_recommendation.csv
- Hugging Face mirror (Parquet): https://huggingface.co/datasets/randalakab/Crop-recommendation

### Yield data (crop, year -> yield)
- FAOSTAT - Production: Crops and livestock products (primary source, all crops):
  https://www.fao.org/faostat/en/#data/QCL
  - No-auth bulk file used:
    https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip
  - Bulk dataset index: https://bulks-faostat.fao.org/production/datasets_E.xml
- Our World in Data - Crop yields (FAO-derived; cross-checking + earlier per-crop pulls):
  https://ourworldindata.org/crop-yields  (per-crop e.g. https://ourworldindata.org/grapher/wheat-yields )
- mungbean / blackgram / mothbeans -> FAOSTAT "Other pulses n.e.c." for Pakistan;
  cross-checked against "Trend Analysis of Mungbean Area and Yield in Pakistan":
  https://www.researchgate.net/publication/309547815
- pomegranate national figure (57.8 kt on 14.9 kha = 3.88 t/ha), AgriHunt:
  https://agrihunt.com/articles/horti-industry/pomegranate-as-an-emerging-industry-of-pakistan/
- Pakistan official district-wise crop data (reference, PDF-only): Ministry of National
  Food Security & Research https://mnfsr.gov.pk/ ; Pakistan Bureau of Statistics
  https://www.pbs.gov.pk/

### Weather
- Open-Meteo (free, keyless): geocoding https://open-meteo.com/en/docs/geocoding-api ;
  forecast https://open-meteo.com/en/docs

### Rotation agronomy (facts behind the rules table)
- FAO "Fertilizer use by crop in Pakistan": https://www.fao.org/4/y5460e/y5460e08.htm
- Pakistan Agricultural Research Council (PARC): https://www.parc.gov.pk/
- Ayub Agricultural Research Institute (AARI), Punjab: https://aari.punjab.gov.pk/

---

## Notes

- **No synthetic data.** The previous generated recommendation dataset, the
  requirement-ranges recipe, and the yield-projection script were removed.
- Recommendation accuracy is high because the real dataset's classes are
  well separated; still validate against local soil tests before field use.
- The root `README.md` is the single source of truth for the whole project; this file
  documents the datasets specifically.
