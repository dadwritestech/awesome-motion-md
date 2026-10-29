---
format: motion.md/v0
name: Apple
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.apple.com/, https://www.apple.com/iphone/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/apple.summary.json
tokens:
  duration:
    d1: 320ms
    d2: 240ms
    d3: 200ms
    d4: 220ms
  easing:
    e1: cubic-bezier(0.25, 0.1, 0.25, 1)
    e2: cubic-bezier(0.4, 0, 0.6, 1)
    e3: cubic-bezier(0, 0, 1, 1)
  stagger: 20ms
---

# Apple motion

TODO thesis.

## Measurements

- Declared transitions: 1931 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 320ms ×737 (39%), 240ms ×552 (30%), 200ms ×100 (5%), 220ms ×96 (5%), 180ms ×92 (5%), 100ms ×80 (4%).
- Easings (declared + hover): ease ×1171 (56%, in-out); cubic-bezier(0.4, 0, 0.6, 1) ×657 (31%, in-out); linear ×86 (4%, linear); cubic-bezier(0, 0, 0.5, 1) ×62 (3%, out); ease-out ×43 (2%, out).
- Hover: 16/32 probes ran CSS motion; 9 moved or scaled; 7 colour-only; 6 had JS (rAF) hover motion, 4 of them changing transform. Median in 320/300ms, out 240/300ms.
- Load: 35 animations, median 1000ms, max delay 300ms | 40 animations, median 700ms, max delay 1800ms.
- Scroll: 0 animations on 0 targets, median nullms | 8 animations on 4 targets, median 300ms; reveals that move: 6, opacity-only: 0; JS (rAF) reveals: 18; scroll-driven: 0.
- Stagger gaps: 20, 150ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 0%, 0%. Overshoot easings applied: 0; defined in CSS: 2. linear() springs in CSS: 0.
- Infinite loops: 6, 6 (progress-indicator-animating).
- Reduced motion: 2 CSS queries, load motion 91 → 436 | 37 CSS queries, load motion 2169 → 80.
- Libraries: none detected.
- CSS motion tokens: `--r-globalnav-flyout-link-opacity-duration: .5s`, `--r-globalnav-duration-medium: .24s`, `--r-globalnav-search-base-duration: calc(.24s - 80ms)`, `--r-globalnav-search-item-base-duration: calc(.24s - 80ms)`, `--sk-dotnav-variable-duration: 320ms`, `--sk-dotnav-fade-in-out-duration: calc(var(--sk-dotnav-variable-duration)/2 - 20ms)`, `--sk-dotnav-hover-animation-duration: 120ms`, `--sk-dotnav-animation-stagger-duration: 40ms`, `--sk-dotnav-animation-collapse-duration: 380ms`, `--sk-dotnav-timed-duration: 3000ms`, `--media-gallery-bottom-copy-duration: 600ms`, `--media-gallery-slide-duration: 800ms`, `--r-localnav-curtain-transition: opacity 320ms cubic-bezier(0.4, 0, 0.6, 1) 0s, backdrop-filter 320ms cubic-bezier(0.4, 0, 0.6, 1) 0s, -webkit-backdrop-filter 320ms cubic-bezier(0.4, 0, 0.6, 1)`, `--r-localnav-menu-link-transition-delay: 0s`.
