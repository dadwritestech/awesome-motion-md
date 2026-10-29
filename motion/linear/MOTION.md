---
format: motion.md/v0
name: Linear
summary: Fast, quiet, colour-first motion. 100–160ms easeOutQuad on everything you touch, and one slow blurred entrance for the headline.
source: measured
measured:
  date: 2026-10-29
  pages: [https://linear.app/, https://linear.app/features]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/linear.summary.json
tokens:
  duration:
    instant: 100ms
    quick: 160ms
    regular: 250ms
    entrance: 1000ms
  easing:
    out: cubic-bezier(0.25, 0.46, 0.45, 0.94)
    sheet: cubic-bezier(0.32, 0.72, 0, 1)
    entrance: ease
  stagger: 33ms
  distance: 20%
reduced-motion: crossfade
---

# Linear motion

Linear's interface barely moves, and that is the point. Across 669 declared transitions
(one per property per element), 88% of durations are 100ms or 160ms and 77% of curves are
one easing, `easeOutQuad`. When you hover something, it changes colour, brightness or
background, but it does not move: 3 of 33 hover probes changed transform. The one
place Linear takes its time is the hero headline, which resolves from a blur over a
full second, one line every 33ms. Everything else feels instant because it nearly is.

## Principles

1. **Two speeds for interaction.** 100ms (50% of samples) and 160ms (38%). Nothing a
   user touches takes longer than 250ms.
2. **One curve.** `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuad) on 561 of 727
   samples. Do not mix curves inside a component.
3. **Hover is a colour change, not a gesture.** 11 of 33 hovered elements changed
   colour only, and most of the rest changed `filter` or `background`. No lifts, no
   scale-ups, no shadows growing.
4. **Symmetric in and out.** Hover-in and hover-out medians were identical on both
   pages (100–160ms). Linear does not use a slow-in, fast-out split.
5. **Spend motion once.** The only long animation on the page is the headline
   entrance (1000ms). Sections do not fade up as you scroll.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-instant` | `100ms` | colour, background, border, icon tint | 368 samples (50%) |
| `--motion-quick` | `160ms` | hover filter/brightness, opacity of small UI | 276 samples (38%) |
| `--motion-regular` | `250ms` | panels, menus, anything that changes size on screen | CSS token `--speed-regularTransition: .25s` |
| `--motion-entrance` | `1000ms` | hero headline only | 44 load animations, median 1000ms |
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | every interaction | 561 samples (77%); CSS token `--ease-out-quad` |
| `--ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | drawers and bottom sheets | 9 declarations (vaul drawer) |
| `--ease-entrance` | `ease` | hero entrance | 30 load animations |
| `--stagger` | `33ms` | between hero headline lines | 3 groups of 6 lines, 33ms gap each |

```css
:root {
  --motion-instant: 100ms;
  --motion-quick: 160ms;
  --motion-regular: 250ms;
  --motion-entrance: 1000ms;
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-entrance: ease;
  --stagger: 33ms;
}
```

## Patterns

### Hover and press

- Links, nav items, list rows: `color` or `background-color` over
  `var(--motion-instant) var(--ease-out)`. Same timing on the way out.
- Cards and image tiles: `filter: brightness(1.1)` or a background tint over
  `var(--motion-quick) var(--ease-out)`. Do not move, scale, or add a shadow.
- Buttons: background colour only, `var(--motion-instant)`. Press state is an instant
  colour change, with no scale.
- Name the properties. Linear's `transition: all` share is 0–1%.

### Enter

- Tooltips and context menus: `opacity 0 → 1` with `transform: scale(0.9) → scale(1)`
  (keyframes `tooltipOpen`, `contextMenuIn`). Origin at the trigger.
- Dialogs: `opacity 0 → 1` with `scale(0.96) → scale(1)` (keyframe `scaleIn`).
- Drawers and sheets: slide from the edge, `translate3d(0, 100%, 0) → 0`, on
  `var(--ease-sheet)`.
- Durations for these keyframes were not captured, because none opened during the
  measurement. Use `var(--motion-quick)` for tooltips and menus and
  `var(--motion-regular)` for dialogs (basis: observed).

### Exit

- The mirror of the enter: `tooltipClose`, `contextMenuOut` and `scaleOut` reverse
  the scale and opacity. Exits are never more elaborate than enters.

### Page load

- Only the hero headline animates. Each line goes from `opacity: 0`,
  `filter: blur(10px)`, `transform: translateY(20%)` to rest.
- Duration `var(--motion-entrance)`, easing `ease`, first delay 400ms, then +33ms per
  line. Measured from `Element.animate()` calls.
- Supporting copy and product shots fade in with `opacity` and `ease-out` (124 of
  148 load animations on /features). They do not slide.

### Scroll

- Scrolling is native: one 400px wheel tick settled in under a frame on both pages.
  Do not add smooth-scroll libraries.
- No scroll-reveal system. Scroll motion ran on only 5 elements across the homepage,
  and those were illustration loops, not section reveals. Content is already there
  when you reach it.

### Stagger

- 33ms between headline lines. That is fast enough to read as one gesture.
- Do not stagger lists, cards or grid items on load.

### Loops

- Infinite animations exist only inside product illustrations: dot-grid art (`steps(1)`)
  and a blinking text cursor. UI chrome never loops: no pulsing badges, no shimmer on
  buttons.

## Never

- **Never lift on hover.** 0 of 33 probes translated up; 3 changed transform at all.
  Generic AI motion adds `translateY(-2px)` and a bigger shadow to every card.
- **Never use overshoot or bounce on UI.** 0 overshoot curves were applied to UI
  elements. The two overshoot curves in the CSS belong to an illustration's keyframes.
- **Never use 300ms `ease-in-out` as the default.** Linear's default is 100–160ms
  `easeOutQuad`. `ease-in-out` did not appear in the top five curves.
- **Never fade sections up on scroll.** Scroll reveals ran on 5 targets, none of them
  content sections.
- **Never smooth-scroll.** Wheel scroll is native.
- **Never `transition: all`.** 0% and 1% of declared transitions.

## Reduced motion

- Linear ships 91–92 `prefers-reduced-motion` queries per page.
- Under `reduce`, measured load motion dropped from 323 to 245 events on the homepage
  and from 190 to 174 on /features. Colour transitions stay; the headline still fades
  in, without blur or travel.
- For your build: keep colour and opacity transitions, and drop `transform` and
  `filter` from entrances.

## Measurements

- 669 declared transitions (one per property per element) across 2 pages.
- Durations (declared + hover): 100ms ×368 (50%), 160ms ×276 (38%), 700ms ×30 (4%), 400ms ×25 (3%), 200ms ×17 (2%), 150ms ×8 (1%).
- Easings (declared + hover): easeOutQuad ×561 (77%); ease ×93 (13%); ease-out ×35 (5%); cubic-bezier(0.32, 0.72, 0, 1) ×30 (4%); easeOutQuart ×7 (1%).
- Hover: 23 of 33 probes ran CSS motion; 3 moved or scaled; 11 were colour-only. 3 had JS hover motion. Per-probe medians: in 160/100ms, out 160/100ms (homepage / features).
- Load: 44 animations (median 1000ms) on the homepage; 148 (median 700ms) on /features.
- Hero: `opacity [0,1]`, `filter [blur(10px), blur(0px)]`, `transform [translateY(20%), translateY(0%)]`, 1000ms, `ease`, delay 400/433/466ms…
- Wheel scroll: native on both pages.
- Infinite loops: 82 and 16, all in illustrations (grid-dot art, cursor blink).
- CSS motion tokens: `--speed-quickTransition: .1s`, `--speed-regularTransition: .25s`, `--speed-highlightFadeOut: .15s`, and the full Penner `--ease-in-*` / `--ease-out-*` set.
- **Not measured:** the logged-in Linear app, which needs an account; open and close durations of menus, dialogs and tooltips, which did not open; and touch behaviour.
