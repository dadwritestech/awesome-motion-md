---
format: motion.md/v0
name: Vercel
summary: Tailwind's standard curve, run fast. 100–150ms colour-only transitions on cubic-bezier(0.4, 0, 0.2, 1), nothing moves on hover, and the only sustained motion is spinners and shimmer inside product illustrations.
source: measured
measured:
  date: 2026-10-29
  pages: [https://vercel.com/, https://vercel.com/ai]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/vercel.summary.json
tokens:
  duration:
    instant: 100ms
    quick: 150ms
    regular: 200ms
    overlay: 300ms
  easing:
    standard: cubic-bezier(0.4, 0, 0.2, 1)
    out: cubic-bezier(0, 0, 0.2, 1)
  stagger: null
  distance: null
reduced-motion: instant
---

# Vercel motion

Vercel's marketing site moves very little, and almost all of what it does move is colour.
Of 2,491 declared transition properties across two pages, 97% are 100ms or 150ms, and
98% use one curve, `cubic-bezier(0.4, 0, 0.2, 1)`. That is Tailwind's default
`transition-timing-function`, and the site's own `--default-transition-duration` is
`.15s`. Most of these declarations are Tailwind `transition-colors`: color, background,
border, outline, fill, stroke and gradient stops, and nothing else. Hovering changes
background, colour or opacity. 0 of 13 hover probes moved or scaled anything. Nothing
reveals on scroll and wheel scrolling is native. The busy-looking parts of `/ai` are
product illustrations: an 8-bar loading spinner and a "thinking" text shimmer that loop
forever. They are not UI motion.

## Principles

1. **Two speeds for chrome.** 100ms (1,582 declarations, 63%) and 150ms (843, 34%).
   Links and nav items use 100ms. Buttons and cards use the Tailwind default of 150ms.
2. **One curve.** `cubic-bezier(0.4, 0, 0.2, 1)` on 2,450 of 2,502 easing samples (98%).
   It is a symmetric in-out curve. Vercel keeps it short enough that it never feels slow.
3. **Hover is colour.** 0 of 13 probes changed transform. 4 were colour-only. The rest
   changed `background-color`, `opacity`, `clip-path`, or a `box-shadow` on 24px icon
   tiles.
4. **Symmetric in and out.** Per-probe hover medians were 150ms in and 150ms out on both
   pages. The out-minus-in difference was 0ms.
5. **Page load is almost still.** 2 load animations per page. On the homepage they are
   linear opacity fades on the hero canvas (700ms and 1200ms). Nothing slides in.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-instant` | `100ms` | link, nav and text colour | 1,582 declarations (63%); 79 elements per page with `transition-colors` at 100ms |
| `--motion-quick` | `150ms` | buttons, cards, menu rows, default for everything else | 843 declarations (34%); CSS `--default-transition-duration: .15s`; hover median 150ms |
| `--motion-regular` | `200ms` | small fades (`fade-in`), icon tiles with shadow, popovers | 26 declarations; 13 of 18 homepage hover events at 200ms; `fade-in` 200ms on 11 elements of /ai; CSS `--tw-duration: .2s`, `--ds-motion-popover-duration: .2s` |
| `--motion-overlay` | `300ms` | opacity of overlays and modals, panel swaps | 18 declarations; 12 scroll-phase events on /ai; CSS `--ds-motion-overlay-duration: .3s` |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | every transition | 2,450 samples (98%); CSS `--ease-in-out`, `--default-transition-timing-function` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | opacity and height of things that appear | 38 declarations (2%); CSS `--ease-out`, `--tw-ease` |

```css
:root {
  --motion-instant: 100ms;
  --motion-quick: 150ms;
  --motion-regular: 200ms;
  --motion-overlay: 300ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

## Patterns

### Hover and press

- Links, nav items and text buttons: transition the colour properties only
  (`color, background-color, border-color, outline-color, text-decoration-color, fill,
  stroke`) over `var(--motion-instant)` or `var(--motion-quick)` with `var(--ease-standard)`.
  Use the same timing on the way out.
- Nav menu items and pill buttons: `background-color` (and `color`) over
  `var(--motion-quick) var(--ease-standard)`.
- Small icon tiles inside menus (24px, `span.flex.size-6`): `background-color` and
  `box-shadow` over `var(--motion-regular) var(--ease-standard)`. This is the only
  shadow change that was measured. It happens on the icon, not on the card around it.
- Link cards on /ai (`a.flex.flex-col`): `opacity`, `background-color` and `clip-path`
  over `var(--motion-quick)`. Use a clip or tint for the effect. Do not move the card.
- Tooltips: `fadeInTooltip`, opacity `0 → 1` over 100ms `ease-in`. The probe saw no
  exit animation, so the tooltip disappeared at once (basis: observed).
- Press states were not measured.
- `transition: all` exists but is the minority. It is 13 elements on the homepage and
  26 on /ai at 150–300ms, against 79 + 37–41 elements with named colour properties per
  page. Name the properties.

### Enter

- Small inline content (labels, command rows): keyframe `fade-in`, opacity only,
  200ms `ease-out`. It was measured on 11 elements of /ai.
- Panels that swap in (an /ai element with Tailwind `transition-all duration-300`):
  `opacity` and `scale` over `var(--motion-overlay) var(--ease-standard)`. The scale
  values were not captured.
- Modals, popovers and dropdowns: the design-system tokens say overlays scale from
  `0.96` over 300ms and popovers run 200ms, both on
  `--ds-motion-timing-swift: cubic-bezier(.175, .885, .32, 1.1)`. That curve overshoots
  slightly. None of these opened during the measurement, so the curve was never seen
  running. The stylesheet also defines `modal-appear` (translateY 20px → 0),
  `slideUpFadeIn` (8px) and `fade-slide-in` (−8px). Their durations are unknown.
- Accordions: `accordion-down` / `accordion-up` animate `height`. 3 homepage elements
  declare `height 200ms cubic-bezier(0, 0, 0.2, 1)`. Neither was opened.

### Exit

- `fade-out`, `hide` and `accordion-up` mirror their enter keyframes. No exit was
  observed running. The tooltip exit was instant.

### Page load

- Homepage: the hero canvas and an overlay fade in with `opacity`, `linear`, over 700ms
  and 1200ms. There is no delay and no travel.
- /ai: one `fade-in` (200ms `ease-out`) and one colour transition (150ms). That is all.
- Do not animate headlines, cards or sections on load.

### Scroll

- Scrolling is native. A 400px wheel tick settled in 0ms on both pages, and
  `scroll-behavior: smooth` appears 0 times.
- No scroll reveals. The homepage ran 0 animations while scrolling. The 118 scroll-phase
  events on /ai came from 5 targets. They were the spinner, the shimmer, a staggered
  command list and one panel scaling in. None moved content into place, and 0
  scroll-driven animations were found.

### Stagger

- There is no UI stagger. The 125ms "stagger" in the draft comes from the spinner's
  8 bars, which use negative delays (−875ms … 0ms in 125ms steps) to offset a 1000ms
  loop.
- The one real sequence is inside an /ai illustration. Six command rows
  (`animate-command-fade-in`) fade in 300ms apart, 200ms `ease-out` each. Use this only
  to fake a terminal or agent log.

### Loops

- Loading spinner: `spinner-opacity`, opacity `1 → 0.15`, 1000ms `linear`, 8 bars offset
  by 125ms.
- Thinking text: `thinking-loader`, `background-position 100% → 0%`, 1500ms `linear`.
- Logo marquee: `marquee`, 40s `linear` infinite, declared on 2 elements per page.
- These are product illustrations and logo strips. Buttons, badges and nav never loop.
  Keyframes such as `blue-glow`, `bar-pulse` and `blink` exist in the CSS but were not
  seen running.

## Never

- **Never lift or scale on hover.** 0 of 13 probes changed transform. JS hover motion
  was 0. /ai declares `transition-transform` on 7 elements, but no hover moved them.
- **Never fade sections up on scroll.** 0 scroll animations on the homepage. On /ai,
  0 reveals moved and 0 JS reveals ran. The opacity-only events were loops.
- **Never make 300ms the default.** 300ms is 18 of 2,491 declarations (under 1%). Note
  that Vercel's default curve *is* an in-out curve, at 100–150ms. Do not swap it for
  `ease-out` everywhere.
- **Never bounce interactive chrome.** 0 overshoot curves were applied. The CSS defines
  a slight overshoot (`--ds-motion-timing-swift`, y2 = 1.1) for overlays and popovers,
  but it was not observed running.
- **Never smooth-scroll.** Wheel scroll is native on both pages.

## Reduced motion

- 31 `prefers-reduced-motion` queries per page. Tailwind `motion-reduce:animate-none` is
  on the command fade-in.
- Homepage: under `reduce`, transition and animation events dropped from 2 to 0. Only 2
  inline style mutations remained (load motion 5 → 2). The hero fade is removed.
- /ai: the reduced run recorded **more** load motion than the full run (5 → 16, of which
  13 were animation events). This is likely timing noise from illustrations starting
  in a different phase, and it does not show that reduced motion adds animation.
- For your build: under `reduce`, drop fades and loops and keep instant colour changes.

## Measurements

- Declared transitions: 2,491 property declarations (1,234 + 1,257) on 964 and 1,228
  scanned elements. The draft calls these "elements". They are per-property counts, so
  one Tailwind `transition-colors` element counts 10 times.
- Durations (declared + hover): 100ms ×1582 (63%), 150ms ×843 (34%), 500ms ×31 (1%), 200ms ×26 (1%), 300ms ×18 (1%), 250ms ×2 (0%).
  The 500ms entries are 3 homepage elements with colour transitions on `ease-out`.
- Easings (declared + hover): `cubic-bezier(0.4, 0, 0.2, 1)` ×2450 (98%, in-out); `cubic-bezier(0, 0, 0.2, 1)` ×38 (2%, out); easeOutQuint ×8 (0%); ease ×4 (0%); linear ×2 (0%).
- Hover: 7 of 13 probes ran CSS motion; 0 moved or scaled; 4 were colour-only; 0 had JS
  hover motion. Per-probe medians: in 150/150ms, out 150/150ms (homepage / ai). 2 probes
  per page timed out (skip link, cookie button) and are excluded.
- Load: 2 animations on the homepage (opacity, linear, 700ms and 1200ms) and 2 on /ai
  (150ms and 200ms). Max delay 0ms.
- Scroll: homepage 0. /ai 118 events on 5 targets, median 1000ms. Moving reveals 0,
  opacity-only 98 (spinner loops), JS reveals 0, scroll-driven 0.
- Stagger: the 125ms gap is spinner bar offsets. The only content sequence is 6 rows at 300ms.
- Wheel scroll: native (0ms) on both pages.
- `transition: all`: 1% and 2% of property declarations, which is about 13 and 26
  elements (basis: census grouping). Overshoot easings applied: 0. Defined in CSS:
  `cubic-bezier(0.1, 0, 0.1, 1.1)` and `--ds-motion-timing-swift`. linear() springs in
  CSS: 3 per page (`--timing`, with `--duration: .56104s`), none seen running.
- Infinite loops: 0 on the homepage and 90 on /ai (`spinner-opacity`, `thinking-loader`).
  The census also shows `marquee` 40s infinite on 2 elements per page, which the
  ambient sampler did not count.
- Libraries: none detected (no GSAP, Framer Motion, Lenis or Lottie). WAAPI calls: 0.
- CSS motion tokens: `--default-transition-duration: .15s`, `--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1)`, `--tw-duration: .2s`, `--tw-ease: var(--ease-out)`, `--ease-in: cubic-bezier(.4, 0, 1, 1)`, `--ease-out: cubic-bezier(0, 0, .2, 1)`, `--ease-in-out: cubic-bezier(.4, 0, .2, 1)`, `--ds-motion-timing-swift: cubic-bezier(.175, .885, .32, 1.1)`, `--ds-motion-overlay-duration: .3s`, `--ds-motion-overlay-scale: .96`, `--ds-motion-popover-duration: .2s`, `--hero-duration: .35s`, `--hero-easing: cubic-bezier(.455,.03,.515,.955)`, `--marquee-speed: 80s`, `--step-transition: background .15s ease-out, color .15s ease-out, border-color .15s ease-out`.
- **Not measured:** the logged-in dashboard, which needs an account; open and close
  timing of modals, popovers, menus and accordions, because none opened; press states;
  touch behaviour; and the 13 extra animation events in the /ai reduced run, which were
  not itemised.
