---
name: motion-md
description: Use when adding or changing animations, transitions, hover states, page-load or scroll effects, dialogs, toasts or any UI motion, or when the project has a MOTION.md. Applies the project's measured motion language instead of generic defaults, then checks the result for AI motion tells.
---

# MOTION.md

A MOTION.md describes how a product moves: duration and easing tokens, which element
gets which motion, and what the brand never does. Its numbers were measured from a
live site. Treat them as the spec, not as suggestions.

## Before writing any motion

1. Look for `MOTION.md` in the project root, then in `docs/` and `design/`.
2. If there is none, do not invent a motion language. Use these defaults and tell the
   user that a MOTION.md would make the result specific:
   - interaction feedback 100–200ms, an ease-out curve, colour or opacity only
   - no hover lifts, no bounce, no fade-up on scroll, no `transition: all`
   - a `prefers-reduced-motion` fallback
   To add one, copy a brand file from https://github.com/dadwritestech/awesome-motion-md
   into the project root.
3. Read the whole file. Note the frontmatter `tokens` and the `## Never` section.

## While writing motion

- Put the tokens in once as CSS custom properties (the file's `## Tokens` CSS block),
  then use only those. Do not write a raw duration or curve that is not a token.
- Follow `## Patterns` per element: hover and press, enter, exit, page load, scroll,
  stagger, loops. When a pattern says "none", add no motion there.
- Name transition properties. Never `transition: all`.
- Animate `transform`, `opacity` and `filter`; do not animate layout properties
  (`width`, `height`, `top`, `margin`).
- Every item in `## Never` is a hard rule.
- Implement `## Reduced motion` as written.

## After writing motion

Run the linter if the repository has it, or from a checkout of awesome-motion-md:

```bash
node path/to/awesome-motion-md/lint/motionlint.mjs src/
```

Fix every `warn` finding, or justify it to the user. Exit code 2 means warnings were
found. Advisories are judgement calls; check them against the MOTION.md.

In your summary, list which tokens you used and where.
