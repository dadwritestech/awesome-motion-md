// Record the same scripted session on demo/without and demo/with, then build the
// side-by-side hero GIF.   node demo/record.mjs
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = path.join(here, 'out');
fs.mkdirSync(out, { recursive: true });
const W = 900, H = 600;

// Headless video has no cursor, so draw one.
const cursor = () => {
  addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;left:0;top:0;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;border:2px solid #000;opacity:.85;z-index:2147483647;pointer-events:none;transition:none';
    document.body.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, true);
    addEventListener('mousedown', () => { c.style.background = '#999'; }, true);
    addEventListener('mouseup', () => { c.style.background = '#fff'; }, true);
  });
};

async function center(page, sel) {
  const b = await page.locator(sel).first().boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}

async function session(page) {
  await page.mouse.move(W - 40, H - 40);
  await page.waitForTimeout(2200);                         // page load
  for (const sel of ['nav a >> nth=0', 'nav a >> nth=1', '.card >> nth=0', '.card >> nth=1', '.card >> nth=2']) {
    const [x, y] = await center(page, sel);
    await page.mouse.move(x, y, { steps: 12 });
    await page.waitForTimeout(650);
  }
  const [bx, by] = await center(page, '#new-issue');
  await page.mouse.move(bx, by, { steps: 14 });
  await page.waitForTimeout(250);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(900);                          // dialog in
  await page.locator('#title-input').fill('');
  await page.keyboard.type('Ship MOTION.md', { delay: 45 });
  const [cx, cy] = await center(page, '#create');
  await page.mouse.move(cx, cy, { steps: 10 });
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(3200);                         // dialog out, new card, toast in and out
}

const browser = await chromium.launch();
const videos = {};
for (const variant of ['without', 'with']) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: out, size: { width: W, height: H } } });
  await ctx.addInitScript(cursor);
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(pathToFileURL(path.join(here, variant, 'index.html')).href);
  await session(page);
  const ms = Date.now() - t0;
  await ctx.close();
  const src = await page.video().path();
  videos[variant] = path.join(out, `${variant}.webm`);
  fs.renameSync(src, videos[variant]);
  console.log(variant, `${ms}ms`, videos[variant]);
}
await browser.close();

// Side by side, labelled, 12 fps, 1000px wide (keeps the GIF near 3 MB).
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const label = (t) => `pad=iw:ih+56:0:56:color=0x0b0b0c,drawtext=fontfile='${font}':text='${t}':fontcolor=white:fontsize=26:x=(w-tw)/2:y=16`;
const filter = [
  `[0:v]${label('Without MOTION.md')}[a]`,
  `[1:v]${label('With motion/linear/MOTION.md')}[b]`,
  `[a][b]hstack=inputs=2,fps=12,scale=1000:-1:flags=lanczos,split[s0][s1]`,
  `[s0]palettegen=max_colors=128:stats_mode=diff[p]`,
  `[s1][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
].join(';');
const docs = path.join(root, 'docs');
fs.mkdirSync(docs, { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
ff(['-i', videos.without, '-i', videos.with, '-filter_complex', filter, '-shortest', path.join(docs, 'demo.gif')]);
ff(['-i', videos.without, '-i', videos.with, '-filter_complex',
  `[0:v]${label('Without MOTION.md')}[a];[1:v]${label('With motion/linear/MOTION.md')}[b];[a][b]hstack=inputs=2`,
  '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', path.join(docs, 'demo.mp4')]);
console.log('wrote docs/demo.gif and docs/demo.mp4');
