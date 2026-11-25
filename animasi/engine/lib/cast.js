// Daftar pemeran (desain karakter tetap konsisten antar episode).
import { Char } from './char.js';
const SERAGAM = { shirt: '#f4f2ec', pants: '#6b6e75' };
export const CAST = {
  aldo: (o = {}) => new Char({ ...SERAGAM, skin: '#c98a52', hair: '#241a14', hairStyle: 'spiky', name: 'ALDO', blinkSeed: 0.3, ...o }),
  aldoRumah: (o = {}) => new Char({ skin: '#c98a52', hair: '#241a14', hairStyle: 'spiky', shirt: '#2f4b7c', pants: '#3b3b44', badge: false, collar: false, blinkSeed: 0.3, ...o }),
  dimas: (o = {}) => new Char({ ...SERAGAM, skin: '#e0b07e', hair: '#3a2a1e', hairStyle: 'bowl', name: 'DIMAS', glasses: true, blinkSeed: 1.1, ...o }),
  reno: (o = {}) => new Char({ ...SERAGAM, skin: '#a8703f', hair: '#1c1410', hairStyle: 'curly', name: 'RENO', jacket: '#2b2f36', blinkSeed: 2.0, ...o }),
  bagas: (o = {}) => new Char({ ...SERAGAM, skin: '#b97a45', hair: '#2a1c12', hairStyle: 'sidepart', name: 'BAGAS', wristband: '#d63c3c', blinkSeed: 1.7, ...o }),
  ibu: (o = {}) => new Char({ skin: '#c48550', hair: '#2e211a', hairStyle: 'panjang', shirt: '#4f8a7a', skirt: '#3e5d6e', apron: '#f3e2c2', badge: false, collar: false, longSleeve: true, sleeve: '#4f8a7a', blinkSeed: 0.9, ...o }),
  wali: (o = {}) => new Char({ skin: '#b67b48', hair: '#555049', hairStyle: 'teacher', shirt: '#8a4b2a', pants: '#2f2f35', badge: false, mustache: true, glasses: true, blinkSeed: 2.4, ...o }),
  pekerja: (o = {}) => new Char({ skin: '#a96f3d', hairStyle: 'helmet', shirt: '#3d5a80', vest: '#ff8c1a', pants: '#34495e', badge: false, collar: false, blinkSeed: 0.5, ...o }),
  dika: (o = {}) => new Char({ ...SERAGAM, skin: '#d29a62', hair: '#3b2a1f', hairStyle: 'curly', name: 'DIKA', blinkSeed: 1.3, ...o }),
  gelly: (o = {}) => new Char({ ...SERAGAM, skin: '#d8a06c', hair: '#3a281d', hairStyle: 'teacher', name: 'GELLY', glasses: true, blinkSeed: 0.7, ...o }),
  justin: (o = {}) => new Char({ ...SERAGAM, skin: '#c4895a', hair: '#1f1712', hairStyle: 'spiky', name: 'JUSTIN', wristband: '#2d7dd2', blinkSeed: 2.2, ...o }),
  rialdi: (o = {}) => new Char({ ...SERAGAM, skin: '#b0733f', hair: '#2b1d14', hairStyle: 'sidepart', name: 'RIALDI', jacket: '#7a2e2e', blinkSeed: 0.4, ...o }),
  mila: (o = {}) => new Char({ ...SERAGAM, skirt: '#6b6e75', skin: '#e0b07e', hair: '#2a1d16', hairStyle: 'panjang', name: 'MILA', glasses: true, blinkSeed: 1.9, ...o }),
  hissari: (o = {}) => new Char({ ...SERAGAM, skirt: '#6b6e75', skin: '#c98a52', hair: '#4a2c1c', hairStyle: 'panjang', name: 'HISSARI', blinkSeed: 2.7, ...o }),
  eko: (o = {}) => new Char({ skin: '#b67b48', hair: '#3a3530', hairStyle: 'teacher', shirt: '#2f5d8a', pants: '#2f2f35', badge: false, mustache: true, blinkSeed: 1.5, ...o }),
  aldos: (o = {}) => new Char({ ...SERAGAM, skin: '#b98050', hair: '#2a1c12', hairStyle: 'bowl', name: 'ALDO S.', blinkSeed: 2.9, ...o }),
  agus: (o = {}) => new Char({ skin: '#a96f3d', hair: '#4a4540', hairStyle: 'teacher', shirt: '#6b4a8a', pants: '#2f2f35', badge: false, glasses: true, blinkSeed: 0.8, ...o }),
  siswa: (i = 0, o = {}) => new Char({ ...SERAGAM, skin: ['#c98a52', '#e0b07e', '#b07040', '#d49a64'][i % 4], hair: '#2a2018', hairStyle: ['sidepart', 'bowl', 'curly', 'spiky'][i % 4], blinkSeed: i * 0.77, ...o }),
  siswi: (i = 0, o = {}) => new Char({ ...SERAGAM, skirt: '#6b6e75', skin: ['#d49a64', '#c98a52', '#e0b07e'][i % 3], hair: '#2a1d16', hairStyle: 'panjang', longSleeve: true, blinkSeed: i * 0.53, ...o }),
};
