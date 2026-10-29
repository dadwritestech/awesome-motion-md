// Turn data/raw/<brand>.json into data/<brand>.summary.json.
//   node extract/summarize.mjs [brandId ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, nameOf, shapeOf, toMs } from './easing.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// node extract/summarize.mjs [id ...] [--raw data/raw] [--out data]
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i < 0 ? dflt : path.resolve(args.splice(i, 2)[1]); };
const rawDir = flag('--raw', path.join(root, 'data', 'raw'));
const sumDir = flag('--out', path.join(root, 'data'));
const only = args;

const inc = (m, k, n = 1) => { m[k] = (m[k] || 0) + n; return m; };
const top = (m, n = 10) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
const median = (xs) => {
  const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q);
  return a.length ? a[Math.floor((a.length - 1) / 2)] : null;
};
const share = (part, whole) => (whole ? Math.round((100 * part) / whole) : 0);
const phaseOf = (p) => (p || '').split(':')[0];
const easingRow = ([k, n]) => ({ easing: k, name: nameOf(k), shape: shapeOf(k), n });
const durRow = ([k, n]) => ({ ms: Number(k), n });

// Records from all four sources, flattened to one shape.
const kfProps = (body) => [...new Set([...(body || '').matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]))].filter((p) => !/^(from|to)$/.test(p));

function records(page) {
  const M = page.motion || {};
  const kf = page.css?.keyframes || {};
  const out = [];
  for (const e of M.events || []) {
    out.push({ src: e.kind === 'transition' ? 'css-transition' : 'css-animation', phase: e.phase, t: e.t, props: e.kind === 'transition' ? [e.prop] : kfProps(kf[e.name]), name: e.name || e.prop, duration: e.duration, delay: e.delay, easing: e.easing, iterations: e.iterations, timeline: e.timeline, id: e.id, parent: e.parent, index: e.index, declared: e.declared, sel: e.sel });
  }
  for (const w of M.waapi || []) {
    out.push({ src: 'waapi', phase: w.phase, t: w.t, props: w.props, name: '', duration: w.duration, delay: w.delay, easing: w.easing, iterations: w.iterations, timeline: w.timeline, id: w.id, parent: w.parent, index: w.index, sel: w.sel });
  }
  return out;
}

function easingHist(recs) {
  const m = {};
  for (const r of recs) if (r.easing) inc(m, canonical(r.easing));
  return top(m, 8).map(easingRow);
}
function durationHist(recs) {
  const m = {};
  for (const r of recs) if (Number.isFinite(r.duration) && r.duration > 0) inc(m, Math.round(r.duration));
  return top(m, 8).map(durRow);
}
function propHist(recs) {
  const m = {};
  for (const r of recs) for (const p of r.props) inc(m, p);
  return top(m, 8);
}
function block(recs) {
  return { count: recs.length, targets: new Set(recs.map((r) => r.sel)).size, durations: durationHist(recs), easings: easingHist(recs), properties: propHist(recs), medianMs: median(recs.map((r) => r.duration).filter((d) => d > 0)) };
}

// Siblings that start the same motion in sequence: report the gap between them.
function staggers(recs) {
  const groups = {};
  for (const r of recs) {
    if (!r.parent || !(r.duration > 0)) continue;
    const k = `${r.parent}|${r.src}|${Math.round(r.duration)}|${r.props.join(',') || r.name}`;
    (groups[k] ||= []).push(r);
  }
  const gaps = [];
  const examples = [];
  for (const g of Object.values(groups)) {
    const byEl = new Map();
    for (const r of g) if (!byEl.has(r.id)) byEl.set(r.id, r);
    const items = [...byEl.values()].sort((a, b) => (a.t + a.delay) - (b.t + b.delay));
    if (items.length < 3) continue;
    const d = [];
    for (let i = 1; i < items.length; i++) d.push(Math.round((items[i].t + items[i].delay) - (items[i - 1].t + items[i - 1].delay)));
    const md = median(d);
    if (md >= 15 && md <= 400) {
      gaps.push(md);
      if (examples.length < 5) examples.push({ items: items.length, gapMs: md, duration: Math.round(items[0].duration), sel: items[0].sel });
    }
  }
  return { groups: gaps.length, medianGapMs: median(gaps), examples };
}

