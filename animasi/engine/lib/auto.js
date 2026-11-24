// Penyusun shot otomatis: lokasi + slot tokoh + sudut kamera yang dihitung (bebas tabrakan kepala).
// Dipakai oleh episode hasil tools/naskah_ke_episode.py. Lihat engine/README.md bagian "Jalur hemat".
import * as THREE from 'three';
import { CAST } from './cast.js';
import { SETS, phone } from './sets.js';
import { POSES, combine, addPose, idle } from './char.js';
import { ease, lerp } from './core.js';
import { drawChat, drawLock, drawBanner } from './phoneui.js';
import { phoneInsert } from './shots.js';

// ---------- lokasi: slot tokoh [x, z, rotY, duduk?], batas kamera, grade bawaan
export const LOKASI = {
  rumah: { set: 'rumah', grade: 'malam', bounds: [-5.6, 5.6, -5.1, 5.1],
    slot: { meja: [0, 1.0, Math.PI, true], seberang: [0, -1.0, 0, true], dapur: [2.0, -4.1, Math.PI * 0.1, false], dekatMeja: [1.6, 0.2, -Math.PI / 2, false] } },
  kelas: { set: 'kelas', grade: 'pagi', bounds: [-6.1, 6.1, -5.6, 5.6],
    slot: { dudukKiri: [-0.47, -1.45, Math.PI, true], dudukKanan: [0.47, -1.45, Math.PI, true], depanMeja: [-0.2, -3.1, 0, false], lorong: [1.6, -1.45, -Math.PI / 2, false] } },
  kantin: { set: 'belakangKantin', grade: 'pagi', bounds: [-9, 9, -2.4, 12],
    slot: { kiri: [-0.9, -0.6, Math.PI / 2, false], kanan: [0.9, -0.6, -Math.PI / 2, false] } },
  gerbang: { set: 'gerbang', grade: 'pagi', bounds: [-12, 12, -9, 14], blocks: [[-3.3, -1.9, -0.7, 0.7], [1.9, 3.3, -0.7, 0.7], [-9.5, -3.0, -0.4, 0.4], [3.0, 9.5, -0.4, 0.4]],
    slot: { kiri: [-0.75, 1.0, Math.PI / 2, false], kanan: [0.75, 1.0, -Math.PI / 2, false] } },
  gerbangSore: { set: 'gerbang', setOpts: { sore: true }, grade: 'sore', bounds: [-12, 12, -9, 14], blocks: [[-3.3, -1.9, -0.7, 0.7], [1.9, 3.3, -0.7, 0.7], [-9.5, -3.0, -0.4, 0.4], [3.0, 9.5, -0.4, 0.4]],
    slot: { kiri: [-0.75, 1.0, Math.PI / 2, false], kanan: [0.75, 1.0, -Math.PI / 2, false] } },
  ruangGuru: { set: 'ruangGuru', grade: 'pagi', bounds: [-5.6, 5.6, -5.1, 5.1],
    slot: { guru: [0, -2.6, 0, true], siswa1: [-1.3, -0.1, Math.PI, false], siswa2: [0, -0.05, Math.PI, false], siswa3: [1.3, -0.15, Math.PI, false] } },
  koridor: { set: 'sekolahTangga', grade: 'pagi', bounds: [-7.6, 7.6, -5.6, 5.6],
    slot: { kiri: [-0.2, 1.6, Math.PI / 2, false], kanan: [1.6, 1.6, -Math.PI / 2, false] } },
};

