// Measured motion extractor.
//   node extract/extract.mjs [brandId ...] [--config brands.json] [--out data/raw]
// Visits each brand URL in Chromium, records load choreography, hover, scroll
// and reduced-motion behaviour, scans stylesheets, and writes data/raw/<brand>.json.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i < 0 ? dflt : args.splice(i, 2)[1]; };
const configPath = path.resolve(flag('--config', path.join(here, 'brands.json')));
// URLs in a config may be local paths, resolved against the config file (used for the demo builds).
const brands = JSON.parse(fs.readFileSync(configPath, 'utf8')).map((b) => ({
  ...b, urls: b.urls.map((u) => (/^(https?|file):/.test(u) ? u : pathToFileURL(path.resolve(path.dirname(configPath), u)).href)),
}));
const outDir = path.resolve(flag('--out', path.join(root, 'data', 'raw')));
const only = args;
fs.mkdirSync(outDir, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- stylesheet text scan ---------------------------------------------------
function scanCss(text) {
  const count = (re) => (text.match(re) || []).length;
  const tally = (re, norm = (s) => s) => {
    const m = {};
    for (const x of text.matchAll(re)) {
      const k = norm(x[0]);
      m[k] = (m[k] || 0) + 1;
    }
    return m;
  };
  const vars = {};
  for (const x of text.matchAll(/(--[\w-]*(?:ease|easing|duration|timing|transition|spring|motion|bezier|curve|speed)[\w-]*)\s*:\s*([^;}{]{1,160})/gi)) {
    vars[x[1]] = x[2].trim();
  }
  const keyframes = {};
  for (const x of text.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
    keyframes[x[1]] = x[2].replace(/\s+/g, ' ').slice(0, 300);
  }
  return {
    bytes: text.length,
    cubicBeziers: tally(/cubic-bezier\(\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*\)/g, (s) => s.replace(/\s+/g, '')),
    linearEasings: count(/\blinear\(\s*[-\d.]/g),
    steps: count(/\bsteps\(/g),
    durationVars: vars,
    keyframes,
    reducedMotionQueries: count(/prefers-reduced-motion/g),
    transitionAll: count(/transition(?:-property)?\s*:\s*all\b/g),
    animationTimeline: count(/animation-timeline\s*:/g),
    viewTransition: count(/view-transition-name|::view-transition/g),
    scrollBehaviorSmooth: count(/scroll-behavior\s*:\s*smooth/g),
    willChange: count(/will-change\s*:/g),
  };
}

function mergeCss(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (typeof v === 'number') out[k] = (out[k] || 0) + v;
    else if (v && typeof v === 'object') {
      out[k] = { ...(out[k] || {}) };
      for (const [kk, vv] of Object.entries(v)) out[k][kk] = typeof vv === 'number' ? (out[k][kk] || 0) + vv : vv;
    }
  }
  return out;
}

// --- page-side helpers ------------------------------------------------------
const pageCensus = () => {
  const M = window.__motion;
  const tally = {};
  const anim = {};
  let n = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (++n > 6000) break;
    const cs = getComputedStyle(el);
    const durs = M.splitList(cs.transitionDuration);
    if (!(durs.length === 1 && parseFloat(durs[0]) === 0)) {
      const props = M.splitList(cs.transitionProperty);
      const eases = M.splitList(cs.transitionTimingFunction);
      const delays = M.splitList(cs.transitionDelay);
      props.forEach((p, i) => {
        const d = durs[i % durs.length];
        if (parseFloat(d) === 0) return;
        const k = [p, d, eases[i % eases.length], delays[i % delays.length]].join(' | ');
        tally[k] = (tally[k] || 0) + 1;
      });
    }
    if (cs.animationName && cs.animationName !== 'none') {
      const k = [cs.animationName, cs.animationDuration, cs.animationTimingFunction, cs.animationIterationCount, cs.animationTimeline || ''].join(' | ');
      anim[k] = (anim[k] || 0) + 1;
    }
  }
  const html = document.documentElement;
  const scripts = [...document.scripts].map((s) => s.src).filter(Boolean);
  const has = (re) => scripts.some((s) => re.test(s));
  return {
    elementsScanned: n,
    transitions: tally,
    animations: anim,
    rootScrollBehavior: getComputedStyle(html).scrollBehavior,
    libs: {
      gsap: !!window.gsap || has(/gsap|greensock/i),
      scrollTrigger: !!window.ScrollTrigger || has(/ScrollTrigger/i),
      lenis: !!window.lenis || !!window.Lenis || html.classList.contains('lenis') || has(/lenis/i),
      framerMotion: !!document.querySelector('[data-framer-appear-id],[data-framer-component-type]') || has(/framer-motion|framerusercontent/i),
      motionOne: !!window.Motion || has(/motion\.dev|@motionone/i),
      lottie: !!window.lottie || !!document.querySelector('lottie-player,dotlottie-player') || has(/lottie/i),
      rive: has(/rive/i) || !!document.querySelector('canvas[data-rive]'),
      three: !!window.THREE || has(/three(\.min)?\.js/i),
      spline: !!document.querySelector('spline-viewer') || has(/splinetool/i),
      videos: document.querySelectorAll('video').length,
      canvases: document.querySelectorAll('canvas').length,
    },
    inlineCss: [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n'),
  };
};

const hoverCandidates = (max) => {
  const M = window.__motion;
  const els = [...document.querySelectorAll('a[href], button, [role=button], [role=tab], summary, input[type=submit]')];
  const out = [];
  const seenSel = new Set();
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 16 || r.height < 12 || r.width > 900 || cs.visibility === 'hidden' || cs.display === 'none') continue;
    const d = M.describe(el);
    // Prefer one probe per visual pattern.
    const key = d.sel.replace(/#.*$/, '');
    if (seenSel.has(key)) continue;
    seenSel.add(key);
    el.setAttribute('data-motion-probe', String(out.length));
    out.push(d.sel);
    if (out.length >= max) break;
  }
  return out;
};

async function visit(browser, url, { reduced = false } = {}) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    locale: 'en-US',
  });
  await context.addInitScript({ path: path.join(here, 'probe.js') });
  const page = await context.newPage();
  let css = scanCss('');
  const cssJobs = [];
  page.on('response', (res) => {
    if (res.request().resourceType() === 'stylesheet') {
      cssJobs.push(res.text().then((t) => { css = mergeCss(css, scanCss(t)); }).catch(() => {}));
    }
  });

  const result = { url, reduced, ok: true };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
    await sleep(3500); // load choreography window
    result.finalUrl = page.url();
    result.title = await page.title();
    if (reduced) {
      await page.evaluate(() => window.__motion.sample());
      result.motion = await page.evaluate(() => ({
        events: window.__motion.events.length,
        waapi: window.__motion.waapi.length,
        anims: window.__motion.anims.length,
        styleMut: window.__motion.styleMut.length,
      }));
      return result;
    }

    // Hover probe: enter, then leave, on up to 24 distinct interactive patterns.
    await page.evaluate(() => { window.__motion.phase = 'idle'; });
    const candidates = await page.evaluate(hoverCandidates, 24);
    result.hover = [];
    for (let i = 0; i < candidates.length; i++) {
      const loc = page.locator(`[data-motion-probe="${i}"]`).first();
      try {
        await loc.scrollIntoViewIfNeeded({ timeout: 2000 });
        await page.mouse.move(5, 5);
        await sleep(250);
        await page.evaluate((n) => { window.__motion.phase = 'hover-in:' + n; }, i);
        await loc.hover({ timeout: 2000 });
        await sleep(700);
        await page.evaluate((n) => { window.__motion.phase = 'hover-out:' + n; }, i);
        await page.mouse.move(5, 5);
        await sleep(600);
        result.hover.push({ i, sel: candidates[i] });
      } catch (e) {
        result.hover.push({ i, sel: candidates[i], error: String(e.message).slice(0, 80) });
      }
    }
    await page.evaluate(() => { window.__motion.phase = 'idle'; });

    // Smooth-scroll probe: one wheel tick at the top, then sample scrollY per frame.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(800);
    await page.mouse.move(720, 450);
    const scrollTrace = page.evaluate(() => new Promise((resolve) => {
      const pts = [];
      const t0 = performance.now();
      const tick = () => {
        pts.push([Math.round(performance.now() - t0), Math.round(window.scrollY)]);
        if (performance.now() - t0 < 1600) requestAnimationFrame(tick); else resolve(pts);
      };
      requestAnimationFrame(tick);
    }));
    await sleep(50);
    await page.mouse.wheel(0, 400);
    result.wheelTrace = await scrollTrace;

    // Scroll probe: wheel down the page in steps and watch what reveals.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);
    await page.evaluate(() => { window.__motion.phase = 'scroll'; });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = Math.min(60, Math.ceil(height / 350));
    for (let s = 0; s < steps; s++) {
      await page.mouse.wheel(0, 350);
      await sleep(220);
    }
    await sleep(1500);
    result.scrollSteps = steps;
    result.pageHeight = height;

    await page.evaluate(() => window.__motion.sample());
    const census = await page.evaluate(pageCensus);
    css = mergeCss(css, scanCss(census.inlineCss));
    delete census.inlineCss;
    result.census = census;
    result.motion = await page.evaluate(() => {
      const M = window.__motion;
      return { events: M.events, waapi: M.waapi, anims: M.anims, styleMut: M.styleMut };
    });
  } catch (e) {
    result.ok = false;
    result.error = String(e.message).slice(0, 300);
  } finally {
    await Promise.all(cssJobs);
    result.css = css;
    await context.close();
  }
  return result;
}

const browser = await chromium.launch();
for (const brand of brands) {
  if (only.length && !only.includes(brand.id)) continue;
  const out = { brand: brand.id, name: brand.name, measuredAt: new Date().toISOString(), viewport: VIEWPORT, chromium: browser.version(), pages: [] };
  for (const url of brand.urls) {
    process.stdout.write(`${brand.id} ${url} ... `);
    const full = await visit(browser, url);
    const reduced = await visit(browser, url, { reduced: true });
    full.reducedMotionRun = { ok: reduced.ok, motion: reduced.motion, error: reduced.error };
    out.pages.push(full);
    const m = full.motion || {};
    console.log(full.ok ? `events=${m.events?.length} waapi=${m.waapi?.length} anims=${m.anims?.length} styleMut=${m.styleMut?.length}` : `FAILED ${full.error}`);
  }
  fs.writeFileSync(path.join(outDir, `${brand.id}.json`), JSON.stringify(out));
}
await browser.close();
