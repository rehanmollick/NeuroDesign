"""
NeuroDesign backend — FastAPI on Modal with T4 GPU.
POST /compare: accepts two images, returns ComparisonResult JSON.
"""

import os
import io
import sys
import json
import numpy as np
from pathlib import Path

import modal

# Modal image with all deps
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev")
    .pip_install(
        "fastapi[standard]",
        "python-multipart",
        "pillow",
        "numpy",
        "moviepy==1.0.3",
        "nilearn",
        "nibabel",
    )
    .run_commands(
        "pip install git+https://github.com/facebookresearch/tribev2.git"
    )
)

app = modal.App("neurodesign", image=image)

# Mount backend source files into the container at /app
# and mesh.json at /data/mesh.json
backend_mount = modal.Mount.from_local_dir(
    local_path=".",
    remote_path="/app",
    condition=lambda p: p.endswith(".py"),
)

mesh_mount = modal.Mount.from_local_file(
    local_path="../frontend/public/data/mesh.json",
    remote_path="/data/mesh.json",
)


@app.function(
    gpu="T4",
    keep_warm=1,  # keep one container warm — verify Modal pricing before deploy
    timeout=120,
    secrets=[modal.Secret.from_name("neurodesign-secrets")],
    mounts=[backend_mount, mesh_mount],
)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from PIL import Image

    # Make /app importable
    if "/app" not in sys.path:
        sys.path.insert(0, "/app")

    from inference import predict, normalize_joint
    from regions import load_region_map, aggregate_regions
    from gemma import explain

    api = FastAPI()

    api.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )

    # Load model and region map once at container startup
    try:
        import tribev2
        model = tribev2.TRIBEModel.from_pretrained("facebook/tribe-v2")
        model.eval()
        print("TRIBE v2 loaded")
    except Exception as e:
        print(f"TRIBE v2 load error: {e}")
        model = None

    try:
        region_map = load_region_map("/data/mesh.json")
        print(f"Region map loaded: {len(region_map)} regions")
    except Exception as e:
        print(f"Region map load error: {e}")
        region_map = {}

    @api.post("/compare")
    async def compare(
        imageA: UploadFile = File(...),
        imageB: UploadFile = File(...),
    ):
        if model is None:
            raise HTTPException(status_code=503, detail="Model not loaded")

        try:
            img_a = Image.open(io.BytesIO(await imageA.read())).convert("RGB")
            img_b = Image.open(io.BytesIO(await imageB.read())).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image files")

        try:
            raw_a = predict(img_a, model)
            raw_b = predict(img_b, model)
        except Exception as e:
            print(f"Inference error: {e}")
            raise HTTPException(status_code=500, detail="Inference failed")

        norm_a, norm_b = normalize_joint(raw_a, raw_b)

        activations = np.stack([norm_a, norm_b], axis=0)
        regions = aggregate_regions(activations, region_map)

        summary = explain(regions)

        return {
            "imageA": {"url": "", "name": imageA.filename or "Image A"},
            "imageB": {"url": "", "name": imageB.filename or "Image B"},
            "activations": {
                "imageA": norm_a.tolist(),
                "imageB": norm_b.tolist(),
            },
            "regions": regions,
            "summary": summary,
        }

    @api.get("/health")
    async def health():
        return {"status": "ok", "model_loaded": model is not None}

    return api
