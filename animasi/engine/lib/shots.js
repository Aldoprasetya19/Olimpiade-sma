// Helper shot yang sering dipakai.
import * as THREE from 'three';
import { toon, ease, easeIn, easeOut, seg, lerp, clamp, noise1 } from './core.js';
import { SETS, phone, ladder } from './sets.js';
import { POSES, addPose, idle, combine, mixPose, walkPose, HIP } from './char.js';
import { CAST } from './cast.js';
import { drawPlayerChrome } from './phoneui.js';

// ---- ponsel memenuhi layar, dipegang tangan. draw(ctx, lt, k) menggambar UI.
export function phoneInsert(S, o) {
  const setInfo = SETS[o.set || 'rumah'](S.scene, o.setOpts || {});
  S.scene.fog = new THREE.Fog(o.fog || '#3a2e28', 1.2, o.fogFar || 9);
  const ph = phone({ case: o.case });
  S.scene.add(ph);
  const hand = new THREE.Group();
  const sk = toon(o.skin || '#c98a52');
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), sk); palm.scale.set(1.3, 1.2, 0.8); palm.position.set(-0.11, -0.13, -0.01); hand.add(palm);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 6, 10), sk); thumb.position.set(-0.115, -0.05, 0.03); thumb.rotation.z = -0.5; hand.add(thumb);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.5, 12), toon(o.sleeve || o.skin || '#c98a52')); arm.position.set(-0.2, -0.38, -0.05); arm.rotation.z = -0.5; hand.add(arm);
  ph.add(hand);
  const camPos = new THREE.Vector3(...(o.camPos || [0, 2.0, 2.4]));
  const look = new THREE.Vector3(...(o.look || [0, 1.6, 0]));
  return (lt, k, t, hud) => {
    const push = o.push ?? 0.12;
    const dist = (o.dist ?? 0.9) - push * ease(k);
    S.cam.position.copy(camPos); S.cam.lookAt(look); S.cam.fov = 40; S.cam.updateProjectionMatrix();
    const fwd = new THREE.Vector3(); S.cam.getWorldDirection(fwd);
    const sh = o.shake ?? 0.004;
    ph.position.copy(camPos).addScaledVector(fwd, dist);
    ph.quaternion.copy(S.cam.quaternion);
    ph.translateX((o.offX ?? 0) + noise1(t * 1.3, 2) * sh); ph.translateY((o.offY ?? -0.01) + noise1(t * 1.1, 4) * sh);
    ph.rotateX(o.tiltX ?? -0.05); ph.rotateZ((o.tiltZ ?? 0.03) + noise1(t * 0.7, 6) * sh * 2);
    if (o.vibrate) { const v = o.vibrate(lt); if (v) { ph.translateX(Math.sin(t * 90) * 0.006 * v); ph.rotateZ(Math.sin(t * 77) * 0.02 * v); } }
    ph.draw((c) => o.draw(c, lt, k, t));
    if (o.hud) o.hud(hud, lt, k, t);
    return o.grade || 'malam';
  };
}

// ---- lokasi tangga + pemeran kejadian
export function stairsSetup(S, { withAldo = true } = {}) {
  const info = SETS.sekolahTangga(S.scene);
  const dimas = CAST.dimas(); S.add(dimas, [4.5, 0, 1.0], -Math.PI / 2);
  const ph = phone(); dimas.handOf(-1).add(ph); ph.position.set(0, -0.12, 0.1); ph.rotation.set(0, 0, Math.PI);
  ph.draw(c => { c.fillStyle = '#2d6cdf'; c.fillRect(0, 0, 540, 1080); });
  const pek = CAST.pekerja(); S.add(pek, [0.1, 1.9, -0.75], 0);
  const lad = ladder(3.4); lad.position.set(0.1, 0, -0.95); S.scene.add(lad);
  const aldo = withAldo ? CAST.aldo() : null; if (aldo) S.add(aldo, [-4, 0, 1.6], Math.PI / 2);
  // debu
  const dust = new THREE.Group(); S.scene.add(dust);
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), toon('#d8d0c0', { transparent: true, opacity: 0.8, noOutline: true })); m.userData.dir = new THREE.Vector3(Math.cos(i * 2.4), 0.3 + (i % 3) * 0.15, Math.sin(i * 2.4) * 0.6); dust.add(m); }
  dust.visible = false;
  return { ...info, dimas, aldo, pek, dust };
}

