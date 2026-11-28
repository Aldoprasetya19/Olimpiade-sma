// Karakter blocky ala mainan bata: kepala silinder membulat, wajah 2D (canvas) yang bisa diganti ekspresinya.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { toon, flat, lerp, clamp, noise1 } from './core.js';

const HEAD_R = 0.42, HEAD_H = 0.74;
export const HIP = 0.75;

function roundedCyl(r, h, rr, seg = 32) {
  const pts = [new THREE.Vector2(0, -h / 2)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; pts.push(new THREE.Vector2(r - rr + Math.cos(a) * rr, -h / 2 + rr + Math.sin(a) * rr)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; pts.push(new THREE.Vector2(r - rr + Math.cos(a) * rr, h / 2 - rr + Math.sin(a) * rr)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, seg);
}
export const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01));

function mesh(geo, mat, cast = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; }

// ---------------- wajah
const FACE_W = 512, FACE_H = 400;
const PRESETS = {
  netral: { eyes: 'open', brows: 'netral', mouth: 'line' },
  senyum: { eyes: 'open', brows: 'netral', mouth: 'smile' },
  senang: { eyes: 'happy', brows: 'raised', mouth: 'open_smile' },
  cemas: { eyes: 'open', brows: 'worried', mouth: 'wavy' },
  kaget: { eyes: 'wide', brows: 'raised', mouth: 'o' },
  sedih: { eyes: 'half', brows: 'sad', mouth: 'frown' },
  marah: { eyes: 'open', brows: 'angry', mouth: 'frown' },
  serius: { eyes: 'half', brows: 'angry', mouth: 'line' },
  curiga: { eyes: 'half', brows: 'netral', mouth: 'smirk' },
  merem: { eyes: 'closed', brows: 'netral', mouth: 'line' },
  menghindar: { eyes: 'side', brows: 'worried', mouth: 'line' },
  bersalah: { eyes: 'down', brows: 'sad', mouth: 'wavy' },
  lega: { eyes: 'closed', brows: 'raised', mouth: 'smile' },
  paksa: { eyes: 'happy', brows: 'worried', mouth: 'smile' },
  kecewa: { eyes: 'down', brows: 'sad', mouth: 'line' },
  fokus: { eyes: 'down', brows: 'netral', mouth: 'line' },
  ngantuk: { eyes: 'half', brows: 'sad', mouth: 'o' },
  malu: { eyes: 'down', brows: 'worried', mouth: 'smile' },
  bingung: { eyes: 'side', brows: 'raised', mouth: 'wavy' },
  nangis: { eyes: 'closed', brows: 'sad', mouth: 'frown', tear: 1 },
};

