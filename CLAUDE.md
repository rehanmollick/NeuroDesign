# NeuroDesign

## What this is
NeuroDesign lets you upload two images and see how the human brain responds 
to each one. It uses Meta's TRIBE v2 model to predict fMRI brain activation 
across ~20,000 cortical points, renders the results as interactive 3D brain 
heatmaps, and uses Google's Gemma 4 to explain the differences in plain 
English. Think "A/B testing backed by neuroscience."

## Tech stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS, React Three Fiber (3D brain)
- Backend: FastAPI (Python 3.11), deployed on Modal with GPU (T4)
- AI Models: Meta TRIBE v2 (brain prediction), Gemma 4 via Google AI Studio API
- Brain Mesh: fsaverage5 cortical surface (~20k vertices)
- Deploy: Vercel (frontend), Modal (backend)

Why this stack:
- Next.js/Tailwind/R3F: known stack, R3F handles the 3D brain rendering
- FastAPI: TRIBE v2 is Python-only, FastAPI wraps it as an API
- Modal: free GPU tier, deploy a Python function with @modal.gpu("T4")
- Gemma via Google AI Studio: free API, no key costs, solid multimodal model
- fsaverage5: standard neuroscience mesh format, TRIBE v2 outputs to it natively

## Coding rules
- Simple variable names (preds not neural_predictions_tensor)
- No em dashes anywhere in text or comments
- Student-style code, not over-engineered
- One component per file in src/components/
- Components under 150 lines, split if longer
- Keep API routes thin, business logic in separate service files
- Use TypeScript interfaces for all shared types in lib/types.ts
- Comments should explain WHY not WHAT

## Design system: "Neural Dark"

### Philosophy
This app visualizes the brain. The design should feel like you are 
looking into a high-end neuroscience research interface, not a SaaS 
dashboard. Think the aesthetic of a brain-computer interface control 
room crossed with a luxury scientific instrument. Every pixel should 
feel intentional, precise, and slightly futuristic without crossing 
into sci-fi cheese.

### AI slop rules (NEVER do these)
- NO gradient backgrounds (especially blue-to-purple)
- NO 3-column icon feature grids
- NO uniform border-radius on everything (vary by element role)
- NO centered text paragraphs (left-align body text always)
- NO decorative floating blobs, orbs, or abstract shapes
- NO generic "Get Started" or "Try Now" buttons with rounded pill shapes
- NO card grids where every card is the same size with the same padding
- NO stock-photo-style hero sections
- NO excessive drop shadows or glassmorphism on every element
- NO Poppins, Inter-only, or any single generic sans-serif everywhere
- NO emoji as visual elements
- NO "Built with AI" or "Powered by" badges prominently displayed

### Color palette
- Background: #0a0a0f (near-black with slight blue undertone)
- Surface: #12121a (cards, panels, elevated surfaces)
- Surface hover: #1a1a28
- Border: #1e1e2e (subtle, only where needed for structure)
- Text primary: #e8e6e3 (warm off-white, NOT pure white)
- Text secondary: #8a8a9a
- Accent primary: #00e5a0 (neural green, used SPARINGLY)
- Accent secondary: #00b4d8 (cyan, for secondary actions only)
- Activation hot: #ff4d4d to #ff8c00 gradient (brain heatmap hot end)
- Activation cold: #1a3a5c to #0a1628 (brain heatmap cold end)
- Danger/warning: #ff6b6b
- DO NOT use more than these colors. Restraint is the point.

### Typography
- Headings: "Space Grotesk" (Google Fonts), weight 500-700
  - Import: https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700
  - Hero/page titles: 48px, weight 700, letter-spacing: -0.03em
  - Section headings: 28px, weight 600, letter-spacing: -0.02em
  - Card titles: 18px, weight 500
- Body: "IBM Plex Sans" (Google Fonts), weight 400
  - Import: https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500
  - Body text: 15px, weight 400, line-height: 1.65
  - Captions/labels: 12px, weight 500, uppercase, letter-spacing: 0.08em
- Data/metrics: "IBM Plex Mono" (Google Fonts), weight 400-500
  - Import: https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500
  - Activation percentages, region names in charts, technical labels
- The three fonts create hierarchy: Grotesk for impact, Sans for reading, 
  Mono for data. This is not optional. Do not use only one font.

### Spacing and layout
- Base unit: 4px. All spacing should be multiples of 4.
- Page max-width: 1400px, centered
- Page padding: 48px horizontal on desktop, 20px on mobile
- Section gaps: 80px between major sections
- Card padding: 24px (not 16px, give content room to breathe)
- Use CSS Grid for layout, not flexbox-for-everything
- Asymmetric layouts are preferred over perfectly centered symmetry
- The upload area and results area should NOT be equal width columns.
  Upload should be narrower (~35%), results wider (~65%)

### Component-specific design

