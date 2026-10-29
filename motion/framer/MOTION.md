---
format: motion.md/v0
name: Framer
summary: Spring-timed JavaScript motion with no CSS transitions. One critically damped spring at 400ms for text and small UI, 600ms for hover dimming and 1000ms for section fades, with 50ms word staggers that resolve out of a blur.
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.framer.com/, https://www.framer.com/motion/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/framer.summary.json
tokens:
  duration:
    quick: 400ms
    regular: 600ms
    slow: 1000ms
  easing:
    spring: linear(0, 0.024, 0.0823, 0.1594, 0.2448, 0.3315, 0.4152, 0.4934, 0.5646, 0.6282, 0.6844, 0.7334, 0.7758, 0.8122, 0.8432, 0.8694, 0.8916, 0.9102, 0.9258, 0.9388, 0.9496, 0.9586, 0.966, 0.9722, 0.9772, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1)
    spring-soft-overshoot: linear(0, 0.0235, 0.083, 0.1647, 0.2582, 0.3557, 0.4517, 0.5423, 0.6252, 0.6991, 0.7636, 0.8186, 0.8647, 0.9025, 0.933, 0.9571, 0.9756, 0.9895, 0.9996, 1.0065, 1.0111, 1.0137, 1.0149, 1.0151, 1.0146, 1.0136, 1.0123, 1.0108, 1.0093, 1.0079, 1.0066, 1.0053, 1.0043, 1.0033, 1.0025, 1.0019, 1.0013, 1.0009, 1.0006, 1)
  stagger: 50ms
  distance: 10px
reduced-motion: crossfade   # basis: observed; 0 CSS queries, JS load motion cut by 37%
---

# Framer motion

Framer's homepage moves entirely in JavaScript. Of 3,821 elements scanned, one has a
CSS transition. Every other measured animation is a Framer Motion `Element.animate()`
call. These calls carry springs that were baked into `linear()` curves. The curve
shape is the same at every duration: it reaches about 95% of the travel at half time
and does not overshoot. Only the duration changes. Durations are 400ms for headline words and small UI,
600ms for hover, and 1000ms for content blocks. Text arrives word by word out of a
blur, 50ms apart. Content blocks fade in 100ms apart. Hovering a card does not move
it. Instead, its siblings dim and shrink slightly. The page is busy, with marquees,
pulses and staggered reveals, but each piece settles softly.

## Principles

1. **Springs, not béziers.** 135 of 141 WAAPI calls on the homepage used a `linear()`
   spring. The 30-, 40-, 50-, 60- and 100-stop curves are one spring resampled to
   300ms, 400ms, 500ms, 600ms and 1000ms. At 50% of the time, each is at 0.947–0.952.
2. **Three durations.** 400ms (69 calls), 600ms (34) and 1000ms (28) cover 131 of
   141 WAAPI calls.
3. **No overshoot you can see.** The springs stop at exactly 1. One variant peaks at
   1.0151, a 1.5% overshoot. It ran 11 times, on opacity and filter, so it cannot
   be seen as a bounce.
4. **Focus by subtraction.** On hover, the hovered card stays still. Its 8 siblings
   go to `opacity: 0.4` and `scale(0.95)` over 600ms, and come back over the same
   600ms.
