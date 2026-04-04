"""
NeuroDesign backend — FastAPI on Modal with T4 GPU.
POST /compare: accepts two images, returns ComparisonResult JSON.
"""

import modal

# Modal image with all deps + local source files baked in
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git", "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev")
    .pip_install(
        "fastapi[standard]",
        "python-multipart",
        "pillow",
        "numpy",
        "opencv-python-headless",
        "nilearn",
        "nibabel",
    )
    .run_commands(
        "pip install git+https://github.com/facebookresearch/tribev2.git"
    )
    # Bake backend source files into image at /app
    .add_local_file("inference.py", "/app/inference.py")
    .add_local_file("regions.py", "/app/regions.py")
    .add_local_file("gemma.py", "/app/gemma.py")
    # Bake mesh.json (needed for region map)
    .add_local_file("../frontend/public/data/mesh.json", "/data/mesh.json")
)

app = modal.App("neurodesign", image=image)


@app.function(
    gpu="T4",
    min_containers=1,
    timeout=300,
    secrets=[modal.Secret.from_name("neurodesign-secrets")],
)
@modal.asgi_app()
def fastapi_app():
    import os
    import io
    import sys
    import asyncio
    import numpy as np
    from concurrent.futures import ThreadPoolExecutor
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from PIL import Image

    executor = ThreadPoolExecutor(max_workers=4)

    if "/app" not in sys.path:
        sys.path.insert(0, "/app")

    from inference import predict, normalize_joint
    from regions import load_region_map, aggregate_regions
    from gemma import explain, explain_detailed, chat as gemma_chat

    api = FastAPI()

    api.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )

    try:
        from tribev2 import TribeModel
        model = TribeModel.from_pretrained("facebook/tribev2")
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

        # Run both Gemma calls in parallel
        loop = asyncio.get_event_loop()
        summary_fut = loop.run_in_executor(executor, explain, regions)
        detailed_fut = loop.run_in_executor(executor, explain_detailed, regions)
        summary, detailed = await asyncio.gather(summary_fut, detailed_fut)

        return {
            "imageA": {"url": "", "name": imageA.filename or "Image A"},
            "imageB": {"url": "", "name": imageB.filename or "Image B"},
            "activations": {
                "imageA": norm_a.tolist(),
                "imageB": norm_b.tolist(),
            },
            "regions": regions,
            "summary": summary,
            "detailed": detailed,
        }

    @api.post("/chat")
    async def chat_endpoint(body: dict):
        regions = body.get("regions", [])
        summary = body.get("summary", "")
        message = body.get("message", "")
        history = body.get("history", [])
        detailed = body.get("detailed", {})

        if not message:
            raise HTTPException(status_code=400, detail="Message required")

        response = gemma_chat(regions, summary, message, history, detailed)
        if not response:
            raise HTTPException(status_code=503, detail="Chat unavailable")

        return {"response": response}

    @api.get("/health")
    async def health():
        return {"status": "ok", "model_loaded": model is not None}

    return api
