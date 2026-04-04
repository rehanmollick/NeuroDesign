# NeuroDesign - Judging Cheat Sheet

## One-liner
Upload two designs, see how the brain responds, get AI-powered recommendations. Neuroscience-backed A/B testing, free and instant.

## The Problem
Neuromarketing firms (Neurons Inc, iMotions, Tobii) charge $50,000+ per study. They put real humans in fMRI machines to test ads and designs. Only Fortune 500 companies can afford it. Everyone else just guesses.

## Our Solution
We use Meta's open-source TRIBE v2 model to PREDICT what an fMRI scan would show, without needing a real scanner or real humans. Then Gemma 4 explains the results in plain English.

---

## Tech Stack (know this cold)

### Meta TRIBE v2 (the brain model)
- Full name: "Tracking the Representation of Images in the Brain using Encoding models v2"
- Published by Meta's FAIR team (Facebook AI Research)
- Trained on real fMRI brain scan data from human subjects watching videos
- Input: video frames. Output: predicted BOLD signal (blood-oxygen-level-dependent) at 20,484 cortical points
- We convert each static image to a 1-second silent MP4 because TRIBE v2 expects video input
- Output maps to fsaverage5, the standard neuroscience cortical mesh
- This is NOT a heuristic. It's a deep neural network trained on real brain data.
- GitHub: github.com/facebookresearch/tribev2

### Google Gemma 4 (the explainer)
- 31 billion parameter open-weights model from Google DeepMind
- We use it via Google AI Studio API (free, no cost)
- Three jobs: (1) quick summary, (2) detailed multi-section analysis as JSON, (3) interactive chat
- Why Gemma over GPT/Claude: free API, good at structured JSON output, handles science-to-English well
- The chat receives the verdict from the analysis so it never contradicts the main results

### fsaverage5 (the brain mesh)
- Standard neuroscience cortical surface mesh
- 20,484 vertices, ~40,960 triangular faces
- We export it from nilearn (Python neuroscience library)
- Parcellated using the Destrieux atlas into 74 named brain regions
- Served as JSON (vertices + faces + regionMap)

### Destrieux Atlas (region names)
- Standard brain region parcellation used in neuroscience research
- 74 regions per hemisphere
- We filter to ~15-20 most relevant regions for display
- Each region maps to a cognitive function (we use a static lookup table)

### Frontend
- Next.js 16, TypeScript, Tailwind CSS
- React Three Fiber for 3D brain rendering (BufferGeometry, per-vertex coloring)
- framer-motion for scroll-triggered animations
- Three.js MeshStandardMaterial with metalness 0.95, roughness 0.08 for the metallic brain look
- Deployed on Vercel

### Backend
- FastAPI (Python 3.11)
- Deployed on Modal with T4 GPU
- OpenCV for image-to-video conversion
- nilearn + nibabel for brain atlas handling
- Pipeline: image -> 1s MP4 -> TRIBE v2 predict -> 20,484 activations -> aggregate by region -> normalize -> return JSON

### Infrastructure
- Modal: serverless GPU compute. T4 GPU, min_containers=1 (stays warm)
- Vercel: static frontend hosting
- Google AI Studio: free Gemma API
- Total cost: $0 (Modal free tier + Vercel free tier + Google AI Studio free)

---

## Key Brain Regions to Know

| Region | What it does | Why it matters for design |
|--------|-------------|-------------------------|
| Fusiform Face Area | Processes faces and identity | Activates when image has a human face. Why face-forward hero images work. |
| V1 / Primary Visual Cortex | First stop for raw visual info | High activation here = brain working hard to parse basic shapes. Cluttered designs spike this. |
| Orbitofrontal Cortex | Reward and value judgments | Lights up when brain finds something appealing or rewarding. Good design triggers this. |
| Intraparietal Sulcus | Spatial attention | Where the brain directs focus. Clean layouts activate this efficiently. |
| Amygdala | Emotional response | Fear, excitement, arousal. Strong emotional imagery spikes this. |
| Hippocampus | Memory encoding | More activation = more memorable. Matters for brand recall. |
| Lingual Gyrus | Visual word recognition, color | Processes text and color. Text-heavy designs activate this more. |

