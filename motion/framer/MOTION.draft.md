---
format: motion.md/v0
name: Framer
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.framer.com/, https://www.framer.com/motion/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/framer.summary.json
tokens:
  duration:
    d1: 200ms
    d2: 150ms
    d3: 400ms
    d4: 160ms
  easing:
    e1: cubic-bezier(0.25, 0.1, 0.25, 1)
    e2: cubic-bezier(0.25, 1, 0.5, 1)
    e3: linear(…60 stops)
  stagger: 50ms
---

# Framer motion

TODO thesis.

## Measurements

- Declared transitions: 212 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 200ms ×107 (40%), 150ms ×67 (25%), 400ms ×21 (8%), 160ms ×17 (6%), 600ms ×17 (6%), 180ms ×15 (6%).
- Easings (declared + hover): ease ×183 (67%, in-out); cubic-bezier(0.25, 1, 0.5, 1) ×27 (10%, out); linear() ×17 (6%, spring/linear()); expoOut (0.16,1,0.3,1) ×17 (6%, out); cubic-bezier(0.25, 0, 0, 1) ×12 (4%, in-out).
- Hover: 22/31 probes ran CSS motion; 4 moved or scaled; 14 colour-only; 14 had JS (rAF) hover motion, 13 of them changing transform. Median in 150ms, out 150ms.
- Load: 74 animations, median 400ms, max delay 1200.0000000000002ms | 75 animations, median 200ms, max delay 0ms.
- Scroll: 13 animations on 9 targets, median 1000ms | 34 animations on 8 targets, median 180ms; reveals that move: 2, opacity-only: 19; JS (rAF) reveals: 33; scroll-driven: 0.
- Stagger gaps: 50, 100ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 100%, 0%. Overshoot easings applied: 0; defined in CSS: 0. linear() springs in CSS: 1.
- Infinite loops: 16, 0 (ghostFlow).
- Reduced motion: 0 CSS queries, load motion 3466 → 2199 | 21 CSS queries, load motion 230 → 222.
- Libraries: framerMotion, motionOne.
- CSS motion tokens: `--cl-motion: var(--lab-yellow)`, `--cl-motion-studio: var(--lab-watermelon, var(--tier-f))`, `--fresh-motion-plus-size: 42px`, `--motion-plus-accent: oklch(.76 .15 155)`.
