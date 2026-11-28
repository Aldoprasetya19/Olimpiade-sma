// Teaser sinematik "VOKALIS DADAKAN" — selaras lagu "Ratusan Bintang" (versi pop, 174,6 dtk), landscape (LAND=1).
// Shot memakai autoShot (lokasi, alat band, pose, kamera otomatis dari seri "Satu Lagu"), dibungkus letterbox + kartu judul + teks dialog.
import { autoShot } from '../lib/auto.js';
import { ease, seg, mixGrade, W, H } from '../lib/core.js';

export const duration = 174.6;

// ---------- data shot ringkas
const BAND = { gitaris: 'febri', bassis: 'stefan', keyboardis: 'gelly', drummer: 'gabriel' };
const MAIN = { febri: 'gitarBerdiri', stefan: 'bass', gelly: 'keyboard', gabriel: 'drum' };
const DEPAN = { d1: 'hissari', d2: 'misel', d3: 'aulia', d4: 'dayinta', d5: 'elisabeth', d6: 'manohara', d7: 'septi', d8: 'kharan', d9: 'justin', d10: 'mila', d11: 'sera' };
const nyala = (n) => Object.fromEntries(Object.values(DEPAN).slice(0, n).map(k => [k, 'senter']));
const senyumDepan = Object.fromEntries(Object.values(DEPAN).map(k => [k, 'senyum']));
const TALK = [[2.6, 7.6, 'aldo'], [8.0, 12.5, 'aldo'], [13.0, 17.2, 'nava'], [19.4, 22.4, 'nava'], [23.3, 24.4, 'gelly'], [53.8, 56.2, 'aldo'], [69, 71, 'aldo'], [76.0, 78.3, 'aldo'],
  [104.0, 105.4, 'nava'], [116.0, 119.6, 'aldo'], [119.7, 138.4, 'aldo'], [151.2, 153.4, 'nava'], [155.0, 158.3, 'aldo']];
const D = [];
function s(t0, t1, loc, cast, cam, o = {}) { D.push({ t0, t1, loc, cast, cam, expr: o.e || {}, pose: o.p || {}, acts: o.a || [], hold: {}, talk: TALK, ceria: o.ceria, diam: o.diam, camFix: o.fix, camEnd: o.end, sepi: true, ...(o.x || {}) }); }

// INTRO 0–17,3: kunci pintu diklik, Aldo bernyanyi diam-diam di kamar, montage studio
s(0, 7.9, 'kamar', { p1: 'aldo' }, 'cu:aldo', { e: { aldo: 'merem' }, p: { aldo: 'micDua' }, fix: { pos: [1.6, 2.0, 2.6], look: [0, 1.75, 0], fov: 34 }, end: { pos: [1.0, 1.95, 1.9], look: [0, 1.8, 0], fov: 30 }, x: { hitamSampai: 2.4 } });
s(7.9, 12.9, 'kamar', { p1: 'aldo' }, 'cu:aldo', { e: { aldo: 'merem' }, p: { aldo: 'micDua' }, fix: { pos: [-0.9, 1.85, 2.4], look: [0, 1.85, 0], fov: 30 }, end: { pos: [-0.6, 1.85, 1.9], look: [0, 1.9, 0], fov: 28 } });
s(12.9, 14.0, 'studio', { ...BAND, vokal: 'nava', sudut: 'aldo' }, 'cu:febri', { p: { ...MAIN, nava: 'vokal', aldo: 'angkat' }, e: { febri: 'fokus' } });
s(14.0, 15.0, 'studio', { ...BAND, vokal: 'nava', sudut: 'aldo' }, 'drummer:gabriel', { p: { ...MAIN, nava: 'vokal' }, e: { gabriel: 'senang' }, ceria: true });
s(15.0, 16.1, 'studio', { ...BAND, vokal: 'nava', sudut: 'aldo' }, 'mcu:nava', { p: { ...MAIN, nava: 'vokal' }, e: { nava: 'senang' }, ceria: true });
s(16.1, 17.3, 'studio', { ...BAND, vokal: 'nava', sudut: 'aldo' }, 'cu:aldo', { p: { ...MAIN, nava: 'vokal', aldo: 'angkat' }, e: { aldo: 'senyum' } });
// VERSE 1 17,3–26,1: suara Nava hilang, Gelly menunjuk Aldo, mikrofon disodorkan
s(17.3, 19.4, 'studio', { ...BAND, vokal: 'nava#syal', sudut: 'aldo' }, 'masuk', { p: { ...MAIN, nava: 'lehar' }, e: { nava: 'sedih' }, diam: true, a: [{ who: 'nava', a: 'jalan', t: 17.4, dur: 1.9, dari: 'pintu' }] });
s(19.4, 21.7, 'studio', { ...BAND, vokal: 'nava#syal', sudut: 'aldo' }, 'cu:nava', { p: { ...MAIN, nava: 'lehar' }, e: { nava: 'sedih' }, diam: true });
s(21.7, 23.2, 'studio', { ...BAND, vokal: 'nava#syal', sudut: 'aldo' }, 'lebar', { p: MAIN, e: { febri: 'kaget', stefan: 'kaget', gelly: 'kaget', gabriel: 'kaget', aldo: 'kaget', nava: 'sedih' }, diam: true, fix: { pos: [0.4, 2.4, 3.9], look: [-0.5, 1.4, -1.6], fov: 46 },
  a: ['febri', 'stefan', 'gabriel', 'nava'].map(w => ({ who: w, a: 'tatap', t: 21.8, dur: 1.4, to: '*' })) });
