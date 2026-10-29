---
format: motion.md/v0
name: Stripe
summary: One fast-settling curve, cubic-bezier(0.25, 1, 0.5, 1), at 300ms on every control; cards move their insides over 600–800ms, never the card itself; the big motion lives in scripted product illustrations, not in the page chrome.
source: measured
measured:
  date: 2026-10-29
  pages: [https://stripe.com/, https://stripe.com/payments]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/stripe.summary.json
tokens:
  duration:
    quick: 150ms
    nav: 240ms
    regular: 300ms
    card: 800ms
  easing:
    out: cubic-bezier(0.25, 1, 0.5, 1)
    out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1)
    card: cubic-bezier(0.165, 0.84, 0.44, 1)
  stagger: 50ms
  distance: null
reduced-motion: ignored   # partial: homepage drops most CSS transitions, all JS (WAAPI) motion still runs
---

# Stripe motion

Stripe's chrome is quick and decelerating, and its illustrations do the showing off.
Across 1,852 elements with declared transitions, 75% of durations are 300ms or 150ms,
and one curve, `cubic-bezier(0.25, 1, 0.5, 1)`, covers 36% of all samples (630 of the
homepage's declarations alone). It starts fast and lands softly, so a 300ms change
reads as nearly instant. Buttons and links change colour and nudge their arrow
glyph; cards keep their frame still and move their image, logo or title inside it
over 600–800ms. The long, linear, scripted motion (1420ms, 2140ms, 4480ms, 11950ms
`Element.animate()` timelines) belongs to the product mock-ups, not the UI. Note that
the two pages run two systems: the homepage is built on the `hds-*` components
(300ms, `0.25, 1, 0.5, 1`), while /payments still declares most transitions at 150ms
`easeOutCubic` (656 of 911 declarations).

## Principles

1. **One curve for controls.** `cubic-bezier(0.25, 1, 0.5, 1)` on 784
   samples (36%), and it is the CSS token `--ease` and
   `--graphic-reveal-easing`. Do not use `ease` or `ease-in-out` on controls.
2. **300ms is the control speed.** 843 samples (39%), the homepage's dominant
   declaration (628 of 941), and the median hover-in on both pages (300ms).
3. **Hover is colour plus a glyph nudge.** Button and link hovers changed `color`,
   `background-color` or `border-color`, and moved only an inner SVG arrow
   (`g` transform + `rect` opacity, 300ms). The nav arrow keyframe travels 3px
   (`translateX(-3px) → 0`).
4. **Cards move inside, not out.** On hover, case-study cards moved
   `.case-study-card__media` and `__mediaLogo` (800ms, `card` curve) and
   `CustomersCaseStudyCard` moved background, title and CTA (600ms,
   `cubic-bezier(0.7, 0, 0, 1)`). The card element itself did not transition.
5. **Symmetric in and out.** Every hover probe ran the same duration and curve on
   leave as on enter (median out − in: 0ms on both pages).
6. **Illustrations get the long motion.** 231 of 283 homepage WAAPI animations are
   `linear` mock-up timelines (median 1420ms). Keep long durations out of the UI.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-quick` | `150ms` | arrow glyphs and link colour (/payments system) | 778 samples (36%); `--arrowHoverTransition: 150ms` |
| `--motion-nav` | `240ms` | top-nav triggers, nav background, CTA in nav | 84 samples (4%); every homepage nav probe |
| `--motion-regular` | `300ms` | buttons, links, arrows, colour, small opacity | 843 samples (39%); `--hds-chippy-transition-duration`, `--hds-resource-card-duration`, `--graphic-reveal-duration` |
| `--motion-card` | `800ms` | image/logo layers inside cards | 75 samples (3%); `--card-duration: 800ms` |
| `--ease-out` | `cubic-bezier(0.25, 1, 0.5, 1)` | every control | 784 samples (36%); `--ease`, `--graphic-reveal-easing` |
| `--ease-out-cubic` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | links and arrows in the /payments system | 676 samples (31%), 656 of them on /payments |
| `--ease-card` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | card media, bento card clip and dialog | 113 samples (5%); `--card-ease` |
| `--stagger` | `50ms` | digit/character ticker only | 2 groups of 12 spans, 50ms gap, 325ms each |

```css
:root {
  --motion-quick: 150ms;
  --motion-nav: 240ms;
  --motion-regular: 300ms;
  --motion-card: 800ms;
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-card: cubic-bezier(0.165, 0.84, 0.44, 1);
  --stagger: 50ms;
}
```

## Patterns

### Hover and press

- Buttons (`hds-button--primary`, `--secondary`, section CTAs): `color`,
  `background-color` or `border-color` over `var(--motion-regular) var(--ease-out)`.
  An inner arrow SVG animates at the same time: `rect` opacity (the stem appears)
  and `g` transform (the chevron shifts), both 300ms `var(--ease-out)`. Travel of
  that transform was not captured; the nav arrow keyframe uses 3px.
- Top nav (homepage): `color`, `opacity`, `background-color` and border colours over
  `var(--motion-nav)` with `cubic-bezier(0.45, 0.05, 0.55, 0.95)` (CSS token
  `--navigation-easing`). This is the one place Stripe uses a symmetric in-out curve.
- Inline links on /payments: `color` over `var(--motion-quick) var(--ease-out-cubic)`;
  arrow `path` opacity + transform over the same 150ms.
- Cards: keep the card still. Move the image or logo inside it:
  `transform` over `var(--motion-card) var(--ease-card)` (case-study cards), or
  background, overlay, title and CTA over 600ms `cubic-bezier(0.7, 0, 0, 1)`
  (/payments case-study cards, `--accentedCardTransitionEasing: 500ms` in CSS).
- Gradient borders (startups cards): border `opacity` 250ms `linear` plus the gradient
  layer's `transform` over 1000ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- Tab/stat selectors: the active indicator slides with `left` over 400ms
  `cubic-bezier(0.4, 0, 0.2, 1)`; labels change `color` over 300ms `var(--ease-out)`.
  Prefer `transform` in your build (basis: observed — `left` is a layout property).
- Press states were not measured.

### Enter

- Nav dropdown (homepage): popup `clip-path` 200ms, overlay `opacity` 300ms, both
  `cubic-bezier(0.45, 0.05, 0.55, 0.95)`. On /payments the menu animates `height`
  200ms with the same curve, the overlay fades over 500ms `cubic-bezier(0.22, 1, 0.36, 1)`
  and the caret rotates over 400ms `cubic-bezier(0.4, 0, 0.2, 1)`.
- Tooltips (/payments): keyframe `PortalTooltipItemFadeIn`, opacity from 0, 250ms `ease`.
- Defined but not seen running: `bento-dialog-reveal-fade-in-up`
  (opacity 0 → 1, `translate3d(0, 30px, 0) → 0`) and `UniversalChatCtaCard__entrance`
  (opacity 0 → 1, `translateY(16px) → 0`). Use 16–30px only for dialog-like
  surfaces, if at all.
- Accordions: `--hds-accordion-duration: 0.36s`, `--hds-accordion-ease:
  cubic-bezier(0.65, 0.05, 0.36, 1)` (CSS tokens; none opened during measurement).

### Exit

- Mirrors the enter. Hover-out ran the same properties, durations and curves as
  hover-in on every probe. The nav arrow exits with an opacity-only keyframe
  (`nav-hover-arrow-out`, 1 → 0, 150ms `var(--ease-out)`), so exits are simpler than
  enters.

### Page load

- No hero entrance. Homepage load motion is 130 events with a 325ms median: a
  digit ticker (WAAPI `transform`, 325ms, `cubic-bezier(0.33, 1, 0.68, 1)`, 50ms
  stagger, delays 0–550ms), illustration set-up (0ms WAAPI), a 500ms opacity fade on
  `book-of-the-week` (`cubic-bezier(0.33, 1, 0.68, 1)`), and a 400ms width/colour
  settle on the customer-story button (`cubic-bezier(0.3, 0, 0.2, 1)`).
- /payments: 104 load events, median 150ms, but 87 of them are
  `refreshed-nav-hover-arrow-out` keyframes firing on unhovered nav arrows. The real
  load motion is the hero mock-up card (`.Card--shadowLarge`, opacity + transform,
  1250ms, `cubic-bezier(0.65, 0, 0.35, 1)`) and its form fields (300ms,
  `cubic-bezier(0.61, 1, 0.88, 1)`, `--easeOutSine`).

### Scroll

- Scrolling is native: one 400px wheel tick settled within a frame on both pages,
  although /payments ships one `scroll-behavior: smooth` rule (anchor jumps, basis:
  observed).
- No section reveal system. JS reveals: 0 on both pages. The scroll-phase motion
  (288 and 163 events) came from illustrations starting their timelines
  (`payments-graphic`, `connect-platform-graphic`, `globe__arc-ui`,
  `developer-systems-animation`), `lazy-animation--loaded` graphics fading in
  (opacity 500ms `cubic-bezier(0.33, 1, 0.68, 1)`), and card hover states under the
  stationary pointer. Text and section containers did not fade up.
- One CSS scroll-driven animation (`detect-scroll` on the nav, a custom-property
  flag, not a visual effect).

### Stagger

- 50ms between characters of the homepage number ticker (12 spans × 2). The ticker
  re-fires roughly every 1.2–2.5s (basis: observed), including during idle.
- /payments declares a 100ms CSS stagger (`transition: all 0.5s
  cubic-bezier(0.65, 0, 0.35, 1)` with delays 0.75s → 1.45s on 11 elements); it was
  not seen running.
- Do not stagger cards, list items or sections on load or scroll.

### Loops

- Homepage: 0 infinite CSS loops measured. Long linear WAAPI timelines drive the
  product mock-ups (1420ms, 2140ms, 4480ms, 11950ms).
- /payments: 22 infinite animations, all illustration or status: background blobs
  (`ProductFeatureCardRotateOne/Two`, 25000ms `ease-in-out`), spinners
  (`PaymentsHeroAnimationLinkSpinnerAnimation` 600ms linear, `rotating` 2000ms
  linear), and an uptime graph background (20000ms). The case-study carousel shows
  a 7000ms linear countdown bar.
- UI chrome does not loop: no pulsing buttons, no shimmer.

## Never

- **Never animate shadows.** 0 `box-shadow` transitions declared or run on either
  page. Generic AI cards grow a shadow on hover.
- **Never move the card container on hover.** Hovered cards transitioned inner layers
  only; the card element ran no transform. Do not add `translateY(-2px)` to cards.
- **Never use overshoot or bounce.** 0 overshoot curves defined in CSS, 0 applied,
  0 `linear()` springs.
- **Never use 300ms `ease-in-out` as the default.** Stripe's 300ms runs on
  `cubic-bezier(0.25, 1, 0.5, 1)`. Plain `ease-in-out` is absent from the homepage's
  top eight declared curves and has 6 declarations on /payments.
- **Never fade sections up on scroll.** 0 JS reveals; scroll motion was illustrations,
  lazy graphic fades and pointer hovers.
- **Never hijack scroll.** Wheel scroll is native on both pages; no Lenis or
  smooth-scroll library.
- **Avoid `transition: all`.** 0% of declarations on the homepage, 2% on /payments
  (14 elements, mostly the delayed staggered group).

## Reduced motion

- The homepage ships 86 `prefers-reduced-motion` queries; /payments ships 31.
- Homepage under `reduce`: load-phase CSS transition events fell from 56 to 5 and CSS
  animations from 127 to 80, but all 74 WAAPI animations still ran (the ticker and
  illustration set-up). Total load motion 548 → 340.
- /payments under `reduce`: load motion 239 → 235. Effectively unchanged.
- For your build: do better than the measurement. Keep colour transitions, drop
  `transform`, `clip-path` and the ticker, and pause illustration timelines.

## Measurements

- Declared transitions on 1,852 elements across 2 pages (941 homepage, 911 /payments).
- Durations (declared + hover): 300ms ×843 (39%), 150ms ×778 (36%), 240ms ×84 (4%), 800ms ×75 (3%), 500ms ×70 (3%), 250ms ×64 (3%).
- Easings (declared + hover): `cubic-bezier(0.25, 1, 0.5, 1)` ×784 (36%); easeOutCubic ×676 (31%); linear ×137 (6%); easeOutQuart `(0.165, 0.84, 0.44, 1)` ×113 (5%); `cubic-bezier(0.33, 1, 0.68, 1)` ×80 (4%).
- Hover: 29 of 35 completed probes ran CSS motion (13 of 48 probes timed out); 23 moved or scaled something, mostly inner arrow glyphs and card media; 4 were colour-only; 10 had JS hover motion, 7 changing transform, most of it illustration timelines that happened to run during the probe. Median in 300/300ms, out 300/150ms (homepage / payments).
- Load: 130 animations, median 325ms, max delay 550ms (homepage); 104 animations, median 150ms, max delay 300ms (/payments, 87 of them nav arrow-out keyframes).
- Scroll: 288 animations on 41 targets, median 500ms (homepage); 163 on 53 targets, median 300ms (/payments). Moving: 220, opacity-only: 130; JS reveals: 0; scroll-driven: 1.
- Stagger gaps: 50ms (ticker).
- Wheel scroll: native (0ms) on both pages.
- `transition: all` share: 0% / 2%. Overshoot easings applied: 0; defined in CSS: 0. `linear()` springs: 0.
- Infinite loops: 0 (homepage), 22 (/payments: `PaymentsHeroAnimationLinkSpinnerAnimation`, `rotating`, `ProductFeatureCardRotateOne`, `ProductFeatureCardRotateTwo`, `paymentsUptimeGraphicBackgroundAnimation`).
- WAAPI: 283 animations, median 1420ms, 231 linear (homepage); 229, median 300ms (/payments).
- Reduced motion: 86 CSS queries, load motion 548 → 340 (homepage); 31 queries, 239 → 235 (/payments).
- Libraries: none detected (no GSAP, Framer Motion, Lenis, Lottie). 12 and 2 canvases.
- CSS motion tokens: `--ease: cubic-bezier(0.25,1,0.5,1)`, `--graphic-reveal-duration: 300ms`, `--graphic-reveal-easing: cubic-bezier(0.25,1,0.5,1)`, `--card-duration: 800ms`, `--card-ease: cubic-bezier(0.165,0.84,0.44,1)`, `--hds-accordion-duration: 0.36s`, `--hds-accordion-ease: cubic-bezier(0.65,0.05,0.36,1)`, `--hds-resource-card-duration: 300ms`, `--hds-chippy-transition-duration: 300ms`, `--hds-chippy-easing` / `--hds-resource-card-easing: cubic-bezier(0.46,0.03,0.52,0.96)`, `--hds-toggle-tabs-duration: 220ms`, `--hds-toggle-tabs-easing` / `--navigation-easing: cubic-bezier(0.45,0.05,0.55,0.95)`, `--arrowHoverTransition: 150ms cubic-bezier(0.215,0.61,0.355,1)`, `--easeOutSine: cubic-bezier(0.61,1,0.88,1)`, `--accentedCardTransitionEasing: 500ms cubic-bezier(0.7,0,0,1)`, `--mobileStickyNavDuration: 250ms`. Several duration tokens read `0s`, `0ms` or `1ms` (`--navigation-duration`, `--stats-section-transition-duration`, `--transitionDuration`, `--siteMenuTransition`); these are likely state or reduced-motion overrides, not the live values.
- Both URLs redirected to the German locale (`/de`, `/de/payments`).
- **Not measured:** the Stripe Dashboard and Checkout, which need an account or a live payment; press and focus states; open/close timing of accordions, dialogs and the bento cards (5 bento card probes timed out); touch behaviour; travel distances of transitions (only CSS keyframe bodies give distances).