#### 3D Brain (React Three Fiber)
- Background of canvas: transparent, let the page background show through
- Brain mesh material: MeshStandardMaterial with metalness: 0.3, roughness: 0.7
- Default brain color (no activation): #2a2a3a (dark neutral)
- Activation coloring: vertex colors interpolated from cold (#1a3a5c) to 
  hot (#ff4d4d) based on activation value
- Add subtle ambient light (intensity 0.4) and one directional light 
  (intensity 0.8, position [5, 5, 5])
- Enable OrbitControls with autoRotate at speed 0.5
- When user hovers a brain region, highlight it with emissive glow (#00e5a0, 
  intensity 0.3) and show a tooltip with region name
- The brain should feel like a precious scientific specimen, not a toy
- Add very subtle particle dust floating around the brain (30-50 particles, 
  tiny, slow drift, low opacity 0.15) using Points geometry

#### Upload zone
- NOT a dotted-border rectangle. Instead: a thin 1px border (#1e1e2e) 
  rectangle with a subtle pulse animation on hover
- Upload icon: a single thin-line custom SVG, not a generic cloud icon
- Drag state: border transitions to accent green (#00e5a0), 
  background shifts to #0f1f18 (very subtle green tint)
- After upload: show a thumbnail of the image with a small X to remove
- Label above each upload zone in mono font: "IMAGE A" and "IMAGE B"
  in uppercase, letter-spacing 0.1em, text-secondary color

#### Compare button
- NOT a pill-shaped gradient button
- Rectangular, sharp corners (border-radius: 4px max)
- Background: transparent with 1px accent green border
- Text: "COMPARE" in mono font, uppercase, letter-spacing 0.12em
- Hover: background fills to accent green, text goes dark (#0a0a0f)
- Loading state: text changes to "SCANNING..." with a minimal 
  horizontal progress bar below (not a spinner)

#### Results panel
- Gemma's analysis text in body font, left-aligned, max-width 600px
- Brain region names in mono font with accent color
- Activation values displayed as horizontal bar charts, not pie charts
  or radial charts. Thin bars (8px height), rounded ends (4px radius)
- Each bar shows Image A and Image B stacked or side by side in 
  different accent colors (green for A, cyan for B)

#### Region detail card
- Appears on brain region click, slides in from the right as a panel
- Dark surface background with a top border in the region's activation color
- Region name in heading font, region function in body font (one sentence)
- Comparison metric in mono font with the delta value
- Close button: small X in top right, no background, just the glyph

### Motion and animation
- All transitions: 200ms ease-out (never ease-in-out, it feels sluggish)
- Page load: content fades in with 20px upward translate, staggered by 50ms
- Brain entrance: scales from 0.9 to 1.0 with 400ms ease-out
- DO NOT animate everything. Static elements should be static.
- No bouncing, no elastic easing, no spring physics on UI elements
- The brain autorotation is the only persistent animation on screen

### Responsive
- Desktop first. This is a demo app for a hackathon.
- Below 768px: stack the two brains vertically instead of side by side
- Below 768px: upload zones stack vertically
- The 3D brain canvas should never be smaller than 300x300px

## Scaffold commands
```bash
# Frontend
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
npm install three @react-three/fiber @react-three/drei
npm install axios
cd ..

# Backend
mkdir backend && cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart
pip install modal
git clone https://github.com/facebookresearch/tribev2.git
cd tribev2
pip install -e ".[plotting]"
cd ../..

# Gemma API (no install needed, just need a Google AI Studio API key)
# Get one free at https://aistudio.google.com/apikey
```

## Preset comparisons to pre-compute
Have these ready so demo works instantly without waiting for inference:
1. Clean landing page vs cluttered AI-generated landing page
2. Photo with face vs same composition without face
3. Text-heavy slide vs visual infographic
4. Two real brand homepages (Apple vs a cluttered competitor)

## Key technical notes
- TRIBE v2 outputs per-vertex predictions on fsaverage5 mesh (~20k points)
- Use tribev2/utils_fmri.py ROI utilities to group vertices into named 
  brain regions (fusiform, V1, prefrontal, amygdala, parietal attention, 
  ventral stream, etc.)
- Send aggregated region activations to Gemma, NOT raw 20k vertex array
- The Colab demo notebook has working inference code to reference:
  https://colab.research.google.com/github/facebookresearch/tribev2/blob/main/tribe_demo.ipynb
- TRIBE v2 expects video/audio/text inputs natively. For static images,
  convert to a short single-frame video or check if the model accepts 
  image tensors directly
- Pre-compute the fsaverage5 mesh as a GLB/GLTF file for R3F to load

## Media Generation CLI

`scripts/gemini_media.py` wraps Google's Gemini API for image and video gen.

```bash
# Install
pip install -r scripts/requirements.txt

# Generate an image (Imagen 3)
GEMINI_API_KEY=your-key python scripts/gemini_media.py \
  --prompt "a futuristic brain interface" \
  --output out.png \
  --mode image

# Generate a video (Veo 2 -- requires Vertex AI, not just an API key)
GEMINI_API_KEY=your-key python scripts/gemini_media.py \
  --prompt "zoom into a glowing neural network" \
  --output out.mp4 \
  --mode video
```

- Image mode uses `imagen-3.0-generate-002` via Gemini Developer API
- Video mode uses `veo-2.0-generate-001` which requires Vertex AI setup
- Reads `GEMINI_API_KEY` from env, prints output path on success
- Deps: `google-genai` (see `scripts/requirements.txt`)

## gstack
Use /browse from gstack for all web browsing.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review,
/review, /ship, /qa, /qa-only, /careful, /freeze, /investigate.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
