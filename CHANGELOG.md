# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project meta files: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  and `SECURITY.md`.

### Changed

- README: rewrote the yield section to describe the new nutrient/weather estimate,
  updated the tech stack and the models-and-datasets summary, and refreshed the yield
  screenshot.

## [1.0.0] - 2026-08-01

First public version. A Pakistan crop-AI web app with three tools, three languages, a
light and dark theme, built entirely on real, public agricultural data.

### Added

- **Crop recommendation** - a scaled K-Nearest-Neighbours classifier over 7 real soil
  and climate features, ranking the best crops for a field with confidence scores
  (21 crops).
- **Yield prediction** - a nutrient/weather-based agronomy response model. It scales a
  crop's real recent Pakistan yield (the attainable yield) by how well the field's soil
  and climate match the crop's real optimum, reports the most-limiting factor, and draws
  a what-if curve for each nutrient. A real yield-history chart (1961 to 2024) is shown
  alongside as context. Yield-only crops without soil-nutrient data show history only.
- **Rotation planning** - projects the soil forward by the current crop's real nutrient
  effect, scores each candidate against that projected soil, and blends in agronomy
  rules (avoid the same plant family, favour a legume after a heavy feeder).
- **Live weather autofill** from Open-Meteo (free, keyless), proxied server-side.
- **Internationalization** in English, Urdu (right to left), and Hindi.
- **Docker deployment** (Caddy edge proxy, Next.js frontend, FastAPI backend with
  models trained during the image build).

### Data

- Four real, public datasets: `pakistan_crop_recommendation.csv`,
  `pakistan_yield_real.csv`, `pakistan_crop_rotation_rules.csv`, and
  `pakistan_crop_nutrient_effects.csv`. Sources include the public crop-recommendation
  dataset, FAOSTAT, and Our World in Data. No synthetic or fabricated rows.

[Unreleased]: https://github.com/m-abdullah-awais/CropAI-PK/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/m-abdullah-awais/CropAI-PK/releases/tag/v1.0.0
