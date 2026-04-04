# NeuroDesign Design Overhaul

Follow the design system in CLAUDE.md exactly. Goal: win best design at hackathon.

## HERO SECTION (above the fold, 100vh)

- Full viewport height R3F scene with a single large brain model slowly rotating
- Idle synapse animation: random regions softly pulse with accent green (#00e5a0),
  like neurons firing. Pick 2-3 random regions every 2-3s, fade vertex colors
  from base (#2a2a3a) to green and back over 1.5s. Subtle, not flashy.
- Particle dust floating around (existing ParticleDust component, already built)
- Title "NEURODESIGN" in Space Grotesk 700, large (64px desktop, 40px mobile),
  left-aligned, overlaid on the scene via absolute positioning
- Subtitle "See how the brain responds to your designs" in IBM Plex Sans, #8a8a9a
- Scroll indicator at bottom: "SCROLL TO EXPLORE" in mono font 11px,
  letter-spacing 0.12em, with subtle opacity pulse animation. Or a thin
  animated chevron.
- As user scrolls, hero fades out (opacity 0) via scroll-linked animation.
  Use framer-motion useScroll + useTransform. Hero is position: sticky,
  demo section scrolls over it naturally.

## DEMO SECTION (scrolls into view)

- Preset comparison tabs at top (same 4 presets)
- Two brains side by side with labels, same as current but cleaner
- Upload zones: compact strip above the brains. Two small thumbnail-sized
  drop zones inline with "or drop your own" text. NOT big rectangles.
  They expand slightly on hover (scale 1.02). Accent green border on drag.
- COMPARE button: same design system spec (rectangular, sharp corners, mono font)
- Scanning animation on compare: CSS overlay div with white-to-transparent
  gradient, translateX(-100% to 100%) over 1.5s, positioned absolute over
  each brain canvas. Then heatmap colors fade in.
- Remove diff brain from default view. Too much visual weight with 3 brains.
  Keep the two activation brains only.
- Comparison images (thumbnails of Image A and Image B) stay above brains
  but smaller, max-height 120px.

## RESULTS SECTION (below the brains)

- Stacked layout, not side-by-side:
  1. Interpretation first (Gemma analysis). Full width, max-width 700px.
     Body font, left-aligned. Brain region names in accent green mono font
     inline. This is the most important content.
  2. Top Differences below. Region comparison bars with region name,
     one-line function description in text-secondary, and the two bars
     (green A, cyan B) with delta percentage.
- Scroll-triggered fade-in with upward translate (50ms stagger between elements)

## REGION DETAIL

- Keep current slide-in panel from right. No isolated 3D brain (scope creep).
- Dark surface background, top border in activation color
- Region name in heading font, function in body font
- Comparison metric in mono font with delta

## MICRO-INTERACTIONS

- framer-motion for scroll-linked animations (useScroll, useTransform)
- Brain regions glow on hover (existing emissive green behavior)
- Page sections fade in with upward translate as they scroll into view
- Scanning animation: CSS gradient sweep overlay, 1.5s
- Cursor: crosshair when hovering brain canvases
- Loading: skeleton pulse, not spinners (existing)
- All transitions: 200ms ease-out

## FOOTER

- Minimal. Dark surface strip.
- "Built with Meta TRIBE v2 and Google Gemma 4" in text-secondary 12px
- Links to TRIBE v2 GitHub and Gemma paper

## DO NOT

- Add a navbar. Single-page experience.
- Use any AI slop patterns from CLAUDE.md
- Make it feel like a dashboard. Interactive science museum exhibit.
- Add a third diff brain to the default view.
- Over-animate. The brain autorotation + synapse pulses are the only
  persistent animations.

## BUILD ORDER

1. Hero section (brain + synapse + title overlay + scroll indicator)
2. Scroll-linked fade transition (sticky hero, demo scrolls over)
3. Compact upload zones + restyled demo section
4. Results layout (interpretation first, bars second)
5. Scanning animation + micro-interactions
6. Footer
7. Commit after each section.