5. **Stagger everything that enters.** Headline words step 50ms (25 words, 0 to
   1200ms delay). Content blocks step 100ms (9 blocks on load, 5 on scroll).

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-quick` | `400ms` | headline words, link hover opacity, small fades | 69 of 141 WAAPI calls; 54 of 74 load animations |
| `--motion-regular` | `600ms` | hover dim and scale of sibling cards, in and out | 34 WAAPI calls, all hover |
| `--motion-slow` | `1000ms` | content blocks, scroll fades, JS reveals | 28 WAAPI calls; 33 JS reveals, median 999ms |
| `--ease-spring` | 40-stop `linear()` (frontmatter) | everything; reuse the same curve at any duration | 135 of 141 WAAPI calls are this spring at some length |
| `--ease-spring-soft` | 40-stop `linear()` peaking at 1.0151 | opacity and filter on hover-state swaps only | 11 calls |
| `--stagger` | `50ms` | words in a headline | 25 spans, delays 0–1200ms in 50ms steps |
| `--stagger-block` | `100ms` | cards and blocks in a section | 9 load blocks (100–900ms), 5 scroll blocks (1600–2000ms) |
| `--reveal-distance` | `10px` | JS reveals, `translateY` to 0 | 33 elements, median 10px; some start at 20px |

```css
:root {
  --motion-quick: 400ms;
  --motion-regular: 600ms;
  --motion-slow: 1000ms;
  --ease-spring: linear(0, 0.024, 0.0823, 0.1594, 0.2448, 0.3315, 0.4152, 0.4934, 0.5646, 0.6282, 0.6844, 0.7334, 0.7758, 0.8122, 0.8432, 0.8694, 0.8916, 0.9102, 0.9258, 0.9388, 0.9496, 0.9586, 0.966, 0.9722, 0.9772, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1);
  --ease-spring-soft: linear(0, 0.0235, 0.083, 0.1647, 0.2582, 0.3557, 0.4517, 0.5423, 0.6252, 0.6991, 0.7636, 0.8186, 0.8647, 0.9025, 0.933, 0.9571, 0.9756, 0.9895, 0.9996, 1.0065, 1.0111, 1.0137, 1.0149, 1.0151, 1.0146, 1.0136, 1.0123, 1.0108, 1.0093, 1.0079, 1.0066, 1.0053, 1.0043, 1.0033, 1.0025, 1.0019, 1.0013, 1.0009, 1.0006, 1);
  --stagger: 50ms;
  --stagger-block: 100ms;
  --reveal-distance: 10px;
}
```

The 40-stop spring is accurate enough at 1000ms. Framer itself uses 100 stops at that
length (basis: observed; the 40- and 100-stop curves differ by under 0.01 at 10%,
25%, 50% and 75%).

## Patterns

### Hover and press

- Nav and text links: `opacity` over 300–400ms on `var(--ease-spring)`, the same
  duration in and out (probes 3, 4 and 7: 300/300ms, 400/400ms, 400/400ms).
- Card grids: when one card is hovered, the 8 sibling cards animate to `opacity: 0.4`,
  `transform: scale(0.95)` and a `filter` change over `var(--motion-regular)`
  `var(--ease-spring)`. On leave, they return over the same 600ms. The hovered card
  itself does not change transform.
- One hover-out used `cubic-bezier(0.25, 0.1, 0.35, 1)` at 300ms. It is a single
  sample, so do not adopt it.
- Press states were not probed.

### Enter

- Content blocks: `opacity` 0 → 1 over `var(--motion-slow)` `var(--ease-spring)`, with
  each block `var(--stagger-block)` after the previous one.
- JS reveals: `opacity` 0 → 1 with `translateY(10px)` → `none` (sometimes 20px), over
  about 1000ms. 33 elements did this on load.
- Small panels and images: `opacity` over 500ms (3 calls) or 650ms (1 call) on the
  same spring.

### Exit

- None measured as a distinct pattern. Hover exits mirror their enters at the same
  duration and curve. No dialogs or menus opened.

### Page load

- Headline: each word (`span`) animates `opacity` and `filter` together over
  `var(--motion-quick)` `var(--ease-spring)`. Delays go 0, 50, 100 … 1200ms, so 25
  words take 1600ms in total. The blur radius was not captured, because WAAPI
  keyframes were not recorded.
- Below the hero: 9 blocks fade in over 1000ms with delays of 100–900ms. Two
  containers do `opacity` + `transform` over 1000ms with linear easing, one delayed
  350ms.
- Load is the busiest phase, with 74 WAAPI calls on 18 targets and 3,376 inline-style
  mutations.

### Scroll

- Scrolling is native. A 400px wheel tick settled in 0ms. Do not add a smooth-scroll
  library.
- Sections fade in as they arrive. 11 of 13 WAAPI scroll animations were opacity-only
  (400ms or 1000ms, spring), and 2 were `filter`. There are no scroll-linked
  timelines (`scrollDrivenAnimations: 0`).
- The JS reveals with a 10px rise also fire as content enters. They were seen when a
  hover probe scrolled the page. Treat a 10px fade-up as part of Framer's vocabulary.
- Scroll-phase JS motion was almost all lost to the mutation cap (18 mutations
  recorded). Treat the scroll counts as lower bounds.

### Stagger

- Words: 50ms (8 groups detected, median gap 50ms).
- Blocks: 100ms (5 items, `div.framer-1ghbx3c` group; 9 load blocks).
- Delays grow linearly and are not eased.

### Loops

- `ghostFlow`: a CSS `opacity` animation on 16 `span`s, 750ms, linear, infinite. It
  appears to be a placeholder or "thinking" text shimmer (basis: observed).
- One element pulses in JS between `scale(0.1)` and `scale(0.6)` with changing opacity
  through every phase of the run (illustration, basis: observed).
- A ticker keeps translating in `translateY` (about −1,280px → −1,340px during one
  probe). A 10000ms linear opacity call also ran on load.
- CSS also defines `shimmer` (background-position sweep), `__framer-blink-input` and
  `__framer-editorbar-spinner-spin`. These are editor and skeleton chrome. None ran
  on the marketing page.
- UI buttons and nav do not loop.

## Never

- **Never lift the hovered element.** 0 of 9 successful homepage probes changed
  the hovered element's transform. The only hover-time transforms were the sibling
  `scale(0.95)` dim and ambient loops that were already running. (15 further probes
  timed out.)
- **Never bounce.** No overshoot curves in CSS. The largest spring overshoot is
  1.5%, and only on opacity and filter.
- **Never write CSS transitions for this motion.** 1 of 3,821 elements declares a
  transition (`all 0.3s ease-in-out`). Everything else runs on WAAPI with
  `linear()` springs. Do not copy that one transition. It is the generic default and
  not part of the system.
- **Never ease with `ease-in-out`.** 0 WAAPI calls used it. The only `ease-in-out` is
  the single stray CSS transition above.
- **Never smooth-scroll.** Wheel scroll is native (settle 0ms).

## Reduced motion

- framer.com ships 0 `prefers-reduced-motion` CSS queries. Any handling happens in
  JavaScript.
- Under `reduce`, load-time motion fell from 3,466 to 2,199 events (−37%). WAAPI
  calls in the reduced load were 25, against 74 load-phase calls in the full run. CSS
  animations, mostly `ghostFlow`, were 40.
- Which properties survive was not recorded. Opacity is the most likely, because 93
  of 141 full-run calls animate it (basis: observed).
- For your build: keep opacity fades on the spring, and drop the `filter` blur, the
  10px rise and the sibling `scale(0.95)`.

## Measurements

- Homepage (framer.com): 1 element with a declared transition (`all 0.3s ease-in-out`).
  WAAPI calls: 141 on 41 targets, median 400ms. Durations: 400ms ×69, 600ms ×34,
  1000ms ×28, 300ms ×3, 500ms ×3, 650ms ×1, 800ms ×1 (`steps(1, end)`), 10000ms ×1.
- Easings (WAAPI): `linear()` springs ×135 (40 stops ×65, 60 ×34, 100 ×24, 50 ×3,
  30 ×2, plus 2-stop/65-stop singles); linear ×9; steps ×1.
- Hover: 24 probes attempted, 9 succeeded, 5 ran motion, 0 moved the hovered element.
  No CSS `transitionrun` events fired on hover. All hover motion was WAAPI. In/out
  durations: 600/600ms (17 calls each way), 400/400ms, 300/300ms; 8 hover-out calls
  at 1000ms were section fades set off by scrolling.
- The summary's "JS hover transform on 9/9 probes" comes from ambient loops (a
  scale pulse, a ticker, static rotations) and is not hover motion.
- Load: 74 animations on 18 targets, median 400ms, max delay 1200ms. Properties:
  opacity 44, filter 25, transform 5. JS reveals: 33 elements, median 999ms, 10px.
- Scroll: 13 WAAPI animations on 9 targets, median 1000ms. 11 opacity-only, 0 with
  transform. Stagger 100ms.
- Stagger gaps: 50ms (words), 100ms (blocks).
- Wheel scroll: native (0ms).
- Overshoot: 0 cubic-bézier overshoots in CSS. 1 spring with a peak of 1.0151.
- Infinite loops: 16 (`ghostFlow`, 750ms linear).
- Reduced motion: 0 CSS queries, load motion 3,466 → 2,199.
- Libraries: Framer Motion.
- Style-mutation observer hit its 20,000 cap. Hover probes 8 and 9 alone logged
  6,152 mutations, so scroll-phase JS motion is mostly missing and all JS counts are
  lower bounds.
- **Second page is not Framer.** https://www.framer.com/motion/ redirected to
  https://motion.dev/, the separately branded Motion library site. It was measured
  (211 elements with CSS transitions, 200ms ×105 / 150ms ×58, `ease` ×166,
  `cubic-bezier(0.25, 1, 0.5, 1)` ×21, `cubic-bezier(0.16, 1, 0.3, 1)` ×13, hover
  in/out median 150/150ms, 4 of 22 probes moved, 21 reduced-motion queries, 230 → 222
  load events). It is left out of every token and pattern above. The draft's 200ms /
  150ms / `ease` tokens came from this page.
- CSS motion tokens: none for timing. The `--cl-motion*` and `--motion-plus-*`
  variables on motion.dev are colours and sizes.
- **Not measured:** the Framer editor and published Framer sites; any other
  framer.com page; WAAPI keyframe values (blur radius, exact opacity targets);
  menus, dialogs and press states; touch; and scroll-phase JS motion after the
  mutation cap.
