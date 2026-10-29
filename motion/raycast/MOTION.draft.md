---
format: motion.md/v0
name: Raycast
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.raycast.com/, https://www.raycast.com/pro]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/raycast.summary.json
tokens:
  duration:
    d1: 200ms
    d2: 400ms
    d3: 300ms
    d4: 1500ms
  easing:
    e1: cubic-bezier(0.23, 1, 0.32, 1)
    e2: cubic-bezier(0.25, 0.1, 0.25, 1)
    e3: cubic-bezier(0.42, 0, 0.58, 1)
  stagger: 80ms
---

# Raycast motion

TODO thesis.

## Measurements

- Declared transitions: 1534 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 200ms ×639 (41%), 400ms ×503 (33%), 300ms ×334 (22%), 1500ms ×22 (1%), 100ms ×16 (1%), 500ms ×15 (1%).
- Easings (declared + hover): easeOutQuint ×980 (63%, out); ease ×420 (27%, in-out); ease-in-out ×128 (8%, in-out); easeOutQuart ×12 (1%, out); cubic-bezier(0.075, 0.82, 0.165, 1) ×5 (0%, out).
- Hover: 10/14 probes ran CSS motion; 4 moved or scaled; 6 colour-only; 0 had JS (rAF) hover motion, 0 of them changing transform. Median in 200ms, out 200ms.
- Load: 58 animations, median 700ms, max delay 1380ms | 1 animations, median 200ms, max delay 0ms.
- Scroll: 313 animations on 14 targets, median 400ms | 3 animations on 2 targets, median 200ms; reveals that move: 22, opacity-only: 247; JS (rAF) reveals: 0; scroll-driven: 0.
- Stagger gaps: 80, 150ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 10%, 5%. Overshoot easings applied: 0; defined in CSS: 2. linear() springs in CSS: 8.
- Infinite loops: 8, 21 (ezSJPa_rotating#, ezSJPa_x, hk#uka_blink, _#Keh#G_blink, m#tKeW_shimmer).
- Reduced motion: 9 CSS queries, load motion 110 → 114 | 9 CSS queries, load motion 18 → 18.
- Libraries: none detected.
- CSS motion tokens: `--spring-1: linear(0 0%, .005927 1%, .022466 2%, .047872 3%, .080554 4%, .119068 5%, .162116 6%, .208536 7.0%, .2573 8%, .3075 9%, .358346 10%, .409157 11%, .45935 12%, .50`, `--transition-length: 80px`, `--transition: all 1.8s cubic-bezier(.05, .9, .1, 1)`.
