// Penyusun shot otomatis: lokasi + slot tokoh + sudut kamera yang dihitung (bebas tabrakan kepala).
// Dipakai oleh episode hasil tools/naskah_ke_episode.py. Lihat engine/README.md bagian "Jalur hemat".
import * as THREE from 'three';
import { CAST, santai, TOKOH } from './cast.js';
import { SETS, phone, piala, kalengCat, helm, glass, gitar, mikrofon, pasangGitar, gitarListrik, stik, ampli, syal } from './sets.js';
import { hud as HUD } from './core.js';
import { POSES, combine, addPose, idle, mixPose, walkPose } from './char.js';
import { ease, lerp, GRADES as GRADES_REF } from './core.js';
import { drawChat, drawLock, drawBanner, avatar, statusBar } from './phoneui.js';
import { phoneInsert } from './shots.js';

// ---------- lokasi: slot tokoh [x, z, rotY, duduk?], batas kamera, grade bawaan
const MOTOR_SLOT = { motor1Depan: { motor: 'motor1', lx: 0.05, ly: 0.5, pose: 'naik' }, motor1Belakang: { motor: 'motor1', lx: -0.5, ly: 0.55, pose: 'bonceng' },
  motor2Depan: { motor: 'motor2', lx: 0.05, ly: 0.5, pose: 'naik' }, motor2Belakang: { motor: 'motor2', lx: -0.5, ly: 0.55, pose: 'bonceng' } };
export const LOKASI = {
  rumah: { set: 'rumah', grade: 'malam', bounds: [-5.6, 5.6, -5.1, 5.1],
    slot: { meja: [0, 1.0, Math.PI, true], dudukKiri: [0, 1.0, Math.PI, true], kiriMeja: [-1.25, 0, Math.PI / 2, true], kananMeja: [1.25, 0, -Math.PI / 2, true], seberang: [0, -1.0, 0, true], dapur: [2.0, -4.1, Math.PI * 0.1, false], dekatMeja: [1.6, 0.2, -Math.PI / 2, false] } },
  kelas: { set: 'kelas', grade: 'pagi', bounds: [-6.1, 6.1, -5.6, 5.6], center: [0, -4.4], seats: [[-0.47, -1.45], [0.47, -1.45], [-0.47, 0.85], [0.47, 0.85], [2.73, -1.45], [3.67, -1.45], [-3.67, -1.45], [-2.73, -1.45], [2.73, 0.85], [3.67, 0.85], [-3.67, 0.85], [-2.73, 0.85], [-0.47, 3.15], [0.47, 3.15], [2.73, 3.15], [3.67, 3.15], [-3.67, 3.15], [-2.73, 3.15]],
    slot: { dudukKiri: [-0.47, -1.45, Math.PI, true], dudukKanan: [0.47, -1.45, Math.PI, true], depanMeja: [-0.2, -3.4, 0, false], guruDepan: [1.7, -4.3, -0.35, false], lorong: [1.6, -1.45, -Math.PI / 2, false] } },
  kamar: { set: 'kamar', grade: 'malam', bounds: [-4.1, 4.1, -3.6, 3.6], slot: { mejaBelajar: [-1.5, -2.45, Math.PI, true], kasur: [2.4, -0.2, Math.PI, false], pinggirKasur: [1.5, -1.3, -Math.PI / 2, true, 0.12] } },
  jalanAspal: { set: 'jalan', setOpts: { speed: 9, motors: [[0, 1.2, '#c0392b', 'motor1'], [0, -1.2, '#2980b9', 'motor2']] }, grade: 'pagi', bounds: [-30, 30, -20, 20], slot: MOTOR_SLOT },
  jalanTanah: { set: 'jalan', setOpts: { speed: 5, tanah: true, kelapa: true, motors: [[0, 1.2, '#c0392b', 'motor1'], [0, -1.2, '#2980b9', 'motor2']] }, grade: 'pagi', bounds: [-30, 30, -20, 20], slot: MOTOR_SLOT },
  jalanBerhenti: { set: 'jalan', setOpts: { speed: 0, tanah: true, kelapa: true, motors: [[0, 1.2, '#c0392b', 'motor1'], [0, -1.2, '#2980b9', 'motor2']] }, grade: 'pagi', bounds: [-30, 30, -20, 20], kempis: true,
    slot: { ...MOTOR_SLOT, jongkokBan: [-0.75, 2.05, Math.PI, false], dekat1: [1.4, 2.4, -Math.PI * 0.8, false], dekat2: [-1.8, 2.6, Math.PI * 0.8, false], dekat3: [0.4, 3.2, Math.PI, false] } },
  jalanMendung: { set: 'jalan', setOpts: { speed: 0, tanah: true, kelapa: true, hujan: true, motors: [[0, 1.2, '#c0392b', 'motor1'], [0, -1.2, '#2980b9', 'motor2']] }, grade: 'hujan', bounds: [-30, 30, -20, 20], kempis: true,
    slot: { dekat1: [1.4, 2.4, -Math.PI * 0.8, false], dekat2: [-1.8, 2.6, Math.PI * 0.8, false], dekat3: [0.4, 3.2, Math.PI, false], dekat4: [-0.6, 3.0, Math.PI, false] } },
  gubuk: { set: 'jalan', setOpts: { speed: 0, tanah: true, kelapa: true, hujan: true, gubuk: true, motorTua: true, motors: [[4.5, 2.6, '#c0392b', 'motor1'], [6.5, 2.6, '#2980b9', 'motor2']] }, grade: 'hujan', bounds: [-12, 14, -0.8, 12], center: [0, -3.0], kempis: true,
    slot: { motorDatang: { motor: 'motorTua', lx: 0.05, ly: 0.5, pose: 'naik' }, dekatMotor: [1.6, 0.4, -Math.PI / 2, false], jongkokBan: [3.75, 3.35, Math.PI, false] } },
  bengkel: { set: 'bengkel', grade: 'hangat', bounds: [-12, 12, -3.2, 14], center: [0, -1.25], slot: { pemilik: [2.6, -1.2, -Math.PI * 0.3, false] } },
  bengkel5: { set: 'bengkel', setOpts: { motor5: true, pagi: true }, grade: 'pagi', bounds: [-14, 14, -3.2, 16], center: [0, 0.2], slot: {} },
  jalanBukit: { set: 'jalan', setOpts: { speed: 9, bukit: true, motors: [[3, 1.4, '#c0392b', 'motor1'], [0.6, -0.2, '#2980b9', 'motor2'], [-1.8, 1.4, '#27ae60', 'motor3'], [-4.2, -0.2, '#f39c12', 'motor4'], [-6.6, 1.4, '#4a5a3a', 'motor5']] }, grade: 'pagi', bounds: [-40, 40, -20, 25],
    slot: Object.fromEntries([1, 2, 3, 4, 5].map(i => ['motor' + i + 'Depan', { motor: 'motor' + i, lx: 0.05, ly: 0.5, pose: 'naik' }])) },
  bazar: { set: 'bazar', setOpts: { antre: 12, antreDi: 12 }, grade: 'panas', bounds: [-14, 14, -8, 14], center: [-2.6, -2.15],
    slot: { stan12a: [2.0, -2.15, 0, false], stan12b: [3.2, -2.15, 0, false], depan11a: [-3.4, 1.0, Math.PI * 0.85, false], depan11b: [-2.0, 1.1, -Math.PI * 0.85, false], pemusik: [-5.0, 0.4, Math.PI / 2, true], lari: [-1.0, 1.4, -Math.PI / 2, false] } },
  bazarSepi: { set: 'bazar', setOpts: { antre: 0 }, grade: 'panas', bounds: [-14, 14, -8, 14], center: [-2.6, -2.15],
    slot: { pemusik: [-5.0, 0.4, Math.PI / 2, true], depan11a: [-3.4, 1.0, Math.PI * 0.85, false], depan11b: [-2.0, 1.1, -Math.PI * 0.85, false], lari: [-1.0, 1.4, -Math.PI / 2, false] } },
  bazarGabung: { set: 'bazar', setOpts: { antre: 14, antreDi: 0, gabung: true }, grade: 'pagi', bounds: [-14, 14, -8, 14], center: [0, -2.15],
    slot: { pemusik: [-5.0, 0.4, Math.PI / 2, true], pemusik2: [-5.0, 1.6, Math.PI / 2, true], penyanyi: [-3.8, 1.0, Math.PI / 2, false], perekam1: [-6.4, 2.6, -Math.PI * 0.75, false], perekam2: [-5.6, 2.9, -Math.PI * 0.85, false], depan11a: [-1.0, 1.0, Math.PI * 0.9, false], depan11b: [0.6, 1.0, -Math.PI * 0.9, false] } },
  bazarMotor: { set: 'bazar', setOpts: { antre: 0, gabung: true, motorEs: true }, grade: 'pagi', bounds: [-14, 14, -8, 14], center: [0, -2.15],
    slot: { tiba1: [-6.6, 2.4, Math.PI * 0.8, false], tiba2: [-5.4, 2.5, -Math.PI * 0.9, false], tulis1: [-0.9, 1.0, 0.2, false], tulis2: [0.3, 1.0, -0.2, false] } },
  bazarPanggung: { set: 'bazar', setOpts: { antre: 0, gabung: true, panggung: true }, grade: 'pagi', bounds: [-14, 14, -5, 14], center: [0, -2.8],
    slot: { panggung: [0, -6.4, 0, false, 0.8] } },
  parkiran12: { set: 'parkiran12', grade: 'pagi', bounds: [-12, 12, -3.4, 12], center: [-3.0, 2.6],
    slot: { angkat1: [1.4, 0.4, Math.PI / 2, false], angkat2: [2.4, 0.9, -Math.PI / 2, false], spanduk1: [-2.0, -1.55, 0, false], spanduk2: [1.4, -1.55, 0, false], pintu: [-1.5, -3.1, 0.3, false] } },
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
  studio: { set: 'studio', grade: 'hangat', bounds: [-4.6, 4.6, -4.6, 4.6], center: [0, -1.0],
    lebarCam: { pos: [0.6, 2.7, 4.5], look: [-0.2, 1.3, -1.6], fov: 64 }, masukCam: { pos: [-1.2, 2.3, 4.3], look: [3.2, 1.5, 0.6], fov: 54 },
    slot: { vokal: [0, -0.35, 0, false], gitaris: [-1.7, -1.2, 0.3, false], bassis: [1.3, -1.4, -0.25, false], keyboardis: [2.85, -2.78, -0.25, false], drummer: [0, -3.75, 0, true],
      sudut: [-3.3, 2.0, 2.31, false], depanSudut: [-2.2, 1.0, -0.8, false], dekatSudut: [-1.9, 2.4, -1.9, false] } },
  panggung: { set: 'panggung', grade: 'panggung', bounds: [-12, 12, -8.8, 14], center: [0, -4.6],
    lebarCam: { pos: [0.8, 3.0, 5.0], look: [0, 2.2, -5.0], fov: 52 },
    slot: { vokal: [0, -4.25, 0, false, 1.0], gitaris: [-2.6, -5.0, 0.25, false, 1.0], bassis: [2.0, -5.2, -0.2, false, 1.0], keyboardis: [3.58, -6.17, -0.3, false, 1.0], drummer: [0, -7.85, 0, true, 1.0],
      sisiPanggung: [-6.2, -4.0, Math.PI / 2, false, 1.0], ...Object.fromEntries([...Array(12)].map((_, i) => ['d' + (i + 1), [-3.3 + (i % 6) * 1.3 + (i > 5 ? 0.6 : 0), 0.9 + (i > 5 ? 1.0 : 0), Math.PI, false]])) } },
};
LOKASI.panggungSorot = { ...LOKASI.panggung, setOpts: { sorot: true }, grade: 'sorot' };
LOKASI.panggungGelap = { ...LOKASI.panggung, setOpts: { sorot: true, senter: 0.04 }, grade: 'sorot' };
LOKASI.panggungSenter = { ...LOKASI.panggung, setOpts: { sorot: true, senter: 0.85 }, grade: 'sorot' };
LOKASI.belakangPanggung = { set: 'belakangPanggung', grade: 'panggung', bounds: [-5.5, 6, -2.4, 14], center: [0.5, 0.5],
  slot: { tunggu: [0.6, -1.0, 0.25, false], kiri: [-0.6, -0.6, Math.PI / 2, false], kanan: [0.8, -0.6, -Math.PI / 2, false], menuju: [0.6, 6.0, 0, false], penahan: [-0.4, 5.0, 0.5, false] } };

