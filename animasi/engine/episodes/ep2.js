// Bagian 2: "Yang Ada di Luar Bingkai" (VO 70,43 dtk)
import * as THREE from 'three';
import { CAST } from '../lib/cast.js';
import { SETS, phone } from '../lib/sets.js';
import { POSES, combine, mixPose, walkPose } from '../lib/char.js';
import { ease, easeOut, seg, lerp, clamp } from '../lib/core.js';
import { drawChat, drawPlayerChrome, PW, PH } from '../lib/phoneui.js';
import { phoneInsert, stairsSetup, footageView, FOOT_CAM, handheld, stairsEvent, talker } from '../lib/shots.js';

export const duration = 72.8;
const talk = talker([[11.2, 12.72, 'aldo'], [39.62, 41.48, 'aldo'], [41.7, 42.24, 'reno'], [42.96, 44.58, 'aldo'], [49.08, 50.56, 'reno'], [50.94, 51.82, 'aldo'], [64.98, 68.7, 'reno']]);
const pop = (lt, at) => clamp((lt - at) / 0.25);
const AV = { anon: { unknown: true, bg: '#8b949e' }, bagas: { skin: '#b97a45', hair: '#2a1c12', bg: '#e74c3c' } };

// dua orang di belakang kantin
function kantin(S) {
  SETS.belakangKantin(S.scene);
  const aldo = CAST.aldo(), reno = CAST.reno();
  S.add(aldo, [-0.75, 0, -0.6], Math.PI / 2); S.add(reno, [0.75, 0, -0.6], -Math.PI / 2);
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.25), new THREE.MeshToonMaterial({ color: '#34495e' })); bag.position.set(0, 0.45, -0.28); aldo.torso.add(bag);
  const ph = phone(); ph.draw(c => drawVid(c));
  return { aldo, reno, ph };
}
function drawVid(c, cur = 0, dur = 42) {
  c.fillStyle = '#3a4246'; c.fillRect(0, 0, PW, PH); c.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 6; i++) c.fillRect(60 + i * 50, 760 - i * 60, 300, 20);
  c.fillStyle = '#1f5f8b'; c.fillRect(170, 230, 200, 50); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(260, 560, 60, 150);
  drawPlayerChrome(c, { cur, dur, paused: cur === 0 });
}
const OTS_ALDO = { pos: [1.95, 2.05, 0.95], look: [-0.75, 1.9, -0.6], fov: 34 };
const OTS_RENO = { pos: [-1.95, 2.05, 0.95], look: [0.75, 1.9, -0.6], fov: 34 };
const tighter = (c, f) => ({ ...c, fov: c.fov * f });
function holdPhone(char, ph) { char.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); }

