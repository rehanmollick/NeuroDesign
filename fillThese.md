* Elevator pitch
NeuroDesign predicts how the human brain responds to your designs using Meta's TRIBE v2 fMRI model, then explains the differences with AI. Neuroscience-backed A/B testing, instant and free.


* About the project

## Inspiration

Neuromarketing firms like Neurons Inc charge $50,000+ per study to put people in fMRI machines and test which ad or landing page triggers more brain activity. Only Fortune 500 companies can afford that. We thought: Meta just open-sourced TRIBE v2, a model that predicts fMRI brain activation from images. What if we wrapped that in an interface any designer could use? Upload two designs, see which one lights up the brain, get a plain-English explanation. Democratize the whole thing.

## What it does

You upload two images (landing pages, ads, logos, anything visual) and NeuroDesign runs them through Meta's TRIBE v2 model to predict fMRI brain activation across ~20,000 cortical points. The results render as interactive 3D brain heatmaps you can rotate, hover, and click. The app breaks down which image wins across emotional impact, visual attention, and memory retention. Then Google's Gemma 4 explains the neuroscience in plain English and answers follow-up questions through a chat interface. Four precomputed showcase comparisons load instantly so judges can explore without waiting for GPU inference.

## How we built it

Frontend: Next.js 16 with TypeScript and Tailwind CSS. The 3D brain is a React Three Fiber scene rendering the fsaverage5 cortical mesh (~20,484 vertices) with per-vertex color mapping based on activation values. We export the mesh from nilearn's Destrieux atlas and serve it as JSON.

Backend: FastAPI running on Modal with a T4 GPU. Each image gets converted to a 1-second silent video (TRIBE v2 expects video input), then fed through the model. We aggregate the ~20,000 vertex activations into named brain regions using the Destrieux atlas, normalize jointly across both images, and return the comparison data.

AI Analysis: Google's Gemma 4 (31B parameter model) via Google AI Studio API takes the region-level activation data and generates a multi-section analysis (emotional impact, visual attention, memory retention, winner verdict) plus an interactive chat where designers can ask follow-up questions about their specific comparison.

Design: Custom "Neural Dark" design system. Near-black backgrounds, Space Grotesk headings, IBM Plex Sans body text, IBM Plex Mono for data. The 3D brain has metallic silver material with animated synapse pulses on the hero page.

## Challenges we ran into

TRIBE v2 only accepts video input, not static images. We had to figure out the right conversion (1-second silent MP4 via OpenCV) and verify the model actually produces meaningfully different activation patterns for different images rather than a flat baseline.

GPU inference takes ~60 seconds per image on a T4. Two images plus AI analysis means ~2 minutes total. We had to build staged loading feedback ("Scanning Image A...", "Mapping brain regions...", "Generating AI analysis...") so users know it is working and not frozen.

Getting the 3D brain to look right was harder than expected. Too bright and it looks like a toy. Too dark and you cannot see the activation colors. We landed on a metallic silver material (metalness 0.95, roughness 0.08) with Environment reflections and colored rim lighting.

The AI chatbot initially said "neither image is objectively better" for every comparison, which is useless. We had to teach it that more brain activation on a cluttered image means cognitive overload, not better design. Clean designs win by activating the right regions efficiently, not by lighting up everything.

## Accomplishments that we're proud of

The 3D brain visualization is genuinely beautiful. It auto-rotates with synapse pulses on the hero, then shows real activation heatmaps in the comparison view. Hovering a region shows its name and function. It feels like a real neuroscience research tool.

The precomputed comparisons load instantly. Judges never see a loading screen on first visit. They can switch between four showcase comparisons (Apple vs cluttered landing page, face vs no face, text-heavy vs infographic, clean vs AI-cluttered) and see the brains update in real time.

The AI chat actually gives strong opinions. Ask "which is better?" and it picks a winner with specific brain data evidence, not corporate hedging.

## What's next for NeuroDesign

Faster inference: upgrading from T4 to A10G GPU and potentially caching intermediate model states to cut inference time from 2 minutes to under 30 seconds.

Streaming results: show the brain heatmaps as soon as inference is done, then stream the AI analysis in afterward so users get visual feedback faster.

Figma plugin: designers should be able to right-click two frames in Figma and compare them without leaving their design tool.

Historical comparison database: save every comparison so you can track how your design iterations improve brain response over time.


* Built with
Next.js, TypeScript, Tailwind CSS, React Three Fiber, Three.js, FastAPI, Python, Modal, Meta TRIBE v2, Google Gemma 4, Google AI Studio API, nilearn, Vercel


"Try it out" links
https://frontend-gamma-ten-23.vercel.app
https://github.com/rehanmollick/NeuroDesign


* Did you implement a generative AI model or API in your hack this weekend?
Yes, we used two AI models:

1. Meta TRIBE v2: An open-source fMRI brain activation prediction model. It takes visual input and predicts how ~20,000 points on the human cortex would respond, essentially simulating what an fMRI brain scan would show. We used it to compare how the brain processes two different design images. This is the core science behind the app.

2. Google Gemma 4 (31B) via Google AI Studio API: We used Gemma as the explanation and chat layer. It takes the brain activation data (aggregated by region) and generates plain-English analysis across multiple dimensions (emotional impact, visual attention, memory retention). It also powers an interactive chat where users can ask follow-up questions about their comparison. We chose Gemma because the API is free, the model is strong at structured JSON output, and it handles the neuroscience-to-plain-English translation well.
