// Daftar pemeran (desain karakter tetap konsisten antar episode).
import { Char } from './char.js';
import { CAST_REF } from './sets.js';
const SERAGAM = { shirt: '#f4f2ec', pants: '#6b6e75' };

// ---------- DAFTAR TOKOH TETAP (jangan diubah tanpa permintaan pengguna) ----------
// jk: L/P, kelas: 10/11/12 (warna lencana dada: 10 hijau, 11 biru, 12 merah), lihat juga engine/TOKOH.md
const LENCANA = { 10: '#2e9e4f', 11: '#2f5fb3', 12: '#c0392b' };
export const TOKOH = {
  aldo: { jk: 'L', kelas: 11, skin: '#c98a52', hair: '#241a14', hairStyle: 'spiky', utama: true },
  aldos: { jk: 'L', kelas: 11, label: 'ALDO S.', skin: '#b98050', hair: '#2a1c12', hairStyle: 'bowl' },
  gelly: { jk: 'L', kelas: 11, skin: '#d8a06c', hair: '#3a281d', hairStyle: 'teacher', glasses: true },
  stefan: { jk: 'L', kelas: 11, skin: '#e0b07e', hair: '#5a3a22', hairStyle: 'curly' },
  febri: { jk: 'L', kelas: 11, skin: '#b07040', hair: '#1f1712', hairStyle: 'bowl', wristband: '#27ae60' },
  gabriel: { jk: 'L', kelas: 11, skin: '#d29a62', hair: '#4a3020', hairStyle: 'spiky', jacket: '#2c3e66' },
  nava: { jk: 'L', kelas: 11, skin: '#a8703f', hair: '#1c1410', hairStyle: 'teacher' },
  kharan: { jk: 'L', kelas: 10, skin: '#d8a874', hair: '#2a1c12', hairStyle: 'bowl', wristband: '#f39c12' },
  justin: { jk: 'L', kelas: 10, skin: '#c4895a', hair: '#1f1712', hairStyle: 'spiky', wristband: '#2d7dd2' },
  rialdi: { jk: 'L', kelas: 12, skin: '#b0733f', hair: '#2b1d14', hairStyle: 'sidepart', jacket: '#7a2e2e' },
  dika: { jk: 'L', kelas: 12, skin: '#d29a62', hair: '#3b2a1f', hairStyle: 'curly' },
  palsya: { jk: 'L', kelas: 12, skin: '#a46a3a', hair: '#1f1712', hairStyle: 'sidepart', glasses: true },
  hissari: { jk: 'P', kelas: 11, skin: '#c98a52', hair: '#4a2c1c', hairStyle: 'panjang' },
  misel: { jk: 'P', kelas: 11, skin: '#e0b07e', hair: '#2a1d16', hairStyle: 'kuncir' },
  aulia: { jk: 'P', kelas: 11, skin: '#d49a64', hair: '#3a2418', hairStyle: 'bob' },
  dayinta: { jk: 'P', kelas: 11, skin: '#c48550', hair: '#2a1d16', hairStyle: 'panjang', glasses: true },
  elisabeth: { jk: 'P', kelas: 11, skin: '#e8bc8c', hair: '#6b4a2a', hairStyle: 'bob' },
  manohara: { jk: 'P', kelas: 11, skin: '#c98a52', hair: '#1f1712', hairStyle: 'panjang' },
  septi: { jk: 'P', kelas: 11, skin: '#d29a62', hair: '#3a2418', hairStyle: 'kuncir', glasses: true },
  nikita: { jk: 'P', kelas: 10, skin: '#d8a06c', hair: '#5a3a22', hairStyle: 'kuncir' },
  naura: { jk: 'P', kelas: 10, skin: '#b98050', hair: '#2a1d16', hairStyle: 'bob' },
  sisil: { jk: 'P', kelas: 10, skin: '#e0b07e', hair: '#6b4a2a', hairStyle: 'panjang' },
  mila: { jk: 'P', kelas: 12, skin: '#e0b07e', hair: '#2a1d16', hairStyle: 'panjang', glasses: true },
  sera: { jk: 'P', kelas: 12, skin: '#c4895a', hair: '#1f1712', hairStyle: 'bob' },
};
// baju santai tetap per tokoh (dipakai otomatis di luar sekolah)
const BAJU = { aldo: '#2f4b7c', aldos: '#8a3b3b', gelly: '#3f6b4a', stefan: '#d9822b', febri: '#5b4a8a', gabriel: '#2c3e66', nava: '#1f7a7a',
  kharan: '#b5651d', justin: '#2d7dd2', rialdi: '#4a4a4a', dika: '#a0522d', palsya: '#556b2f', hissari: '#c06c84', misel: '#e2a72e', aulia: '#6c5b7b',
  dayinta: '#355c7d', elisabeth: '#f67280', manohara: '#99b898', septi: '#8e7cc3', nikita: '#e06666', naura: '#6fa8dc', sisil: '#ffb07c', mila: '#7a5c9e', sera: '#2a9d8f' };