function drawFace(ctx, f, opt) {
  ctx.clearRect(0, 0, FACE_W, FACE_H);
  const cx = FACE_W / 2, ey = 190, dx = 78;
  const lx = (f.look || 0) * 14, ly = (f.lookY || 0) * 10;
  const ink = '#2a1a12';
  // blush
  if (opt.blush !== false) {
    ctx.fillStyle = 'rgba(235,110,110,0.45)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 118, 262, 34, 20, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  // mata
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 9;
    const e = f.eyes;
    if (e === 'closed') { ctx.beginPath(); ctx.arc(x, ey - 4, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    else if (e === 'happy') { ctx.beginPath(); ctx.arc(x, ey + 10, 22, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else {
      let rx = 17, ry = 25, ox = lx, oy = ly;
      if (e === 'wide') { rx = 20; ry = 29; }
      if (e === 'side') ox = s * 0 + 9 * (f.sideDir || 1);
      if (e === 'down') oy = 9;
      ctx.beginPath(); ctx.ellipse(x + ox, ey + oy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(x + ox + 6, ey + oy - 9, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
      if (e === 'wide') { ctx.beginPath(); ctx.arc(x + ox - 5, ey + oy + 8, 3, 0, Math.PI * 2); ctx.fill(); }
      // kelopak setengah
      if (e === 'half' || e === 'down' || e === 'side') {
        ctx.fillStyle = opt.skin; const lid = e === 'half' ? 16 : 12;
        ctx.fillRect(x + ox - 26, ey + oy - 34, 52, 34 - (25 - lid));
        ctx.strokeStyle = ink; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(x + ox - 21, ey + oy - 25 + lid); ctx.lineTo(x + ox + 21, ey + oy - 25 + lid); ctx.stroke();
      }
    }
    // alis
    ctx.strokeStyle = ink; ctx.lineWidth = 10;
    const by = ey - 58 - (f.brows === 'raised' ? 12 : 0);
    ctx.beginPath();
    if (f.brows === 'worried' || f.brows === 'sad') { ctx.moveTo(x - s * 24, by - 8); ctx.lineTo(x + s * 24, by + 10 * (f.brows === 'sad' ? 1.2 : 1)); }
    else if (f.brows === 'angry') { ctx.moveTo(x - s * 24, by + 12); ctx.lineTo(x + s * 24, by - 6); }
    else { ctx.moveTo(x - 24, by + 2); ctx.quadraticCurveTo(x, by - 8, x + 24, by + 2); }
    ctx.stroke();
  }
  // mulut
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const my = 288; let m = f.mouth;
  if (f.talk) m = f.talk;
  ctx.beginPath();
  switch (m) {
    case 'smile': ctx.arc(cx, my - 22, 26, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case 'open_smile': ctx.moveTo(cx - 30, my - 6); ctx.quadraticCurveTo(cx, my + 40, cx + 30, my - 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e57373'; ctx.beginPath(); ctx.ellipse(cx, my + 12, 12, 6, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'o': ctx.ellipse(cx, my, 12, 16, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'open': ctx.ellipse(cx, my, 17, 11, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'open_s': ctx.ellipse(cx, my, 12, 6, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'frown': ctx.arc(cx, my + 24, 22, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); break;
    case 'wavy': ctx.moveTo(cx - 24, my); for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(cx - 24 + (i - 0.5) * 12, my + (i % 2 ? -8 : 8), cx - 24 + i * 12, my); ctx.stroke(); break;
    case 'smirk': ctx.moveTo(cx - 18, my + 2); ctx.quadraticCurveTo(cx + 8, my + 6, cx + 24, my - 10); ctx.stroke(); break;
    default: ctx.moveTo(cx - 16, my); ctx.lineTo(cx + 16, my); ctx.stroke();
  }
  // kacamata
  if (opt.glasses) {
    ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 8;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * dx, ey, 44, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - dx + 44, ey); ctx.lineTo(cx + dx - 44, ey); ctx.stroke();
  }
  if (opt.mustache) { ctx.fillStyle = '#3a2a20'; ctx.beginPath(); ctx.ellipse(cx - 20, my - 22, 22, 9, 0.2, 0, Math.PI * 2); ctx.ellipse(cx + 20, my - 22, 22, 9, -0.2, 0, Math.PI * 2); ctx.fill(); }
  if (f.tear) { ctx.fillStyle = 'rgba(140,200,255,0.9)'; ctx.beginPath(); ctx.ellipse(cx + dx + 6, ey + 42 + f.tear * 30, 7, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  if (f.sweat) { ctx.fillStyle = 'rgba(150,205,255,0.95)'; ctx.beginPath(); ctx.ellipse(cx + 165, ey - 60, 10, 16, 0, 0, Math.PI * 2); ctx.fill(); }
}

// ---------------- rambut / penutup kepala
function buildHair(style, color, head) {
  const g = new THREE.Group();
  const m = toon(color);
  const top = HEAD_H / 2;
  if (style === 'spiky') {
    const cap = mesh(rbox(0.9, 0.16, 0.88, 0.07), m); cap.position.set(0, top + 0.02, -0.03); g.add(cap);
    for (let i = -1; i <= 1; i++) { const b = mesh(rbox(0.2, 0.12, 0.22, 0.05), m); b.position.set(i * 0.24 + 0.05, top + 0.1, 0.16); b.rotation.set(-0.6, 0, i * 0.2); g.add(b); }
    const fr = mesh(rbox(0.84, 0.12, 0.14, 0.05), m); fr.position.set(0.03, top - 0.08, 0.37); fr.rotation.set(0.35, 0, -0.08); g.add(fr);
    const back = mesh(rbox(0.88, 0.46, 0.26, 0.08), m); back.position.set(0, top - 0.2, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.1, 0.3, 0.5, 0.04), m); sd.position.set(s * 0.43, top - 0.12, -0.06); g.add(sd); }
  } else if (style === 'bowl') {
    const c = mesh(new THREE.SphereGeometry(0.47, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); c.scale.set(1, 0.8, 1); c.position.y = top - 0.12; g.add(c);
    const rim = mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.22, 24), m); rim.position.set(0, top - 0.2, -0.0); g.add(rim);
    const back = mesh(rbox(0.88, 0.4, 0.3, 0.12), m); back.position.set(0, top - 0.36, -0.28); g.add(back);
  } else if (style === 'curly') {
    const base = mesh(rbox(0.9, 0.2, 0.9, 0.08), m); base.position.set(0, top + 0.02, 0); g.add(base);
    let k = 0;
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
      const b = mesh(rbox(0.26, 0.24, 0.26, 0.1), m); b.position.set(x * 0.28 + ((k * 37) % 5) * 0.01, top + 0.16 + ((k * 13) % 3) * 0.03, z * 0.28); b.rotation.y = k * 0.7; g.add(b); k++;
    }
    const back = mesh(rbox(0.9, 0.46, 0.3, 0.12), m); back.position.set(0, top - 0.2, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.14, 0.36, 0.5, 0.06), m); sd.position.set(s * 0.42, top - 0.1, -0.05); g.add(sd); }
  } else if (style === 'sidepart') {
    const cap = mesh(rbox(0.94, 0.3, 0.92, 0.12), m); cap.position.set(0, top + 0.08, -0.02); g.add(cap);
    const sw = mesh(rbox(0.7, 0.22, 0.42, 0.1), m); sw.position.set(0.12, top + 0.2, 0.22); sw.rotation.set(-0.2, 0, -0.18); g.add(sw);
    const back = mesh(rbox(0.9, 0.44, 0.3, 0.1), m); back.position.set(0, top - 0.2, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.1, 0.3, 0.5, 0.04), m); sd.position.set(s * 0.43, top - 0.1, -0.06); g.add(sd); }
  } else if (style === 'teacher') {
    const cap = mesh(rbox(0.92, 0.14, 0.9, 0.07), m); cap.position.set(0, top + 0.02, -0.03); g.add(cap);
    const back = mesh(rbox(0.9, 0.4, 0.3, 0.1), m); back.position.set(0, top - 0.24, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.1, 0.32, 0.46, 0.04), m); sd.position.set(s * 0.43, top - 0.16, -0.07); g.add(sd); }
  } else if (style === 'helmet') {
    const hm = toon('#f2c230');
    const c = mesh(new THREE.SphereGeometry(0.49, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); c.scale.set(1, 0.85, 1); c.position.y = top - 0.06; g.add(c);
    const brim = mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.05, 24), hm); brim.position.y = top - 0.05; brim.scale.z = 1.1; g.add(brim);
  } else if (style === 'kuncir') { // rambut dikuncir ke belakang
    const cap = mesh(rbox(0.93, 0.18, 0.91, 0.08), m); cap.position.set(0, top + 0.02, -0.02); g.add(cap);
    const fr = mesh(rbox(0.84, 0.12, 0.14, 0.05), m); fr.position.set(0.05, top - 0.07, 0.37); fr.rotation.set(0.3, 0, -0.08); g.add(fr);
    const back = mesh(rbox(0.88, 0.42, 0.26, 0.08), m); back.position.set(0, top - 0.2, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.1, 0.3, 0.48, 0.04), m); sd.position.set(s * 0.43, top - 0.12, -0.06); g.add(sd); }
    const tie = mesh(new THREE.TorusGeometry(0.06, 0.025, 6, 12), toon('#e74c3c')); tie.position.set(0, top - 0.05, -0.47); g.add(tie);
    const tail = mesh(rbox(0.2, 0.55, 0.18, 0.08), m); tail.position.set(0, top - 0.35, -0.52); tail.rotation.x = 0.25; g.add(tail);
  } else if (style === 'bob') { // rambut bob sebatas dagu
    const cap = mesh(rbox(0.96, 0.22, 0.94, 0.1), m); cap.position.set(0, top + 0.04, -0.02); g.add(cap);
    const fr = mesh(rbox(0.88, 0.16, 0.16, 0.06), m); fr.position.set(0, top - 0.08, 0.38); g.add(fr);
    const back = mesh(rbox(0.94, 0.62, 0.3, 0.1), m); back.position.set(0, top - 0.3, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.15, 0.6, 0.62, 0.07), m); sd.position.set(s * 0.45, top - 0.3, -0.02); g.add(sd); }
  } else if (style === 'panjang') { // rambut panjang sebahu (pengganti kerudung)
    const cap = mesh(rbox(0.94, 0.2, 0.92, 0.09), m); cap.position.set(0, top + 0.03, -0.02); g.add(cap);
    const fr = mesh(rbox(0.86, 0.14, 0.16, 0.06), m); fr.position.set(-0.05, top - 0.07, 0.37); fr.rotation.set(0.3, 0, 0.1); g.add(fr);
    const back = mesh(rbox(0.92, 0.95, 0.3, 0.1), m); back.position.set(0, top - 0.42, -0.3); g.add(back);
    for (const s of [-1, 1]) { const sd = mesh(rbox(0.14, 0.85, 0.5, 0.06), m); sd.position.set(s * 0.45, top - 0.4, -0.06); g.add(sd); }
  } else if (style === 'hijab') {
    const hm = toon(color);
    const shell = mesh(new THREE.CylinderGeometry(0.49, 0.5, HEAD_H + 0.08, 28, 1, false, Math.PI * 0.32, Math.PI * 1.36), hm);
    shell.position.y = 0.02; g.add(shell);
    const cap = mesh(new THREE.SphereGeometry(0.5, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm); cap.scale.set(1, 0.5, 1); cap.position.y = top + 0.04; g.add(cap);
    const brow = mesh(new THREE.CylinderGeometry(0.495, 0.495, 0.16, 28, 1, false, -Math.PI * 0.34, Math.PI * 0.68), hm); brow.position.y = top - 0.02; g.add(brow);
    const chin = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 28, 1, false, -Math.PI * 0.34, Math.PI * 0.68), hm); chin.position.y = -top - 0.02; g.add(chin);
    const drape = mesh(new THREE.CylinderGeometry(0.5, 0.66, 0.6, 28), hm); drape.position.y = -top - 0.3; g.add(drape);
  }
  return g;
}

