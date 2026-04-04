"""
Precompute TRIBE v2 comparison for an image pair.
Run in Colab or locally with a GPU.

Usage:
  python scripts/precompute.py \
    --imageA images/apple.png \
    --imageB images/cluttered.png \
    --output frontend/public/data/comparisons/apple-vs-cluttered.json \
    --name-a "Apple.com" \
    --name-b "Cluttered Site"
"""

import argparse
import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--imageA", required=True)
    parser.add_argument("--imageB", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--name-a", default="Image A")
    parser.add_argument("--name-b", default="Image B")
    parser.add_argument("--mesh", default="frontend/public/data/mesh.json")
    args = parser.parse_args()

    import numpy as np
    from PIL import Image

    from inference import predict, normalize_joint
    from regions import load_region_map, aggregate_regions
    from gemma import explain

    # Load model
    print("Loading TRIBE v2...")
    import tribev2
    model = tribev2.TRIBEModel.from_pretrained("facebook/tribe-v2")
    model.eval()

    # Load images
    img_a = Image.open(args.imageA)
    img_b = Image.open(args.imageB)
    print(f"Images: {img_a.size} / {img_b.size}")

    # Run inference
    print("Running inference A...")
    raw_a = predict(img_a, model)
    print("Running inference B...")
    raw_b = predict(img_b, model)

    # Quality check
    import numpy as np
    corr = np.corrcoef(raw_a, raw_b)[0, 1]
    print(f"Correlation between predictions: {corr:.3f}")
    if corr > 0.95:
        print("WARNING: High correlation — images may look too similar to TRIBE v2")

    # Normalize
    norm_a, norm_b = normalize_joint(raw_a, raw_b)

    # Load region map
    mesh_path = Path(args.mesh)
    region_map = load_region_map(str(mesh_path)) if mesh_path.exists() else {}
    if not region_map:
        print("WARNING: No region map found. Regions will be empty.")

    # Aggregate
    activations = np.stack([norm_a, norm_b], axis=0)
    regions = aggregate_regions(activations, region_map)

    # Gemma explanation
    print("Generating explanation...")
    summary = explain(regions)

    result = {
        "imageA": {"url": "", "name": args.name_a},
        "imageB": {"url": "", "name": args.name_b},
        "activations": {
            "imageA": norm_a.tolist(),
            "imageB": norm_b.tolist(),
        },
        "regions": regions,
        "summary": summary,
    }

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(result, f)

    size_mb = out.stat().st_size / 1024 / 1024
    print(f"Written: {out} ({size_mb:.1f} MB)")
    print(f"Regions: {len(regions)}")
    print(f"Summary: {summary[:100]}..." if summary else "Summary: (empty)")


if __name__ == "__main__":
    main()
