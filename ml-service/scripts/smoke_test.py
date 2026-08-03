import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import model  # noqa: E402

image_path = Path(sys.argv[1] if len(sys.argv) > 1 else "sample.jpg")
data = image_path.read_bytes()
result = model.predict(data)
print(json.dumps(result, indent=2))