// e = waktu kejadian (detik). Fase: Dimas jalan 0-3, papan lepas 3.5, Aldo lari 3.6-4.5, dorong 4.5, jatuh 4.7-5.3, papan jatuh 5.4-5.75
export function stairsEvent(R, e, t) {
  const { dimas, aldo, pek, pivot, sign, dust } = R;
  // pekerja
  pek.applyPose(addPose(POSES.kerja, { shR: [Math.sin(t * 6) * 0.1, 0, 0] }));
  pek.setFace(e > 3.5 && e < 6 ? 'kaget' : 'serius', t);
  // Dimas
  const DX0 = 4.5, DX1 = 1.0;
  if (e < 3) {
    const k = e / 3; dimas.root.position.set(lerp(DX0, DX1, k), 0, 1.0); dimas.root.rotation.set(0, -Math.PI / 2, 0);
    dimas.applyPose(combine(walkPose(e, 0.8), { shR: [-0.55, 0, 0.32], elR: -1.45, headX: 0.38 })); dimas.setFace('fokus', t);
  } else if (e < 4.62) {
    dimas.root.position.set(DX1, 0, 1.0); dimas.applyPose(addPose(combine(POSES.berdiri, POSES.hp), idle(t, 1))); dimas.setFace('fokus', t);
  } else {
    const k = easeOut(seg(e, 4.62, 5.2));
    dimas.root.position.set(lerp(DX1, 3.4, k), 0, lerp(1.0, 1.9, k));
    dimas.root.rotation.set(0, -Math.PI / 2 + k * 0.3, 0);
    dimas.applyPose(mixPose(combine(POSES.berdiri, POSES.hp), POSES.jatuh, k)); dimas.setFace(k > 0.3 ? 'kaget' : 'fokus', t);
  }
  // Aldo
  if (aldo) {
    if (e < 3.6) { aldo.root.visible = false; }
    else if (e < 4.5) {
      aldo.root.visible = true; const k = seg(e, 3.6, 4.5);
      aldo.root.position.set(lerp(-4, 0.05, k), 0, lerp(1.6, 1.05, k)); aldo.root.rotation.set(0, Math.PI / 2, 0);
      aldo.applyPose(walkPose(e, 1.2, true)); aldo.setFace('kaget', t);
    } else if (e < 4.75) {
      aldo.root.position.set(lerp(0.05, 0.5, seg(e, 4.5, 4.75)), 0, 1.05); aldo.applyPose(POSES.dorong); aldo.setFace('kaget', t);
    } else {
      const k = easeOut(seg(e, 4.75, 5.3));
      aldo.root.position.set(lerp(0.5, 1.0, k), 0, lerp(1.05, 1.2, k));
      aldo.applyPose(mixPose(POSES.dorong, { hipsY: 0.3, hipsX: 1.42, shR: [-2.8, 0, 0.3], elR: -0.3, shL: [-2.8, 0, -0.3], elL: -0.3, headX: -0.6, legR: 0.1, legL: -0.1 }, k));
      aldo.setFace(e > 6 ? 'cemas' : 'kaget', t);
    }
  }
  // papan
  const ch = pivot.children.filter(c => c.userData.chain !== undefined);
  if (e < 3.5) { pivot.rotation.z = Math.sin(t * 3) * 0.01; sign.position.y = 3.85; sign.rotation.x = 0; }
  else if (e < 5.4) {
    const k = seg(e, 3.5, 4.0);
    pivot.rotation.z = -0.15 * easeIn(k) + Math.sin((e - 3.5) * 11) * 0.05 * Math.exp(-(e - 3.5) * 0.8);
    ch.forEach(c => { if (c.userData.chain > 0) c.visible = false; });
    sign.position.y = 3.85; sign.rotation.x = 0;
  } else {
    const k = easeIn(seg(e, 5.4, 5.75));
    ch.forEach(c => c.visible = false);
    sign.position.y = lerp(3.85, 0.05, k); sign.rotation.x = lerp(0, -Math.PI / 2, k); pivot.rotation.z = lerp(-0.15, 0, k);
    sign.position.z = lerp(0, 0.6, k);
  }
  // debu saat menghantam
  const de = e - 5.75;
  dust.visible = de > 0 && de < 1.6;
  if (dust.visible) dust.children.forEach((m, i) => { const r = easeOut(clamp(de / 1.2)); m.position.set(1.0 + m.userData.dir.x * r * 1.4, 0.15 + m.userData.dir.y * r, 0.6 + m.userData.dir.z * r * 1.4); m.scale.setScalar(0.6 + r * 1.2); m.material.opacity = 0.8 * (1 - clamp(de / 1.6)); });
  return e >= 5.75 && e < 6.1 ? (1 - (e - 5.75) / 0.35) : 0; // intensitas guncangan
}

