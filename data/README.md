# Datasets (real data only)

Every dataset here is real - no auto-generated or synthetic rows. Each capability
is its own model/engine, chained in the application layer.

| Capability          | File                              | Type              | Real source |
|---------------------|-----------------------------------|-------------------|-------------|
| Crop recommendation | `pakistan_crop_recommendation.csv`| ML classification | Kaggle/ICFA crop-recommendation dataset |
| Crop yield          | `pakistan_yield_real.csv`         | ML regression     | FAO / Our World in Data |
| Crop rotation       | `pakistan_crop_rotation_rules.csv`| rules lookup      | curated agronomy (facts, not measurements) |

---

## 1. pakistan_crop_recommendation.csv - recommendation (classification)

**Real** dataset, 2,200 rows, **22 crops** (100 each), target `label`.
Columns: `N, P, K, temperature(C), humidity(%), ph, rainfall(mm), label`.

- Crops: rice, maize, cotton, jute, chickpea, lentil, mungbean, blackgram,
  kidneybeans, mothbeans, pigeonpeas, watermelon, muskmelon, banana, papaya,
  pomegranate, mango, grapes, apple, orange, coconut, coffee.
- The canonical crop-recommendation dataset (Atharva Ingle / Indian Chamber of Food
  and Agriculture), built from Indian rainfall/climate/fertilizer records. It is the
  only public soil-NPK -> crop dataset; it does NOT contain wheat or sugarcane (no
  real NPK -> crop data exists for those anywhere).
- Source: https://raw.githubusercontent.com/gireesh777/Crop_Recommendation_System_using_ML/master/Dataset/Crop_recommendation.csv

## 2. pakistan_yield_real.csv - yield prediction (regression)

**Real** measured yields, columns `crop, year, yield_t_ha`. One row per crop-year.

- 9 crops: wheat, rice, maize, potato, soybean, sugarcane, barley (1990-2024);
  sorghum, sweet_potato (1990-2013, no OWID series after).
- The model maps `(crop, year) -> yield` - no estimated climate features, no
  projected rows. A request for a year past a crop's last real year returns that
  crop's latest real value with a note.
- ⚠️ **Cotton has no yield series** (OWID has no cotton grapher; the FAOSTAT API now
  requires auth), so cotton is recommendation-only.
- Sources: Our World in Data per-crop `*-yields` graphers (FAO "Production: Crops and
  livestock products"), e.g. https://ourworldindata.org/grapher/wheat-yields ;
  sugarcane via https://ourworldindata.org/grapher/sugar-cane-yields .

## 3. pakistan_crop_rotation_rules.csv - rotation (rules)

Curated agronomic rules for the **same 22 crops**. Columns: `crop, family,
season(Kharif/Rabi/perennial), nitrogen_role, recommended_next(;-sep),
avoid_next(;-sep), notes`. This is established agronomy (botanical families,
nitrogen fixing, perennial handling), not fabricated measurements - there is no
public ML dataset for crop rotation. Perennials have no annual successor (see notes).

---

## Notes

- **No synthetic data.** The previous generated recommendation dataset, the
  requirement-ranges recipe, and the yield-projection script were removed.
- Recommendation accuracy is high because the real dataset's classes are
  well separated; still validate against local soil tests before field use.
