// Bagian 3: "Teman Sebangku" (VO 78,18 dtk)
import * as THREE from 'three';
import { CAST } from '../lib/cast.js';
import { SETS, phone, bread } from '../lib/sets.js';
import { POSES, combine, mixPose, walkPose, addPose } from '../lib/char.js';
import { ease, easeOut, seg, lerp, clamp } from '../lib/core.js';
import { drawChat, avatar, PW, PH } from '../lib/phoneui.js';
import { phoneInsert, talker } from '../lib/shots.js';

export const duration = 80.6;
const talk = talker([[12.26, 13.66, 'aldo'], [17.9, 20.0, 'bagas'], [20.24, 23.52, 'bagas'], [23.84, 26.0, 'aldo'], [26.68, 29.22, 'bagas'],
  [30.44, 32.84, 'aldo'], [33.18, 35.8, 'aldo'], [43.9, 46.0, 'bagas'], [52.22, 54.08, 'dimas'], [63.3, 65.68, 'bagas'], [66.08, 66.7, 'aldo'], [68.42, 70.76, 'aldo'], [71.1, 72.0, 'aldo']]);
const pop = (lt, at) => clamp((lt - at) / 0.25);
const AV = { bagas: { skin: '#b97a45', hair: '#2a1c12', bg: '#e74c3c' }, grup: { group: 'XII', bg: '#3f8a5c' } };

// kelas: Aldo duduk menyamping, Bagas berdiri di lorong meja
function kelas(S, { breadOnDesk = false } = {}) {
  SETS.kelas(S.scene);
  const aldo = CAST.aldo(), bagas = CAST.bagas();
  S.add(aldo, [-0.47, 0, -1.45], Math.PI); S.add(bagas, [-0.2, 0, -3.1], 0);
  const b1 = bread(), b2 = bread();
  if (breadOnDesk) { b1.position.set(0.25, 1.0, -2.3); b2.position.set(0.55, 1.0, -2.4); b2.rotation.y = 0.4; S.scene.add(b1, b2); }
  else { bagas.handOf(-1).add(b1); bagas.handOf(1).add(b2); b1.position.set(0, -0.15, 0.08); b2.position.set(0, -0.15, 0.08); }
  const ph = phone(); ph.draw(c => drawChat(c, { title: 'Bagas', av: AV.bagas, messages: [{ kind: 'transfer', amount: 'Rp300.000' }, { text: 'Potong bagian papannya.' }, { text: 'Kirim pakai akun cadangan.' }] }));
  return { aldo, bagas, b1, b2, ph };
}
const OTS_ALDO = { pos: [2.4, 2.3, -4.4], look: [-0.47, 1.62, -1.45], fov: 32 };
const OTS_BAGAS = { pos: [-3.6, 2.2, 0.0], look: [-0.2, 1.92, -3.1], fov: 32 };
const T = (c, f) => ({ ...c, fov: c.fov * f });
const hold = (c, ph) => { c.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI); };
const SIT = (p = {}) => combine(POSES.duduk, p);

// ruang guru: wali duduk, tiga siswa berdiri
function ruangGuru(S) {
  SETS.ruangGuru(S.scene);
  const w = CAST.wali(), a = CAST.aldo(), b = CAST.bagas(), r = CAST.reno();
  S.add(w, [0, 0, -2.6], 0); S.add(a, [-1.3, 0, -0.1], Math.PI); S.add(b, [0.0, 0, -0.05], Math.PI); S.add(r, [1.3, 0, -0.15], Math.PI);
  const ph = phone(); ph.draw(c => { c.fillStyle = '#3a4246'; c.fillRect(0, 0, PW, PH); c.fillStyle = '#1f5f8b'; c.fillRect(170, 230, 200, 50); });
  return { w, a, b, r, ph };
}

