// Properti & lokasi. Semua lokasi: lantai y=0, karakter tinggi ±2.6 unit.
import * as THREE from 'three';
import { toon, flat, noOutline } from './core.js';
import { rbox, POSES } from './char.js';
export const CAST_REF = {};
import { PW, PH } from './phoneui.js';

export function mesh(geo, mat, { cast = true, recv = true } = {}) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; return m; }
function box(w, h, d, color, pos, opts = {}) {
  const m = mesh(opts.round ? rbox(w, h, d, opts.round) : new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? toon(color, opts.mat || {}) : color, opts);
  m.position.set(...pos); if (opts.rot) m.rotation.set(...opts.rot); return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}
function textPlane(w, h, draw, pxW = 512) {
  const t = canvasTex(pxW, Math.round(pxW * h / w), draw);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat('#fff', { map: t, transparent: true }));
}
const texCache = {};
function terrazzo(base = '#d9d2c3', dots = ['#8d8476', '#b7ad9c', '#6f6a60', '#e9e4da']) {
  const k = base + dots.join();
  if (texCache[k]) return texCache[k];
  const t = canvasTex(512, 512, (x) => { x.fillStyle = base; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 1800; i++) { x.fillStyle = dots[i % dots.length]; x.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 4, 2 + Math.random() * 3); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return texCache[k] = t;
}
function tiles(base = '#c9b89a', line = '#a8977a', n = 8) {
  const t = canvasTex(512, 512, (x) => { x.fillStyle = base; x.fillRect(0, 0, 512, 512); x.strokeStyle = line; x.lineWidth = 4; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * 512 / n, 0); x.lineTo(i * 512 / n, 512); x.stroke(); x.beginPath(); x.moveTo(0, i * 512 / n); x.lineTo(512, i * 512 / n); x.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
function wood(base = '#b5835a') {
  const t = canvasTex(512, 512, (x) => { x.fillStyle = base; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'; x.fillRect(0, i * 32, 512, 32); x.fillStyle = 'rgba(60,30,10,0.25)'; x.fillRect(0, i * 32, 512, 2); x.fillRect(((i * 157) % 400), i * 32, 2, 32); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}

export function lights(scene, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky || '#fff6e6', o.ground || '#8a7a6a', o.hemi ?? 1.6); scene.add(hemi);
  const d = new THREE.DirectionalLight(o.sun || '#fff1d6', o.sunI ?? 1.8);
  d.position.set(...(o.sunPos || [4, 9, 6])); d.castShadow = true;
  d.shadow.mapSize.set(1024, 1024); const s = o.shadowSize || 8;
  Object.assign(d.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 40 }); d.shadow.bias = -0.0015; d.shadow.radius = 4;
  if (o.target) d.target.position.set(...o.target);
  scene.add(d); scene.add(d.target);
  return { hemi, sun: d };
}
function sky(scene, top = '#8fc3ea', bottom = '#e8f2f8') {
  scene.background = canvasTex(4, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, 4, 256); });
}

// ---------------- properti
export function phone(o = {}) {
  const g = new THREE.Group();
  const body = mesh(rbox(0.24, 0.48, 0.035, 0.03), toon(o.case || '#1e2328')); g.add(body);
  const c = document.createElement('canvas'); c.width = PW; c.height = PH;
  const ctx = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.215, 0.43), flat('#fff', { map: tex })); scr.position.z = 0.0185; g.add(scr);
  g.userData = { ctx, tex, screen: scr, canvas: c };
  g.draw = (fn) => { ctx.save(); fn(ctx); ctx.restore(); tex.needsUpdate = true; };
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, PW, PH); tex.needsUpdate = true;
  return g;
}
export function chair(color = '#c98b4e') {
  const g = new THREE.Group();
  g.add(box(0.9, 0.08, 0.85, color, [0, 0.42, 0], { round: 0.02 }));
  g.add(box(0.9, 0.7, 0.08, color, [0, 0.87, -0.4], { round: 0.02 }));
  for (const [x, z] of [[-0.4, -0.38], [0.4, -0.38], [-0.4, 0.38], [0.4, 0.38]]) g.add(box(0.06, 0.42, 0.06, '#2b2b2b', [x, 0.21, z]));
  return g;
}
export function desk(w = 1.9, d = 1.0, h = 0.92, top = '#c98b4e') {
  const g = new THREE.Group();
  g.add(box(w, 0.08, d, top, [0, h, 0], { round: 0.02 }));
  g.add(box(w - 0.1, 0.3, 0.05, top, [0, h - 0.2, -d / 2 + 0.06]));
  for (const [x, z] of [[-w / 2 + 0.06, -d / 2 + 0.06], [w / 2 - 0.06, -d / 2 + 0.06], [-w / 2 + 0.06, d / 2 - 0.06], [w / 2 - 0.06, d / 2 - 0.06]]) g.add(box(0.06, h, 0.06, '#2b2b2b', [x, h / 2, z]));
  return g;
}
export function paper(w = 0.42, d = 0.58, lines = 8) {
  const t = canvasTex(256, 360, (x) => { x.fillStyle = '#f7f4ec'; x.fillRect(0, 0, 256, 360); x.fillStyle = '#9aa'; for (let i = 0; i < lines; i++) x.fillRect(24, 40 + i * 36, 200 - (i % 3) * 30, 6); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), flat('#fff', { map: t })); m.rotation.x = -Math.PI / 2; return m;
}
export function bread(label = 'ROTI') {
  const g = new THREE.Group();
  const t = canvasTex(256, 160, (x) => { x.fillStyle = '#f2d16b'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#c0392b'; x.fillRect(0, 50, 256, 60); x.fillStyle = '#fff'; x.font = 'bold 44px Oswald'; x.textAlign = 'center'; x.fillText(label, 128, 96); });
  const m = mesh(rbox(0.42, 0.16, 0.3, 0.07), toon('#ffffff', { map: t })); g.add(m); return g;
}
export function plate() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.04, 24), toon('#f4f4f0')));
  const s = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), toon('#e0a060')); s.position.set(0.08, 0.03, 0.05); g.add(s);
  return g;
}
export function glass(color = '#d9eef7') { const m = mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.24, 16), toon(color, { transparent: true, opacity: 0.8 })); m.position.y = 0.12; const g = new THREE.Group(); g.add(m); return g; }
export function plant() {
  const g = new THREE.Group(); g.add(box(0.4, 0.4, 0.4, '#a0522d', [0, 0.2, 0], { round: 0.05 }));
  for (let i = 0; i < 5; i++) { const l = mesh(new THREE.SphereGeometry(0.22, 10, 8), toon('#4f9a5a')); l.position.set(Math.sin(i * 1.3) * 0.15, 0.55 + (i % 2) * 0.15, Math.cos(i * 1.3) * 0.15); g.add(l); }
  return g;
}
export function tree(h = 3.5) {
  const g = new THREE.Group(); g.add(box(0.35, h, 0.35, '#7a5233', [0, h / 2, 0]));
  for (let i = 0; i < 4; i++) { const l = mesh(rbox(1.6 - i * 0.2, 1, 1.6 - i * 0.2, 0.3), toon(i % 2 ? '#5aa05c' : '#4a8d4f')); l.position.set((i % 2) * 0.3 - 0.15, h + i * 0.55 - 0.2, ((i + 1) % 2) * 0.3 - 0.15); g.add(l); }
  return g;
}
export function signBoard(text = 'XII IPA 2') {
  const g = new THREE.Group();
  const t = canvasTex(512, 128, (x) => { x.fillStyle = '#1f5f8b'; x.fillRect(0, 0, 512, 128); x.strokeStyle = '#fff'; x.lineWidth = 8; x.strokeRect(10, 10, 492, 108); x.fillStyle = '#fff'; x.font = 'bold 72px Oswald'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 68); });
  const front = mesh(new THREE.BoxGeometry(1.8, 0.45, 0.06), [toon('#1f5f8b'), toon('#1f5f8b'), toon('#1f5f8b'), toon('#1f5f8b'), toon('#fff', { map: t }), toon('#1f5f8b')]);
  g.add(front); return g;
}
export function ladder(h = 3) {
  const g = new THREE.Group(); const m = '#b8bec4';
  for (const s of [-1, 1]) g.add(box(0.07, h, 0.07, m, [s * 0.3, h / 2, 0]));
  for (let i = 1; i < h / 0.38; i++) g.add(box(0.6, 0.05, 0.06, m, [0, i * 0.38, 0]));
  return g;
}
export function crate(color = '#2f7fc1') { const g = new THREE.Group(); g.add(box(0.8, 0.5, 0.6, color, [0, 0.25, 0], { round: 0.03 })); return g; }
export function piala() {
  const g = new THREE.Group(); const gold = toon('#f2c230'), gd = toon('#c99a1a');
  g.add(box(0.36, 0.12, 0.36, '#5d4033', [0, 0.06, 0], { round: 0.02 }));
  const st = mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.22, 12), gd); st.position.y = 0.23; g.add(st);
  const cup = mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.32, 20), gold); cup.position.y = 0.5; g.add(cup);
  for (const s of [-1, 1]) { const h = mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16), gold); h.position.set(s * 0.22, 0.52, 0); h.rotation.y = Math.PI / 2; g.add(h); }
  return g;
}
export function kalengCat() { const g = new THREE.Group(); const c = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.26, 16), toon('#d8d8d8')); c.position.y = 0.13; g.add(c); const l = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.03, 16), toon('#e0b020')); l.position.y = 0.27; g.add(l); return g; }
export function motor(color = '#c0392b', tua = false) { // menghadap +x; userData.roda, lampu
  const g = new THREE.Group(); const roda = [];
  for (const x of [-0.75, 0.75]) { const w = new THREE.Group(); w.position.set(x, 0.36, 0); const tire = mesh(new THREE.TorusGeometry(0.28, 0.09, 10, 20), toon('#1d1d1d')); w.add(tire);
    const hub = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12), toon('#9aa0a6')); hub.rotation.x = Math.PI / 2; w.add(hub); g.add(w); roda.push(w); }
  g.add(box(1.25, 0.3, 0.34, color, [0, 0.7, 0], { round: 0.08 })); g.add(box(0.85, 0.12, 0.38, '#222', [-0.2, 0.9, 0], { round: 0.05 }));
  g.add(box(0.1, 0.6, 0.1, '#555', [0.62, 0.95, 0], { rot: [0, 0, -0.35] })); g.add(box(0.08, 0.08, 0.8, '#333', [0.75, 1.25, 0]));
  const lamp = mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: tua ? '#fff2b0' : '#fffbe6' })); lamp.position.set(0.85, 1.05, 0); g.add(lamp);
  if (tua) { g.add(box(0.5, 0.35, 0.4, '#b03a2e', [-0.75, 1.15, 0], { round: 0.03 })); const ban = mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 16), toon('#111')); ban.position.set(-0.75, 1.42, 0); ban.rotation.x = Math.PI / 2; g.add(ban); }
  g.userData.roda = roda; g.userData.lamp = lamp; return g;
}
export function helm(color = '#2c3e50') { const g = new THREE.Group(); const h = mesh(new THREE.SphereGeometry(0.55, 18, 14), toon(color)); h.scale.set(1, 0.95, 1.05); g.add(h);
  const v = mesh(new THREE.BoxGeometry(0.7, 0.28, 0.1), toon('#111', { transparent: true, opacity: 0.85 })); v.position.set(0, 0.0, 0.5); g.add(v); return g; }
