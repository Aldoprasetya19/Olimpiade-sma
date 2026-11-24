// Bagian 1: "Jangan Buka Grup Kelas" (VO 65,25 dtk)
import * as THREE from 'three';
import { CAST } from '../lib/cast.js';
import { SETS } from '../lib/sets.js';
import { POSES, combine, mixPose } from '../lib/char.js';
import { ease, easeOut, seg, lerp, clamp, mixGrade } from '../lib/core.js';
import { drawChat, drawLock, drawBanner, drawPlayerChrome, PW, PH } from '../lib/phoneui.js';
import { phoneInsert, stairsSetup, stairsEvent, handheld, footageView, talker, project, hudBubble, ring, phoneOnTable } from '../lib/shots.js';
import { phone } from '../lib/sets.js';

export const duration = 67.6;
const talk = talker([[53.06, 53.94, 'ibu'], [54.36, 55.3, 'aldo']]);

const AV = {
  naya: { skin: '#d9a06a', hair: '#e07a9a', hijab: true, bg: '#f6c1d0' },
  grup: { group: 'XII', bg: '#3f8a5c' },
  wali: { skin: '#b67b48', hair: '#555049', bg: '#a9c6e8' },
  anon: { unknown: true, bg: '#8b949e' },
};
const GROUP_MSGS = [
  { from: 'Sinta', text: 'GUYS liat video ini', color: '#d35400' },
  { from: 'Rio', text: 'itu @Aldo kan??', color: '#8e44ad' },
  { from: 'Maya', text: 'serius Aldo??', color: '#2980b9' },
  { from: 'Fikri', text: 'Aldo dorong Dimas???', color: '#16a085' },
  { from: 'Sinta', text: '@Aldo jelasin dong', color: '#d35400' },
  { from: 'Tio', text: 'gila sih', color: '#c0392b' },
  { from: 'Maya', text: 'Aldo kok gitu', color: '#2980b9' },
];
const grupBase = (msgs, extra = {}) => ({ title: 'XII IPA 2', subtitle: 'Sinta, Rio, Maya, Fikri, +32', group: true, av: AV.grup, messages: msgs, time: '19.43', ...extra });
const pop = (lt, at) => clamp((lt - at) / 0.25);

// tangan & ponsel Aldo di adegan rumah
function aldoRumah(S, { phoneInHand = true } = {}) {
  const info = SETS.rumah(S.scene);
  const a = CAST.aldoRumah(); S.add(a, [0, 0, 1.0], Math.PI);
  let ph = null;
  if (phoneInHand) { ph = phone(); a.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); }
  const ibu = CAST.ibu(); S.add(ibu, [2.0, 0, -4.1], Math.PI);
  return { a, ph, ibu, info };
}