// rAF libraries write inline styles every frame. A burst on one element that
// ends at opacity 1 is a JS-driven reveal; its length is the burst duration.
function jsReveals(styleMut, phase) {
  const byEl = {};
  for (const m of styleMut) if (phaseOf(m.phase) === phase) (byEl[m.id] ||= []).push(m);
  const durs = [], distances = [];
  let n = 0;
  for (const muts of Object.values(byEl)) {
    if (muts.length < 4) continue;
    const ops = muts.map((m) => parseFloat(m.opacity)).filter(Number.isFinite);
    if (!ops.length || !(Math.min(...ops) < 0.5 && ops[ops.length - 1] > 0.95)) continue;
    n++;
    durs.push(muts[muts.length - 1].t - muts[0].t);
    const ty = (muts[0].transform || '').match(/translate(?:3d|Y)?\(\s*(?:[-\d.]+px\s*,\s*)?([-\d.]+)px/);
    if (ty) distances.push(Math.abs(parseFloat(ty[1])));
  }
  return { elements: n, medianMs: median(durs), medianDistancePx: median(distances) };
}

function cssRevealDistances(recs) {
  // translateY distance is not in the event; WAAPI keyframes are not kept, so
  // report only the share of scroll reveals that move as well as fade.
  const moving = recs.filter((r) => r.props.some((p) => /transform|translate/.test(p))).length;
  return { withTransform: moving, opacityOnly: recs.filter((r) => r.props.length === 1 && r.props[0] === 'opacity').length };
}

function hoverStats(page) {
  const recs = records(page);
  const probes = (page.hover || []).filter((h) => !h.error);
  let moved = 0, transformed = 0, colorOnly = 0;
  const inDur = [], outDur = [], asym = [];
  const props = {};
  let jsHover = 0, jsTransform = 0;
  const muts = page.motion.styleMut || [];
  for (const h of probes) {
    const ins = recs.filter((r) => r.phase === `hover-in:${h.i}` && r.src === 'css-transition');
    const outs = recs.filter((r) => r.phase === `hover-out:${h.i}` && r.src === 'css-transition');
    const allIn = recs.filter((r) => r.phase === `hover-in:${h.i}`);
    // rAF-driven hover: several inline-style frames written while hovering.
    const js = muts.filter((m) => m.phase === `hover-in:${h.i}`);
    if (js.length >= 3) {
      jsHover++;
      if (new Set(js.map((m) => m.transform)).size > 2) jsTransform++;
    }
    if (!allIn.length) continue;
    moved++;
    for (const r of allIn) for (const p of r.props) inc(props, p);
    if (allIn.some((r) => r.props.some((p) => /^(transform|translate|scale|rotate|width|height|top|left|right|bottom|inset|margin.*)$/.test(p)))) transformed++;
    else if (allIn.every((r) => r.props.every((p) => /color|background|border|opacity|fill|stroke|shadow|outline|text-decoration/.test(p)))) colorOnly++;
    const mi = median(ins.map((r) => r.duration)), mo = median(outs.map((r) => r.duration));
    if (mi != null) inDur.push(mi);
    if (mo != null) outDur.push(mo);
    if (mi != null && mo != null) asym.push(mo - mi);
  }
  const inRecs = recs.filter((r) => phaseOf(r.phase) === 'hover-in');
  const outRecs = recs.filter((r) => phaseOf(r.phase) === 'hover-out');
  return {
    probed: probes.length, withMotion: moved, withTransform: transformed, colorOnly, jsHover, jsTransform,
    medianInMs: median(inDur), medianOutMs: median(outDur), medianOutMinusInMs: median(asym),
    properties: top(props, 8),
    in: block(inRecs), out: block(outRecs),
  };
}

function wheelStats(trace) {
  if (!trace || trace.length < 3) return null;
  const final = trace[trace.length - 1][1];
  if (final <= 0) return { smooth: null, note: 'page did not scroll' };
  const start = trace.find((p) => p[1] > 0);
  const reach = trace.find((p) => p[1] >= final * 0.95);
  const ms = start && reach ? reach[0] - start[0] : null;
  return { finalPx: final, settleMs: ms, smooth: ms != null ? ms > 120 : null };
}

function summarizePage(page) {
  if (!page.ok) return { url: page.url, ok: false, error: page.error };
  const recs = records(page);
  const anims = page.motion.anims || [];
  const census = page.census;
  const declared = { durations: {}, easings: {}, props: {}, total: 0 };
  for (const [k, n] of Object.entries(census.transitions)) {
    const [prop, dur, ease] = k.split(' | ');
    declared.total += n;
    inc(declared.durations, toMs(dur), n);
    inc(declared.easings, canonical(ease), n);
    inc(declared.props, prop, n);
  }
  const load = recs.filter((r) => r.phase === 'load' && r.iterations !== 'infinite' && r.iterations !== Infinity);
  const scroll = recs.filter((r) => r.phase === 'scroll');
  // JSON turns Infinity into null, so sampled animations lose the marker; CSS events keep 'infinite'.
  const infSeen = new Set();
  const infinite = [...recs.filter((r) => r.iterations === 'infinite'), ...anims.filter((a) => a.iterations === Infinity || a.iterations === 'Infinity')]
    .filter((a) => { const k = `${a.id}|${a.name}`; if (infSeen.has(k)) return false; infSeen.add(k); return true; });
  const scrollDriven = anims.filter((a) => /Scroll|View/.test(a.timeline || '')).length;
  const loadMotion = recs.filter((r) => r.phase === 'load').length + page.motion.styleMut.filter((m) => m.phase === 'load').length;
  const rm = page.reducedMotionRun?.motion;
  const rmMotion = rm ? (rm.events + rm.waapi + rm.styleMut) : null;
  return {
    url: page.url, finalUrl: page.finalUrl, title: page.title, ok: true, pageHeight: page.pageHeight,
    libs: census.libs,
    declared: {
      elementsWithTransitions: declared.total,
      durations: top(declared.durations, 8).map(durRow),
      easings: top(declared.easings, 8).map(easingRow),
      properties: top(declared.props, 8),
      transitionAllShare: share(declared.props.all || 0, declared.total),
    },
    load: { ...block(load), maxDelayMs: Math.max(0, ...load.map((r) => r.delay || 0)), stagger: staggers(load), jsReveals: jsReveals(page.motion.styleMut, 'load') },
    hover: hoverStats(page),
    scroll: { ...block(scroll), reveal: cssRevealDistances(scroll), stagger: staggers(scroll), jsReveals: jsReveals(page.motion.styleMut, 'scroll'), scrollDrivenAnimations: scrollDriven, cssAnimationTimeline: page.css.animationTimeline },
    wheel: wheelStats(page.wheelTrace),
    ambient: { infiniteAnimations: infinite.length, names: [...new Set(infinite.map((a) => (a.name || '').replace(/\d+/g, '#')))].slice(0, 8) },
    waapi: block(recs.filter((r) => r.src === 'waapi')),
    reducedMotion: { cssQueries: page.css.reducedMotionQueries, loadMotionFull: loadMotion, loadMotionReduced: rmMotion },
    css: {
      cubicBeziers: top(page.css.cubicBeziers, 10).map(([k, n]) => ({ easing: canonical(k), name: nameOf(k), shape: shapeOf(k), n })),
      linearEasings: page.css.linearEasings,
      tokenVars: Object.fromEntries(Object.entries(page.css.durationVars).slice(0, 40)),
      keyframes: Object.keys(page.css.keyframes).map((k) => k.replace(/\d+/g, '#')).filter((v, i, a) => a.indexOf(v) === i).slice(0, 25),
      transitionAll: page.css.transitionAll,
      viewTransition: page.css.viewTransition,
      scrollBehaviorSmooth: page.css.scrollBehaviorSmooth,
    },
  };
}

for (const f of fs.readdirSync(rawDir)) {
  const id = f.replace(/\.json$/, '');
  if (only.length && !only.includes(id)) continue;
  const raw = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf8'));
  const summary = { brand: raw.brand, name: raw.name, measuredAt: raw.measuredAt, chromium: raw.chromium, viewport: raw.viewport, pages: raw.pages.map(summarizePage) };
  fs.writeFileSync(path.join(sumDir, `${id}.summary.json`), JSON.stringify(summary, null, 1));
  console.log(`wrote ${path.relative(root, path.join(sumDir, `${id}.summary.json`))}`);
}