const blocked = (L, x, z) => (L.blocks || []).some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
const headY = (sit) => (sit ? 1.73 : 1.98);
const castMake = (key) => {
  const [k, opt] = key.split('#'); // mis. "dimas#perban"
  const o = opt === 'perban' ? { shortLeg: 1 } : {};
  if (CAST[k]) return CAST[k](o);
  return CAST.siswa(k.length, o);
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
      if (clear > 0.7 && (!best || score > best.score)) best = { cam, score, fov: fov * (dm < 1 ? 1.15 : 1) };
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
  for (let a = 0; a < 360; a += 15) {
    const ang = (a * Math.PI) / 180;
    const cam = new THREE.Vector3(c.x + Math.sin(ang) * dist, c.y + (wide ? 0.9 : 0.25), c.z + Math.cos(ang) * dist);
    if (cam.x < x0 || cam.x > x1 || cam.z < z0 || cam.z > z1 || blocked(L, cam.x, cam.z)) continue;
    const dir = cam.clone().sub(c).normalize();
    const faces = hs.reduce((s, h) => s + Math.max(0, Math.sin(h.rot) * dir.x + Math.cos(h.rot) * dir.z), 0);
    // utamakan semua tokoh terlihat (tegak lurus garis tokoh)
    let side = 0; if (hs.length > 1) { const d = new THREE.Vector3(hs[1].x - hs[0].x, 0, hs[1].z - hs[0].z).normalize(); side = 1 - Math.abs(d.dot(dir)); }
    const score = faces + side * 3;
    if (!best || score > best.score) best = { cam, score };
  }
  const cam = best ? best.cam : new THREE.Vector3(c.x, c.y + 1, c.z + dist);
  return { pos: cam.toArray(), look: [c.x, c.y - (wide ? 0.4 : 0.2), c.z], fov: wide ? 52 : 46 };
}

// two-shot dari balik bahu: bahu tokoh A di tepi frame, wajah B terlihat
export function solveOts(L, heads, first) {
  const names = Object.keys(heads); if (first && names.includes(first)) names.sort((x) => (x === first ? 1 : -1));
  const [x0, x1, z0, z1] = L.bounds;
  for (const [an, bn] of [[names[0], names[1]], [names[1], names[0]]]) {
    const A = heads[an], B = heads[bn];
    const dx = A.x - B.x, dz = A.z - B.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
    for (const sgn of [1, -1]) {
      const cx = A.x + ux * 1.7 + -uz * sgn * 1.15, cz = A.z + uz * 1.7 + ux * sgn * 1.15;
      if (cx < x0 || cx > x1 || cz < z0 || cz > z1 || blocked(L, cx, cz)) continue;
      return { pos: [cx, Math.max(A.y, B.y) + 0.3, cz], look: [B.x + ux * 0.4, B.y - 0.2, B.z + uz * 0.4], fov: 44 };
    }
  }
  return null;
}

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
      for (const [slot, key] of Object.entries(d.cast || {})) {
        const s = L.slot[slot]; if (!s) continue;
        const c = castMake(key); const name = key.split('#')[0];
        S.add(c, [s[0], 0, s[1]], s[2]); chars[name] = { c, sit: s[3] };
        heads[name] = { x: s[0], y: headY(s[3]), z: s[1], rot: s[2] };
        if ((d.pose?.[name] || '').startsWith('hp')) { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI);
          ph.draw(x => drawChat(x, { title: 'Chat', messages: [{ text: '...' }] })); }
      }
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
          const extra = POSES[d.pose?.[name]]; if (extra) p = combine(p, extra);
          if (d.pose?.[name] === 'angguk') p = combine(p, { headX: lt < 1 ? Math.max(0, Math.sin(lt * 9)) * 0.3 : 0 });
          const talking = (d.talk || []).some(([a, b, w]) => w === name && t >= a && t <= b);
          c.act(p, d.expr?.[name] || 'netral', t, talking, seed.indexOf(name));
        }
        S.camMove(k, cam, end);
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
      if (ph.jenis === 'notif') { drawLock(c, { time: ph.jam || '19.42', notifs: [{ title: ph.judul || '', body: ph.pesan?.[0] || '', av }] }); return; }
      drawChat(c, { title: ph.judul || '', subtitle: ph.sub || '', dark: !!ph.gelap, group: !!ph.grup, av, time: ph.jam,
        messages: (ph.pesan || []).map((m, i) => { const [from, text] = m.includes(':') && ph.grup ? m.split(/:(.*)/s) : ['', m];
          return { from: from.trim(), text: text.trim(), me: m.startsWith('>'), color: ['#d35400', '#8e44ad', '#2980b9', '#16a085'][i % 4], alpha: pop(lt, (i / Math.max(1, n)) * dur * 0.7) }; }) });
      if (ph.banner) drawBanner(c, ease(Math.min(1, lt / 0.5)), { title: ph.banner[0], body: ph.banner[1], av: { unknown: true } });
    }, grade: d.grade || (ph.gelap ? 'ancaman' : L.grade) });
}

export function autoEpisode(data) {
  const shots = data.shots.map(autoShot);
  if (data.endcard) shots.push({ t0: data.endcard, t1: data.duration, endcard: true });
  return { shots, duration: data.duration };
}
