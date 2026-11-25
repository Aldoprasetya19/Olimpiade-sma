// Penyusun shot otomatis: lokasi + slot tokoh + sudut kamera yang dihitung (bebas tabrakan kepala).
// Dipakai oleh episode hasil tools/naskah_ke_episode.py. Lihat engine/README.md bagian "Jalur hemat".
import * as THREE from 'three';
import { CAST } from './cast.js';
import { SETS, phone, piala, kalengCat } from './sets.js';
import { hud as HUD } from './core.js';
import { POSES, combine, addPose, idle, mixPose, walkPose } from './char.js';
import { ease, lerp } from './core.js';
import { drawChat, drawLock, drawBanner, avatar } from './phoneui.js';
import { phoneInsert } from './shots.js';

// ---------- lokasi: slot tokoh [x, z, rotY, duduk?], batas kamera, grade bawaan
export const LOKASI = {
  rumah: { set: 'rumah', grade: 'malam', bounds: [-5.6, 5.6, -5.1, 5.1],
    slot: { meja: [0, 1.0, Math.PI, true], dudukKiri: [0, 1.0, Math.PI, true], seberang: [0, -1.0, 0, true], dapur: [2.0, -4.1, Math.PI * 0.1, false], dekatMeja: [1.6, 0.2, -Math.PI / 2, false] } },
  kelas: { set: 'kelas', grade: 'pagi', bounds: [-6.1, 6.1, -5.6, 5.6],
    slot: { dudukKiri: [-0.47, -1.45, Math.PI, true], dudukKanan: [0.47, -1.45, Math.PI, true], depanMeja: [-0.2, -3.4, 0, false], guruDepan: [1.7, -4.3, -0.35, false], lorong: [1.6, -1.45, -Math.PI / 2, false] } },
  kantin: { set: 'belakangKantin', grade: 'pagi', bounds: [-9, 9, -2.4, 12],
    slot: { kiri: [-0.9, -0.6, Math.PI / 2, false], kanan: [0.9, -0.6, -Math.PI / 2, false], dudukKiri: [-0.55, -2.05, 0, true], dudukKanan: [0.55, -2.05, 0, true] } },
  toko: { set: 'toko', grade: 'sore', bounds: [-5.1, 5.1, -4.6, 4.6], slot: { dudukKiri: [0, -1.3, 0, true], dudukKanan: [1.0, -1.3, 0, true] } },
  kafe: { set: 'kafe', grade: 'hangat', bounds: [-5.6, 5.6, -5.1, 5.1], slot: { dudukKiri: [-1.15, 0, Math.PI / 2, true], dudukKanan: [1.15, 0, -Math.PI / 2, true], depanMeja: [0, -1.15, 0, true], belakang: [0, 1.15, Math.PI, true] } },
  gerbang: { set: 'gerbang', grade: 'pagi', bounds: [-6.5, 6.5, 1.6, 12], blocks: [[7.0, 9.0, 1.0, 3.0], [-9.0, -7.0, 2.0, 4.0], [-3.3, -1.9, -0.7, 0.7], [1.9, 3.3, -0.7, 0.7], [-9.5, -3.0, -0.4, 0.4], [3.0, 9.5, -0.4, 0.4]],
    slot: { kiri: [-0.75, 1.0, Math.PI / 2, false], kanan: [0.75, 1.0, -Math.PI / 2, false], belakang1: [2.3, 2.0, -Math.PI * 0.3, false], belakang2: [1.5, 2.9, -Math.PI * 0.2, false], intip: [-3.2, 1.0, Math.PI * 0.7, false] } },
  gerbangSore: { set: 'gerbang', setOpts: { sore: true }, grade: 'sore', bounds: [-6.5, 6.5, 1.6, 12], blocks: [[7.0, 9.0, 1.0, 3.0], [-9.0, -7.0, 2.0, 4.0], [-3.3, -1.9, -0.7, 0.7], [1.9, 3.3, -0.7, 0.7], [-9.5, -3.0, -0.4, 0.4], [3.0, 9.5, -0.4, 0.4]],
    slot: { kiri: [-0.75, 1.0, Math.PI / 2, false], kanan: [0.75, 1.0, -Math.PI / 2, false], belakang1: [2.3, 2.0, -Math.PI * 0.3, false], belakang2: [1.5, 2.9, -Math.PI * 0.2, false], intip: [-3.2, 1.0, Math.PI * 0.7, false] } },
  ruangGuru: { set: 'ruangGuru', grade: 'pagi', bounds: [-5.6, 5.6, -5.1, 5.1],
    slot: { guru: [0, -2.6, 0, true], siswa1: [-1.3, -0.1, Math.PI, false], siswa2: [0, -0.05, Math.PI, false], siswa3: [1.3, -0.15, Math.PI, false] } },
  lobi: { set: 'lobi', grade: 'pagi', bounds: [-6.6, 6.6, -5.6, 5.6], center: [0, -2.6], slot: { kiri: [-0.9, -1.0, Math.PI / 2, false], kanan: [0.9, -1.0, -Math.PI / 2, false] } },
  lobiPiala: { set: 'lobi', setOpts: { adaPiala: true }, grade: 'kenangan', bounds: [-6.6, 6.6, -5.6, 5.6], center: [0, -2.6], slot: {} },
  gudang: { set: 'gudang', grade: 'hangat', bounds: [-4.6, 4.6, -4.1, 4.1], center: [0, -1.6], slot: { kiri: [-0.9, 0.6, Math.PI / 2, false], kanan: [0.9, 0.6, -Math.PI / 2, false] } },
  gudangKejutan: { set: 'gudang', setOpts: { spanduk: true }, grade: 'hangat', bounds: [-4.6, 4.6, -4.1, 4.1], center: [0, -2.0], slot: {} },
  lapangan: { set: 'lapangan', setOpts: { spanduk: true }, grade: 'pagi', bounds: [-12, 12, -6, 12], center: [0, -1.5], kerumunan: true, slot: { kiri: [-0.9, 1.2, Math.PI / 2, false], kanan: [0.9, 1.2, -Math.PI / 2, false] } },
  koridor: { set: 'sekolahTangga', grade: 'pagi', bounds: [-7.6, 7.6, -5.6, 5.6],
    slot: { kiri: [-0.2, 1.6, Math.PI / 2, false], kanan: [1.6, 1.6, -Math.PI / 2, false], belakang1: [0.2, 0.1, 0.15, false], belakang2: [1.3, 0.0, -0.15, false] } },
};