export function mobil(color = '#e8e8e8') {
  const g = new THREE.Group(); g.add(box(3.6, 0.9, 1.7, color, [0, 0.75, 0], { round: 0.15 })); g.add(box(2.0, 0.75, 1.6, color, [-0.2, 1.55, 0], { round: 0.15 }));
  g.add(box(1.9, 0.6, 1.62, noOutline(flat('#2b3a4a')), [-0.2, 1.57, 0], { cast: false }));
  for (const [x, z] of [[1.15, 0.85], [-1.15, 0.85], [1.15, -0.85], [-1.15, -0.85]]) { const w = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 16), toon('#1d1d1d')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.36, z); g.add(w); }
  const lid = box(0.1, 0.8, 1.5, color, [-1.85, 1.6, 0], { rot: [0, 0, -1.0] }); g.add(lid); return g;
}
export function mesinBoba() { const g = new THREE.Group(); g.add(box(0.55, 0.7, 0.5, '#d7dde3', [0, 0.35, 0], { round: 0.05 })); g.add(box(0.35, 0.12, 0.35, '#e74c3c', [0, 0.78, 0])); g.add(box(0.2, 0.2, 0.05, noOutline(flat('#2ecc71')), [0, 0.45, 0.26])); return g; }
export function coolerBox() { const g = new THREE.Group(); g.add(box(0.8, 0.5, 0.5, '#2d7dd2', [0, 0.25, 0], { round: 0.06 })); g.add(box(0.84, 0.1, 0.54, '#ffffff', [0, 0.52, 0], { round: 0.04 })); return g; }
export function termos() { const g = new THREE.Group(); const c = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 16), toon('#e74c3c')); c.position.y = 0.28; g.add(c); const l = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), toon('#333')); l.position.y = 0.6; g.add(l); return g; }
export function gitar() { const g = new THREE.Group(); const b = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 20), toon('#7b3f1a')); b.rotation.x = Math.PI / 2; g.add(b);
  const b2 = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.1, 20), toon('#7b3f1a')); b2.rotation.x = Math.PI / 2; b2.position.y = 0.3; g.add(b2);
  const h = mesh(new THREE.CircleGeometry(0.08, 14), flat('#2b1a10')); h.position.set(0, 0.08, 0.051); g.add(h); g.add(box(0.07, 0.75, 0.05, '#3a2414', [0, 0.75, 0])); g.add(box(0.11, 0.18, 0.05, '#2a1a0e', [0, 1.2, 0])); return g; }
// gitar dipasang mengikuti kedua tangan pose gitar: badan di tangan kanan (petik), leher menuju tangan kiri
export function pasangGitar(c, pose = POSES.gitar, alat = null) {
  const g = alat || gitar(); c.torso.add(g); c.applyPose(pose); c.root.updateMatrixWorld(true);
  const R = c.torso.worldToLocal(c.handOf(-1).getWorldPosition(new THREE.Vector3())), L = c.torso.worldToLocal(c.handOf(1).getWorldPosition(new THREE.Vector3()));
  const y = L.clone().sub(R); const len = y.length(); y.normalize();
  const z = new THREE.Vector3(0, 0, 1); z.sub(y.clone().multiplyScalar(z.dot(y))).normalize(); const x = new THREE.Vector3().crossVectors(y, z);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  g.scale.setScalar(Math.min(1.35, Math.max(0.7, len / 0.95))); // tangan kiri jatuh di leher (±0,95 dari pusat badan gitar)
  g.position.copy(R).add(z.clone().multiplyScalar(-0.12)).add(y.clone().multiplyScalar(-0.05 * g.scale.x));
  return g;
}
export function mikrofon() { const g = new THREE.Group(); g.add(box(0.06, 0.25, 0.06, '#222', [0, 0, 0])); const h = mesh(new THREE.SphereGeometry(0.07, 10, 8), toon('#888')); h.position.y = 0.16; g.add(h); return g; }
function stan(label, warna, x, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, -1.6);
  g.add(box(3.2, 0.95, 0.9, '#f4f1ea', [0, 0.47, 0.7], { round: 0.03 })); g.add(box(3.25, 0.06, 0.95, warna, [0, 0.96, 0.7]));
  for (const px of [-1.6, 1.6]) for (const pz of [-0.6, 1.1]) g.add(box(0.08, 2.9, 0.08, '#888', [px, 1.45, pz]));
  g.add(box(3.6, 0.1, 2.0, warna, [0, 2.95, 0.25], { rot: [0.1, 0, 0] }));
  const sp = textPlane(3.0, 0.6, (c, w, h) => { c.fillStyle = warna; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.55}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, w / 2, h / 2 + 3); });
  sp.position.set(0, 2.55, 1.17); g.add(sp); return g;
}
export function bus(color = '#1f6fb2') { const g = new THREE.Group();
  g.add(box(10, 3.0, 2.6, color, [0, 1.9, 0], { round: 0.25 })); g.add(box(9.6, 1.0, 2.62, noOutline(flat('#2b3a4a')), [0, 2.4, 0], { cast: false }));
  g.add(box(0.1, 2.0, 1.0, '#ddd', [4.96, 1.5, 0.7], { }));
  g.add(box(0.95, 2.05, 0.02, noOutline(flat('#e9e3d6')), [4.0, 1.42, 1.312], { cast: false })); // ambang pintu terang (interior)
  for (let i = 0; i < 2; i++) g.add(box(0.95, 0.12, 0.3, '#9a9a9a', [4.0, 0.5 + i * 0.28, 1.2 + (1 - i) * 0.25]));
  const pintu = new THREE.Group(); pintu.name = 'pintuBus'; pintu.position.set(4.0, 1.5, 1.36); g.add(pintu);
  pintu.add(box(0.92, 2.0, 0.05, '#f1f1ee', [0, 0, 0])); pintu.add(box(0.7, 0.8, 0.01, noOutline(flat('#9fc7dd')), [0, 0.45, 0.03], { cast: false }));
  for (const x of [-3.5, 3.2]) for (const z of [-1.3, 1.3]) { const w = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16), toon('#1d1d1d')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); g.add(w); }
  const tx = textPlane(4, 0.5, (c, w, h) => { c.fillStyle = color; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.6}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PARIWISATA NYUATAN', w / 2, h / 2 + 2); });
  tx.position.set(-0.5, 1.2, 1.32); g.add(tx); return g; }

// ---------- alat band (seri "Satu Lagu")
export function gitarListrik(warna = '#c0392b', bass = false) { const g = new THREE.Group();
  g.add(box(0.5, 0.5, 0.09, warna, [0, 0.05, 0], { round: 0.12 })); g.add(box(0.36, 0.32, 0.09, warna, [0.08, 0.36, 0], { round: 0.1 }));
  g.add(box(0.06, 0.12, 0.02, noOutline(flat('#222')), [0, 0.12, 0.05], { cast: false })); g.add(box(0.07, bass ? 0.95 : 0.75, 0.05, '#2a1a0e', [0, bass ? 0.85 : 0.75, 0]));
  g.add(box(0.11, 0.18, 0.05, '#111', [0, bass ? 1.38 : 1.2, 0])); return g; }
export function micStand() { const g = new THREE.Group(); g.add(box(0.5, 0.04, 0.5, '#222', [0, 0.02, 0]));
  g.add(box(0.04, 1.75, 0.04, '#333', [0, 0.9, 0])); const m = mesikrofonKepala(); m.position.set(0, 1.85, 0.08); m.rotation.x = 0.5; m.name = 'micKepala'; g.add(m); return g; }
function mesikrofonKepala() { const g = new THREE.Group(); g.add(box(0.05, 0.2, 0.05, '#222', [0, 0, 0])); const h = mesh(new THREE.SphereGeometry(0.065, 10, 8), toon('#999')); h.position.y = 0.13; g.add(h); return g; }
export function ampli(w = 0.8, h = 0.8) { const g = new THREE.Group(); g.add(box(w, h, 0.45, '#1e1e1e', [0, h / 2, 0], { round: 0.03 }));
  const sp = mesh(new THREE.CircleGeometry(Math.min(w, h) * 0.32, 18), noOutline(flat('#3a3a3a'))); sp.position.set(0, h * 0.45, 0.231); g.add(sp);
  g.add(box(w * 0.9, 0.07, 0.02, noOutline(flat('#c9a227')), [0, h * 0.88, 0.232], { cast: false })); return g; }
export function drumKit() { const g = new THREE.Group();
  const bd = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.4, 22), toon('#b03a2e')); bd.rotation.x = Math.PI / 2; bd.position.set(0, 0.45, 0.35); g.add(bd);
  const kul = mesh(new THREE.CircleGeometry(0.38, 22), noOutline(flat('#f4efe6'))); kul.position.set(0, 0.45, 0.556); g.add(kul);
  const tx = textPlane(0.5, 0.14, (c, w, h) => { c.fillStyle = '#b03a2e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.7}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NYUATAN', w / 2, h / 2 + 2); }); tx.position.set(0, 0.42, 0.56); g.add(tx);
  for (const [x, y, z, r, nm] of [[-0.45, 0.85, 0.15, 0.2, 'snare'], [-0.2, 1.05, 0.3, 0.16, 'tom1'], [0.2, 1.05, 0.3, 0.16, 'tom2'], [0.55, 0.75, 0.0, 0.22, 'tom3']]) {
    const d = mesh(new THREE.CylinderGeometry(r, r, 0.18, 18), toon('#b03a2e')); d.position.set(x, y, z); g.add(d); const k = mesh(new THREE.CircleGeometry(r * 0.92, 18), noOutline(flat('#f4efe6'))); k.rotation.x = -Math.PI / 2; k.position.set(x, y + 0.091, z); g.add(k);
    if (y < 0.9) g.add(box(0.03, y - 0.1, 0.03, '#888', [x, (y - 0.1) / 2, z])); }
  for (const [x, z, h, nm] of [[-0.8, 0.25, 1.35, 'simbal1'], [0.85, 0.35, 1.5, 'simbal2']]) { g.add(box(0.03, h, 0.03, '#888', [x, h / 2, z])); const cy = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.015, 20), toon('#d4a72c')); cy.position.set(x, h, z); cy.rotation.z = 0.15; cy.name = nm; g.add(cy); }
  g.add(box(0.4, 0.08, 0.4, '#222', [0, 0.5, -0.45])); g.add(box(0.05, 0.5, 0.05, '#555', [0, 0.25, -0.45])); return g; }
export function keyboardAlat() { const g = new THREE.Group();
  for (const x of [-0.45, 0.45]) g.add(box(0.05, 0.95, 0.05, '#333', [x, 0.47, 0], { rot: [0, 0, x > 0 ? -0.25 : 0.25] }));
  g.add(box(1.25, 0.1, 0.38, '#1c1c1c', [0, 0.98, 0], { round: 0.02 }));
  const tuts = textPlane(1.15, 0.22, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; for (let i = 0; i <= 36; i++) c.fillRect(i * w / 36, 0, 1.5, h); for (let i = 0; i < 36; i++) if ([1, 3, 6, 8, 10].includes(i % 12)) c.fillRect(i * w / 36 + w / 72, 0, w / 60, h * 0.6); });
  tuts.rotation.x = -Math.PI / 2; tuts.position.set(0, 1.035, 0.06); g.add(tuts); return g; }
export function stik() { const g = new THREE.Group(); g.add(box(0.03, 0.42, 0.03, '#e2c48a', [0, 0.12, 0])); return g; }
export function syal(c, warna = '#c0392b') { const s0 = mesh(new THREE.TorusGeometry(0.33, 0.12, 8, 18), toon(warna)); s0.rotation.x = Math.PI / 2; s0.position.y = 0.02; c.neck.add(s0);
  const ujung = box(0.16, 0.42, 0.08, warna, [0.12, -0.25, 0.28], { round: 0.03 }); c.neck.add(ujung); return s0; }
function orangSederhana(color, skin) { const g = new THREE.Group(); g.add(box(0.6, 0.95, 0.38, color, [0, 1.15, 0], { round: 0.12, cast: false }));
  g.add(box(0.5, 0.72, 0.36, '#2f3640', [0, 0.36, 0], { round: 0.08, cast: false })); const h = mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.6, 12), toon(skin), { cast: false }); h.position.y = 1.95; g.add(h);
  const r = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 12), toon('#2a1d16'), { cast: false }); r.position.y = 2.28; g.add(r); return g; }