// pengendali kamera "direkam HP": guncang tangan
export function handheld(S, pos, look, fov, t, amp = 0.03, extraShake = 0) {
  const a = amp + extraShake * 0.15;
  S.cam.position.set(pos[0] + noise1(t * 1.5, 1) * a, pos[1] + noise1(t * 1.7, 2) * a, pos[2]);
  S.cam.fov = fov; S.cam.updateProjectionMatrix();
  S.cam.lookAt(look[0] + noise1(t * 1.2, 3) * a * 0.7 + Math.sin(t * 60) * extraShake * 0.05, look[1] + noise1(t * 1.4, 4) * a * 0.7, look[2]);
}

// ---- util episode
export function talker(spans) { return (who, t) => spans.some(([a, b, w]) => w === who && t >= a && t <= b); }
export function project(S, obj, offY = 0) {
  const v = new THREE.Vector3(); (obj.root || obj).getWorldPosition(v); v.y += offY; v.project(S.cam);
  return [(v.x + 1) / 2 * 720, (1 - v.y) / 2 * 1280];
}
export function hudBubble(ctx, x, y, text, a = 1, from = '', color = '#d35400') {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, a); const s = 0.85 + 0.15 * Math.min(1, a);
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '600 30px Nunito'; const w = ctx.measureText(text).width + 44; const h = from ? 96 : 66;
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 22); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 24, h / 2 - 2); ctx.lineTo(-w / 2 + 14, h / 2 + 16); ctx.lineTo(-w / 2 + 44, h / 2 - 2); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (from) { ctx.fillStyle = color; ctx.font = '800 22px Nunito'; ctx.fillText(from, -w / 2 + 22, -h / 2 + 26); ctx.fillStyle = '#111'; ctx.font = '600 30px Nunito'; ctx.fillText(text, -w / 2 + 22, 14); }
  else { ctx.fillStyle = '#111'; ctx.fillText(text, -w / 2 + 22, 2); }
  ctx.restore();
}
export function ring(ctx, x, y, r, a = 1, color = 'rgba(255,60,60,0.95)') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.setLineDash([]);
  ctx.beginPath(); ctx.ellipse(x, y, r * (0.8 + 0.2 * a), r * 1.25 * (0.8 + 0.2 * a), 0.1, 0, Math.PI * 2 * Math.min(1, a * 1.2)); ctx.stroke(); ctx.restore();
}
export function phoneOnTable(S, pos, rotY = 0, faceDown = false) {
  const ph = phone(); ph.rotation.set(faceDown ? Math.PI / 2 : -Math.PI / 2, 0, rotY); ph.position.set(...pos); S.scene.add(ph); return ph;
}

// ---- tampilan rekaman. crop=true: klip 17 dtk yang beredar (persegi tengah + bar hitam)
export const FOOT_CAM = { pos: [1.2, 1.3, 10.5], look: [1.2, 1.3, 0], fov: 40 };
export function footageView(S, R, e, t, hud, o = {}) {
  const sh = stairsEvent(R, e, t);
  const c = FOOT_CAM;
  handheld(S, c.pos, c.look, c.fov, o.freezeT ?? t, 0.03, sh);
  if (o.crop) {
    hud.fillStyle = '#000'; hud.fillRect(0, 0, 720, 280); hud.fillRect(0, 1000, 720, 280);
    hud.save(); hud.translate(0, 1000); drawPlayerChrome(hud, { ...o, w: 720, h: 200 }); hud.restore();
  } else drawPlayerChrome(hud, { ...o, w: 720, h: 1280 });
  return sh;
}
