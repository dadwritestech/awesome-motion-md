---
format: motion.md/v0
name: Stripe
summary: TODO
source: measured
measured:
  date: 2026-10-29
  pages: [https://stripe.com/, https://stripe.com/payments]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/stripe.summary.json
tokens:
  duration:
    d1: 300ms
    d2: 150ms
    d3: 240ms
    d4: 800ms
  easing:
    e1: cubic-bezier(0.25, 1, 0.5, 1)
    e2: cubic-bezier(0.215, 0.61, 0.355, 1)
    e3: cubic-bezier(0, 0, 1, 1)
  stagger: 50ms
---

# Stripe motion

TODO thesis.

## Measurements

- Declared transitions: 1852 entries (one per property per element) across 2 pages.
- Durations (declared + hover): 300ms ×843 (39%), 150ms ×778 (36%), 240ms ×84 (4%), 800ms ×75 (3%), 500ms ×70 (3%), 250ms ×64 (3%).
- Easings (declared + hover): cubic-bezier(0.25, 1, 0.5, 1) ×784 (36%, out); easeOutCubic ×676 (31%, out); linear ×137 (6%, linear); easeOutQuart ×113 (5%, out); cubic-bezier(0.33, 1, 0.68, 1) ×80 (4%, out).
- Hover: 29/35 probes ran CSS motion; 23 moved or scaled; 4 colour-only; 10 had JS (rAF) hover motion, 7 of them changing transform. Median in 300/250ms, out 300/150ms.
- Load: 130 animations, median 325ms, max delay 550ms | 104 animations, median 150ms, max delay 300ms.
- Scroll: 288 animations on 41 targets, median 500ms | 163 animations on 53 targets, median 300ms; reveals that move: 220, opacity-only: 130; JS (rAF) reveals: 0; scroll-driven: 1.
- Stagger gaps: 50ms.
- Wheel scroll: native (0ms), native (0ms).
- `transition: all` share: 0%, 2%. Overshoot easings applied: 0; defined in CSS: 0. linear() springs in CSS: 0.
- Infinite loops: 0, 22 (PaymentsHeroAnimationLinkSpinnerAnimation, rotating, ProductFeatureCardRotateOne, ProductFeatureCardRotateTwo, paymentsUptimeGraphicBackgroundAnimation).
- Reduced motion: 86 CSS queries, load motion 548 → 340 | 31 CSS queries, load motion 239 → 235.
- Libraries: none detected.
- CSS motion tokens: `--hds-accordion-duration: 0.36s`, `--hds-accordion-ease: cubic-bezier(0.65,0.05,0.36,1)`, `--cross-toggle-duration: var(--hds-accordion-duration)`, `--cross-toggle-ease: var(--hds-accordion-ease)`, `--hds-resource-card-duration: 300ms`, `--hds-resource-card-easing: cubic-bezier(0.46,0.03,0.52,0.96)`, `--hds-chippy-transition-duration: 300ms`, `--hds-chippy-easing: cubic-bezier(0.46,0.03,0.52,0.96)`, `--hds-toggle-tabs-duration: 220ms`, `--hds-toggle-tabs-easing: cubic-bezier(0.45,0.05,0.55,0.95)`, `--navigation-easing: cubic-bezier(0.45,0.05,0.55,0.95)`, `--navigation-duration: 0s`, `--navigation-duration-slow: 0s`, `--navigation-hamburger-duration: 0s`.