s(23.2, 24.6, 'studio', { ...BAND, vokal: 'nava#syal', sudut: 'aldo' }, 'cu:gelly', { p: { ...MAIN, gelly: 'tunjuk' }, e: { gelly: 'senyum' }, diam: true });
s(24.6, 26.1, 'studio', { depanSudut: 'febri', sudut: 'aldo', keyboardis: 'gelly', drummer: 'gabriel' }, 'dua', { p: { febri: 'sodorMic', aldo: 'ngeri', gelly: 'keyboard', gabriel: 'drum' }, e: { febri: 'senang', aldo: 'kaget' }, diam: true, fix: { pos: [-0.3, 1.95, 3.9], look: [-2.8, 1.6, 1.5], fov: 38 } });
// 26,1–35,1: latihan darurat yang kacau
s(26.1, 28.1, 'studio', { ...BAND, vokal: 'aldo' }, 'cu:febri', { p: { ...MAIN, aldo: 'micDua' }, e: { febri: 'fokus', aldo: 'cemas' } });
s(28.1, 30.1, 'studio', { ...BAND, vokal: 'aldo' }, 'cu:stefan', { p: { ...MAIN, aldo: 'micDua' }, e: { stefan: 'fokus', aldo: 'cemas' } });
s(30.1, 31.6, 'studio', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { ...MAIN, aldo: 'micDua' }, e: { aldo: 'cemas' } });
s(31.6, 32.9, 'studio', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { ...MAIN, aldo: 'garuk' }, e: { aldo: 'malu' }, diam: true });
s(32.9, 34.1, 'studio', { ...BAND, vokal: 'aldo' }, 'mcu:aldo', { p: { ...MAIN, aldo: 'gemetar' }, e: { aldo: 'cemas' }, diam: true });
s(34.1, 35.6, 'studio', { ...BAND, vokal: 'aldo' }, 'drummer:gabriel', { p: { ...MAIN, aldo: 'gemetar', gabriel: 'drum' }, e: { gabriel: 'senyum' }, diam: true });
// CHORUS 1 35,6–53,5: pesan grup menyala di kamar gelap -> Sabtu malam, panggung kelas 12, Aldo di belakang panggung
s(35.6, 37.6, 'kamar', { pinggirKasur: 'aldo' }, 'mcu:aldo', { p: { aldo: 'hp' }, e: { aldo: 'netral' }, x: { grade: 'malam' } });
D.push({ t0: 37.6, t1: 40.0, loc: 'kamar', cast: { pinggirKasur: 'aldo' }, cam: 'hp', expr: {}, pose: { aldo: 'hp' }, talk: [], jam: '21.07', hari: 'Kamis',
  phone: { judul: 'Grup SMAN 1 NYUATAN', pesan: ['Panitia: Susunan Acara Pentas Seni', 'Panitia: 6. Band Kelas 12', 'Panitia: 7. Band Kelas 11 — Vokal: ALDO'], jenis: 'chat', grup: true } });
