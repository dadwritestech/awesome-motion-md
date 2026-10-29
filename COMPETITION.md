# Competition check

Run on 2026-10-29 with `gh search repos` and `gh api repos/...`. GitHub's search rate limit
cut the first batch short, so queries are listed with their status.

## Queries

| Query | Result |
|---|---|
| `MOTION.md` | 8 hits. One is relevant: `2233admin/motion.md` (below). The rest are React Native button libraries, Material motion demos and motion-platform hardware. |
| `motion.md brand` | 0 hits |
| `awesome motion` | 8 hits: motion *planning* (robotics), motion diffusion papers, Motion Canvas, a list of GSAP/Remotion/Lottie agent skills. No brand files. |
| `animation language brand agent` | 0 hits |
| `motion design tokens agent` | 0 hits |
| `AI animation linter` | 0 hits |
| `motion lint css` | rate-limited (HTTP 403), see re-run below |

## Closest neighbours

| Repo | Stars | Created | What it is | Overlap |
|---|---|---|---|---|
| [2233admin/motion.md](https://github.com/2233admin/motion.md) | 4 | 2026-07-20 | A *format spec* for MOTION.md: YAML states, events, transitions, interruption, reduced motion, performance budgets, plus a JSON Schema. Last push 2026-07-25. | Same file name. No brand files, no measurement, no linter. |
| [2233admin/design-pipeline](https://github.com/2233admin/design-pipeline) | 12 | 2026-07-04 | Agent pipeline that writes DESIGN.md and MOTION.md before code. | Uses the 2233admin spec. No brand files. |
| [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) | 86 | 2026-06-18 | A list of agent skills for GSAP, Motion, Remotion, Lottie, Rive. | Library how-tos, not brand motion languages. |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | 124k | — | 84 brand DESIGN.md files. | Our inspiration. 34 of its 84 files never mention transition, animation, easing, duration or motion. Only 2 contain a `cubic-bezier`. Its Linear file mentions motion zero times. |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 90k | — | AI-design detector. | Its 62-rule registry has three motion rules: `bounce-easing`, `pulsing-dot` and `blinking-cursor`. It retired `layout-transition`. Nothing on uniform timing, fade-up-everything or stagger. |

## Conclusion

- The *name* MOTION.md is taken by a 4-star format spec. We do not claim to have invented the
  file name. Our README credits it and says how this repo differs: brand files measured from live
  sites, and a linter.
- Nobody ships **brand** motion files, and nobody **measures** them from live sites.
- Nobody ships a deterministic linter for generic AI motion. impeccable covers bounce only.