// ---------------- karakter
export class Char {
  constructor(o) {
    this.o = o = {
      skin: '#c98a52', hair: '#2b2118', hairStyle: 'spiky', shirt: '#f4f2ec', sleeve: null, pants: '#6b6e75',
      shoes: '#222222', name: null, badge: true, glasses: false, skirt: null, scale: 1, collar: true, ...o,
    };
    const root = this.root = new THREE.Group();
    const s = o.scale; root.scale.setScalar(s);
    const skin = toon(o.skin), shirt = o.shirtTex ? toon('#ffffff', { map: o.shirtTex }) : toon(o.shirt), pants = toon(o.pants);
    const hips = this.hips = new THREE.Group(); hips.position.y = HIP; root.add(hips);
    // kaki
    this.legs = [];
    for (const sd of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(sd * 0.18, 0, 0); hips.add(leg);
      const th = mesh(rbox(0.32, 0.44, 0.36, 0.06), pants); th.position.y = -0.19; leg.add(th);
      const knee = new THREE.Group(); knee.position.y = -0.38; leg.add(knee);
      const sh = mesh(rbox(0.3, 0.36, 0.34, 0.06), o.shortLeg === sd ? skin : pants); sh.position.y = -0.16; knee.add(sh);
      if (o.shortLeg === sd) { const band = mesh(rbox(0.33, 0.14, 0.37, 0.04), toon('#f5f5f0')); band.position.y = -0.04; knee.add(band); }
      const shoe = mesh(rbox(0.32, 0.12, 0.44, 0.05), toon(o.shoes)); shoe.position.set(0, -0.32, 0.04); knee.add(shoe);
      this.legs.push({ leg, knee });
    }
    if (o.skirt) {
      const sk = mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.76, 20), toon(o.skirt)); sk.position.y = -0.36; hips.add(sk); this.skirtMesh = sk;
      this.legs.forEach(l => l.leg.visible = false);
    }
    // badan
    const torso = this.torso = new THREE.Group(); hips.add(torso);
    const body = mesh(rbox(0.82, 0.82, 0.46, 0.1), shirt); body.position.y = 0.42; torso.add(body);
    if (o.collar && !o.hijab) {
      for (const sd of [-1, 1]) { const c = mesh(rbox(0.22, 0.05, 0.16, 0.02), toon(o.collarColor || o.shirt)); c.position.set(sd * 0.11, 0.82, 0.17); c.rotation.set(0.5, 0, sd * 0.5); torso.add(c); }
    }
    if (o.vest) { const v = mesh(rbox(0.86, 0.6, 0.5, 0.1), toon(o.vest)); v.position.y = 0.5; torso.add(v); }
    if (o.apron) { const a = mesh(rbox(0.6, 0.7, 0.04, 0.02), toon(o.apron)); a.position.set(0, 0.32, 0.24); torso.add(a); }
    if (o.jacket) { for (const sd of [-1, 1]) { const j = mesh(rbox(0.3, 0.8, 0.5, 0.08), toon(o.jacket)); j.position.set(sd * 0.27, 0.42, 0); torso.add(j); } }
    if (o.name) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
      x.fillStyle = '#1d1d1d'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#fff'; x.font = 'bold 40px Oswald'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.name, 128, 34);
      const t = new THREE.CanvasTexture(c);
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.065), flat('#fff', { map: t })); tag.position.set(0.2, 0.6, 0.232); torso.add(tag);
    }
    if (o.badge) {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.055, 5), flat(o.badgeColor || '#2f5fb3')); b.position.set(-0.2, 0.6, 0.232); b.rotation.z = Math.PI / 2 / 5 * 0; torso.add(b);
      const b2 = new THREE.Mesh(new THREE.CircleGeometry(0.025, 5), flat('#f0c419')); b2.position.set(-0.2, 0.6, 0.234); torso.add(b2);
    }
    // lengan
    this.arms = [];
    for (const sd of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(sd * 0.5, 0.74, 0); torso.add(sh);
      const up = mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.42, 12), o.longSleeve ? toon(o.sleeve || o.shirt) : toon(o.sleeve || o.shirt)); up.position.y = -0.18; sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.38; sh.add(el);
      const fa = mesh(new THREE.CylinderGeometry(0.11, 0.105, 0.38, 12), o.longSleeve ? toon(o.sleeve || o.shirt) : skin); fa.position.y = -0.18; el.add(fa);
      const hand = new THREE.Group(); hand.position.y = -0.42; el.add(hand);
      const hm = mesh(new THREE.SphereGeometry(0.14, 16, 12), skin); hm.scale.set(1, 1.1, 0.9); hand.add(hm);
      if (o.wristband && sd === -1) { const wb = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), toon(o.wristband)); wb.position.y = -0.34; el.add(wb); }
      this.arms.push({ sh, el, hand });
    }
    // kepala
    const neck = this.neck = new THREE.Group(); neck.position.y = 0.84; torso.add(neck);
    const head = this.head = new THREE.Group(); head.position.y = HEAD_H / 2 + 0.02; neck.add(head);
    head.add(mesh(roundedCyl(HEAD_R, HEAD_H, 0.12), skin));
    // wajah
    this.faceCanvas = document.createElement('canvas'); this.faceCanvas.width = FACE_W; this.faceCanvas.height = FACE_H;
    this.faceCtx = this.faceCanvas.getContext('2d');
    this.faceTex = new THREE.CanvasTexture(this.faceCanvas); this.faceTex.anisotropy = 4;
    const fm = flat('#fff', { map: this.faceTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const fg = new THREE.CylinderGeometry(HEAD_R + 0.003, HEAD_R + 0.003, HEAD_H - 0.18, 32, 1, true, -1.05, 2.1);
    const face = new THREE.Mesh(fg, fm); face.renderOrder = 2; head.add(face);
    if (o.hairStyle) head.add(buildHair(o.hairStyle, o.hair, head));
    this.faceKey = ''; this.expr = 'netral'; this.talking = false; this.lookX = 0;
    this.setFace('netral', 0);
    this.pose = {};
  }
  act(pose, face, t, talking = false, seed = 0, extra) {
    this.talking = talking; this.applyPose(addPose(pose, idle(t, seed))); this.setFace(face, t, extra); return this;
  }
  // props pada tangan: side -1 = kanan, 1 = kiri
  handOf(side = -1) { return this.arms[side === -1 ? 0 : 1].hand; }

  setFace(expr, t = 0, extra = {}) {
    let f = typeof expr === 'string' ? { ...PRESETS[expr] } : { ...expr };
    Object.assign(f, extra);
    // kedip
    const blinkPhase = (t + (this.o.blinkSeed || 0)) % 3.3;
    if (f.eyes !== 'closed' && f.eyes !== 'happy' && blinkPhase < 0.1 && !f.noBlink) f.eyes = 'closed';
    if (this.talking) {
      const k = Math.sin(t * 22) + Math.sin(t * 13.7) * 0.6;
      f.talk = k > 0.5 ? 'open' : k > -0.3 ? 'open_s' : null;
      if (!f.talk) delete f.talk;
    }
    const key = JSON.stringify(f);
    if (key === this.faceKey) return;
    this.faceKey = key;
    drawFace(this.faceCtx, f, { skin: this.o.skin, glasses: this.o.glasses, mustache: this.o.mustache, blush: this.o.blush });
    this.faceTex.needsUpdate = true;
  }

  // pose = objek sudut (radian). Kunci: hipsY, hipsX, torsoX, torsoY, torsoZ, headX, headY, headZ,
  // shR:[x,y,z], elR, shL:[x,y,z], elL, legR, kneeR, legL, kneeL
  applyPose(p) {
    const d = (k, v = 0) => (p[k] ?? v);
    this.hips.position.y = d('hipsY', HIP);
    this.hips.position.z = d('hipsZ', 0);
    this.hips.rotation.set(d('hipsX'), d('hipsY_rot'), d('hipsZ_rot'));
    this.torso.rotation.set(d('torsoX'), d('torsoY'), d('torsoZ'));
    this.neck.rotation.set(d('headX'), d('headY'), d('headZ'));
    const [R, L] = this.arms;
    const sR = p.shR || [0, 0, -0.08], sL = p.shL || [0, 0, 0.08];
    R.sh.rotation.set(...sR); L.sh.rotation.set(...sL);
    R.el.rotation.set(d('elR', -0.1), 0, 0); L.el.rotation.set(d('elL', -0.1), 0, 0);
    const [lr, ll] = [this.legs[0], this.legs[1]];
    lr.leg.rotation.set(d('legR'), 0, d('legRz')); lr.knee.rotation.set(d('kneeR'), 0, 0);
    ll.leg.rotation.set(d('legL'), 0, d('legLz')); ll.knee.rotation.set(d('kneeL'), 0, 0);
  }
}