const blocked = (L, x, z) => (L.blocks || []).some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
const headY = (sit) => (sit ? 1.73 : 1.98);
const PEREMPUAN = ['mila', 'hissari', 'aulia', 'nikita', 'sisil', 'nava', 'dayinta', 'sera', 'elisabeth', 'manohara', 'septi', 'naura', 'misel', 'palsya'];
const castMake = (key) => {
  const [k, opt] = key.split('#'); // mis. "dimas#perban"
  const o = opt === 'perban' ? { shortLeg: 1 } : opt === 'rumah' ? { shirt: '#2f4b7c', pants: '#3b3b44', badge: false, name: null, collar: false, sleeve: '#2f4b7c' } : {};
  if (CAST[k]) return CAST[k](o);
  const nm = k.toUpperCase(), seed = [...k].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return PEREMPUAN.includes(k) ? CAST.siswi(seed, { name: nm, ...o }) : CAST.siswa(seed, { name: nm, ...o });
};

// jarak titik ke ruas garis (3D)
function segDist(p, a, b) {
  const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq()));
  return p.distanceTo(a.clone().addScaledVector(ab, t));
}

// cari posisi kamera untuk close-up/medium subjek, menghindari kepala lain & batas ruangan
export function solveCam(L, heads, who, { dist = 2.8, fov = 40, high = 0.15 } = {}) {
  const h = heads[who];
  const target = new THREE.Vector3(h.x, h.y - 0.12, h.z);
  const [x0, x1, z0, z1] = L.bounds;
  let best = null;
  for (const a of [35, -35, 50, -50, 20, -20, 65, -65, 0, 80, -80]) {
    for (const [dm, hi] of [[1, 0], [0.85, 0], [1.2, 0], [1, 0.55], [1.2, 0.7], [0.7, 0]]) {
      const ang = h.rot + (a * Math.PI) / 180, d = dist * dm;
      const cam = new THREE.Vector3(h.x + Math.sin(ang) * d, h.y + high + hi, h.z + Math.cos(ang) * d);
      if (cam.x < x0 || cam.x > x1 || cam.z < z0 || cam.z > z1 || blocked(L, cam.x, cam.z)) continue;
      let clear = 9;
      for (const [k, o] of Object.entries(heads)) {
        if (k === who) continue;
        const p = new THREE.Vector3(o.x, o.y + 0.1, o.z);
        clear = Math.min(clear, segDist(p, cam, target), p.distanceTo(cam) - 0.4);
      }
      const score = Math.min(clear, 1.3) * 10 - Math.abs(a) * 0.02 - Math.abs(dm - 1) * 2 - hi * 3;
      if (clear > 0.85 && (!best || score > best.score)) best = { cam, score, fov: fov * (dm < 1 ? 1.15 : 1) };
    }
  }
  if (!best) best = { cam: new THREE.Vector3(h.x + Math.sin(h.rot) * dist, h.y + 0.6, h.z + Math.cos(h.rot) * dist), fov: fov * 1.2 };
  return { pos: best.cam.toArray(), look: target.toArray(), fov: best.fov };
}
// two-shot / lebar: tegak lurus garis antar-tokoh, di sisi yang paling banyak melihat wajah
export function solveGroup(L, heads, wide = false) {
  const hs = Object.values(heads); if (!hs.length) return { pos: [0, 2.2, 5], look: [0, 1.5, 0], fov: 50 };
  const c = hs.reduce((a, h) => a.add(new THREE.Vector3(h.x, h.y, h.z)), new THREE.Vector3()).divideScalar(hs.length);
  let span = 0; hs.forEach(a => hs.forEach(b => { span = Math.max(span, Math.hypot(a.x - b.x, a.z - b.z)); }));
  const dist = Math.max(3.6, span * 2.6) * (wide ? 1.5 : 1);
  const [x0, x1, z0, z1] = L.bounds; let best = null;
  for (const f of [1, 0.85, 0.7]) for (let a = 0; a < 360; a += 15) {
    const ang = (a * Math.PI) / 180;
    const cam = new THREE.Vector3(c.x + Math.sin(ang) * dist * f, c.y + (wide ? 0.9 : 0.25), c.z + Math.cos(ang) * dist * f);
    if (cam.x < x0 || cam.x > x1 || cam.z < z0 || cam.z > z1 || blocked(L, cam.x, cam.z)) continue;
    const dir = cam.clone().sub(c).normalize();
    const faces = hs.reduce((s, h) => s + Math.max(0, Math.sin(h.rot) * dir.x + Math.cos(h.rot) * dir.z), 0);
    // utamakan semua tokoh terlihat (tegak lurus garis tokoh)
    let side = 0; if (hs.length > 1) { const d = new THREE.Vector3(hs[1].x - hs[0].x, 0, hs[1].z - hs[0].z).normalize(); side = 1 - Math.abs(d.dot(dir)); }
    const score = faces + side * 3 - (1 - f) * 2;
    if (!best || score > best.score) best = { cam, score, f };
  }
  const cam = best ? best.cam : new THREE.Vector3(c.x, c.y + 1, c.z + dist);
  return { pos: cam.toArray(), look: [c.x, c.y - (wide ? 0.4 : 0.2), c.z], fov: (wide ? 52 : 46) / Math.sqrt(best?.f || 1) };
}

