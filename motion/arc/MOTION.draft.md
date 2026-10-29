---
format: motion.md/v0
name: The Browser Company (Arc)
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://arc.net/, https://www.diabrowser.com/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/arc.summary.json
tokens:
  duration:
    d1: 200ms
    d2: 300ms
    d3: 700ms
    d4: 150ms
  easing:
    e1: cubic-bezier(0.4, 0, 0.2, 1)
    e2: cubic-bezier(0.25, 0.1, 0.25, 1)
    e3: cubic-bezier(0.16, 1, 0.3, 1)
  stagger: 90ms
---

# The Browser Company (Arc) motion

TODO thesis.

## Measurements

- Declared transitions: 892 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 200ms ×753 (82%), 300ms ×64 (7%), 700ms ×38 (4%), 150ms ×17 (2%), 220ms ×15 (2%), 80ms ×10 (1%).
- Easings (declared + hover): material-standard ×762 (82%, in-out); ease ×114 (12%, in-out); expoOut (0.16,1,0.3,1) ×41 (4%, out); cubic-bezier(0.22, 1, 0.36, 1) ×4 (0%, out); easeOutCubic ×2 (0%, out).
- Hover: 10/12 probes ran CSS motion; 3 moved or scaled; 6 colour-only; 8 had JS (rAF) hover motion, 7 of them changing transform. Median in 200/200ms, out 150/200ms.
- Load: 0 animations, median nullms, max delay 0ms | 6 animations, median 1000ms, max delay 0ms.
- Scroll: 43 animations on 4 targets, median 700ms | 21 animations on 8 targets, median 300ms; reveals that move: 3, opacity-only: 46; JS (rAF) reveals: 6; scroll-driven: 0.
- Stagger gaps: 90ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 0%, 1%. Overshoot easings applied: 0; defined in CSS: 0. linear() springs in CSS: 0.
- Infinite loops: 0, 0 ().
- Reduced motion: 1 CSS queries, load motion 0 → 141 | 5 CSS queries, load motion 123 → 19.
- Libraries: none detected.
- CSS motion tokens: `--ease: cubic-bezier(0.16,1,0.3,1)`.
