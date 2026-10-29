---
format: motion.md/v0
name: The Browser Company (Arc, Dia)
summary: Colour-only hovers at 200ms, native scroll, no bounce; expo-out for anything that changes shape, and slow opacity entrances only where a page wants a moment.
source: measured
measured:
  date: 2026-10-29
  pages: [https://arc.net/, https://www.diabrowser.com/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/arc.summary.json
tokens:
  duration:
    quick: 200ms
    regular: 300ms
    reveal: 400ms
    entrance: 1000ms
  easing:
    standard: cubic-bezier(0.4, 0, 0.2, 1)
    out: cubic-bezier(0.16, 1, 0.3, 1)
    reveal: cubic-bezier(0.77, 0, 0.175, 1)
  stagger: 50ms
  distance: 11px
reduced-motion: crossfade
---

# The Browser Company (Arc, Dia) motion

The Browser Company's two sites share a temperament but not a codebase. On both, the
things you touch change colour in about 200ms and do not move, the wheel scrolls
natively, and no curve overshoots. Anything that changes shape (a panel sliding, a
lens resizing, a hero settling) uses an expo-out curve. The products then split.
arc.net is now "A farewell to Arc": a still letter with 128 transitioned elements, no
load motion at all, `ease` on colours and one token, `--ease: cubic-bezier(0.16,1,0.3,1)`,
on its product demo. diabrowser.com is a Tailwind site: 723 of 764 declared durations
are 200ms and 758 are `cubic-bezier(0.4, 0, 0.2, 1)`. Dia adds a JS hero entrance of
about 1s and opacity reveals at 400ms `easeInOutQuart`, staggered 50ms. Arc spends its
one long animation on a hand-drawn signature.

## Principles

1. **200ms for anything you touch.** 200ms is 753 of the declared and hover samples
   (82%). Arc's links drop to 150ms; nothing interactive runs past 300ms.
2. **Colour, not gesture.** 6 of 12 hover probes were colour-only. Dia transitions the
   six colour properties (`color`, `background-color`, `border-color`,
   `text-decoration-color`, `fill`, `stroke`) together on 119 elements.
3. **Expo-out for shape changes.** Arc's demo window (lens width, height, radius,
   panel transforms) runs 180–400ms on `cubic-bezier(0.16, 1, 0.3, 1)`, 41 samples.
   Dia's hero uses the near-identical `easeOutExpo` `cubic-bezier(0.19, 1, 0.22, 1)`.
4. **Opacity carries entrances; travel is small.** Dia's 46 WAAPI animations animate
   `opacity` only. Its JS reveals travel a median 11px. Arc's swap keyframes travel
   5–10px.