// two-shot dari balik bahu: bahu tokoh A di tepi frame, wajah B terlihat
export function solveOts(L, heads, first) {
  const names = Object.keys(heads); if (first && names.includes(first)) names.sort((x) => (x === first ? 1 : -1));
  const [x0, x1, z0, z1] = L.bounds;
  for (const [an, bn] of [[names[0], names[1]], [names[1], names[0]]]) {
    const A = heads[an], B = heads[bn];
    if (Math.cos(A.rot - B.rot) > 0.5) return null; // berdampingan, bukan berhadapan
    const dx = A.x - B.x, dz = A.z - B.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
    for (const sgn of [1, -1]) {
      const cx = A.x + ux * 2.4 + -uz * sgn * 1.35, cz = A.z + uz * 2.4 + ux * sgn * 1.35;
      if (cx < x0 || cx > x1 || cz < z0 || cz > z1 || blocked(L, cx, cz)) continue;
      return { pos: [cx, Math.max(A.y, B.y) + 0.3, cz], look: [B.x + ux * 0.4, B.y - 0.2, B.z + uz * 0.4], fov: 44 };
    }
  }
  return null;
}

// ---------- properti yang bisa dipegang / berpindah tangan
function kertasProp() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 170; const x = c.getContext('2d');
  x.fillStyle = '#f7f1e1'; x.fillRect(0, 0, 128, 170); x.fillStyle = '#7a7aa0'; for (let i = 0; i < 7; i++) x.fillRect(14, 22 + i * 20, 100 - (i % 3) * 18, 5);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.DoubleSide }));
  m.userData.outlineParameters = { visible: false }; const g = new THREE.Group(); g.add(m); return g;
}
function makeProp(kind) {
  if (kind === 'piala') { const g = piala(); g.userData.off = [[0.15, -0.05, 0.12], [Math.PI / 2 - 0.4, 0, 0]]; return g; }
  if (kind === 'cat') { const g = kalengCat(); g.userData.off = [[0.05, -0.12, 0.1], [Math.PI / 2 - 0.4, 0, 0]]; return g; }
  if (kind === 'hp') { const g = phone(); g.userData.off = [[0, -0.12, 0.1], [0, 0, Math.PI]]; return g; }
  const g = kertasProp(); g.userData.off = [[0, -0.2, 0.1], [0, 0, Math.PI]]; return g;
}
function holdProp(c, pr) { const h = c.handOf(-1); if (pr.parent !== h) { h.add(pr); const [p, r] = pr.userData.off; pr.position.set(...p); pr.rotation.set(...r); } }
const AKSI_POSE = {
  tunjuk: POSES.tunjuk, tunduk: POSES.tunduk, raba: { shR: [-1.3, 0, 0.1], elR: -0.3, shL: [-1.3, 0, -0.1], elL: -0.3, torsoX: 0.1 },
  intip: { torsoZ: 0.3, headZ: 0.2, torsoX: 0.15 }, baca: { ...POSES.hpDua, headX: 0.42 }, bawa: POSES.bawa, serahkan: POSES.serahkan,
};

