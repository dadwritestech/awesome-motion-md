---
format: motion.md/v0
name: Raycast
summary: Plain CSS `ease` at 200–300ms on everything you touch; the motion budget goes to illustrations and one load cascade of extension cards, 700ms easeOutCubic, 80ms apart.
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.raycast.com/, https://www.raycast.com/pro]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/raycast.summary.json
tokens:
  duration:
    quick: 200ms
    regular: 300ms
    entrance: 700ms
    hero: 1000ms
  easing:
    ui: ease
    entrance: cubic-bezier(0.215, 0.61, 0.355, 1)
    key: cubic-bezier(0.23, 1, 0.32, 1)
  stagger: 80ms
  distance: 20px
reduced-motion: ignored
---

# Raycast motion

Raycast's marketing chrome moves like the browser default: `ease`, 200ms for hover
colour and background, 300ms for links and their arrow icons. On /pro, 152 of 182
declared transitions use `ease`. The raw totals say otherwise (easeOutQuint on 63% of
samples, 400ms on 33%), but nearly all of those come from one illustration: a
keyboard whose 157 keys each declare six easeOutQuint transitions. Treat that curve as
an illustration curve, not the UI curve. The one entrance system is on load: a hero
headline rises 20px over 1000ms, and 17 extension cards slide in over 700ms on
easeOutCubic, 80ms apart. Scrolling reveals no content; what moves on scroll is
illustration.

## Principles

1. **Chrome uses `ease`, not a custom curve.** 152 of 182 declared transitions on /pro,
   and 8 of 15 hover-in transitions, are `ease`. The rest of the hover set is
   `ease-in-out` (3) and `linear` shimmer (4).
2. **Two speeds for interaction.** 200ms (7 of 15 hover-in transitions) for colour,
   background and shadow; 300ms (4 of 15) for text links and their arrow icons.
   Hover-in and hover-out medians were both 200ms.
3. **Hover changes colour; only icons move.** 4 of 14 probes changed `transform`, and
   in all 4 the moving element was a child `svg` icon, not the hovered button or card.
4. **Spend motion on load, once.** 17 extension cards cascade in (700ms, 80ms step) and
   the hero copy rises over 1000ms. After that, content does not animate in.