function kerumunan(scene, o) { // penonton sederhana (murah), sebagian menyalakan senter HP
  const lampu = [], badan = []; const warna = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#16a085', '#7f8c8d', '#f39c12', '#2c3e50'], kulit = ['#c98a52', '#e0b07e', '#b07040', '#d49a64'];
  const z0 = o.z0 ?? 3.2, rows = o.rows ?? 9, perRow = o.perRow ?? 16;
  for (let r = 0; r < rows; r++) for (let i = 0; i < perRow; i++) {
    const x = -11 + i * (22 / (perRow - 1)) + (r % 2) * 0.6 + Math.sin(i * 7 + r) * 0.2, z = z0 + r * 1.25 + Math.cos(i * 3 + r) * 0.2;
    const p = orangSederhana(warna[(i * 3 + r) % warna.length], kulit[(i + r) % 4]); p.position.set(x, 0, z); p.rotation.y = Math.PI + Math.sin(i + r) * 0.2; scene.add(p); badan.push(p);
    const on = ((i * 37 + r * 11) % 100) / 100 < (o.senter || 0);
    if (on) { const L = new THREE.Group(); L.add(box(0.12, 0.22, 0.03, '#111', [0, 0, 0])); const g = mesh(new THREE.SphereGeometry(0.09, 8, 6), noOutline(flat('#fffbe6'))); g.position.set(0, 0.06, -0.03); L.add(g);
      const halo = mesh(new THREE.SphereGeometry(0.16, 10, 8), noOutline(flat('#fff3b0', { transparent: true, opacity: 0.45, depthWrite: false })), { cast: false }); halo.position.copy(g.position); L.add(halo);
      L.position.set(x + 0.25, 2.85, z); L.userData.ph = i * 0.7 + r; scene.add(L); lampu.push(L); }
  }
  return { lampu, badan };
}
export function bag(color = '#2d3a4a') { const g = new THREE.Group(); g.add(box(0.6, 0.7, 0.3, color, [0, 0.35, 0], { round: 0.1 })); return g; }

function windowPane(w, h, glassColor, frame = '#f1f1f1') {
  const g = new THREE.Group();
  g.add(box(w, h, 0.05, noOutline(flat(glassColor)), [0, 0, 0], { cast: false }));
  for (const [ww, hh, x, y] of [[w + 0.1, 0.1, 0, h / 2], [w + 0.1, 0.1, 0, -h / 2], [0.1, h, -w / 2, 0], [0.1, h, w / 2, 0], [0.06, h, 0, 0]]) g.add(box(ww, hh, 0.1, frame, [x, y, 0.03]));
  return g;
}
function door(color = '#8b5a3c') { // engsel di kiri; userData.leaf diputar untuk membuka
  const g = new THREE.Group(); g.name = 'pintu';
  g.add(box(1.4, 3.0, 0.04, noOutline(flat('#1a1612')), [0, 1.5, -0.04], { cast: false }));
  const leaf = new THREE.Group(); leaf.position.set(-0.65, 0, 0); g.add(leaf);
  leaf.add(box(1.3, 2.9, 0.1, color, [0.65, 1.45, 0])); leaf.add(box(0.08, 0.08, 0.1, '#d4af37', [1.15, 1.4, 0.08]));
  g.userData.leaf = leaf; return g;
}

// ---------------- lokasi
function room(scene, o) {
  const { w = 12, d = 10, h = 4.6, wall = '#efe2c7', floorMat, trim } = o;
  const floor = mesh(new THREE.PlaneGeometry(w, d * 3), floorMat, { cast: false }); floor.rotation.x = -Math.PI / 2; noOutline(floor.material); scene.add(floor);
  const wm = toon(wall); noOutline(wm);
  const back = mesh(new THREE.PlaneGeometry(w, h), wm, { cast: false }); back.position.set(0, h / 2, -d / 2); scene.add(back);
  for (const s of [-1, 1]) { const side = mesh(new THREE.PlaneGeometry(d, h), wm, { cast: false }); side.position.set(s * w / 2, h / 2, 0); side.rotation.y = -s * Math.PI / 2; scene.add(side); }
  const ceil = mesh(new THREE.PlaneGeometry(w, d), noOutline(flat(o.ceil || '#f3efe6')), { cast: false }); ceil.position.y = h; ceil.rotation.x = Math.PI / 2; scene.add(ceil);
  const front = mesh(new THREE.PlaneGeometry(w, h), wm, { cast: false }); front.position.set(0, h / 2, d / 2); front.rotation.y = Math.PI; scene.add(front);
  if (trim) {
    const tm = noOutline(toon(trim));
    scene.add(box(w, 1.0, 0.03, tm, [0, 0.5, -d / 2 + 0.02], { cast: false }));
    for (const s of [-1, 1]) scene.add(box(0.03, 1.0, d, tm, [s * (w / 2 - 0.02), 0.5, 0], { cast: false }));
  }
}

