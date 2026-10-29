// Draft a MOTION.md from data/<brand>.summary.json. The draft is then edited by hand;
// generated numbers stay in the Measurements section so edits can be checked.
//   node extract/generate.mjs <brandId> [--stdout]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nameOf, shapeOf } from './easing.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const s = JSON.parse(fs.readFileSync(path.join(root, 'data', `${id}.summary.json`), 'utf8'));
const pages = s.pages.filter((p) => p.ok);

const merge = (rows, key) => {
  const m = {};
  for (const r of rows) m[r[key]] = (m[r[key]] || 0) + r.n;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const sum = (f) => pages.reduce((a, p) => a + (f(p) || 0), 0);
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

// Durations and easings an agent should use: declared on elements, plus what ran on hover.
const durs = merge(pages.flatMap((p) => [...p.declared.durations, ...p.hover.in.durations]), 'ms');
const eases = merge(pages.flatMap((p) => [...p.declared.easings, ...p.hover.in.easings]), 'easing');
const totalDur = durs.reduce((a, [, n]) => a + n, 0);
const totalEase = eases.reduce((a, [, n]) => a + n, 0);

const hover = {
  probed: sum((p) => p.hover.probed), moved: sum((p) => p.hover.withMotion),
  transform: sum((p) => p.hover.withTransform), color: sum((p) => p.hover.colorOnly),
  inMs: pages.map((p) => p.hover.medianInMs).filter((x) => x != null),
  outMs: pages.map((p) => p.hover.medianOutMs).filter((x) => x != null),
};
const load = pages.map((p) => p.load);
const scroll = pages.map((p) => p.scroll);
const overshootDeclared = eases.filter(([e]) => shapeOf(e) === 'overshoot').reduce((a, [, n]) => a + n, 0);
const cssOvershoot = pages.flatMap((p) => p.css.cubicBeziers).filter((c) => c.shape === 'overshoot');
const smooth = pages.map((p) => p.wheel?.smooth);
const allShare = pages.map((p) => p.declared.transitionAllShare);
const fadeMove = scroll.reduce((a, x) => a + x.reveal.withTransform, 0);
const fadeOnly = scroll.reduce((a, x) => a + x.reveal.opacityOnly, 0);
const jsRevealEls = scroll.reduce((a, x) => a + x.jsReveals.elements, 0) + load.reduce((a, x) => a + x.jsReveals.elements, 0);
const staggerGaps = [...load, ...scroll].map((x) => x.stagger.medianGapMs).filter((x) => x != null);
const libs = Object.entries(pages.reduce((a, p) => { for (const [k, v] of Object.entries(p.libs)) if (v && typeof v === 'boolean') a[k] = true; return a; }, {})).map(([k]) => k);
const tokenVars = Object.assign({}, ...pages.map((p) => p.css.tokenVars));
const linearSprings = sum((p) => p.css.linearEasings);
const rm = pages.map((p) => p.reducedMotion);

const L = [];
L.push('---', 'format: motion.md/v0', `name: ${s.name}`, 'summary: TODO', 'source: measured', 'measured:', `  date: ${s.measuredAt.slice(0, 10)}`, `  pages: [${pages.map((p) => p.url).join(', ')}]`, `  tool: awesome-motion-md extractor, Chromium ${s.chromium.split('.')[0]}, ${s.viewport.width}x${s.viewport.height}`, `  data: data/${id}.summary.json`, 'tokens:', '  duration:');
durs.slice(0, 4).forEach(([ms], i) => L.push(`    d${i + 1}: ${ms}ms`));
L.push('  easing:');
eases.slice(0, 3).forEach(([e], i) => L.push(`    e${i + 1}: ${e}`));
L.push(`  stagger: ${staggerGaps.length ? Math.min(...staggerGaps) + 'ms' : 'null'}`, '---', '');
L.push(`# ${s.name} motion`, '', 'TODO thesis.', '', '## Measurements', '');
L.push(`- Declared transitions: ${sum((p) => p.declared.elementsWithTransitions)} entries (one per property per element) across ${pages.length} pages.`);
L.push(`- Durations (declared + hover): ${durs.slice(0, 6).map(([ms, n]) => `${ms}ms ×${n} (${pct(n, totalDur)}%)`).join(', ')}.`);
L.push(`- Easings (declared + hover): ${eases.slice(0, 5).map(([e, n]) => `${nameOf(e) || e} ×${n} (${pct(n, totalEase)}%, ${shapeOf(e)})`).join('; ')}.`);
L.push(`- Hover: ${hover.moved}/${hover.probed} probes ran CSS motion; ${hover.transform} moved or scaled; ${hover.color} colour-only; ${sum((p) => p.hover.jsHover)} had JS (rAF) hover motion, ${sum((p) => p.hover.jsTransform)} of them changing transform. Median in ${hover.inMs.join('/')}ms, out ${hover.outMs.join('/')}ms.`);
L.push(`- Load: ${load.map((x) => `${x.count} animations, median ${x.medianMs}ms, max delay ${x.maxDelayMs}ms`).join(' | ')}.`);
L.push(`- Scroll: ${scroll.map((x) => `${x.count} animations on ${x.targets} targets, median ${x.medianMs}ms`).join(' | ')}; reveals that move: ${fadeMove}, opacity-only: ${fadeOnly}; JS (rAF) reveals: ${jsRevealEls}; scroll-driven: ${sum((p) => p.scroll.scrollDrivenAnimations)}.`);
L.push(`- Stagger gaps: ${staggerGaps.length ? staggerGaps.join(', ') + 'ms' : 'none detected'}.`);
L.push(`- Wheel scroll: ${smooth.map((x, i) => `${x ? 'smoothed' : 'native'} (${pages[i].wheel?.settleMs}ms)`).join(', ')}.`);
L.push(`- \`transition: all\` share: ${allShare.join('%, ')}%. Overshoot easings applied: ${overshootDeclared}; defined in CSS: ${cssOvershoot.length}. linear() springs in CSS: ${linearSprings}.`);
L.push(`- Infinite loops: ${pages.map((p) => p.ambient.infiniteAnimations).join(', ')} (${[...new Set(pages.flatMap((p) => p.ambient.names))].slice(0, 5).join(', ')}).`);
L.push(`- Reduced motion: ${rm.map((r) => `${r.cssQueries} CSS queries, load motion ${r.loadMotionFull} → ${r.loadMotionReduced}`).join(' | ')}.`);
L.push(`- Libraries: ${libs.join(', ') || 'none detected'}.`);
if (Object.keys(tokenVars).length) L.push(`- CSS motion tokens: ${Object.entries(tokenVars).slice(0, 14).map(([k, v]) => `\`${k}: ${v}\``).join(', ')}.`);
L.push('');
const out = L.join('\n');
if (process.argv.includes('--stdout')) console.log(out);
else {
  const dir = path.join(root, 'motion', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'MOTION.draft.md'), out);
  console.log(`wrote motion/${id}/MOTION.draft.md`);
}
