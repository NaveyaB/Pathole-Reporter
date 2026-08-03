import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ultralytics import YOLO  # noqa: E402

model_path = Path(__file__).resolve().parent.parent / "models" / "best.pt"
model = YOLO(str(model_path))
print("names:", model.names)
print("task:", model.task)

img = Path(sys.argv[1] if len(sys.argv) > 1 else "sample.jpg")
results = model.predict(source=str(img), conf=0.1, imgsz=640, verbose=False)
r = results[0]
print("orig_shape:", r.orig_shape)
print("n boxes:", len(r.boxes) if r.boxes is not None else 0)
if r.boxes is not None and len(r.boxes) > 0:
    print("cls:", r.boxes.cls.tolist())
    print("conf:", r.boxes.conf.tolist())
    print("xyxy:", r.boxes.xyxy.tolist())
