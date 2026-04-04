# NeuroDesign - 2 Min Demo

## OPEN (20s)

> Have you ever heard of neuromarketing firms? Companies like Neurons Inc charge $50,000 per study to put people in fMRI machines and tell Nike which ad makes the brain light up more. Only Fortune 500 companies can afford that.
>
> We built NeuroDesign. It does the same thing, for free, in your browser.
>
> The secret is Meta's TRIBE v2. It's an open-source model Meta's research team published that predicts fMRI brain activation from visual input. Trained on real brain scan data. We wrapped it in an interface any designer can use.

## SHOW THE BRAIN (10s)

*Site is already open. Hero brain pulsing with synapse animations.*

> This is a real neuroscience mesh. 20,000 points on the human cortex, the same format researchers use in actual fMRI studies. Those green pulses are about to become real predicted brain data.

## DEMO PRESETS (35s)

*Apple vs Cluttered is already loaded.*

> Apple's homepage versus a cluttered competitor. Look at the brain on the left. Focused activation. Reward centers, the fusiform face area, focused attention regions. Clean and efficient. The brain on the right is lighting up everywhere, but that's not good. That's cognitive overload. The brain is struggling to process the visual noise.

*Scroll to verdict and analysis cards.*

> NeuroDesign picks a winner and tells you why. Emotional impact, visual attention, memory retention, all broken down. And this analysis comes from Google's Gemma 4, a 31 billion parameter model. We feed it the brain region data and it translates the neuroscience into plain English. We chose Gemma because the API is free, it's great at structured output, and it handles the science-to-English translation really well.

*Click Face vs No Face tab.*

> Switch comparisons instantly. Face versus no face. See that spike? That's the fusiform face area. It's the part of the brain specialized for processing faces. That's why every good landing page has a person on it. The brain literally can't help but pay attention.

## AI CHAT (15s)

*Open the chat sidebar.*

> And if you want to go deeper, we have a Gemma-powered AI advisor. Ask it anything. "Which design is better for conversion?" It gives you a straight answer with specific brain data to back it up. No hedging, no "both have merits." It picks a winner.

## UPLOAD YOUR OWN (20s)

*Drag in two images.*

> The real power is uploading your own designs. Your landing page versus your competitor's. We send both images to a T4 GPU on Modal running TRIBE v2. Each image gets converted to a one-second video, because that's what TRIBE v2 expects, then the model predicts activation at all 20,000 cortical points. We aggregate that into named brain regions using the Destrieux atlas from neuroscience, normalize across both images, and render the comparison.
>
> It takes about two minutes because this is real GPU inference, not a heuristic or a lookup table.

## CLOSE (15s)

> Design A/B testing today: ship it, wait for clicks, hope for the best. NeuroDesign lets you test your design against the human brain before you ship.
>
> Neuromarketing used to cost $50,000 and take weeks. We just made it free and instant. That's NeuroDesign.

---

## JUDGE Q&A (cheat sheet)

**What is TRIBE v2?**
Meta's open-source fMRI prediction model. Trained on real brain scan data. Given visual input, it predicts the BOLD response (blood-oxygen-level-dependent signal) at 20,000+ cortical points. Same output format as an actual fMRI study.

**Why Gemma 4?**
Free API via Google AI Studio, 31B parameters, strong at structured JSON output. We use it for three things: the quick summary, the detailed multi-section analysis (winner, emotional impact, attention, memory), and the interactive chat. It translates brain data into language designers actually understand.

**Why not just use GPT/Claude for analysis?**
We wanted the whole thing to be free. Gemma via Google AI Studio has no API costs. For a hackathon demo that judges and users can try without limits, that matters.

**How accurate is TRIBE v2?**
It's Meta's state-of-the-art. Trained on real fMRI data, predicts activation patterns that correlate with actual brain scans. Not perfect, but it captures meaningful differences between images. The Apple vs cluttered comparison shows exactly the kind of result neuroscience would predict.

**Why does it take 2 minutes?**
Two full TRIBE v2 inference passes on a T4 GPU (~60s each), plus Gemma analysis. Real model inference, not an API wrapper or cached result.

**Business model?**
Free for individual designers. Paid tiers for agencies: faster GPUs (A10G cuts inference to 30s), Figma plugin, historical comparison database.

**What's next?**
Figma plugin. Faster inference (A10G GPU). Streaming results so you see brains before analysis finishes. Historical database to track design improvements over time.

**vs eye-tracking tools?**
Eye tracking tells you where people look. NeuroDesign tells you what the brain does when they look. Emotional response, memory encoding, reward activation. Deeper layer of insight.
