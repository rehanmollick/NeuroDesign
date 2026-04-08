# NeuroDesign

> Neuroscience-backed A/B testing for designers. Upload two images, see how the human brain actually responds to each one, and get AI-powered recommendations rooted in real fMRI research.

**[Live Demo →](https://frontend-gamma-ten-23.vercel.app)**

This is the **V2** README (post-hackathon version). For the original hackathon build, see [README-V1.md](./README-V1.md).

---

## Demo status: preset mode

The live demo currently runs in **preset-only mode**. Four hand-picked precomputed comparisons load instantly so anyone can experience the full interface, 3D brain visualization, AI analysis, and chat advisor.

**Custom image uploads (live TRIBE v2 inference) are temporarily disabled** while the GPU backend is offline to control cloud costs. The Modal app was accidentally left with a warm container, which billed 24/7 even with zero traffic, so it's been taken down until there's a sustainable setup in place.

**Want to see how NeuroDesign analyzes your own website, app, or designs?** Reach out and I'll run a custom comparison for you. It takes a few minutes on my end.

**Contact:** rehanmollick07@gmail.com

---

## What it does

NeuroDesign predicts fMRI brain activation for any image using Meta's TRIBE v2 model, then visualizes the results as an interactive 3D brain heatmap. Compare two designs side by side and see which one actually triggers more emotional response, visual attention, or memory engagement, backed by neuroscience rather than a designer's guess.

- **3D brain heatmaps** — ~20,000 vertex cortical mesh with per-vertex activation coloring
- **Region analysis** — Aggregated by named brain regions (fusiform, prefrontal, amygdala, V1, and more)
- **AI explanations** — Gemma 4 explains the neuroscience in plain English
- **Opinionated verdict** — The model picks a winner and explains why, with confidence
- **Chat advisor** — Ask follow-up questions about the comparison, grounded in the same analysis
- **Detailed scoring** — Neural scores across attention, emotion, memory, and clarity
- **Instant presets** — Four precomputed comparisons load immediately, no cold start

## What's new in V2

V2 is a full post-hackathon overhaul focused on credibility, polish, and performance.

### Design and UX
- **Cinematic redesign** — New hero with animated synapse brain, verdict section, silver brain material, glassmorphism panels, HUD-style headers, staggered card reveals
- **Chat advisor sidebar** — Opinionated follow-up chat that stays consistent with the winner verdict (no more contradictions)
- **Real brain function descriptions** — Replaced generic "Cortical region" labels everywhere with actual cognitive function descriptions (face processing, spatial attention, reward assessment, etc.)
- **Upload previews** — Uploaded images preview inline before comparison
- **Animated insight icons** and **neural scores** in the detailed analysis cards

### Performance
- **Parallelized Gemma calls** — Analysis and chat requests run concurrently, halving total response time
- **Staged loading feedback** — Users see progress through each stage of the comparison pipeline instead of one long opaque loading spinner
- **Auto-retry on cold start** — The frontend automatically retries when the GPU container is waking up, instead of failing
- **JSON retry logic** — Gemma responses that return incomplete JSON are automatically retried so all analysis fields populate
- **Chat timeout bumped** to 90 seconds so longer Gemma responses don't get cut off

### Model quality
- **Gemma is taught that more activation isn't always better** — A cluttered design activates many regions (cognitive overload), but a clean design activates fewer, more relevant ones. Gemma was previously contradicting its own verdict by treating "more activation = better"
- **Winner verdict is passed into chat context** so follow-up questions stay consistent with the analysis

### Infrastructure
- **Scale-to-zero GPU deployment** — Removed `min_containers=1` so the Modal backend only runs when there's traffic (pay per request, not 24/7)
- **Gemini media generation CLI** — `scripts/gemini_media.py` wraps Imagen 3 and Veo 2 for generating demo assets
- **Dead code cleanup** — Removed unused deps, split the monolithic `page.tsx` into components

## How it works

```
Upload 2 images
    |
    v
Convert each to a 1s silent video (TRIBE v2 expects video input)
    |
    v
Run Meta TRIBE v2 on a T4 GPU (~60s per image)
    |
    v
Get 20,484 cortical activation predictions per image
    |
    v
Aggregate into named brain regions (Destrieux atlas, 74 regions)
    |
    v
Jointly normalize activations across both images
    |
    v
Render as 3D brain heatmaps + send regions to Gemma 4 for analysis
    |
    v
Verdict + detailed neural scores + interactive chat advisor
```

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| 3D brain | React Three Fiber, Three.js, fsaverage5 mesh |
| Backend | FastAPI, Python 3.11 |
| GPU inference | Modal (T4 GPU, scale-to-zero) |
| Brain model | Meta TRIBE v2 |
| AI analysis | Google Gemma 4 (31B) via Google AI Studio API |
| Brain atlas | nilearn Destrieux atlas |
| Deploy | Vercel (frontend), Modal (backend, currently offline) |

## Architecture

```
Vercel (Next.js, SSG + cached presets)
    |
    | POST /compare (2 images)
    v
Modal (T4 GPU, scale-to-zero) [currently offline]
    |
    +-- inference.py: image -> video -> TRIBE v2 -> activations
    +-- regions.py:   activations -> named brain regions
    +-- gemma.py:     regions -> analysis + verdict + chat
    |
    v
JSON response -> 3D brain render + analysis UI + chat advisor
```

## Run locally

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # add your Modal API URL
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
modal deploy app.py
```

Requires a [Modal](https://modal.com) account and a [Google AI Studio](https://aistudio.google.com/apikey) API key. The Modal function is configured to scale to zero when idle, so you only pay for actual inference time.

### Media generation CLI

```bash
pip install -r scripts/requirements.txt
GEMINI_API_KEY=your-key python scripts/gemini_media.py \
  --prompt "a futuristic brain interface" \
  --output out.png \
  --mode image
```

Supports image generation (Imagen 3) and video generation (Veo 2, requires Vertex AI).

## Project structure

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
  gemma.py         # Gemma 4 API (analyze, score, chat)

scripts/
  gemini_media.py  # Imagen 3 and Veo 2 CLI
  precompute.py    # Generate new preset comparisons
  export_mesh.py   # fsaverage5 mesh -> mesh.json
```

## The science

TRIBE v2 (Meta, 2024) is a vision model trained on real fMRI data. Given visual input, it predicts the blood-oxygen-level-dependent (BOLD) response at each point on the cortical surface. The output maps to the fsaverage5 standard mesh used in neuroscience research.

We aggregate the raw ~20,000 vertex predictions into named brain regions using the Destrieux atlas from nilearn. Each region maps to a cognitive function:

- **Fusiform face area** — Face and identity processing
- **V1 and V2** — Low-level visual feature processing
- **Intraparietal sulcus** — Spatial attention
- **Orbitofrontal cortex** — Reward and value assessment
- **Amygdala** — Emotional response
- **Hippocampal regions** — Memory encoding

**More activation is not always better.** A cluttered image activates many regions due to cognitive overload. A clean, well-designed image activates fewer regions, but the right ones (reward, focused attention, face processing). NeuroDesign interprets this correctly, which was one of the key V2 fixes — the original hackathon build sometimes treated "louder brain = better design" and contradicted its own verdict.

## Background

NeuroDesign started as a hackathon project and won. V1 ([README-V1.md](./README-V1.md)) is the snapshot of what was submitted. V2 is the cleaned-up, more credible, more polished continuation of the same idea, with the goal of turning it into something that can actually be shown to designers and taken seriously.

## License

MIT

## Contact

Rehan Mollick — rehanmollick07@gmail.com

If you want a sample brain scan of your own website or design, just reach out.