// ---------- shot dari data
// d: { loc, cast:{slot:key}, cam:'cu:aldo'|'mcu:aldo'|'dua'|'lebar'|'hp', who (bicara), expr:{key:expr}, pose:{key:pose}, talk:[[a,b,key]], phone:{...} }
export function autoShot(d) {
  if (d.cam === 'hp') return { t0: d.t0, t1: d.t1, build: (S) => phoneShot(S, d) };
  return {
    t0: d.t0, t1: d.t1, flashIn: d.flash ? 0.2 : 0,
    build(S) {
      const L = LOKASI[d.loc] || LOKASI.kelas;
      SETS[L.set](S.scene, L.setOpts || {});
      const chars = {}, heads = {};
      const pn = Object.keys(d.cast || {}).filter(k => /^p\d+$/.test(k)).length;
      if (L.kerumunan) for (let i = 0; i < 14; i++) { const c = (i % 2 ? CAST.siswi : CAST.siswa)(i * 7 + 3); S.add(c, [-6 + (i % 7) * 2 + (i > 6 ? 1 : 0), 0, -4.2 - (i > 6 ? 1.3 : 0)], 0); c.act(POSES.berdiri, 'senyum', 0, false, i); }
      for (const [slot, key] of Object.entries(d.cast || {})) {
        let s = L.slot[slot];
        if (!s && /^p\d+$/.test(slot)) { const i = +slot.slice(1) - 1, off = i - (pn - 1) / 2, c0 = L.center || [0, 0]; s = [c0[0] + off * 1.05, c0[1] + Math.abs(off) * 0.25, -off * 0.12, false]; }
        if (!s) continue;
        const c = castMake(key); const name = key.split('#')[0];
        S.add(c, [s[0], 0, s[1]], s[2]); chars[name] = { c, sit: s[3] };
        heads[name] = { x: s[0], y: headY(s[3]), z: s[1], rot: s[2] };
        if (/^(piala|cat)/.test(d.pose?.[name] || '')) { const pr = d.pose[name] === 'piala' ? piala() : kalengCat(); c.handOf(-1).add(pr); pr.position.set(0.18, -0.05, 0.12); pr.rotation.set(Math.PI / 2 - 0.4, 0, 0); }
        if (/^(hp|telepon)/.test(d.pose?.[name] || '')) { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI);
          ph.draw(x => drawChat(x, { title: 'Chat', messages: [{ text: '...' }] })); }
      }
      const props = {}, bags = {};
      for (const [name, kindP] of Object.entries(d.hold || {})) if (chars[name]) { props[name] = makeProp(kindP); props[name].userData.kind = kindP; holdProp(chars[name].c, props[name]); }
      for (const a of d.acts || []) {
        if (!chars[a.who]) continue;
        if (a.a === 'bukaTas') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.22), new THREE.MeshToonMaterial({ color: '#34495e' })); b.position.set(0, 0.2, 0.42); chars[a.who].c.torso.add(b); bags[a.who] = b; b.visible = false; }
        if ((a.a === 'bukaTas' || a.a === 'beri' || a.a === 'baca') && !props[a.who]) { props[a.who] = makeProp(a.prop || 'kertas'); props[a.who].userData.kind = a.prop || 'kertas'; props[a.who].visible = false; }
      }
      const base = {}; for (const [n, { c }] of Object.entries(chars)) base[n] = { x: c.root.position.x, z: c.root.position.z, r: c.root.rotation.y };
      const [kind, who] = (d.cam || 'dua').split(':');
      let cam;
      if ((kind === 'cu' || kind === 'mcu') && heads[who]) cam = solveCam(L, heads, who, kind === 'cu' ? { dist: 3.3, fov: 40 } : { dist: 4.3, fov: 46, high: 0.05 });
      else if (kind === 'dua' && Object.keys(heads).length === 2) cam = solveOts(L, heads, who) || solveGroup(L, heads);
      else cam = solveGroup(L, heads, kind === 'lebar');
      const end = { ...cam, pos: cam.pos.map((v, i) => lerp(cam.look[i], v, 0.9)) };
      const seed = Object.keys(chars);
      return (lt, k, t) => {
        for (const [name, { c, sit }] of Object.entries(chars)) {
          let p = sit ? POSES.duduk : POSES.berdiri;
          const extra = /^(piala|cat)$/.test(d.pose?.[name]) ? POSES.bawa : d.pose?.[name] === 'telepon' ? { shR: [-0.35, 0, 0.55], elR: -2.5, headZ: -0.1 } : POSES[d.pose?.[name]]; if (extra) p = combine(p, extra);
          if (d.pose?.[name] === 'angguk') p = combine(p, { headX: lt < 1 ? Math.max(0, Math.sin(lt * 9)) * 0.3 : 0 });
          if (props[name]?.parent === c.handOf(-1) && props[name].visible !== false) p = combine(p, props[name].userData.kind === 'kertas' ? AKSI_POSE.baca : props[name].userData.kind === 'hp' ? POSES.hp : AKSI_POSE.bawa);
          const B = base[name]; let px = B.x, pz = B.z, rot = B.r;
          const fx = Math.sin(B.r), fz = Math.cos(B.r);
          for (const a of d.acts || []) {
            const q = (t - a.t) / a.dur, qc = Math.max(0, Math.min(1, q));
            if (a.who === name) {
              if (a.a === 'jalan' || a.a === 'endap') { const dd = (1 - ease(qc)) * 2.6; px = B.x - fx * dd; pz = B.z - fz * dd; if (q < 1) p = combine(walkPose(t, a.a === 'endap' ? 0.6 : 1), a.a === 'endap' ? { torsoX: 0.35, hipsY: 0.65 } : {}); }
              else if (a.a === 'pergi') { if (q > 0) { const dd = ease(qc) * 3; px = B.x + fx * dd; pz = B.z + fz * dd; if (q < 1) p = walkPose(t, 1); } }
              else if (a.a === 'menoleh') { p = combine(p, { headY: (p.headY || 0) + 0.8 * ease(qc) * (a.arah || 1) }); }
              else if (a.a === 'angguk') { if (q > 0 && q < 1) p = combine(p, { headX: Math.max(0, Math.sin(q * 18)) * 0.3 }); }
              else if (a.a === 'bukaTas') {
                if (bags[name]) bags[name].visible = q > -0.3 && q < 0.6;
                if (q > 0 && q < 0.6) p = combine(p, { shR: [-0.45, 0, 0.35], elR: -0.7, shL: [-0.45, 0, -0.35], elL: -0.7, headX: 0.45 });
                if (props[name]) { props[name].visible = q >= 0.55; if (q >= 0.55) { holdProp(c, props[name]); p = combine(p, AKSI_POSE.baca); } }
              } else if (a.a === 'baca') { if (q > 0) { if (props[name]) { props[name].visible = true; holdProp(c, props[name]); } p = combine(p, AKSI_POSE.baca); } }
              else if (a.a === 'beri' && chars[a.to]) {
                const pr = props[name] || props[a.to]; if (pr) { pr.visible = true; if (q < 0.55) holdProp(c, pr); else { holdProp(chars[a.to].c, pr); props[a.to] = pr; if (props[name] === pr) delete props[name]; } }
                if (q > 0 && q < 0.75) p = combine(p, mixPose({}, AKSI_POSE.serahkan, Math.sin(Math.PI * Math.min(1, q / 0.75))));
              } else if (AKSI_POSE[a.a] && q > 0 && q < 1.3) p = combine(p, AKSI_POSE[a.a]);
            }
            if (a.a === 'beri' && a.to === name && q > 0.25 && q < 0.8) p = combine(p, AKSI_POSE.serahkan);
          }
          c.root.position.x = px; c.root.position.z = pz; c.root.rotation.y = rot;
          const talking = (d.talk || []).some(([a, b, w]) => w === name && t >= a && t <= b);
          c.act(p, d.expr?.[name] || 'netral', t, talking, seed.indexOf(name));
        }
        S.camMove(k, cam, end);
        if (d.kertas) {
          const a = Math.min(1, lt / 0.4), x = HUD; x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, 720, 1280);
          x.translate(360, 560); x.rotate(-0.04); x.fillStyle = '#f7f1e1'; x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 30; x.fillRect(-270, -230, 540, 460); x.shadowBlur = 0;
          x.fillStyle = '#2b2b5a'; x.font = 'italic 600 38px Nunito'; x.textAlign = 'center'; x.textBaseline = 'middle';
          const words = d.kertas.split(' '); let line = '', y = -150; const lines = [];
          for (const w of words) { const t2 = line ? line + ' ' + w : w; if (x.measureText(t2).width > 460) { lines.push(line); line = w; } else line = t2; } lines.push(line);
          y = -((lines.length - 1) * 54) / 2 - 30; lines.forEach((l, i) => x.fillText(l, 0, y + i * 54)); x.restore();
        }
        return d.grade || L.grade;
      };
    },
  };
}