5. **Illustrations get their own, slower language.** Keyboard keys glow over 1500ms on
   easeOutQuint; an SVG illustration draws over 1500–2000ms on easeOutQuart with
   500–1000ms delays. Do not reuse these timings on UI.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-quick` | `200ms` | colour, background, box-shadow on hover; small icon nudges | 7 of 15 hover-in; 56 of 182 declared on /pro |
| `--motion-regular` | `300ms` | text links, link arrow icons, disclosure content | 4 of 15 hover-in; 103 of 182 declared on /pro |
| `--motion-entrance` | `700ms` | cards entering on load | 17 load animations (`slideIn`) |
| `--motion-hero` | `1000ms` | hero headline and sub-copy | 2 load animations (`fade-in-up`) |
| `--ease-ui` | `ease` | every interaction on chrome | 420 declared samples (27%); 152 of 182 on /pro |
| `--ease-entrance` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | card cascade on load | 17 load animations |
| `--ease-key` | `cubic-bezier(0.23, 1, 0.32, 1)` | keyboard-key illustration only | 980 samples (63%), all on the keyboard illustration |
| `--stagger` | `80ms` | between cascading cards | declared animation-delay 100, 180, 260 … 1380ms on 17 cards |
| `--reveal-distance` | `20px` | hero `translateY` travel | `fade-in-up` keyframe |

```css
:root {
  --motion-quick: 200ms;
  --motion-regular: 300ms;
  --motion-entrance: 700ms;
  --motion-hero: 1000ms;
  --ease-ui: ease;
  --ease-entrance: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-key: cubic-bezier(0.23, 1, 0.32, 1);
  --stagger: 80ms;
  --reveal-distance: 20px;
}
```

## Patterns

### Hover and press

- Nav links: `color` over `200ms ease-in-out`, same on the way out.
- Light buttons: `background-color` over `var(--motion-quick) var(--ease-ui)`.
  Dark buttons: `box-shadow` over `200ms ease-in-out`. The button itself does not move.
- Text links with an arrow: `color` over `var(--motion-regular) var(--ease-ui)`, and the
  child `svg` arrow moves with `transform` over the same 300ms. Other inline icons move
  over `var(--motion-quick)`. This is the only hover movement measured.
- Footer links: `color` over `300ms ease`.
- Newsletter submit: a glow layer fades in with `opacity` over `300ms ease-in-out`.
- Pro labels run a `background-position` shimmer (`shimmer`, 1500ms `linear`) on hover.
- An icon-stack item fades `opacity 0 → 1` over 100ms `ease-out` via `Element.animate()`
  (1 WAAPI call).
- Raycast does use `transition: all`: 10% of declared transitions on the homepage and
  5% on /pro (`all 0.3s ease`, `all 0.3s ease-in-out`, `all 0.2s ease-in-out`). Name
  the properties in your build anyway.
- Press states were not measured.

### Enter

- Dialogs: overlay `opacity 0 → 1` (`overlayShow`); content `opacity 0 → 1` with
  `translate(-50%, -48%) scale(0.96) → translate(-50%, -50%) scale(1)` (`contentShow`).
  A second variant uses `translateY(10px) scale(0.96) → 0, 1`.
- Dropdowns and popovers: `opacity 0 → 1` with 2–4px of travel from the trigger side
  (`slideUpAndFade`, `slideDownAndFade`, `slideLeftAndFade`, `slideRightAndFade`).
- Small floating panels: `opacity 0 → 1`, `translate(10px, 10px) scale(0.9) → 0, 1`
  (`fadeInScaleUp`).
- None of these opened during measurement, so their durations are unknown. Use
  `var(--motion-quick)` for dropdowns and `var(--motion-regular)` for dialogs
  (basis: observed).

### Exit

- No exit keyframes were found in the CSS, and no exits were observed. Not measured.

### Page load

- Hero headline (`div.heroText`): `opacity 0 → 1`, `translateY(20px) → 0`, over
  `var(--motion-hero)` `ease`, no delay. The sub-copy runs the same keyframe 1000ms later.
- Extension cards: `opacity 0 → 1` with `translateY(50px) translateX(10px) scale(0.98)`
  to rest, over `var(--motion-entrance) var(--ease-entrance)`. First delay 100ms, then
  +80ms per card, for 17 cards (last delay 1380ms).
- Nothing else enters on load. /pro had 1 load event, a 200ms `visibility` change.

### Scroll

- Scrolling is native: one 400px wheel tick settled in under a frame on both pages.
- No scroll-reveal system. Scroll motion ran on 14 targets on the homepage, all of them
  illustration: a twinkling star field (JS-driven inline `opacity`), the keyboard keys
  (`transform`, `opacity`, `box-shadow` over 1500ms easeOutQuint, delays 0–125ms), and
  SVG groups drawing in over 1500–2000ms easeOutQuart. /pro had 3 scroll events, none
  of them reveals.
- No scroll-driven animations (`animation-timeline`: 0).

### Stagger

- Cards on load: 80ms, from declared delays. Use it only for a one-time cascade.
- SVG illustration groups: 150ms (delays 500, 650, 850, 1000ms). Illustration only.
- Do not stagger lists or sections on scroll.

### Loops

- Mostly illustration: pricing dots that change colour on 6000ms `ease` cycles
  (`sizeOne/Two/Three`, 16 dots on /pro), text-cursor blinks (1100ms `steps(1)`), and the
  star field.
- Two loops sit on chrome: the homepage announcement pill has a rotating border
  (`rotating2` and `x`, 3000ms `linear`, animating custom properties), and Pro labels
  shimmer (1500ms `linear`). Keep loops to one accent per screen.

## Never

- **Never lift a card or button on hover.** 0 of 14 probes moved the hovered element;
  the 4 transforms were child `svg` icons. (Homepage probes failed, so this rests on
  /pro.)
- **Never apply overshoot or bounce to UI.** 0 overshoot curves applied.
  `cubic-bezier(0.34, 1.56, 0.64, 1)` appears 3 times in the CSS and `bounce`,
  `bounceDockAppIcon` and `shake` keyframes exist, but none ran.
- **Never fade sections up on scroll.** 0 content reveals; all scroll motion was
  illustration.
- **Never smooth-scroll.** Wheel scroll is native on both pages; 0 `scroll-behavior:
  smooth` rules.

## Reduced motion

- Raycast ships 9 `prefers-reduced-motion` queries per page.
- Load motion did not drop: 110 → 114 events on the homepage (the reduced run had
  *more*, so treat the count as noise) and 18 → 18 on /pro. The measured site
  effectively ignores the setting for load motion.
- For your build: keep colour and opacity transitions; drop the card travel, the hero
  `translateY`, and loops under `reduce` (basis: observed).

## Measurements

- Declared transitions on 1,534 elements across 2 pages (1,352 homepage, 182 /pro).
- Durations (declared + hover): 200ms ×639 (41%), 400ms ×503 (33%), 300ms ×334 (22%),
  1500ms ×22 (1%), 100ms ×16 (1%), 500ms ×15 (1%). 471 of the 400ms samples and 471 of
  the 200ms samples belong to the 157 keyboard keys.
- Easings (declared + hover): easeOutQuint ×980 (63%), all on the keyboard
  illustration; ease ×420 (27%); ease-in-out ×128 (8%); easeOutQuart ×12 (1%);
  cubic-bezier(0.075, 0.82, 0.165, 1) ×5.
- Hover (/pro only): 10 of 14 probes ran CSS motion; 4 moved (child icons); 6 were
  colour-only; 0 JS hover motion. Median in 200ms, out 200ms. Homepage: all probes
  timed out on `scrollIntoView`, so 0 were measured.
- Load: 58 animations on the homepage (median 700ms, max delay 1,380ms); 1 on /pro.
- Hero: `opacity [0, 1]`, `transform [translateY(20px), 0]`, 1000ms `ease`, delays 0
  and 1000ms.
- Cards: `slideIn` ×17, 700ms `cubic-bezier(0.215, 0.61, 0.355, 1)`, delays 100–1380ms
  in 80ms steps.
- Scroll: 313 events on 14 targets (homepage), 3 on 2 (/pro); 22 with transform, 247
  opacity-only, all illustration. 0 JS reveals, 0 scroll-driven.
- Wheel scroll: native (0ms) on both pages.
- `transition: all` share: 10% and 5%. Overshoot easings applied: 0; defined: 2–3.
  `linear()` springs in CSS: 4 per page (`--spring-1`), none seen running.
- Infinite loops: 8 (homepage), 21 (/pro).
- CSS motion tokens: `--spring-1: linear(…)`, `--transition-length: 80px`,
  `--transition: all 1.8s cubic-bezier(.05, .9, .1, 1)`. None of these appeared in a
  measured transition.
- Libraries: none detected. Inline-style mutations: 533 and 40 (no cap hit).
- **Not measured:** homepage hover (every probe timed out), press states, open and close
  durations of dialogs, menus and popovers, exits, the Raycast desktop app itself, and
  touch behaviour.
