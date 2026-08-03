"""FastAPI microservice for YOLOv8 road-damage detection."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from . import model
from .config import CONF_THRESHOLD, IMGSZ, MAX_IMAGE_BYTES


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Warm up the model so the first request is fast."""
    try:
        model._load_model()
        print(f"[ml] Model ready: {model.model_info()['model']}")
    except Exception as exc:  # noqa: BLE001
        print(f"[ml] Model not loaded at startup: {exc}")
    yield


app = FastAPI(
    title="Smart Pothole Reporter - Road Damage Detection",
    description="YOLOv8 inference API for detecting potholes, cracks and other road damage.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    try:
        info = model.model_info()
        return {
            "status": "ok",
            "provider": "yolov8",
            "model": info["model"],
            "classes": info["classes"],
            "weights": info["weights"],
            "confidence_threshold": CONF_THRESHOLD,
            "imgsz": IMGSZ,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "status": "degraded",
            "provider": "yolov8",
            "error": str(exc),
        }


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large")
    try:
        return model.predict(data)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc
