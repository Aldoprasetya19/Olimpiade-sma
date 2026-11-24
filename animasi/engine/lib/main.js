// Pemutar timeline: memilih shot berdasarkan waktu, membangun scene-nya, lalu merender frame.
import * as THREE from 'three';
import * as core from './core.js';
import { W, H } from './core.js';

async function loadFonts() {
  const base = './node_modules/@fontsource/';
  const list = [['Nunito', 'nunito/files/nunito-latin-500-normal.woff2', 500], ['Nunito', 'nunito/files/nunito-latin-700-normal.woff2', 700],
    ['Nunito', 'nunito/files/nunito-latin-800-normal.woff2', 800], ['Nunito', 'nunito/files/nunito-latin-300-normal.woff2', 300], ['Nunito', 'nunito/files/nunito-latin-600-normal.woff2', 600],
    ['Oswald', 'oswald/files/oswald-latin-700-normal.woff2', 700]];
  for (const [fam, f, w] of list) { const ff = new FontFace(fam, `url(${base}${f})`, { weight: String(w) }); await ff.load(); document.fonts.add(ff); }
}

class Stage {
  constructor() {
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 200);
  }
  add(o, pos = [0, 0, 0], rotY = 0) { o.position?.set?.(...pos); if (o.rotation) o.rotation.y = rotY; this.scene.add(o.root || o); if (o.root) { o.root.position.set(...pos); o.root.rotation.y = rotY; } return o; }
  // kamera bergerak dari A ke B (k 0..1)
  camMove(k, a, b = a, e = core.ease) {
    const kk = e(k);
    const p = a.pos.map((v, i) => core.lerp(v, b.pos[i], kk));
    const l = a.look.map((v, i) => core.lerp(v, b.look[i], kk));
    const sh = (a.shake ?? 0) ;
    const t = this.t || 0;
    this.cam.position.set(p[0] + core.noise1(t * 2.3, 1) * sh, p[1] + core.noise1(t * 2.1, 5) * sh, p[2]);
    this.cam.fov = core.lerp(a.fov ?? 40, b.fov ?? a.fov ?? 40, kk); this.cam.updateProjectionMatrix();
    this.cam.lookAt(l[0] + core.noise1(t * 1.9, 9) * sh * 0.6, l[1] + core.noise1(t * 2.2, 3) * sh * 0.6, l[2]);
  }
}

let shots = [], cur = -1, stage = null, update = null, DUR = 0, meta = {};

function dispose(scene) {
  scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
}

function buildShot(i) {
  if (stage) dispose(stage.scene);
  stage = new Stage();
  const s = shots[i];
  const src = s.endcard ? shots[i - 1] : s;
  update = src.build(stage) || (() => {});
  cur = i;
}

window.renderFrame = (t) => {
  let i = shots.findIndex(s => t >= s.t0 && t < s.t1);
  if (i < 0) i = shots.length - 1;
  if (i !== cur) buildShot(i);
  const s = shots[i];
  const lt = t - s.t0, d = s.t1 - s.t0;
  core.hud.clearRect(0, 0, W, H);
  stage.t = t;
  let grade;
  if (s.endcard) {
    const p = shots[i - 1]; const pd = p.t1 - p.t0;
    stage.t = p.t1;
    grade = update(pd, 1, p.t1, core.hud, true) || p.grade || 'hangat';
    core.hud.clearRect(0, 0, W, H);
    const k = core.ease(core.seg(lt, 0, 0.4));
    grade = core.mixGrade(grade, { sat: 0.6, bright: -0.08, blur: 7, overlayColor: [0.16, 0.14, 0.22], overlayAmt: 0.78, vigAmt: 0.6, vigColor: [0, 0, 0], grain: 0.03 }, k);
  } else {
    grade = update(lt, d > 0 ? lt / d : 0, t, core.hud) || s.grade || 'hangat';
  }
  const g = typeof grade === 'string' ? { ...core.GRADES[grade] } : { ...grade };
  // transisi
  if (s.flashIn && lt < s.flashIn) { g.overlayColor = [1, 1, 1]; g.overlayAmt = Math.max(g.overlayAmt || 0, 1 - lt / s.flashIn); }
  if (s.fadeIn && lt < s.fadeIn) { g.overlayColor = [0, 0, 0]; g.overlayAmt = Math.max(g.overlayAmt || 0, 1 - lt / s.fadeIn); }
  if (s.flashOut && d - lt < s.flashOut) { g.overlayColor = [1, 1, 1]; g.overlayAmt = 1 - (d - lt) / s.flashOut; }
  core.applyGrade(g);
  core.renderFrame(stage.scene, stage.cam, t);
  return core.renderer.domElement.toDataURL('image/jpeg', 0.92);
};

(async () => {
  await loadFonts();
  const ep = new URLSearchParams(location.search).get('ep') || 'test';
  const mod = await import(`../episodes/${ep}.js`);
  shots = mod.shots; DUR = mod.duration; meta = mod.meta || {};
  window.DURATION = DUR; window.META = meta;
  window.READY = true;
})().catch(e => { window.ERROR = String(e.stack || e); });
