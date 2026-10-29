# Demo results

Both pages were built by the same agent (Claude Sonnet) from the same prompt (`demo/PROMPT.md`).
The second build was also told to follow `motion/linear/MOTION.md`. Both were then measured
with the same extractor that measured linear.app.

| | Without MOTION.md | With linear/MOTION.md | linear.app (measured) |
|---|---|---|---|
| Distinct durations | 7 | 2 | 6 |
| Top durations | 180ms (31%), 220ms (25%), 200ms (22%) | 160ms (61%), 100ms (39%) | 100ms (52%), 160ms (36%), 700ms (4%) |
| Distinct curves | 2 | 1 | 5 |
| Top curve | ease (69%) | easeOutQuad (100%) | easeOutQuad (77%) |
| Transitions on `transform` | 31% | 3% | 12% |
| Transitions on `box-shadow` | 18% | 0% | 2% |
| Load animates | opacity + transform | opacity | opacity + filter + transform |
| Load stagger | 60ms | none | 33, 144ms |
| motionlint findings | 1 | 0 | n/a |