s(40.0, 42.2, 'panggung', { gitaris: 'rialdi', drummer: 'dika', bassis: 'palsya' }, 'penonton', { p: { rialdi: 'gitarBerdiri', dika: 'drum', palsya: 'bass' }, ceria: true, end: { pos: [1.0, 4.6, 16.5], look: [0, 2.7, -5], fov: 34 } });
s(42.2, 44.4, 'panggung', { gitaris: 'rialdi', drummer: 'dika', bassis: 'palsya' }, 'lebar', { p: { rialdi: 'gitarBerdiri', dika: 'drum', palsya: 'bass' }, e: { rialdi: 'senang', dika: 'senang' }, ceria: true });
s(44.4, 46.6, 'panggung', { gitaris: 'rialdi', drummer: 'dika', bassis: 'palsya' }, 'cu:rialdi', { p: { rialdi: 'gitarBerdiri', dika: 'drum', palsya: 'bass' }, e: { rialdi: 'senang' }, ceria: true, x: { lompat: 'rialdi' } });
s(46.6, 48.6, 'panggung', { gitaris: 'rialdi', drummer: 'dika', bassis: 'palsya' }, 'drummer:dika', { p: { rialdi: 'gitarBerdiri', dika: 'drum', palsya: 'bass' }, e: { dika: 'senang' }, ceria: true });
s(48.6, 51.0, 'panggung', { gitaris: 'rialdi', drummer: 'dika', bassis: 'palsya' }, 'penonton', { p: { rialdi: 'gitarBerdiri', dika: 'drum', palsya: 'bass' }, ceria: true, fix: { pos: [-3, 2.2, 9], look: [0, 2.6, -4], fov: 46 } });
s(51.0, 53.5, 'belakangPanggung', { tunggu: 'aldo' }, 'cu:aldo', { p: { aldo: 'usap' }, e: { aldo: 'cemas' } });
// INSTRUMENTAL 53,5–69: kabur, ditahan Nava, MC, ke tengah panggung
s(53.5, 56.5, 'belakangPanggung', { tunggu: 'aldo' }, 'cu:aldo', { p: { aldo: 'usap' }, e: { aldo: 'cemas' } });
s(56.5, 59.0, 'belakangPanggung', { tunggu: 'aldo' }, 'lebar', { e: { aldo: 'cemas' }, fix: { pos: [-0.5, 2.1, -2.3], look: [1.4, 1.3, 5], fov: 46 }, a: [{ who: 'aldo', a: 'pergi', t: 56.7, dur: 2.3 }] });
s(59.0, 61.0, 'belakangPanggung', { menuju: 'aldo', penahan: 'nava#syal' }, 'dua', { p: { nava: 'serahkan' }, e: { aldo: 'kaget', nava: 'serius' }, a: [{ who: 'aldo', a: 'menoleh', t: 59.4, dur: 0.5, arah: 1 }] });
s(61.0, 62.3, 'belakangPanggung', { menuju: 'aldo', penahan: 'nava#syal' }, 'cu:nava', { p: { nava: 'tunjuk' }, e: { nava: 'senyum' } });
s(62.3, 63.6, 'belakangPanggung', { menuju: 'aldo', penahan: 'nava#syal' }, 'cu:nava', { p: { nava: 'jempol' }, e: { nava: 'senyum', aldo: 'lega' } });
s(63.6, 66.0, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'penonton', { p: MAIN, diam: true });
s(66.0, 68.0, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'lebar', { p: MAIN, diam: true, e: { aldo: 'cemas' }, a: [{ who: 'aldo', a: 'jalan', t: 66.0, dur: 1.9 }] });
s(68.0, 69.1, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { ...MAIN, aldo: 'vokal' }, diam: true, e: { aldo: 'cemas' } });
// VERSE 3 69–87,3: feedback, membeku, suara pecah, tawa dari belakang
s(69.1, 71.6, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { ...MAIN, aldo: 'telinga' }, diam: true, e: { aldo: 'kaget' } });
s(71.6, 74.0, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'sorot', { p: { ...MAIN, aldo: 'vokal' }, diam: true, e: { aldo: 'kaget' } });
s(74.0, 76.0, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'cu:gelly', { p: { gelly: 'keyboard', aldo: 'vokal', febri: 'gitarBerdiri', stefan: 'bass', gabriel: 'drum' }, e: { gelly: 'fokus' } });
s(76.0, 78.5, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { gelly: 'keyboard', aldo: 'vokal' }, e: { aldo: 'malu' } });
s(78.5, 81.0, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'penonton', { p: { gelly: 'keyboard', aldo: 'vokal' } });
s(81.0, 85.8, 'panggungSorot', { ...BAND, vokal: 'aldo' }, 'cu:aldo', { p: { aldo: 'tunduk' }, e: { aldo: 'merem' } });
s(85.8, 87.3, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { e: senyumDepan, x: { senterMati: true } });
// CHORUS 2 87,3–108,3: lautan cahaya senter
s(87.3, 90.6, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { p: nyala(1), e: senyumDepan });
s(90.6, 92.3, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'cu:hissari', { p: nyala(1), e: { hissari: 'senyum' } });
s(92.3, 94.4, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { p: nyala(3), e: senyumDepan });
s(94.4, 96.8, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { p: nyala(7), e: senyumDepan, fix: { pos: [-1.2, 2.5, -2.2], look: [0.6, 1.8, 1.8], fov: 50 } });
s(96.8, 99.0, 'panggungGelap', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { p: nyala(11), e: senyumDepan, fix: { pos: [1.6, 2.6, -2.2], look: [-0.4, 1.8, 1.8], fov: 52 } });
s(99.0, 101.1, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'penonton', { p: { ...nyala(11), ...MAIN, aldo: 'vokal' }, diam: true, end: { pos: [0.6, 6.5, 22], look: [0, 2.4, -5], fov: 36 } });
s(101.1, 103.6, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'cu:aldo', { p: { ...nyala(11), aldo: 'vokal' }, e: { aldo: 'nangis' } });
s(103.6, 105.9, 'panggungSenter', { vokal: 'aldo', sisiPanggung: 'nava#syal', keyboardis: 'gelly' }, 'cu:nava', { p: { nava: 'tunjukMata', aldo: 'vokal' }, e: { nava: 'serius' } });
s(105.9, 108.3, 'panggungSenter', { vokal: 'aldo', sisiPanggung: 'nava#syal', keyboardis: 'gelly' }, 'cu:nava', { p: { nava: 'tunjuk', aldo: 'vokal' }, e: { nava: 'senyum' } });
// BRIDGE 108,3–119,7: napas panjang, angguk ke Gelly, intro diulang
s(108.3, 111.6, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'cu:aldo', { p: { aldo: 'vokal' }, e: { aldo: 'merem' } });
s(111.6, 113.5, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'cu:aldo', { p: { aldo: 'vokal' }, e: { aldo: 'serius' }, a: [{ who: 'aldo', a: 'angguk', t: 112.0, dur: 1.2 }] });
s(113.5, 116.0, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'cu:gelly', { p: { gelly: 'keyboard', aldo: 'vokal' }, e: { gelly: 'senyum' } });
s(116.0, 119.7, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'sorot', { p: { gelly: 'keyboard', gabriel: 'drum', aldo: 'vokal', ...nyala(11) }, e: { aldo: 'fokus' }, fix: { pos: [0, 3.3, 0.4], look: [0, 2.75, -4.3], fov: 32 }, end: { pos: [0, 3.0, -1.2], look: [0, 2.8, -4.3], fov: 32 } });
// FINAL CHORUS 119,7–138,5: bernyanyi lantang, band penuh energi, seluruh lapangan ikut bernyanyi
s(119.7, 123.1, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'lebar', { p: { ...MAIN, aldo: 'vokal', ...nyala(11) }, e: { aldo: 'senang', febri: 'senang', stefan: 'senang' }, ceria: true });
s(123.1, 125.1, 'panggungSenter', { ...BAND, vokal: 'aldo' }, 'cu:febri', { p: { ...MAIN, aldo: 'vokal' }, e: { febri: 'senang' }, ceria: true });
s(125.1, 127.2, 'panggungSenter', { ...BAND, vokal: 'aldo' }, 'cu:stefan', { p: { ...MAIN, aldo: 'vokal' }, e: { stefan: 'senang' }, ceria: true });
s(127.2, 129.6, 'panggungSenter', { ...BAND, vokal: 'aldo' }, 'drummer:gabriel', { p: { ...MAIN, aldo: 'vokal' }, e: { gabriel: 'senang' }, ceria: true });
s(129.6, 133.9, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'penonton', { p: { ...MAIN, aldo: 'vokal', ...nyala(11) }, ceria: true, end: { pos: [2.5, 3.0, 12], look: [0, 2.6, -5], fov: 36 } });
s(133.9, 138.5, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'cu:aldo', { p: { ...MAIN, aldo: 'vokal' }, e: { aldo: 'senang' }, ceria: true });
// OUTRO 138,5–165,3: tepuk tangan, pelukan di belakang panggung
s(138.5, 142.2, 'panggung', { ...BAND, vokal: 'aldo' }, 'penonton', { p: { aldo: 'sorak', febri: 'sorak', stefan: 'sorak' }, e: { aldo: 'senang', febri: 'senang', stefan: 'senang', gelly: 'senang', gabriel: 'senang' } });
s(142.2, 146.6, 'panggungSenter', { vokal: 'aldo', ...DEPAN }, 'barisDepan', { p: Object.fromEntries(Object.values(DEPAN).map(k => [k, 'sorak'])), e: Object.fromEntries(Object.values(DEPAN).map(k => [k, 'senang'])) });
s(146.6, 151.0, 'belakangPanggung', { sampingA: 'aldo', sampingB: 'nava#syal' }, 'dua', { p: { nava: 'rangkulKanan', aldo: 'rangkulKiri' }, e: { aldo: 'senang', nava: 'senang' }, fix: { pos: [0.1, 1.95, 4.0], look: [0.1, 1.6, -0.6], fov: 38 }, end: { pos: [0.1, 1.95, 3.3], look: [0.1, 1.7, -0.6], fov: 36 } });
s(151.0, 155.0, 'belakangPanggung', { sampingA: 'aldo', sampingB: 'nava#syal' }, 'cu:nava', { p: { nava: 'rangkulKanan', aldo: 'rangkulKiri' }, e: { nava: 'senyum' }, fix: { pos: [1.0, 1.95, 2.2], look: [0.5, 1.9, -0.65], fov: 32 } });
s(155.0, 158.6, 'belakangPanggung', { sampingA: 'aldo', sampingB: 'nava#syal' }, 'cu:aldo', { p: { aldo: 'gemetar', nava: 'rangkulKanan' }, e: { aldo: 'senang' }, fix: { pos: [-0.8, 1.95, 2.2], look: [-0.3, 1.85, -0.6], fov: 32 } });
s(158.6, 163.0, 'belakangPanggung', { sampingA: 'aldo', sampingB: 'nava#syal' }, 'lebar', { e: { aldo: 'senang', nava: 'senang' }, fix: { pos: [0.15, 2.0, 5.2], look: [0.15, 1.5, -0.6], fov: 40 }, end: { pos: [0.15, 2.4, 7.0], look: [0.15, 1.6, -0.6], fov: 42 } });
s(163.0, 174.6, 'panggungSenter', { ...BAND, vokal: 'aldo', ...DEPAN }, 'penonton', { p: { ...nyala(11), aldo: 'vokal' }, e: { aldo: 'senyum' }, fix: { pos: [0.8, 3.6, 13], look: [0, 2.6, -5], fov: 36 }, end: { pos: [0.4, 7.5, 24], look: [0, 2.4, -5], fov: 36 } });

