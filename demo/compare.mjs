// Compare the measured motion of the two demo builds with linear.app itself.
// Run after: node extract/extract.mjs --config demo/brands.json --out demo/measured/raw
//            node extract/summarize.mjs --raw demo/measured/raw --out demo/measured
//   node demo/compare.mjs > demo/RESULTS.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(here, '..', f), 'utf8'));
const cols = [
  ['Without MOTION.md', read('demo/measured/without.summary.json')],
  ['With linear/MOTION.md', read('demo/measured/with.summary.json')],
  ['linear.app (measured)', read('data/linear.summary.json')],
];

const merge = (rows, key) => {
  const m = {};
  for (const r of rows) m[r[key]] = (m[r[key]] || 0) + r.n;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const pct = (n, rows) => Math.round((100 * n) / rows.reduce((a, [, x]) => a + x, 0));

function profile(s) {
  const pages = s.pages.filter((p) => p.ok);
  const durs = merge(pages.flatMap((p) => p.declared.durations), 'ms');
  const eases = merge(pages.flatMap((p) => p.declared.easings.map((e) => ({ ...e, easing: e.name || e.easing }))), 'easing');
  const props = {};
  for (const p of pages) for (const [k, n] of p.declared.properties) props[k] = (props[k] || 0) + n;
  const total = pages.reduce((a, p) => a + p.declared.elementsWithTransitions, 0);
  const loadProps = new Set(pages.flatMap((p) => p.load.properties.map(([k]) => k)));
  const gaps = pages.flatMap((p) => [p.load.stagger.medianGapMs]).filter((x) => x != null);
  return {
    'Distinct durations': durs.length,
    'Top durations': durs.slice(0, 3).map(([ms, n]) => `${ms}ms (${pct(n, durs)}%)`).join(', '),
    'Distinct curves': eases.length,
    'Top curve': `${eases[0][0]} (${pct(eases[0][1], eases)}%)`,
    'Transitions on `transform`': `${Math.round((100 * (props.transform || 0)) / total)}%`,
    'Transitions on `box-shadow`': `${Math.round((100 * (props['box-shadow'] || 0)) / total)}%`,
    'Load animates': [...loadProps].filter((p) => /opacity|transform|filter/.test(p)).join(' + ') || 'nothing',
    'Load stagger': gaps.length ? `${gaps.join(', ')}ms` : 'none',
  };
}

const rows = cols.map(([, s]) => profile(s));
const lint = (dir) => {
  try { execFileSync(process.execPath, [path.join(here, '..', 'lint', 'motionlint.mjs'), path.join(here, dir), '--json'], { encoding: 'utf8' }); return 0; }
  catch (e) { return JSON.parse(e.stdout).findings.length; }
};

const L = ['# Demo results', '',
  'Both pages were built by the same agent (Claude Sonnet) from the same prompt (`demo/PROMPT.md`).',
  'The second build was also told to follow `motion/linear/MOTION.md`. Both were then measured',
  'with the same extractor that measured linear.app.', '',
  `| | ${cols.map(([n]) => n).join(' | ')} |`, `|---|${cols.map(() => '---').join('|')}|`];
for (const k of Object.keys(rows[0])) L.push(`| ${k} | ${rows.map((r) => r[k]).join(' | ')} |`);
L.push(`| motionlint findings | ${lint('without')} | ${lint('with')} | n/a |`, '');
console.log(L.join('\n'));
