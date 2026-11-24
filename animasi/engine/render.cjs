// Render episode ke MP4 (video saja). Pemakaian:
//   node render.cjs <ep> <out.mp4> [fps=30] [start] [end]
//   node render.cjs <ep> --still <t1,t2,...> <outdir>   (cek frame tertentu, PNG)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png' };
function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
    }).listen(0, () => res(s));
  });
}
(async () => {
  const [ep, out, ...rest] = process.argv.slice(2);
  const srv = await serve(); const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${port}/index.html?ep=${ep}`);
  await page.waitForFunction(() => window.READY || window.ERROR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.ERROR); if (err) { console.error(err); process.exit(1); }
  const dur = await page.evaluate(() => window.DURATION);
  if (out === '--still') {
    const times = rest[0].split(',').map(Number); const dir = rest[1]; fs.mkdirSync(dir, { recursive: true });
    for (const t of times) { const d = await page.evaluate(t => window.renderFrame(t), t); fs.writeFileSync(path.join(dir, `${ep}_${t.toFixed(2)}.jpg`), Buffer.from(d.split(',')[1], 'base64')); }
    await browser.close(); srv.close(); return;
  }
  const fps = +(rest[0] || 30), t0 = +(rest[1] || 0), t1 = +(rest[2] || dur);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((t1 - t0) * fps); const st = Date.now();
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fps;
    const d = await page.evaluate(t => window.renderFrame(t), t);
    const buf = Buffer.from(d.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.error(`${ep} frame ${i}/${n}  ${((Date.now() - st) / 1000 / (i + 1)).toFixed(3)} s/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close(); srv.close();
})();
