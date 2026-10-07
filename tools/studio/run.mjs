// Usage: node run.mjs <shots.mjs> <outdir> [w] [h]
import { chromium } from 'playwright'; // npm i -g playwright (ou en local)
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const [shotsFile, outDir, w = '1920', h = '1080'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const { shots, paint } = await import(pathToFileURL(path.resolve(shotsFile)).href);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(`http://127.0.0.1:8899/studio.html?w=${w}&h=${h}`);
const info = await page.evaluate(() => window.ready);
console.log('car', JSON.stringify(info));
await page.evaluate((p) => window.paint(p), paint);
const S = +(process.env.START || 0), E = +(process.env.END || shots.length);
let i = 0;
const t0 = Date.now();
for (const s of shots.slice(S, E)) {
  if (s.props !== undefined) await page.evaluate((k) => window.setProps(k), s.props);
  if (s.blueprint) console.log('edges', await page.evaluate(() => window.blueprint(true)));
  const url = await page.evaluate((p) => window.shot(p), s);
  const ext = s.png ? 'png' : 'jpg';
  writeFileSync(path.join(outDir, `${s.name ?? String(i).padStart(4, '0')}.${ext}`), Buffer.from(url.split(',')[1], 'base64'));
  i++;
  if (i % 10 === 0) console.log(i, '/', shots.length, ((Date.now() - t0) / i / 1000).toFixed(2) + 's/frame');
}
await browser.close();
console.log('done', i, 'in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
