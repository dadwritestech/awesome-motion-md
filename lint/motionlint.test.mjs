import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintSources, parseShorthand, bezierOvershoots, splitTopLevel, RULES } from './motionlint.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, 'motionlint.mjs');
const lint = (text, file = 'a.css', opts) => lintSources([{ file, text }], opts);
const rules = (findings) => findings.map((f) => f.rule);
const has = (findings, rule) => rules(findings).includes(rule);

test('parseShorthand reads duration, delay, easing and property', () => {
  assert.deepEqual(parseShorthand('opacity 160ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 40ms'), {
    duration: 160, delay: 40, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', infinite: false, names: ['opacity'],
  });
  assert.equal(parseShorthand('all .3s').duration, 300);
  assert.equal(parseShorthand('spin 1s linear infinite').infinite, true);
  assert.equal(parseShorthand('color 0.1s var(--ease-out)').easing, 'var(--ease-out)');
});

test('splitTopLevel keeps commas inside functions', () => {
  assert.deepEqual(splitTopLevel('opacity 1s cubic-bezier(0,0,1,1), transform 2s'), ['opacity 1s cubic-bezier(0,0,1,1)', 'transform 2s']);
});

test('bezierOvershoots uses the impeccable threshold', () => {
  assert.equal(bezierOvershoots(['0.34', '1.56', '0.64', '1']), true);
  assert.equal(bezierOvershoots(['0.68', '-0.55', '0.265', '1.55']), true);
  assert.equal(bezierOvershoots(['0.16', '1', '0.3', '1']), false);
  assert.equal(bezierOvershoots(['0.2', '1.05', '0.3', '1']), false); // within 0.1 tolerance
});

test('uniform-timing fires when one duration+easing dominates', () => {
  const css = Array.from({ length: 6 }, (_, i) => `.a${i} { transition: opacity 0.3s ease-in-out; }`).join('\n');
  const f = lint(css + '\n@media (prefers-reduced-motion: reduce) {}');
  assert.ok(has(f, 'uniform-timing'));
  assert.match(f.find((x) => x.rule === 'uniform-timing').detail, /6 of 6 .* 300ms ease-in-out/);
});

test('uniform-timing stays quiet for a varied system', () => {
  const css = `
    .a { transition: color 100ms cubic-bezier(0.25,0.46,0.45,0.94); }
    .b { transition: color 100ms cubic-bezier(0.25,0.46,0.45,0.94); }
    .c { transition: opacity 160ms cubic-bezier(0.25,0.46,0.45,0.94); }
    .d { transition: transform 240ms cubic-bezier(0.16,1,0.3,1); }
    .e { transition: opacity 400ms cubic-bezier(0.16,1,0.3,1); }
    @media (prefers-reduced-motion: reduce) {}`;
  const f = lint(css);
  assert.deepEqual(f, []);
});

test('uniform-timing needs a minimum sample', () => {
  const f = lint('.a { transition: opacity 0.3s ease-in-out; } .b { transition: opacity 0.3s ease-in-out; }');
  assert.ok(!has(f, 'uniform-timing'));
});

test('keyword-easing-only fires when no curve is authored', () => {
  const css = ['100ms ease', '200ms ease-out', '300ms ease-in-out', '150ms ease', '250ms linear']
    .map((t, i) => `.k${i} { transition: opacity ${t}; }`).join('\n') + '\n/* prefers-reduced-motion */';
  assert.ok(has(lint(css), 'keyword-easing-only'));
});

test('a missing timing function counts as the CSS default `ease`', () => {
  const css = Array.from({ length: 5 }, (_, i) => `.a${i} { transition: opacity ${100 + i * 50}ms; }`).join('\n') + '/* prefers-reduced-motion */';
  assert.ok(has(lint(css), 'keyword-easing-only'));
});

test('fade-up-everything counts keyframe uses, framer initial, AOS and Tailwind classes', () => {
  const css = `@keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    h1 { animation: rise .6s; } p { animation: rise .6s; }`;
  const jsx = `<motion.div initial={{ opacity: 0, y: 30 }} /> <div data-aos="fade-up"></div>`;
  const f = lintSources([{ file: 'a.css', text: css }, { file: 'b.jsx', text: jsx }]);
  assert.match(f.find((x) => x.rule === 'fade-up-everything').detail, /^4 elements/);
});

