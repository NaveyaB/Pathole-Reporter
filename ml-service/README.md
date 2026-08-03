# Road Damage Detection (FastAPI + YOLOv8)

REST microservice that runs real YOLOv8 inference to detect potholes,
cracks and other road damage. It backs the `/api/ai/analyze` endpoint of
the Node API server.

## Model

`models/best.pt` is a YOLOv8s model fine-tuned on the Road Damage Dataset
(RDD2022, Japan/India/Czech), published under Apache-2.0 at
https://huggingface.co/vinothvikas1987/pothole-detection-yolov8

Detected classes are mapped to the platform's damage types:

| Model class           | Platform type    |
| --------------------- | ---------------- |
| Longitudinal Crack    | `crack`          |
| Transverse Crack      | `crack`          |
| Alligator Crack       | `crack`          |
| Pothole               | `pothole`        |
| Other                 | `surface_damage` |

Severity is scored deterministically from the real detections (largest
damaged area relative to the image, detection count, structural damage).

## Setup

Requires Python 3.10+.

```bash
# 1. Create a virtual environment
py -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download the model weights (~67 MB)
py scripts/download_model.py

# 4. Run the service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check: `GET http://localhost:8000/health`
Prediction:   `POST http://localhost:8000/predict` with a multipart `image` field.

## Configuration (environment variables)

| Variable         | Default                    | Description                          |
| ---------------- | -------------------------- | ------------------------------------ |
| `RD_MODEL_PATH`  | `models/best.pt`           | Path to the YOLOv8 weights file      |
| `RD_CONF_THRESHOLD` | `0.25`                   | Detection confidence threshold       |
| `RD_IMGSZ`       | `640`                      | Inference input size                 |
| `RD_MAX_IMAGE_BYTES` | `12582912` (12 MB)     | Maximum accepted upload size         |
