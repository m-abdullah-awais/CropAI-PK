# CropAI PK

AI-powered **crop recommendation**, **yield prediction**, and **crop rotation planning**
for Pakistani agriculture - built entirely on real, public agricultural data, with a
clean multilingual interface (English, Urdu, Hindi).

**Author:** Muhammad Abdullah Awais - [abdullahawais.com](https://abdullahawais.com)

---

## Features

- **Crop Recommendation** - enter soil nutrients (N, P, K, pH) and a location; live
  weather auto-fills temperature, humidity, and rainfall, and a machine-learning model
  ranks the best crops for your field by confidence.
- **Yield Prediction** - real FAO/OWID yield for 13 Pakistani crops (1961-2024). Pick a
  crop and year to see the expected yield and its full historical trend.
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
| ML | RandomForest (classification + regression) |
| Weather | Open-Meteo (free, no API key) |
| i18n | Custom React context (en / ur / hi) with RTL support |

The browser talks only to Next.js; ML calls are proxied server-side to FastAPI, and
weather is proxied through a Next.js route handler.

## Data (real only)

No synthetic, generated, or projected rows - every dataset is real.

- **Recommendation** - `data/pakistan_crop_recommendation.csv`: the canonical
  crop-recommendation dataset (22 crops; N, P, K, temperature, humidity, pH, rainfall).
- **Yield** - `data/pakistan_yield_real.csv`: real FAO / Our World in Data yields for
  13 crops, 1961-2024 (`crop, year, yield_t_ha`).
- **Rotation** - `data/pakistan_crop_rotation_rules.csv`: curated agronomic rules
  (established facts; there is no ML dataset for rotation).

See `data/README.md` for sources and details.

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
backend/    FastAPI + scikit-learn (models, training, endpoints)
data/       real datasets (shared, read by training)
scripts/    data utilities
```

## Honesty notes

- Recommendation accuracy is high because the real dataset's classes are well separated;
  validate against local soil tests before field use.
- Recommendation (22 crops) and yield (13 crops) barely overlap - that is the true shape
  of the available real data. **Cotton** is recommendation-only (no public yield series).
- Rainfall auto-filled from the weather API is recent precipitation, not the seasonal
  total the model expects; it is pre-filled but editable and flagged.

## License

For research and educational use.

---

Built by **Muhammad Abdullah Awais** - [abdullahawais.com](https://abdullahawais.com)