export const shots = [
  // 1. Foto profil pengirim dikenali
  { t0: 0, t1: 3.7, build(S) { return phoneInsert(S, { set: 'belakangKantin', camPos: [0.4, 1.9, 2.0], look: [1, 1.2, -2.5], fog: '#9aa6ae', fogFar: 12, push: 0.25, skin: '#a8703f', sleeve: '#2b2f36',
    draw: (c, lt) => { c.fillStyle = '#111'; c.fillRect(0, 0, PW, PH); const r = lerp(120, 190, ease(seg(lt, 0, 1.5)));
      avatar(c, PW / 2, 420, r, AV.bagas); c.fillStyle = '#fff'; c.font = '800 54px Nunito'; c.textAlign = 'center'; c.fillText('Bagas', PW / 2, 700);
      c.font = '500 26px Nunito'; c.fillStyle = '#aaa'; c.fillText('+62 813-2290-4417', PW / 2, 750); }, grade: 'tegang' }); } },
  // 2. Kenangan: teman sebangku sejak kelas 10
  { t0: 3.7, t1: 6.7, flashIn: 0.2, build(S) {
    SETS.kelas(S.scene); const a = CAST.aldo(), b = CAST.bagas();
    S.add(a, [-0.47, 0, -1.45], Math.PI); S.add(b, [0.47, 0, -1.45], Math.PI);
    return (lt, k, t) => { const laugh = Math.sin(t * 14) * 0.04;
      a.act(SIT({ ...POSES.tanganMeja, headY: -0.3, torsoX: laugh }), 'senang', t); b.act(SIT({ ...POSES.tanganMeja, headY: 0.3, torsoX: laugh }), 'senang', t, true, 2);
      S.camMove(k, { pos: [0.2, 1.75, -4.6], look: [0, 1.4, -1.45], fov: 48 }, { pos: [0.15, 1.75, -4.0], look: [0, 1.45, -1.45], fov: 46 }); return 'kenangan'; };
  } },
  // 3. Bagas datang membawa dua bungkus roti
  { t0: 6.7, t1: 9.6, build(S) { const { aldo, bagas } = kelas(S);
    return (lt, k, t) => { const w = seg(lt, 0, 1.8);
      bagas.root.position.set(lerp(2.6, -0.2, ease(w)), 0, lerp(-4.2, -3.1, ease(w))); bagas.root.rotation.y = w < 1 ? -1.2 : 0;
      bagas.act(combine(w < 1 ? walkPose(t, 0.9) : POSES.berdiri, POSES.bawa), 'senang', t, false, 2);
      aldo.act(SIT({ headY: 0.2 }), 'serius', t);
      S.camMove(k, { pos: [-2.2, 2.2, -5.7], look: [0.5, 1.5, -3.0], fov: 50 }, { pos: [-2.0, 2.15, -5.4], look: [0.2, 1.55, -2.8], fov: 46 }); return 'pagi'; };
  } },
  // 4. Aldo menunjukkan percakapan
  { t0: 9.6, t1: 12.1, build(S) { const { aldo, bagas, ph } = kelas(S); hold(aldo, ph);
    return (lt, k, t) => { const up = ease(seg(lt, 0.2, 0.9));
      aldo.act(SIT(mixPose(POSES.hp, POSES.hpAngkat, up)), 'serius', t);
      bagas.act(combine(POSES.berdiri, POSES.bawa, { headX: up * 0.2 }), lt < 1.3 ? 'senyum' : 'kaget', t, false, 2);
      S.camMove(k, OTS_BAGAS, T(OTS_BAGAS, 0.85)); return 'pagi'; }; } },
  // 5. "Kenapa kamu bayar dia?"
  { t0: 12.1, t1: 14.0, build(S) { const { aldo, bagas, ph } = kelas(S); hold(aldo, ph);
    return (lt, k, t) => { aldo.act(SIT(POSES.hpAngkat), 'marah', t, talk('aldo', S.t)); bagas.act(combine(POSES.berdiri, POSES.bawa), 'cemas', t, false, 2);
      S.camMove(k, OTS_ALDO, T(OTS_ALDO, 0.85)); return 'pagi'; }; } },
  // 6. Roti diletakkan di meja
  { t0: 14.0, t1: 16.4, build(S) { const { aldo, bagas, b1, b2 } = kelas(S);
    return (lt, k, t) => { const d = ease(seg(lt, 0.2, 1.2));
      bagas.act(combine(POSES.berdiri, mixPose(POSES.bawa, { shR: [-0.9, 0, 0.15], elR: -0.5, shL: [-0.9, 0, -0.15], elL: -0.5, torsoX: 0.3, headX: 0.3 }, d)), 'bersalah', t, false, 2);
      if (lt > 1.3 && b1.parent !== S.scene) { S.scene.attach(b1); S.scene.attach(b2); b1.position.y = b2.position.y = 1.0; }
      aldo.act(SIT(), 'serius', t);
      S.camMove(k, { pos: [1.1, 1.9, -0.7], look: [0.4, 1.05, -2.2], fov: 44 }, { pos: [1.0, 1.8, -0.95], look: [0.4, 1.05, -2.2], fov: 40 }); return 'pagi'; }; } },
  // 7. Lama ia diam
  { t0: 16.4, t1: 17.8, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { bagas.act(combine(POSES.berdiri, POSES.tunduk), 'bersalah', t, false, 2); aldo.act(SIT(), 'serius', t);
      S.camMove(k, T(OTS_BAGAS, 0.9), T(OTS_BAGAS, 0.8)); return 'pagi'; }; } },
  // 8. "Aku pengen jadi ketua panitia."
  { t0: 17.8, t1: 20.1, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { bagas.act(combine(POSES.berdiri, { headX: 0.15 }), 'bersalah', t, talk('bagas', S.t), 2); aldo.act(SIT(), 'serius', t);
      S.camMove(k, T(OTS_BAGAS, 0.8), T(OTS_BAGAS, 0.72)); return 'pagi'; }; } },
  // 9. Poster pemilihan (Bagas masih bicara)
  { t0: 20.1, t1: 23.7, build(S) { SETS.kelas(S.scene);
    return (lt, k, t) => { S.camMove(k, { pos: [3.6, 2.4, -2.1], look: [6.4, 2.5, -2.5], fov: 44 }, { pos: [4.6, 2.45, -2.4], look: [6.4, 2.5, -2.5], fov: 40 }); return 'pagi'; }; } },
  // 10. "Sampai harus bikin aku dituduh begitu?"
  { t0: 23.7, t1: 26.3, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { aldo.act(SIT({ torsoX: 0.1 }), 'marah', t, talk('aldo', S.t)); bagas.act(combine(POSES.berdiri, POSES.tunduk), 'bersalah', t, false, 2);
      S.camMove(k, T(OTS_ALDO, 0.85), T(OTS_ALDO, 0.72)); return 'pagi'; }; } },
  // 11. "Awalnya, kupikir cuma bakal ramai sebentar."
  { t0: 26.3, t1: 30.2, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { bagas.act(combine(POSES.berdiri, { headX: 0.1, headY: 0.2 }), 'menghindar', t, talk('bagas', S.t), 2, { sideDir: -1 }); aldo.act(SIT(), 'marah', t);
      S.camMove(k, T(OTS_BAGAS, 0.8), T(OTS_BAGAS, 0.7)); return 'pagi'; }; } },
  // 12. "Kamu bisa berhenti mikirin itu."
  { t0: 30.2, t1: 33.0, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { aldo.act(SIT(), 'kecewa', t, talk('aldo', S.t)); bagas.act(combine(POSES.berdiri, { headX: 0.1 }), 'bersalah', t, false, 2);
      S.camMove(k, T(OTS_ALDO, 0.75), T(OTS_ALDO, 0.68)); return 'pagi'; }; } },
  // 13. "Aku yang harus pulang dan jelasin ke ibuku."
  { t0: 33.0, t1: 36.0, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { aldo.act(SIT({ headX: 0.1 }), 'sedih', t, talk('aldo', S.t), 0, { tear: lt > 1.5 ? clamp((lt - 1.5) / 1.5) : 0 }); bagas.act(POSES.berdiri, 'bersalah', t, false, 2);
      S.camMove(k, T(OTS_ALDO, 0.66), T(OTS_ALDO, 0.58)); return { sat: 0.85, contrast: 0.95, bright: -0.01, tint: [1.0, 0.98, 1.0], vigColor: [0.08, 0.06, 0.08], vigAmt: 0.6, vigRad: 0.5, vigSoft: 0.9, grain: 0.04 }; }; } },
  // 14. Bagas menunduk
  { t0: 36.0, t1: 37.8, build(S) { const { aldo, bagas } = kelas(S, { breadOnDesk: true });
    return (lt, k, t) => { bagas.act(combine(POSES.berdiri, mixPose({}, POSES.tunduk, ease(seg(lt, 0.1, 0.8)))), 'bersalah', t, false, 2); aldo.act(SIT({ headY: 0.3 }), 'kecewa', t);
      S.camMove(k, { pos: [2.9, 2.3, -1.4], look: [-0.3, 1.55, -2.3], fov: 50 }, { pos: [2.6, 2.25, -1.6], look: [-0.3, 1.6, -2.3], fov: 46 }); return 'pagi'; }; } },
  // 15. Menemui wali kelas bersama Reno
  { t0: 37.8, t1: 41.8, build(S) { const { w, a, b, r } = ruangGuru(S);
    return (lt, k, t) => { w.act(SIT(POSES.tanganMeja), 'serius', t); a.act(POSES.berdiri, 'serius', t); b.act(combine(POSES.berdiri, POSES.tunduk), 'bersalah', t, false, 2); r.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, { pos: [3.0, 2.5, -3.8], look: [0, 1.5, -0.9], fov: 54 }, { pos: [2.7, 2.45, -3.5], look: [0, 1.5, -0.9], fov: 50 }); return 'pagi'; }; } },
  // 16. Video lengkap diperlihatkan
  { t0: 41.8, t1: 43.8, build(S) { const { w, a, b, r, ph } = ruangGuru(S); hold(w, ph);
    return (lt, k, t) => { w.act(SIT(POSES.hp), lt < 1 ? 'fokus' : 'kaget', t); a.act(POSES.berdiri, 'serius', t); b.act(combine(POSES.berdiri, POSES.tunduk), 'bersalah', t, false, 2); r.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, { pos: [1.0, 2.7, -3.7], look: [0.0, 1.4, -2.2], fov: 42 }, { pos: [0.9, 2.6, -3.5], look: [0.0, 1.4, -2.2], fov: 36 }); return 'pagi'; }; } },
  // 17. Bagas mengaku
  { t0: 43.8, t1: 46.0, build(S) { const { w, a, b, r } = ruangGuru(S);
    return (lt, k, t) => { w.act(SIT(POSES.tanganMeja), 'serius', t); a.act(POSES.berdiri, 'kecewa', t); b.act(combine(POSES.berdiri, { headX: 0.25 }), 'bersalah', t, talk('bagas', S.t), 2); r.act(POSES.berdiri, 'menghindar', t, false, 3);
      S.camMove(k, { pos: [0.9, 2.05, -2.1], look: [0.0, 1.8, -0.05], fov: 52 }, { pos: [0.8, 2.05, -1.9], look: [0.0, 1.85, -0.05], fov: 46 }); return 'pagi'; }; } },
  // 18. Permintaan maaf di grup kelas
  { t0: 46.0, t1: 48.5, build(S) { return phoneInsert(S, { set: 'kelas', camPos: [0, 2.0, 2.0], look: [0, 1.3, -2.5], fog: '#d9d2c0', fogFar: 12, push: 0.1,
    draw: (c, lt) => drawChat(c, { title: 'XII IPA 2', subtitle: 'Bagas, Sinta, Rio, +33', group: true, av: AV.grup, time: '10.12', messages: [
      { from: 'Bagas', color: '#c0392b', text: 'Teman-teman, video Aldo kemarin itu dipotong. Aku yang nyuruh. Aldo sebenarnya nolong Dimas dari papan yang jatuh. Aku minta maaf, terutama ke Aldo.' },
      { from: 'Sinta', color: '#d35400', text: 'Ya ampun...', alpha: pop(lt, 0.8) },
      { from: 'Maya', color: '#2980b9', text: 'Aldo maaf ya udah nuduh', alpha: pop(lt, 1.5) }] }), grade: 'pagi' }); } },
  // 19. Dimas kembali, lutut diperban
  { t0: 48.5, t1: 52.1, build(S) {
    SETS.sekolahTangga(S.scene, {});
    const d = CAST.dimas({ shortLeg: 1 }), a = CAST.aldo(); S.add(d, [4.0, 0, 2.0], -Math.PI / 2); S.add(a, [0.0, 0, 1.6], Math.PI / 2);
    return (lt, k, t) => { const w = seg(lt, 0, 2.8);
      d.root.position.x = lerp(4.0, 1.4, ease(w)); const p = w < 1 ? walkPose(t, 0.6) : POSES.berdiri;
      d.act(addPose(p, w < 1 ? { hipsY: -Math.abs(Math.sin(t * 3.6)) * 0.05, torsoZ: Math.sin(t * 3.6) * 0.05 } : {}), 'senyum', t, false, 1);
      a.act(POSES.berdiri, w < 1 ? 'kaget' : 'senyum', t);
      S.camMove(k, { pos: [1.2, 1.8, 7.5], look: [2.0, 1.2, 1.8], fov: 46 }, { pos: [1.0, 1.8, 6.6], look: [1.5, 1.3, 1.8], fov: 44 }); return 'pagi'; };
  } },
  // 20. "Makasih sudah nolongin kemarin, Do."
  { t0: 52.1, t1: 54.4, build(S) {
    SETS.sekolahTangga(S.scene, {});
    const d = CAST.dimas({ shortLeg: 1 }), a = CAST.aldo(); S.add(d, [1.4, 0, 1.6], -Math.PI / 2); S.add(a, [0.0, 0, 1.6], Math.PI / 2);
    return (lt, k, t) => { d.act(POSES.berdiri, 'senang', t, talk('dimas', S.t), 1); a.act(POSES.berdiri, 'senyum', t);
      S.camMove(k, { pos: [-1.5, 2.05, 3.2], look: [1.4, 1.95, 1.6], fov: 30 }, { pos: [-1.35, 2.05, 3.0], look: [1.4, 1.95, 1.6], fov: 27 }); return 'pagi'; };
  } },
  // 21. Aldo mengangguk
  { t0: 54.4, t1: 56.0, build(S) {
    SETS.sekolahTangga(S.scene, {});
    const d = CAST.dimas({ shortLeg: 1 }), a = CAST.aldo(); S.add(d, [1.4, 0, 1.6], -Math.PI / 2); S.add(a, [0.0, 0, 1.6], Math.PI / 2);
    return (lt, k, t) => { const nod = lt > 0.2 && lt < 1.1 ? Math.max(0, Math.sin((lt - 0.2) * 7)) * 0.3 : 0;
      a.act(combine(POSES.berdiri, { headX: nod }), 'senyum', t); d.act(POSES.berdiri, 'senyum', t, false, 1);
      S.camMove(k, { pos: [2.9, 2.05, 3.0], look: [0.0, 1.95, 1.6], fov: 30 }, { pos: [2.75, 2.05, 2.8], look: [0.0, 1.95, 1.6], fov: 27 }); return 'pagi'; };
  } },
  // 22. Akhirnya kebenaran terungkap
  { t0: 56.0, t1: 60.5, build(S) {
    SETS.sekolahTangga(S.scene, {});
    const d = CAST.dimas({ shortLeg: 1 }), a = CAST.aldo(); S.add(d, [1.4, 0, 1.6], -Math.PI / 2); S.add(a, [0.0, 0, 1.6], Math.PI / 2);
    return (lt, k, t) => { a.act(combine(POSES.berdiri, { headX: -0.1 }), lt < 1.5 ? 'senyum' : 'lega', t); d.act(POSES.berdiri, 'senyum', t, false, 1);
      S.camMove(k, { pos: [0.6, 1.95, 3.6], look: [0.6, 1.8, 1.6], fov: 34 }, { pos: [0.7, 2.2, 7.0], look: [0.7, 1.6, 1.6], fov: 44 });
      return { sat: 1.0, contrast: 0.95, bright: 0.03, tint: [1.06, 1.0, 0.92], vigColor: [1, 0.97, 0.9], vigAmt: 0.5, vigRad: 0.6, vigSoft: 0.9, grain: 0.03 }; };
  } },
  // 23. Bagas menunggu di gerbang (sore)
  { t0: 60.5, t1: 63.2, build(S) {
    SETS.gerbang(S.scene, { sore: true });
    const b = CAST.bagas(), a = CAST.aldo(); S.add(b, [2.0, 0, 0.9], -Math.PI * 0.6); S.add(a, [-0.5, 0, -5], 0);
    return (lt, k, t) => { a.root.position.z = lerp(-5, 0.6, ease(k)); a.act(walkPose(t, 0.8), 'netral', t); b.act(combine(POSES.berdiri, { headX: 0.2 }), 'cemas', t, false, 2);
      S.camMove(k, { pos: [3.0, 1.8, 6.5], look: [0.5, 1.6, -1], fov: 48 }, { pos: [2.6, 1.8, 5.6], look: [0.6, 1.7, -0.5], fov: 46 }); return 'sore'; };
  } },
  // 24. "Besok masih boleh duduk sebelahan?"
  { t0: 63.2, t1: 66.0, build(S) {
    SETS.gerbang(S.scene, { sore: true });
    const b = CAST.bagas(), a = CAST.aldo(); S.add(b, [0.75, 0, 1.0], -Math.PI / 2); S.add(a, [-0.75, 0, 1.0], Math.PI / 2);
    return (lt, k, t) => { b.act(combine(POSES.berdiri, { headX: 0.1 }), 'cemas', t, talk('bagas', S.t), 2); a.act(POSES.berdiri, 'kecewa', t);
      S.camMove(k, { pos: [-2.0, 2.05, 2.6], look: [0.75, 1.95, 1.0], fov: 28 }, { pos: [-1.85, 2.05, 2.4], look: [0.75, 1.95, 1.0], fov: 26 }); return 'sore'; };
  } },
  // 25. "Boleh," jawab Aldo
  { t0: 66.0, t1: 68.3, build(S) {
    SETS.gerbang(S.scene, { sore: true });
    const b = CAST.bagas(), a = CAST.aldo(); S.add(b, [0.75, 0, 1.0], -Math.PI / 2); S.add(a, [-0.75, 0, 1.0], Math.PI / 2);
    return (lt, k, t) => { a.act(POSES.berdiri, lt < 1 ? 'netral' : 'kecewa', t, talk('aldo', S.t)); b.act(POSES.berdiri, 'senyum', t, false, 2);
      S.camMove(k, { pos: [2.0, 2.05, 2.6], look: [-0.75, 1.95, 1.0], fov: 28 }, { pos: [1.85, 2.05, 2.4], look: [-0.75, 1.95, 1.0], fov: 26 }); return 'sore'; };
  } },
  // 26. "Tapi aku masih kecewa. Kasih aku waktu."
  { t0: 68.3, t1: 72.3, build(S) {
    SETS.gerbang(S.scene, { sore: true });
    const b = CAST.bagas(), a = CAST.aldo(); S.add(b, [0.75, 0, 1.0], -Math.PI / 2); S.add(a, [-0.75, 0, 1.0], Math.PI / 2);
    return (lt, k, t) => { a.act(combine(POSES.berdiri, { headX: 0.12 }), 'kecewa', t, talk('aldo', S.t)); b.act(combine(POSES.berdiri, POSES.tunduk), 'bersalah', t, false, 2);
      S.camMove(k, { pos: [2.0, 2.05, 2.6], look: [-0.75, 1.95, 1.0], fov: 26 }, { pos: [1.8, 2.05, 2.3], look: [-0.75, 1.95, 1.0], fov: 22 }); return 'sore'; };
  } },
  // 27. Berjalan berdampingan tanpa memaksa bicara
  { t0: 72.3, t1: 77.3, build(S) {
    SETS.gerbang(S.scene, { sore: true });
    const b = CAST.bagas(), a = CAST.aldo(); S.add(b, [0.6, 0, -1.0], 0); S.add(a, [-0.6, 0, -1.0], 0);
    return (lt, k, t) => { const z = -1.0 + lt * 0.9;
      a.root.position.z = z; b.root.position.z = z; const nod = lt < 0.8 ? Math.max(0, Math.sin(lt * 8)) * 0.25 : 0;
      a.act(walkPose(t, 0.7), 'netral', t); b.act(addPose(walkPose(t + 0.4, 0.7), { headX: nod + 0.1 }), 'kecewa', t, false, 2);
      S.camMove(k, { pos: [0.0, 1.8, -4.0], look: [0, 1.7, 2.0], fov: 46 }, { pos: [0.0, 3.6, -5.5], look: [0, 1.6, 4.0], fov: 50 }); return 'sore'; };
  } },
  // 28. Selesai
  { t0: 77.3, t1: 80.6, endcard: true },
];