function phoneShot(S, d) {
  const L = LOKASI[d.loc] || LOKASI.kelas; const ph = d.phone || {};
  const pop = (lt, at) => Math.max(0, Math.min(1, (lt - at) / 0.25));
  const dur = d.t1 - d.t0, n = (ph.pesan || []).length;
  const av = ph.av || (ph.anon ? { unknown: true, bg: '#8b949e' } : { group: (ph.judul || '?').slice(0, 2).toUpperCase(), bg: '#3f8a5c' });
  return phoneInsert(S, { set: L.set, setOpts: L.setOpts, camPos: [0.4, 1.9, 2.0], look: [0, 1.2, -2.5], fog: d.grade === 'malam' || L.grade === 'malam' ? '#3b2e26' : '#b9c4c9', fogFar: 12, push: 0.15,
    draw: (c, lt) => {
      if (ph.jenis === 'post') {
        c.fillStyle = '#fff'; c.fillRect(0, 0, 540, 1080); c.fillStyle = '#111'; c.font = '800 34px Nunito'; c.textAlign = 'left'; c.fillText('Instagram', 24, 70);
        avatar(c, 60, 150, 30, { skin: '#d29a62', hair: '#3b2a1f', bg: '#f39c12' }); c.font = '800 26px Nunito'; c.fillText(ph.judul || '', 104, 158);
        c.fillStyle = '#7a4f35'; c.fillRect(0, 200, 540, 540); c.fillStyle = '#5d4033'; c.beginPath(); c.ellipse(270, 640, 220, 60, 0, 0, Math.PI * 2); c.fill();
        ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#e74c3c', '#f1c40f'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(30 + i * 66, 230); c.lineTo(96 + i * 66, 230); c.lineTo(63 + i * 66, 290); c.fill(); });
        for (let i = 0; i < 5; i++) avatar(c, 90 + i * 90, 520 - (i % 2) * 30, 42, { skin: ['#d29a62', '#c98a52', '#e0b07e', '#b97a45', '#a8703f'][i], hair: '#2a2018', bg: '#7a4f35' });
        c.fillStyle = '#e74c3c'; c.font = '700 40px Nunito'; c.fillText('♥', 24, 800); c.fillStyle = '#111'; c.font = '800 24px Nunito'; c.fillText('128 suka', 24, 850);
        c.font = '500 26px Nunito'; c.fillText((ph.judul || '').toLowerCase() + '  ' + (ph.pesan?.[0] || ''), 24, 895); c.fillStyle = '#999'; c.font = '500 22px Nunito'; c.fillText('20 menit yang lalu', 24, 940);
        return;
      }
      if (ph.jenis === 'notif') { drawLock(c, { time: ph.jam || '19.42', notifs: [{ title: ph.judul || '', body: ph.pesan?.[0] || '', av }] }); return; }
      drawChat(c, { title: ph.judul || '', subtitle: ph.sub || '', dark: !!ph.gelap, group: !!ph.grup, av, time: ph.jam,
        messages: (ph.pesan || []).map((m, i) => { const [from, text] = m.includes(':') && ph.grup ? m.split(/:(.*)/s) : ['', m];
          return { from: from.trim(), text: text.trim().replace(/^>/, ''), me: m.trim().startsWith('>'), color: ['#d35400', '#8e44ad', '#2980b9', '#16a085'][i % 4], alpha: pop(lt, (i / Math.max(1, n)) * dur * 0.7) }; }) });
      if (ph.banner) drawBanner(c, ease(Math.min(1, lt / 0.5)), { title: ph.banner[0], body: ph.banner[1], av: { unknown: true } });
    }, grade: d.grade || (ph.gelap ? 'ancaman' : L.grade) });
}

export function autoEpisode(data) {
  const shots = data.shots.map(autoShot);
  if (data.endcard) shots.push({ t0: data.endcard, t1: data.duration, endcard: true });
  return { shots, duration: data.duration };
}
