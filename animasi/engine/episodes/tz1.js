// Teaser sinematik "Es Teh Boba Sultan: Liburan Bersama" — selaras lagu "Es Teh Plastikan" (178,5 dtk)
// Bagian: Intro 0–16 | Verse 1 (bus) 16–48 | Chorus 1 (pantai) 48–80 | Verse 2 + Bridge (kemah senja) 80–144 | Outro (api unggun) 144–akhir
import * as THREE from 'three';
import { murid, santai, CAST } from '../lib/cast.js';
import { SETS, glass, phone, bus, desk, pasangGitar } from '../lib/sets.js';
import { POSES, combine, walkPose } from '../lib/char.js';
import { ease, easeIn, seg, lerp, clamp, mixGrade, W, H } from '../lib/core.js';

export const duration = 178.5;

// ---------- util
const M = (k) => murid(k, santai(k));
function put(S, k, x, z, ry = 0) { const c = typeof k === 'string' ? M(k) : k; S.add(c, [x, 0, z], ry); return c; }
const face = (c, x, z) => { c.root.rotation.y = Math.atan2(x - c.root.position.x, z - c.root.position.z); };
const BEAT = 2.05; // ketukan (Hz) untuk tepuk tangan / angguk
const tepuk = (t, sd = 0) => { const s = (Math.sin(t * Math.PI * 2 * BEAT + sd) + 1) / 2; return { shR: [-1.0, 0, 0.28 + 0.3 * s], elR: -1.3, shL: [-1.0, 0, -0.28 - 0.3 * s], elL: -1.3 }; };
const angguk = (t, sd = 0, a = 0.06) => ({ headX: Math.sin(t * Math.PI * 2 * BEAT + sd) * a });
const DUDUK_TANAH = { hipsY: 0.24, legR: -1.45, kneeR: 0.35, legL: -1.45, kneeL: 0.35, torsoX: -0.05 };
const RANGKUL = { shR: [-0.35, 0, -1.3], elR: -0.5, shL: [-0.35, 0, 1.3], elL: -0.5 };
const PEGANG = { shR: [-0.15, 0, -0.55], elR: -0.15, shL: [-0.15, 0, 0.55], elL: -0.15 };
function pegang(c, obj, p = [0, -0.18, 0.06], r = [0, 0, 0]) { c.handOf(-1).add(obj); obj.position.set(...p); obj.rotation.set(...r); return obj; }
function botol() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), new THREE.MeshToonMaterial({ color: '#7fc8f0', transparent: true, opacity: 0.85 })); g.add(b);
  const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10), new THREE.MeshToonMaterial({ color: '#1f6fb2' })); tp.position.y = 0.18; g.add(tp); return g; }
function canvasPlane(w, h, draw, px = 512) {
  const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * h / w); draw(c.getContext('2d'), c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide }));
  m.material.userData.outlineParameters = { visible: false }; return m;
}
function setCam(S, pos, look, fov = 40) { S.cam.position.set(...pos); S.cam.fov = fov; S.cam.updateProjectionMatrix(); S.cam.lookAt(...look); }

// ---------- HUD sinematik: letterbox + kartu judul
const BAR = H > W ? 150 : 88; // letterbox: potret 150 px, landscape ±2,35:1
const KARTU = [
  { a: 12.4, b: 16.0, l: ['DARI MODAL', 'DUA RATUS RIBU...'] },
  { a: 73.4, b: 80.0, l: ['PERSAINGAN YANG BERUBAH', 'JADI PERSAUDARAAN.'] },
  { a: 171.2, b: 999, l: ['ES TEH PLASTIKAN:', 'LIBURAN DUA ANGKATAN'], sub: 'Terima kasih untuk cerita terbaik tahun ini.' },
];
function kartuAlpha(t) { for (const c of KARTU) if (t >= c.a && t < c.b) return [c, ease(seg(t, c.a, c.a + 0.8)) * (1 - ease(seg(t, c.b - 0.6, c.b)))]; return [null, 0]; }
function hudSinema(hud, t) {
  hud.fillStyle = '#000'; hud.fillRect(0, 0, W, BAR); hud.fillRect(0, H - BAR, W, BAR);
  const [c, a] = kartuAlpha(t); if (!c || a <= 0) return;
  hud.save(); hud.globalAlpha = a; hud.textAlign = 'center'; hud.textBaseline = 'middle';
  const sc = 1 + (1 - a) * 0.06; hud.translate(W / 2, H / 2 - 30); hud.scale(sc, sc);
  hud.shadowColor = 'rgba(0,0,0,0.6)'; hud.shadowBlur = 18;
  const fs = c.l.some(s => s.length > 18) ? 50 : 66;
  hud.font = `700 ${fs}px Oswald`; hud.fillStyle = '#fff';
  c.l.forEach((s, i) => hud.fillText(s, 0, (i - (c.l.length - 1) / 2) * fs * 1.15));
  hud.fillStyle = '#f2c230'; hud.fillRect(-90, (c.l.length / 2) * fs * 1.15 + 6, 180, 5);
  if (c.sub) { hud.font = '600 30px Nunito'; hud.fillStyle = '#f3ede2'; hud.fillText(c.sub, 0, (c.l.length / 2) * fs * 1.15 + 58); }
  hud.restore();
}
function rec(hud, t) { // bingkai kamera HP saat merekam
  hud.save(); hud.strokeStyle = 'rgba(255,255,255,0.85)'; hud.lineWidth = 4; const m = H > W ? 60 : 110, y0 = BAR + 40, y1 = H - BAR - 40, L = 50;
  for (const [x, y, dx, dy] of [[m, y0, 1, 1], [W - m, y0, -1, 1], [m, y1, 1, -1], [W - m, y1, -1, -1]]) { hud.beginPath(); hud.moveTo(x, y + dy * L); hud.lineTo(x, y); hud.lineTo(x + dx * L, y); hud.stroke(); }
  if (Math.floor(t * 2) % 2 === 0) { hud.fillStyle = '#e74c3c'; hud.beginPath(); hud.arc(m + 26, y0 + 34, 11, 0, Math.PI * 2); hud.fill(); }
  hud.font = '700 30px Oswald'; hud.fillStyle = '#fff'; hud.textAlign = 'left'; hud.textBaseline = 'middle';
  const s = Math.floor(t - 33) + 12; hud.fillText(`REC 00:${String(s).padStart(2, '0')}`, m + 46, y0 + 35); hud.restore();
}