test('a fade from above or an opacity-only fade is not a fade-up', () => {
  const css = `@keyframes drop { from { opacity: 0; transform: translateY(-8px); } }
    @keyframes fade { from { opacity: 0; } }
    a { animation: drop .2s; } b { animation: drop .2s; } c { animation: fade .2s; } d { animation: fade .2s; } e { animation: fade .2s; }`;
  assert.ok(!has(lint(css), 'fade-up-everything'));
});

test('bounce-everywhere counts overshoot curves, bounce names, springs and animate-bounce', () => {
  const src = `.a { transition: transform .4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .b { animation: bounceIn 1s; }
    <motion.div transition={{ type: "spring", bounce: 0.5 }} />
    <div className="animate-bounce" />`;
  const f = lint(src, 'x.jsx');
  assert.match(f.find((x) => x.rule === 'bounce-everywhere').detail, /^4 /);
  assert.ok(has(f, 'overshoot-easing'));
});

test('a single deliberate overshoot is only an advisory', () => {
  const f = lint('.toast { transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1); }');
  assert.ok(!has(f, 'bounce-everywhere'));
  assert.equal(f.find((x) => x.rule === 'overshoot-easing').severity, 'advisory');
});

test('transition-all in CSS and Tailwind', () => {
  assert.ok(has(lint('.a { transition: all 200ms ease-out; }'), 'transition-all'));
  assert.ok(has(lint('<div className="transition-all duration-200" />', 'a.jsx'), 'transition-all'));
  assert.ok(has(lint('.a { transition-property: all; }'), 'transition-all'));
  assert.ok(!has(lint('.a { transition: opacity 200ms ease-out; }'), 'transition-all'));
});

test('animating-layout flags width/height/top/margin transitions', () => {
  assert.ok(has(lint('.a { transition: height 200ms ease-out; }'), 'animating-layout'));
  assert.ok(has(lint('.a { transition: margin-left 200ms ease-out; }'), 'animating-layout'));
  assert.ok(!has(lint('.a { transition: transform 200ms ease-out; }'), 'animating-layout'));
});

test('hover-lift-everywhere needs three lifts', () => {
  const two = '.a:hover { transform: scale(1.05); } .b:hover { transform: translateY(-2px); }';
  assert.ok(!has(lint(two), 'hover-lift-everywhere'));
  assert.ok(has(lint(two + '<motion.a whileHover={{ scale: 1.02 }} />', 'a.jsx'), 'hover-lift-everywhere'));
  assert.ok(has(lint('<a className="hover:scale-105"/><a className="hover:-translate-y-1"/><a className="hover:shadow-xl"/>', 'a.jsx'), 'hover-lift-everywhere'));
});

test('a large hover shadow counts as a lift, a hairline focus ring does not', () => {
  const lifts = '.a:hover { transform: scale(1.05); } .b:hover { transform: translateY(-2px); }';
  assert.ok(has(lint(lifts + ' .c:hover { box-shadow: 0 4px 18px rgba(0,0,0,.4); }'), 'hover-lift-everywhere'));
  assert.ok(!has(lint(lifts + ' .c:hover { box-shadow: 0 0 0 1px #333; }'), 'hover-lift-everywhere'));
});

test('hover scale-down (press) is not a lift', () => {
  const f = lint('.a:hover { transform: scale(0.98); } .b:hover { transform: scale(0.98); } .c:hover { transform: scale(1); }');
  assert.ok(!has(f, 'hover-lift-everywhere'));
});

