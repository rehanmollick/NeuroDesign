# Human TODOs — Things That Need You

---

## 1. TRIBE v2 Colab Test (BLOCKER — do this first)

**Status: IN PROGRESS**

You're running this now. Here's exactly what to do in the notebook after the setup cells:

**Step 1:** Make sure runtime is T4 GPU — Runtime → Change runtime type → T4 GPU.

**Step 2:** Run all cells up to and including the one that loads the model (looks like `model = ...`).

**Step 3:** Upload two very different test images using the Colab file browser (folder icon on left sidebar → upload). Suggested: a face photo + a landscape photo.

**Step 4:** Add a new cell at the bottom:

```python
from moviepy.editor import ImageClip
from PIL import Image
import numpy as np

def img_to_mp4(img_path, out_path):
    img = Image.open(img_path).convert("RGB")
    clip = ImageClip(np.array(img), duration=1)
    clip.write_videofile(out_path, fps=1, audio=False, verbose=False, logger=None)

img_to_mp4("/content/face.jpg", "/tmp/face.mp4")
img_to_mp4("/content/landscape.jpg", "/tmp/landscape.mp4")
print("Videos created")
```

**Step 5:** Add another new cell:

```python
preds_a = model.predict(video_path="/tmp/face.mp4")
print("Shape:", preds_a.shape)   # should be (1, 20484)

preds_b = model.predict(video_path="/tmp/landscape.mp4")

a = preds_a[0]
b = preds_b[0]
correlation = np.corrcoef(a, b)[0, 1]
print(f"Correlation: {correlation:.3f}")
print("PASS" if correlation < 0.95 else "FAIL — images look identical to model")
```

**Tell Claude:** the shape, the correlation number, and any error messages.

- Correlation < 0.95 = live inference works, proceed
- Correlation > 0.95 = Claude switches to precomputed-only mode (still a great demo)

---

## 2. Mesh Export

**Status: DONE — Claude ran this automatically.**

The real 20,484-vertex brain mesh is at `frontend/public/data/mesh.json` (2.2 MB, 74 Destrieux brain regions).

---

## 3. Get API Keys

### Google AI Studio (Gemma — for plain-English explanations)

1. Go to `aistudio.google.com/apikey`
2. Click "Create API key" (free, no credit card)
3. Copy the key — you'll add it to Modal secrets in step 4

### Modal (GPU inference hosting)

1. Go to `modal.com` → sign up (free tier, includes some T4 GPU hours)
2. In your terminal: `pip install modal && modal token new`
   - This opens a browser window to authenticate — click "Allow"
3. Verify you're logged in: `modal profile current`

---

## 4. Set Up Modal Secrets

The backend needs your Google AI key at runtime. Instead of `.env` files, Modal uses "secrets":

```bash
# Create the secret (run once, stores it in Modal's cloud)
modal secret create neurodesign-secrets GOOGLE_AI_KEY=your-key-here
```

Replace `your-key-here` with the key from step 3. You can verify it's saved at `modal.com/secrets`.

---

## 5. Precompute the 4 Showcase Comparisons

**Do this AFTER the Colab test passes (step 1).**

You need 4 image pairs. Screenshot or download these:

| Pair | Image A | Image B |
|------|---------|---------|
| apple-vs-cluttered | Apple.com homepage screenshot | A cluttered competitor homepage |
| face-vs-noface | Portrait photo with a face | Same photo with face blurred/removed |
| text-heavy-vs-infographic | Text-heavy slide | Well-designed infographic on same topic |
| clean-vs-ai-cluttered | Clean landing page | AI-slop generated landing page |

Save them in an `images/` folder in the repo root, then run:

```bash
# Set up backend deps first (only needed once)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install moviepy==1.0.3 pillow numpy nilearn nibabel

# Precompute each pair (run from repo root)
python scripts/precompute.py \
  --imageA images/apple.png \
  --imageB images/cluttered.png \
  --output frontend/public/data/comparisons/apple-vs-cluttered.json \
  --name-a "Apple.com" --name-b "Cluttered Site"

python scripts/precompute.py \
  --imageA images/face.jpg \
  --imageB images/noface.jpg \
  --output frontend/public/data/comparisons/face-vs-noface.json \
  --name-a "With Face" --name-b "Without Face"

python scripts/precompute.py \
  --imageA images/text-slide.png \
  --imageB images/infographic.png \
  --output frontend/public/data/comparisons/text-heavy-vs-infographic.json \
  --name-a "Text Slide" --name-b "Infographic"

python scripts/precompute.py \
  --imageA images/clean-landing.png \
  --imageB images/ai-cluttered.png \
  --output frontend/public/data/comparisons/clean-vs-ai-cluttered.json \
  --name-a "Clean Design" --name-b "AI Clutter"
```

Note: `precompute.py` uses TRIBE v2 locally — needs the same GPU or run it in Colab. See the Colab notebook for how to run inference. Alternatively, you can run inference in Colab and manually copy the output JSONs.

---

## 6. Deploy Backend (Modal)

**After steps 3-5 are done:**

```bash
cd backend
modal deploy app.py
```

This will:
- Build the Docker image with TRIBE v2 installed (~5-10 min first time)
- Deploy to Modal's cloud with T4 GPU
- Print the endpoint URL, e.g. `https://rehanmollick--neurodesign-fastapi-app.modal.run`

Copy that URL.

---

## 7. Set Frontend Environment Variable

Create `frontend/.env.local` (never committed to git):

```
NEXT_PUBLIC_API_URL=https://your-modal-endpoint.modal.run
```

Replace with the URL from step 6.

---

## 8. Deploy Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

- First time: Vercel will ask you to log in via browser
- It will ask project name, directory (hit enter for defaults)
- After deploy, go to `vercel.com` → your project → Settings → Environment Variables
- Add `NEXT_PUBLIC_API_URL` with the Modal endpoint URL
- Redeploy once to pick up the env var

---

## Priority Order

1. **Colab test** — running now (tells you if live inference is viable)
2. **API keys + Modal setup** — do while Colab runs (steps 3-4)
3. **Precompute 4 image pairs** — after Colab passes, gives demo real data
4. **Modal deploy** — step 6, after precompute
5. **Vercel deploy** — last step, frontend goes live

Mesh export is already done. You only need steps 1, 3, 4, 5, 6, 7, 8.