export function santai(key) {
  const t = TOKOH[key]; if (!t) return {}; const c = BAJU[key] || '#5d6d7e';
  return { shirt: c, sleeve: c, pants: t.jk === 'P' ? '#3b4a6b' : '#2f3640', skirt: null, badge: false, name: null, collar: false, longSleeve: false, jacket: key === 'rialdi' ? '#7a2e2e' : key === 'gabriel' ? '#2c3e66' : undefined };
}
export function murid(key, o = {}) {
  const t = TOKOH[key]; const { jk, kelas, label, utama, ...look } = t;
  const santaiP = o.skirt === null; if (santaiP) delete o.skirt;
  return new Char({ ...SERAGAM, ...(jk === 'P' && !santaiP ? { skirt: '#6b6e75', longSleeve: true } : {}), ...look, name: label || key.toUpperCase(),
    badgeColor: LENCANA[kelas], blinkSeed: [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 30 / 10, ...o });
}
export const CAST = {
  aldo: (o = {}) => murid('aldo', o),
  aldoRumah: (o = {}) => new Char({ skin: '#c98a52', hair: '#241a14', hairStyle: 'spiky', shirt: '#2f4b7c', pants: '#3b3b44', badge: false, collar: false, blinkSeed: 0.3, ...o }),
  dimas: (o = {}) => new Char({ ...SERAGAM, skin: '#e0b07e', hair: '#3a2a1e', hairStyle: 'bowl', name: 'DIMAS', glasses: true, blinkSeed: 1.1, ...o }),
  reno: (o = {}) => new Char({ ...SERAGAM, skin: '#a8703f', hair: '#1c1410', hairStyle: 'curly', name: 'RENO', jacket: '#2b2f36', blinkSeed: 2.0, ...o }),
  bagas: (o = {}) => new Char({ ...SERAGAM, skin: '#b97a45', hair: '#2a1c12', hairStyle: 'sidepart', name: 'BAGAS', wristband: '#d63c3c', blinkSeed: 1.7, ...o }),
  ibu: (o = {}) => new Char({ skin: '#c48550', hair: '#2e211a', hairStyle: 'panjang', shirt: '#4f8a7a', skirt: '#3e5d6e', apron: '#f3e2c2', badge: false, collar: false, longSleeve: true, sleeve: '#4f8a7a', blinkSeed: 0.9, ...o }),
  wali: (o = {}) => new Char({ skin: '#b67b48', hair: '#555049', hairStyle: 'teacher', shirt: '#8a4b2a', pants: '#2f2f35', badge: false, mustache: true, glasses: true, blinkSeed: 2.4, ...o }),
  pekerja: (o = {}) => new Char({ skin: '#a96f3d', hairStyle: 'helmet', shirt: '#3d5a80', vest: '#ff8c1a', pants: '#34495e', badge: false, collar: false, blinkSeed: 0.5, ...o }),
  eko: (o = {}) => new Char({ skin: '#b67b48', hair: '#3a3530', hairStyle: 'teacher', shirt: '#2f5d8a', pants: '#2f2f35', badge: false, mustache: true, blinkSeed: 1.5, ...o }),
  agus: (o = {}) => new Char({ skin: '#a96f3d', hair: '#4a4540', hairStyle: 'teacher', shirt: '#6b4a8a', pants: '#2f2f35', badge: false, glasses: true, blinkSeed: 0.8, ...o }),
  crispin: (o = {}) => new Char({ skin: '#c48a5a', hair: '#5a5550', hairStyle: 'sidepart', shirt: '#2e7d5b', pants: '#2f2f35', badge: false, blinkSeed: 2.1, ...o }),
  almis: (o = {}) => new Char({ skin: '#b98050', hair: '#2f2a26', hairStyle: 'teacher', shirt: '#8e3b46', pants: '#2f2f35', badge: false, glasses: true, mustache: true, blinkSeed: 1.2, ...o }),
  pakgelly: (o = {}) => new Char({ skin: '#b98050', hair: '#8a8580', hairStyle: 'teacher', shirt: '#5b6b3a', pants: '#3b3b44', apron: '#6b4a2f', badge: false, collar: false, mustache: true, name: null, blinkSeed: 2.6, ...o }),
  siswa: (i = 0, o = {}) => new Char({ ...SERAGAM, skin: ['#c98a52', '#e0b07e', '#b07040', '#d49a64'][i % 4], hair: '#2a2018', hairStyle: ['sidepart', 'bowl', 'curly', 'spiky'][i % 4], blinkSeed: i * 0.77, ...o }),
  siswi: (i = 0, o = {}) => new Char({ ...SERAGAM, skirt: '#6b6e75', skin: ['#d49a64', '#c98a52', '#e0b07e'][i % 3], hair: '#2a1d16', hairStyle: 'panjang', longSleeve: true, blinkSeed: i * 0.53, ...o }),
};
for (const k of Object.keys(TOKOH)) if (!CAST[k]) CAST[k] = (o = {}) => murid(k, o);
CAST_REF.siswa = CAST.siswa; CAST_REF.siswi = CAST.siswi;