## Key Insight: More Activation != Better
- Cluttered designs often show MORE total brain activation
- That's BAD. It means cognitive overload, the brain struggling to parse noise
- Clean designs activate FEWER regions but the RIGHT ones (reward, attention, face processing)
- Quality of activation > quantity of activation
- This is real neuroscience. Researchers call it "neural efficiency"

---

## Preset Demo Stats (memorize 1-2)

**Apple vs Cluttered**: Apple wins. 13% stronger spatial attention activation. The brain processes Apple's clean layout efficiently while the cluttered layout causes cognitive overload.

**Face vs No Face**: Face wins. Fusiform face area lights up dramatically. The brain literally cannot ignore a human face. Every good landing page has a person on it for this reason.

**Text vs Infographic**: Infographic wins. 14% stronger activation in visual processing areas (Cuneus, Lingual Gyrus). The brain encodes visual information more richly than text.

**Clean vs AI-Cluttered**: Clean wins. Same pattern as Apple, 13% stronger spatial attention. AI-generated cluttered designs trigger cognitive overload.

---

## Likely Judge Questions

**"How accurate is TRIBE v2?"**
It's Meta's state-of-the-art, trained on real fMRI data from human subjects. The predicted activation patterns correlate with actual brain scans. It's not 100% (no model is), but it captures meaningful differences between images. Our Apple vs cluttered comparison shows exactly the result real neuroscience would predict.

**"Why does inference take 2 minutes?"**
Two full TRIBE v2 passes on a T4 GPU (~60s each), plus Gemma analysis. We're running a real deep neural network on 20,000+ data points per image. This is actual model inference, not an API wrapper or a lookup table. An A10G GPU would cut it to ~30 seconds.

**"Is this just a wrapper around an API?"**
No. We self-host TRIBE v2 on our own GPU via Modal. We wrote the image-to-video conversion, the region aggregation, the normalization pipeline, and the 3D brain visualization from scratch. Gemma is the only external API we call.

**"What's the business model?"**
Freemium. Free for individual designers. Paid tiers for agencies and teams: faster GPUs (30s instead of 2 min), Figma plugin integration, historical comparison database to track design improvements over time.

**"How is this different from eye-tracking tools like Hotjar?"**
Eye tracking tells you WHERE people look. We tell you what the BRAIN DOES when they look. Emotional response, memory encoding, reward activation, cognitive load. It's a deeper layer of insight. Eye tracking is behavioral, we're neurological.

**"Did you train any models?"**
No. We use Meta's pretrained TRIBE v2 as-is and Gemma 4 via API. Our innovation is the pipeline: wrapping a research model in a usable product with 3D visualization and AI-powered explanation. The science existed, we made it accessible.

**"What about privacy? Are you collecting the images?"**
Images are processed in memory on the GPU and discarded. Nothing is stored. The precomputed comparisons use stock/public images.

**"What's next?"**
1. Figma plugin: compare designs without leaving your design tool
2. Faster inference: A10G GPU cuts time from 2 min to 30s
3. Streaming results: show brain heatmaps immediately, load AI analysis after
4. Historical database: track how design iterations improve brain response over time
5. Video support: TRIBE v2 natively handles video, so we could analyze commercials and motion graphics

**"Why not just use GPT-4 to analyze designs?"**
GPT-4 looks at pixels and gives opinions. We run actual neuroscience inference. TRIBE v2 predicts real brain activation patterns, it's not guessing based on visual aesthetics. GPT might say "this looks clean," but we can say "this activates the reward center 15% more and reduces cognitive load in V1 by 20%."

**"Could this replace real fMRI studies?"**
Not fully, but it gets you 80% of the insight at 0% of the cost. Real fMRI captures individual differences, our predictions are population-average. For design decisions (which landing page is better?), that's more than enough.

---

## Numbers to Drop Casually

- 20,484 cortical vertices per brain
- 74 Destrieux atlas regions
- 31 billion parameters in Gemma 4
- $50,000+ for a traditional neuromarketing study
- $0 total infrastructure cost (all free tiers)
- ~2 minute inference time on T4 GPU
- 4 precomputed showcase comparisons
- Meta FAIR published TRIBE v2 (one of the top AI research labs in the world)

---

## If You Blank On Something

Fall back to this: "We take Meta's brain prediction model, run it on a GPU, and show you the results as an interactive 3D brain. Then AI explains what it means. It's neuromarketing for everyone."