5. **No physics.** 0 overshoot curves applied, 0 defined, 0 `linear()` springs.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-quick` | `200ms` | colour hovers, button background, icon tint | 753 samples (82%), 723 on Dia |
| `--motion-regular` | `300ms` | larger state changes: active list items, accordions, arrow nudges | 64 samples (7%) |
| `--motion-reveal` | `400ms` | opacity reveal of a section's children (Dia) | 22 WAAPI animations, median 400ms |
| `--motion-entrance` | `1000ms` | hero headline and backdrop on load (Dia only) | 6 load animations, median 1000ms |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | every colour and opacity transition (Dia) | 762 samples (82%) |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | size, position and transform of UI (Arc) | 41 samples (4%); CSS token `--ease` |
| `--ease-reveal` | `cubic-bezier(0.77, 0, 0.175, 1)` | staggered section reveals (Dia) | 17 WAAPI animations (easeInOutQuart) |
| `--stagger` | `50ms` | between children of a revealing section | Dia WAAPI delays 0/50/100/150/200ms |

```css
:root {
  --motion-quick: 200ms;
  --motion-regular: 300ms;
  --motion-reveal: 400ms;
  --motion-entrance: 1000ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-reveal: cubic-bezier(0.77, 0, 0.175, 1);
  --stagger: 50ms;
}
```

On Arc, colour transitions use plain `ease` (114 samples, 12%), not `--ease-standard`.
If you are building in Arc's register, use `ease` for colour and `--ease-out` for
everything else.

## Patterns

### Hover and press

- Links: `text-decoration-color` (Arc, 150ms `ease`) or `color` (Dia, 200ms
  `--ease-standard`). Same timing out.
- Buttons: `background-color` and `color` over 200ms. Arc's import CTA also changes an
  icon's `filter` over 200ms `ease`. Dia's nav links change `opacity` over 200ms.
- Press: Arc declares `translate` and `box-shadow` at 80ms `ease` on 5 elements. This is
  a press-down state (basis: observed); press was not probed.
- Dia's primary CTA pill (`span.sunrise-cta-pill`) does move: `transform` 220ms and
  `box-shadow` 420ms, both on `cubic-bezier(0.22, 1, 0.36, 1)`. Its icon rotates or
  shifts over 200ms `easeOutCubic`. The direction of travel was not captured. Keep this
  to the one primary CTA.
- Arrow nudges: Dia links shift an inline arrow on group hover
  (`group-hover:translate-x-6`), 300ms `--ease-standard`.
- Arc's feature list: hovering an `article.feature` changes `opacity`, `scale` and
  horizontal `padding` over 300ms `ease`.

### Enter

- Arc's demo window swaps content with keyframes: `farewell-swap-next` (opacity 0,
  `translateX(10px)` to rest, 260ms `--ease-out`), `farewell-swap-prev`
  (`translateX(-10px)`), and `farewell-tag-swap` (`translateY(5px)`, 180ms `--ease-out`).
- Arc's lens and side panel resize and slide with `--ease-out`: lens `width`, `height`,
  `border-radius` and `transform` at 220ms, profile panel `transform` at 360ms, download
  bar `transform` at 400ms.
- Dia sections reveal as you reach them (in practice, when the hover probe scrolled
  them into view): children go `opacity 0 → 1` over `var(--motion-reveal)`
  `var(--ease-reveal)`, with delays of 0, 50, 100, 150 and 200ms. Some groups use
  `cubic-bezier(0.87, 0, 0.13, 1)` or `cubic-bezier(0.25, 0.1, 0.35, 1)` at 300–400ms
  instead.
- Dia's JS-driven cards scale in: `scale(0.95) → none` with opacity over about 350ms,
  and `scale(0.97) → none` over about 700ms (basis: observed from style mutations).

### Exit

- Not measured as a separate phase. Arc's swap keyframes only define the entering
  state. Dia's reveals were not seen reversing. Mirror the enter at the same duration
  (basis: observed).

### Page load

- **Arc:** none. 0 load animations on arc.net. The letter is just there.
- **Dia:** `main.page-enter` fades `opacity 0 → 1` over 400ms on
  `cubic-bezier(0.87, 0, 0.13, 1)`. The hero then resolves via WAAPI and rAF:
  - headline `h1`: opacity, 1000ms `cubic-bezier(0.19, 1, 0.22, 1)`;
  - `div.origin-bottom`: 1200ms, same curve;
  - backdrop `div.absolute.inset-0`: opacity CSS transition, 1000ms
    `cubic-bezier(0, 0, 0.2, 1)`;
  - JS elements: `opacity 0 → 1` with `translateY(21.7px)`, `translateY(11.2px)` or
    `translateY(75.2px)` to `none`, or `scale(0.972) → none`. They take about 1.2–1.6s
    (median 1396ms). All start together, with a max delay of 0ms.

### Scroll

- Native on both pages: a 400px wheel tick settled in 0ms. Dia declares
  `scroll-behavior: smooth` once in CSS, but the root is `auto`, so it applies to
  in-page anchors, not the wheel.
- Arc has no reveal system. Scroll motion ran on 4 targets, and 38 of 43 events were
  the signature (see Stagger).
- Dia reveals content by opacity (see Enter). One element moves at a parallax rate
  (`translateY(-122.5px) → -140px` during a scroll step), and one decorative element
  drifts with `opacity: 0.7` (basis: observed). 0 scroll-driven CSS animations.

### Stagger

- Dia: 50ms between children of a section, at 400ms per child.
- Arc: the farewell signature is 38 `img.hero-signature` frames, each `opacity` over
  700ms `ease`, at a 90ms step (0–3330ms). This draws the handwriting. It is an
  illustration, not a list stagger. Do not reuse 90ms for UI.

### Loops

- 0 infinite CSS animations ran on either page.
- Dia runs a JS marquee: 10 elements tick `translateX` continuously, about 648 style
  writes each over the session. Its CSS also defines `marqueeL/R/U/D`, `spin`, `pulse`,
  `chroma-sweep` and `app-tour-caret-blink`, which were not seen running.
- Arc defines a `background-position` sweep from -800px to 800px (`k-coDfUB`), which
  reads as a shimmer (basis: observed). It was not seen running.
- UI chrome does not loop on either product.

## Never

- **Never bounce or overshoot.** 0 overshoot curves applied and 0 defined across both
  pages, and 0 `linear()` springs.
- **Never lift cards on hover.** 6 of 12 probes were colour-only. The only transform
  hovers were Arc's demo lens, Dia's single CTA pill and arrow nudges. No card or tile
  translated up.
- **Never hijack the wheel.** Native scroll on both (0ms settle). No Lenis, GSAP or
  smooth-scroll library detected.
- **Never 300ms as the default.** The default is 200ms (82%). 300ms is 7%, kept for
  larger state changes. Note that Dia's default curve, material-standard, is in-out
  shaped, so "never ease-in-out" does not hold here.
- **Never fade sections *up* on scroll.** Reveals are opacity: 46 opacity-only against 3
  that move, and JS travel is a median 11px. Arc does not reveal sections at all.
- **Avoid `transition: all`.** 0% on Arc. On Dia, 9 elements declare `all 0.3s` (1%).
  Name the properties.

## Reduced motion

- Arc ships 1 `prefers-reduced-motion` query, Dia 5.
- Dia: load motion fell from 123 to 19 events under `reduce`. 4 WAAPI animations
  survived, all `opacity`, and the JS translate and scale stopped. Keep opacity and drop
  travel and scale.
- Arc: load motion went from 0 to 141 under `reduce` (10 transition events, 131 style
  writes). The reduced run has more motion than the full run. This is measurement noise
  from the demo window's timing, not evidence that Arc adds motion. Treat Arc's
  reduced-motion behaviour as unmeasured.

## Measurements

- Declared transitions on 892 elements across 2 pages (Arc 128, Dia 764).
- Durations (declared + hover): 200ms ×753 (82%), 300ms ×64 (7%), 700ms ×38 (4%,
  all Arc signature), 150ms ×17 (2%), 220ms ×15 (2%), 80ms ×10 (1%).
- Easings (declared + hover): material-standard `cubic-bezier(0.4, 0, 0.2, 1)` ×762
  (82%, Dia); `ease` ×114 (12%, Arc); expoOut `cubic-bezier(0.16, 1, 0.3, 1)` ×41 (4%,
  Arc); `cubic-bezier(0.22, 1, 0.36, 1)` ×4; easeOutCubic ×2.
- Hover: 12 probes (Arc 5, Dia 7, of which 1 timed out); 10 ran CSS motion, 3 moved or
  scaled, 6 were colour-only. Probe medians: in 200/200ms, out 150/200ms (Arc / Dia).
  8 probes had JS hover motion, 7 of them transform. On Dia this is confounded by the
  always-running JS marquee.
- Load: Arc 0 animations. Dia 6 (median 1000ms, max delay 0ms), plus 3 JS reveals
  (median 1396ms, 11.2px).
- Dia WAAPI: 46 animations on 23 targets, all `opacity`. 400ms ×22, 300ms ×14.
  easeInOutQuart ×17, `cubic-bezier(0.87, 0, 0.13, 1)` ×9.
- Scroll: Arc 43 animations on 4 targets (median 700ms, signature). Dia 21 on 8
  targets (median 300ms). Reveals that move: 3; opacity-only: 46; JS reveals: 6;
  scroll-driven: 0.
- Stagger gaps: 90ms (Arc signature, 38 items); 50ms (Dia WAAPI reveals).
- Wheel scroll: native (0ms) on both.
- `transition: all` share: 0% (Arc), 1% (Dia). Overshoot easings applied: 0; defined
  in CSS: 0. `linear()` springs: 0.
- Infinite CSS loops: 0 and 0. Dia has a JS marquee of 10 elements.
- Reduced motion: Arc 1 query, load motion 0 → 141 (noisy). Dia 5 queries, 123 → 19.
- Libraries: none detected. Dia page has 4 videos and 1 canvas.
- CSS motion tokens: `--ease: cubic-bezier(0.16,1,0.3,1)` (Arc). Dia has none.
- Keyframes: Arc `farewell-swap-next`, `farewell-swap-prev`, `farewell-tag-swap`,
  `farewell-fade-in`, `k-lFWJD`, `k-coDfUB`. Dia `page-enter`, `marqueeL/R/U/D`,
  `diaMarqueeL/R`, `spin`, `pulse`, `pulse-scale`, `chroma-sweep`,
  `chroma-expand-bidirectional`, `fade-to-black-sweep`, `app-tour-caret-blink`.
- **Not measured:** the Arc and Dia browser apps themselves (arc.net is now a farewell
  letter, not the original Arc product page); press and focus states; open and close
  durations of menus and dialogs; direction of travel on Dia's CTA pill; the contents of
  Dia's videos and canvas; and touch behaviour.
