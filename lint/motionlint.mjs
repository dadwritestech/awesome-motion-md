#!/usr/bin/env node
// motionlint: deterministic detector for generic AI motion.
//   node lint/motionlint.mjs [paths...] [--json] [--quiet]
// Exit codes: 0 clean (advisories allowed), 2 warnings found, 1 usage error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULES = {
  'uniform-timing': { severity: 'warning', title: 'One timing for everything', hint: 'Real motion systems use 2-4 durations: ~100-160ms for feedback, ~200-300ms for state changes, longer only for authored moments.' },
  'keyword-easing-only': { severity: 'warning', title: 'No authored easing curve', hint: 'Every curve is a CSS/library keyword (ease, ease-in-out, easeInOut). Pick a decelerating cubic-bezier for entrances, e.g. cubic-bezier(0.25, 0.46, 0.45, 0.94).' },
  'ease-in-out-ui': { severity: 'advisory', title: 'ease-in-out on UI feedback', hint: 'ease-in-out starts slow, so a hover or toggle feels late. Use an ease-out curve for anything that responds to input.' },
  'fade-up-everything': { severity: 'warning', title: 'Fade-up on every element', hint: 'Reveal the section, not every child. Most measured brands reveal with opacity only, or not at all.' },
  'bounce-everywhere': { severity: 'warning', title: 'Bounce/overshoot on many elements', hint: 'Overshoot reads as playful. Reserve it for one deliberate moment, or remove it.' },
  'overshoot-easing': { severity: 'advisory', title: 'Overshooting curve', hint: 'This curve overshoots its target (bounce). Check it is intentional.' },
  'transition-all': { severity: 'warning', title: 'transition: all', hint: 'Name the properties. `all` animates layout and colour changes you did not design, and costs paint.' },
  'animating-layout': { severity: 'warning', title: 'Animating a layout property', hint: 'width/height/top/left/margin/padding animate on the main thread and jank. Use transform/opacity, or FLIP.' },
  'hover-lift-everywhere': { severity: 'warning', title: 'Hover scale/lift on many elements', hint: 'A scale-up or lift on every card and button is the generic AI hover. Most measured brands change colour only on hover.' },
  'no-reduced-motion': { severity: 'warning', title: 'No reduced-motion path', hint: 'Add @media (prefers-reduced-motion: reduce), useReducedMotion(), or motion-reduce: variants.' },
  'sluggish-feedback': { severity: 'warning', title: 'Colour feedback slower than 400ms', hint: 'Colour/background/border changes are feedback. Above ~400ms they read as lag; measured brands use 100-200ms.' },
  'slow-stagger': { severity: 'advisory', title: 'Stagger step of 100ms or more', hint: 'Long steps make lists feel slow. Measured stagger steps are 30-80ms.' },
  'ambient-loop': { severity: 'advisory', title: 'Decorative infinite loop', hint: 'Infinite pulse/float/glow loops are a generated-UI tell. Keep loops for loading states only.' },
};

const EXTS = new Set(['.css', '.scss', '.sass', '.less', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue', '.svelte', '.astro']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'vendor']);

const KEYWORD_EASINGS = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'easein', 'easeout', 'easeinout', 'tw-default', 'power1.inout', 'power2.inout', 'power1.out', 'power2.out', 'power3.out', 'power1.in', 'power2.in', 'sine.inout', 'none']);
const EASE_IN_OUT_FAMILY = /^(ease-in-out|easeinout|power\d\.inout|sine\.inout|ease)$/;
const BOUNCE_WORD = /\b(bounce|elastic|wobble|jiggle|rubber-?band|jello|tada)\w*/i;
const LAYOUT_PROPS = /^(width|height|max-height|max-width|min-height|top|left|right|bottom|margin(-\w+)?|padding(-\w+)?)$/;
const COLOR_PROPS = /^(color|background|background-color|border-color|border|outline-color|fill|stroke|box-shadow)$/;
const LOADING_WORD = /(spin|rotat|load|skeleton|shimmer|progress|caret|cursor|marquee|ticker)/i;

// ---------------------------------------------------------------------------
// Value helpers

export function toMs(v) {
  const s = String(v).trim();
  if (/^-?[\d.]+ms$/.test(s)) return parseFloat(s);
  if (/^-?[\d.]+s$/.test(s)) return parseFloat(s) * 1000;
  return null;
}

