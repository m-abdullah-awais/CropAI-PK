# Pakistan Crop AI - Backend

FastAPI + scikit-learn service for three capabilities, all on REAL data:

- **Recommendation** - RandomForest classifier on `pakistan_crop_recommendation.csv`
  (real 22-crop dataset; soil NPK + climate -> crop).
- **Yield** - RandomForest regressor on `pakistan_yield_real.csv` (real FAO/OWID yields,
  13 crops, 1961-2024). Inputs `(crop, year)`; no estimated features, no projections.
- **Rotation** - rules lookup on `pakistan_crop_rotation_rules.csv` (22 crops, curated agronomy).

## Setup (Windows PowerShell)

```powershell
# Python 3.11+ (a real interpreter, not the Microsoft Store stub).
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Train the models (produces models/*.joblib + metrics.json)

```powershell
.\.venv\Scripts\python.exe -m training.eval_report
```

## Run the API

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 9271 --reload
# Docs:   http://localhost:9271/docs
# Health: http://localhost:9271/health
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/health` | status + crop counts |
| GET  | `/api/crops` | all crops + availability flags |
| GET  | `/api/feature-ranges` | per-feature min/max for form hints |
| GET  | `/api/metrics` | training metrics |
| POST | `/api/recommend` | top-N crop recommendations |
| POST | `/api/yield` | predicted yield (graceful 200 if crop unsupported) |
| GET  | `/api/yield/history/{crop}` | historical yield series |
| GET  | `/api/rotation/{crop}` | rotation plan (404 if unknown) |

## Tests

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest
```

## Notes / honesty

- **Real data only** - no synthetic or projected rows. Recommendation accuracy is high
  because the real dataset's classes are well separated; validate against local soil tests.
- Recommendation (22 crops) and yield (13 crops) barely overlap - that is the true shape
  of the available real data. Cotton is recommendation-only (no public yield series).
- A crop without yield data returns `available: false` (HTTP 200), never an error.
