"""Download the road-damage YOLOv8 weights from Hugging Face.

The weights are a YOLOv8s model fine-tuned on the Road Damage Dataset
(RDD2022), published by vinothvikas1987 under the Apache-2.0 license:
https://huggingface.co/vinothvikas1987/pothole-detection-yolov8
"""

from __future__ import annotations

import urllib.request
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_URL = (
    "https://huggingface.co/vinothvikas1987/pothole-detection-yolov8/resolve/main/best.pt"
)
MIN_SIZE_BYTES = 1_000_000


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    dest = MODEL_DIR / "best.pt"
    if dest.exists() and dest.stat().st_size > MIN_SIZE_BYTES:
        print(f"Model already present: {dest} ({dest.stat().st_size / 1e6:.1f} MB)")
        return
    print(f"Downloading {MODEL_URL}")
    print(f"  -> {dest}")
    urllib.request.urlretrieve(MODEL_URL, dest)
    print(f"Downloaded {dest.stat().st_size / 1e6:.1f} MB to {dest}")


if __name__ == "__main__":
    main()
