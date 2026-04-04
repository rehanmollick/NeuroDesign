"""
Image → TRIBE v2 prediction pipeline.
Converts a PIL image to a 1-second silent MP4, runs TRIBE v2, returns activations.
"""

import os
import tempfile
import numpy as np
from PIL import Image


def image_to_video(img: Image.Image, output_path: str) -> None:
    """Convert a PIL image to a 1-second silent MP4 via moviepy."""
    from moviepy.editor import ImageClip

    arr = np.array(img.convert("RGB"))
    clip = ImageClip(arr, duration=1)
    clip.write_videofile(
        output_path,
        fps=1,
        audio=False,
        verbose=False,
        logger=None,
    )


def predict(img: Image.Image, model) -> np.ndarray:
    """
    Run TRIBE v2 on an image. Returns activation array of shape (20484,).
    """
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        image_to_video(img, tmp_path)
        preds = model.predict(video_path=tmp_path)
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
