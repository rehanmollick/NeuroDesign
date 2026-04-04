# NeuroDesign

**Neuroscience-backed A/B testing for designers.** Upload two images, see how the human brain responds to each one, get AI-powered recommendations.

[Live Demo](https://frontend-gamma-ten-23.vercel.app)

## What It Does

NeuroDesign predicts fMRI brain activation for any image using Meta's TRIBE v2 model, then visualizes the results as interactive 3D brain heatmaps. Compare two designs side by side and see which one triggers more emotional response, visual attention, or memory retention.

- **3D Brain Heatmaps**: ~20,000 vertex cortical mesh with per-vertex activation coloring
- **Region Analysis**: Aggregated by brain region (fusiform, prefrontal, amygdala, V1, etc.)
- **AI Explanations**: Gemma 4 explains the neuroscience in plain English
- **Interactive Chat**: Ask follow-up questions about your comparison
- **Instant Presets**: Four precomputed comparisons load immediately

## How It Works

```
Upload 2 images
    |
    v
Convert to 1s silent video (TRIBE v2 expects video input)
    |
    v
Run Meta TRIBE v2 on T4 GPU (~60s per image)
    |
    v
Get 20,484 cortical activation predictions per image
    |
    v
Aggregate into named brain regions (Destrieux atlas, 74 regions)
    |
    v
Jointly normalize across both images
    |
    v
Render as 3D brain heatmaps + send to Gemma 4 for analysis
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| 3D Brain | React Three Fiber, Three.js, fsaverage5 mesh |
| Backend | FastAPI, Python 3.11 |
| GPU Inference | Modal (T4 GPU) |
| Brain Model | Meta TRIBE v2 |
| AI Analysis | Google Gemma 4 (31B) via Google AI Studio API |
| Brain Atlas | nilearn Destrieux atlas |
| Deploy | Vercel (frontend), Modal (backend) |

## Architecture

```
Vercel (Next.js SSG)
    |
    | POST /compare (2 images)
    v
Modal (T4 GPU)
    |
    +-- inference.py: image -> video -> TRIBE v2 -> activations
    +-- regions.py: activations -> named brain regions
    +-- gemma.py: regions -> AI explanation + chat
    |
    v
JSON response -> 3D brain render + analysis UI
```

## Run Locally

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # add your Modal API URL
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
modal deploy app.py
```

Requires a [Modal](https://modal.com) account and a [Google AI Studio](https://aistudio.google.com/apikey) API key.

## Project Structure

```
frontend/
  src/
    app/           # Next.js app router (page.tsx, layout.tsx, globals.css)
    components/    # BrainViewer, UploadZone, ChatAdvisor, AnalysisCards, etc.
    lib/           # types.ts, api.ts, colors.ts
  public/data/     # mesh.json, precomputed comparisons

backend/
  app.py           # FastAPI + Modal GPU function
  inference.py     # Image -> TRIBE v2 prediction pipeline
  regions.py       # Destrieux atlas region aggregation
  gemma.py         # Gemma 4 API (explain, detailed analysis, chat)
```

## The Science

TRIBE v2 (Meta, 2024) is a vision model trained on real fMRI data. Given visual input, it predicts the blood-oxygen-level-dependent (BOLD) response at each point on the cortical surface. The output maps to the fsaverage5 standard mesh used in neuroscience research.

We aggregate the raw ~20,000 vertex predictions into named brain regions using the Destrieux atlas from nilearn. Each region maps to a cognitive function:

- **Fusiform face area**: Face and identity processing
- **V1/V2**: Low-level visual feature processing
- **Intraparietal sulcus**: Spatial attention
- **Orbitofrontal cortex**: Reward and value assessment
- **Amygdala**: Emotional response
- **Hippocampal regions**: Memory encoding

More activation is not always better. A cluttered image activates many regions due to cognitive overload. A clean, well-designed image activates fewer regions but the right ones (reward, focused attention, face processing). NeuroDesign interprets this correctly.

## License

MIT
