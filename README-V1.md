# NeuroDesign V1 (Hackathon Build)

> This is the snapshot of NeuroDesign as it was submitted to the hackathon. For the current, improved version see the main [README.md](./README.md).

NeuroDesign V1 was built in a weekend as a hackathon submission and won. The goal was to take Meta's newly released TRIBE v2 brain prediction model and turn it into something an actual designer could use: upload two images, see how the human brain responds to each, pick the one that actually works better — backed by neuroscience, not vibes.

## Demo status

The V1 code path still exists in the repo (it is what V2 was built on top of). The live deployment now runs V2, which is a strict superset of V1's functionality plus a full UX redesign and a number of correctness fixes.

**Custom image uploads (live TRIBE inference) are currently offline** while the GPU backend is paused to control costs. The four precomputed presets still work in the live demo. If you want to see a comparison on your own images, email rehanmollick07@gmail.com and I'll run one for you.

## What V1 shipped

Everything below was working at the moment of hackathon submission (commit `664a161`).

### Core pipeline
- **Meta TRIBE v2 integration** — Wrapped the TRIBE v2 model (`facebook/tribev2`) behind a FastAPI endpoint, running on a Modal T4 GPU
- **Image to video preprocessing** — TRIBE v2 expects video input, so each uploaded image was expanded to a 1-second silent clip before inference
- **20,484 vertex predictions** — Per-vertex cortical activation on the fsaverage5 standard neuroscience mesh
- **Destrieux atlas region aggregation** — Raw vertex predictions grouped into 74 named brain regions using nilearn
- **Joint normalization** — Both images normalized together so their heatmaps are directly comparable

### Frontend
- **3D brain viewer** — React Three Fiber rendering the fsaverage5 cortical mesh with vertex-colored heatmaps
- **Two-image comparison layout** — Side-by-side brains + a diff brain (B minus A) showing where activation differs
- **Vivid colormap** — Percentile-stretched rainbow color mapping so regional differences are actually visible
- **Vertical bar charts** — Per-region activation comparison between Image A and Image B
- **Analysis cards** — Gemma-generated summaries of what each region's activation means
- **Four precomputed preset comparisons** — Real TRIBE v2 runs cached as JSON so the demo works instantly without a cold start

### AI analysis
- **Gemma 4 (31B) via Google AI Studio API** — Free tier, no key costs, handled the natural language analysis layer
- **Per-region explanations** — Each brain region's activation delta was passed to Gemma with its cognitive function, and Gemma generated a plain-English interpretation
- **Verdict summary** — An overall winner call per comparison

### Backend
- **FastAPI on Modal** — GPU function wrapped as an ASGI app, deployed with a single `modal deploy`
- **Resize before inference** — Images resized on the backend before TRIBE to keep GPU memory and runtime bounded

## V1 tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| 3D brain | React Three Fiber, Three.js, fsaverage5 mesh |
| Backend | FastAPI, Python 3.11 |
| GPU inference | Modal (T4 GPU) |
| Brain model | Meta TRIBE v2 |
| AI analysis | Google Gemma 4 (31B) via Google AI Studio API |
| Brain atlas | nilearn Destrieux atlas |
| Deploy | Vercel (frontend), Modal (backend) |

## Known limitations of V1 (fixed in V2)

V1 worked and won, but it had some rough edges that got cleaned up in V2:

- **Generic "Cortical region" labels** everywhere instead of actual cognitive function descriptions
- **Sequential Gemma calls** made analysis feel slow (each region explanation blocked the next)
- **Opaque loading state** — users stared at a spinner for a minute with no idea what stage the pipeline was in
- **Cold start failures** — if the Modal GPU was asleep, the first request would time out instead of retrying
- **Contradictory verdicts** — Gemma sometimes treated "more activation = better design," which is wrong for cluttered images and led to it contradicting its own winner call
- **Inconsistent chat** — follow-up chat sometimes disagreed with the main verdict because the verdict wasn't passed into the chat context
- **Monolithic page.tsx** — everything lived in one big component that was hard to navigate
- **Modal cost leak** — `min_containers=1` kept the T4 running 24/7 even with zero traffic (this one got expensive)

Each of these is addressed in V2. See the main [README.md](./README.md) for the full V2 changelog.

## How V1 worked

```
Upload 2 images
    |
    v
Resize + convert each to a 1s silent video
    |
    v
Run Meta TRIBE v2 on T4 GPU (~60s per image)
    |
    v
Get 20,484 cortical activation predictions per image
    |
    v
Aggregate into named regions (Destrieux atlas, 74 regions)
    |
    v
Jointly normalize both images
    |
    v
Render side-by-side 3D brains + bar charts + Gemma analysis
```

## Preset comparisons

V1 shipped with four precomputed showcase pairs so judges could see the full experience without waiting for inference:

1. **Clean landing page vs cluttered AI-generated landing page**
2. **Photo with face vs same composition without face**
3. **Text-heavy slide vs visual infographic**
4. **Apple vs cluttered brand homepage**

All four are still in the live demo.

## Timeline

V1 was scaffolded, built, debugged, and submitted inside the hackathon window. The commit history up through `664a161` ("add README, pitch script, and hackathon submission answers") captures the full V1 build. V2 started immediately after that commit and is still ongoing.

## License

MIT

## Contact

Rehan Mollick — rehanmollick07@gmail.com
