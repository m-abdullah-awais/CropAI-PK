"""Train both models and write a combined models/metrics.json.

Run from backend/:  python -m training.eval_report
"""

from __future__ import annotations

from training._metrics import merge_metrics
from training.train_recommendation import train as train_reco
from training.train_yield import train as train_yield


def main() -> None:
    print("Training recommendation classifier...")
    reco = train_reco()
    merge_metrics("recommendation", reco)
    print(
        f"  accuracy={reco['accuracy']} macro_f1={reco['macro_f1']} "
        f"top3={reco['top3_accuracy']}"
    )

    print("Training yield regressor (group split)...")
    yld = train_yield()
    merge_metrics("yield", yld)
    print(f"  r2={yld['r2']} rmse={yld['rmse_hg_ha']} hg/ha")

    print("\nDone. Artifacts + metrics written to models/.")


if __name__ == "__main__":
    main()
