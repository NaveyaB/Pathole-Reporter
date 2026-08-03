"""Runtime configuration for the road-damage detection service."""

from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = Path(os.getenv("RD_MODEL_PATH", str(BASE_DIR / "models" / "best.pt")))
CONF_THRESHOLD = float(os.getenv("RD_CONF_THRESHOLD", "0.25"))
IMGSZ = int(os.getenv("RD_IMGSZ", "640"))
MAX_IMAGE_BYTES = int(os.getenv("RD_MAX_IMAGE_BYTES", str(12 * 1024 * 1024)))
