# NeuroDesign (V1) - Won 'Most Creative' Track at Claude Builder Club Hackathon at UT Austin.

> Neuroscience-backed A/B testing for designers. Upload two images, see how the human brain actually responds to each one, and get AI-powered recommendations rooted in real fMRI research.

**[Live Demo →](https://neurodesign-v2.vercel.app/)**

This is the **original hackathon build** of NeuroDesign. It won the hackathon and this repo is a snapshot of what shipped that weekend. The project has since been rewritten as **V2** with a different model stack, composite neural signals, a RAG knowledge base, and a cleaner architecture.

**V2 repo:** https://github.com/rehanmollick/NeuroDesignV2

---

## Demo status: preset mode

The live demo currently runs in **preset-only mode**. Four hand-picked precomputed comparisons load instantly so anyone can experience the full interface, 3D brain visualization, and AI analysis.

**Custom image uploads (live TRIBE v2 inference) do not work right now.** I took down the Modal GPU backend to stop it from billing. It was accidentally left with a warm container that ran 24/7 regardless of traffic, which got expensive fast.

**Want to see how NeuroDesign analyzes your own website, app, or designs?** Reach out and I'll spin the backend back up and run a custom comparison for you. It only takes a few minutes on my end.

**Contact:** rehanmollick07@gmail.com

---

## What it does

NeuroDesign predicts fMRI brain activation for any image using Meta's TRIBE v2 model, then visualizes the results as an interactive 3D brain heatmap. Compare two designs side by side and see which one actually triggers more emotional response, visual attention, or memory engagement, backed by neuroscience rather than a designer's guess.

- **3D brain heatmaps** — ~20,000 vertex cortical mesh with per-vertex activation coloring
- **Region analysis** — Aggregated by named brain regions (fusiform, prefrontal, amygdala, V1, etc.)
- **AI explanations** — Gemma 4 explains the neuroscience in plain English
- **Interactive chat** — Ask follow-up questions about a comparison
- **Instant presets** — Four precomputed comparisons load immediately, no cold start

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
```

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| 3D brain | React Three Fiber, Three.js, fsaverage5 mesh |
| Backend | FastAPI, Python 3.11 |
| GPU inference | Modal (T4 GPU) |
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
Modal (T4 GPU) [currently offline]
    |
    +-- inference.py: image -> video -> TRIBE v2 -> activations
    +-- regions.py:   activations -> named brain regions
    +-- gemma.py:     regions -> AI explanation + chat
    |
    v
JSON response -> 3D brain render + analysis UI
```

## Preset comparisons

The live demo ships with four precomputed showcase pairs that work without the GPU backend:

1. **Clean landing page vs cluttered AI-generated landing page**
2. **Photo with face vs same composition without face**
3. **Text-heavy slide vs visual infographic**
4. **Apple homepage vs cluttered brand homepage**

All four still work in the live demo in preset-only mode.

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

Requires a [Modal](https://modal.com) account and a [Google AI Studio](https://aistudio.google.com/apikey) API key.

**Heads up on Modal cost:** the V1 `backend/app.py` used to set `min_containers=1`, which keeps a T4 GPU container running 24/7 even with no traffic. That detail is what burned a real hole in my Modal bill. If you run this yourself, drop that setting (the repo now defaults to scale-to-zero) so you only pay for actual inference time.

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
  gemma.py         # Gemma 4 API (explain, detailed analysis, chat)
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

**More activation is not always better.** A cluttered image activates many regions due to cognitive overload. A clean, well-designed image activates fewer regions, but the right ones (reward, focused attention, face processing). NeuroDesign interprets this correctly.

## Background

NeuroDesign started as a weekend hackathon project and won. This repo is a snapshot of the winning build. I have since rewritten it as **V2** with a new multimodal model (Gemini 2.5 Flash instead of Gemma 4), a neuroscience RAG knowledge base, composite signal aggregation (attention, reward, memory, visual complexity, emotional, language), and a test suite.

For the actively maintained version, see: **https://github.com/rehanmollick/NeuroDesignV2**

## License

MIT

## Contact

Rehan Mollick — rehanmollick07@gmail.com

If you want a brain scan of your own website or designs, just reach out.
