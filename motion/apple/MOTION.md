---
format: motion.md/v0
name: Apple
summary: Arrive in 320ms, leave in 240ms, on soft symmetric curves. Navigation does most of the moving, menu items cascade 20ms apart, and content stays put while you scroll.
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.apple.com/, https://www.apple.com/iphone/]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/apple.summary.json
tokens:
  duration:
    instant: 100ms
    exit: 240ms
    regular: 320ms
    entrance: 900ms
  easing:
    ease: ease
    standard: cubic-bezier(0.4, 0, 0.6, 1)
    out: cubic-bezier(0, 0, 0.5, 1)
  stagger: 20ms
  distance: 4px
reduced-motion: instant
---

# Apple motion

Apple's site runs on two clocks: 320ms to arrive and 240ms to leave. Together they
cover 69% of 1,931 elements with declared transitions. The curves are soft and
symmetric, `ease` (56%) and `cubic-bezier(0.4, 0, 0.6, 1)` (31%). There is no snappy
ease-out default here. Most of the motion is in navigation, not content. Opening a
global-nav flyout fades and slides its items in one after another, 20ms apart. Link
colours cross-fade over 320ms. Product cards move on hover over 300ms. Scrolling is
native, and sections do not fade up as they enter. The one slow entrance is on
/iphone, where the chapter nav and a group of elements settle over 700–900ms,
150ms apart.

## Principles

1. **Arrive slower than you leave.** Hover-in median is 320ms and hover-out median
   is 240ms on the homepage (61 and 67 events). The flyout's items enter at 320ms and
   leave at 240ms with no delay.
2. **Two curves, both symmetric.** `ease` on 1,171 samples (56%) and
   `cubic-bezier(0.4, 0, 0.6, 1)` on 657 (31%). Use `ease` for things that move and
   the 0.4/0.6 curve for colour, opacity and height.
3. **Cascade fast.** Menu items, search results and index links stagger in 20ms
   steps. The CSS has `--motion-delay-rapid: 20ms`, `--motion-delay-short: 40ms`
   and `--motion-delay-medium: 80ms`.
4. **Exits get shorter down the list.** Closing search runs
   `globalnav-search-fade-and-slide-to-close` at 160, 140, 120, 100, 80 and 60ms, one
   item each. Flyout items leave at 240 down to 160ms.
5. **Small travel.** The keyframes move 4px (`link-in`, `globalnav-chevron-slide-in-hover`)
   or 8px (`chapternav-slidein`, `globalnav-flyout-slide-forward-next`). The largest
   measured travel is 30px, on /iphone's JS load reveal.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-instant` | `100ms` | small control fills: paddle arrows, gallery dot buttons, play/pause | 80 samples (4%); hover probes on `paddlenav-arrow`, `dotnav-iconcontrol` |