export const shots = [
  // 1. Gerbang pagi, masih sepi
  { t0: 0, t1: 4.1, grade: 'pagi', build(S) {
    SETS.gerbang(S.scene);
    const a = CAST.aldo(); S.add(a, [0, 0, -6], 0);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.25), new THREE.MeshToonMaterial({ color: '#34495e' })); bag.position.set(0, 0.45, -0.28); a.torso.add(bag);
    return (lt, k, t) => { a.root.position.z = lerp(-6, 1.5, k); a.applyPose(walkPose(t, 0.9)); a.setFace('serius', t);
      S.camMove(k, { pos: [1.2, 1.2, 7], look: [0, 2.2, -2], fov: 50 }, { pos: [0.9, 1.3, 6.2], look: [0, 1.9, 0], fov: 46 }); return 'pagi'; };
  } },
  // 2. Seseorang menunggu di belakang kantin
  { t0: 4.1, t1: 6.7, build(S) {
    SETS.belakangKantin(S.scene);
    const r = CAST.reno(); S.add(r, [0.4, 0, -1.6], Math.PI);
    return (lt, k, t) => { r.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, { pos: [-2.6, 1.9, 5.5], look: [0.4, 1.7, -1.6], fov: 46 }, { pos: [-1.7, 1.9, 4.2], look: [0.4, 1.8, -1.6], fov: 42 }); return { sat: 0.85, contrast: 1.0, bright: -0.01, tint: [0.96, 0.99, 1.04], vigColor: [0.05, 0.05, 0.08], vigAmt: 0.55, vigRad: 0.55, vigSoft: 0.9, grain: 0.04 }; };
  } },
  // 3. Reno menoleh
  { t0: 6.7, t1: 8.8, build(S) {
    SETS.belakangKantin(S.scene);
    const r = CAST.reno(); S.add(r, [0.4, 0, -1.6], Math.PI);
    return (lt, k, t) => { r.root.rotation.y = Math.PI + ease(seg(lt, 0.1, 0.9)) * Math.PI * 0.9; r.act(POSES.berdiri, lt > 0.9 ? 'paksa' : 'menghindar', t, false, 3);
      S.camMove(k, { pos: [0.6, 2.0, 2.4], look: [0.4, 1.9, -1.6], fov: 48 }, { pos: [0.55, 2.0, 1.9], look: [0.4, 1.95, -1.6], fov: 44 }); return 'pagi'; };
  } },
  // 4. Kenangan: Reno meminjam pengisi daya
  { t0: 8.8, t1: 11.0, flashIn: 0.2, build(S) {
    SETS.kelas(S.scene);
    const a = CAST.aldo(), r = CAST.reno();
    S.add(a, [-0.47, 0, -1.45], Math.PI); S.add(r, [0.95, 0, -1.2], -Math.PI * 0.5);
    const chg = new THREE.Group(); const blk = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.1), new THREE.MeshToonMaterial({ color: '#f4f4f4' })); chg.add(blk);
    return (lt, k, t) => {
      a.act(combine(POSES.duduk, POSES.serahkan, { headY: -0.6 }), 'senyum', t);
      r.act(combine(POSES.berdiri, POSES.serahkan), 'senang', t, false, 3);
      if (lt < 1.1) { a.handOf(-1).add(chg); } else { r.handOf(-1).add(chg); }
      chg.position.set(0, -0.15, 0.05);
      S.camMove(k, { pos: [2.2, 1.9, -4.2], look: [0.1, 1.45, -1.0], fov: 52 }, { pos: [1.9, 1.85, -3.8], look: [0.1, 1.5, -1.0], fov: 48 }); return 'kenangan'; };
  } },
  // 5. "Nomor itu punyamu?"
  { t0: 11.0, t1: 13.0, build(S) { const { aldo, reno } = kantin(S);
    return (lt, k, t) => { aldo.act(POSES.berdiri, 'serius', t, talk('aldo', S.t)); reno.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, OTS_ALDO, tighter(OTS_ALDO, 0.85)); return 'pagi'; }; } },
  // 6. Reno mengangguk & menyerahkan ponsel
  { t0: 13.0, t1: 16.2, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    return (lt, k, t) => { const nod = lt < 1.0 ? Math.max(0, Math.sin(lt * 9)) * 0.3 : 0; const give = ease(seg(lt, 1.2, 2.0));
      reno.act(combine(POSES.berdiri, mixPose(POSES.hp, POSES.serahkan, give), { headX: nod + 0.1 }), 'bersalah', t, false, 3);
      aldo.act(combine(POSES.berdiri, give > 0.7 ? POSES.serahkan : {}), 'serius', t);
      if (lt > 2.4 && ph.parent !== aldo.handOf(-1)) holdPhone(aldo, ph);
      S.camMove(k, { pos: [0, 1.9, 4.6], look: [0, 1.6, -0.6], fov: 46 }, { pos: [0, 1.85, 4.0], look: [0, 1.6, -0.6], fov: 44 }); return 'pagi'; }; } },
  // 7. Video 42 detik
  { t0: 16.2, t1: 19.2, build(S) { return phoneInsert(S, { set: 'belakangKantin', camPos: [0.4, 1.9, 2.0], look: [1, 1.2, -2.5], fog: '#c9d6dc', fogFar: 14, push: 0.15,
    draw: (c, lt) => { drawVid(c, lt > 1.6 ? (lt - 1.6) * 0.8 : 0); c.font = '800 110px Nunito'; c.fillStyle = '#fff'; c.textAlign = 'center'; if (lt < 1.6) c.fillText('0:42', PW / 2, 470); },
    grade: 'pagi' }); } },
  // 8. Rekaman lengkap: Dimas berjalan menunduk
  { t0: 19.2, t1: 23.0, flashIn: 0.15, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { footageView(S, R, lt * 0.8, t, hud, { cur: 3 + lt * 1.2, dur: 42 }); return 'rekaman'; }; } },
  // 9. Pekerja memperbaiki papan (kamera naik)
  { t0: 23.0, t1: 27.3, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { stairsEvent(R, 3.0 + lt * 0.1, t);
      const kk = ease(k); const c = FOOT_CAM;
      handheld(S, c.pos, [lerp(1.2, 0.6, kk), lerp(1.3, 3.3, kk), 0], lerp(40, 22, kk), t, 0.03);
      drawPlayerChrome(hud, { cur: 8 + lt, dur: 42, w: 720, h: 1280 }); return 'rekaman'; }; } },
  // 10. Salah satu ujung papan terlepas
  { t0: 27.3, t1: 29.2, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { stairsEvent(R, 3.45 + lt * 0.12, t);
      handheld(S, FOOT_CAM.pos, [0.9, 3.7, 0], 14, t, 0.02);
      drawPlayerChrome(hud, { cur: 13 + lt, dur: 42, w: 720, h: 1280 }); return 'rekaman'; }; } },
  // 11. Aldo berlari, mendorong Dimas
  { t0: 29.2, t1: 32.1, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { footageView(S, R, 3.6 + lt * 0.4, t, hud, { cur: 15 + lt, dur: 42 }); return 'rekaman'; }; } },
  // 12. Mereka jatuh
  { t0: 32.1, t1: 33.3, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { footageView(S, R, 4.75 + lt * 0.45, t, hud, { cur: 18 + lt, dur: 42 }); return 'rekaman'; }; } },
  // 13. Papan menghantam lantai — bingkai yang beredar ditandai
  { t0: 33.3, t1: 37.9, build(S) { const R = stairsSetup(S);
    return (lt, k, t, hud) => { const e = Math.min(5.3 + lt * 0.35, 6.4);
      footageView(S, R, e, t, hud, { cur: 19 + lt, dur: 42, highlight: [2, 19] });
      const a = ease(seg(lt, 2.4, 2.9));
      if (a > 0) {
        hud.save(); hud.globalAlpha = a; hud.fillStyle = 'rgba(0,0,0,0.45)'; hud.fillRect(0, 0, 720, 280); hud.fillRect(0, 1000, 720, 140);
        hud.strokeStyle = '#ff5252'; hud.lineWidth = 6; hud.setLineDash([22, 14]); hud.strokeRect(14, 282, 692, 716);
        hud.setLineDash([]); hud.fillStyle = '#ff5252'; hud.beginPath(); hud.roundRect(24, 300, 330, 46, 10); hud.fill();
        hud.fillStyle = '#fff'; hud.font = '700 26px Nunito'; hud.textBaseline = 'middle'; hud.fillText('Bagian yang beredar', 40, 324);
        hud.restore();
      }
      return 'rekaman'; }; } },
  // 14. Aldo menatap Reno
  { t0: 37.9, t1: 39.5, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(aldo, ph);
    return (lt, k, t) => { aldo.act(combine(POSES.berdiri, POSES.hp, { headX: lerp(0.38, 0, ease(seg(lt, 0.2, 0.8))) }), 'serius', t); reno.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, tighter(OTS_ALDO, 0.9), tighter(OTS_ALDO, 0.75)); return 'pagi'; }; } },
  // 15. "Kamu punya ini dari kemarin?"
  { t0: 39.5, t1: 41.6, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(aldo, ph);
    return (lt, k, t) => { aldo.act(combine(POSES.berdiri, POSES.hpAngkat), 'marah', t, talk('aldo', S.t)); reno.act(POSES.berdiri, 'bersalah', t, false, 3);
      S.camMove(k, { pos: [0, 1.9, 4.2], look: [0, 1.65, -0.6], fov: 44 }, { pos: [0, 1.9, 3.7], look: [0, 1.7, -0.6], fov: 42 }); return 'pagi'; }; } },
  // 16. "Iya."
  { t0: 41.6, t1: 42.9, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(aldo, ph);
    return (lt, k, t) => { aldo.act(combine(POSES.berdiri, POSES.hp, { headX: 0.05 }), 'serius', t); reno.act(combine(POSES.berdiri, { headX: 0.2 }), 'bersalah', t, talk('reno', S.t), 3);
      S.camMove(k, tighter(OTS_RENO, 0.85), tighter(OTS_RENO, 0.78)); return 'pagi'; }; } },
  // 17. "Terus kenapa diam?"
  { t0: 42.9, t1: 44.8, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(aldo, ph);
    return (lt, k, t) => { aldo.act(combine(POSES.berdiri, POSES.hpAngkat), 'marah', t, talk('aldo', S.t)); reno.act(POSES.berdiri, 'bersalah', t, false, 3);
      S.camMove(easeOut(k), tighter(OTS_ALDO, 0.88), tighter(OTS_ALDO, 0.72)); return 'pagi'; }; } },
  // 18. Reno mengambil kembali ponselnya
  { t0: 44.8, t1: 47.2, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(aldo, ph);
    return (lt, k, t) => { const take = ease(seg(lt, 0.2, 0.9));
      reno.act(combine(POSES.berdiri, mixPose(mixPose({}, POSES.serahkan, take), POSES.hp, ease(seg(lt, 1.1, 1.8)))), 'menghindar', t, false, 3);
      aldo.act(combine(POSES.berdiri, mixPose(POSES.hpAngkat, POSES.berdiri, ease(seg(lt, 1.0, 1.6)))), 'serius', t);
      if (lt > 0.95 && ph.parent !== reno.handOf(-1)) holdPhone(reno, ph);
      S.camMove(k, { pos: [0, 1.75, 3.9], look: [0, 1.5, -0.6], fov: 44 }, { pos: [0.2, 1.75, 3.4], look: [0.2, 1.55, -0.6], fov: 42 }); return 'pagi'; }; } },
  // 19. Matanya terus menghindar
  { t0: 47.2, t1: 49.0, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    return (lt, k, t) => { reno.act(combine(POSES.berdiri, POSES.hp, { headX: 0.1, headY: 0.35 }), 'menghindar', t, false, 3, { sideDir: lt < 0.9 ? 1 : -1 }); aldo.act(POSES.berdiri, 'serius', t);
      S.camMove(k, tighter(OTS_RENO, 0.85), tighter(OTS_RENO, 0.76)); return 'pagi'; }; } },
  // 20. "Aku takut."
  { t0: 49.0, t1: 50.8, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    return (lt, k, t) => { reno.act(combine(POSES.berdiri, POSES.hp, { headX: 0.15 }), 'sedih', t, talk('reno', S.t), 3); aldo.act(POSES.berdiri, 'serius', t);
      S.camMove(k, tighter(OTS_RENO, 0.8), tighter(OTS_RENO, 0.75)); return 'pagi'; }; } },
  // 21. "Sama siapa?"
  { t0: 50.8, t1: 52.3, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    return (lt, k, t) => { aldo.act(combine(POSES.berdiri, { torsoX: 0.08 }), 'cemas', t, talk('aldo', S.t)); reno.act(combine(POSES.berdiri, POSES.hp), 'sedih', t, false, 3);
      S.camMove(k, tighter(OTS_ALDO, 0.82), tighter(OTS_ALDO, 0.76)); return 'pagi'; }; } },
  // 22. Reno membuka percakapan lain
  { t0: 52.3, t1: 54.5, build(S) { return phoneInsert(S, { set: 'belakangKantin', camPos: [0.4, 1.9, 2.0], look: [1, 1.2, -2.5], fog: '#c9d6dc', fogFar: 14, skin: '#a8703f', sleeve: '#2b2f36',
    draw: (c, lt) => drawChat(c, { title: '', titleBlur: 'B•••••', subtitle: 'terakhir dilihat kemarin', av: { ...AV.bagas, bg: '#999' }, time: '06.41', messages: [] }), grade: 'pagi' }); } },
  // 23. Kiriman uang + instruksi
  { t0: 54.5, t1: 60.7, build(S) { return phoneInsert(S, { set: 'belakangKantin', camPos: [0.4, 1.9, 2.0], look: [1, 1.2, -2.5], fog: '#9aa6ae', fogFar: 12, push: 0.18, skin: '#a8703f', sleeve: '#2b2f36',
    draw: (c, lt) => drawChat(c, { title: '', titleBlur: 'B•••••', subtitle: 'terakhir dilihat kemarin', av: { ...AV.bagas, bg: '#999' }, time: '06.41', messages: [
      { kind: 'transfer', amount: 'Rp300.000', alpha: pop(lt, 0.1), time: 'Kemarin' },
      { text: 'Potong bagian papannya.', alpha: pop(lt, 2.3), time: 'Kemarin' },
      { text: 'Kirim pakai akun cadangan.', alpha: pop(lt, 4.6), time: 'Kemarin' }] }), grade: 'tegang' }); } },
  // 24. Aldo hendak membaca nama, Reno menarik layar
  { t0: 60.7, t1: 64.9, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    ph.draw(c => drawChat(c, { title: '', titleBlur: 'B•••••', av: { ...AV.bagas, bg: '#999' }, messages: [{ text: 'Kirim pakai akun cadangan.' }] }));
    return (lt, k, t) => { const lean = ease(seg(lt, 0.2, 1.6)); const pull = ease(seg(lt, 2.4, 2.8));
      aldo.root.position.x = -0.75 + lean * 0.35;
      aldo.act(combine(POSES.berdiri, { torsoX: lean * 0.25 - pull * 0.15, headX: lean * 0.3 }), pull > 0.5 ? 'kaget' : 'fokus', t);
      reno.act(combine(POSES.berdiri, mixPose(POSES.hpAngkat, { shR: [0.3, 0, -0.3], elR: -1.6 }, pull), { headY: -pull * 0.3 }), pull > 0.5 ? 'serius' : 'menghindar', t, false, 3);
      reno.root.rotation.y = -Math.PI / 2 + pull * 0.6;
      S.camMove(k, { pos: [0.2, 1.8, 3.6], look: [0, 1.6, -0.6], fov: 44 }, { pos: [0.2, 1.8, 3.0], look: [0, 1.65, -0.6], fov: 42 }); return 'pagi'; }; } },
  // 25. "Do, yang nyuruh itu orang yang kamu percaya."
  { t0: 64.9, t1: 69.3, build(S) { const { aldo, reno, ph } = kantin(S); holdPhone(reno, ph);
    return (lt, k, t) => { reno.act(combine(POSES.berdiri, { shR: [0.3, 0, -0.3], elR: -1.6 }), 'serius', t, talk('reno', S.t), 3); aldo.act(POSES.berdiri, lt > 3 ? 'kaget' : 'cemas', t);
      S.camMove(k, tighter(OTS_RENO, 0.85), tighter(OTS_RENO, 0.68)); return 'tegang'; }; } },
  // 26. Bersambung
  { t0: 69.3, t1: 72.8, endcard: true },
];
