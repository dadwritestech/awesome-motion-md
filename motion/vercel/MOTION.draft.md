---
format: motion.md/v0
name: Vercel
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://vercel.com/, https://vercel.com/ai]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/vercel.summary.json
tokens:
  duration:
    d1: 100ms
    d2: 150ms
    d3: 500ms
    d4: 200ms
  easing:
    e1: cubic-bezier(0.4, 0, 0.2, 1)
    e2: cubic-bezier(0, 0, 0.2, 1)
    e3: cubic-bezier(0.23, 1, 0.32, 1)
  stagger: 125ms
---

# Vercel motion

TODO thesis.

## Measurements

- Declared transitions: 2491 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 100ms ×1582 (63%), 150ms ×843 (34%), 500ms ×31 (1%), 200ms ×26 (1%), 300ms ×18 (1%), 250ms ×2 (0%).
- Easings (declared + hover): material-standard ×2450 (98%, in-out); material-decelerate ×38 (2%, out); easeOutQuint ×8 (0%, out); ease ×4 (0%, in-out); linear ×2 (0%, linear).
- Hover: 7/13 probes ran CSS motion; 0 moved or scaled; 4 colour-only; 0 had JS (rAF) hover motion, 0 of them changing transform. Median in 150/150ms, out 150/150ms.
- Load: 2 animations, median 700ms, max delay 0ms | 2 animations, median 150ms, max delay 0ms.
- Scroll: 0 animations on 0 targets, median nullms | 118 animations on 5 targets, median 1000ms; reveals that move: 0, opacity-only: 98; JS (rAF) reveals: 0; scroll-driven: 0.
- Stagger gaps: 125ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 1%, 2%. Overshoot easings applied: 0; defined in CSS: 1. linear() springs in CSS: 6.
- Infinite loops: 0, 90 (spinner-opacity, thinking-loader).
- Reduced motion: 31 CSS queries, load motion 5 → 2 | 31 CSS queries, load motion 5 → 16.
- Libraries: none detected.
- CSS motion tokens: `--tw-duration: .2s`, `--tw-ease: var(--ease-out)`, `--tw-animation-duration: initial`, `--ease-in: cubic-bezier(.4, 0, 1, 1)`, `--ease-out: cubic-bezier(0, 0, .2, 1)`, `--ease-in-out: cubic-bezier(.4, 0, .2, 1)`, `--default-transition-duration: .15s`, `--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1)`, `--duration: .56104s`, `--timing: linear(0 0%, .00484 1%, .018323 2%, .039014 3%, .065627 4%, .097013 5%, .132156 6%, .170155 7.0%, .210219 8%, .251659 9%, .293875 10%, .336353 11%, .378653 12%,`, `--hero-duration: .35s`, `--hero-easing: cubic-bezier(.455,.03,.515,.955)`, `--marquee-speed: 80s`, `--peel-crease: var(--ds-gray-100)`.