// ---------- pembungkus shot
const shots = [];
function shot(t0, t1, grade, build, o = {}) {
  shots.push({ t0, t1, grade, ...o, build(S) {
    const up = build(S) || (() => {});
    return (lt, k, t, hud) => {
      let g = up(lt, k, t, hud) || grade;
      if (W > H) { S.cam.fov *= 1.2; S.cam.updateProjectionMatrix(); } // landscape: bingkai sedikit lebih longgar (letterbox makan tinggi)
      hudSinema(hud, t);
      const [, a] = kartuAlpha(t); if (a > 0) g = mixGrade(g, { ...(typeof g === 'string' ? {} : g), overlayColor: [0, 0, 0], overlayAmt: 0.5, blur: 2.5 }, a);
      if (o.fadeOut && t1 - t < o.fadeOut) g = mixGrade(g, { overlayColor: [0, 0, 0], overlayAmt: 1 }, ease(1 - (t1 - t) / o.fadeOut));
      return g;
    };
  } });
}

// =====================================================================
// INTRO 0–16
// 1. POV: gelas plastik dibereskan
shot(0, 2.8, 'sore', (S) => {
  SETS.bazar(S.scene, { gabung: true, cooler: false });
  const mj = desk(1.8, 0.8, 0.92, '#e8e2d4'); S.add(mj, [0, 0, 2.0]);
  const cups = []; for (let i = 0; i < 10; i++) { const g = glass('#e9c08a'); S.add(g, [-0.7 + (i % 5) * 0.35, 0.92, 1.85 + Math.floor(i / 5) * 0.3]); cups.push(g); }
  const a = put(S, 'aldo', -0.3, 1.1, 0), gl = put(S, 'gelly', 0.6, 1.0, -0.2);
  return (lt, k, t) => {
    cups.forEach((c, i) => { const q = ease(seg(lt, 0.2 + i * 0.22, 0.5 + i * 0.22)); c.position.y = 0.92 + q * 0.6; c.scale.setScalar(Math.max(0.001, 1 - q)); });
    const r = Math.sin(lt * 7) * 0.25;
    a.act(combine(POSES.serahkan, { shR: [-1.1 + r, 0, 0.1], torsoX: 0.25, headX: 0.35 }), 'senyum', t);
    gl.act(combine(POSES.bawa, { torsoX: 0.2, headX: 0.3 }), 'senang', t, false, 3);
    S.camMove(k, { pos: [0.3, 1.9, 5.2], look: [0, 1.2, 1.6], fov: 44 }, { pos: [0.15, 1.8, 4.6], look: [0, 1.2, 1.6], fov: 42 });
  };
});
// 2. Spanduk kolaborasi digulung
shot(2.8, 5.4, 'sore', (S) => {
  SETS.bazar(S.scene, { gabung: true, cooler: false });
  for (const x of [-1.7, 1.7]) { const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), new THREE.MeshToonMaterial({ color: '#888' })); tiang.position.set(x, 1.6, 1.0); S.scene.add(tiang); }
  const sp = canvasPlane(3.2, 0.9, (c, w, h) => { c.fillStyle = '#2e8b57'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe066'; c.font = `bold ${h * 0.38}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KOLABORASI KELAS 11 x KELAS 12', w / 2, h / 2 + 3); });
  S.scene.add(sp);
  const rol = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 12), new THREE.MeshToonMaterial({ color: '#2e8b57' })); rol.rotation.z = Math.PI / 2; S.scene.add(rol);
  const g1 = put(S, 'gabriel', -2.0, 1.3, 0.3), g2 = put(S, 'dika', 2.0, 1.3, -0.3);
  return (lt, k, t) => {
    const q = ease(seg(lt, 0.3, 2.3)); const top = 3.0, hh = 0.9 * (1 - q) + 0.001;
    sp.scale.y = hh; sp.position.set(0, top - hh / 2, 1.0); rol.position.set(0, top - hh, 1.02);
    for (const c of [g1, g2]) c.act(combine(POSES.sorak, { shR: [-2.5, 0, -0.2], shL: [-2.5, 0, 0.2], headX: -0.3 }), 'senang', t);
    S.camMove(k, { pos: [0, 1.9, 12.5], look: [0, 2.1, 1], fov: 42 }, { pos: [0, 1.9, 11.5], look: [0, 2.3, 1], fov: 40 });
  };
});
// 3. Papan pengumuman sekolah
shot(5.4, 8.2, 'pagi', (S) => {
  SETS.gerbang(S.scene, {});
  const pp = new THREE.Group();
  const fr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.08), new THREE.MeshToonMaterial({ color: '#6b4a2f' })); pp.add(fr);
  const isi = canvasPlane(1.85, 1.25, (c, w, h) => {
    c.fillStyle = '#e9dcc0'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.save(); c.translate(w * 0.5, h * 0.55); c.rotate(-0.02); c.fillRect(-w * 0.4, -h * 0.36, w * 0.8, h * 0.72); c.restore();
    c.fillStyle = '#1f4e79'; c.fillRect(0, 0, w, h * 0.16); c.fillStyle = '#fff'; c.font = `bold ${h * 0.1}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PAPAN PENGUMUMAN SMAN 1 NYUATAN', w / 2, h * 0.08);
    c.fillStyle = '#c0392b'; c.font = `bold ${h * 0.085}px Oswald`; c.fillText('HADIAH MARKET DAY · KELAS 11 x 12', w / 2, h * 0.3);
    c.fillStyle = '#222'; c.font = `bold ${h * 0.11}px Oswald`; c.fillText('TUJUAN LIBURAN:', w / 2, h * 0.5);
    c.fillStyle = '#1f6fb2'; c.font = `bold ${h * 0.13}px Oswald`; c.fillText('PANTAI & AIR TERJUN', w / 2, h * 0.66);
    c.fillStyle = '#555'; c.font = `600 ${h * 0.06}px Nunito`; c.fillText('Berangkat Sabtu pagi · Kumpul di gerbang', w / 2, h * 0.8);
    for (const [x, y] of [[0.14, 0.22], [0.86, 0.22]]) { c.fillStyle = '#e74c3c'; c.beginPath(); c.arc(w * x, h * y, h * 0.025, 0, 7); c.fill(); }
  }, 768);
  isi.position.z = 0.045; pp.add(isi); pp.position.set(-4.2, 1.6, 0.3); S.scene.add(pp);
  return (lt, k) => S.camMove(k, { pos: [-4.0, 1.45, 3.2], look: [-4.2, 1.55, 0.3], fov: 40 }, { pos: [-4.15, 1.55, 2.7], look: [-4.2, 1.55, 0.3], fov: 38 }, easeIn);
});
// 4. Pak Agus melambai, bus berangkat (+ kartu judul)
shot(8.2, 16.0, 'pagi', (S) => {
  SETS.gerbangBus(S.scene, {});
  const b = S.scene.getObjectByName('busJalan'); b.position.z = 5.4;
  const ag = put(S, CAST.agus(), 1.3, 1.8, -0.35);
  const ss = [put(S, 'palsya', -1.6, 1.2, -0.2), put(S, 'naura', -0.6, 0.6, 0.1)];
  return (lt, k, t) => {
    b.position.x = -1 + easeIn(seg(lt, 0.6, 5.0)) * 22;
    ag.act(combine(POSES.lambai, { shR: [-2.7, 0, -0.25 + Math.sin(t * 7) * 0.35] }), 'senang', t);
    ss.forEach((c, i) => c.act(combine(POSES.lambai, { shR: [-2.6, 0, -0.2 + Math.sin(t * 6 + i) * 0.3] }), 'senyum', t, false, i));
    S.camMove(k, { pos: [-1.2, 1.5, 11.5], look: [0.4, 1.7, 1.5], fov: 40 }, { pos: [-0.5, 3.6, 12.5], look: [0.4, 2.4, 0], fov: 44 });
  };
});

// =====================================================================
// VERSE 1 — di dalam bus 16–48
const DUDUK_BUS = [
  ['stefan', -1.7, 4.65], ['rialdi', -0.6, 4.65], ['aldo', 0.6, 4.65], ['febri', 1.7, 4.65],
  ['gelly', -1.9, 3.1], ['gabriel', -1.0, 3.1], ['nava', 1.0, 3.1], ['dika', 1.9, 3.1],
  ['aulia', -1.9, 1.5], ['sera', -1.0, 1.5], ['mila', 1.0, 1.5], ['palsya', 1.9, 1.5],
  ['elisabeth', -1.9, -0.1], ['manohara', -1.0, -0.1], ['kharan', 1.0, -0.1], ['justin', 1.9, -0.1],
  ['dayinta', -1.9, -1.7], ['septi', -1.0, -1.7], ['nikita', 1.0, -1.7], ['naura', 1.9, -1.7],
  ['sisil', -1.9, -3.3], ['aldos', 1.9, -3.3],
];
function busScene(S, o = {}) {
  SETS.busDalam(S.scene, {});
  const C = {};
  for (const [k, x, z] of DUDUK_BUS) { if (o.skip?.includes(k)) continue; C[k] = put(S, k, x, z, Math.PI); }
  pasangGitar(C.stefan); pasangGitar(C.febri);
  const film = {};
  if (o.film !== false) { film.hissari = put(S, 'hissari', -0.25, -1.2, 0); film.misel = put(S, 'misel', 0.35, -1.9, 0.15);
    for (const c of Object.values(film)) { const ph = phone(); ph.draw(x => { x.fillStyle = '#3a4a5a'; x.fillRect(0, 0, 400, 800); }); pegang(c, ph, [0, -0.12, 0.1], [0, 0, Math.PI]); } }
  const ger = S.scene.getObjectByName('gerak');
  const anim = (t) => {
    ger.position.z = (t * 9) % 40;
    for (const [k, c] of Object.entries(C)) {
      const sd = k.length * 1.3;
      if (k === 'stefan' || k === 'febri') c.act(combine(POSES.gitar, { elR: -1.2 + Math.sin(t * 13 + sd) * 0.28 }, angguk(t, sd)), 'senang', t, false, sd);
      else if (k === 'rialdi' || k === 'aldo') c.act(combine(POSES.duduk, tepuk(t, sd * 0.1), angguk(t, sd, 0.1)), 'senang', t, true, sd);
      else if ((k.charCodeAt(0) + k.length) % 3 === 0) c.act(combine(POSES.duduk, POSES.sorak, { shR: [-2.8, 0, -0.3 + Math.sin(t * 6.4 + sd) * 0.2] }), 'senang', t, false, sd);
      else c.act(combine(POSES.duduk, tepuk(t, sd * 0.2), angguk(t, sd)), (k.length % 2) ? 'senang' : 'senyum', t, k.length % 3 === 0, sd);
    }
    for (const [k, c] of Object.entries(film)) c.act(combine(POSES.hpAngkat, { shR: [-1.35, 0, 0.15], elR: -1.0, headX: 0.05 }, angguk(t, k.length, 0.04)), 'senang', t, false, k.length);
  };
  return { C, film, anim };
}
const goyang = (t) => [Math.sin(t * 9) * 0.012, Math.sin(t * 13) * 0.01];
// 5. Lebar: lorong bus dari depan
shot(16.0, 21.4, 'pagi', (S) => { const B = busScene(S, { film: false }); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [gx, 2.7 + gy, -6.8], look: [0, 1.4, 4], fov: 52 }, { pos: [gx, 2.6 + gy, -5.6], look: [0, 1.4, 4], fov: 50 }); }; });
// 6. Stefan & Febri main gitar di kursi belakang (pan)
shot(21.4, 25.2, 'pagi', (S) => { const B = busScene(S, { film: false, skip: W > H ? ['gabriel', 'nava'] : [] }); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [0.1 + gx, 2.55 + gy, 2.0], look: [-1.25, 1.3, 4.7], fov: 54 }, { pos: [-0.1 + gx, 2.55 + gy, 2.0], look: [1.25, 1.3, 4.7], fov: 54 }); }; });
// 7. Rialdi menyanyi, 8. Aldo bertepuk
shot(25.2, 27.0, 'pagi', (S) => { const B = busScene(S, { film: false, skip: W > H ? ['gabriel', 'nava'] : [] }); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [0.15 + gx, 1.7 + gy, 2.6], look: [-0.6, 1.65, 4.65], fov: 50 }, { pos: [0.1 + gx, 1.7 + gy, 2.85], look: [-0.6, 1.65, 4.65], fov: 46 }); }; });
shot(27.0, 28.9, 'pagi', (S) => { const B = busScene(S, { film: false, skip: W > H ? ['gabriel', 'nava'] : [] }); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [-0.15 + gx, 1.7 + gy, 2.6], look: [0.6, 1.6, 4.65], fov: 50 }, { pos: [-0.1 + gx, 1.72 + gy, 2.85], look: [0.6, 1.6, 4.65], fov: 46 }); }; });
// 9. Hissari & Misel merekam di lorong (dari belakang)
shot(28.9, 33.0, 'pagi', (S) => { const B = busScene(S); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [0.7 + gx, 2.75 + gy, -5.6], look: [0, 1.5, 2.5], fov: 50 }, { pos: [0.4 + gx, 2.7 + gy, -5.0], look: [0, 1.5, 2.5], fov: 48 }); }; });
// 10. POV kamera HP: merekam teman-teman
shot(33.0, 37.0, 'pagi', (S) => { const B = busScene(S, { film: false }); return (lt, k, t, hud) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [-0.2 + gx * 2, 1.75 + gy * 2, -1.6], look: [-0.8, 1.4, 4], fov: 56 }, { pos: [0.2 + gx * 2, 1.75 + gy * 2, -1.2], look: [0.9, 1.4, 4], fov: 52 });
  rec(hud, t); return mixGrade('pagi', { sat: 1.05, contrast: 1.05, grain: 0.05 }, 0.5); }; });
// 11. Wajah ceria Aulia & Sera, pohon lewat di jendela
shot(37.0, 42.0, 'pagi', (S) => { const B = busScene(S, { film: false }); return (lt, k, t) => { B.anim(t); const [gx, gy] = goyang(t);
  S.camMove(k, { pos: [0.35 + gx, 1.7 + gy, 0.2], look: [-1.6, 1.55, 1.6], fov: 40 }, { pos: [0.45 + gx, 1.65 + gy, 0.5], look: [-1.5, 1.55, 1.6], fov: 37 }); }; });
// 12. Bus melaju di jalan pepohonan (luar)
shot(42.0, 48.0, 'pagi', (S) => {
  SETS.jalan(S.scene, {}); const b = bus(); b.position.set(0, 0, 0.9); S.scene.add(b);
  const ger = S.scene.getObjectByName('gerak');
  return (lt, k, t) => { ger.position.x = -((t * 12) % 40); b.position.y = Math.abs(Math.sin(t * 8)) * 0.02;
    S.camMove(k, { pos: [12, 2.6, 17], look: [0, 1.6, 0.9], fov: 40 }, { pos: [-3, 9, 19], look: [0, 1.4, 0.9], fov: 42 }); };
});

// =====================================================================
// CHORUS 1 — pantai 48–80
function pantaiScene(S, o = {}) {
  SETS.pantai(S.scene, {});
  if (o.bus !== false) { const b = bus(); b.position.set(-2, 0, 7); b.rotation.y = Math.PI; S.scene.add(b); }
  const omb = S.scene.getObjectByName('ombak');
  return (t) => { omb.children.forEach((w, i) => { w.position.z = -4.5 - i * 1.6 + Math.sin(t * 1.3 + i) * 0.45; w.scale.y = 1; }); };
}
// 13. Pintu bus terbuka (slow motion), semua turun
shot(48.0, 53.0, 'pantai', (S) => {
  const anim = pantaiScene(S);
  const pintu = S.scene.getObjectByName('pintuBus');
  const keluar = ['aldo', 'hissari', 'gelly', 'rialdi', 'misel'].map((k, i) => ({ c: put(S, k, -6, 5.6, Math.PI), d: 0.8 + i * 0.75, x: -6 + (i % 2 ? 0.6 : -0.5) }));
  return (lt, k, t) => { anim(t);
    pintu.position.x = 4.0 - ease(seg(lt, 0.1, 1.0)) * 0.95;
    for (const e of keluar) { const q = lt - e.d; const c = e.c;
      if (q < 0) { c.root.visible = false; continue; } c.root.visible = true;
      c.root.position.set(lerp(-6, e.x, clamp(q / 2)), 0, 5.6 - q * 0.75); c.act(combine(walkPose(q * 0.55, 1, true), { headX: -0.1 }), 'senang', t); }
    S.camMove(k, { pos: [-2.6, 1.3, -1.8], look: [-6, 1.6, 4.6], fov: 46 }, { pos: [-2.9, 1.3, -1.0], look: [-6, 1.6, 4.4], fov: 44 });
  };
});
// 14. Berlari ke bibir pantai (slow motion)
const LARI = ['aldo', 'gelly', 'hissari', 'misel', 'rialdi', 'aulia', 'nava', 'stefan', 'febri', 'justin', 'kharan', 'septi'];
shot(53.0, 57.0, 'pantai', (S) => {
  const anim = pantaiScene(S);
  const L = LARI.map((k, i) => ({ c: put(S, k, -4 + (i % 6) * 1.4 + (i > 5 ? 0.7 : 0), 9 + Math.floor(i / 6) * 1.6 + (i % 3) * 0.4, Math.PI), sd: i }));
  return (lt, k, t) => { anim(t);
    for (const e of L) { e.c.root.position.z = 9 + Math.floor(e.sd / 6) * 1.6 + (e.sd % 3) * 0.4 - lt * 1.9; e.c.act(combine(walkPose(lt * 0.5 + e.sd * 0.3, 1, true), e.sd % 4 === 0 ? { shR: [-2.8, 0, -0.3] } : {}), 'senang', t, e.sd % 3 === 0, e.sd); }
    S.camMove(k, { pos: [0, 1.1, -3.4], look: [-0.5, 1.3, 6], fov: 46 }, { pos: [0, 1.2, -3.0], look: [-0.5, 1.3, 5], fov: 44 });
  };
});
// 15. Dika & Gabriel balapan ke ombak
shot(57.0, 61.5, 'pantai', (S) => {
  const anim = pantaiScene(S, { bus: false });
  const dk = put(S, 'dika', -0.5, 2.5, Math.PI), gb = put(S, 'gabriel', 0.6, 2.8, Math.PI);
  const cip = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: '#f2fbff' })); m.userData.outlineParameters = { visible: false }; S.scene.add(m); cip.push(m); }
  return (lt, k, t) => { anim(t);
    const zs = [2.5 - lt * 2.0, 2.8 - lt * 1.9];
    [dk, gb].forEach((c, i) => { const z = zs[i]; const dalam = clamp((-4 - z) / 2); c.root.position.z = z; c.root.position.y = -dalam * 0.45;
      c.act(combine(walkPose(t * (1 - dalam * 0.4) + i, 1.1, true), i ? {} : { shR: [-2.8, 0, -0.3] }), 'senang', t, true, i); });
    cip.forEach((m, j) => { const c = j % 2 ? dk : gb; const ph = (t * 2 + j * 0.37) % 1; const on = c.root.position.z < -3.8;
      m.visible = on; m.position.set(c.root.position.x + Math.sin(j * 2.1) * 0.6 * ph, 0.1 + Math.sin(ph * Math.PI) * 0.9, c.root.position.z + Math.cos(j * 1.7) * 0.5 * ph); });
    const zm = (zs[0] + zs[1]) / 2;
    setCam(S, [4.6, 1.5, zm + 1.6], [0, 1.1, zm - 0.6], 42);
  };
});
// 16. Sera, Mila & Aulia membentangkan spanduk
shot(61.5, 66.0, 'pantai', (S) => {
  const anim = pantaiScene(S, { bus: false });
  const sp = canvasPlane(3.6, 0.85, (c, w, h) => { c.fillStyle = '#8e44ad'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffe066'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#ffe066'; c.font = `bold ${h * 0.42}px Oswald`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TEAM ES TEH BOBA SULTAN', w / 2, h / 2 + 3); }, 768);
  sp.position.set(0, 1.6, -1.2); S.scene.add(sp);
  const se = put(S, 'sera', -0.4, -1.6, 0), mi = put(S, 'mila', 0, -1.7, 0), au = put(S, 'aulia', 0.4, -1.6, 0);
  const pen = ['aldo', 'gelly', 'dika', 'hissari'].map((k, i) => put(S, k, -2.6 + i * 1.7 + (i > 1 ? 0.9 : 0), -2.6, 0));
  return (lt, k, t) => { anim(t);
    const q = ease(seg(lt, 0.3, 2.2)); sp.scale.x = 0.05 + 0.95 * q;
    se.root.position.x = -0.4 - q * 1.45; au.root.position.x = 0.4 + q * 1.45;
    for (const c of [se, mi, au]) c.act(combine(POSES.sorak, { shR: [-2.0, 0, -0.3], shL: [-2.0, 0, 0.3], elR: -0.5, elL: -0.5, headX: 0 }), 'senang', t, lt > 2.4, c === mi ? 1 : 2);
    pen.forEach((c, i) => c.act(combine(POSES.sorak, { shR: [-2.8, 0, -0.3 + Math.sin(t * 6 + i) * 0.3] }), 'senang', t, false, i));
    S.camMove(k, { pos: [0, 1.9, 10.5], look: [0, 1.6, -1.3], fov: 40 }, { pos: [0, 1.8, 9.4], look: [0, 1.6, -1.3], fov: 40 });
  };
});
// 17. Drone mengitari lingkaran besar di pasir (+ kartu judul)
const SEMUA = ['aldo', 'dika', 'gelly', 'mila', 'hissari', 'rialdi', 'misel', 'sera', 'stefan', 'palsya', 'febri', 'aulia', 'gabriel', 'nava', 'kharan', 'elisabeth', 'justin', 'manohara', 'dayinta', 'septi', 'nikita', 'naura', 'sisil', 'aldos'];
shot(66.0, 80.0, 'pantai', (S) => {
  const anim = pantaiScene(S); const n = 18, R = 3.4, cz = 2;
  const L = SEMUA.slice(0, n).map((k, i) => { const a = i / n * Math.PI * 2; const c = put(S, k, Math.sin(a) * R, cz + Math.cos(a) * R); face(c, 0, cz); return c; });
  return (lt, k, t) => { anim(t);
    L.forEach((c, i) => c.act(combine(PEGANG, { torsoZ: Math.sin(t * Math.PI * BEAT * 0.5) * 0.08, shR: [-0.15 - (Math.sin(t * Math.PI * BEAT) > 0.6 ? 1.0 : 0), 0, -0.55], shL: [-0.15 - (Math.sin(t * Math.PI * BEAT) > 0.6 ? 1.0 : 0), 0, 0.55] }), 'senang', t, false, i));
    const a = 0.4 + lt * 0.16, r = 10 + lt * 0.25, h = 8 + lt * 0.45;
    setCam(S, [Math.sin(a) * r, h, cz + Math.cos(a) * r], [0, 0.6, cz], 44);
  };
});

// =====================================================================
// VERSE 2 + BRIDGE — kemah dekat air terjun, golden hour 80–144
function kemahScene(S) {
  SETS.kemah(S.scene, {});
  const C = {};
  // tim pemanggang
  C.nava = put(S, 'nava', 2.5, -0.75); face(C.nava, 3.2, 0.2);
  C.rialdi = put(S, 'rialdi', 3.95, -0.7); face(C.rialdi, 3.2, 0.2);
  const kipas = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.02), new THREE.MeshToonMaterial({ color: '#c0392b' })); pegang(C.nava, kipas, [0, -0.25, 0.05]);
  // lingkaran minuman dingin
  const cx = -2.3, cz = -1.0;
  ['elisabeth', 'manohara', 'kharan', 'justin'].forEach((k, i) => { const a = i / 4 * Math.PI * 2 + 0.6; C[k] = put(S, k, cx + Math.sin(a) * 0.95, cz + Math.cos(a) * 0.95); face(C[k], cx, cz); pegang(C[k], glass('#e0a65a'), [0, -0.2, 0.06]); });
  const cool = new THREE.Group(); cool.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), new THREE.MeshToonMaterial({ color: '#2d7dd2' }))); cool.children[0].position.y = 0.2; cool.position.set(cx, 0, cz); S.scene.add(cool);
  // gitar di batang kayu
  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.6, 10), new THREE.MeshToonMaterial({ color: '#7a5235' })); log.rotation.z = Math.PI / 2; log.position.set(-5.6, 0.25, 1.6); S.scene.add(log);
  C.stefan = put(S, 'stefan', -6.2, 1.55, 0); pasangGitar(C.stefan); C.febri = put(S, 'febri', -5.0, 1.55, 0);
  // berdiri dekat tenda
  C.aldo = put(S, 'aldo', -0.9, 3.9, Math.PI / 2); C.dika = put(S, 'dika', 0.2, 3.9, -Math.PI / 2);
  C.gelly = put(S, 'gelly', -3.6, 3.4, 0.6); C.palsya = put(S, 'palsya', -2.8, 3.5, -0.6);
  C.hissari = put(S, 'hissari', -0.5, -3.4, 0.3); C.misel = put(S, 'misel', 0.4, -3.6, -0.3);
  // di kolam air terjun
  C.gabriel = put(S, 'gabriel', 1.2, -10.4, 0.3); C.dk2 = put(S, 'aulia', 3.0, -10.8, -0.4); C.sera = put(S, 'sera', 2.0, -9.6, 0);
  for (const k of ['gabriel', 'dk2', 'sera']) C[k].root.position.y = -0.35;
  // asap panggangan
  const asap = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#e8e4de', transparent: true, opacity: 0.35, depthWrite: false })); m.userData.outlineParameters = { visible: false }; S.scene.add(m); asap.push(m); }
  const af = S.scene.getObjectByName('airTerjun');
  const anim = (t, o = {}) => {
    af.material.map.offset.y = t * 0.9;
    const tiup = o.tiup ? o.tiup(t) : 0;
    asap.forEach((m, i) => { const ph = (t * 0.45 + i / asap.length) % 1; m.position.set(3.2 + Math.sin(i * 3.1) * 0.2 - ph * (0.3 + tiup * 0.5), 1.0 + ph * (1.8 - tiup * 1.0), 0.2 - ph * (0.2 + tiup * 0.9)); m.scale.setScalar(0.6 + ph * 1.6); m.material.opacity = 0.4 * (1 - ph); });
    const kp = Math.sin(t * 16) * 0.35;
    const batuk = tiup > 0.5;
    C.nava.act(combine(POSES.kipas, { shR: [-1.2, 0, 0.2 + kp], headX: batuk ? -0.2 : 0.15, torsoX: batuk ? -0.15 : 0.05 }), batuk ? 'senang' : 'senyum', t, batuk, 1);
    C.rialdi.act(combine(batuk ? { shR: [-1.6, 0, 0.5], elR: -2.2, headX: -0.15, torsoX: -0.2 } : POSES.pinggang), batuk ? 'senang' : 'senyum', t, batuk, 2);
    ['elisabeth', 'manohara', 'kharan', 'justin'].forEach((k, i) => { const cheers = o.cheers ? o.cheers(t) : 0;
      C[k].act(combine(DUDUK_TANAH, cheers > 0 ? { shR: [-1.3 - cheers * 0.6, 0, 0.1], elR: -0.4 } : ((t + i) % 4 < 1.2 ? POSES.minum : { shR: [-0.6, 0, 0.35], elR: -1.0 }), { headX: 0.05 }), 'senang', t, (t * 0.5 + i) % 3 < 1, i); });
    C.stefan.act(combine(POSES.gitar, { hipsY: 0.45, elR: -1.2 + Math.sin(t * 9) * 0.25 }), 'senyum', t, false, 5);
    C.febri.act(combine(POSES.duduk, { hipsY: 0.45 }, tepuk(t * 0.5, 1), angguk(t, 1)), 'senang', t, true, 6);
    const sal = o.salaman ? o.salaman(t) : 0;
    C.aldo.act(sal > 0 ? combine(POSES.jabat, { shR: [-1.1 + Math.sin(t * 9) * 0.12 * (sal < 1 ? 1 : 0), 0, 0.15] }) : POSES.berdiri, 'senang', t, false, 7);
    C.dika.act(sal > 0 ? combine(POSES.jabat, { shR: [-1.1 + Math.sin(t * 9) * 0.12 * (sal < 1 ? 1 : 0), 0, 0.15] }) : POSES.berdiri, 'senang', t, sal > 0, 8);
    C.gelly.act(POSES.berdiri, 'senang', t, false, 9); C.palsya.act(sal > 0 ? POSES.tepukBahu : POSES.berdiri, 'senyum', t, true, 10);
    C.hissari.act(POSES.berdiri, 'senyum', t, true, 11); C.misel.act(POSES.minum, 'senang', t, false, 12);
    ['gabriel', 'dk2', 'sera'].forEach((k, i) => C[k].act(combine(POSES.sorak, { shR: [-1.6 + Math.sin(t * 5 + i) * 0.9, 0, -0.4], shL: [-1.6 - Math.sin(t * 5 + i) * 0.9, 0, 0.4] }), 'senang', t, true, 13 + i));
  };
  return { C, anim };
}
const tiupAsap = (a) => (t) => ease(seg(t, a, a + 0.8)) * (1 - ease(seg(t, a + 3.2, a + 4.2)));
// 18. Establishing kemah senja
shot(80.0, 86.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t);
  S.camMove(k, { pos: [-8, 2.6, 9], look: [0.5, 2.2, -6], fov: 44 }, { pos: [-5.5, 2.2, 7.5], look: [0.5, 2.0, -6], fov: 42 }); }; });
// 19. Nava & Rialdi mengipas panggangan, asap menyerbu wajah
shot(86.0, 93.0, 'senja', (S) => { const K = kemahScene(S); const ti = tiupAsap(89.6); return (lt, k, t) => { K.anim(t, { tiup: ti });
  S.camMove(k, { pos: [3.3, 2.3, 5.8], look: [3.2, 1.4, -0.4], fov: 40 }, { pos: [3.2, 2.2, 5.0], look: [3.2, 1.45, -0.4], fov: 40 }); }; });
// 20. Dekat: tertawa dalam asap
shot(93.0, 99.0, 'senja', (S) => { const K = kemahScene(S); const ti = tiupAsap(93.4); return (lt, k, t) => { K.anim(t, { tiup: ti });
  S.camMove(k, { pos: [2.6, 2.1, 3.4], look: [3.0, 1.8, -0.7], fov: 42 }, { pos: [3.0, 2.05, 3.0], look: [3.6, 1.8, -0.7], fov: 40 }); }; });
// 21. Lingkaran minuman dingin + bersulang
shot(99.0, 106.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t, { cheers: (tt) => ease(seg(tt, 102.5, 103.0)) * (1 - ease(seg(tt, 104.6, 105.2))) });
  const a = 0.2 + lt * 0.05; setCam(S, [-2.3 + Math.sin(a) * 4.6, 3.4 - lt * 0.08, -1.0 + Math.cos(a) * 4.6], [-2.3, 0.8, -1.0], 50); }; });
// 22. Wajah hangat diterpa matahari terbenam
shot(106.0, 112.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t);
  S.camMove(k, { pos: [0.0, 1.9, 1.6], look: [-0.05, 1.7, -3.5], fov: 40 }, { pos: [0.0, 1.85, 0.9], look: [-0.05, 1.7, -3.5], fov: 40 }); }; });
// 23. Air terjun: main air di kolam
shot(112.0, 120.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t);
  S.camMove(k, { pos: [-0.5, 1.8, -3.5], look: [2, 2.8, -12], fov: 46 }, { pos: [0.2, 1.4, -5.5], look: [2, 2.0, -11], fov: 44 }); }; });
// 24. Stefan bermain gitar, Febri ikut bernyanyi
shot(120.0, 128.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t);
  S.camMove(k, { pos: [-5.6, 1.7, 6.2], look: [-5.6, 1.2, 1.5], fov: 40 }, { pos: [-5.3, 1.65, 5.4], look: [-5.6, 1.2, 1.5], fov: 38 }); }; });
// 25. Dua kelas bersatu: Aldo (11) & Dika (12) berjabat tangan
shot(128.0, 136.0, 'senja', (S) => { const K = kemahScene(S); return (lt, k, t) => { K.anim(t, { salaman: (tt) => ease(seg(tt, 129.0, 129.6)) });
  S.camMove(k, { pos: [-0.35, 1.8, 8.8], look: [-0.35, 1.5, 3.9], fov: 40 }, { pos: [-0.35, 1.7, 8.0], look: [-0.35, 1.5, 3.9], fov: 38 }); }; });
// 26. Siluet menatap matahari terbenam
shot(136.0, 144.0, 'senja', (S) => {
  SETS.kemah(S.scene, {});
  const L = SEMUA.slice(0, 12).map((k, i) => put(S, k, 0, -3.6 + i * 0.85 + (i > 5 ? 0.6 : 0), -Math.PI / 2));
  return (lt, k, t) => { L.forEach((c, i) => c.act(i % 3 === 0 ? combine(POSES.sorak, { shR: [-2.8, 0, -0.3 + Math.sin(t * 3 + i) * 0.15] }) : RANGKUL, 'senang', t, false, i));
    S.camMove(k, { pos: [7.5, 1.3, 1.2], look: [-10, 2.2, 0.4], fov: 44 }, { pos: [5.5, 1.5, 0.8], look: [-10, 2.4, 0.4], fov: 42 });
    return mixGrade('senja', { sat: 1.2, bright: -0.06, contrast: 1.15, tint: [1.25, 0.9, 0.7] }, 0.6); };
}, { fadeOut: 1.4 });

// =====================================================================
// FINAL CHORUS & OUTRO — api unggun malam 144–akhir
function unggunScene(S, o = {}) {
  SETS.apiUnggun(S.scene, {});
  const nyala = S.scene.getObjectByName('nyala'), cah = S.scene.getObjectByName('cahayaApi'), pc = S.scene.userData.percik;
  const anim = (t) => {
    nyala.children.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 11 + i) * 0.12, 1 + Math.sin(t * 13.7 + i * 2) * 0.22, 1 + Math.sin(t * 9 + i) * 0.12); f.rotation.y = t * (0.5 + i * 0.2); });
    cah.intensity = 14 + Math.sin(t * 17) * 2.2 + Math.sin(t * 7.3) * 1.6;
    pc.forEach((p, i) => { const ph = (t * 0.35 + i / pc.length) % 1; p.position.set(Math.sin(i * 2.3 + t * 0.7) * (0.2 + ph * 0.9), 0.9 + ph * 5.5, Math.cos(i * 1.7 + t * 0.6) * (0.2 + ph * 0.7)); p.scale.setScalar(1 - ph * 0.8); });
  };
  return anim;
}
function lingkarDuduk(S, skip = []) { // duduk mengelilingi api, celah di sisi +z untuk kamera
  const keys = SEMUA.filter(k => !skip.includes(k)).slice(0, 16); const C = {};
  keys.forEach((k, i) => { const a = Math.PI * 0.32 + i / (keys.length - 1) * Math.PI * 1.36; C[k] = put(S, k, Math.sin(a) * 2.9, Math.cos(a) * 2.9); face(C[k], 0, 0); });
  return C;
}
// 27. Api unggun, percikan naik ke langit berbintang
shot(144.0, 151.0, 'unggun', (S) => { const an = unggunScene(S); const C = lingkarDuduk(S); return (lt, k, t) => { an(t);
  Object.values(C).forEach((c, i) => c.act(combine(DUDUK_TANAH, angguk(t, i, 0.04)), 'senyum', t, false, i));
  S.camMove(k, { pos: [0, 0.75, 3.0], look: [0, 0.8, 0], fov: 44 }, { pos: [0, 1.0, 3.4], look: [0, 6.5, -8], fov: 50 }); }; });
// 28. Rialdi bernyanyi dengan botol air sebagai mikrofon
shot(151.0, 159.0, 'unggun', (S) => { const an = unggunScene(S); const C = lingkarDuduk(S, ['rialdi']);
  const r = put(S, 'rialdi', 0, -2.4, 0); pegang(r, botol(), [0, -0.12, 0.08], [-0.3, 0, 0]);
  return (lt, k, t) => { an(t);
    r.act(combine(POSES.mic, { torsoZ: Math.sin(t * Math.PI * BEAT * 0.5) * 0.12, shL: [-2.2 + Math.sin(t * 4) * 0.3, 0, 0.6], headX: -0.2 }), 'senang', t, true, 3);
    Object.values(C).forEach((c, i) => c.act(combine(DUDUK_TANAH, i % 2 ? tepuk(t, i) : { torsoX: -0.15 + Math.sin(t * 7 + i) * 0.06 }), 'senang', t, i % 2 === 0, i));
    S.camMove(k, { pos: [0.3, 1.45, 3.9], look: [0, 1.7, -2.4], fov: 36 }, { pos: [0.1, 1.55, 2.8], look: [0, 1.85, -2.4], fov: 34 }); }; });
// 29–30. Reaksi tertawa
shot(159.0, 162.2, 'unggun', (S) => { const an = unggunScene(S); const C = lingkarDuduk(S); return (lt, k, t) => { an(t);
  Object.values(C).forEach((c, i) => c.act(combine(DUDUK_TANAH, tepuk(t, i), { torsoX: -0.12 }), 'senang', t, true, i));
  const a = C.aldo.root.position, g = C.dika.root.position; const m = [(a.x + g.x) / 2, 1.0, (a.z + g.z) / 2];
  S.camMove(k, { pos: [m[0] * -0.05, 1.8, m[2] * -0.05], look: m, fov: 44 }, { pos: [m[0] * 0.08, 1.75, m[2] * 0.08], look: m, fov: 42 }); }; });
shot(162.2, 165.3, 'unggun', (S) => { const an = unggunScene(S); const C = lingkarDuduk(S); return (lt, k, t) => { an(t);
  Object.values(C).forEach((c, i) => c.act(combine(DUDUK_TANAH, i % 2 ? tepuk(t, i) : { torsoX: -0.2 + Math.sin(t * 8 + i) * 0.08 }), 'senang', t, true, i));
  const a = C.hissari.root.position, g = C.misel.root.position; const m = [(a.x + g.x) / 2, 1.0, (a.z + g.z) / 2];
  S.camMove(k, { pos: [m[0] * -0.05, 1.8, m[2] * -0.05], look: m, fov: 44 }, { pos: [m[0] * 0.08, 1.75, m[2] * 0.08], look: m, fov: 42 }); }; });
// 31. Semua berangkulan menghadap api, kamera mundur (+ judul akhir)
shot(165.3, 178.5, 'unggun', (S) => { const an = unggunScene(S);
  const n = 22, R = 3.3; const L = SEMUA.slice(0, n).map((k, i) => { const a = i / n * Math.PI * 2; const c = put(S, k, Math.sin(a) * R, Math.cos(a) * R); face(c, 0, 0); return c; });
  return (lt, k, t) => { an(t);
    L.forEach((c, i) => c.act(combine(RANGKUL, { torsoZ: Math.sin(t * Math.PI * BEAT * 0.5) * 0.1 }), 'senang', t, lt < 6, i));
    S.camMove(k, { pos: [0, 2.7, 7.0], look: [0, 1.3, 0], fov: 44 }, { pos: [0, 9.5, 15], look: [0, 0.6, 0], fov: 46 }); }; }, { fadeOut: 2.0 });

export { shots };
export const meta = { title: ['ES TEH BOBA SULTAN', 'LIBURAN BERSAMA'] };