// ---------------- pustaka pose
export const POSES = {
  berdiri: {},
  duduk: { hipsY: 0.5, legR: -1.57, kneeR: 1.57, legL: -1.57, kneeL: 1.57 },
  hp: { shR: [-0.55, 0, 0.32], elR: -1.45, headX: 0.38 },               // pegang HP di depan dada, lihat ke bawah
  hpDua: { shR: [-0.55, 0, 0.36], elR: -1.45, shL: [-0.55, 0, -0.36], elL: -1.45, headX: 0.38 },
  hpAngkat: { shR: [-1.15, 0, 0.2], elR: -1.25, headX: 0.05 },          // tunjukkan HP ke depan
  serahkan: { shR: [-1.35, 0, 0.1], elR: -0.2 },
  tunjuk: { shR: [-1.45, 0, 0.05], elR: -0.05 },
  dagu: { shR: [-0.7, 0, 0.35], elR: -2.2, headX: 0.05 },
  jongkok: { hipsY: 0.33, legR: -2.0, kneeR: 2.5, legL: -1.8, kneeL: 2.4, torsoX: 0.35, headX: 0.2 },
  naik: { hipsY: 0.5, legR: -1.2, kneeR: 1.3, legL: -1.2, kneeL: 1.3, shR: [-1.15, 0, 0.3], elR: -0.35, shL: [-1.15, 0, -0.3], elL: -0.35, torsoX: 0.15 },
  bonceng: { hipsY: 0.5, legR: -1.2, kneeR: 1.3, legL: -1.2, kneeL: 1.3, shR: [-0.5, 0, 0.1], elR: -0.9, shL: [-0.5, 0, -0.1], elL: -0.9 },
  pinggang: { shR: [0.5, 0, -0.5], elR: -1.9, shL: [0.5, 0, 0.5], elL: -1.9, torsoX: -0.1 },
  minum: { shR: [-0.6, 0, 0.35], elR: -1.6, headX: 0.05 },
  gitar: { hipsY: 0.5, legR: -1.57, kneeR: 1.57, legL: -1.57, kneeL: 1.57, shR: [-0.55, 0, 0.5], elR: -1.25, shL: [-1.2, 0, -0.05], elL: -0.75, headX: 0.25 },
  mic: { shR: [-0.6, 0, 0.45], elR: -2.1, shL: [-0.3, 0, -0.6], elL: -0.6, headX: -0.15 },
  sorak: { shR: [-2.9, 0, -0.3], elR: -0.2, shL: [-2.9, 0, 0.3], elL: -0.2, headX: -0.25 },
  tepukBahu: { shR: [-1.5, 0, 0.6], elR: -0.5 },
  jabat: { shR: [-1.1, 0, 0.15], elR: -0.4 },
  lingkar: { shR: [-1.4, 0, 0.2], elR: -0.2, shL: [-0.2, 0, 0.1] },
  drum: { hipsY: 0.55, legR: -1.57, kneeR: 1.57, legL: -1.57, kneeL: 1.57, shR: [-0.9, 0, 0.35], elR: -0.9, shL: [-0.9, 0, -0.35], elL: -0.9, headX: 0.15 },
  keyboard: { shR: [-0.75, 0, 0.3], elR: -0.75, shL: [-0.75, 0, -0.3], elL: -0.75, headX: 0.3, torsoX: 0.08 },
  gitarBerdiri: { shR: [-0.55, 0, 0.5], elR: -1.25, shL: [-1.2, 0, -0.05], elL: -0.75, headX: 0.2 },
  vokal: { shR: [-1.1, 0, 0.45], elR: -1.5, shL: [-1.1, 0, -0.45], elL: -1.5, headX: -0.08 },
  micDua: { shR: [-0.75, 0, 0.42], elR: -1.75, shL: [-0.75, 0, -0.42], elL: -1.75, headX: 0.0 },
  angkat: { shR: [-0.75, 0, 0.18], elR: -0.9, shL: [-0.75, 0, -0.18], elL: -0.9, torsoX: -0.06 },
  senter: { shR: [-2.75, 0, -0.15], elR: -0.2 },
  jempol: { shR: [-1.3, 0, 0.15], elR: -1.2 },
  peluk: { shR: [-1.35, 0, 0.75], elR: -1.2, shL: [-1.35, 0, -0.75], elL: -1.2, headX: 0.1 },
  garuk: { shR: [-2.6, 0, 0.5], elR: -1.6, headX: 0.15, headZ: -0.1 },
  telinga: { shR: [-2.1, 0, 0.1], elR: -2.1, headZ: -0.15 },
  tunjukMata: { shR: [-1.0, 0, 0.55], elR: -2.3 },
  lehar: { shR: [-1.0, 0, 0.5], elR: -2.2, headX: 0.15 },
  gemetar: { legR: 0.06, legL: -0.06, kneeR: 0.15, kneeL: 0.15, shR: [-0.75, 0, 0.42], elR: -1.75, shL: [-0.75, 0, -0.42], elL: -1.75, torsoX: 0.12, headX: 0.2 },
  sodorMic: { shR: [-1.45, 0, 0.1], elR: -0.25 },
  ngeri: { torsoX: -0.22, headX: -0.2, shR: [-0.9, 0, 0.3], elR: -1.4, shL: [-0.9, 0, -0.3], elL: -1.4 },
  usap: { shR: [0.15, 0, 0.3], elR: -0.5, shL: [0.15, 0, -0.3], elL: -0.5, headX: 0.35 },
  lambai: { shR: [-2.7, 0, -0.25], elR: -0.4 },
  tepukTangan: { shR: [-1.0, 0, 0.45], elR: -1.3, shL: [-1.0, 0, -0.45], elL: -1.3 },
  kipas: { shR: [-1.2, 0, 0.2], elR: -0.9 },
  rangkulKiri: { shL: [-0.35, 0, 1.25], elL: -0.55 },
  rangkulKanan: { shR: [-0.35, 0, -1.25], elR: -0.55 },
  rangkul: { shR: [-0.4, 0, -1.25], elR: -0.6, shL: [-0.4, 0, 1.25], elL: -0.6 },
  tunduk: { headX: 0.45, torsoX: 0.08, shR: [0.05, 0, -0.05], shL: [0.05, 0, 0.05] },
  silang: { shR: [-0.6, 0, 0.45], elR: -1.7, shL: [-0.6, 0, -0.45], elL: -1.7 },
  tanganMeja: { shR: [-0.75, 0, 0.18], elR: -0.9, shL: [-0.75, 0, -0.18], elL: -0.9 },
  bawa: { shR: [-0.45, 0, 0.2], elR: -1.3, shL: [-0.45, 0, -0.2], elL: -1.3 },
  kerja: { shR: [-2.6, 0, 0.1], elR: -0.5, shL: [-2.5, 0, -0.1], elL: -0.6, headX: -0.5 },
  dorong: { torsoX: 0.35, shR: [-1.5, 0, 0.1], elR: -0.1, shL: [-1.5, 0, -0.1], elL: -0.1, legR: -0.6, kneeR: 0.3, legL: 0.5, kneeL: 0.2 },
  jatuh: { hipsY: 0.3, hipsX: -1.45, shR: [-2.6, 0, -0.5], elR: -0.2, shL: [-2.6, 0, 0.5], elL: -0.2, legR: -0.2, legL: 0.1, headX: -0.3 },
  tengok: { headY: 0.7 },
  angguk: {},
  mengetik: { shR: [-0.5, 0, 0.4], elR: -1.5, shL: [-0.5, 0, -0.4], elL: -1.5, headX: 0.42 },
};

