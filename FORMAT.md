# MOTION.md format (v0)

A MOTION.md tells an agent how a product moves. It is Markdown with a small YAML
frontmatter of tokens. An agent reads the prose for judgement and copies the tokens
verbatim.

It sits next to the files agents already read:

| File | Defines |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | How to build the project |
| `DESIGN.md` | How it looks |
| `MOTION.md` | How it moves |

## Rules for writing one

1. **Measured beats remembered.** Every token comes from a measurement of the live
   product: computed styles, `transitionrun`/`animationstart` events,
   `Element.animate()` calls and `document.getAnimations()`. Each token row cites
   its sample count. Give a value no measurement supports a `basis: observed` tag,
   or leave it out.
2. **Absences are rules.** If 0 of 23 hover probes moved an element, write
   "never lifts on hover". The *Never* section is where a brand differs most from
   generic AI motion.
3. **Few tokens.** Real systems use 2–4 durations and 1–3 curves. A file with ten
   durations has not found the system yet.
4. **Write for an agent.** Use imperative sentences, values with units, and say
   which element gets which motion.

## Frontmatter

```yaml
---
format: motion.md/v0
name: Linear                     # brand or product
summary: one sentence an agent can repeat
source: measured                 # measured | observed | authored
measured:
  date: 2026-10-29
  pages: [https://linear.app/, https://linear.app/features]
  tool: awesome-motion-md extractor, Chromium 156, 1440x900
  data: data/linear.summary.json
tokens:
  duration:                      # name: value  (2-5 entries)
    instant: 100ms
    quick: 160ms
  easing:                        # name: CSS <easing-function>
    out: cubic-bezier(0.25, 0.46, 0.45, 0.94)
  stagger: 33ms                  # step between siblings, or null
  distance: 0px                  # typical reveal travel, or null
reduced-motion: crossfade        # none | crossfade | instant | ignored
---
```

`tokens` keys are free-form names, but the values must be valid CSS, so an agent
can paste them as custom properties.

## Body sections, in order

| Section | Required | Contents |
|---|---|---|
| `# <Name> motion` | yes | Title, a one-paragraph thesis. |
| `## Principles` | yes | 3–6 rules, each with the number that supports it. |
| `## Tokens` | yes | Table: token, value, use for, evidence (sample count). Then a CSS block of custom properties. |
| `## Patterns` | yes | Subsections: `### Hover and press`, `### Enter`, `### Exit`, `### Page load`, `### Scroll`, `### Stagger`, `### Loops`. Each states property, duration, easing, distance. Say "none" when the brand has none. |
| `## Never` | yes | The things this brand never does that generic AI motion always does, each with its measurement. |
| `## Reduced motion` | yes | What survives under `prefers-reduced-motion: reduce`, as measured. |
| `## Measurements` | yes | Headline numbers, pages, date, and what the extractor could not see. |

## What the extractor measures

| Signal | How |
|---|---|
| Declared transitions | `getComputedStyle` on up to 6,000 elements: property, duration, easing, delay. |
| Transitions that actually ran | `transitionrun` and `animationstart` listeners, tagged by phase (load, hover-in, hover-out, scroll). |
| JS animations | A wrapped `Element.prototype.animate`, plus sampling `document.getAnimations()` every 50 ms. |
| rAF libraries (GSAP, Framer Motion JS) | A `MutationObserver` on inline `style`: bursts that end at opacity 1 are reveals, and burst length is duration. |
| Hover | Up to 24 distinct interactive patterns are hovered, then left. In and out are measured separately. |
| Scroll | Wheel down the page in 350 px steps, then group reveals by parent to find stagger. |
| Smooth scrolling | One 400 px wheel tick, with `scrollY` sampled every frame. Native scroll settles in under one frame. |
| Reduced motion | The page is loaded again with `prefers-reduced-motion: reduce`, and load motion is counted again. |
| Stylesheets | Every `cubic-bezier`, `linear()` spring, `--ease-*`/`--duration-*` token, `@keyframes`, and reduced-motion query. |

## Relationship to other specs

[2233admin/motion.md](https://github.com/2233admin/motion.md) is a separate format with
the same file name. It describes an app's motion as a state machine: states, events,
transitions, interruption and budgets. This format describes a **brand's motion
language**, measured from its site. The two do not conflict. A project can use a
brand file from this repo as the source of the curves and durations in its own
state-machine spec.
