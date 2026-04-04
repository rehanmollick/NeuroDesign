"""
Image → TRIBE v2 prediction pipeline.
Converts a PIL image to a short MP4 via cv2, runs TRIBE v2, returns activations.
Using cv2 because moviepy has version conflicts with tribev2.
"""

import os
import tempfile
import numpy as np
from PIL import Image


def image_to_video(img: Image.Image, output_path: str) -> None:
    """Convert a PIL image to a short MP4 via cv2."""
    import cv2

    # Resize to max 512px on longest side — TRIBE v2 doesn't need full-res
    img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > 512:
        scale = 512 / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # cv2 expects BGR
    frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, 3, (frame.shape[1], frame.shape[0]))

    # Write 3 identical frames (1 second at 3fps — matches observed output shape)
    for _ in range(3):
        out.write(frame)
    out.release()


def predict(img: Image.Image, model) -> np.ndarray:
    """
    Run TRIBE v2 on an image. Returns activation array of shape (20484,).
    """
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        image_to_video(img, tmp_path)
        # Two-step API: get events dataframe, then predict
        df = model.get_events_dataframe(video_path=tmp_path)
        preds, _ = model.predict(events=df)
        # preds shape: (n_timesteps, 20484) — take first frame
        return preds[0]
    finally:
        os.unlink(tmp_path)


def normalize_joint(act_a: np.ndarray, act_b: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Joint min-max normalization across both images.
    Ensures heatmap colors are directly comparable.
    """
    global_min = min(act_a.min(), act_b.min())
    global_max = max(act_a.max(), act_b.max())

    if global_max - global_min < 1e-8:
        # Avoid division by zero (identical activations)
        return np.zeros_like(act_a), np.zeros_like(act_b)

    norm_a = (act_a - global_min) / (global_max - global_min)
    norm_b = (act_b - global_min) / (global_max - global_min)
    return norm_a, norm_b