| `--motion-exit` | `240ms` | hover-out, menu close, flyout height, captions | 552 samples (30%); `--r-globalnav-duration-medium: .24s`, `--captions-selector-transition-duration: 240ms` |
| `--motion-regular` | `320ms` | link colour, menu item enter, curtain fade | 737 samples (39%); `--motion-duration-long: 320ms`, `--r-localnav-menu-link-transition-duration: 320ms` |
| `--motion-entrance` | `900ms` | page-load settle on /iphone only | `chapternav-fadein` 900ms ×10; 16 JS reveals of about 870–885ms; `--staggered-opacity-duration: 0.9` |
| `--ease` | `ease` | menu items, index links: anything with opacity + transform | 1,171 samples (56%) |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.6, 1)` | colour, curtain/scrim opacity, flyout height, search results | 657 samples (31%); used in `--r-localnav-curtain-transition` and `--captions-selector-transition-easing` |
| `--ease-out` | `cubic-bezier(0, 0, 0.5, 1)` | card hover, chapter-nav icon hover | 62 samples (3%); `--card-transition-transform`, `--chapternav-paddle-hover-timing-function` |
| `--stagger` | `20ms` | between items in menus, search results, index lists | flyout delays 80→320ms in 20ms steps; 5 search results 20ms apart; `link-in` delays 280→560ms in 20ms steps |

```css
:root {
  --motion-instant: 100ms;
  --motion-exit: 240ms;
  --motion-regular: 320ms;
  --motion-entrance: 900ms;
  --ease: ease;
  --ease-standard: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-out: cubic-bezier(0, 0, 0.5, 1);
  --stagger: 20ms;
}
```

## Patterns

### Hover and press

- Text links (global nav, footer, close buttons): `color` over
  `var(--motion-regular) var(--ease-standard)`, with the same timing on the way out.
  232 elements on /iphone declare exactly `color 0.32s cubic-bezier(0.4, 0, 0.6, 1)`.
- Product cards (`div.card.tile`, `a.product-tile-image-link`): `transform` over
  `300ms var(--ease-out)`, symmetric in and out (`--card-transition-transform`).
  Card background changes over `0.344s ease` (`--card-transition-background`).
  Apple cards do move on hover. The extractor recorded the transition but not the
  transform value, so do not guess between lift and scale.
- Chapter-nav icons: `scale` with link `color`, `300ms var(--ease-out)`.
- Small icon buttons (gallery dots, paddle arrows, play/pause): `background-color`,
  `color` and `fill` over `var(--motion-instant) linear`.
- Global-nav flyout on hover: the curtain fades in over
  `var(--motion-regular) var(--ease-standard)` with an 80ms delay. The panel's
  `height` and `background-color` change over 242ms `var(--ease-standard)`. The
  header and items fade and slide in over `var(--motion-regular) ease`, delayed
  80ms, then +20ms per item up to 320ms.
- Press states were not probed.

### Enter

- Menu and list items: `opacity 0 → 1` with a short slide. `link-in` uses
  `translateY(-4px) → 0` at 320ms `ease` with a 20ms stagger. Flyout panels slide
  in sideways with `translate(8px) → 0` (`globalnav-flyout-slide-forward-next`).
- Search results: `globalnav-search-fade-and-slide` at 320ms
  `var(--ease-standard)`, delay 200ms, then +20ms per result.
- Chevrons: `globalnav-chevron-slide-in-hover`, `translate(-4px) → 0` with opacity.
- Accordions: `--accordion-transition-duration: 400ms`. This value comes from CSS;
  no accordion opened during measurement.

### Exit

- Faster than the enter, with no delay: flyout items `opacity` + `transform` at
  240ms `ease` (some at 220–160ms).
- Lists close with shrinking durations: search results at 160→60ms in 20ms steps,
  `var(--ease-standard)`.
- The panel itself waits 120ms, then collapses `height` over 242ms
  `var(--ease-standard)`. `visibility` flips with `steps(1)`.
- `globalnav-chevron-hover-off` scales from 1 to 0.8 and fades out.

### Page load

- Homepage: no hero entrance. Load motion is the media gallery's dot navigation
  (width, height, padding, scale and opacity over 1000ms `ease-in-out` on the active
  dot, with `--sk-dotnav-timed-duration: 3000ms`) and caption copy fading in over
  400ms `ease`.
- /iphone: chapter-nav items run `chapternav-slidein` (`translateY(8px) → 0`, 700ms)
  and `chapternav-fadein` (opacity, 900ms), both on
  `cubic-bezier(0.45, 0, 0.55, 1)`. The delay goes up 150ms per item, from 0 to
  1350ms across 10 items.
- /iphone also has 16 JS-driven elements that go from `opacity: 0;
  transform: translateY(30px)` to rest in about 870–885ms, 150ms apart within a
  group of 8. They start 459ms after navigation. This is a page-load cascade, not a
  scroll reveal.
- Use `var(--motion-entrance)` for this on product landing pages only. Do not use it
  on UI.

### Scroll

- Scrolling is native. A 400px wheel tick settled in 0ms on both pages.
- No scroll-reveal system. All 8 CSS "scroll" events on /iphone were card and
  chapter-nav hover transitions (`300ms cubic-bezier(0, 0, 0.5, 1)`) that fired
  because the cursor passed over them. On the homepage, the 2 JS scroll "reveals" were
  media-gallery slides moving horizontally (`translateX` 16–32px → 0, about
  500–750ms), not sections entering.
- 0 scroll-driven animations and 0 `animation-timeline` uses.

### Stagger

- 20ms between items in menus, search results and index lists. Start the cascade
  after a short delay (80ms in the flyout, 200ms in search).
- 150ms between items in the /iphone page-load cascade (basis: observed; delays 0→1350ms
  in 150ms steps).
- The dot nav defines `--sk-dotnav-animation-stagger-duration: 40ms`.

### Loops

- `progress-indicator-animating` is an 8-step opacity spinner: 800ms,
  `cubic-bezier(1, 0.1, 0, 0.3)`, 6 segments offset 100ms apart. It started when the
  flyout opened. This is a loading indicator, not decoration.
- The media gallery autoplays (`--autoplay-persist-duration: 6.15s`,
  `--media-gallery-slide-duration: 800ms`). Buttons and badges never loop.

## Never

- **Never smooth-scroll.** Wheel scroll is native on both pages (0ms settle).
- **Never fade sections up on scroll.** 0 content reveals were triggered by scroll.
  Every scroll event traced back to hover or a gallery slide.
- **Never use overshoot or bounce.** 0 overshoot curves were applied. One,
  `cubic-bezier(0.4, 0, 0.3, 2)`, appears 5 times in the CSS and never ran.
- **Never `transition: all`.** 0% of declared transitions on both pages.
- **Never use long travel on UI.** UI keyframes move 4–8px. The only 30px move is
  the /iphone load cascade.

Apple does things generic AI motion also does. These are not Never rules. Cards
transform on hover (300ms). The house curve is a symmetric in-out at 320ms, close to
the generic `ease-in-out 300ms`. The difference is that leaving takes 240ms, not 320ms.

## Reduced motion

- /iphone: 37 `prefers-reduced-motion` queries. Load motion dropped from 2,169 to 80
  events. The JS reveals and most CSS load animations stopped (40 → 15 CSS events).
- Homepage: 2 queries. The reduced run recorded more motion than the full run
  (91 → 436), almost all of it JS style mutations (56 → 401). This is probably gallery
  autoplay landing in the measurement window, not Apple adding motion. Treat this
  number as noise.
- For your build: under `reduce`, drop the load cascade and slide offsets, and keep
  instant colour changes (basis: observed).

## Measurements

- Declared transitions on 1,931 elements across 2 pages (958 + 973).
- Durations (declared + hover): 320ms ×737 (39%), 240ms ×552 (30%), 200ms ×100 (5%), 220ms ×96 (5%), 180ms ×92 (5%), 100ms ×80 (4%). The 220–160ms values are mostly flyout items' tapered exit durations.
- Easings (declared + hover): ease ×1,171 (56%); cubic-bezier(0.4, 0, 0.6, 1) ×657 (31%); linear ×86 (4%); cubic-bezier(0, 0, 0.5, 1) ×62 (3%); ease-out ×43 (2%).
- Hover: 16 of 32 probes ran CSS motion (3 probes timed out); 9 moved or scaled; 7 were colour-only. 6 had JS hover motion, 4 of them with transform, probably gallery autoplay overlapping the probe. Medians: in 320/300ms, out 240/300ms (homepage / iphone).
- Load: 35 animations (median 1000ms, max delay 300ms) on the homepage; 40 (median 700ms, max delay 1800ms) on /iphone, plus 16 JS reveals.
- Scroll: 0 animations on the homepage; 8 on 4 targets on /iphone, all hover artefacts. 0 scroll-driven animations.
- Stagger gaps: 20ms (search results, flyout, index links); 150ms in the /iphone chapter nav (delays 0→1350ms).
- Wheel scroll: native (0ms) on both pages.
- `transition: all` share: 0%, 0%. Overshoot easings applied: 0; defined in CSS: 1 curve, 5 uses. linear() springs: 0.
- Infinite loops: 6 per page, all `progress-indicator-animating`.
- Reduced motion: 2 CSS queries, load motion 91 → 436 (noisy) | 37 CSS queries, 2,169 → 80.
- Libraries: none detected (no GSAP, Lottie, Framer Motion or Lenis).
- CSS motion tokens: `--r-globalnav-duration-medium: .24s`, `--r-globalnav-flyout-link-opacity-duration: .5s`, `--r-globalnav-search-base-duration: calc(.24s - 80ms)`, `--motion-duration-long: 320ms`, `--motion-delay-rapid: 20ms`, `--motion-delay-short: 40ms`, `--motion-delay-medium: 80ms`, `--sk-dotnav-variable-duration: 320ms`, `--sk-dotnav-hover-animation-duration: 120ms`, `--sk-dotnav-animation-stagger-duration: 40ms`, `--sk-dotnav-animation-collapse-duration: 380ms`, `--sk-dotnav-timed-duration: 3000ms`, `--media-gallery-slide-duration: 800ms`, `--media-gallery-bottom-copy-duration: 600ms`, `--card-transition-transform: transform 0.3s cubic-bezier(0,0,0.5,1)`, `--card-transition-background: background-color 0.344s ease`, `--accordion-transition-duration: 400ms`, `--r-localnav-curtain-transition: opacity 320ms cubic-bezier(0.4, 0, 0.6, 1) …`.
- **Not measured:** the hover transform values on cards and chapter-nav icons (only that a transition ran); press and focus states; accordion, modal and local-nav menu opening; the scroll-linked product animations on deeper product pages (only the homepage and /iphone were measured); and touch behaviour.