export const shots = [
  // 1. Ponsel bergetar setelah makan
  { t0: 0, t1: 3.5, grade: 'malam', build(S) {
    const { a, ibu } = aldoRumah(S, { phoneInHand: false });
    const ph = phoneOnTable(S, [0.55, 0.96, 0.45], 0.3);
    return (lt, k, t) => {
      const buzz = lt > 0.3 && (lt % 1.0) < 0.55;
      ph.position.x = 0.55 + (buzz ? Math.sin(t * 95) * 0.012 : 0);
      ph.draw(c => drawLock(c, { time: '19.42', notifs: lt > 0.3 ? [{ title: 'Naya', body: 'Apapun yang terjadi, jangan buka grup kelas dulu.', av: AV.naya }] : [] }));
      const look = ease(seg(lt, 1.2, 1.8));
      a.act(combine(POSES.duduk, POSES.tanganMeja, { headX: 0.1 + look * 0.3, headY: -look * 0.35 }), lt > 1.4 ? 'curiga' : 'netral', t);
      ibu.act(combine(POSES.berdiri, POSES.bawa), 'netral', t, false, 2);
      S.camMove(k, { pos: [2.4, 2.5, 2.9], look: [0.4, 1.15, 0.3], fov: 42 }, { pos: [1.8, 2.2, 2.3], look: [0.45, 1.1, 0.35], fov: 38 });
      return 'malam';
    };
  } },
  // 2. Pesan dari Naya (layar kunci)
  { t0: 3.5, t1: 5.0, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26',
    vibrate: (lt) => (lt % 1) < 0.4 ? 1 : 0,
    draw: (c) => drawLock(c, { time: '19.42', notifs: [{ title: 'Naya', body: 'Apapun yang terjadi, jangan buka grup kelas dulu.', av: AV.naya }] }) }); } },
  // 3. Isi pesan Naya
  { t0: 5.0, t1: 8.6, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.15,
    draw: (c, lt) => drawChat(c, { title: 'Naya', subtitle: 'online', av: AV.naya, time: '19.42', messages: [
      { text: 'Do', alpha: 1, time: '19.41' }, { text: 'Apapun yang terjadi, jangan buka grup kelas dulu.', alpha: pop(lt, 0.2), time: '19.42' }] }) }); } },
  // 4. Tentu saja Aldo langsung membukanya
  { t0: 8.6, t1: 11.3, build(S) {
    const { a, ph, ibu } = aldoRumah(S);
    return (lt, k, t) => {
      ph.draw(c => drawLock(c, { time: '19.42', notifs: [{ title: 'Naya', body: 'Apapun yang terjadi, jangan buka grup kelas dulu.', av: AV.naya }] }));
      a.act(combine(POSES.duduk, POSES.hp, { headX: 0.25 }), lt < 1.1 ? 'curiga' : 'senyum', t, false, 0, { look: 0 });
      ibu.act(combine(POSES.berdiri, POSES.bawa), 'netral', t, false, 2);
      S.camMove(k, { pos: [0.35, 1.95, -2.0], look: [0, 1.55, 1.0], fov: 52 }, { pos: [0.25, 1.9, -1.5], look: [0, 1.6, 1.0], fov: 49 });
      return 'malam';
    };
  } },
  // 5. Puluhan pesan, nama disebut
  { t0: 11.3, t1: 15.3, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.1,
    draw: (c, lt) => { const n = Math.min(GROUP_MSGS.length, 2 + Math.floor(lt * 2.2));
      drawChat(c, grupBase(GROUP_MSGS.slice(0, n).map((m, i) => ({ ...m, alpha: i < n - 1 ? 1 : pop((lt * 2.2) % 1, 0) * 1 })), { unread: String(47 + n) })); } }); } },
  // 6. Video di tengah percakapan
  { t0: 15.3, t1: 17.0, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.2,
    draw: (c, lt) => drawChat(c, grupBase([...GROUP_MSGS.slice(3), { from: 'Anon', kind: 'video', dur: '0:17', color: '#7f8c8d', alpha: pop(lt, 0.1), text: 'tangga sekolah tadi' }], { unread: '54' })) }); } },
  // 7. Rekaman 17 detik (terpotong): Aldo mendorong Dimas
  { t0: 17.0, t1: 22.1, flashIn: 0.15, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { footageView(S, R, 3.55 + lt * 0.36, t, hud, { crop: true, cur: 2 + k * 15, dur: 17 }); return 'rekaman'; }; } },
  // 8. 17 detik, tanpa suara
  { t0: 22.1, t1: 24.4, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.15,
    draw: (c, lt) => { const g = c.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#3d4549'); g.addColorStop(1, '#1d2224'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
      c.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 6; i++) c.fillRect(60 + i * 50, 700 - i * 60, 300, 20);
      c.font = '800 120px Nunito'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('0:17', PW / 2, 470);
      c.font = '400 110px Nunito'; c.fillText('🔇', PW / 2, 640);
      drawPlayerChrome(c, { cur: 17, dur: 17, paused: false }); } }); } },
  // 9. Komentar grup melayang di sekitar Aldo
  { t0: 24.4, t1: 30.4, build(S) {
    const { a, ph, ibu } = aldoRumah(S);
    return (lt, k, t, hud) => {
      ph.draw(c => drawChat(c, grupBase(GROUP_MSGS)));
      a.act(combine(POSES.duduk, POSES.hp, { headX: 0.2 }), lt < 2 ? 'cemas' : 'sedih', t, false, 0, { sweat: lt > 3 });
      ibu.act(combine(POSES.berdiri, POSES.bawa), 'netral', t, false, 2);
      S.camMove(k, { pos: [0.3, 1.95, -2.0], look: [0, 1.6, 1.0], fov: 49 }, { pos: [0.2, 1.9, -1.3], look: [0, 1.68, 1.0], fov: 46 });
      hudBubble(hud, 300, 200, 'Pantes Dimas nggak masuk hari ini', pop(lt, 0.2), 'Maya', '#2980b9');
      hudBubble(hud, 500, 330, 'Keliatannya kalem', pop(lt, 2.3), 'Rio', '#8e44ad');
      hudBubble(hud, 250, 460, 'Ternyata begitu', pop(lt, 4.4), 'Sinta', '#d35400');
      return 'malam';
    };
  } },
  // 10. Memutar video itu lagi
  { t0: 30.4, t1: 32.6, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.12, sleeve: '#2f4b7c',
    draw: (c, lt, k) => { c.fillStyle = '#2a3033'; c.fillRect(0, 0, PW, PH); c.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 6; i++) c.fillRect(60 + i * 50, 700 - i * 60, 300, 20);
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(150, 520, 70, 160); c.fillRect(260, 540, 70, 140);
      if (lt < 0.6) { c.font = '400 140px Nunito'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('↻', PW / 2, 420); }
      drawPlayerChrome(c, { cur: lt < 0.6 ? 0 : (lt - 0.6) * 2, dur: 17 }); } }); } },
  // 11. Tangannya mulai dingin
  { t0: 32.6, t1: 34.6, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#24283a', shake: 0.012, dist: 1.05, push: 0.25, tiltZ: -0.08,
    skin: '#c98a52', sleeve: '#2f4b7c',
    draw: (c, lt) => { c.fillStyle = '#2a3033'; c.fillRect(0, 0, PW, PH); c.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 6; i++) c.fillRect(60 + i * 50, 700 - i * 60, 300, 20);
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(150, 520, 70, 160); c.fillRect(260, 540, 70, 140); drawPlayerChrome(c, { cur: 5 + lt, dur: 17 }); },
    grade: 'tegang' }); } },
  // 12. Ia memang ada di sana, memang mendorong (rekaman diulang, dibekukan)
  { t0: 34.6, t1: 38.4, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { const e = lt < 2.0 ? 4.05 + lt * 0.3 : 4.62;
      footageView(S, R, e, t, hud, { crop: true, cur: 6 + Math.min(lt, 2) * 0.8, dur: 17, paused: lt > 2.0, freezeT: lt < 2 ? t : 36.6 });
      if (lt > 0.3) { const [x, y] = project(S, R.aldo, 1.6); ring(hud, x, y, 120, ease(seg(lt, 0.3, 0.8))); }
      return lt > 2 ? { ...mixGrade('rekaman', 'tegang', 0.5) } : 'rekaman'; }; } },
  // 13. Tapi ada sesuatu yang terjadi sebelum itu (kenangan)
  { t0: 38.4, t1: 41.7, flashIn: 0.25, build(S) { const R = stairsSetup(S);
    return (lt, k, t) => { stairsEvent(R, 3.75, t); R.aldo.root.visible = true; R.aldo.root.position.set(-1.6, 0, 1.4); R.aldo.root.rotation.y = 0.6;
      R.aldo.act(combine(POSES.berdiri, { headX: -0.55 + Math.sin(t * 2) * 0.02 }), lt < 1 ? 'netral' : 'kaget', t);
      S.camMove(k, { pos: [-0.4, 1.4, 4.6], look: [-1.5, 1.9, 1.4], fov: 38 }, { pos: [-0.6, 1.5, 4.0], look: [-1.55, 2.0, 1.4], fov: 34 });
      return 'kenangan'; }; } },
  // 14. Mengetik penjelasan panjang
  { t0: 41.7, t1: 44.1, build(S) { const TXT = 'Itu nggak kayak yang kalian lihat. Aku memang dorong Dimas, tapi sebelum itu ada papan yang';
    return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26',
      draw: (c, lt) => drawChat(c, grupBase(GROUP_MSGS.slice(2), { input: TXT.slice(0, Math.floor(lt * 42)), caret: (lt * 3 | 0) % 2 === 0 })) }); } },
  // 15. Belum sempat dikirim, pesan wali kelas muncul
  { t0: 44.1, t1: 47.1, build(S) { const TXT = 'Itu nggak kayak yang kalian lihat. Aku memang dorong Dimas, tapi sebelum itu ada papan yang';
    return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#3b2e26', push: 0.15,
      draw: (c, lt) => { drawChat(c, grupBase(GROUP_MSGS.slice(2), { input: TXT, caret: true }));
        drawBanner(c, easeOut(seg(lt, 0.4, 0.8)), { title: 'Wali Kelas XII IPA 2', body: 'Aldo, besok datang bersama orang tua.', av: AV.wali }); } }); } },
  // 16. Wajah Aldo terkejut
  { t0: 47.1, t1: 50.1, build(S) {
    const { a, ph } = aldoRumah(S);
    return (lt, k, t) => {
      ph.draw(c => drawChat(c, { title: 'Wali Kelas XII IPA 2', av: AV.wali, messages: [{ text: 'Aldo, besok datang bersama orang tua.' }] }));
      a.act(combine(POSES.duduk, POSES.hp, { headX: 0.1 }), 'kaget', t, false, 0, { sweat: true });
      S.camMove(easeOut(k * 3), { pos: [0.2, 1.9, -1.8], look: [0, 1.65, 1.0], fov: 49 }, { pos: [0.1, 1.82, -0.9], look: [0, 1.72, 1.0], fov: 44 });
      return 'tegang';
    };
  } },
  // 17. Ibu bertanya dari dapur
  { t0: 50.1, t1: 54.2, build(S) {
    const { a, ph, ibu } = aldoRumah(S);
    return (lt, k, t) => {
      ph.draw(c => drawChat(c, { title: 'Wali Kelas XII IPA 2', av: AV.wali, messages: [{ text: 'Aldo, besok datang bersama orang tua.' }] }));
      a.act(combine(POSES.duduk, POSES.hp, { headX: 0.3 }), 'cemas', t);
      const turn = ease(seg(lt, 1.2, 1.9));
      ibu.root.rotation.y = Math.PI + turn * 2.6;
      ibu.act(combine(POSES.berdiri, turn > 0.5 ? {} : POSES.bawa, { headY: turn * 0.3 }), turn > 0.5 ? 'netral' : 'netral', t, talk('ibu', S.t), 2);
      S.camMove(k, { pos: [-2.4, 2.2, 2.8], look: [1.6, 1.5, -3.8], fov: 44 }, { pos: [-2.3, 2.15, 2.5], look: [1.8, 1.6, -3.9], fov: 38 });
      return 'malam';
    };
  } },
  // 18. "Nggak apa-apa, Bu."
  { t0: 54.2, t1: 55.8, build(S) {
    const { a, ph } = aldoRumah(S);
    return (lt, k, t) => {
      ph.draw(c => { c.fillStyle = '#000'; c.fillRect(0, 0, PW, PH); });
      const down = ease(seg(lt, 0.8, 1.4));
      a.act(combine(POSES.duduk, mixPose(POSES.hp, POSES.tanganMeja, down), { headX: 0.05, headY: 0.15 }), 'paksa', t, talk('aldo', S.t));
      S.camMove(k, { pos: [0.35, 1.9, -1.7], look: [0, 1.6, 1.0], fov: 49 }, { pos: [0.3, 1.88, -1.4], look: [0, 1.62, 1.0], fov: 46 });
      return 'malam';
    };
  } },
  // 19. Ponsel tertelungkup bergetar lagi
  { t0: 55.8, t1: 57.4, build(S) {
    const { a } = aldoRumah(S, { phoneInHand: false });
    const ph = phoneOnTable(S, [-0.55, 0.95, 0.2], 0.2, true);
    return (lt, k, t) => {
      ph.position.x = -0.55 + ((lt % 0.8) < 0.45 ? Math.sin(t * 95) * 0.012 : 0);
      a.act(combine(POSES.duduk, POSES.tanganMeja, { headX: 0.45 }), 'cemas', t);
      S.camMove(k, { pos: [-0.9, 2.3, -1.0], look: [-0.45, 1.0, 0.3], fov: 36 }, { pos: [-0.8, 2.0, -0.7], look: [-0.45, 1.0, 0.3], fov: 32 });
      return 'malam';
    };
  } },
  // 20. Nomor tak dikenal
  { t0: 57.4, t1: 59.2, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#2a2430',
    vibrate: (lt) => lt < 0.5 ? 1 : 0,
    draw: (c) => drawLock(c, { time: '19.51', bg1: '#1b1f2e', bg2: '#3b2a3a', notifs: [{ title: '+62 812-7731-0042', body: 'Pesan baru', av: AV.anon }] }), grade: 'tegang' }); } },
  // 21. "Aku punya video lengkapnya..."
  { t0: 59.2, t1: 64.3, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0.6, 1.9, 1.6], look: [0, 1.0, -1.5], fog: '#1e1a22', push: 0.2,
    draw: (c, lt) => drawChat(c, { dark: true, title: '+62 812-7731-0042', subtitle: 'online', av: AV.anon, time: '19.51', messages: [
      { text: 'Aku punya video lengkapnya.', alpha: pop(lt, 0.0), time: '19.51' },
      { text: 'Kalau kamu mau lihat, datang sendiri besok.', alpha: pop(lt, 2.0), time: '19.51' }] }), grade: 'ancaman' }); } },
  // 22. Kartu bersambung
  { t0: 64.3, t1: 67.6, endcard: true },
];

export const meta = {
  title: ['JANGAN BUKA', 'GRUP KELAS'],
  bersambung: { judul: 'BERSAMBUNG...', sub: 'Bagian 2: Yang Ada di Luar Bingkai' },
};