export function splitTopLevel(s, sep = ',') {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === sep && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function bezierOvershoots(args) {
  const n = args.map(Number);
  return n.length === 4 && n.every(Number.isFinite) && (n[1] < -0.1 || n[1] > 1.1 || n[3] < -0.1 || n[3] > 1.1);
}

function normEasing(e) {
  if (!e) return 'ease';
  const s = e.trim().replace(/^['"`]|['"`]$/g, '').replace(/\s+/g, '');
  const low = s.toLowerCase();
  if (low.startsWith('cubic-bezier(')) return 'cubic-bezier(' + low.slice(13);
  if (low.startsWith('[')) return 'cubic-bezier(' + low.slice(1, -1) + ')';
  const framer = { easeinout: 'ease-in-out', easeout: 'ease-out', easein: 'ease-in' };
  return framer[low] || low;
}

const easingOvershoots = (e) => {
  const m = e.match(/^cubic-bezier\(([^)]*)\)$/);
  if (m) return bezierOvershoots(m[1].split(','));
  return /^(back|elastic|bounce|backout|backinout|anticipate)/.test(e) || BOUNCE_WORD.test(e);
};

// Parse one CSS `transition` / `animation` shorthand item into its parts.
export function parseShorthand(item) {
  const tokens = splitTopLevel(item, ' ').filter(Boolean);
  const times = [], rest = [];
  let easing = null, infinite = false;
  for (const t of tokens) {
    const ms = toMs(t);
    if (ms != null) times.push(ms);
    else if (/^(cubic-bezier|steps|linear)\(/i.test(t) || /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/i.test(t)) easing = t;
    else if (t === 'infinite') infinite = true;
    else if (/^var\(/.test(t) && rest.length && !easing) easing = t; // authored token, e.g. var(--ease-out)
    else rest.push(t);
  }
  return { duration: times[0] ?? null, delay: times[1] ?? 0, easing, infinite, names: rest };
}

// ---------------------------------------------------------------------------
// Extraction: every file becomes a list of motion facts with line numbers.

function lineAt(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

export function extract(text, file = '<input>') {
  const facts = { timings: [], findings: [], fadeUps: [], bounces: [], hoverLifts: [], hasMotion: 0, reducedMotion: false };
  const at = (i) => lineAt(text, i);
  const add = (rule, index, detail) => facts.findings.push({ rule, file, line: at(index), detail });

  // Fade-up keyframes defined in this file: opacity 0 plus a downward offset at the start.
  const fadeUpKeyframes = new Set();
  for (const m of text.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
    const body = m[2];
    const start = body.match(/(?:from|0%)\s*\{([^}]*)\}/);
    if (start && /opacity\s*:\s*0(?![.\d])/.test(start[1]) && /translate(?:Y|3d)?\(\s*(?:[-\d.]+\w*\s*,\s*)?\d*\.?\d+(px|rem|em|%)/.test(start[1]) && !/translateY\(\s*-/.test(start[1])) {
      fadeUpKeyframes.add(m[1]);
    }
  }
  facts.fadeUpKeyframes = fadeUpKeyframes;

  // CSS and inline-style transition shorthands: `transition: ...` / transition: "..."
  for (const m of text.matchAll(/(?<![-\w])transition\s*:\s*(['"`]?)([^;{}\n'"`]+)\1/g)) {
    const value = m[2].trim();
    if (/^(none|initial|inherit|unset|\{)/.test(value) || value.startsWith('{')) continue;
    for (const item of splitTopLevel(value)) {
      const p = parseShorthand(item);
      if (p.duration == null) continue;
      const prop = (p.names[0] || 'all').toLowerCase();
      const easing = normEasing(p.easing);
      facts.timings.push({ duration: p.duration, easing, prop, line: at(m.index), source: 'css' });
      facts.hasMotion++;
      if (prop === 'all') add('transition-all', m.index, `transition: ${value}`);
      if (LAYOUT_PROPS.test(prop)) add('animating-layout', m.index, `transition: ${item}`);
      if (COLOR_PROPS.test(prop) && p.duration > 400) add('sluggish-feedback', m.index, `${prop} ${p.duration}ms`);
      if (easingOvershoots(easing)) { facts.bounces.push(at(m.index)); add('overshoot-easing', m.index, easing); }
    }
  }
  for (const m of text.matchAll(/transition-property\s*:\s*([^;}\n]+)/g)) {
    for (const prop of splitTopLevel(m[1])) {
      if (prop.trim() === 'all') add('transition-all', m.index, m[0].trim());
      if (LAYOUT_PROPS.test(prop.trim())) add('animating-layout', m.index, m[0].trim());
    }
  }
  for (const m of text.matchAll(/(?:transition|animation)-timing-function\s*:\s*([^;}\n]+)/g)) {
    const e = normEasing(m[1]);
    if (easingOvershoots(e)) { facts.bounces.push(at(m.index)); add('overshoot-easing', m.index, e); }
  }

  // CSS animation shorthands.
  for (const m of text.matchAll(/(?<![-\w])animation\s*:\s*(['"`]?)([^;{}\n'"`]+)\1/g)) {
    for (const item of splitTopLevel(m[2])) {
      const p = parseShorthand(item);
      const name = p.names[0] || '';
      if (!name || name === 'none') continue;
      facts.hasMotion++;
      if (p.duration != null) facts.timings.push({ duration: p.duration, easing: normEasing(p.easing), prop: 'animation', line: at(m.index), source: 'css-animation' });
      if (BOUNCE_WORD.test(name) || (p.easing && easingOvershoots(normEasing(p.easing)))) facts.bounces.push(at(m.index));
      if (p.infinite && !LOADING_WORD.test(name)) add('ambient-loop', m.index, `animation: ${item.trim()}`);
      facts.animationUses = facts.animationUses || [];
      facts.animationUses.push({ name, line: at(m.index) });
    }
  }
  for (const m of text.matchAll(/animation-name\s*:\s*([\w-]+)/g)) {
    facts.animationUses = facts.animationUses || [];
    facts.animationUses.push({ name: m[1], line: at(m.index) });
  }

  // Hover lifts in CSS: a :hover rule whose body scales up or moves up.
  for (const m of text.matchAll(/:hover[^{]*\{([^}]*)\}/g)) {
    // A big drop shadow appearing on hover counts too, as Tailwind's hover:shadow-lg does below.
    if (/transform\s*:[^;]*(scale\(\s*1\.0*[1-9]|translateY\(\s*-)/.test(m[1]) || /box-shadow\s*:\s*[^;]*?\s(1[2-9]|[2-9]\d)px/.test(m[1])) facts.hoverLifts.push(at(m.index));
  }

  // Tailwind class strings.
  for (const m of text.matchAll(/class(?:Name)?\s*=\s*(?:\{\s*)?["'`]([^"'`]+)["'`]/g)) {
    const cls = m[1].split(/\s+/);
    const has = (re) => cls.some((c) => re.test(c));
    if (has(/^transition(-all|-colors|-opacity|-transform|-shadow)?$/)) {
      facts.hasMotion++;
      const d = cls.map((c) => c.match(/^duration-(\d+)$/)).find(Boolean);
      const e = cls.map((c) => c.match(/^ease-(in-out|in|out|linear)$/)).find(Boolean);
      facts.timings.push({ duration: d ? Number(d[1]) : 150, easing: e ? (e[1] === 'linear' ? 'linear' : 'ease-' + e[1]) : 'tw-default', prop: cls.includes('transition-colors') ? 'color' : 'tw', line: at(m.index), source: 'tailwind' });
      if (cls.includes('transition-all')) add('transition-all', m.index, 'transition-all');
    }
    if (has(/^animate-bounce$/)) facts.bounces.push(at(m.index));
    if (has(/^animate-(ping|pulse)$/) && !has(/skeleton|loading/)) add('ambient-loop', m.index, cls.find((c) => /^animate-(ping|pulse)$/.test(c)));
    if (has(/^(animate-)?(fade-?in-?up|fade-?up|slide-?up|slide-?in-?up|reveal-?up)$/i)) facts.fadeUps.push(at(m.index));
    if (has(/^(group-)?hover:(scale-1[0-9][0-9]|-translate-y-|shadow-(lg|xl|2xl))/)) facts.hoverLifts.push(at(m.index));
    if (has(/^motion-reduce:|^motion-safe:/)) facts.reducedMotion = true;
  }

  // Framer Motion / Motion One props.
  for (const m of text.matchAll(/initial\s*=\s*\{\{([^}]*)\}\}/g)) {
    if (/opacity\s*:\s*0(?![.\d])/.test(m[1]) && /\by\s*:\s*\d*\.?\d+/.test(m[1])) facts.fadeUps.push(at(m.index));
    facts.hasMotion++;
  }
  for (const m of text.matchAll(/hidden\s*:\s*\{([^}]*)\}/g)) {
    if (/opacity\s*:\s*0(?![.\d])/.test(m[1]) && /\by\s*:\s*\d*\.?\d+/.test(m[1])) facts.fadeUps.push(at(m.index));
  }
  for (const m of text.matchAll(/whileHover\s*=\s*\{\{([^}]*)\}\}/g)) {
    if (/scale\s*:\s*1\.0*[1-9]|\by\s*:\s*-/.test(m[1])) facts.hoverLifts.push(at(m.index));
  }
  for (const m of text.matchAll(/transition\s*[=:]\s*\{\{?([^{}]*)\}?\}/g)) {
    const body = m[1];
    const dur = body.match(/\bduration\s*:\s*([\d.]+)/);
    const ease = body.match(/\bease\s*:\s*(\[[^\]]*\]|["'][^"']+["'])/);
    const spring = /type\s*:\s*["']spring["']/.test(body);
    if (dur) {
      facts.hasMotion++;
      facts.timings.push({ duration: Number(dur[1]) * 1000, easing: ease ? normEasing(ease[1]) : (spring ? 'spring' : 'easeout'), prop: 'framer', line: at(m.index), source: 'framer' });
    }
    if (ease && easingOvershoots(normEasing(ease[1]))) facts.bounces.push(at(m.index));
    const bounce = body.match(/\bbounce\s*:\s*([\d.]+)/);
    const damping = body.match(/\bdamping\s*:\s*([\d.]+)/);
    if (spring && ((bounce && Number(bounce[1]) >= 0.3) || (damping && Number(damping[1]) < 12))) facts.bounces.push(at(m.index));
    const stag = body.match(/staggerChildren\s*:\s*([\d.]+)/);
    if (stag && Number(stag[1]) >= 0.1) add('slow-stagger', m.index, `staggerChildren: ${stag[1]}`);
  }
  for (const m of text.matchAll(/staggerChildren\s*:\s*([\d.]+)/g)) {
    if (Number(m[1]) >= 0.1 && !facts.findings.some((f) => f.rule === 'slow-stagger' && f.line === at(m.index))) add('slow-stagger', m.index, `staggerChildren: ${m[1]}`);
  }
  // delay: i * 0.1 / index * 150 / calc(var(--i) * 120ms)
  for (const m of text.matchAll(/(?:delay\s*:\s*|animation-delay\s*:\s*calc\(|transition-delay\s*:\s*calc\()\s*(?:\w+\s*\*\s*([\d.]+)(ms|s)?|var\(--[\w-]+\)\s*\*\s*([\d.]+)(ms|s))/g)) {
    const v = Number(m[1] ?? m[3]);
    const unit = m[2] ?? m[4];
    const ms = unit === 'ms' ? v : unit === 's' ? v * 1000 : v < 5 ? v * 1000 : v;
    if (ms >= 100) add('slow-stagger', m.index, `${Math.round(ms)}ms per item`);
  }
  // GSAP: gsap.to(x, { duration: 0.3, ease: "power2.inOut" })
  for (const m of text.matchAll(/gsap\.(?:to|from|fromTo)\([^)]*?\{([^}]*)\}/g)) {
    const dur = m[1].match(/duration\s*:\s*([\d.]+)/);
    const ease = m[1].match(/ease\s*:\s*["']([^"']+)["']/);
    facts.hasMotion++;
    facts.timings.push({ duration: dur ? Number(dur[1]) * 1000 : 500, easing: ease ? ease[1].toLowerCase() : 'power1.out', prop: 'gsap', line: at(m.index), source: 'gsap' });
    if (ease && /bounce|elastic|back/i.test(ease[1])) facts.bounces.push(at(m.index));
    if (/\bopacity\s*:\s*0(?![.\d])/.test(m[1]) && /\by\s*:\s*\d/.test(m[1]) && /gsap\.from/.test(m[0])) facts.fadeUps.push(at(m.index));
  }
  // AOS / data attributes.
  for (const m of text.matchAll(/data-(?:aos|animate|sal)\s*=\s*["'](fade-up|slide-up|fade-in-up)["']/g)) facts.fadeUps.push(at(m.index));

  if (/prefers-reduced-motion|useReducedMotion|reducedMotion\s*[:=]|matchMedia\(\s*['"]\(prefers-reduced-motion/.test(text)) facts.reducedMotion = true;
  return facts;
}

// ---------------------------------------------------------------------------
// Ignores: `motionlint-disable rule-a, rule-b` (file) and
// `motionlint-disable-next-line rule` / `motionlint-disable-line rule`.

function ignoresFor(text) {
  const file = new Set();
  const lines = new Map();
  text.split('\n').forEach((raw, i) => {
    const l = raw.replace(/\*\/|-->/g, ' '); // a comment's closing `*/` is not a wildcard
    let m;
    if ((m = l.match(/motionlint-disable-next-line\s*([\w\s,*-]*)/))) lines.set(i + 2, ids(m[1]));
    else if ((m = l.match(/motionlint-disable-line\s*([\w\s,*-]*)/))) lines.set(i + 1, ids(m[1]));
    else if ((m = l.match(/motionlint-disable\s*([\w\s,*-]*)/))) ids(m[1]).forEach((r) => file.add(r));
  });
  return { file, lines };
}
const ids = (s) => {
  const list = s.split(/[\s,]+/).map((x) => x.trim()).filter((x) => RULES[x] || x === '*');
  return list.length ? list : ['*'];
};
const ignored = (ig, rule, line) =>
  ig.file.has('*') || ig.file.has(rule) || (ig.lines.get(line) || []).some((r) => r === '*' || r === rule);

// ---------------------------------------------------------------------------
// Project-level analysis across all files.

export function lintSources(sources, opts = {}) {
  const minSamples = opts.minSamples ?? 5;
  const findings = [];
  const all = { timings: [], fadeUps: [], bounces: [], hoverLifts: [], hasMotion: 0, reducedMotion: false };
  const fadeUpNames = new Set();
  const perFile = sources.map(({ file, text }) => ({ file, text, facts: extract(text, file), ig: ignoresFor(text) }));
  for (const { facts } of perFile) facts.fadeUpKeyframes.forEach((n) => fadeUpNames.add(n));

  const keep = (f, ig) => !ignored(ig, f.rule, f.line);
  for (const { file, facts, ig } of perFile) {
    for (const f of facts.findings) if (keep(f, ig)) findings.push(f);
    const tag = (line) => ({ file, line });
    all.timings.push(...facts.timings.filter((t) => !ignored(ig, 'uniform-timing', t.line)).map((t) => ({ ...t, file })));
    for (const u of facts.animationUses || []) if (fadeUpNames.has(u.name)) facts.fadeUps.push(u.line);
    all.fadeUps.push(...facts.fadeUps.filter((l) => !ignored(ig, 'fade-up-everything', l)).map(tag));
    all.bounces.push(...facts.bounces.filter((l) => !ignored(ig, 'bounce-everywhere', l)).map(tag));
    all.hoverLifts.push(...facts.hoverLifts.filter((l) => !ignored(ig, 'hover-lift-everywhere', l)).map(tag));
    all.hasMotion += facts.hasMotion;
    all.reducedMotion ||= facts.reducedMotion;
  }
  const first = (list) => list[0] || { file: sources[0]?.file || '<input>', line: 1 };
  const project = (rule, where, detail) => findings.push({ rule, file: where.file, line: where.line, detail });

  // Timing uniformity.
  // Keyframe animations (loops, entrances) are judged by their own rules.
  const t = all.timings.filter((x) => x.source !== 'css-animation');
  if (t.length >= minSamples) {
    const pairs = {};
    for (const x of t) {
      const k = `${Math.round(x.duration)}ms ${x.easing}`;
      pairs[k] = (pairs[k] || 0) + 1;
    }
    const durs = {};
    for (const x of t) durs[Math.round(x.duration)] = (durs[Math.round(x.duration)] || 0) + 1;
    const [topPair, n] = Object.entries(pairs).sort((a, b) => b[1] - a[1])[0];
    const [topDur, nd] = Object.entries(durs).sort((a, b) => b[1] - a[1])[0];
    if (n / t.length >= 0.6) project('uniform-timing', first(t), `${n} of ${t.length} motion declarations use ${topPair}`);
    else if (nd / t.length >= 0.75) project('uniform-timing', first(t), `${nd} of ${t.length} motion declarations last ${topDur}ms`);
    const keyworded = t.filter((x) => KEYWORD_EASINGS.has(x.easing)).length;
    if (keyworded === t.length) project('keyword-easing-only', first(t), `all ${t.length} motion declarations use keyword easings (${[...new Set(t.map((x) => x.easing))].join(', ')})`);
    const uiInOut = t.filter((x) => x.duration <= 400 && EASE_IN_OUT_FAMILY.test(x.easing) && x.easing !== 'ease');
    if (uiInOut.length >= 3) project('ease-in-out-ui', first(uiInOut), `${uiInOut.length} short UI transitions use ${uiInOut[0].easing}`);
  }
  if (all.fadeUps.length >= (opts.fadeUpMin ?? 4)) project('fade-up-everything', first(all.fadeUps), `${all.fadeUps.length} elements fade up into place`);
  if (all.bounces.length >= (opts.bounceMin ?? 3)) project('bounce-everywhere', first(all.bounces), `${all.bounces.length} bounce/overshoot animations`);
  if (all.hoverLifts.length >= (opts.hoverMin ?? 3)) project('hover-lift-everywhere', first(all.hoverLifts), `${all.hoverLifts.length} elements scale or lift on hover`);
  if (all.hasMotion >= 3 && !all.reducedMotion) project('no-reduced-motion', first(t), `${all.hasMotion} motion declarations, no prefers-reduced-motion handling`);

  // The project rules above can be silenced file-wide in the file they point at.
  const igByFile = new Map(perFile.map((p) => [p.file, p.ig]));
  const out = findings.filter((f) => !ignored(igByFile.get(f.file) || { file: new Set(), lines: new Map() }, f.rule, f.line));
  out.sort((a, b) => (a.file + a.line).localeCompare(b.file + b.line, undefined, { numeric: true }));
  return out.map((f) => ({ ...f, severity: RULES[f.rule].severity, title: RULES[f.rule].title, hint: RULES[f.rule].hint }));
}

export function collectFiles(paths) {
  const out = [];
  const walk = (p) => {
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      for (const e of fs.readdirSync(p)) if (!SKIP_DIRS.has(e)) walk(path.join(p, e));
    } else if (EXTS.has(path.extname(p).toLowerCase()) && st.size < 2_000_000) out.push(p);
  };
  paths.forEach(walk);
  return out;
}

function main(argv) {
  const args = argv.filter((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  if (flags.has('--help')) {
    console.log('Usage: motionlint [paths...] [--json] [--quiet] [--list-rules]\nExit: 0 clean, 2 warnings found.');
    return 0;
  }
  if (flags.has('--list-rules')) {
    for (const [id, r] of Object.entries(RULES)) console.log(`${id.padEnd(22)} ${r.severity.padEnd(9)} ${r.title}`);
    return 0;
  }
  const files = collectFiles(args.length ? args : ['.']);
  const sources = files.map((file) => ({ file: path.relative(process.cwd(), file) || file, text: fs.readFileSync(file, 'utf8') }));
  const findings = lintSources(sources);
  const warnings = findings.filter((f) => f.severity === 'warning');
  if (flags.has('--json')) console.log(JSON.stringify({ files: files.length, findings }, null, 2));
  else if (!flags.has('--quiet')) {
    for (const f of findings) console.log(`${f.file}:${f.line}  ${f.severity === 'warning' ? 'warn' : 'note'}  ${f.rule}  ${f.detail}\n    ${f.hint}`);
    console.log(`\n${files.length} files, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}, ${findings.length - warnings.length} advisor${findings.length - warnings.length === 1 ? 'y' : 'ies'}.`);
  } else if (warnings.length) console.error(`${warnings.length} motion tell${warnings.length === 1 ? '' : 's'} found.`);
  return warnings.length ? 2 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
