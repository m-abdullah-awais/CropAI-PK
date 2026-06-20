# Pakistan Crop AI — Backend

FastAPI + scikit-learn service for three capabilities:

- **Recommendation** — RandomForest classifier on `pakistan_crop_recommendation.csv` (15 crops).
- **Yield** — RandomForest regressor on `pakistan_crop_yield.csv` (7 crops). Trained with a
  **group split by `(crop, year)`** to prevent target leakage from the repeated monthly rows.
- **Rotation** — rules lookup on `pakistan_crop_rotation_rules.csv` (15 crops).

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
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8077 --reload
# Docs:   http://localhost:8077/docs
# Health: http://localhost:8077/health
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

- The recommendation dataset is reference-grounded **synthetic** data, so accuracy is
  high by construction and does not prove field validity.
- Yield covers only 7 crops (no cotton/sugarcane); unsupported crops return
  `available: false` (HTTP 200), never an error.
