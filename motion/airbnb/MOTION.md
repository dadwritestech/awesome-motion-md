---
format: motion.md/v0
name: Airbnb
summary: One curve, cubic-bezier(0.2, 0, 0, 1), on 93% of transitions, with the duration picked by property (100ms transform, 200ms shadow, 300ms colour); hover changes colour, border or shadow and never lifts; content arrives by opacity.
source: measured
measured:
  date: 2026-10-29
  pages: [https://www.airbnb.com/, https://www.airbnb.com/s/experiences]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/airbnb.summary.json
tokens:
  duration:
    instant: 100ms
    quick: 200ms
    move: 250ms
    regular: 300ms
    spring: 452ms
  easing:
    standard: cubic-bezier(0.2, 0, 0, 1)
    fade: linear
    spring: linear(0 0%, 0.185572 10%, 0.465306 20%, 0.682334 30%, 0.822325 40%, 0.904974 50%, 0.951289 60%, 0.976364 70%, 0.989612 80%, 0.996485 90%, 1 100%)
  stagger: 50ms
  distance: null
reduced-motion: crossfade        # basis: observed; only event counts were measured, see Reduced motion
---

# Airbnb motion

Airbnb uses one curve for almost everything and changes the duration by property
instead of by component. `cubic-bezier(0.2, 0, 0, 1)` covers 905 of 977 declared and
hover samples (93%). The same curve is used at 100ms for transforms, 200ms for shadows
and 300ms for colour, background and underline, and these durations are spread almost
evenly (24%, 25%, 27%). Hover changes colour, border or shadow. 0 of 14 hover probes
moved anything with CSS. Content arrives by opacity. Listing photos fade in over 300ms,
and while they load, grey skeleton blocks shimmer on a 1300ms loop. The stylesheet
defines a full set of physics springs as `linear()` tokens, but only the fast spring
(452ms) was seen running, on the header.

## Principles

1. **One curve.** `cubic-bezier(0.2, 0, 0, 1)` on 905 of 977 samples (93%). The rest
   is `linear` (69, 7%), used for opacity. Do not introduce a second cubic-bezier for
   UI.
2. **Duration follows the property, not the component.** Declared on both pages:
   `transform` 100ms ×230 and 250ms ×154, `box-shadow` 200ms ×241, and
   `background-color`, `color`, `border-color` and `text-decoration-thickness` 300ms.
   Choose the token by what changes.
3. **Hover is colour, border or shadow.** 5 of 14 probes ran CSS motion, all 5
   colour-only, with 0 moved or scaled. Hover-in and hover-out medians were identical
   (300ms on the homepage, 200ms on /s/experiences).
4. **Content fades, it does not travel.** 369 of 389 scroll motions on /s/experiences
   were opacity-only. Listing photos fade in over 300ms `ease-out` (320 elements).
5. **Springs are for moving surfaces.** The fast spring, `linear()` with 11 stops over
   451.75ms (stiffness 300, damping 35), ran only on header `transform`s. No bounce
   spring or overshoot curve was applied.

## Tokens

| Token | Value | Use for | Evidence |
|---|---|---|---|
| `--motion-instant` | `100ms` | `transform` on press and small controls | 238 samples (24%); 230 declared `transform 0.1s` |
| `--motion-quick` | `200ms` | `box-shadow`, filter-chip border colour on hover | 249 samples (25%); 241 declared `box-shadow 0.2s`; 8 hover events on chips |
| `--motion-move` | `250ms` | `transform` on larger elements | 156 samples (16%); 154 declared `transform 0.25s` |
| `--motion-regular` | `300ms` | `background-color`, `color`, `border-color`, underline thickness, photo fade-in | 267 samples (27%) |
| `--motion-spring` | `452ms` | header and search-bar `transform` | CSS token `--motion-springs-fast-duration: 451.75ms`; 9 transitions ran |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | every colour, shadow and transform transition | 905 samples (93%) |
| `--ease-fade` | `linear` | short opacity crossfades (50–175ms) | 69 samples (7%); 8 of 8 WAAPI animations |
| `--ease-spring` | `linear(…11 stops)` | with `--motion-spring` only | CSS token `--motion-springs-fast-easing`; 9 transitions ran |
| `--stagger` | `50ms` | opacity cascades | 3 cascades of 20 elements, delays 0–900ms in 50ms steps |

```css
:root {
  --motion-instant: 100ms;
  --motion-quick: 200ms;
  --motion-move: 250ms;
  --motion-regular: 300ms;
  --motion-spring: 452ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-fade: linear;
  --ease-spring: linear(0 0%, 0.185572 10%, 0.465306 20%, 0.682334 30%, 0.822325 40%, 0.904974 50%, 0.951289 60%, 0.976364 70%, 0.989612 80%, 0.996485 90%, 1 100%);
  --stagger: 50ms;
}
```

`cubic-bezier(0.2, 0, 0, 1)` has the same values as Material 3's standard easing. The
extractor classes it as in-out, but most of its travel happens early, so it feels
like a strong ease-out.

## Patterns

### Hover and press

- Primary and text buttons: `background-color` over
  `var(--motion-regular) var(--ease-standard)`, in and out
  (`button.l1lx1n3h`, both pages).
- Filter chips: `border-color` on all four sides over
  `var(--motion-quick) var(--ease-standard)`, in and out.
- Cards and panels: `box-shadow` over 175–200ms `var(--ease-standard)` (one probe at
  175ms; 241 elements declare `box-shadow 0.2s`).
- Links: `text-decoration-thickness` over `var(--motion-regular)` (41 declared).
  Animate the underline weight, not its colour or position.
- Press: 230 elements declare `transform 0.1s var(--ease-standard)`. A press scale is
  the likely trigger (basis: observed). Press was not probed, so the scale value is
  not measured.
- One exception: the category tab icon on the homepage (`a#search-block-tab-ALL`)
  scales from 1 to about 1.10 under JS on hover, over about 680ms in and 750ms out
  (peak frame `scale(1.1169)`). Use this only for the illustrated category icons.
  Never apply it to buttons or cards.

### Enter

- Listing photos: `opacity` over `var(--motion-regular) ease-out` (320 elements,
  0ms delay, no travel).
- Small layers: `opacity` over 150ms `var(--ease-fade)`, often after a 50–150ms delay
  (52 elements declare `opacity 0.15s linear 0.05s`).
- Sheets and screen changes: keyframes `slide-up-from-bottom`. The incoming screen
  translates up from the bottom. The outgoing screen goes to `scale(0.952)` and
  `filter: brightness(0.6)`. The CSS token `--slide-up-from-bottom_duration` is 150ms
  and the easing is `--feedback-bar_spring-timing-function`, a `linear()` spring that
  overshoots to 1.0476. One run was seen at load (150ms). The full keyframe bodies
  were truncated in capture.
- Other entrance keyframes exist in the CSS but were not seen running: `scale(0) →
  scale(1)`, `translateY(16px) → 0` with opacity, and `translate(0, 100%) → none` with
  opacity.

### Exit

- The mirrors of the enters exist as keyframes: `opacity 1 → 0`, `translate(0,0) →
  translate(0, 50px)` with fade, and the context-sheet overlay `0.4 → 0`. None were
  triggered during measurement, so their durations are unknown. Use
  `var(--motion-quick)` for exits (basis: observed).

### Page load

- Homepage: 6 animations on 4 targets, median 150ms, max delay 100ms. All are opacity
  fades (`opacity 0 → 1` and `0.01 → 1`) at 150ms, `linear` or `ease`.
- /s/experiences: 85 animations, of which 80 are photo fades at 300ms `ease-out`. 40
  skeleton shimmers also started.
- Nothing slides or scales in on load. Do not add a hero entrance.

### Scroll

- Scrolling is native. A 400px wheel tick settled in 0ms on both pages. The root
  `scroll-behavior` is `auto`.
- No scroll-reveal system. 0 scroll-driven animations ran. JS reveals: 1 on the
  homepage, 0 on /s/experiences. The 20 transform events during scroll on
  /s/experiences came from 6 elements that pair `transform 300ms var(--ease-standard)`
  with a delayed `opacity 150ms linear 50ms` or `visibility 0s 200ms`. These look like
  carousel controls (basis: observed).
- Header and search bar: as the page scrolls, the header transforms on
  `var(--motion-spring) var(--ease-spring)`. Its contents crossfade with WAAPI at
  50–75ms `linear`, and the incoming layer has a 175ms delay.

### Stagger

- Only one stagger was seen: 3 cascades on /s/experiences, each of 20 elements, with
  `opacity` over 200ms `cubic-bezier(0.895, 0.03, 0.685, 0.22)` (easeInQuart) and
  delays from 0 to 900ms in 50ms steps. The fade direction was not recorded.
- Do not stagger cards, lists or grid items on load. Photos fade in together.

### Loops

- Skeleton shimmer only: keyframe `kf-ng66tb` animates `background` between
  `--dls-shimmer-animation-start-color` and `--dls-shimmer-animation-end-color`
  (`--palette-grey300`). It runs for 1300ms, `cubic-bezier(0.4, 0, 0.2, 1)`,
  `infinite`, on 380 placeholders on /s/experiences and 0 on the homepage.
- Stop the loop as soon as content arrives. UI chrome never loops.

## Never

- **Never lift on hover.** 0 of 14 hover probes translated or scaled through CSS.
  The one JS scale is the illustrated category icon, not a card or button.
- **Never apply overshoot or bounce to UI.** `cubic-bezier(0.34, 1.56, 0.64, 1)` is
  defined 5 times, and `--motion-springs-*-bounce` tokens exist, but 0 overshoot
  curves were applied during measurement.
- **Never fade sections up on scroll.** 0 scroll-driven animations ran, and there were
  0–1 JS reveals per page. Scroll motion was opacity-only for 369 of 389 events.
- **Never smooth-scroll.** Wheel scroll is native on both pages.
- **Never `transition: all`.** 0% of computed transitions on both pages. Six CSS rules
  declare it, but none of them matched a measured element.

## Reduced motion

- Airbnb ships 11 `prefers-reduced-motion` queries per page.
- Under `reduce`, load motion dropped from 288 to 21 events on the homepage (−93%)
  and from 866 to 411 on /s/experiences (−53%). On /s/experiences, 84 animations
  survived. The skeleton shimmer is the likely survivor (basis: observed). Only
  counts were captured, not which properties remained.
- For your build: keep opacity fades and colour transitions, and drop spring
  transforms, scale and slide.

## Measurements

- Declared transitions on 966 elements across 2 pages (229 homepage, 737
  /s/experiences). The /s/experiences census hit the 6,000-element scan limit, so its
  declared counts are a floor.
- Durations (declared + hover): 300ms ×267 (27%), 200ms ×249 (25%), 100ms ×238 (24%), 250ms ×156 (16%), 150ms ×59 (6%), 175ms ×5 (1%).
- Easings (declared + hover): cubic-bezier(0.2, 0, 0, 1) ×905 (93%); linear ×69 (7%); linear() spring ×3 (0%).
- Hover: 14 probes (1 timed out on /s/experiences). 5 ran CSS motion, 0 moved or scaled, and 5 were colour-only. 1 had JS (rAF) hover motion, a scale on the category tab icon. Median in 300/200ms, out 300/200ms (homepage / experiences).
- Load: 6 animations, median 150ms, max delay 100ms (homepage) | 85 animations, median 300ms, max delay 150ms (/s/experiences).
- Scroll: 7 animations on 6 targets, median 175ms (homepage) | 734 animations, median 300ms (/s/experiences). Of those 734, 340 are shimmer loop iterations and 240 are photo fades. Reveals that move: 23; opacity-only: 373; JS reveals: 1; scroll-driven: 0.
- Stagger: the extractor reported none. The raw events show 3 cascades of 20 elements with 50ms delay steps (0–900ms).
- Wheel scroll: native (0ms) on both pages.
- Infinite loops: 0 on the homepage, 380 on /s/experiences (skeleton shimmer `kf-ng66tb`).
- Reduced motion: 11 CSS queries per page; load motion 288 → 21 | 866 → 411.
- Libraries: none detected. 980 / 945 view-transition-related CSS hits; `animation-timeline` is declared 8 times but none ran.
- CSS motion tokens: `--motion-springs-{fast,standard,slow,gentle,snappy}` with `-bounce` variants. Durations: fast 451.75ms, standard 583.77ms, slow and gentle 745.61ms, snappy 293.86ms, fast-bounce 449.12ms, medium-bounce 574.12ms, slow-bounce 762.28ms. Each has a `linear()` easing and its source mass, stiffness and damping. Also `--slide-up-from-bottom_duration: 150ms` and `--overlay-circle-indicator-transition-duration: 2s`.
- **Not measured:** listing cards, wishlist hearts, date pickers and modals, which were not hovered or opened; press states; the logged-in and booking flows; full keyframe bodies, which were truncated at about 300 characters; which properties survive under reduced motion; and touch behaviour.