// ---------- HUD sinematik
const BAR = () => (H > W ? 150 : 88);
const KARTU = [
  { a: 13.4, b: 17.3, l: ['PANGGUNG BUKAN TEMPATNYA.'] },
  { a: 30.3, b: 35.4, l: ['DUA HARI MENUJU', 'PENTAS SENI.'] },
  { a: 81.4, b: 87.1, l: ['TIGA RATUS PASANG MATA', 'MENATAP DALAM DIAM.'] },
  { a: 165.3, b: 999, l: ['VOKALIS DADAKAN'], sub: 'Berani adalah tetap bernyanyi, walaupun takut.' },
];
const DIALOG = [
  [19.5, 23.0, 'NAVA', '#8FE3D8', '(berbisik serak) "Radang tenggorokan... kata dokter nggak boleh nyanyi seminggu."'],
  [23.3, 24.6, 'GELLY', '#9BE3B0', '"Aldo bisa."'],
  [53.7, 56.4, 'ALDO', '#FFFFFF', '(berbisik panik) "Aku nggak bisa. Aku pulang aja."'],
  [63.8, 66.0, 'MC', '#FFD84A', '"Selanjutnya... Band Kelas 11!"'],
  [104.0, 107.8, 'NAVA', '#8FE3D8', '(tanpa suara) "Lihat aku aja."'],
  [151.2, 154.8, 'NAVA', '#8FE3D8', '(berbisik serak) "Tahun depan kita duet."'],
];
function kartuAlpha(t) { for (const c of KARTU) if (t >= c.a && t < c.b) return [c, ease(seg(t, c.a, c.a + 0.8)) * (1 - ease(seg(t, c.b - 0.6, c.b)))]; return [null, 0]; }
function hudSinema(hud, t) {
  const B = BAR(); hud.fillStyle = '#000'; hud.fillRect(0, 0, W, B); hud.fillRect(0, H - B, W, B);
  for (const [a, b, nm, col, tx] of DIALOG) if (t >= a && t < b) {
    const al = Math.min(1, (t - a) / 0.25, (b - t) / 0.25); hud.save(); hud.globalAlpha = al; hud.textAlign = 'center'; hud.textBaseline = 'middle';
    hud.font = 'italic 600 28px Nunito'; const w = Math.min(W - 80, hud.measureText(tx).width + 40), y = H - B - 54;
    hud.fillStyle = 'rgba(0,0,0,0.55)'; hud.beginPath(); hud.roundRect(W / 2 - w / 2, y - 26, w, 52, 14); hud.fill();
    hud.font = '700 22px Oswald'; const nw = hud.measureText(nm).width + 24; hud.fillStyle = col; hud.beginPath(); hud.roundRect(W / 2 - w / 2 + 10, y - 50, nw, 28, 8); hud.fill();
    hud.fillStyle = '#111'; hud.fillText(nm, W / 2 - w / 2 + 10 + nw / 2, y - 36); hud.fillStyle = '#fff'; hud.font = 'italic 600 28px Nunito'; hud.fillText(tx, W / 2, y + 1); hud.restore();
  }
  const [c, a] = kartuAlpha(t); if (!c || a <= 0) return;
  hud.save(); hud.globalAlpha = a; hud.textAlign = 'center'; hud.textBaseline = 'middle';
  const sc = 1 + (1 - a) * 0.06; hud.translate(W / 2, H / 2 - 20); hud.scale(sc, sc); hud.shadowColor = 'rgba(0,0,0,0.6)'; hud.shadowBlur = 18;
  const fs = c.sub ? 84 : 58; hud.font = `700 ${fs}px Oswald`; hud.fillStyle = '#fff';
  c.l.forEach((s2, i) => hud.fillText(s2, 0, (i - (c.l.length - 1) / 2) * fs * 1.15));
  hud.fillStyle = '#f2c230'; hud.fillRect(-90, (c.l.length / 2) * fs * 1.15 + 6, 180, 5);
  if (c.sub) { hud.font = 'italic 600 32px Nunito'; hud.fillStyle = '#f3ede2'; hud.fillText(c.sub, 0, (c.l.length / 2) * fs * 1.15 + 56); }
  hud.restore();
}

// ---------- bungkus autoShot
export const shots = D.map((d) => {
  const sh = autoShot(d);
  return { t0: d.t0, t1: d.t1, build(S) {
    const up = sh.build(S) || (() => {});
    return (lt, k, t, hud) => {
      let g = up(lt, k, t, hud) || 'hangat';
      if (W > H) { S.cam.fov *= 1.12; S.cam.updateProjectionMatrix(); }
      hudSinema(hud, t);
      const [, a] = kartuAlpha(t); if (a > 0) g = mixGrade(g, { overlayColor: [0, 0, 0], overlayAmt: 0.5, blur: 2.5 }, a);
      if (d.hitamSampai && t < d.hitamSampai) g = mixGrade(g, { overlayColor: [0, 0, 0], overlayAmt: 1 }, 1 - ease(seg(t, d.hitamSampai - 1.0, d.hitamSampai)));
      if (t > duration - 2.2) g = mixGrade(g, { overlayColor: [0, 0, 0], overlayAmt: 1 }, ease(seg(t, duration - 2.2, duration - 0.2)));
      return g;
    };
  } };
});
export const meta = { title: ['VOKALIS', 'DADAKAN'] };
