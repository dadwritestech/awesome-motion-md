---
format: motion.md/v0
name: Linear
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://linear.app/, https://linear.app/features]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/linear.summary.json
tokens:
  duration:
    d1: 100ms
    d2: 160ms
    d3: 700ms
    d4: 400ms
  easing:
    e1: cubic-bezier(0.25, 0.46, 0.45, 0.94)
    e2: cubic-bezier(0.25, 0.1, 0.25, 1)
    e3: cubic-bezier(0, 0, 0.58, 1)
  stagger: 33ms
---

# Linear motion

TODO thesis.

## Measurements

- Declared transitions: 669 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 100ms ×368 (50%), 160ms ×276 (38%), 700ms ×30 (4%), 400ms ×25 (3%), 200ms ×17 (2%), 150ms ×8 (1%).
- Easings (declared + hover): easeOutQuad ×561 (77%, out); ease ×93 (13%, in-out); ease-out ×35 (5%, out); cubic-bezier(0.32, 0.72, 0, 1) ×30 (4%, out); easeOutQuart ×7 (1%, out).
- Hover: 23/33 probes ran CSS motion; 3 moved or scaled; 11 colour-only; 3 had JS (rAF) hover motion, 2 of them changing transform. Median in 160/100ms, out 160/100ms.
- Load: 44 animations, median 1000ms, max delay 2000ms | 148 animations, median 700ms, max delay 2396ms.
- Scroll: 452 animations on 5 targets, median 420ms | 28 animations on 2 targets, median 160ms; reveals that move: 440, opacity-only: 8; JS (rAF) reveals: 2; scroll-driven: 0.
- Stagger gaps: 33, 144ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 0%, 1%. Overshoot easings applied: 0; defined in CSS: 2. linear() springs in CSS: 0.
- Infinite loops: 82, 16 (grid-dot-#-#-upDown, grid-dot-#-#-pong, grid-dot-#-#-agent, qM#FAa_cursorBlink, sx-#fvhf-B).
- Reduced motion: 91 CSS queries, load motion 323 → 245 | 92 CSS queries, load motion 190 → 174.
- Libraries: none detected.
- CSS motion tokens: `--speed-highlightFadeIn: 0s`, `--speed-highlightFadeOut: .15s`, `--speed-quickTransition: .1s`, `--speed-regularTransition: .25s`, `--mask-ease: #0003`, `--ease-in-quad: cubic-bezier(.55, .085, .68, .53)`, `--ease-in-cubic: cubic-bezier(.55, .055, .675, .19)`, `--ease-in-quart: cubic-bezier(.895, .03, .685, .22)`, `--ease-in-quint: cubic-bezier(.755, .05, .855, .06)`, `--ease-in-expo: cubic-bezier(.95, .05, .795, .035)`, `--ease-in-circ: cubic-bezier(.6, .04, .98, .335)`, `--ease-out-quad: cubic-bezier(.25, .46, .45, .94)`, `--ease-out-cubic: cubic-bezier(.215, .61, .355, 1)`, `--ease-out-quart: cubic-bezier(.165, .84, .44, 1)`.