const blocked = (L, x, z) => (L.blocks || []).some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
const headY = (sit) => (sit ? 1.73 : 1.98);
const PEREMPUAN = []; // tokoh tetap ada di TOKOH (cast.js); nama asing dianggap figuran laki-laki
const SEKOLAH = ['studio', 'panggung', 'panggungSorot', 'panggungGelap', 'panggungSenter', 'belakangPanggung', 'bazar', 'bazarSepi', 'bazarGabung', 'bazarMotor', 'bazarPanggung', 'parkiran12', 'kelas', 'koridor', 'kantin', 'lobi', 'lobiPiala', 'gudang', 'gudangKejutan', 'gerbang', 'gerbangSore', 'lapangan', 'ruangGuru'];
const castMake = (key, loc) => {
  if (/#syal$/.test(key)) { const c = castMake(key.replace(/#syal$/, ''), loc); syal(c); return c; }
  const [k, opt] = key.split('#'); // mis. "dimas#perban"
  if (loc && !SEKOLAH.includes(loc) && TOKOH[k] && opt !== 'seragam') { const o = { ...santai(k), ...(opt === 'jas' ? { jacket: '#e0b020', sleeve: '#e0b020', longSleeve: true } : {}) }; return CAST[k](o); }
  const o = opt === 'jas' ? { jacket: '#e0b020', sleeve: '#e0b020', longSleeve: true } : opt === 'perban' ? { shortLeg: 1 } : opt === 'rumah' ? { shirt: '#2f4b7c', pants: '#3b3b44', badge: false, name: null, collar: false, sleeve: '#2f4b7c' } : {};
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
export function solveCam(L, heads, who, { dist = 2.8, fov = 40, high = 0.15, obst = [] } = {}) {
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
      for (const [k, o] of [...Object.entries(heads), ...obst.map((o2, i) => ['_x' + i, o2])]) {
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
  if (kind === 'mic') { const g = mikrofon(); g.userData.off = [[0.08, -0.05, 0.12], [0, 0, 0.5]]; return g; }
  if (kind === 'hp') { const g = phone(); g.userData.off = [[0, -0.12, 0.1], [0, 0, Math.PI]]; return g; }
  const g = kertasProp(); g.userData.off = [[0, -0.2, 0.1], [0, 0, Math.PI]]; return g;
}
function holdProp(c, pr) { const h = c.handOf(-1); if (pr.parent !== h) { h.add(pr); const [p, r] = pr.userData.off; pr.position.set(...p); pr.rotation.set(...r); } }
const AKSI_POSE = {
  game: { ...POSES.hpDua, headX: 0.35 },
  tunjuk: POSES.tunjuk, tunduk: POSES.tunduk, raba: { shR: [-1.3, 0, 0.1], elR: -0.3, shL: [-1.3, 0, -0.1], elL: -0.3, torsoX: 0.1 },
  intip: { torsoZ: 0.3, headZ: 0.2, torsoX: 0.15 }, ketiduran: { torsoX: 0.55, headX: 0.75, shR: [-0.9, 0, 0.3], elR: -1.6, shL: [-0.9, 0, -0.3], elL: -1.6 }, silang: POSES.silang, tahan: POSES.serahkan, taruh: { shR: [-0.9, 0, 0.15], elR: -0.5, torsoX: 0.25, headX: 0.3 }, baca: { ...POSES.hpDua, headX: 0.42 }, bawa: POSES.bawa, serahkan: POSES.serahkan,
};

// ---------- foto cetak (polaroid) dengan gambar sederhana sesuai keterangan
function gambarFoto(x, w, h, cap) {
  const c = (cap || '').toLowerCase();
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#bfe0f5'); g.addColorStop(1, '#eef6fb'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = c.includes('lapangan') ? '#8cc56a' : '#d9cdb6'; x.fillRect(0, h * 0.62, w, h * 0.38);
  if (c.includes('kantin')) { x.fillStyle = '#c0392b'; x.fillRect(w * 0.05, h * 0.25, w * 0.9, h * 0.1); x.fillStyle = '#f3e2c2'; x.fillRect(w * 0.08, h * 0.35, w * 0.84, h * 0.3); }
  if (c.includes('tidak ada')) { x.strokeStyle = '#e74c3c'; x.lineWidth = w * 0.04; x.beginPath(); x.arc(w * 0.5, h * 0.55, w * 0.2, 0, Math.PI * 2); x.moveTo(w * 0.36, h * 0.69); x.lineTo(w * 0.64, h * 0.41); x.stroke(); }
  if (c.includes('sampah') || c.includes('penuh') || c.includes('kantin')) {
    x.fillStyle = '#2e7d4f'; x.fillRect(w * 0.38, h * 0.45, w * 0.24, h * 0.32); x.fillStyle = '#245f3c'; x.fillRect(w * 0.35, h * 0.42, w * 0.3, h * 0.05);
    if (c.includes('penuh')) { ['#f39c12', '#3498db', '#e74c3c', '#ecf0f1'].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(w * (0.42 + i * 0.05), h * 0.41, w * 0.045, 0, Math.PI * 2); x.fill(); }); x.fillStyle = '#ecf0f1'; x.fillRect(w * 0.25, h * 0.74, w * 0.08, h * 0.04); x.fillRect(w * 0.66, h * 0.76, w * 0.07, h * 0.03); }
  }
  if (!/(sampah|kantin|lapangan|penuh|tidak ada)/.test(c)) { x.fillStyle = '#c98a52'; [0.3, 0.5, 0.7].forEach(f => { x.beginPath(); x.arc(w * f, h * 0.52, w * 0.08, 0, Math.PI * 2); x.fill(); x.fillRect(w * f - w * 0.07, h * 0.6, w * 0.14, h * 0.2); }); }
}
function drawFoto(x, caps, lt) {
  const list = caps.length ? caps : ['', '', ''];
  const a = Math.min(1, lt / 0.4); x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, 720, 1280);
  list.slice(0, 3).forEach((cap, i) => {
    const k = Math.max(0, Math.min(1, (lt - i * 0.35) / 0.3)); if (k <= 0) return;
    x.save(); x.translate(360 + (i - (Math.min(3, list.length) - 1) / 2) * 150, 470 + i * 60 + (1 - k) * 60); x.rotate((i - 1) * 0.09);
    x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 26; x.fillStyle = '#fbfaf6'; x.fillRect(-170, -200, 340, 400); x.shadowBlur = 0;
    x.save(); x.translate(-150, -180); gambarFoto(x, 300, 290, cap); x.restore();
    x.fillStyle = '#2b2b5a'; x.font = 'italic 600 24px Nunito'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const words = cap.split(' '); let line = '', yy = 145; for (const wd of words) { const t2 = line ? line + ' ' + wd : wd; if (x.measureText(t2).width > 300) { x.fillText(line, 0, yy); yy += 28; line = wd; } else line = t2; } x.fillText(line, 0, yy);
    x.restore();
  });
  x.restore();
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
      const pintu = S.scene.getObjectByName('pintu'); let P = null, N = null;
      if (pintu) { P = pintu.position.clone(); N = new THREE.Vector3(Math.sin(pintu.rotation.y), 0, Math.cos(pintu.rotation.y)); }
      const GURU = ['eko', 'agus', 'wali', 'crispin', 'almis'];
      const duduk = L.seats && !d.berdiri; let seatI = 0;
      const chars = {}, heads = {};
      const pn = Object.keys(d.cast || {}).filter(k => /^p\d+$/.test(k)).length;
      if (L.kerumunan) for (let i = 0; i < 14; i++) { const c = (i % 2 ? CAST.siswi : CAST.siswa)(i * 7 + 3); S.add(c, [-6 + (i % 7) * 2 + (i > 6 ? 1 : 0), 0, -4.2 - (i > 6 ? 1.3 : 0)], 0); c.act(POSES.berdiri, 'senyum', 0, false, i); }
      for (const [slot, key] of Object.entries(d.cast || {})) {
        let s = L.slot[slot];
        if (!s && /^p\d+$/.test(slot) && duduk) { const nm0 = key.split('#')[0]; if (GURU.includes(nm0)) s = [1.7, -4.3, -0.35, false]; else { const se = L.seats[seatI++ % L.seats.length]; s = [se[0], se[1], Math.PI, true]; } }
        if (!s && /^p\d+$/.test(slot)) { const i = +slot.slice(1) - 1, off = i - (pn - 1) / 2, c0 = L.center || [0, 0]; s = [c0[0] + off * 1.05, c0[1] + Math.abs(off) * 0.25, -off * 0.12, false]; }
        if (!s) continue;
        if (!Array.isArray(s)) { // naik motor: tokoh jadi anak dari objek motor
          const m = S.scene.getObjectByName(s.motor); if (!m) continue;
          const c = castMake(key, d.loc); const name = key.split('#')[0]; m.add(c.root); c.root.position.set(s.lx, s.ly, 0); c.root.rotation.y = Math.PI / 2;
          chars[name] = { c, sit: false, ride: s.pose }; m.updateMatrixWorld(true); const wp = new THREE.Vector3(); c.root.getWorldPosition(wp);
          heads[name] = { x: wp.x, y: wp.y + 1.85, z: wp.z, rot: m.rotation.y + Math.PI / 2 };
          if ((d.helm || []).includes(name)) { const h = helm(['#2c3e50', '#c0392b', '#f1c40f', '#2980b9', '#7f8c8d'][Object.keys(chars).length % 5]); h.position.y = 0.42; c.head.add(h); c.userData = { helm: h }; }
          if (/^(hp|game)/.test(d.pose?.[name] || '')) { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); }
          continue;
        }
        const c = castMake(key, d.loc); const name = key.split('#')[0];
        S.add(c, [s[0], 0, s[1]], s[2]); chars[name] = { c, sit: s[3] }; if (s[4]) c.root.position.y = s[4];
        if (d.pose?.[name] === 'gitar') { pasangGitar(c); }
        if (d.pose?.[name] === 'gitarBerdiri') pasangGitar(c, POSES.gitarBerdiri, gitarListrik('#c0392b'));
        if (d.pose?.[name] === 'bass') pasangGitar(c, POSES.gitarBerdiri, gitarListrik('#2c3e50', true));
        if (d.pose?.[name] === 'drum') for (const sd of [-1, 1]) { const st = stik(); c.handOf(sd).add(st); st.position.set(0, -0.1, 0.12); st.rotation.set(1.2, 0, 0); }
        if (/^(micDua|gemetar)$/.test(d.pose?.[name] || '')) { const mc = mikrofon(); c.handOf(-1).add(mc); mc.position.set(0.08, -0.05, 0.12); mc.rotation.set(0, 0, 0.5); }
        if (d.pose?.[name] === 'sodorMic') { const mc = mikrofon(); c.handOf(-1).add(mc); mc.position.set(0.05, -0.12, 0.1); mc.rotation.set(1.3, 0, 0); }
        if (d.pose?.[name] === 'angkat') { const a = ampli(0.55, 0.5); a.position.set(0, 0.05, 0.62); c.torso.add(a); }
        if (d.pose?.[name] === 'senter') { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); ph.draw(x => { x.fillStyle = '#222'; x.fillRect(0, 0, 400, 800); });
          const gl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: '#fffbe6' })); gl.position.set(0, -0.2, -0.03); ph.add(gl);
          const halo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.35, depthWrite: false })); halo.position.copy(gl.position); ph.add(halo); }
        if (d.pose?.[name] === 'mic') { const mc = mikrofon(); c.handOf(-1).add(mc); mc.position.set(0, -0.1, 0.1); }
        if (d.pose?.[name] === 'ringlight') { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); const rl = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: '#fffbe0' })); rl.position.set(0, 0.32, 0); ph.add(rl); }
        if (d.pose?.[name] === 'selebaran') { const kp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshBasicMaterial({ color: '#ffe066', side: THREE.DoubleSide })); c.handOf(-1).add(kp); kp.position.set(0, -0.2, 0.1); }
        if (d.pose?.[name] === 'teh') { const gl = glass('#b5651d'); c.handOf(-1).add(gl); gl.position.set(0, -0.2, 0.05); }
        if (d.pose?.[name] === 'perbaiki') { const kp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.05), new THREE.MeshToonMaterial({ color: '#9aa0a6' })); kp.position.set(0, -0.2, 0.05); c.handOf(-1).add(kp); }
        if ((d.helm || []).includes(name)) { const h = helm('#c0392b'); h.position.y = 0.42; c.head.add(h); c.userData = { helm: h }; }
        heads[name] = { x: s[0], y: headY(s[3]) + (s[4] || 0), z: s[1], rot: s[2] };
        if (/^(piala|cat)/.test(d.pose?.[name] || '')) { const pr = d.pose[name] === 'piala' ? piala() : kalengCat(); c.handOf(-1).add(pr); pr.position.set(0.18, -0.05, 0.12); pr.rotation.set(Math.PI / 2 - 0.4, 0, 0); }
        if (/^(hp|telepon|game)/.test(d.pose?.[name] || '')) { const ph = phone(); c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI);
          ph.draw(x => drawChat(x, { title: 'Chat', messages: [{ text: '...' }] })); }
      }
      const extraHeads = [];
      if (L.seats && !d.sepi) {
        const taken = Object.values(chars).map(o => [o.c.root.position.x, o.c.root.position.z]);
        L.seats.forEach(([sx, sz], i) => {
          if (taken.some(([x2, z2]) => Math.hypot(x2 - sx, z2 - sz) < 0.4)) return;
          const c = (i % 2 ? CAST.siswi : CAST.siswa)(i * 5 + 1, { name: null }); S.add(c, [sx, 0, sz], Math.PI);
          c.act(combine(POSES.duduk, i % 3 ? POSES.tanganMeja : {}), ['netral', 'fokus', 'senyum'][i % 3], 0.3 + i, false, i); extraHeads.push({ x: sx, y: 1.73, z: sz, rot: Math.PI });
        });
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
      if ((kind === 'cu' || kind === 'mcu') && heads[who]) cam = solveCam(L, heads, who, kind === 'cu' ? { dist: 3.3, fov: 40, obst: extraHeads } : { dist: 4.3, fov: 46, high: 0.05, obst: extraHeads });
      else if (kind === 'masuk' && P && heads[who]) { const h = heads[who]; cam = solveGroup(L, { a: { x: P.x + N.x * 0.6, y: 1.9, z: P.z + N.z * 0.6, rot: Math.atan2(h.x - P.x, h.z - P.z) }, b: { ...h, rot: Math.atan2(P.x - h.x, P.z - h.z) } }, true); }
      else if (kind === 'ban') { const m = S.scene.getObjectByName('motor1'); const w = new THREE.Vector3(); (m?.userData.roda[0] || m)?.getWorldPosition(w); cam = { pos: [w.x + 1.4, 1.25, w.z - 2.0], look: [w.x, 0.45, w.z + 0.2], fov: 40 }; }
      else if (kind === 'pengendara') { const m = S.scene.getObjectByName('motorTua'); cam = { pos: [m.position.x - 2.4, 2.05, m.position.z + 1.0], look: [m.position.x, 1.85, m.position.z], fov: 38 }; }
      else if (kind === 'motorTua') { const m = S.scene.getObjectByName('motorTua'); cam = { pos: [m.position.x + 1.2, 1.9, m.position.z + 2.4], look: [m.position.x + 0.7, 1.2, m.position.z], fov: 36 }; }
      else if (kind === 'penonton') cam = { pos: [1.5, 5.2, 19.5], look: [0, 2.6, -5], fov: 34 };
      else if (kind === 'lebar' && L.lebarCam) cam = L.lebarCam;
      else if (kind === 'masuk' && L.masukCam) cam = L.masukCam;
      else if (kind === 'barisDepan') cam = { pos: [0.4, 2.6, -2.2], look: [0, 1.8, 1.6], fov: 50 };
      else if (kind === 'sorot') cam = { pos: [0, 1.6, 3.2], look: [0, 2.7, -4.3], fov: 34 };
      else if (kind === 'drummer' && heads[who]) { const h = heads[who]; cam = { pos: [h.x + 1.3, h.y + 0.75, h.z + 3.0], look: [h.x, h.y - 0.15, h.z], fov: 38 }; }
      else if (kind === 'riding') { cam = { pos: [-1.5, 2.3, 7.5], look: [0.2, 1.3, 0], fov: 42 }; }
      else if (kind === 'laptop') cam = { pos: [0.55, 2.55, -1.25], look: [-1.45, 1.2, -3.4], fov: 30 };
      else if (kind === 'kedepan') cam = { pos: [4.6, 2.9, 1.8], look: [-0.6, 1.2, -2.4], fov: 56 };
      else if (kind === 'tidur') cam = { pos: [2.4, 3.6, 1.6], look: [2.4, 0.7, -1.6], fov: 46 };
      else if (kind === 'dua' && Object.keys(heads).length === 2) cam = solveOts(L, heads, who) || solveGroup(L, heads);
      else if (duduk && Object.values(heads).filter(h => h.y < 1.8).length >= 2) { const hs = Object.values(heads).filter(h => h.y < 1.8); const cx = hs.reduce((a2, h) => a2 + h.x, 0) / hs.length, cz = hs.reduce((a2, h) => a2 + h.z, 0) / hs.length;
        cam = { pos: [cx * 0.6, kind === 'lebar' ? 2.6 : 2.2, Math.max(-5.4, cz - (kind === 'lebar' ? 4.6 : 3.4))], look: [cx, 1.45, cz], fov: kind === 'lebar' ? 52 : 44 }; }
      else cam = solveGroup(L, heads, kind === 'lebar');
      const end = { ...cam, pos: cam.pos.map((v, i) => lerp(cam.look[i], v, 0.9)) };
      const seed = Object.keys(chars);
      return (lt, k, t) => {
        for (const [name, { c, sit }] of Object.entries(chars)) {
          let p = chars[name].ride ? POSES[chars[name].ride] : sit ? POSES.duduk : POSES.berdiri;
          const ps0 = d.pose?.[name];
          if (ps0 === 'jongkok') p = POSES.jongkok;
          if (ps0 === 'perbaiki') p = combine(POSES.jongkok, { shR: [-1.0 + Math.sin(t * 9) * 0.25, 0, 0.25], elR: -0.6, shL: [-1.0 + Math.cos(t * 8) * 0.2, 0, -0.25], elL: -0.7, headX: 0.45 });
          if (ps0 === 'pinggang') p = combine(p, POSES.pinggang);
          const ANIM0 = ['gitar', 'gitarBerdiri', 'bass', 'drum', 'keyboard', 'vokal'];
          if (ps0 === 'gitar') p = combine(POSES.gitar, { elR: -1.25 + Math.sin(t * (d.ceria ? 14 : 5)) * 0.18 });
          if (ps0 === 'gitarBerdiri' || ps0 === 'bass') p = combine(POSES.gitarBerdiri, { elR: -1.25 + Math.sin(t * (d.ceria ? 14 : 8)) * 0.15, headX: 0.2 + Math.sin(t * 4) * 0.05 });
          if (ps0 === 'drum') { const e = d.ceria ? 12 : 7; p = combine(POSES.drum, { shR: [-0.9 + Math.max(0, Math.sin(t * e)) * 0.45, 0, 0.35], shL: [-0.9 + Math.max(0, Math.sin(t * e + Math.PI)) * 0.45, 0, -0.35], headX: 0.15 + Math.sin(t * e) * 0.04 }); }
          if (ps0 === 'keyboard') p = combine(POSES.keyboard, { elR: -0.75 + Math.sin(t * 6) * 0.08, elL: -0.75 + Math.sin(t * 5 + 1) * 0.08, headZ: Math.sin(t * 1.5) * 0.06 });
          if (ps0 === 'vokal') p = combine(POSES.vokal, { headZ: Math.sin(t * 2.2) * 0.09, torsoZ: Math.sin(t * 2.2) * 0.04 });
          if (ps0 === 'micDua') p = combine(POSES.micDua, { headZ: Math.sin(t * 2) * 0.06 });
          if (ps0 === 'gemetar') p = combine(POSES.gemetar, { kneeR: 0.15 + Math.sin(t * 40) * 0.05, kneeL: 0.15 + Math.sin(t * 43) * 0.05, elR: -1.75 + Math.sin(t * 37) * 0.04 });
          if (ps0 === 'senter') p = combine(POSES.senter, { shR: [-2.75, 0, -0.15 + Math.sin(t * 1.4 + seed.indexOf(name)) * 0.3] });
          if (ps0 === 'mic') p = combine(p, POSES.mic, { headZ: Math.sin(t * 3) * 0.1 });
          if (ps0 === 'ringlight') p = combine(p, POSES.hpAngkat);
          if (ps0 === 'sorak') p = combine(POSES.sorak, { hipsY: 0.75 + Math.abs(Math.sin(t * 7 + seed.indexOf(name))) * 0.18 });
          if (ps0 === 'tepukBahu' || ps0 === 'jabat') p = combine(p, POSES[ps0]);
          if (ps0 === 'lingkar') p = combine(p, POSES.lingkar);
          if (ps0 === 'selebaran') p = combine(walkPose(t, 1.2, true), { shR: [-1.2, 0, 0.1], elR: -0.3 });
          if (ps0 === 'teh') p = combine(p, POSES.minum, { elR: -1.6 - Math.max(0, Math.sin(t * 1.3)) * 0.5, headX: -Math.max(0, Math.sin(t * 1.3)) * 0.15 });
          if (ps0 === 'lepasHelm' && c.userData?.helm) { const kl2 = d.tl ? Math.max(0, Math.min(1, (t - d.tl[0]) / Math.max(0.5, d.tl[1] - d.tl[0]))) : k; const q = Math.max(0, Math.min(1, (kl2 - 0.2) / 0.6)); c.userData.helm.position.y = 0.42 + q * 0.9; c.userData.helm.visible = q < 0.98; p = combine(p, { shR: [-2.6 * Math.min(1, q * 2), 0, 0.3], elR: -0.6, shL: [-2.6 * Math.min(1, q * 2), 0, -0.3], elL: -0.6 }); }
          if (d.diam && ANIM0.includes(ps0)) p = combine(POSES[ps0 === 'bass' ? 'gitarBerdiri' : ps0], ps0 === 'drum' ? {} : {});
          const ANIM_POSE = ['gitar', 'gitarBerdiri', 'bass', 'drum', 'keyboard', 'vokal', 'micDua', 'gemetar', 'senter'];
          const extra = ANIM_POSE.includes(d.pose?.[name]) ? null : d.pose?.[name] === 'game' ? AKSI_POSE.game : /^(piala|cat)$/.test(d.pose?.[name]) ? POSES.bawa : d.pose?.[name] === 'telepon' ? { shR: [-0.35, 0, 0.55], elR: -2.5, headZ: -0.1 } : POSES[d.pose?.[name]]; if (extra) p = combine(p, extra);
          if (d.pose?.[name] === 'angguk') p = combine(p, { headX: lt < 1 ? Math.max(0, Math.sin(lt * 9)) * 0.3 : 0 });
          if (props[name]?.parent === c.handOf(-1) && props[name].visible !== false) p = combine(p, props[name].userData.kind === 'kertas' ? AKSI_POSE.baca : props[name].userData.kind === 'hp' ? POSES.hp : AKSI_POSE.bawa);
          const B = base[name]; let px = B.x, pz = B.z, rot = B.r;
          const fx = Math.sin(B.r), fz = Math.cos(B.r);
          for (const a of d.acts || []) {
            const q = (t - a.t) / a.dur, qc = Math.max(0, Math.min(1, q));
            if (a.who === name) {
              if ((a.a === 'jalan' || a.a === 'endap') && P && a.dari === 'pintu') {
                const o = { x: P.x - N.x * 0.7, z: P.z - N.z * 0.7 }, m = { x: P.x + N.x * 0.9, z: P.z + N.z * 0.9 };
                const leaf = pintu.userData.leaf; if (leaf) leaf.rotation.y = -1.5 * ease(Math.max(0, Math.min(1, (t - a.t + 0.5) / 0.5))) * (q < 1.6 ? 1 : Math.max(0, 1 - (q - 1.6)));
                if (q < 1) { let fx2, fz2, tx, tz; if (qc < 0.3) { const u = qc / 0.3; px = o.x + (m.x - o.x) * u; pz = o.z + (m.z - o.z) * u; tx = m.x - o.x; tz = m.z - o.z; } else { const u = ease((qc - 0.3) / 0.7); px = m.x + (B.x - m.x) * u; pz = m.z + (B.z - m.z) * u; tx = B.x - m.x; tz = B.z - m.z; }
                  rot = Math.atan2(tx, tz); p = combine(walkPose(t, a.a === 'endap' ? 0.6 : 1), a.a === 'endap' ? { torsoX: 0.35, hipsY: 0.65 } : {}); }
                if (q < 0) { px = o.x; pz = o.z; }
              } else if (a.a === 'jalan' || a.a === 'endap') { const dd = (1 - ease(qc)) * 2.6; px = B.x - fx * dd; pz = B.z - fz * dd; if (q < 1) p = combine(walkPose(t, a.a === 'endap' ? 0.6 : 1), a.a === 'endap' ? { torsoX: 0.35, hipsY: 0.65 } : {}); }
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
              } else if (a.a === 'silang' && q > 0) p = combine(p, AKSI_POSE.silang);
              else if (a.a === 'ketiduran' && q > 0 && !(a.sampai && t > a.sampai)) p = combine(p, AKSI_POSE.ketiduran);
              else if (AKSI_POSE[a.a] && q > 0 && q < 1.3) p = combine(p, AKSI_POSE[a.a]);
            }
            if (a.a === 'beri' && a.to === name && q > 0.25 && q < 0.8) p = combine(p, AKSI_POSE.serahkan);
          }
          for (const a of d.acts || []) {
            if (a.who !== name) continue; const q = (t - a.t) / a.dur, qc = Math.max(0, Math.min(1, q));
            if (a.a === 'kedepan' && sit) {
              const ax = B.x <= 0 ? -1.6 : 1.6, fz = -4.0, fx2 = ax * 0.55;
              if (q < 0) { } else if (qc < 0.18) { p = mixPose(POSES.duduk, POSES.berdiri, qc / 0.18); }
              else if (qc < 0.42) { const u = (qc - 0.18) / 0.24; px = B.x + (ax - B.x) * ease(u); rot = ax < B.x ? -Math.PI / 2 : Math.PI / 2; p = walkPose(t, 1); }
              else if (qc < 0.92) { const u = ease((qc - 0.42) / 0.5); px = ax + (fx2 - ax) * u; pz = B.z + (fz - B.z) * u; rot = Math.atan2(fx2 - ax, fz - B.z); p = walkPose(t, 1); }
              else { px = fx2; pz = fz; rot = Math.PI * (1 - ease((qc - 0.92) / 0.08)); p = POSES.berdiri; }
              if (q >= 1) { px = fx2; pz = fz; rot = 0; p = POSES.berdiri; }
            }
            if (a.a === 'tatap' && q > 0) {
              let tg = chars[a.to]; if (!tg || a.to === '*') { let best = 1e9; for (const [n2, o2] of Object.entries(chars)) { if (n2 === name) continue; const dd = Math.hypot(o2.c.root.position.x - px, o2.c.root.position.z - pz); if (dd < best) { best = dd; tg = o2; } } }
              if (tg) { let ang = Math.atan2(tg.c.root.position.x - px, tg.c.root.position.z - pz) - rot; while (ang > Math.PI) ang -= 2 * Math.PI; while (ang < -Math.PI) ang += 2 * Math.PI;
                const k2 = ease(Math.min(1, q * 3)); ang = Math.max(-1.4, Math.min(1.4, ang)); p = combine(p, { headY: ang * 0.85 * k2, torsoY: ang * 0.35 * k2 }); }
            }
          }
          if (d.pose?.[name] === 'tidur') { const sl = S.scene.getObjectByName('selimut'); if (sl) sl.position.y = 1.02; c.root.position.set(B.x, 0.8, B.z + 0.05); c.root.rotation.set(-Math.PI / 2, 0, 0); c.applyPose({}); c.talking = false; c.setFace('merem', t); continue; }
          c.root.position.x = px; c.root.position.z = pz; c.root.rotation.y = rot;
          const talking = (d.talk || []).some(([a, b, w]) => w === name && t >= a && t <= b);
          c.act(p, d.expr?.[name] || 'netral', t, talking, seed.indexOf(name));
        }
        S.scene.userData.anim?.(t);
        // pemandangan bergerak, roda, hujan, motor tua datang, oleng
        const sp = (S.scene.userData.gerakSpeed || 0) * (d.oleng ? Math.max(0, 1 - lt / 1.2) : 1);
        const ger = S.scene.getObjectByName('gerak'); if (ger) ger.position.x = -((d.oleng ? sp * lt * 0.5 : t * sp) % 40);
        S.scene.traverse(o => { if (o.userData?.roda) o.userData.roda.forEach((w, wi) => { w.rotation.z = -(d.oleng ? lt * sp * 0.5 : t * sp) / 0.37; if (L.kempis && wi === 0 && o.name === 'motor1') w.scale.set(1, 0.82, 1); }); });
        const m1 = S.scene.getObjectByName('motor1'); if (m1 && d.oleng) { const e = Math.max(0, lt - 0.3); m1.rotation.x = Math.sin(e * 9) * 0.18 * Math.exp(-e * 1.6); }
        const mt = S.scene.getObjectByName('motorTua'); if (mt) { const kl = d.tl ? Math.max(0, Math.min(1, (t - d.tl[0]) / Math.max(0.5, d.tl[1] - d.tl[0]))) : k; const dq = Object.values(d.pose || {}).includes('datangMotor') ? ease(Math.min(1, kl / 0.75)) : 1; mt.position.x = 2.6 + (1 - dq) * 14; mt.userData.roda.forEach(w => w.rotation.z = (1 - dq) * 30); }
        if (S.scene.userData.hujan) for (const dr of S.scene.userData.hujan) { if (dr.userData.y0 === undefined) dr.userData.y0 = dr.position.y; dr.position.y = ((dr.userData.y0 - t * 11) % 9 + 9) % 9; }
        S.camMove(k, cam, end);
        let flashK = 0;
        if (d.ledakan !== undefined) { const e = t - d.ledakan; const mb = S.scene.getObjectByName('mesinBoba');
          if (mb && e > 0) { if (!S.scene.userData.asap) { S.scene.userData.asap = []; for (let i = 0; i < 10; i++) { const sm = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshToonMaterial({ color: '#cfcfcf', transparent: true, opacity: 0.6 })); sm.userData.outlineParameters = { visible: false }; S.scene.add(sm); S.scene.userData.asap.push(sm); } }
            S.scene.userData.asap.forEach((sm, i) => { const u = ((e * 0.6 + i * 0.1) % 1.6); sm.position.set(mb.position.x + Math.sin(i * 2.1) * 0.3 * u, mb.position.y + 0.8 + u * 1.6, mb.position.z + Math.cos(i * 1.7) * 0.2); sm.scale.setScalar(0.6 + u * 1.4); sm.material.opacity = 0.55 * (1 - u / 1.6); }); }
          if (e > 0 && e < 0.35) flashK = 1 - e / 0.35; }
        if (flashK > 0) { const g0 = d.grade || L.grade; const G = typeof g0 === 'string' ? { ...GRADES_REF[g0] } : { ...g0 }; G.overlayColor = [1, 0.95, 0.8]; G.overlayAmt = flashK * 0.8; return G; }
        const LY = S.scene.userData.layar;
        if (LY) { const x = LY.ctx; x.fillStyle = '#f5f7fa'; x.fillRect(0, 0, 512, 320); x.fillStyle = '#2b579a'; x.fillRect(0, 0, 512, 34);
          x.fillStyle = '#fff'; x.font = '700 18px Nunito'; x.textAlign = 'left'; x.fillText(d.layar === 'ai' ? 'Asisten AI' : 'Dokumen - Esai.docx', 14, 23);
          x.fillStyle = '#1b1b1b'; x.font = '800 20px Nunito'; x.fillText(d.judulLayar || 'Esai', 40, 70); x.font = '500 15px Nunito'; x.fillStyle = '#333';
          const isi = d.layar === 'ai' || d.layar === 'nulis' ? 9 : 0; for (let i = 0; i < isi; i++) x.fillRect(40, 92 + i * 22, 420 - (i % 3) * 50, 8);
          if ((t * 2 | 0) % 2 === 0) { x.fillStyle = '#111'; x.fillRect(40 + (isi ? 380 - ((isi - 1) % 3) * 50 : 0), isi ? 92 + (isi - 1) * 22 - 6 : 82, 2, 18); }
          LY.tex.needsUpdate = true; }
        if (d.foto) drawFoto(HUD, d.foto, lt);
        if (d.kertas) {
          const a = Math.min(1, lt / 0.4), x = HUD; x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, 720, 1280);
          x.translate(360, 560); x.rotate(-0.04); x.fillStyle = '#f7f1e1'; x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 30; x.fillRect(-270, -230, 540, 460); x.shadowBlur = 0;
          x.fillStyle = '#2b2b5a'; x.font = 'italic 600 38px Nunito'; x.textAlign = 'center'; x.textBaseline = 'middle';
          const [k1, ...kr] = d.kertas.split('|').map(z => z.trim());
          const mT = k1.match(/^(\d+)°C$/);
          if (mT) { // termometer/termostat: tabung kaca + cairan merah naik ke suhu + layar digital
            const suhu = +mT[1], naik = Math.min(1, lt / 1.6), cur = 20 + (suhu - 20) * ease(naik);
            x.restore(); x.save(); x.globalAlpha = Math.min(1, lt / 0.3); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, 720, 1280);
            x.translate(360, 560); x.fillStyle = '#f4f6f8'; x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 30; x.beginPath(); x.roundRect(-230, -380, 460, 700, 40); x.fill(); x.shadowBlur = 0;
            const top = -300, bot = 170, val = v => bot - (v - 0) / 50 * (bot - top);
            x.fillStyle = '#dfe6ea'; x.beginPath(); x.roundRect(-120, top - 20, 60, bot - top + 40, 30); x.fill(); x.beginPath(); x.arc(-90, bot + 55, 62, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#e63946'; x.beginPath(); x.arc(-90, bot + 55, 46, 0, Math.PI * 2); x.fill(); x.fillRect(-106, val(cur), 32, bot + 30 - val(cur));
            x.fillStyle = '#334'; x.font = '700 22px Nunito'; x.textAlign = 'right'; x.textBaseline = 'middle';
            for (let v = 0; v <= 50; v += 5) { const y = val(v); x.fillRect(-58, y - 1.5, v % 10 ? 14 : 24, 3); if (v % 10 === 0) x.fillText(v + '°', -130, y); }
            x.fillStyle = '#1d2b36'; x.beginPath(); x.roundRect(-10, -120, 210, 120, 18); x.fill(); x.fillStyle = '#ff6b4a'; x.font = '900 72px Oswald'; x.textAlign = 'center'; x.fillText(Math.round(cur) + '°C', 95, -55);
            x.fillStyle = '#2b2b5a'; x.font = '700 26px Nunito'; kr.forEach((l, i) => x.fillText(l, 95, 40 + i * 34)); x.restore(); return d.grade || L.grade;
          }
          if (/^(Rp)?[\d.,]+(!|°C)?$/.test(k1)) { x.fillStyle = '#d62828'; x.font = '900 170px Nunito'; x.fillText(k1.replace('!', ''), 0, -70); x.strokeStyle = '#d62828'; x.lineWidth = 8; x.beginPath(); x.ellipse(0, -70, 150, 105, -0.1, 0, Math.PI * 2); x.stroke();
            x.fillStyle = '#2b2b5a'; x.font = 'italic 600 34px Nunito'; kr.forEach((l, i) => x.fillText(l, 0, 95 + i * 46)); x.restore(); return d.grade || L.grade; }
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
  const [jdl, jam] = (ph.judul || '').split('@'); ph.judul = jdl; if (jam) ph.jam = jam; else if (d.jam) ph.jam = d.jam; if (d.hari) ph.hari = d.hari;
  const av = ph.av || (ph.anon ? { unknown: true, bg: '#8b949e' } : { group: (ph.judul || '?').slice(0, 2).toUpperCase(), bg: '#3f8a5c' });
  return phoneInsert(S, { landscape: ph.jenis === 'game', set: L.set, setOpts: L.setOpts, camPos: [0.4, 1.9, 2.0], look: [0, 1.2, -2.5], fog: d.grade === 'malam' || L.grade === 'malam' ? '#3b2e26' : '#b9c4c9', fogFar: 12, push: 0.15,
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
      if (ph.jenis === 'lokasi') {
        c.fillStyle = '#e8eef2'; c.fillRect(0, 0, 540, 1080); c.strokeStyle = '#fff'; c.lineWidth = 26; c.beginPath(); c.moveTo(-20, 900); c.bezierCurveTo(200, 700, 300, 500, 560, 260); c.stroke();
        c.strokeStyle = '#d9cbb0'; c.lineWidth = 18; c.beginPath(); c.moveTo(80, 1100); c.lineTo(420, 120); c.stroke(); c.fillStyle = '#b9dcb0'; c.fillRect(20, 120, 150, 200); c.fillRect(360, 640, 160, 240);
        c.strokeStyle = '#2d7dd2'; c.lineWidth = 10; c.setLineDash([18, 14]); c.beginPath(); c.moveTo(60, 980); c.bezierCurveTo(200, 760, 260, 640, 270 + lt * 8, 540); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgba(45,125,210,0.25)'; c.beginPath(); c.arc(275, 540, 50 + Math.sin(lt * 4) * 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2d7dd2'; c.beginPath(); c.arc(275, 540, 18, 0, Math.PI * 2); c.fill();
        if (ph.judul === 'Peta') { c.fillStyle = '#c0392b'; c.beginPath(); c.arc(120, 980, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.font = '800 26px Nunito'; c.fillText('Bengkel', 70, 1030); }
        c.fillStyle = '#fff'; c.fillRect(0, 0, 540, 150); statusBar(c, false, ph.jam); c.fillStyle = '#111'; c.font = '800 30px Nunito'; c.textAlign = 'left'; c.fillText(ph.judul === 'Peta' ? 'Peta' : 'Live Location', 30, 118);
        c.fillStyle = 'rgba(255,255,255,0.96)'; c.fillRect(20, 880 - 0, 500, 0); (ph.pesan || []).forEach((m, i) => { c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.roundRect(20, 830 + i * 110, 500, 96, 20); c.fill(); c.fillStyle = '#111'; c.font = '700 24px Nunito'; c.fillText(m.slice(0, 34), 40, 888 + i * 110); });
        return;
      }
      if (ph.jenis === 'status') {
        drawLock(c, { time: ph.jam || '10.10', notifs: [] }); const v = (ph.pesan || [''])[0];
        c.fillStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(70, 420, 400, 260, 30); c.fill(); c.textAlign = 'center';
        if (ph.judul === 'Baterai') { c.strokeStyle = '#fff'; c.lineWidth = 8; c.strokeRect(170, 470, 180, 90); c.fillStyle = '#fff'; c.fillRect(350, 495, 16, 40); c.fillStyle = (lt * 2 | 0) % 2 ? '#e74c3c' : '#ff8080'; c.fillRect(178, 478, 18, 74); c.fillStyle = '#fff'; c.font = '800 54px Nunito'; c.fillText(v, 270, 650); }
        else { for (let i = 0; i < 4; i++) { c.fillStyle = i < (parseInt(v) || 1) ? '#fff' : 'rgba(255,255,255,0.2)'; c.fillRect(190 + i * 45, 590 - i * 35, 32, 30 + i * 35); } c.fillStyle = '#fff'; c.font = '800 40px Nunito'; c.fillText('Sinyal lemah', 270, 650); }
        return;
      }
      if (ph.jenis === 'game') {
        c.save(); c.translate(540, 0); c.rotate(Math.PI / 2); const W2 = 1080, H2 = 540;
        c.fillStyle = '#3f6b3a'; c.fillRect(0, 0, W2, H2); c.fillStyle = '#c9b27a'; c.fillRect(0, H2 / 2 - 30, W2, 60); c.fillRect(W2 / 2 - 30, 0, 60, H2);
        c.fillStyle = '#2d4f8a'; c.fillRect(30, H2 - 140, 110, 110); c.fillStyle = '#8a2d2d'; c.fillRect(W2 - 140, 30, 110, 110);
        for (let i = 0; i < 6; i++) { const x = 200 + ((i * 167 + lt * 60 * (i % 2 ? 1 : -1)) % 700), y = 120 + (i * 71) % 300; c.fillStyle = i < 3 ? '#4fa3ff' : '#ff5f5f'; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(W2 / 2 - 150, 10, 300, 56); c.fillStyle = '#fff'; c.font = '800 36px Nunito'; c.textAlign = 'center'; c.fillText(ph.skor || '12  -  9', W2 / 2, 50);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(130, H2 - 120, 80, 0, Math.PI * 2); c.fill(); [0, 1, 2].forEach(i => { c.beginPath(); c.arc(W2 - 120 - i * 95, H2 - 90 - (i % 2) * 70, 38, 0, Math.PI * 2); c.fill(); });
        if (ph.hasil) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W2, H2); const win = ph.hasil === 'menang'; c.fillStyle = win ? '#ffd84a' : '#ff6b6b'; c.font = '900 120px Oswald';
          c.fillText(win ? 'MENANG!' : 'KALAH', W2 / 2, H2 / 2 + 40 + Math.sin(lt * 6) * 4); }
        c.restore(); return;
      }
      if (ph.jenis === 'retak') {
        c.fillStyle = '#0d0d0d'; c.fillRect(0, 0, 540, 1080); c.globalAlpha = 0.35 + 0.25 * Math.sin(lt * 9); c.fillStyle = '#3a5a8a'; c.fillRect(0, 0, 540, 1080); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(235,240,255,0.85)'; c.lineWidth = 3; const cx = 330, cy = 420;
        for (let i = 0; i < 14; i++) { const a = i * 0.45 + 0.2; c.beginPath(); c.moveTo(cx, cy); let x = cx, y = cy; for (let j = 0; j < 4; j++) { x += Math.cos(a + j * 0.3) * 90; y += Math.sin(a - j * 0.2) * 90; c.lineTo(x, y); } c.stroke(); }
        for (let r = 40; r < 160; r += 55) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
        return;
      }
      if (ph.jenis === 'notif') { drawLock(c, { time: ph.jam || '19.42', date: ph.hari ? ph.hari + ', 14 Juli' : undefined, notifs: [{ title: ph.judul || '', body: ph.pesan?.[0] || '', av }] }); return; }
      drawChat(c, { title: ph.judul || '', subtitle: ph.sub || '', dark: !!ph.gelap, group: !!ph.grup, av, time: ph.jam,
        messages: (ph.pesan || []).map((m, i) => { const [from, text] = m.includes(':') && ph.grup ? m.split(/:(.*)/s) : ['', m];
          if (m.trim().startsWith('#')) return { kind: 'sys', text: m.trim().slice(1).trim(), alpha: pop(lt, (i / Math.max(1, n)) * dur * 0.7) };
          return { from: from.trim(), text: text.trim().replace(/^>/, ''), me: m.trim().startsWith('>'), color: ['#d35400', '#8e44ad', '#2980b9', '#16a085'][i % 4], alpha: pop(lt, (i / Math.max(1, n)) * dur * 0.7) }; }) });
      if (ph.banner) drawBanner(c, ease(Math.min(1, lt / 0.5)), { title: ph.banner[0], body: ph.banner[1], av: { unknown: true } });
    }, grade: d.grade || (ph.gelap ? 'ancaman' : L.grade) });
}

export function autoEpisode(data) {
  const shots = data.shots.map(autoShot);
  if (data.endcard) shots.push({ t0: data.endcard, t1: data.duration, endcard: true });
  return { shots, duration: data.duration };
}