test('no-reduced-motion fires only when there is motion and no fallback', () => {
  const motion = '.a { transition: opacity 1s; } .b { transition: opacity 1s; } .c { transition: opacity 1s; }';
  assert.ok(has(lint(motion), 'no-reduced-motion'));
  assert.ok(!has(lint(motion + '@media (prefers-reduced-motion: reduce) { * { transition: none } }'), 'no-reduced-motion'));
  assert.ok(!has(lintSources([{ file: 'a.css', text: motion }, { file: 'b.tsx', text: 'const r = useReducedMotion();' }]), 'no-reduced-motion'));
  assert.ok(!has(lint('.a { color: red }'), 'no-reduced-motion'));
});

test('sluggish-feedback flags slow colour changes, not slow opacity reveals', () => {
  assert.ok(has(lint('.a { transition: background-color 600ms ease-out; }'), 'sluggish-feedback'));
  assert.ok(!has(lint('.a { transition: opacity 600ms ease-out; }'), 'sluggish-feedback'));
});

test('slow-stagger reads framer staggerChildren and index * delay', () => {
  assert.ok(has(lint('const v = { show: { transition: { staggerChildren: 0.15 } } }', 'a.js'), 'slow-stagger'));
  assert.ok(!has(lint('const v = { show: { transition: { staggerChildren: 0.04 } } }', 'a.js'), 'slow-stagger'));
  assert.ok(has(lint('items.map((x, i) => animate(x, {}, { delay: i * 0.12 }))', 'a.js'), 'slow-stagger'));
  assert.ok(has(lint('.li { animation-delay: calc(var(--i) * 150ms); }'), 'slow-stagger'));
});

test('ambient-loop ignores spinners and skeletons', () => {
  assert.ok(has(lint('.dot { animation: pulse 2s ease-in-out infinite; }'), 'ambient-loop'));
  assert.ok(!has(lint('.s { animation: spin 1s linear infinite; }'), 'ambient-loop'));
  assert.ok(!has(lint('.s { animation: skeleton-shimmer 1.2s linear infinite; }'), 'ambient-loop'));
});

test('inline ignores: next-line, line and file', () => {
  const src = '/* motionlint-disable-next-line transition-all */\n.a { transition: all 1s; }\n.b { transition: all 1s; } /* motionlint-disable-line */';
  assert.ok(!has(lint(src), 'transition-all'));
  assert.deepEqual(lint('/* motionlint-disable */\n.a { transition: all 1s; height 1s; }'), []);
  const partial = lint('/* motionlint-disable transition-all */\n.a { transition: all 1s; } .b { transition: height 1s ease-out; }');
  assert.ok(!has(partial, 'transition-all'));
  assert.ok(has(partial, 'animating-layout'));
});

test('every finding carries a known rule, severity and hint', () => {
  const f = lint('.a { transition: all .3s ease-in-out; }');
  for (const x of f) {
    assert.ok(RULES[x.rule]);
    assert.ok(['warning', 'advisory'].includes(x.severity));
    assert.ok(x.hint.length > 10);
    assert.ok(x.line >= 1);
  }
});

test('fixtures: generic build is flagged, crafted build is clean', () => {
  const generic = spawnSync(process.execPath, [cli, path.join(here, 'fixtures', 'generic'), '--json'], { encoding: 'utf8' });
  assert.equal(generic.status, 2);
  const found = new Set(JSON.parse(generic.stdout).findings.map((f) => f.rule));
  for (const r of ['uniform-timing', 'fade-up-everything', 'bounce-everywhere', 'transition-all', 'animating-layout', 'hover-lift-everywhere', 'no-reduced-motion', 'sluggish-feedback'])
    assert.ok(found.has(r), `generic fixture should trigger ${r}`);
  const crafted = execFileSync(process.execPath, [cli, path.join(here, 'fixtures', 'crafted'), '--json'], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(crafted).findings, []);
});

test('CLI: --list-rules and --quiet', () => {
  const out = execFileSync(process.execPath, [cli, '--list-rules'], { encoding: 'utf8' });
  assert.equal(out.trim().split('\n').length, Object.keys(RULES).length);
  const q = spawnSync(process.execPath, [cli, path.join(here, 'fixtures', 'generic'), '--quiet'], { encoding: 'utf8' });
  assert.equal(q.stdout, '');
  assert.match(q.stderr, /^\d+ motion tells? found\.\n$/);
});
