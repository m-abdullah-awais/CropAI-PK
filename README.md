# CropAI PK

AI-powered **crop recommendation**, **yield prediction**, and **crop rotation planning**
for Pakistani agriculture - built entirely on real, public agricultural data, with a
clean multilingual interface (English, Urdu, Hindi).

**Author:** Muhammad Abdullah Awais - [abdullahawais.com](https://abdullahawais.com)

---

## Features

- **Crop Recommendation** - enter soil nutrients (N, P, K, pH) and a location; live
  weather auto-fills temperature, humidity, and rainfall, and a scaled K-Nearest-Neighbours
  model ranks the best crops for your field by confidence (21 crops).
- **Yield Prediction** - real **FAOSTAT** yield for **31 crops** (1961-2024). A per-crop
  trend model forecasts forward: recorded value for past years, trend-based forecast for
  future years. Every recommended crop can be forecast (recommend -> predict yield).
- **Rotation Planning** - pick a crop to see what to plant next season and what to avoid,
  based on agronomic rules (botanical family, nitrogen role, cropping systems).
- **Multilingual** - full UI in **English**, **Urdu** (right-to-left), and **Hindi**,
  including translated crop names. Language is remembered across visits.
- **Light / dark mode**, responsive, accessible, and mobile-friendly.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | FastAPI, scikit-learn, pandas |
| ML | Scaled KNN classifier (recommendation); per-crop linear trend forecaster (yield) |
| Weather | Open-Meteo (free, no API key) |
| i18n | Custom React context (en / ur / hi) with RTL support |

The browser talks only to Next.js; ML calls are proxied server-side to FastAPI, and
weather is proxied through a Next.js route handler.

## Data (real only)

No synthetic, generated, or projected rows - every dataset is real.

- **Recommendation** - `data/pakistan_crop_recommendation.csv`: the canonical
  crop-recommendation dataset, **21 crops** (coffee removed - not grown in Pakistan;
  N, P, K, temperature, humidity, pH, rainfall).
- **Yield** - `data/pakistan_yield_real.csv`: real yields for **31 crops**, 1961-2024
  (`crop, year, yield_t_ha`), covering all 21 recommendation crops.
- **Rotation** - `data/pakistan_crop_rotation_rules.csv`: curated agronomic rules
  (established facts; there is no ML dataset for rotation).

See `data/README.md` for per-crop provenance.

## Data sources & resources

Every number in the app comes from one of these public resources.

### Crop recommendation dataset (soil NPK + climate -> crop)
- **Crop Recommendation Dataset** (Atharva Ingle, augmented from Indian Chamber of Food
  and Agriculture rainfall/climate/fertilizer records) - the canonical public soil-NPK
  dataset. Kaggle: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
- GitHub raw mirror actually downloaded:
  https://raw.githubusercontent.com/gireesh777/Crop_Recommendation_System_using_ML/master/Dataset/Crop_recommendation.csv
- Hugging Face mirror (Parquet): https://huggingface.co/datasets/randalakab/Crop-recommendation

### Yield data (crop, year -> yield)
- **FAOSTAT - Production: Crops and livestock products** (primary source, all crops):
  https://www.fao.org/faostat/en/#data/QCL
  - No-auth bulk file used:
    https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip
  - Bulk dataset index: https://bulks-faostat.fao.org/production/datasets_E.xml
- **Our World in Data - Crop yields** (FAO-derived, used for cross-checking and the
  earlier per-crop pulls): https://ourworldindata.org/crop-yields
  (per-crop CSVs e.g. https://ourworldindata.org/grapher/wheat-yields )
- **mungbean / blackgram / mothbeans**: FAOSTAT reports these together as
  "Other pulses n.e.c." for Pakistan. Cross-checked against "Trend Analysis of Mungbean
  Area and Yield in Pakistan":
  https://www.researchgate.net/publication/309547815
- **pomegranate** national yield (57.8 kt on 14.9 kha = 3.88 t/ha), AgriHunt
  "Pomegranate: an emerging industry of Pakistan":
  https://agrihunt.com/articles/horti-industry/pomegranate-as-an-emerging-industry-of-pakistan/
- Pakistan official district-wise crop data (reference, PDF-only): Ministry of National
  Food Security & Research - https://mnfsr.gov.pk/ and Pakistan Bureau of Statistics -
  https://www.pbs.gov.pk/

### Weather
- **Open-Meteo** (free, keyless):
  - Geocoding API: https://open-meteo.com/en/docs/geocoding-api
  - Forecast API: https://open-meteo.com/en/docs

### Rotation agronomy (facts behind the rules table)
- FAO - "Fertilizer use by crop in Pakistan": https://www.fao.org/4/y5460e/y5460e08.htm
- Pakistan Agricultural Research Council (PARC): https://www.parc.gov.pk/
- Ayub Agricultural Research Institute (AARI), Punjab: https://aari.punjab.gov.pk/

## Getting started

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Python 3.11+** (a real interpreter, not the Windows Store stub)

### Install

```bash
# Frontend + root tooling
pnpm install
pnpm -C frontend install

# Backend (Windows PowerShell)
py -3.14 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
```

### Train the models

```bash
backend/.venv/Scripts/python.exe -m training.eval_report   # run from backend/
```

### Run everything (one command)

```bash
pnpm dev
```

- Frontend: http://localhost:4319
- Backend API + docs: http://localhost:9271/docs

## Project structure

```
frontend/   Next.js app (UI, i18n, API proxy routes)
backend/    FastAPI + scikit-learn (models, training, endpoints, tests)
data/       real datasets + data/README.md (per-crop provenance)
```

## Honesty notes

- Recommendation accuracy is high because the real dataset's classes are well separated;
  validate against local soil tests before field use.
- Every one of the 21 recommendation crops has real yield data, so recommend -> predict
  yield always works. **Coffee** was dropped from recommendations because it is not grown
  commercially in Pakistan (no real yield exists) - rather than invent a number.
- mungbean/blackgram/mothbeans use FAOSTAT's real "Other pulses" series (Pakistan does
  not publish machine-readable per-crop pulse yields); pomegranate uses one documented
  national figure (flat trend). Nothing is fabricated.
- Future-year yields are **trend forecasts** (model inference from past real data),
  clearly flagged in the UI - not recorded data.
- Rainfall auto-filled from the weather API is recent precipitation, not the seasonal
  total the model expects; it is pre-filled but editable and flagged.

## License

For research and educational use.

---

Built by **Muhammad Abdullah Awais** - [www.abdullahawais.com](https://www.abdullahawais.com)