export function mixPose(a, b, k) {
  const o = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const defArr = (key) => key === 'shR' ? [0, 0, -0.08] : [0, 0, 0.08];
  for (const key of keys) {
    const A = a[key], B = b[key];
    if (key.startsWith('sh')) { const x = A || defArr(key), y = B || defArr(key); o[key] = x.map((v, i) => lerp(v, y[i], k)); }
    else { const def = key === 'hipsY' ? HIP : (key.startsWith('el') ? -0.1 : 0); o[key] = lerp(A ?? def, B ?? def, k); }
  }
  return o;
}
export function combine(...ps) { return Object.assign({}, ...ps); }

// siklus jalan/lari prosedural (t detik)
export function walkPose(t, speed = 1, run = false) {
  const f = t * (run ? 9 : 6) * speed;
  const a = Math.sin(f) * (run ? 0.9 : 0.5);
  return {
    hipsY: HIP + Math.abs(Math.cos(f)) * (run ? 0.06 : 0.03), torsoX: run ? 0.25 : 0.03,
    legR: a, legL: -a, kneeR: Math.max(0, -Math.sin(f + 0.8)) * (run ? 1.2 : 0.6), kneeL: Math.max(0, Math.sin(f + 0.8)) * (run ? 1.2 : 0.6),
    shR: [-a * 0.8, 0, -0.1], shL: [a * 0.8, 0, 0.1], elR: run ? -1.3 : -0.3, elL: run ? -1.3 : -0.3,
  };
}
// napas & goyang idle
export function idle(t, seed = 0) {
  return { torsoZ: noise1(t * 0.6, seed) * 0.015, headZ: noise1(t * 0.5, seed + 3) * 0.03, headY: noise1(t * 0.4, seed + 7) * 0.05 };
}
export function addPose(base, add) {
  const o = { ...base };
  for (const k in add) {
    if (Array.isArray(add[k])) { const base = o[k] || (k === 'shR' ? [0, 0, -0.08] : [0, 0, 0.08]); o[k] = base.map((v, i) => v + add[k][i]); }
    else o[k] = (o[k] ?? (k === 'hipsY' ? HIP : 0)) + add[k];
  }
  return o;
}
