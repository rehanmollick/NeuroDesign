# TODOS

## Verify Modal pricing for keep_warm
- **What:** Check if Modal free/starter tier supports `keep_warm=1` on a T4 GPU without burning through credits in 2 days.
- **Why:** A T4 at ~$0.59/hour costs ~$14/day with keep_warm. Monthly starter credit is $30. Permanent warm containers may not be viable.
- **Context:** The plan uses keep_warm + pre-warm script for demo reliability. If keep_warm is too expensive, fall back to pre-warm-only (hit the endpoint 5 minutes before demo). The precomputed fallback covers the case where Modal is completely cold.
- **Depends on:** Nothing. Check before backend implementation (Hour 6).

## CC-BY-NC-4.0 license blocks commercial use
- **What:** TRIBE v2 model weights are licensed CC-BY-NC-4.0. If NeuroDesign becomes a commercial product, need to either license from Meta or train a replacement model.
- **Why:** Fine for hackathon demo. Blocks any monetization, paid API, or commercial deployment.
- **Context:** /office-hours identified startup potential. If pursuing YC or commercialization, this is the first legal blocker to resolve.
- **Depends on:** Decision to go commercial. Not blocking for hackathon.

## Data-driven preset manifest
- **What:** Replace hardcoded preset tab list with a manifest JSON (`public/data/comparisons/manifest.json`) that lists all available comparisons with display names and metadata.
- **Why:** Currently adding a new preset requires changing code (updating the tab list). With a manifest, adding a preset is just: generate JSON + add entry to manifest.
- **Context:** Preset tabs are hardcoded to 4 items for hackathon. If pursuing Brain Database vision (10k+ precomputed comparisons), presets must be data-driven.
- **Depends on:** Nothing. Can be done anytime post-hackathon.
