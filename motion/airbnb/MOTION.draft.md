---
format: motion.md/v0
name: Airbnb
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.airbnb.com/, https://www.airbnb.com/s/experiences]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/airbnb.summary.json
tokens:
  duration:
    d1: 300ms
    d2: 200ms
    d3: 100ms
    d4: 250ms
  easing:
    e1: cubic-bezier(0.2, 0, 0, 1)
    e2: cubic-bezier(0, 0, 1, 1)
    e3: linear(…11 stops)
  stagger: null
---

# Airbnb motion

TODO thesis.

## Measurements

- Declared transitions: 966 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 300ms ×267 (27%), 200ms ×249 (25%), 100ms ×238 (24%), 250ms ×156 (16%), 150ms ×59 (6%), 175ms ×5 (1%).
- Easings (declared + hover): cubic-bezier(0.2, 0, 0, 1) ×905 (93%, in-out); linear ×69 (7%, linear); linear() ×3 (0%, spring/linear()).
- Hover: 5/14 probes ran CSS motion; 0 moved or scaled; 5 colour-only; 1 had JS (rAF) hover motion, 1 of them changing transform. Median in 300/200ms, out 300/200ms.
- Load: 6 animations, median 150ms, max delay 100ms | 85 animations, median 300ms, max delay 150ms.
- Scroll: 7 animations on 6 targets, median 175ms | 734 animations on 6 targets, median 300ms; reveals that move: 23, opacity-only: 373; JS (rAF) reveals: 1; scroll-driven: 0.
- Stagger gaps: none detected.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 0%, 0%. Overshoot easings applied: 0; defined in CSS: 2. linear() springs in CSS: 140.
- Infinite loops: 0, 380 (kf-ng#tb).
- Reduced motion: 11 CSS queries, load motion 288 → 21 | 11 CSS queries, load motion 866 → 411.
- Libraries: none detected.
- CSS motion tokens: `--overlay-circle-indicator-transition-duration: 2s`, `--feedback-bar_spring-timing-function: linear(0,0.2557852654830476,0.6458645876258154,0.9095268915259113,1.0245808646211791,1.0476124642696885,1.0341131417073979,1.015716678228077,1.0036998287863408,`, `--slide-up-from-bottom_duration: 150ms`, `--slide-up-from-bottom_easing: var(--feedback-bar_spring-timing-function)`, `--motion-springs-fast-duration: 451.75438596491193ms`, `--motion-springs-fast-easing: linear(0,0.18557241650572898,0.46530560393651493,0.6823338821577483,0.8223254801509006,0.9049744175651648,0.951288850000914,0.9763638545339052,0.989611863645082`, `--motion-springs-fast-source-mass: 1px`, `--motion-springs-fast-source-damping: 35px`, `--motion-springs-fast-source-stiffness: 300px`, `--motion-springs-standard-duration: 583.7719298245607ms`, `--motion-springs-standard-easing: linear(0,0.15794349142280711,0.4146686698630492,0.6303103850844771,0.7802275692100804,0.8751011408890221,0.9317564666924485,0.9642434451985746,0.982304925275802`, `--motion-springs-standard-source-mass: 1px`, `--motion-springs-standard-source-damping: 26px`, `--motion-springs-standard-source-stiffness: 175px`.
