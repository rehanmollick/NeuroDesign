# DesignV2 — Issues & Priorities

## Critical Bugs
1. **Custom image upload is broken.** When no preset is active, upload zones
   don't appear. The conditional rendering hides them when a preset comparison
   exists. Need to always show upload zones, and when user uploads both images
   and clicks COMPARE, show their uploaded images + brain results.
2. **Chat response is slow.** Gemma 4 cold start + thinking time. Need a
   loading skeleton or typing indicator that feels alive, not just "Thinking..."

## Priority 1: Fix Upload Flow
- Upload zones must ALWAYS be visible and accessible
- When user uploads 2 images and hits COMPARE:
  - Show the 2 uploaded images (not preset images)
  - Show brain activation results below
  - Show analysis cards below that
- Preset tabs should still work but uploading should override them
- Clear visual state: "you are viewing preset" vs "you are viewing your upload"

## Priority 2: Components Are Boring / Hard to Read
Current problems:
- All cards look the same (same dark glass, same text size, same spacing)
- Text is small and grey on dark grey — low contrast, hard to scan
- No visual hierarchy within cards — headers and content blend together
- Cards are just "placed on the page" with no compositional logic
- The analysis section feels like a data dump, not a story

What needs to change:
- **Bigger text.** Body at 16px minimum, card headers at 14-16px not 11px
- **Higher contrast.** Use #e8e6e3 for body text, not #8a8a9a
- **Visual variety.** Winner card should look DIFFERENT from insight cards.
  Recommendations should look DIFFERENT from the chart.
- **Whitespace.** More padding inside cards (32px+), more gap between cards
- **Color accents.** Each card type gets a distinct accent color treatment
- **Section flow.** Tell a story: Winner → Why → What it means → What to do
- **Typography hierarchy.** Card titles in heading font at 18-20px, not
  mono 11px. Content in sans 15-16px.

## Priority 3: Hero Brain
- Rotate brain to side view (profile angle, not top-down)
- Silver metallic material: metalness 0.8, roughness 0.15
- Brighter lighting — the brain should GLOW, not hide in darkness
- Maybe add a subtle environment map for reflections

## Priority 4: Chat UX
- Show animated dots (●●●) instead of "Thinking..."
- Preload first message: auto-send "Summarize which design is better
  and why" when comparison loads, so chat isn't empty
- Make chat feel faster by streaming (or fake streaming with word-by-word reveal)

## Design Principles for V2
- "If you have to squint, it's wrong"
- Every component earns its space by being readable and useful
- The page tells a story from top to bottom
- Visual hierarchy > visual flair. Readability first, then make it pretty.
- Components should feel distinct from each other, not uniform
