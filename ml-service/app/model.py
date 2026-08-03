"""YOLOv8 road-damage inference wrapper and severity scoring.

The weights are a YOLOv8s model fine-tuned on the Road Damage Dataset
(RDD2022, Japan/India/Czech), published under the Apache-2.0 license at
https://huggingface.co/vinothvikas1987/pothole-detection-yolov8.

Model classes
-------------
0: Longitudinal Crack -> ``crack``
1: Transverse Crack   -> ``crack``
2: Alligator Crack    -> ``crack``
3: Pothole            -> ``pothole``
4: Other              -> ``surface_damage``
"""

from __future__ import annotations

import threading
import time
from datetime import datetime, timezone
from io import BytesIO

import numpy as np
from PIL import Image

from .config import CONF_THRESHOLD, IMGSZ, MODEL_PATH

MODEL_NAME = "yolov8s-rdd2022-v1"

# class_id -> (system damage type, human-readable label)
CLASS_MAP = {
    0: ("crack", "longitudinal crack"),
    1: ("crack", "transverse crack"),
    2: ("crack", "alligator crack"),
    3: ("pothole", "pothole"),
    4: ("surface_damage", "surface damage"),
}

SEVERITY_ORDER = ["low", "medium", "high", "critical"]

SEVERITY_RECOMMENDATIONS = {
    "low": "Schedule routine inspection. Low-priority patching recommended within 30 days.",
    "medium": "Plan repair within the next 2 weeks. Monitor drainage to prevent expansion.",
    "high": "Immediate repair required. Potential risk to vehicles and two-wheelers.",
    "critical": "Urgent intervention required. Isolate area with signage and repair within 24 hours.",
}

_model = None
_model_lock = threading.Lock()


def _load_model():
    """Load the YOLOv8 model lazily (thread-safe, cached)."""
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        from ultralytics import YOLO

        if not MODEL_PATH.exists():
            raise RuntimeError(
                f"Model weights not found at {MODEL_PATH}. "
                "Run `py scripts/download_model.py` or set RD_MODEL_PATH."
            )
        _model = YOLO(str(MODEL_PATH))
    return _model


def _class_names():
    names = _load_model().names
    if isinstance(names, dict):
        return [names[k] for k in sorted(names)]
    return list(names)


def model_info() -> dict:
    """Metadata about the loaded model."""
    return {
        "model": MODEL_NAME,
        "task": "detect",
        "classes": _class_names(),
        "weights": str(MODEL_PATH),
        "confidence_threshold": CONF_THRESHOLD,
        "imgsz": IMGSZ,
    }


def _severity_index(detections: list[dict], image_area: int) -> int:
    """Deterministic severity scoring derived purely from detections.

    Uses the largest damaged area relative to the image, the number of
    detections, and the presence of structural damage types (potholes).
    Returns an index into ``SEVERITY_ORDER`` (1-4).
    """
    if not detections:
        return 1
    max_area = max(d["area_ratio"] for d in detections)
    count = len(detections)
    types = {d["class"] for d in detections}

    if max_area >= 0.10:
        base = 4
    elif max_area >= 0.04:
        base = 3
    elif max_area >= 0.015:
        base = 2
    else:
        base = 1

    if count >= 6:
        base = min(base + 2, 4)
    elif count >= 3:
        base = min(base + 1, 4)

    if "pothole" in types:
        base = min(base + 1, 4)

    return max(1, min(base, 4))


def _build_tags(detections: list[dict], severity: str) -> list[str]:
    tags = {d["label"] for d in detections}
    tags.add(severity if severity in ("high", "critical") else "maintenance")
    tags.add("single-detection" if len(detections) == 1 else f"{len(detections)}-detections")
    return sorted(tags)


def _decode_image(data: bytes) -> np.ndarray:
    """Decode raw image bytes into an RGB numpy array for YOLO inference."""
    try:
        return np.asarray(Image.open(BytesIO(data)).convert("RGB"))
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Uploaded file is not a valid image") from exc


def predict(image_bytes: bytes) -> dict:
    """Run YOLOv8 inference and produce a structured analysis."""
    model = _load_model()
    started = time.perf_counter()
    results = model.predict(
        source=_decode_image(image_bytes),
        conf=CONF_THRESHOLD,
        imgsz=IMGSZ,
        verbose=False,
    )
    result = results[0]

    img_h, img_w = result.orig_shape
    image_area = max(1, img_w * img_h)

    detections: list[dict] = []
    boxes = result.boxes
    if boxes is not None and len(boxes) > 0:
        for cls_id, conf, box in zip(
            boxes.cls.tolist(), boxes.conf.tolist(), boxes.xyxy.tolist()
        ):
            damage_type, label = CLASS_MAP.get(int(cls_id), ("other", f"class-{int(cls_id)}"))
            x1, y1, x2, y2 = box
            area_ratio = max(0.0, (x2 - x1) * (y2 - y1)) / image_area
            detections.append(
                {
                    "class": damage_type,
                    "label": label,
                    "class_id": int(cls_id),
                    "confidence": round(float(conf), 4),
                    "bbox": [round(float(v), 1) for v in box],
                    "area_ratio": round(float(area_ratio), 6),
                }
            )
        detections.sort(key=lambda d: d["confidence"], reverse=True)

    is_road_image = len(detections) > 0
    if not detections:
        detected = "other"
        severity = "low"
        confidence = 0.0
        tags = ["no-road-damage-detected"]
        recommendation = (
            "No road damage was detected in the image. "
            "The report may not qualify for repair without visible damage."
        )
    else:
        detected = detections[0]["class"]
        severity = SEVERITY_ORDER[_severity_index(detections, image_area) - 1]
        confidence = round(max(d["confidence"] for d in detections) * 100, 1)
        tags = _build_tags(detections, severity)
        recommendation = SEVERITY_RECOMMENDATIONS[severity]

    return {
        "detected": detected,
        "severity": severity,
        "confidence": confidence,
        "recommendation": recommendation,
        "is_road_image": is_road_image,
        "tags": tags,
        "model": MODEL_NAME,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "detections": detections,
        "inference_ms": round((time.perf_counter() - started) * 1000, 1),
    }
