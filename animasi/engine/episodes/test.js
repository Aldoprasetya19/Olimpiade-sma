import { CAST } from '../lib/cast.js';
import { SETS } from '../lib/sets.js';
import { POSES, addPose, idle } from '../lib/char.js';
import { drawChat, drawPlayerChrome } from '../lib/phoneui.js';
import { phoneInsert, stairsSetup, stairsEvent, handheld } from '../lib/shots.js';
export const duration = 8;
export const shots = [
 { t0: 0, t1: 2, build(S) {
   SETS.kelas(S.scene);
   const cs = [CAST.aldo(), CAST.dimas(), CAST.reno(), CAST.bagas(), CAST.wali(), CAST.ibu(), CAST.pekerja(), CAST.aldoRumah()];
   cs.forEach((c, i) => S.add(c, [(i - 3.5) * 1.15, 0, 0.5 + (i%2)*1.2], 0));
   return (lt, k, t) => { cs.forEach((c, i) => { c.applyPose(addPose(POSES.berdiri, idle(t, i))); c.setFace(['netral','senyum','cemas','marah','kaget','senang','sedih','serius'][i], t); });
     S.camMove(k, { pos: [0, 2.0, 5.8], look: [0, 1.4, 0.5], fov: 75 }); return 'hangat'; };
 }},
 { t0: 2, t1: 4, build(S) { return phoneInsert(S, { set: 'rumah', camPos: [0, 2.0, 2.4], look: [0, 1.4, -2],
     draw: (c) => drawChat(c, { title: 'XII IPA 2', subtitle: 'Sinta, Rio, Maya, +33', group: true, av: { group: 'XII' }, unread: 47, messages: [{ from: 'Sinta', text: 'Ini Aldo kan??', color: '#d35400' }, { from: 'Rio', text: 'parah sih @Aldo', color: '#8e44ad' }, { kind: 'video', from: 'Anon', dur: '0:17', color: '#16a085' }, { from: 'Maya', text: 'Pantes Dimas nggak masuk hari ini', color: '#2980b9' }] }) }); } },
 { t0: 4, t1: 6, build(S) { const R = stairsSetup(S); return (lt, k, t, hud) => { const sh = stairsEvent(R, 4.4 + lt * 0.5, t); handheld(S, [1.0, 1.4, 7.5], [0.8, 0.8, 0], 30, t, 0.03, sh); drawPlayerChrome(hud, { cur: 5, dur: 17, w: 720, h: 1280 }); return 'rekaman'; }; } },
 { t0: 6, t1: 8, build(S) { const R = stairsSetup(S); return (lt, k, t, hud) => { const sh = stairsEvent(R, 3.8 + lt * 1.2, t); handheld(S, [1.0, 1.9, 7.5], [0.8, 2.0, 0], 50, t, 0.03, sh); drawPlayerChrome(hud, { cur: 25, dur: 42, w: 720, h: 1280, highlight:[20,37] }); return 'rekaman'; }; } },
];
