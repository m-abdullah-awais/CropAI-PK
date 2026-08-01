# Contributing to CropAI PK

Thanks for your interest in improving CropAI PK. This guide covers how to set the
project up, run it, and submit changes. For the full architecture, read
[README.md](README.md) and `CLAUDE.md`.

## Ground rules (please read first)

These are hard rules for this project. A pull request that breaks them will be asked
to change before it can be merged.

- **Real data only.** Never add synthetic, generated, or projected rows to any dataset
  in `data/`. If a crop or year has no real data, it stays unavailable. Predicting a
  value at runtime is fine; fabricating dataset rows is not.
- **No em-dashes or en-dashes anywhere.** Use a plain hyphen `-` in code, strings, and
  docs.
- **Forms are controlled.** Use `useState` + `value`/`onChange`, validated with zod on
  submit. Do not use react-hook-form uncontrolled `register` here (it caused a
  stale-value bug in this Next 16 / React 19 stack).
- **Keep the crop sets in sync.** The canonical crop registry lives in
  `backend/app/crops.py` and is mirrored in `frontend/lib/crops.ts`. Change both
  together, plus the test counts.

## Prerequisites

- Node.js 18+ (pnpm is installed locally in the project, not globally)
- Python 3.11+ (a real interpreter, not the Windows Store stub)

## Setup

This project uses pnpm installed locally inside the project folder. Bootstrap it once
with npm, then run pnpm through npx.

```bash
# from the repo root
npm install pnpm --save-dev          # local pnpm, added to devDependencies
npx pnpm install
npx pnpm -C frontend install

# backend (Windows PowerShell)
py -3.14 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
```

## Running the app

```bash
npx pnpm dev        # runs frontend and backend together
```

- Frontend: http://localhost:4319
- Backend API + docs: http://localhost:9271/docs

Retrain the models after changing data or training code:

```bash
# from backend/
backend/.venv/Scripts/python.exe -m training.eval_report
```

## Before you open a pull request

Run these and make sure they pass:

```bash
npx pnpm -C frontend lint                          # frontend lint
npx pnpm -C frontend build                         # production build (also type-checks)
backend/.venv/Scripts/python.exe -m pytest         # backend tests, from backend/
```

Also confirm:

- No em-dashes or en-dashes were introduced.
- Any new UI string was added to all three language dictionaries in
  `frontend/lib/i18n/translations.ts` (en / ur / hi).
- If you touched the crop sets, backend and frontend still match.

## Pull request flow

1. Fork the repository and create a branch from `main`
   (`git checkout -b feature/short-description`).
2. Make your change, keeping commits focused and messages clear.
3. Run the checks above.
4. Open a pull request describing what changed and why. Link any related issue.

## Reporting bugs and ideas

Open a GitHub issue with clear steps to reproduce (for bugs) or the problem you want to
solve (for ideas). For security issues, do not open a public issue - see
[SECURITY.md](SECURITY.md).

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