export const SETS = {
  rumah(scene, o = {}) { // ruang makan malam, dapur di belakang
    scene.userData.clear = 0x222222;
    room(scene, { w: 12, d: 11, wall: '#e9d9bd', floorMat: toon('#fff', { map: wood('#a87850') }), ceil: '#efe6d6' });
    lights(scene, { sky: '#ffe9c9', ground: '#6a5040', hemi: 1.5, sun: '#ffd9a6', sunI: 1.4, sunPos: [1, 8, 3] });
    const lamp = new THREE.PointLight('#ffcf8a', 6, 8, 1.6); lamp.position.set(0, 3.6, 0); scene.add(lamp);
    const shade = mesh(new THREE.ConeGeometry(0.55, 0.45, 20, 1, true), toon('#f1c36d', { side: THREE.DoubleSide })); shade.position.set(0, 3.9, 0); scene.add(shade);
    scene.add(box(0.03, 0.6, 0.03, '#333', [0, 4.3, 0]));
    // meja makan
    const t = desk(2.6, 1.4, 0.92, '#8b5a3c'); scene.add(t);
    const cA = chair('#7a4a2e'); cA.position.set(0, 0, 1.0); cA.rotation.y = Math.PI; scene.add(cA);
    const cB = chair('#7a4a2e'); cB.position.set(-1.0, 0, -1.0); scene.add(cB);
    const pl = plate(); pl.position.set(0.1, 0.98, 0.35); scene.add(pl);
    const gl = glass(); gl.position.set(0.65, 0.96, 0.3); scene.add(gl);
    // dapur di belakang
    scene.add(box(5, 1.1, 0.9, '#d6d0c4', [1.8, 0.55, -4.9], { round: 0.03 }));
    scene.add(box(5, 0.08, 1.0, '#7d8a8c', [1.8, 1.14, -4.85]));
    scene.add(box(1.2, 2.4, 0.9, '#cfd8dc', [-2.2, 1.2, -4.9], { round: 0.05 }));
    scene.add(box(4, 0.9, 0.5, '#cdbfa6', [2.2, 2.9, -5.2], { round: 0.03 }));
    const win = windowPane(1.8, 1.4, '#1d2b4f'); win.position.set(-4.2, 2.3, -5.45); scene.add(win);
    const win2 = windowPane(1.8, 1.4, '#1d2b4f'); win2.position.set(-5.95, 2.3, 0); win2.rotation.y = Math.PI / 2; scene.add(win2);
    const pt = plant(); pt.position.set(-5.2, 0, -4.6); scene.add(pt);
    // pigura
    scene.add(box(0.9, 0.7, 0.05, '#6b4a2f', [3.5, 2.6, -5.47])); scene.add(box(0.75, 0.55, 0.02, noOutline(flat('#e8c9a0')), [3.5, 2.6, -5.43]));
    const pr = door('#6b4430'); pr.position.set(5.94, 0, 2.5); pr.rotation.y = -Math.PI / 2; scene.add(pr);
    return { meja: [0, 0.96, 0], kursiAldo: [0, 0, 1.0], dapur: [1.8, 0, -4.1] };
  },
  sekolahTangga(scene, o = {}) { // koridor + tangga, papan penunjuk kelas tergantung
    scene.userData.clear = 0x222222;
    room(scene, { w: 16, d: 12, h: 5.2, wall: '#eee3c9', floorMat: toon('#fff', { map: terrazzo() }), trim: '#3f8a5c' });
    lights(scene, { sky: '#fffaf0', ground: '#9a8f7a', hemi: 1.7, sunI: 1.5, sunPos: [6, 10, 8] });
    // tangga naik ke kiri-belakang
    const steps = new THREE.Group();
    for (let i = 0; i < 9; i++) steps.add(box(2.4, 0.3 * (i + 1), 0.5, '#d1c7b2', [0, 0.15 * (i + 1), -i * 0.5], { round: 0.02 }));
    steps.position.set(-4.5, 0, -1.5); scene.add(steps);
    for (let i = 0; i < 9; i++) scene.add(box(0.06, 1.0, 0.06, '#5a5a5a', [-3.3, 0.3 * (i + 1) + 0.5, -1.5 - i * 0.5]));
    const rail = box(0.08, 0.08, 4.8, '#5a5a5a', [-3.3, 2.4, -3.5], { rot: [-0.54, 0, 0] }); scene.add(rail);
    // pintu kelas & jendela
    const dr = door('#7b5236'); dr.position.set(3.5, 0, -5.95); scene.add(dr);
    const wn = windowPane(2.4, 1.3, '#bfe0f0'); wn.position.set(0.6, 2.4, -5.95); scene.add(wn);
    const wn2 = windowPane(2.4, 1.3, '#bfe0f0'); wn2.position.set(6.2, 2.4, -5.95); scene.add(wn2);
    // mading
    scene.add(box(1.6, 1.1, 0.06, '#b07a4a', [-1.6, 2.3, -5.95]));
    for (let i = 0; i < 4; i++) scene.add(box(0.45, 0.35, 0.02, noOutline(flat(['#f7d774', '#9fd3f2', '#f4a6a6', '#c9f2b3'][i])), [-2.0 + (i % 2) * 0.75, 2.5 - Math.floor(i / 2) * 0.48, -5.9]));
    // papan penunjuk kelas (tergantung)
    const sign = new THREE.Group(); sign.position.set(0.9, 3.85, 0);
    const pivot = new THREE.Group(); pivot.position.set(-0.9, 0, 0); sign.add(pivot);   // engsel ujung kiri
    const board = signBoard(o.signText || 'XII IPA 2'); board.position.set(0.9, 0, 0); pivot.add(board);
    for (const x of [-0.8, 0.8]) { const ch = box(0.025, 1.0, 0.025, '#444', [x + 0.9, 0.6, 0]); ch.userData.chain = x; pivot.add(ch); }
    scene.add(sign);
    return { sign, pivot, board };
  },
  belakangKantin(scene) {
    scene.userData.clear = 0x222222;
    sky(scene, '#a9cfe9', '#eef4f2');
    const ground = mesh(new THREE.PlaneGeometry(30, 30), noOutline(toon('#fff', { map: tiles('#b9b2a4', '#9c9586', 10) })), { cast: false }); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    lights(scene, { sky: '#eaf4ff', ground: '#8f8a80', hemi: 1.6, sun: '#fff3dd', sunI: 1.6, sunPos: [-6, 10, 5] });
    const wall = box(14, 4.2, 0.4, '#d9c9a6', [0, 2.1, -3], { cast: true }); scene.add(wall);
    scene.add(box(14, 1.1, 0.42, '#9b8b6c', [0, 0.55, -2.99]));
    scene.add(box(14.6, 0.3, 1.4, '#a14b3a', [0, 4.3, -2.6]));
    const dr = door('#5f6f7a'); dr.position.set(-2.8, 0, -2.78); scene.add(dr);
    for (let i = 0; i < 3; i++) { const c = crate(['#2f7fc1', '#d9534f', '#f0ad4e'][i]); c.position.set(2.5 + (i % 2) * 0.1, i * 0.5, -2.3); c.rotation.y = i * 0.2; scene.add(c); }
    const c2 = crate('#2f7fc1'); c2.position.set(3.5, 0, -2.2); scene.add(c2);
    const bin = mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.0, 16), toon('#3d8b5a')); bin.position.set(-4.5, 0.5, -2.2); scene.add(bin);
    const tg = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16), toon('#4a9be0')); tg.position.set(4.6, 0.4, -2.3); scene.add(tg);
    const tr = tree(3.2); tr.position.set(-6.2, 0, 1); scene.add(tr);
    const bench = new THREE.Group(); bench.add(box(2.6, 0.1, 0.5, '#8b5a3c', [0, 0.45, 0])); for (const x of [-1.15, 1.15]) bench.add(box(0.08, 0.45, 0.45, '#333', [x, 0.22, 0])); bench.position.set(0, 0, -2.2); scene.add(bench);
    return {};
  },
  gerbang(scene, o = {}) {
    scene.userData.clear = 0x222222;
    const sore = o.sore;
    sky(scene, sore ? '#f39a5b' : '#86bde6', sore ? '#ffe0b0' : '#e8f3f8');
    const ground = mesh(new THREE.PlaneGeometry(40, 40), noOutline(toon('#9a9a96')), { cast: false }); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const path = mesh(new THREE.PlaneGeometry(4, 40), noOutline(toon('#c4bba9')), { cast: false }); path.rotation.x = -Math.PI / 2; path.position.y = 0.01; scene.add(path);
    lights(scene, sore ? { sky: '#ffd2a1', ground: '#7a5a4a', hemi: 1.4, sun: '#ffb070', sunI: 1.8, sunPos: [-8, 4, 6], shadowSize: 12 } : { sky: '#eaf5ff', ground: '#8f8a80', hemi: 1.6, sunPos: [6, 10, 6], shadowSize: 12 });
    for (const s of [-1, 1]) {
      scene.add(box(0.9, 3.6, 0.9, '#e5ddc9', [s * 2.6, 1.8, 0], { round: 0.03 }));
      scene.add(box(1.1, 0.25, 1.1, '#9b3d33', [s * 2.6, 3.7, 0]));
      scene.add(box(6, 2.0, 0.35, '#e5ddc9', [s * 6.2, 1.0, 0]));
      const gate = new THREE.Group();
      for (let i = 0; i < 9; i++) gate.add(box(0.05, 2.1, 0.05, '#2c3e50', [i * 0.25, 1.15, 0]));
      gate.add(box(2.2, 0.08, 0.08, '#2c3e50', [1.0, 2.15, 0])); gate.add(box(2.2, 0.08, 0.08, '#2c3e50', [1.0, 0.25, 0]));
      gate.position.set(s * 2.1, 0, 0.2); gate.rotation.y = s > 0 ? Math.PI * 0.55 : -Math.PI * 0.55 + Math.PI; scene.add(gate);
    }
    const nm = textPlane(4.4, 0.7, (x, w, h) => { x.fillStyle = '#1f4e79'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = `bold ${h * 0.55}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.name || 'SMAN 1 NYUATAN', w / 2, h / 2 + 4); });
    nm.position.set(0, 4.15, 0.46); scene.add(nm);
    scene.add(box(4.6, 0.12, 0.5, '#1f4e79', [0, 3.75, 0.25]));
    for (const [x, z] of [[-5, -4], [5.5, -3.5], [-8, 3], [8, 2], [-4, -9], [4, -10]]) { const t = tree(3 + (x % 3) * 0.3); t.position.set(x, 0, z); scene.add(t); }
    const bld = box(16, 5, 4, '#efe3c6', [0, 2.5, -14]); scene.add(bld);
    for (let i = -3; i <= 3; i++) { const w = windowPane(1.4, 1.2, '#9fc7dd'); w.position.set(i * 2.1, 3, -11.95); scene.add(w); }
    return {};
  },
  kelas(scene, o = {}) {
    scene.userData.clear = 0x222222;
    room(scene, { w: 13, d: 12, h: 4.8, wall: '#efe4c8', floorMat: toon('#fff', { map: terrazzo() }), trim: '#3f8a5c' });
    lights(scene, { sky: '#fffaf0', ground: '#9a8f7a', hemi: 1.7, sunI: 1.5, sunPos: [-7, 9, 5] });
    const pk = door('#7b5236'); pk.position.set(6.44, 0, -4.4); pk.rotation.y = -Math.PI / 2; scene.add(pk);
    const wb = box(4.4, 1.6, 0.06, '#fdfdfd', [0, 2.6, -5.95]); scene.add(wb); scene.add(box(4.6, 1.8, 0.04, '#9aa3a8', [0, 2.6, -5.97]));
    for (let i = 0; i < 3; i++) { const w = windowPane(1.8, 1.6, '#cbe7f4'); w.position.set(-6.45, 2.5, -3 + i * 2.6); w.rotation.y = Math.PI / 2; scene.add(w); }
    const clock = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24), toon('#fff')); clock.rotation.x = Math.PI / 2; clock.position.set(3.4, 3.7, -5.95); scene.add(clock);
    // mading / poster pemilihan
    scene.add(box(2.2, 1.4, 0.06, '#b07a4a', [6.45, 2.5, -2.5], { rot: [0, -Math.PI / 2, 0] }));
    const poster = textPlane(1.0, 1.25, (x, w, h) => { x.fillStyle = '#fff7e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c0392b'; x.font = `bold ${w * 0.09}px Oswald`; x.textAlign = 'center'; x.fillText('PEMILIHAN', w / 2, h * 0.1); x.fillText('KETUA PANITIA', w / 2, h * 0.19); x.fillStyle = '#333'; x.font = `bold ${w * 0.07}px Oswald`; x.fillText('PENSI 2025', w / 2, h * 0.27); for (const [i, n] of ['ALDO', 'BAGAS'].entries()) { x.fillStyle = ['#9fd3f2', '#f4a6a6'][i]; x.fillRect(w * (0.1 + i * 0.45), h * 0.33, w * 0.35, h * 0.4); x.fillStyle = '#222'; x.fillText(n, w * (0.275 + i * 0.45), h * 0.82); } });
    poster.position.set(6.4, 2.5, -2.5); poster.rotation.y = -Math.PI / 2; poster.name = 'poster'; scene.add(poster);
    const desks = [];
    for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) {
      const dk = desk(1.9, 0.95, 1.02); dk.position.set(c * 3.2, 0, -2.2 + r * 2.3); scene.add(dk);
      for (const s of [-0.47, 0.47]) { const ch = chair(); ch.position.set(c * 3.2 + s, 0, -2.2 + r * 2.3 + 0.75); ch.rotation.y = Math.PI; scene.add(ch); }
      const p = paper(); p.position.set(c * 3.2 - 0.4, 0.965, -2.2 + r * 2.3 + 0.1); scene.add(p);
      desks.push([c * 3.2, -2.2 + r * 2.3]);
    }
    return { desks };
  },
  ruangGuru(scene) {
    scene.userData.clear = 0x222222;
    room(scene, { w: 12, d: 11, h: 4.6, wall: '#e6ecdf', floorMat: toon('#fff', { map: tiles('#d9d4c8', '#bdb6a6', 6) }), trim: '#6a8caf' });
    lights(scene, { sky: '#f6fbff', ground: '#8d8f8a', hemi: 1.6, sunI: 1.4, sunPos: [5, 9, 6] });
    const dk = desk(2.8, 1.3, 0.95, '#7a5236'); dk.position.set(0, 0, -1.5); scene.add(dk);
    scene.add(box(2.7, 0.9, 0.06, '#6a4630', [0, 0.5, -0.88]));
    const mon = new THREE.Group(); mon.add(box(0.9, 0.55, 0.06, '#222', [0, 0.45, 0])); mon.add(box(0.8, 0.46, 0.02, noOutline(flat('#7fb2d9')), [0, 0.45, 0.035])); mon.add(box(0.1, 0.2, 0.1, '#222', [0, 0.1, 0]));
    mon.position.set(-0.8, 0.99, -1.8); mon.rotation.y = 0.3; scene.add(mon);
    for (let i = 0; i < 3; i++) scene.add(box(0.5, 0.06 + i * 0.01, 0.65, ['#f2f2f2', '#f7e08a', '#a8d0f0'][i], [0.8, 1.02 + i * 0.07, -1.5]));
    const ch = chair('#2c3e50'); ch.position.set(0, 0, -2.6); scene.add(ch);
    const cab = box(2.4, 2.6, 0.7, '#8d6e53', [3.6, 1.3, -5.1], { round: 0.03 }); scene.add(cab);
    for (let i = 0; i < 8; i++) scene.add(box(0.12, 0.5, 0.45, ['#c0392b', '#2980b9', '#27ae60', '#f39c12'][i % 4], [2.75 + i * 0.22, 2.2, -4.9]));
    const w = windowPane(2.6, 1.5, '#cfe8f6'); w.position.set(-2.2, 2.6, -5.45); scene.add(w);
    scene.add(box(1.6, 1.0, 0.05, '#fdfdfd', [-5.95, 2.6, -2], { rot: [0, Math.PI / 2, 0] }));
    const pt = plant(); pt.position.set(-5, 0, -4.5); scene.add(pt);
    const pg = door('#7a5236'); pg.position.set(5.94, 0, 1.5); pg.rotation.y = -Math.PI / 2; scene.add(pg);
    return { mejaY: 1.0 };
  },
  toko(scene) { // toko kelontong sore
    scene.userData.clear = 0x222222;
    room(scene, { w: 11, d: 10, h: 4.4, wall: '#f0dfc0', floorMat: toon('#fff', { map: tiles('#cbbfa8', '#ab9f88', 8) }) });
    lights(scene, { sky: '#ffe7c4', ground: '#7a6450', hemi: 1.5, sun: '#ffc98a', sunI: 1.5, sunPos: [-6, 6, 6] });
    scene.add(box(3.2, 1.0, 0.8, '#8b5a3c', [0, 0.5, -0.3], { round: 0.03 })); scene.add(box(3.3, 0.08, 0.9, '#6b4430', [0, 1.02, -0.3]));
    const kasir = box(0.5, 0.3, 0.4, '#d9d9d9', [0.9, 1.21, -0.3], { round: 0.04 }); scene.add(kasir);
    for (let r = 0; r < 4; r++) { scene.add(box(4.6, 0.08, 0.8, '#9c6b45', [0, 0.6 + r * 0.8, -4.5])); for (let i = 0; i < 9; i++) scene.add(box(0.35, 0.45, 0.4, ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#e67e22', '#9b59b6'][(i + r) % 6], [-2.0 + i * 0.5, 0.88 + r * 0.8, -4.45], { round: 0.04 })); }
    for (let i = 0; i < 4; i++) scene.add(box(0.5, 0.7, 0.5, ['#f39c12', '#16a085', '#c0392b', '#2980b9'][i], [-3.5 + (i % 2) * 0.6, 0.35 + Math.floor(i / 2) * 0.7, -2.5], { round: 0.05 }));
    const st = chair('#555'); st.position.set(0, 0, -1.3); scene.add(st);
    const sign = textPlane(2.4, 0.5, (x, w, h) => { x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = `bold ${h * 0.6}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TOKO BERKAH', w / 2, h / 2 + 3); });
    sign.position.set(0, 3.7, -4.94); scene.add(sign);
    const win = windowPane(2, 1.4, '#ffd9a0'); win.position.set(5.45, 2.3, -1); win.rotation.y = -Math.PI / 2; scene.add(win);
    return {};
  },
  kafe(scene) {
    scene.userData.clear = 0x222222;
    room(scene, { w: 12, d: 11, h: 4.6, wall: '#e7d3bd', floorMat: toon('#fff', { map: wood('#8f6243') }), ceil: '#3b2e2a' });
    lights(scene, { sky: '#ffe2bf', ground: '#5a4030', hemi: 1.4, sun: '#ffd29a', sunI: 1.3, sunPos: [3, 8, 5] });
    const lamp = new THREE.PointLight('#ffc070', 5, 8, 1.6); lamp.position.set(0, 3.4, 0); scene.add(lamp);
    const shade = mesh(new THREE.ConeGeometry(0.45, 0.4, 20, 1, true), toon('#2c2c2c', { side: THREE.DoubleSide })); shade.position.set(0, 3.6, 0); scene.add(shade);
    const top = mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 32), toon('#5d4033')); top.position.y = 0.92; scene.add(top);
    scene.add(box(0.12, 0.9, 0.12, '#222', [0, 0.45, 0]));
    for (const [x, z, r] of [[-1.15, 0, Math.PI / 2], [1.15, 0, -Math.PI / 2], [0, -1.15, 0], [0, 1.15, Math.PI]]) { const c = chair('#3d6b5a'); c.position.set(x, 0, z); c.rotation.y = r; scene.add(c); }
    for (const [x, z] of [[-0.3, 0.2], [0.35, -0.2], [0.1, 0.4]]) { const g = glass('#c58b5a'); g.position.set(x, 0.96, z); scene.add(g); }
    // hiasan bendera warna-warni + lampu tali
    for (let i = 0; i < 14; i++) { const f = mesh(new THREE.ConeGeometry(0.16, 0.36, 3), toon(['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#e67e22'][i % 5])); f.rotation.x = Math.PI; f.position.set(-4.5 + i * 0.7, 3.5 - Math.sin(i / 13 * Math.PI) * 0.4, -5.3); scene.add(f); }
    for (let i = 0; i < 10; i++) { const b = mesh(new THREE.SphereGeometry(0.06, 8, 6), flat('#ffe29a')); b.position.set(-5.2 + i * 1.1, 3.9 - Math.sin(i / 9 * Math.PI) * 0.3, -4.0); scene.add(b); }
    const art = textPlane(2.2, 0.6, (x, w, h) => { x.fillStyle = '#2d2420'; x.fillRect(0, 0, w, h); x.fillStyle = '#f5d48a'; x.font = `bold ${h * 0.55}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KOPI SENJA', w / 2, h / 2 + 3); });
    art.position.set(2.8, 2.6, -5.45); scene.add(art);
    const pt = plant(); pt.position.set(-4.8, 0, -4.4); scene.add(pt);
    const win = windowPane(2.4, 1.6, '#ffcf95'); win.position.set(-5.95, 2.3, 0); win.rotation.y = Math.PI / 2; scene.add(win);
    return {};
  },
  lobi(scene, o = {}) {
    scene.userData.clear = 0x222222;
    room(scene, { w: 14, d: 12, h: 5, wall: '#efe7d6', floorMat: toon('#fff', { map: tiles('#e3ddd0', '#c9c2b2', 6) }), trim: '#1f4e79' });
    lights(scene, { sky: '#fffaf0', ground: '#9a8f7a', hemi: 1.7, sunI: 1.4, sunPos: [5, 10, 7] });
    const cab = new THREE.Group(); cab.add(box(2.2, 0.5, 0.8, '#6b4430', [0, 0.25, 0]));
    cab.add(box(2.2, 2.0, 0.8, noOutline(toon('#cfe8f4', { transparent: true, opacity: 0.35 })), [0, 1.5, 0], { cast: false }));
    for (const x of [-1.08, 1.08]) cab.add(box(0.06, 2.0, 0.82, '#888', [x, 1.5, 0])); cab.add(box(2.2, 0.06, 0.82, '#888', [0, 2.5, 0])); cab.add(box(2.1, 0.04, 0.7, '#ddd', [0, 1.3, 0]));
    if (o.adaPiala) { const pp = piala(); pp.position.set(0, 1.32, 0); cab.add(pp); }
    cab.position.set(0, 0, -5.4); scene.add(cab);
    const ban = textPlane(4.0, 0.7, (x, w, h) => { x.fillStyle = '#1f4e79'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = `bold ${h * 0.5}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SMAN 1 NYUATAN', w / 2, h / 2 + 3); });
    ban.position.set(0, 3.9, -5.95); scene.add(ban);
    const spk = mesh(new THREE.ConeGeometry(0.25, 0.4, 16, 1, true), toon('#ddd', { side: THREE.DoubleSide })); spk.position.set(4.5, 3.9, -5.7); spk.rotation.x = Math.PI / 2; scene.add(spk);
    for (const x of [-4.5, 4.5]) { const pt = plant(); pt.position.set(x, 0, -5.3); scene.add(pt); }
    const dr = door('#7b5236'); dr.position.set(-6.95, 0, -1); dr.rotation.y = Math.PI / 2; scene.add(dr);
    return {};
  },
  gudang(scene, o = {}) {
    scene.userData.clear = 0x111111;
    room(scene, { w: 10, d: 9, h: 4.2, wall: '#9c8f7c', floorMat: toon('#fff', { map: tiles('#7d7468', '#6a6156', 5) }), ceil: '#5a5248' });
    lights(scene, { sky: '#fff1d0', ground: '#4a4038', hemi: 1.4, sunI: 1.1, sunPos: [2, 8, 4] });
    const bulb = new THREE.PointLight('#ffd890', 5, 9, 1.5); bulb.position.set(0, 3.6, 0); scene.add(bulb);
    for (let i = 0; i < 5; i++) { const c = crate(['#8b5a3c', '#6b4430', '#9c6b45'][i % 3]); c.position.set(-4 + (i % 3) * 0.9, Math.floor(i / 3) * 0.5, -4); scene.add(c); }
    for (let i = 0; i < 6; i++) { const k = kalengCat(); k.position.set(2.5 + (i % 3) * 0.35, 0, -3.8 + Math.floor(i / 3) * 0.35); scene.add(k); }
    const ember = mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.35, 16), toon('#3b7dd8')); ember.position.set(-1.5, 0.18, 2.5); scene.add(ember);
    if (o.spanduk) { const sp = textPlane(5.0, 1.0, (x, w, h) => { x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe9a8'; x.font = `bold ${h * 0.45}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TERIMA KASIH, PAK EKO!', w / 2, h / 2 + 3); }); sp.position.set(0, 2.9, -4.45); scene.add(sp); }
    const dr = door('#5a4a3a'); dr.position.set(4.95, 0, 1.5); dr.rotation.y = -Math.PI / 2; scene.add(dr);
    return {};
  },
  lapangan(scene, o = {}) {
    scene.userData.clear = 0x222222;
    sky(scene, '#86bde6', '#e8f3f8');
    const g = mesh(new THREE.PlaneGeometry(60, 60), noOutline(toon('#7fb069')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    const court = mesh(new THREE.PlaneGeometry(14, 10), noOutline(toon('#c9b48f')), { cast: false }); court.rotation.x = -Math.PI / 2; court.position.y = 0.01; scene.add(court);
    lights(scene, { sky: '#eaf5ff', ground: '#6f8a5a', hemi: 1.6, sunPos: [6, 10, 6], shadowSize: 12 });
    const bld = box(20, 5, 4, '#efe3c6', [0, 2.5, -10]); scene.add(bld);
    for (let i = -4; i <= 4; i++) { const w = windowPane(1.4, 1.2, '#9fc7dd'); w.position.set(i * 2.1, 3, -7.95); scene.add(w); }
    const pole = box(0.08, 6, 0.08, '#ccc', [6, 3, -6]); scene.add(pole);
    const fl = textPlane(1.2, 0.8, (x, w, h) => { x.fillStyle = '#d62828'; x.fillRect(0, 0, w, h / 2); x.fillStyle = '#fff'; x.fillRect(0, h / 2, w, h / 2); }); fl.position.set(6.62, 5.5, -6); scene.add(fl);
    if (o.spanduk) { const sp = textPlane(5.0, 1.0, (x, w, h) => { x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe9a8'; x.font = `bold ${h * 0.45}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TERIMA KASIH, PAK EKO!', w / 2, h / 2 + 3); }); sp.position.set(0, 3.2, -7.9); scene.add(sp); }
    return {};
  },
  kamar(scene, o = {}) { // kamar tidur: meja belajar + laptop, kasur, jendela malam
    scene.userData.clear = 0x111111;
    room(scene, { w: 9, d: 8, h: 4.2, wall: '#d9e4ee', floorMat: toon('#fff', { map: wood('#9c7250') }), ceil: '#e8edf2' });
    lights(scene, { sky: '#cfe0ff', ground: '#4a4050', hemi: 1.2, sun: '#9fb7ff', sunI: 0.7, sunPos: [-3, 6, 4] });
    const lamp = new THREE.PointLight('#ffd9a0', 6, 6, 1.6); lamp.position.set(-1.0, 1.9, -3.2); scene.add(lamp);
    const dk = desk(1.8, 0.9, 0.92, '#a0704c'); dk.position.set(-1.5, 0, -3.3); scene.add(dk);
    const ch = chair('#3b5b8a'); ch.position.set(-1.5, 0, -2.45); ch.rotation.y = Math.PI; scene.add(ch);
    // laptop (layar = canvas)
    const lp = new THREE.Group(); lp.add(box(0.7, 0.03, 0.48, '#9aa0a6', [0, 0.015, 0]));
    const c = document.createElement('canvas'); c.width = 512; c.height = 320; const tex = new THREE.CanvasTexture(c);
    const scr = new THREE.Group(); scr.position.set(0, 0.03, -0.23); scr.rotation.x = -0.25; lp.add(scr);
    scr.add(box(0.7, 0.45, 0.025, '#5f656b', [0, 0.225, 0])); const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.4), flat('#fff', { map: tex })); sm.position.set(0, 0.225, 0.014); scr.add(sm);
    lp.position.set(-1.5, 0.96, -3.35); scene.add(lp);
    scene.userData.layar = { ctx: c.getContext('2d'), tex };
    const dl = mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.06, 12), toon('#333')); dl.position.set(-0.85, 0.99, -3.5); scene.add(dl);
    scene.add(box(0.05, 0.5, 0.05, '#333', [-0.85, 1.25, -3.5]));
    for (let i = 0; i < 6; i++) scene.add(box(0.12, 0.32, 0.25, ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085'][i], [-2.75 + i * 0.13, 1.12, -3.6]));
    // kasur
    scene.add(box(1.6, 0.4, 3.0, '#6b4430', [2.4, 0.2, -1.6], { round: 0.03 })); scene.add(box(1.5, 0.18, 2.9, '#f4f1ea', [2.4, 0.49, -1.6], { round: 0.06 }));
    scene.add(box(0.9, 0.16, 0.45, '#ffffff', [2.4, 0.66, -2.75], { round: 0.07 })); scene.add(box(1.6, 1.0, 0.12, '#6b4430', [2.4, 0.9, -3.15]));
    const sel = box(1.55, 0.1, 1.9, '#4a76b8', [2.4, 0.62, -0.95], { round: 0.04 }); sel.name = 'selimut'; scene.add(sel);
    const win = windowPane(1.8, 1.4, '#1d2b4f'); win.position.set(-4.45, 2.3, -1); win.rotation.y = Math.PI / 2; scene.add(win);
    const moon = mesh(new THREE.SphereGeometry(0.15, 12, 8), flat('#f4f1c8')); moon.position.set(-4.43, 2.6, -1.3); scene.add(moon);
    const pr = door('#6b4430'); pr.position.set(4.44, 0, 1.8); pr.rotation.y = -Math.PI / 2; scene.add(pr);
    return {};
  },
  jalan(scene, o = {}) { // jalan aspal/tanah, pemandangan di grup 'gerak' (digeser untuk ilusi melaju)
    scene.userData.clear = 0x222222;
    const hujan = !!o.hujan; sky(scene, hujan ? '#5d6b78' : (o.sore ? '#f3a96b' : '#8fc3ea'), hujan ? '#9aa5ad' : '#eef4f2');
    lights(scene, hujan ? { sky: '#c8d2da', ground: '#7a7a6a', hemi: 2.0, sun: '#cfd6dc', sunI: 0.5, shadowSize: 14 } : { sky: '#eaf5ff', ground: '#7a8a5a', hemi: 1.6, sunPos: [6, 10, 6], shadowSize: 14 });
    const g0 = mesh(new THREE.PlaneGeometry(200, 60), noOutline(toon(o.tanah ? '#6f8f45' : '#7fb069')), { cast: false }); g0.rotation.x = -Math.PI / 2; scene.add(g0);
    const gerak = new THREE.Group(); gerak.name = 'gerak'; scene.add(gerak);
    for (let k = -1; k <= 1; k++) {
      const road = mesh(new THREE.PlaneGeometry(40, 5), noOutline(toon(o.tanah ? '#8a6a45' : '#55585c')), { cast: false }); road.rotation.x = -Math.PI / 2; road.position.set(k * 40, 0.01, 0); gerak.add(road);
      if (!o.tanah) for (let i = 0; i < 10; i++) gerak.add(box(1.6, 0.012, 0.15, noOutline(flat('#f2f2f2')), [k * 40 - 18 + i * 4, 0.02, 0], { cast: false }));
      else for (let i = 0; i < 6; i++) { const pd = mesh(new THREE.CircleGeometry(0.6 + (i % 3) * 0.3, 14), noOutline(flat('#5a4a35'))); pd.rotation.x = -Math.PI / 2; pd.position.set(k * 40 - 16 + i * 6.5, 0.02, (i % 2 ? 1 : -1) * 1.2); gerak.add(pd); }
      for (let i = 0; i < 8; i++) for (const sd of [-1, 1]) {
        if (o.kelapa) { const t = new THREE.Group(); t.add(box(0.28, 5, 0.28, '#8a6a45', [0, 2.5, 0])); for (let j = 0; j < 6; j++) { const l = box(2.2, 0.08, 0.5, '#4f9a4f', [Math.cos(j) * 0.9, 5, Math.sin(j) * 0.9], { rot: [0, j, -0.35] }); t.add(l); }
          t.position.set(k * 40 - 18 + i * 5 + (sd > 0 ? 2 : 0), 0, sd * (5 + (i % 3))); gerak.add(t); }
        else { const t = tree(3); t.position.set(k * 40 - 18 + i * 5 + (sd > 0 ? 2.5 : 0), 0, sd * (6 + (i % 3))); gerak.add(t); }
      }
    }
    if (o.bukit) for (let i = 0; i < 5; i++) { const b = mesh(new THREE.SphereGeometry(12 + i * 2, 16, 10), noOutline(toon('#6aa36a'))); b.scale.y = 0.45; b.position.set(-30 + i * 16, -2, -40); scene.add(b); }
    scene.userData.gerakSpeed = o.speed ?? 0;
    // motor
    (o.motors || []).forEach(([x, z, color, name], i) => { const m = motor(color); m.position.set(x, 0, z); m.name = name || 'motor' + (i + 1); scene.add(m); });
    if (o.gubuk) { const gb = new THREE.Group(); for (const [x, z] of [[-1.4, -2.2], [1.4, -2.2], [-1.4, 0.2], [1.4, 0.2]]) gb.add(box(0.15, 2.9, 0.15, '#6b4a2f', [x, 1.45, z]));
      gb.add(box(3.6, 0.12, 3.2, '#7a5a3a', [0, 2.95, -1.0], { rot: [0.12, 0, 0], cast: false })); gb.add(box(3.2, 0.1, 0.9, '#8a6a45', [0, 0.45, -2.1])); gb.position.set(0, 0, -2.2); scene.add(gb); }
    if (o.motorTua) { const m = motor('#4a5a3a', true); m.name = 'motorTua'; m.position.set(2.6, 0, 0.6); m.rotation.y = Math.PI; scene.add(m);
      const sl = new THREE.SpotLight('#fff2c0', 30, 18, 0.5, 0.5); sl.position.set(0, 1.05, 0); m.add(sl); sl.target.position.set(-6, 0, 0); m.add(sl.target); }
    if (hujan) { const drops = []; const dm = noOutline(flat('#cfe3f2', { transparent: true, opacity: 0.55 }));
      for (let i = 0; i < 420; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.02), dm); d.position.set((Math.random() - 0.5) * 22, Math.random() * 9, (Math.random() - 0.5) * 16 + 2); scene.add(d); drops.push(d); }
      scene.userData.hujan = drops; }
    return {};
  },
  bengkel(scene, o = {}) {
    scene.userData.clear = 0x222222; sky(scene, o.pagi ? '#8fc3ea' : '#c9a37a', o.pagi ? '#eef4f2' : '#f3dcc0');
    lights(scene, { sky: '#fff1dc', ground: '#6a5a4a', hemi: 1.5, sun: '#ffd9a6', sunI: 1.2, sunPos: [5, 8, 6], shadowSize: 12 });
    const g0 = mesh(new THREE.PlaneGeometry(60, 60), noOutline(toon('#8a7a62')), { cast: false }); g0.rotation.x = -Math.PI / 2; scene.add(g0);
    const b = new THREE.Group(); b.add(box(8, 3.6, 0.2, '#9c7250', [0, 1.8, -3.5])); for (const x of [-4, 4]) b.add(box(0.2, 3.6, 4, '#9c7250', [x, 1.8, -1.6]));
    b.add(box(8.6, 0.15, 4.6, '#6b4a2f', [0, 3.7, -1.5], { rot: [0.08, 0, 0] })); scene.add(b);
    const nm = textPlane(4.0, 0.7, (x, w, h) => { x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = `bold ${h * 0.55}px Oswald`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BENGKEL MOTOR', w / 2, h / 2 + 3); });
    nm.position.set(0, 3.25, 0.62); scene.add(nm); scene.add(box(4.2, 0.8, 0.1, '#7a2a20', [0, 3.25, 0.55]));
    for (let i = 0; i < 5; i++) { const tr = mesh(new THREE.TorusGeometry(0.32, 0.1, 10, 18), toon('#1d1d1d')); tr.position.set(-3.2, 0.12 + i * 0.2, -2.8); tr.rotation.x = Math.PI / 2; scene.add(tr); }
    scene.add(box(2.4, 1.6, 0.1, '#5a4030', [2.2, 1.8, -3.35])); for (let i = 0; i < 6; i++) scene.add(box(0.08, 0.5, 0.06, '#9aa0a6', [1.3 + i * 0.35, 1.9, -3.28]));
    scene.add(box(3.2, 0.12, 0.6, '#8b5a3c', [0, 0.45, -1.6])); for (const x of [-1.4, 1.4]) scene.add(box(0.1, 0.45, 0.5, '#333', [x, 0.22, -1.6]));
    if (o.motor5) for (let i = 0; i < 5; i++) { const m = motor(['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#4a5a3a'][i], i === 4); m.position.set(-4 + i * 2, 0, 2.6); m.rotation.y = -Math.PI / 2; scene.add(m); }
    return {};
  },
  bazar(scene, o = {}) { // lapangan Market Day: stan kelas 11 (kiri) & Boba Sultan kelas 12 (kanan)
    scene.userData.clear = 0x222222; sky(scene, '#7fbde8', '#f4f0e0');
    const g = mesh(new THREE.PlaneGeometry(80, 80), noOutline(toon('#cdb88f')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    lights(scene, { sky: '#fff6dd', ground: '#a58c5f', hemi: 1.7, sun: '#fff0c0', sunI: 2.0, sunPos: [3, 12, 6], shadowSize: 16 });
    scene.add(box(30, 6, 4, '#efe3c6', [0, 3, -12])); for (let i = -6; i <= 6; i++) { const w = windowPane(1.4, 1.2, '#9fc7dd'); w.position.set(i * 2.2, 3.4, -9.95); scene.add(w); }
    const s11 = stan(o.gabung ? 'ES TEH BOBA SULTAN JUMBO' : 'ES TEH JUMBO 11', '#2e8b57', -2.6); scene.add(s11);
    const s12 = stan('BOBA SULTAN', '#8e44ad', 2.6); scene.add(s12);
    const mb = mesinBoba(); mb.position.set(2.0, 0.99, -0.9); mb.name = 'mesinBoba'; scene.add(mb);
    const tm = termos(); tm.position.set(-3.6, 0.99, -0.9); scene.add(tm);
    for (let i = 0; i < 6; i++) scene.add(box(0.14, 0.16, 0.14, noOutline(toon('#eef6fb', { transparent: true, opacity: 0.8 })), [-2.7 + (i % 3) * 0.18, 1.07 + Math.floor(i / 3) * 0.16, -0.85]));
    if (o.cooler !== false) for (const x of [3.4, 4.1]) { const cb = coolerBox(); cb.position.set(x, 0, -0.4); scene.add(cb); }
    if (o.gabung) { const sp = textPlane(4.6, 0.8, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#111'; c.font = `bold ${h * 0.42}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ES TEH BOBA SULTAN JUMBO · Rp7.000', w / 2, h / 2 + 3); });
      sp.position.set(0, 3.25, -0.3); scene.add(sp); }
    // pos satpam + termometer
    const pos = new THREE.Group(); pos.add(box(1.8, 2.6, 1.6, '#d9d2c3', [0, 1.3, 0], { round: 0.03 })); pos.add(box(2.1, 0.15, 1.9, '#9b3d33', [0, 2.7, 0]));
    const th = textPlane(0.35, 0.8, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e74c3c'; c.fillRect(w * 0.4, h * 0.15, w * 0.2, h * 0.65); c.beginPath(); c.arc(w / 2, h * 0.85, w * 0.22, 0, Math.PI * 2); c.fill(); });
    th.position.set(-0.4, 1.6, 0.81); pos.add(th); pos.position.set(-8, 0, -4); scene.add(pos);
    // antrean di depan stan
    const nA = o.antre ?? 0;
    for (let i = 0; i < nA; i++) { const target = o.antreDi === 11 ? -2.6 : o.antreDi === 0 ? 0 : 2.6; const c = (i % 2 ? CAST_REF.siswi : CAST_REF.siswa)(i * 3 + 2, { name: null }); c.root.position.set(target + Math.sin(i * 1.3) * 0.25, 0, 0.6 + i * 0.85); c.root.rotation.y = Math.PI; c.applyPose({}); c.setFace(i % 3 ? 'netral' : 'senyum', i); scene.add(c.root); }
    if (o.panggung) { scene.add(box(5, 0.8, 3, '#7a5a3a', [0, 0.4, -6.5])); const sp = textPlane(4.5, 0.7, (c, w, h) => { c.fillStyle = '#1f4e79'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.5}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MARKET DAY SMAN 1 NYUATAN', w / 2, h / 2 + 3); }); sp.position.set(0, 3.2, -7.9); scene.add(sp); }
    if (o.motorEs) { const m = motor('#2980b9'); m.position.set(-6.0, 0, 1.6); m.name = 'motorEs'; scene.add(m); for (let i = 0; i < 5; i++) { const b = mesh(new THREE.SphereGeometry(0.2, 10, 8), noOutline(toon('#e8f6ff', { transparent: true, opacity: 0.85 }))); b.position.set(-6.4 + i * 0.25, 1.0 - (i % 2) * 0.15, 1.6 + (i % 2 ? 0.25 : -0.25)); scene.add(b); } }
    return {};
  },
  parkiran12(scene, o = {}) {
    scene.userData.clear = 0x222222; sky(scene, '#8fc3ea', '#eef4f2');
    const g = mesh(new THREE.PlaneGeometry(60, 60), noOutline(toon('#a9a49a')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    lights(scene, { sky: '#eaf5ff', ground: '#8f8a80', hemi: 1.6, sunPos: [6, 10, 6], shadowSize: 12 });
    scene.add(box(16, 4.5, 0.4, '#efe3c6', [0, 2.25, -4])); scene.add(box(16, 0.8, 0.42, '#3f8a5c', [0, 0.4, -3.99]));
    const dr = door('#7b5236'); dr.position.set(-1.5, 0, -3.78); scene.add(dr);
    const nm = textPlane(1.6, 0.4, (c, w, h) => { c.fillStyle = '#1f5f8b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.6}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('XII IPS 1', w / 2, h / 2 + 2); });
    nm.position.set(-1.5, 3.3, -3.77); scene.add(nm);
    const mb = mobil(); mb.position.set(4.2, 0, -0.6); scene.add(mb); const mbb = mesinBoba(); mbb.position.set(1.9, 0, -0.1); scene.add(mbb);
    const sp = textPlane(3.2, 0.8, (c, w, h) => { c.fillStyle = '#8e44ad'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe066'; c.font = `bold ${h * 0.55}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOBA SULTAN', w / 2, h / 2 + 3); });
    sp.position.set(-0.3, 1.65, -1.6); scene.add(sp);
    return {};
  },
  busDalam(scene, o = {}) { // interior bus: depan = -z, kursi baris z=-5+r*1.6 (x ±1.0/±1.9), bangku belakang z=4.6; pohon lewat di jendela
    scene.userData.clear = 0x222222; sky(scene, '#8fc3ea', '#eef4f2');
    lights(scene, { sky: '#fff8e8', ground: '#7a6a5a', hemi: 1.9, sunI: 1.1, sunPos: [5, 9, 2], shadowSize: 10 });
    const fl = mesh(new THREE.PlaneGeometry(4.8, 16), noOutline(toon('#5a5f66')), { cast: false }); fl.rotation.x = -Math.PI / 2; scene.add(fl);
    for (const x of [-2.45, 2.45]) { scene.add(box(0.1, 0.95, 16, '#c9c3b5', [x, 0.47, 0])); scene.add(box(0.1, 0.5, 16, '#c9c3b5', [x, 2.75, 0]));
      for (let z = -7; z <= 7; z += 2.2) scene.add(box(0.12, 1.5, 0.12, '#8a8a8a', [x, 1.7, z])); }
    scene.add(box(5, 0.1, 16, '#e8e4dc', [0, 3.0, 0], { cast: false }));
    for (let r = 0; r < 6; r++) for (const sx of [-1.9, -1.0, 1.0, 1.9]) { const z = -5 + r * 1.6; scene.add(box(0.8, 0.12, 0.6, '#2e6fb2', [sx, 0.44, z])); scene.add(box(0.8, 1.0, 0.14, '#2e6fb2', [sx, 0.95, z + 0.4])); }
    scene.add(box(4.6, 0.12, 0.6, '#2e6fb2', [0, 0.44, 4.6])); scene.add(box(4.6, 1.0, 0.14, '#2e6fb2', [0, 0.95, 5.0])); scene.add(box(5, 3, 0.1, '#c9c3b5', [0, 1.5, 5.4]));
    const gerak = new THREE.Group(); gerak.name = 'gerak'; scene.add(gerak);
    for (let k = -1; k <= 1; k++) for (let i = 0; i < 10; i++) for (const sd of [-1, 1]) { const t = tree(3); t.position.set(sd * (5 + (i % 3) * 1.5), -0.8, k * 40 - 20 + i * 4 + (sd > 0 ? 2 : 0)); gerak.add(t); }
    return {};
  },
  pantai(scene, o = {}) {
    scene.userData.clear = 0x222222; sky(scene, '#5fb3f0', '#e6f6ff');
    lights(scene, { sky: '#ffffff', ground: '#e8d9b0', hemi: 1.8, sunI: 1.8, sunPos: [4, 10, 6], shadowSize: 18 });
    const pasir = mesh(new THREE.PlaneGeometry(80, 40), noOutline(toon('#f2e2b6')), { cast: false }); pasir.rotation.x = -Math.PI / 2; pasir.position.z = 6; scene.add(pasir);
    const laut = mesh(new THREE.PlaneGeometry(120, 60), noOutline(toon('#2f9bd6')), { cast: false }); laut.rotation.x = -Math.PI / 2; laut.position.set(0, 0.02, -34); scene.add(laut);
    const ombak = new THREE.Group(); ombak.name = 'ombak'; scene.add(ombak); for (let i = 0; i < 4; i++) ombak.add(box(80, 0.04, 0.4, noOutline(flat('#e8f7ff')), [0, 0.05, -4.5 - i * 1.6], { cast: false }));
    for (const [x, z] of [[-9, 2], [-11, 6], [9, 3], [12, 7]]) { const t = new THREE.Group(); t.add(box(0.3, 5, 0.3, '#8a6a45', [0, 2.5, 0], { rot: [0, 0, 0.12] })); for (let j = 0; j < 6; j++) t.add(box(2.2, 0.08, 0.5, '#4f9a4f', [Math.cos(j) * 0.9 + 0.3, 5, Math.sin(j) * 0.9], { rot: [0, j, -0.35] })); t.position.set(x, 0, z); scene.add(t); }
    if (o.bus) { const b = bus(); b.position.set(-4, 0, 9); scene.add(b); }
    if (o.spandukTim) { const sp = textPlane(3.6, 0.9, (c, w, h) => { c.fillStyle = '#8e44ad'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe066'; c.font = `bold ${h * 0.42}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TEAM ES TEH BOBA SULTAN', w / 2, h / 2 + 3); }); sp.position.set(0, 1.5, -1.45); scene.add(sp); }
    return {};
  },
  kemah(scene, o = {}) { // senja dekat air terjun
    scene.userData.clear = 0x222222; sky(scene, '#f2905a', '#ffe0b0');
    lights(scene, { sky: '#ffc98a', ground: '#6a4a3a', hemi: 1.5, sun: '#ff9f55', sunI: 2.0, sunPos: [-10, 4, 4], shadowSize: 16 });
    const g = mesh(new THREE.PlaneGeometry(80, 80), noOutline(toon('#6f9a55')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    scene.add(box(30, 14, 4, '#7d7468', [0, 7, -16])); const afT = canvasTex(128, 512, (x, w, h) => { x.fillStyle = '#cfeeff'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#a9dcf5'; x.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 6, 30 + Math.random() * 80); } }); afT.wrapS = afT.wrapT = THREE.RepeatWrapping; afT.repeat.set(1, 2);
    const af = mesh(new THREE.PlaneGeometry(3, 13), noOutline(flat('#ffffff', { map: afT }))); af.position.set(2, 6.5, -13.9); af.name = 'airTerjun'; scene.add(af);
    const kol = mesh(new THREE.CircleGeometry(4, 24), noOutline(flat('#7cc4e8'))); kol.rotation.x = -Math.PI / 2; kol.position.set(2, 0.03, -11.5); scene.add(kol);
    for (const [x, z, c] of [[-6, -5, '#e67e22'], [-3.5, -6, '#2980b9'], [5.5, -5, '#27ae60']]) { const tn = mesh(new THREE.ConeGeometry(1.4, 1.8, 4), toon(c)); tn.position.set(x, 0.9, z); tn.rotation.y = Math.PI / 4; scene.add(tn); }
    const gr = new THREE.Group(); gr.add(box(1.2, 0.08, 0.6, '#333', [0, 0.9, 0])); for (const x of [-0.5, 0.5]) gr.add(box(0.06, 0.9, 0.06, '#333', [x, 0.45, 0]));
    for (let i = 0; i < 5; i++) gr.add(box(0.12, 0.08, 0.45, i % 2 ? '#f2c230' : '#c0392b', [-0.4 + i * 0.2, 0.98, 0])); gr.position.set(3.2, 0, 0.2); gr.name = 'grill'; scene.add(gr);
    for (let i = 0; i < 8; i++) { const x = -12 + i * 3.4; if (x > -3 && x < 7) continue; const t = tree(3.5); t.position.set(x, 0, -9 - (i % 2) * 2); scene.add(t); }
    return {};
  },
  apiUnggun(scene, o = {}) {
    scene.userData.clear = 0x05070f; sky(scene, '#070b1f', '#1b2244');
    lights(scene, { sky: '#3a4a7a', ground: '#1a1410', hemi: 0.8, sun: '#8090c0', sunI: 0.4, sunPos: [-4, 8, 4], shadowSize: 14 });
    const g = mesh(new THREE.PlaneGeometry(80, 80), noOutline(toon('#3a4a30')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    const api = new THREE.PointLight('#ff9a40', 14, 14, 1.4); api.position.set(0, 1.2, 0); api.name = 'cahayaApi'; scene.add(api);
    for (let i = 0; i < 6; i++) scene.add(box(1.4, 0.18, 0.18, '#5a3a22', [0, 0.12, 0], { rot: [0, i * 0.52, 0] }));
    const nyala = new THREE.Group(); nyala.name = 'nyala'; scene.add(nyala);
    for (let i = 0; i < 5; i++) { const f = mesh(new THREE.ConeGeometry(0.35 - i * 0.05, 1.2 - i * 0.12, 8), noOutline(flat(['#ff5a1f', '#ff8c1f', '#ffb347', '#ffd36b', '#fff0a0'][i]))); f.position.set(Math.sin(i) * 0.15, 0.6, Math.cos(i) * 0.15); nyala.add(f); }
    for (let i = 0; i < 160; i++) { const st = mesh(new THREE.SphereGeometry(0.06, 4, 3), noOutline(flat('#ffffff'))); const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 10; st.position.set(Math.cos(a) * r, 8 + Math.random() * 25, -Math.abs(Math.sin(a)) * r - 10); scene.add(st); }
    const pc = []; for (let i = 0; i < 24; i++) { const sp = mesh(new THREE.SphereGeometry(0.04, 4, 3), noOutline(flat('#ffcf6b'))); scene.add(sp); pc.push(sp); } scene.userData.percik = pc;
    for (let i = 0; i < 6; i++) { const t = tree(4); t.position.set(Math.cos(i) * 14, 0, Math.sin(i) * 9 - 6); scene.add(t); }
    return {};
  },
  gerbangBus(scene, o = {}) { SETS.gerbang(scene, o); const b = bus(); b.name = 'busJalan'; b.position.set(-1, 0, 5.2); scene.add(b); return {}; },
  studio(scene, o = {}) { // ruang studio musik sekolah: band menghadap +z, pintu di dinding kanan
    scene.userData.clear = 0x222222;
    room(scene, { w: 10, d: 10, h: 4.2, wall: '#3d4450', floorMat: toon('#8a6a4a', { map: wood('#8a6a4a') }), trim: '#262b33' });
    lights(scene, { sky: '#fff3e0', ground: '#6a5a4a', hemi: 1.7, sunI: 1.1, sunPos: [3, 8, 6] });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) scene.add(box(1.2, 0.8, 0.08, (i + j) % 2 ? '#2b2f36' : '#555c66', [-3.75 + i * 1.5, 1.6 + j * 0.9, -4.94], { cast: false }));
    const pt = door('#5a4a3a'); pt.position.set(4.95, 0, 2.5); pt.rotation.y = -Math.PI / 2; scene.add(pt);
    const dk = drumKit(); dk.position.set(0, 0, -3.3); scene.add(dk);
    const kb = keyboardAlat(); kb.position.set(2.7, 0, -2.2); kb.rotation.y = -0.25; scene.add(kb);
    const ms = micStand(); ms.position.set(0, 0, 0.25); ms.name = 'micStand'; scene.add(ms);
    for (const [x, z] of [[-3.6, -3.6], [3.8, -3.8]]) { const a = ampli(); a.position.set(x, 0, z); a.rotation.y = x < 0 ? 0.4 : -0.4; scene.add(a); }
    const a2 = ampli(0.55, 0.55); a2.position.set(-3.0, 0, 2.7); a2.rotation.y = 0.6; scene.add(a2);
    for (let i = 0; i < 3; i++) { const k = mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 16), toon('#111')); k.rotation.x = Math.PI / 2; k.position.set(-3.9 + i * 0.36, 0.04, 2.0); scene.add(k); }
    const pst = textPlane(1.6, 0.9, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c230'; c.font = `bold ${h * 0.22}px Oswald`; c.textAlign = 'center'; c.fillText('PENTAS SENI', w / 2, h * 0.38); c.fillStyle = '#fff'; c.font = `bold ${h * 0.15}px Oswald`; c.fillText('SMAN 1 NYUATAN', w / 2, h * 0.65); });
    pst.position.set(-4.95, 2.2, -1); pst.rotation.y = Math.PI / 2; scene.add(pst);
    return {};
  },
  panggung(scene, o = {}) { // lapangan sekolah malam + panggung (atas panggung y=1.0, z -9..-2.6), penonton di +z menghadap -z
    const sore = !!o.sore; scene.userData.clear = sore ? 0x222222 : 0x05060c; sky(scene, sore ? '#f3a96b' : '#05060f', sore ? '#ffe0b0' : '#141a33');
    const sorot = !!o.sorot;
    if (sore) lights(scene, { sky: '#ffd2a1', ground: '#7a5a4a', hemi: 1.5, sun: '#ffb070', sunI: 1.7, sunPos: [-8, 5, 8], shadowSize: 16 });
    else lights(scene, { sky: '#4a5a8a', ground: '#1a1410', hemi: sorot ? 0.85 : 0.9, sun: '#9aa8d0', sunI: sorot ? 0.3 : 0.45, sunPos: [-4, 9, 8], shadowSize: 14 });
    const g = mesh(new THREE.PlaneGeometry(80, 80), noOutline(toon('#3c5a32')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    scene.add(box(14, 1.0, 6.4, '#2a2a2a', [0, 0.5, -5.8])); scene.add(box(14, 0.06, 6.4, noOutline(toon('#3b3b3b')), [0, 1.03, -5.8], { cast: false }));
    const bd = textPlane(12, 3.2, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b1f3a'); gr.addColorStop(1, '#3a1d4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f2c230'; c.font = `bold ${h * 0.2}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PENTAS SENI AKHIR SEMESTER', w / 2, h * 0.38); c.fillStyle = '#fff'; c.font = `bold ${h * 0.13}px Oswald`; c.fillText('SMAN 1 NYUATAN', w / 2, h * 0.62); }, 1024);
    bd.position.set(0, 3.6, -8.95); scene.add(bd);
    for (const x of [-6.8, 6.8]) scene.add(box(0.25, 7, 0.25, '#888', [x, 3.5, -8.6])); scene.add(box(14, 0.25, 0.25, '#888', [0, 6.9, -8.6])); scene.add(box(14, 0.25, 0.25, '#888', [0, 6.9, -3.0]));
    for (const x of [-6.8, 6.8]) scene.add(box(0.25, 7, 0.25, '#888', [x, 3.5, -3.0]));
    const dk = drumKit(); dk.position.set(0, 1.0, -7.4); scene.add(dk);
    const kb = keyboardAlat(); kb.position.set(3.4, 1.0, -5.6); kb.rotation.y = -0.3; scene.add(kb);
    const ms = micStand(); ms.position.set(0, 1.0, -3.65); ms.name = 'micStand'; scene.add(ms);
    for (const x of [-5.6, 5.6]) { const a = ampli(1.2, 1.4); a.position.set(x, 1.0, -3.6); a.rotation.y = x < 0 ? 0.3 : -0.3; scene.add(a); const a2 = ampli(1.2, 1.4); a2.position.set(x, 0, -2.2); scene.add(a2); }
    const warna = ['#ff3b6b', '#3bb3ff', '#ffd23b', '#7a3bff', '#3bff9a', '#ff8a3b'];
    const balok = [];
    if (!sorot && !sore) for (let i = 0; i < 6; i++) { const col = warna[i]; const cone = mesh(new THREE.ConeGeometry(1.2, 7, 18, 1, true), noOutline(flat(col, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), { cast: false });
      cone.geometry.translate(0, -3.5, 0); const piv = new THREE.Group(); piv.position.set(-5.5 + i * 2.2, 6.8, -3.2); piv.add(cone); piv.userData.ph = i; scene.add(piv); balok.push(piv);
      const pl = new THREE.PointLight(col, 6, 12, 1.5); pl.position.set(-5.5 + i * 2.2, 4, -3.5); scene.add(pl); }
    if (sorot) { const cone = mesh(new THREE.ConeGeometry(1.3, 6.6, 20, 1, true), noOutline(flat('#fff6d8', { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), { cast: false });
      cone.position.set(0, 4.3, -4.0); scene.add(cone); const sp = new THREE.SpotLight('#fff3d6', 14, 14, 0.32, 0.5, 1.2); sp.position.set(0, 7.5, -4.0); sp.target.position.set(0, 1, -4.0); scene.add(sp); scene.add(sp.target);
      const biru = new THREE.PointLight('#5a6aff', 4, 12, 1.5); biru.position.set(0, 4.5, -6.5); scene.add(biru);
      const isi = new THREE.PointLight('#ffd2a8', 9, 9, 1.3); isi.position.set(0, 4.0, -0.6); scene.add(isi);
      const sayap = new THREE.PointLight('#ffcf9a', 4, 7, 1.4); sayap.position.set(-5.2, 3.6, -2.6); scene.add(sayap);
      const disk = mesh(new THREE.CircleGeometry(1.2, 24), noOutline(flat('#fff2c8', { transparent: true, opacity: 0.22 }))); disk.rotation.x = -Math.PI / 2; disk.position.set(0, 1.07, -4.0); scene.add(disk); }
    else if (!sore) { const wash = new THREE.PointLight('#ffd9f0', 10, 16, 1.2); wash.position.set(0, 5, -1); scene.add(wash); }
    const K = o.penonton === false ? { lampu: [], badan: [] } : kerumunan(scene, { senter: o.senter || 0, z0: o.z0 ?? 3.0 });
    for (const [x, z] of [[-14, -6], [14, -5], [-16, 4], [16, 6]]) { const t = tree(4.5); t.position.set(x, 0, z); scene.add(t); }
    for (const x of [-12, 12]) { scene.add(box(0.15, 6, 0.15, '#666', [x, 3, 0])); const lp = mesh(new THREE.SphereGeometry(0.25, 8, 6), noOutline(flat('#fff1c0'))); lp.position.set(x, 6.1, 0); scene.add(lp); }
    scene.userData.anim = (t) => {
      balok.forEach(b => { b.rotation.z = Math.sin(t * 0.9 + b.userData.ph) * 0.45; b.rotation.x = Math.cos(t * 0.7 + b.userData.ph * 1.3) * 0.25; });
      K.lampu.forEach(L => { L.position.x += Math.sin(t * 1.4 + L.userData.ph) * 0.004; L.rotation.z = Math.sin(t * 1.4 + L.userData.ph) * 0.35; });
      K.badan.forEach((b, i) => { if (!sorot && !sore) b.position.y = Math.max(0, Math.sin(t * 7 + i)) * 0.08; });
    };
    return {};
  },
  belakangPanggung(scene, o = {}) { // backstage: tirai hitam di -z (panggung di baliknya), jalan menuju gerbang belakang di +z
    scene.userData.clear = 0x05060c; sky(scene, '#05060f', '#141a33');
    lights(scene, { sky: '#8090b8', ground: '#2a2420', hemi: 1.25, sun: '#c0c8e0', sunI: 0.45, sunPos: [-4, 9, 8], shadowSize: 12 });
    const lpJ = new THREE.PointLight('#ffe0a8', 5, 10, 1.4); lpJ.position.set(0.8, 3.2, 5.2); scene.add(lpJ);
    const g = mesh(new THREE.PlaneGeometry(60, 60), noOutline(toon('#3a4a32')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    for (let i = 0; i < 14; i++) scene.add(box(0.7, 5.5, 0.12, i % 2 ? '#111' : '#1a1a1a', [-4.6 + i * 0.7, 2.75, -3 + (i % 2) * 0.06], { cast: false }));
    const cel = mesh(new THREE.PlaneGeometry(0.5, 5.4), noOutline(flat('#ff6ad5', { transparent: true, opacity: 0.6 }))); cel.position.set(1.65, 2.7, -2.9); scene.add(cel); cel.name = 'celah';
    const pl = new THREE.PointLight('#ff7ad9', 3.5, 8, 1.5); pl.position.set(1.6, 2.5, -2.3); scene.add(pl); const pl2 = new THREE.PointLight('#6ab8ff', 2.5, 8, 1.5); pl2.position.set(-2.5, 3, -2.3); scene.add(pl2);
    for (const [x, z] of [[-3.5, -1.8], [3.6, -1.5]]) { const a = ampli(0.9, 0.9); a.position.set(x, 0, z); a.rotation.y = Math.PI * 0.1; scene.add(a); }
    scene.add(box(1.2, 0.7, 0.8, '#2c2c2c', [-3.4, 0.35, 0.6], { round: 0.04 }));
    const gb = new THREE.Group(); for (let i = 0; i < 10; i++) gb.add(box(0.06, 2.2, 0.06, '#2c3e50', [-1.2 + i * 0.26, 1.1, 0])); gb.add(box(2.7, 0.08, 0.08, '#2c3e50', [0, 2.2, 0])); gb.position.set(0.5, 0, 13); scene.add(gb);
    for (const x of [-2.1, 3.1]) scene.add(box(0.5, 2.6, 0.5, '#bdb5a3', [x, 1.3, 13]));
    const lp = new THREE.PointLight('#ffd890', 4, 8, 1.5); lp.position.set(0.5, 3, 12.5); scene.add(lp); scene.add(box(0.1, 3.2, 0.1, '#555', [2.6, 1.6, 12.4]));
    const tx = textPlane(2.2, 0.4, (c, w, h) => { c.fillStyle = '#2c3e50'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `bold ${h * 0.6}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GERBANG BELAKANG', w / 2, h / 2 + 2); }); tx.position.set(0.5, 2.6, 12.95); scene.add(tx);
    scene.userData.anim = (t) => { cel.material.color.setHSL((t * 0.15) % 1, 0.8, 0.6); pl.color.setHSL((t * 0.15) % 1, 0.5, 0.7); };
    return {};
  },
  teras(scene, o = {}) { // teras rumah malam: dinding rumah di z=-1 (pintu 'pintu'), bangku teras, lampu
    scene.userData.clear = 0x05060c; sky(scene, '#070b1f', '#1b2244');
    lights(scene, { sky: '#6a78a8', ground: '#2a2420', hemi: 1.0, sun: '#9aa8d0', sunI: 0.35, sunPos: [-4, 9, 8], shadowSize: 10 });
    const g = mesh(new THREE.PlaneGeometry(40, 40), noOutline(toon('#4a5a3a')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    scene.add(box(10, 0.15, 3.2, '#9a8f80', [0, 0.075, 0.5], { cast: false }));
    scene.add(box(10, 3.6, 0.3, '#d9cdb4', [0, 1.8, -1.15])); scene.add(box(10.6, 0.25, 3.8, '#7a3b2e', [0, 3.7, 0.3]));
    for (const x of [-4.6, 4.6]) scene.add(box(0.2, 3.6, 0.2, '#f0ebe0', [x, 1.8, 2.0]));
    const pt = door('#6b4430'); pt.position.set(-0.3, 0, -0.98); scene.add(pt);
    const jd = windowPane(1.6, 1.2, '#ffd98a'); jd.position.set(-2.8, 1.9, -0.98); scene.add(jd);
    const bang = new THREE.Group(); bang.add(box(2.0, 0.1, 0.55, '#8a5a3a', [0, 0.48, 0])); bang.add(box(2.0, 0.5, 0.08, '#8a5a3a', [0, 0.78, -0.26]));
    for (const x of [-0.9, 0.9]) bang.add(box(0.08, 0.48, 0.5, '#5a3a22', [x, 0.24, 0])); bang.position.set(1.45, 0, 0.15); scene.add(bang);
    const lp = new THREE.PointLight('#ffd890', 7, 9, 1.4); lp.position.set(0.5, 3.2, 0.6); scene.add(lp); const bl = mesh(new THREE.SphereGeometry(0.12, 10, 8), noOutline(flat('#fff3c0'))); bl.position.set(0.5, 3.45, -0.85); scene.add(bl);
    for (const x of [-4.2, 3.8]) { const pp = plant(); pp.position.set(x, 0.15, 1.6); scene.add(pp); }
    for (let i = 0; i < 12; i++) scene.add(box(0.08, 1.0, 0.08, '#e8e2d4', [-5.5 + i, 0.5, 4.5])); scene.add(box(12, 0.08, 0.08, '#e8e2d4', [0, 0.9, 4.5]));
    for (const [x, z] of [[-7, 7], [6, 8]]) { const t = tree(4); t.position.set(x, 0, z); scene.add(t); }
    return {};
  },
  kosong(scene, o = {}) { // studio polos untuk kenangan / insert
    scene.userData.clear = 0xffffff;
    scene.background = new THREE.Color(o.bg || '#f2efe9');
    const g = mesh(new THREE.PlaneGeometry(60, 60), noOutline(toon(o.floor || '#ece8e0')), { cast: false }); g.rotation.x = -Math.PI / 2; scene.add(g);
    lights(scene, { hemi: 1.8, sunI: 1.3 });
    return {};
  },
};
