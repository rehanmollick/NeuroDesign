# Human TODOs — Things Claude Can't Do For You

These require a GPU, API keys, or physical access to external services.
Do these in parallel while Claude builds the backend.

---

## 1. TRIBE v2 Colab Test (BLOCKER — do this first)

**What:** Verify that image → silent video → TRIBE v2 works and produces meaningful predictions.

**Steps:**
1. Open: https://colab.research.google.com/github/facebookresearch/tribev2/blob/main/tribe_demo.ipynb
2. Run the setup cells to install TRIBE v2 and its deps
3. Add a new cell and run this test:

```python
from moviepy.editor import ImageClip
from PIL import Image
import numpy as np

# Convert a JPEG to 1-second silent MP4
img = Image.open("your_test_image.jpg")
clip = ImageClip(np.array(img), duration=1)
clip.write_videofile("/tmp/test.mp4", fps=1, audio=False, verbose=False)

# Run TRIBE v2 on it
preds = model.predict(video_path="/tmp/test.mp4")
print("Shape:", preds.shape)   # should be (1, 20484)
print("Min:", preds.min(), "Max:", preds.max())
```

4. **Quality gate:** Run on two different images (e.g., a face photo vs a landscape photo):

```python
preds_a = model.predict(video_path="/tmp/face.mp4")[0]
preds_b = model.predict(video_path="/tmp/landscape.mp4")[0]
correlation = np.corrcoef(preds_a, preds_b)[0, 1]
print("Correlation:", correlation)
# If > 0.95: the approach is not working, images look identical to the model
# If < 0.95: good, proceed with full-stack build
```

**If correlation > 0.95:** Tell Claude. We switch to precomputed-only mode (faster to demo anyway).

---

## 2. Export the Real fsaverage5 Mesh

**What:** Generate `frontend/public/data/mesh.json` with the real ~20k vertex brain mesh.

**Steps:**

```bash
# In the NeuroDesign repo root
pip install nilearn nibabel numpy
python scripts/export_mesh.py
```

This writes `frontend/public/data/mesh.json` (~15-25 MB).
The current file is a fake 1000-vertex placeholder — the brain won't look right until you run this.

**If nilearn can't find Destrieux annotation files:** The regionMap will be empty (brains render fine, but hover-to-region won't work). That's acceptable for the demo.

---

## 3. Get API Keys

### Google AI Studio (for Gemma 4)
1. Go to: https://aistudio.google.com/apikey
2. Create a key (free, no credit card)
3. Add to backend `.env`:
   ```
   GOOGLE_AI_KEY=your-key-here
   ```

### Modal (for GPU inference)
1. Go to: https://modal.com → sign up (free starter tier)
2. Run: `pip install modal && modal token new`
3. Verify Modal pricing for `keep_warm=1` on T4 — see TODOS.md

---

## 4. Precompute the 4 Showcase Comparisons

**What:** Run TRIBE v2 on the 4 image pairs to generate the real precomputed JSONs.
The current JSONs in `public/data/comparisons/` are fake placeholders.

**After the Colab test passes:**
```bash
# In the NeuroDesign repo, after backend is set up:
python scripts/precompute.py \
  --imageA images/apple.png --imageB images/cluttered.png \
  --output frontend/public/data/comparisons/apple-vs-cluttered.json \
  --name-a "Apple.com" --name-b "Cluttered Site"
```

You'll need 4 image pairs. Suggested sources:
- Apple.com vs a cluttered competitor (screenshot both)
- Portrait photo vs same photo with face removed/blurred
- Text-heavy slide vs a well-designed infographic
- A clean landing page vs an AI-slop generated one

---

## 5. Set Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-modal-endpoint.modal.run
```

Create `backend/.env`:
```
GOOGLE_AI_KEY=your-google-ai-studio-key
```

---

## 6. Deploy

**After everything is wired up:**

```bash
# Frontend
cd frontend && npx vercel --prod

# Backend
cd backend && modal deploy app.py
```

Then update `NEXT_PUBLIC_API_URL` in Vercel env vars to point to the Modal endpoint.

---

## Priority Order

1. Colab test (tells you if the whole live-inference path is viable)
2. Mesh export (needed to see a real brain on localhost)
3. Get API keys (needed before backend deploy)
4. Precompute 4 image pairs (needed for demo reliability)
5. Deploy (do this last, Hour 14-16)
