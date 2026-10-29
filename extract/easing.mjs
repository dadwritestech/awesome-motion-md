// Easing normalisation shared by the summarizer and the linter.
export const KEYWORDS = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};

// Well-known named curves, so a measured bezier can be reported by name.
export const NAMED = [
  ['easeOutQuad', [0.25, 0.46, 0.45, 0.94]],
  ['easeInQuad', [0.55, 0.085, 0.68, 0.53]],
  ['easeInOutQuad', [0.455, 0.03, 0.515, 0.955]],
  ['easeOutCubic', [0.215, 0.61, 0.355, 1]],
  ['easeInOutCubic', [0.645, 0.045, 0.355, 1]],
  ['easeOutQuart', [0.165, 0.84, 0.44, 1]],
  ['easeInOutQuart', [0.77, 0, 0.175, 1]],
  ['easeOutQuint', [0.23, 1, 0.32, 1]],
  ['easeOutExpo', [0.19, 1, 0.22, 1]],
  ['easeInOutExpo', [1, 0, 0, 1]],
  ['expoOut (0.16,1,0.3,1)', [0.16, 1, 0.3, 1]],
  ['material-standard', [0.4, 0, 0.2, 1]],
  ['material-decelerate', [0, 0, 0.2, 1]],
  ['material-accelerate', [0.4, 0, 1, 1]],
  ['easeOutBack', [0.175, 0.885, 0.32, 1.275]],
  ['ease', KEYWORDS.ease],
  ['ease-in', KEYWORDS['ease-in']],
  ['ease-out', KEYWORDS['ease-out']],
  ['ease-in-out', KEYWORDS['ease-in-out']],
  ['linear', KEYWORDS.linear],
];

const round = (n) => Math.round(n * 1000) / 1000;

export function parseEasing(s) {
  if (!s) return null;
  s = String(s).trim().toLowerCase();
  if (KEYWORDS[s]) return { kind: 'bezier', p: KEYWORDS[s], keyword: s };
  const m = s.match(/^cubic-bezier\(\s*([-\d.e]+)\s*,\s*([-\d.e]+)\s*,\s*([-\d.e]+)\s*,\s*([-\d.e]+)\s*\)$/);
  if (m) return { kind: 'bezier', p: m.slice(1, 5).map(Number) };
  if (s.startsWith('linear(')) return { kind: 'linear()', points: (s.match(/,/g) || []).length + 1 };
  if (s.startsWith('steps(') || s === 'step-start' || s === 'step-end') return { kind: 'steps' };
  return { kind: 'other', raw: s };
}

export function canonical(s) {
  const e = parseEasing(s);
  if (!e) return 'none';
  if (e.kind === 'bezier') return `cubic-bezier(${e.p.map(round).join(', ')})`;
  if (e.kind === 'linear()') return `linear(…${e.points} stops)`;
  if (e.kind === 'steps') return 'steps';
  return e.raw;
}

export function nameOf(s) {
  const e = parseEasing(s);
  if (!e || e.kind !== 'bezier') return e ? e.kind : 'none';
  for (const [name, p] of NAMED) if (p.every((v, i) => Math.abs(v - e.p[i]) < 0.011)) return name;
  return null;
}

// Shape class from control points: does it decelerate, accelerate, both, or overshoot?
export function shapeOf(s) {
  const e = parseEasing(s);
  if (!e) return 'none';
  if (e.kind === 'linear()') return 'spring/linear()';
  if (e.kind !== 'bezier') return e.kind;
  const [x1, y1, x2, y2] = e.p;
  if (y1 < -0.01 || y1 > 1.01 || y2 < -0.01 || y2 > 1.01) return 'overshoot';
  if (x1 === 0 && y1 === 0 && x2 === 1 && y2 === 1) return 'linear';
  // Endpoint slopes of the bezier; a control point sitting on an endpoint
  // hands the slope to the other control point.
  const s0 = x1 === 0 && y1 === 0 ? y2 / Math.max(x2, 0.001) : y1 / Math.max(x1, 0.001);
  const s1 = x2 === 1 && y2 === 1 ? (1 - y1) / Math.max(1 - x1, 0.001) : (1 - y2) / Math.max(1 - x2, 0.001);
  const startFast = s0 > 1.2, startSlow = s0 < 0.8, endSlow = s1 < 0.8, endFast = s1 > 1.2;
  if (startSlow && endSlow) return 'in-out';
  if (startFast || (endSlow && !startSlow)) return 'out';
  if (startSlow || endFast) return 'in';
  return 'near-linear';
}

export function toMs(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).trim();
  if (s.endsWith('ms')) return Math.round(parseFloat(s));
  if (s.endsWith('s')) return Math.round(parseFloat(s) * 1000);
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}
