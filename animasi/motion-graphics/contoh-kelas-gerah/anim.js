// Motion graphics: "Kenapa kelas terasa gerah saat siang?"
// render(t) draws the frame at time t (seconds) into #stage (1920x1080 SVG).
const W = 1920, H = 1080;
const C = {
  navy: '#1D2B53', ink: '#24304F', cream: '#FFF6E9', sun: '#FFC93C', sunL: '#FFE08A', orange: '#FF7A3D',
  red: '#E63946', blue: '#4D96FF', sky: '#BFE3FF', teal: '#2EC4B6', green: '#7BC67E', wood: '#C98B5A',
  woodD: '#9C6440', skin: '#F4C7A1', hair: '#3D2C2E', wall: '#F6EAD3', board: '#2F6B4F'
};
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const p = (t, a, d = 0.5) => cl((t - a) / d);
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eb = x => { const c1 = 1.70158, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const pop = (t, a, d = 0.5) => eb(p(t, a, d));
const fi = (t, a, d = 0.4) => eo(p(t, a, d));
function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
function mix(a, b, k) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, '0')).join(''); }
function g(c, { x = 0, y = 0, s = 1, o = 1, r = 0 } = {}) {
  if (o <= 0.001 || s <= 0.001) return '';
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})" opacity="${o.toFixed(3)}">${c}</g>`;
}
const _cv = document.createElement('canvas').getContext('2d');
function measure(s, size, w = 800) { _cv.font = `${w} ${size}px Inter`; return _cv.measureText(s).width; }
function txt(x, y, s, size = 48, fill = C.navy, w = 800, anchor = 'middle', extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" font-family="Inter" ${extra}>${s}</text>`;
}
function pill(x, y, s, { size = 40, bg = C.navy, fg = '#fff', sc = 1, o = 1, r = 0, w = 800 } = {}) {
  const tw = measure(s, size, w) + size * 1.4, h = size * 1.75;
  return g(`<rect x="${-tw / 2 + 6}" y="${-h / 2 + 8}" width="${tw}" height="${h}" rx="${h / 2}" fill="#000" opacity=".15"/>
    <rect x="${-tw / 2}" y="${-h / 2}" width="${tw}" height="${h}" rx="${h / 2}" fill="${bg}"/>` + txt(0, size * 0.36, s, size, fg, w), { x, y, s: sc, o, r });
}
function sun(x, y, r, t, glow = 1) {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = i * 30 + t * 18, L = r * 0.42 + Math.sin(t * 4 + i) * r * 0.06;
    rays += `<rect x="${-r * 0.09}" y="${-r - 18 - L}" width="${r * 0.18}" height="${L}" rx="${r * 0.09}" fill="#FFB703" transform="rotate(${a})"/>`;
  }
  return `<g transform="translate(${x} ${y})"><circle r="${r * 1.9}" fill="url(#sunGlow)" opacity="${0.8 * glow}"/>${rays}
    <circle r="${r}" fill="${C.sun}"/><circle r="${r * 0.72}" fill="${C.sunL}"/></g>`;
}
function thermo(x, y, lv, h = 300, label = '') {
  const col = lv > 0.62 ? C.red : lv > 0.4 ? C.orange : C.blue;
  const fh = (h - 30) * cl(lv);
  let ticks = '';
  for (let i = 1; i < 6; i++) ticks += `<rect x="26" y="${h - 20 - i * (h - 40) / 6}" width="16" height="5" rx="2" fill="${C.navy}"/>`;
  return `<g transform="translate(${x} ${y})">
    <rect x="-26" y="0" width="52" height="${h}" rx="26" fill="#fff" stroke="${C.navy}" stroke-width="7"/>
    <rect x="-12" y="${h - 10 - fh}" width="24" height="${fh + 14}" rx="12" fill="${col}"/>
    <circle cx="0" cy="${h + 26}" r="42" fill="${col}" stroke="${C.navy}" stroke-width="7"/>
    <circle cx="-12" cy="${h + 14}" r="10" fill="#fff" opacity=".5"/>${ticks}
    ${label ? txt(0, h + 110, label, 30, C.navy, 800) : ''}</g>`;
}
function student(x, y, s, shirt, t, hot = 0, ph = 0) {
  const hair = [C.hair, '#5A3A22', '#1F1B24'][Math.abs(Math.round(ph * 7)) % 3];
  const bob = Math.sin(t * 2 + ph * 5) * 2;
  const cheek = hot > 0.3 ? `<circle cx="-20" cy="-60" r="8" fill="${C.red}" opacity="${0.45 * hot}"/><circle cx="20" cy="-60" r="8" fill="${C.red}" opacity="${0.45 * hot}"/>` : '';
  const mouth = hot > 0.5
    ? `<path d="M -10 -50 Q -5 -55 0 -50 Q 5 -45 10 -50" stroke="${C.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M -10 -53 Q 0 -44 10 -53" stroke="${C.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const eyes = hot > 0.5
    ? `<path d="M -18 -72 l 9 4 M 18 -72 l -9 4" stroke="${C.navy}" stroke-width="4" stroke-linecap="round"/>`
    : `<circle cx="-12" cy="-70" r="4.5" fill="${C.navy}"/><circle cx="12" cy="-70" r="4.5" fill="${C.navy}"/>`;
  let sweat = '';
  if (hot > 0.4) {
    for (let i = 0; i < 2; i++) {
      const k = ((t * 0.9 + i * 0.5 + ph) % 1);
      const sx = i ? 38 : -40, sy = -88 + k * 40;
      sweat += `<path d="M ${sx} ${sy - 14} Q ${sx + 9} ${sy} ${sx} ${sy + 6} Q ${sx - 9} ${sy} ${sx} ${sy - 14} Z" fill="#6EC1FF" opacity="${(1 - k) * hot}"/>`;
    }
  }
  return g(`<rect x="-46" y="-36" width="92" height="96" rx="34" fill="${shirt}"/>
    <path d="M -16 -36 L 0 -18 L 16 -36 Z" fill="#fff" opacity=".85"/>
    <circle cx="0" cy="-68" r="36" fill="${C.skin}"/>
    <path d="M -37 -70 Q -38 -108 0 -106 Q 38 -108 37 -70 Q 22 -92 -6 -88 Q -26 -86 -37 -70 Z" fill="${hair}"/>
    ${eyes}${mouth}${cheek}${sweat}`, { x, y: y + bob, s });
}
function wave(x, y, t, h = 90, col = C.orange, ph = 0, sw = 7) {
  const k = ((t * 0.7 + ph) % 1), yy = y - k * 50;
  let d = `M ${x} ${yy}`;
  for (let i = 1; i <= 6; i++) d += ` Q ${x + (i % 2 ? 14 : -14)} ${yy - (i - 0.5) * h / 6} ${x} ${yy - i * h / 6}`;
  return `<path d="${d}" stroke="${col}" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity="${(Math.sin(k * Math.PI) * 0.9).toFixed(3)}"/>`;
}
function arrow(x1, y1, x2, y2, col, sw = 12, head = 26) {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * head * 0.6, hy = y2 - Math.sin(a) * head * 0.6;
  const p1 = [x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head], p2 = [x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head];
  return `<line x1="${x1}" y1="${y1}" x2="${hx}" y2="${hy}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>
    <path d="M ${x2} ${y2} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z" fill="${col}" stroke="${col}" stroke-width="${sw * 0.5}" stroke-linejoin="round"/>`;
}
function xBadge(x, y, s) {
  return g(`<circle r="34" fill="${C.red}" stroke="#fff" stroke-width="6"/><path d="M -13 -13 L 13 13 M 13 -13 L -13 13" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`, { x, y, s });
}
function card(x, y, w, h, fill = '#fff', r = 36) {
  return `<rect x="${x + 8}" y="${y + 12}" width="${w}" height="${h}" rx="${r}" fill="#000" opacity=".12"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
}
function desk(x, y, w = 150, s = 1) {
  return g(`<rect x="${-w / 2}" y="0" width="${w}" height="16" rx="6" fill="${C.wood}"/><rect x="${-w / 2}" y="12" width="${w}" height="8" fill="${C.woodD}"/>
    <rect x="${-w / 2 + 12}" y="18" width="10" height="44" fill="${C.woodD}"/><rect x="${w / 2 - 22}" y="18" width="10" height="44" fill="${C.woodD}"/>`, { x, y, s });
}
function clockFace(x, y, r, hh, mm) {
  let ticks = '';
  for (let i = 0; i < 12; i++) ticks += `<rect x="-4" y="${-r + 10}" width="8" height="${i % 3 ? 12 : 22}" rx="4" fill="${C.navy}" transform="rotate(${i * 30})"/>`;
  const ha = (hh % 12 + mm / 60) * 30, ma = mm * 6;
  return `<g transform="translate(${x} ${y})"><circle r="${r + 12}" fill="${C.navy}"/><circle r="${r}" fill="#fff"/>${ticks}
    <rect x="-7" y="${-r * 0.5}" width="14" height="${r * 0.55}" rx="7" fill="${C.navy}" transform="rotate(${ha})"/>
    <rect x="-5" y="${-r * 0.78}" width="10" height="${r * 0.83}" rx="5" fill="${C.orange}" transform="rotate(${ma})"/>
    <circle r="12" fill="${C.navy}"/></g>`;
}
function windIcon(x, y, s, col = C.blue) {
  return g(`<path d="M -60 -24 H 30 A 22 22 0 1 0 8 -46" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M -60 4 H 50 A 22 22 0 1 1 28 26" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M -60 32 H 0" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>`, { x, y, s });
}
function peopleIcon(x, y, s) {
  return g(`<circle cx="-42" cy="-26" r="20" fill="${C.teal}"/><rect x="-70" y="0" width="56" height="50" rx="22" fill="${C.teal}"/>
    <circle cx="42" cy="-26" r="20" fill="${C.teal}"/><rect x="14" y="0" width="56" height="50" rx="22" fill="${C.teal}"/>
    <circle cx="0" cy="-36" r="26" fill="${C.navy}"/><rect x="-36" y="-4" width="72" height="62" rx="28" fill="${C.navy}"/>`, { x, y, s });
}
let _bgN = 0;
function bg(top, bot) {
  const id = 'bgG' + (_bgN++);
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
function dots(t, col, op = 0.18) {
  let s = '';
  for (let i = 0; i < 18; i++) {
    const x = (i * 263 + t * 12 * (i % 3 + 1)) % (W + 100) - 50, y = (i * 157) % H;
    s += `<circle cx="${x}" cy="${y}" r="${6 + (i % 4) * 4}" fill="${col}" opacity="${op}"/>`;
  }
  return s;
}

// ---------- SCENES ----------
const SCENES = [];
function scene(start, end, fn) { SCENES.push({ start, end, fn }); }

// 1. Pagi vs Siang
scene(0, 10.1, t => {
  let s = `<rect width="${W}" height="${H}" fill="#EAF5FF"/>` + dots(t, '#9FD0FF');
  // greeting -> header
  const mv = eio(p(t, 1.5, 0.8));
  const hs = pop(t, 0.05, 0.6) * lerp(1, 0.62, mv);
  s += g(txt(0, 30, 'Halo, teman-teman! 👋', 110, C.navy, 900), { x: 960, y: lerp(520, 115, mv), s: hs });
  // panel pagi
  const a = eo(p(t, 2.5, 0.7));
  if (a > 0) {
    let pp = card(-380, -330, 760, 660, '#fff') +
      `<clipPath id="cpA"><rect x="-380" y="-330" width="760" height="660" rx="36"/></clipPath>
       <g clip-path="url(#cpA)"><rect x="-380" y="-330" width="760" height="420" fill="#CFEAFF"/><rect x="-380" y="90" width="760" height="300" fill="#E8F5E1"/>
       ${sun(-230, -40 - eo(p(t, 2.8, 1.5)) * 60, 48, t, 0.6)}</g>` +
      pill(0, -260, 'PAGI · 07.00', { size: 34, bg: C.blue }) +
      student(-20, 220, 1.35, C.blue, t, 0, 0.1) + thermo(270, -150, 0.25, 260) +
      pill(-20, 30, 'Sejuk 😊', { size: 36, bg: '#fff', fg: C.blue, sc: pop(t, 5.0) });
    s += g(pp, { x: lerp(-500, 520, a), y: 560 });
  }
  const b = eo(p(t, 6.0, 0.7));
  if (b > 0) {
    const heat = eo(p(t, 6.6, 2.0));
    const hot = p(t, 7.7, 0.8);
    let waves = '';
    if (hot > 0) for (let i = 0; i < 4; i++) waves += `<g opacity="${hot}">${wave(-200 + i * 120, 140, t, 110, C.orange, i * 0.27)}</g>`;
    let pp = card(-380, -330, 760, 660, '#fff') +
      `<clipPath id="cpB"><rect x="-380" y="-330" width="760" height="660" rx="36"/></clipPath>
       <g clip-path="url(#cpB)"><rect x="-380" y="-330" width="760" height="420" fill="${mix('#CFEAFF', '#FFD59E', heat)}"/><rect x="-380" y="90" width="760" height="300" fill="${mix('#E8F5E1', '#FCE3C4', heat)}"/>
       ${sun(-30, -150, 70, t, 1)}${waves}</g>` +
      pill(0, -260, 'SIANG · 12.00', { size: 34, bg: C.orange }) +
      student(-20, 220, 1.35, C.orange, t, hot, 0.6) + thermo(270, -150, lerp(0.25, 0.88, heat), 260) +
      pill(-30, 20, 'GERAH!', { size: 58, bg: C.red, sc: pop(t, 9.2, 0.45), r: -8, w: 900 });
    s += g(pp, { x: lerp(2420, 1400, b), y: 560 });
  }
  return s;
});

// 2. Di ruang kelas + pertanyaan
scene(10.1, 16.3, t => {
  const z = lerp(1.18, 1, eio(p(t, 10.1, 1.6)));
  let room = `<rect width="${W}" height="760" fill="${C.wall}"/><rect y="760" width="${W}" height="320" fill="#E3C9A0"/>
    <rect y="740" width="${W}" height="24" fill="#D9B98A"/>`;
  // windows
  room += `<rect x="90" y="190" width="320" height="380" rx="14" fill="#fff"/><rect x="108" y="208" width="284" height="344" fill="#BFE3FF"/>
    <rect x="245" y="208" width="10" height="344" fill="#fff"/><rect x="108" y="375" width="284" height="10" fill="#fff"/>${sun(330, 270, 34, t, 0.5)}`;
  room += `<rect x="1580" y="260" width="200" height="480" rx="10" fill="${C.wood}"/><circle cx="1610" cy="520" r="10" fill="${C.sun}"/>`;
  // board
  room += `<rect x="540" y="160" width="840" height="400" rx="16" fill="${C.woodD}"/><rect x="560" y="180" width="800" height="360" rx="8" fill="${C.board}"/>`;
  const q1 = 'Kenapa kelas terasa', q2 = 'gerah saat siang?';
  const n = Math.floor(p(t, 13.9, 1.6) * (q1.length + q2.length));
  room += txt(960, 330, q1.slice(0, n), 64, '#F4F1DE', 800) + txt(960, 420, q2.slice(0, Math.max(0, n - q1.length)), 64, C.sunL, 800);
  if (n > 0 && n < q1.length + q2.length && Math.floor(t * 4) % 2) {}
  // desks + students (backs)
  const cols = [C.blue, C.orange, C.teal, '#9B5DE5', C.red];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = 520 + i * 300 + (r ? -60 : 0), y = r ? 900 : 790, sc = r ? 1.2 : 1;
    room += g(`<circle cx="0" cy="-68" r="36" fill="${[C.hair, '#5A3A22'][(i + r) % 2]}"/><rect x="-46" y="-36" width="92" height="96" rx="34" fill="${cols[(i + r * 2) % 5]}"/>`, { x, y, s: sc });
    room += desk(x, y + 30 * sc, 190 * sc);
  }
  let s = `<rect width="${W}" height="${H}" fill="${C.wall}"/>` + g(room, { x: 960 * (1 - z), y: 540 * (1 - z), s: z });
  s += g(`<path d="M 0 30 C -40 -10 -34 -60 0 -60 C 34 -60 40 -10 0 30 Z" fill="${C.red}"/><circle cy="-30" r="13" fill="#fff"/>`, { x: 700, y: 95, s: pop(t, 10.8) });
  s += pill(980, 80, 'Di ruang kelas', { size: 44, sc: pop(t, 10.9) });
  // big question mark bounce
  const qm = pop(t, 14.0, 0.5);
  s += g(txt(0, 50, '?', 170, C.orange, 900), { x: 1470, y: 330 + Math.sin(t * 5) * 12, s: qm, r: 12 });
  return s;
});

// 3. Bagian luar kelas: atap & dinding menyerap panas, panas masuk
scene(16.3, 27.0, t => {
  let s = bg('#9ED3FF', '#DDF0FF');
  const heatR = eo(p(t, 20.3, 2.4)), heatW = eo(p(t, 20.9, 2.4));
  s += `<ellipse cx="960" cy="1060" rx="1400" ry="260" fill="#8CCB7E"/>`;
  s += sun(lerp(-80, 280, eo(p(t, 16.4, 1.2))), lerp(-80, 210, eo(p(t, 16.4, 1.2))), 80, t);
  s += pill(1500, 95, 'Bagian luar kelas', { size: 42, sc: pop(t, 17.1) });
  // building
  const cut = eo(p(t, 24.0, 0.8));
  const wallC = mix('#F2E8CF', '#FFB07A', heatW), roofC = mix('#7D8BA6', '#E2553A', heatR);
  let b = '';
  b += `<rect x="560" y="470" width="800" height="350" fill="#FFE9D6"/>`; // interior
  // interior heat arrows
  if (cut > 0) {
    let ar = '';
    for (let i = 0; i < 3; i++) {
      const x = 720 + i * 240, k = (t * 0.8 + i * 0.33) % 1;
      ar += `<g opacity="${Math.sin(k * Math.PI)}">${arrow(x, 490 + k * 120, x, 560 + k * 120, C.red, 14, 34)}</g>`;
    }
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.8 + i * 0.5) % 1, y = 640 + i * 90;
      ar += `<g opacity="${Math.sin(k * Math.PI)}">${arrow(580 + k * 80, y, 650 + k * 80, y, C.orange, 12, 30)}${arrow(1340 - k * 80, y, 1270 - k * 80, y, C.orange, 12, 30)}</g>`;
    }
    b += g(ar, { o: cut });
    b += thermo(960, 560, lerp(0.3, 0.8, eo(p(t, 25.0, 2))), 150);
    b += desk(760, 760, 150) + desk(1160, 760, 150);
  }
  // front wall (fades on cutaway)
  b += `<g opacity="${1 - cut * 0.8}"><rect x="560" y="470" width="800" height="350" fill="${wallC}"/>
    ${[640, 870, 1150].map(x => `<rect x="${x}" y="540" width="140" height="130" rx="8" fill="#fff"/><rect x="${x + 10}" y="550" width="120" height="110" fill="#BFE3FF"/>`).join('')}
    <rect x="1000" y="640" width="110" height="180" rx="6" fill="${C.wood}"/></g>`;
  b += `<rect x="560" y="470" width="800" height="350" fill="none" stroke="${C.navy}" stroke-width="8"/>`;
  b += `<path d="M 510 480 L 960 280 L 1410 480 Z" fill="${roofC}" stroke="${C.navy}" stroke-width="8" stroke-linejoin="round"/>`;
  b += `<rect x="900" y="390" width="120" height="44" rx="10" fill="#fff"/>` + txt(960, 422, 'KELAS', 26, C.navy, 900);
  s += b;
  // rays
  const rp = eo(p(t, 19.2, 1.0));
  if (rp > 0 && t < 26.5) {
    const tg = [[760, 380], [960, 300], [1180, 400], [700, 600], [920, 720], [1250, 640]];
    tg.forEach(([x, y], i) => {
      const k = cl(rp * 1.3 - i * 0.06), sx = 280, sy = 210;
      const ex = lerp(sx + 60, x, k), ey = lerp(sy + 40, y, k);
      s += `<line x1="${sx + 60}" y1="${sy + 40}" x2="${ex}" y2="${ey}" stroke="#FFB703" stroke-width="9" stroke-dasharray="26 18" stroke-dashoffset="${-t * 160}" stroke-linecap="round" opacity="${0.85 * (1 - p(t, 26, 0.5))}"/>`;
      if (k >= 1) s += `<circle cx="${x}" cy="${y}" r="${14 + Math.sin(t * 8 + i) * 4}" fill="#FFD166" opacity=".9"/>`;
    });
  }
  // shimmer above roof
  const sh = p(t, 22.2, 0.6);
  if (sh > 0) for (let i = 0; i < 5; i++) s += `<g opacity="${sh}">${wave(700 + i * 130, 330 + Math.abs(i - 2) * 50, t, 90, C.red, i * 0.21, 6)}</g>`;
  s += pill(1660, 380, '🔥 Menyerap panas', { size: 38, bg: C.orange, sc: pop(t, 22.4) });
  s += pill(1625, 600, 'Pindah ke dalam ruangan', { size: 32, bg: C.red, sc: pop(t, 25.7) });
  if (pop(t, 25.7) > 0.5) s += `<g opacity="${fi(t, 25.9)}">${arrow(1420, 600, 1330, 640, C.red, 10, 26)}</g>`;
  return s;
});

// 4. Sinar lewat jendela -> meja & lantai menghangat
scene(27.0, 36.0, t => {
  let s = `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect y="700" width="${W}" height="380" fill="#E3C9A0"/><rect y="690" width="${W}" height="18" fill="#D9B98A"/>`;
  s += `<rect x="190" y="150" width="440" height="420" rx="14" fill="#fff"/><rect x="210" y="170" width="400" height="380" fill="#BFE3FF"/>
    ${sun(330, 280, 46, t, 0.7)}<rect x="404" y="170" width="12" height="380" fill="#fff"/><rect x="210" y="355" width="400" height="12" fill="#fff"/>`;
  s += `<rect x="1150" y="150" width="620" height="330" rx="14" fill="${C.woodD}"/><rect x="1166" y="166" width="588" height="298" rx="8" fill="${C.board}"/>`;
  s += txt(1460, 280, 'Sinar matahari', 46, '#F4F1DE', 800) + txt(1460, 350, '→ jendela → meja & lantai', 38, C.sunL, 700);
  // beam
  const bp = eo(p(t, 28.3, 1.2));
  if (bp > 0) {
    const k = bp;
    s += `<defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE066" stop-opacity=".75"/><stop offset="1" stop-color="#FFD166" stop-opacity=".25"/></linearGradient></defs>
      <polygon points="210,170 610,170 ${lerp(610, 1320, k)},${lerp(170, 880, k)} ${lerp(210, 640, k)},${lerp(550, 880, k)}" fill="url(#beam)"/>`;
  }
  const dh = eo(p(t, 30.8, 1.6)), fh = eo(p(t, 31.4, 1.6));
  // floor spot
  s += `<ellipse cx="900" cy="850" rx="${200 * Math.max(fh, 0.001)}" ry="${48 * Math.max(fh, 0.001)}" fill="${C.orange}" opacity="${0.55 * fh}"/>`;
  // desk + chair

  s += g(`<rect x="-180" y="0" width="360" height="26" rx="8" fill="${mix(C.wood, '#FF6B35', dh)}"/><rect x="-180" y="22" width="360" height="10" fill="${C.woodD}"/>
    <rect x="-160" y="30" width="16" height="130" fill="${C.woodD}"/><rect x="144" y="30" width="16" height="130" fill="${C.woodD}"/>
    <rect x="-80" y="-40" width="110" height="40" rx="6" fill="#fff" opacity=".9"/>`, { x: 1100, y: 620 });
  if (dh > 0) s += `<rect x="920" y="612" width="360" height="40" rx="12" fill="${C.sun}" opacity="${0.35 * dh * (0.7 + 0.3 * Math.sin(t * 6))}"/>`;
  s += pill(1330, 540, 'Meja', { size: 34, bg: C.orange, sc: pop(t, 30.8) });
  s += pill(620, 860, 'Lantai', { size: 34, bg: C.orange, sc: pop(t, 31.45) });
  const hw = p(t, 32.5, 0.6);
  if (hw > 0) {
    for (let i = 0; i < 4; i++) s += `<g opacity="${hw}">${wave(990 + i * 75, 600, t, 100, C.red, i * 0.25, 6)}</g>`;
    for (let i = 0; i < 3; i++) s += `<g opacity="${hw}">${wave(820 + i * 80, 840, t, 90, C.red, i * 0.3 + 0.1, 6)}</g>`;
  }
  s += thermo(1720, 520, lerp(0.35, 0.75, eo(p(t, 32.5, 3))), 170);
  s += pill(960, 90, 'Permukaan ikut menghangat', { size: 46, bg: C.red, sc: pop(t, 34.8) });
  return s;
});

// 5. Pintu & jendela: pertukaran udara sulit
scene(36.0, 45.3, t => {
  let s = bg('#CDEBFF', '#EAF7FF');
  s += `<rect y="800" width="${W}" height="280" fill="#8CCB7E"/>`;
  const warm = eo(p(t, 42.0, 2.0));
  // room interior
  s += `<rect x="560" y="300" width="800" height="500" fill="${mix('#FFF6E9', '#FFD2B0', warm)}"/>`;
  // particles
  if (warm > 0) {
    for (let i = 0; i < 26; i++) {
      const bx = 620 + (i * 137) % 680, by = 340 + (i * 89) % 420;
      const x = bx + Math.sin(t * 1.3 + i) * 26, y = by + Math.cos(t * 1.1 + i * 2) * 20;
      s += `<circle cx="${x}" cy="${y}" r="${10 + (i % 3) * 5}" fill="${i % 2 ? C.red : C.orange}" opacity="${0.55 * cl(warm * 1.4 - i / 40)}"/>`;
    }
  }
  // walls with openings: left window 440-600, right door 560-800
  const wc = C.navy;
  s += `<rect x="540" y="300" width="30" height="140" fill="${wc}"/><rect x="540" y="600" width="30" height="200" fill="${wc}"/>
    <rect x="1350" y="300" width="30" height="260" fill="${wc}"/><rect x="540" y="290" width="840" height="24" fill="${wc}"/>
    <rect x="520" y="800" width="880" height="24" fill="${wc}"/>
    <path d="M 500 300 L 960 130 L 1420 300 Z" fill="#7D8BA6" stroke="${wc}" stroke-width="8" stroke-linejoin="round"/>`;
  // window glass (half open) & door leaf
  s += `<rect x="548" y="440" width="14" height="160" fill="#9ED3FF" stroke="${wc}" stroke-width="3"/>`;
  s += `<rect x="1356" y="560" width="18" height="240" fill="${C.wood}"/>`;
  // desks
  s += desk(760, 720, 160) + desk(1120, 720, 160);
  // highlights
  const hd = p(t, 36.96, 0.4) * (1 - p(t, 38.9, 0.5)), hw = p(t, 37.64, 0.4) * (1 - p(t, 38.9, 0.5));
  const pulse = 1 + Math.sin(t * 7) * 0.06;
  if (hd > 0) s += `<rect x="1320" y="545" width="90" height="270" rx="20" fill="none" stroke="${C.sun}" stroke-width="10" opacity="${hd}" transform="translate(1365 680) scale(${pulse}) translate(-1365 -680)"/>`;
  if (hw > 0) s += `<rect x="510" y="425" width="90" height="190" rx="20" fill="none" stroke="${C.sun}" stroke-width="10" opacity="${hw}" transform="translate(555 520) scale(${pulse}) translate(-555 -520)"/>`;
  s += pill(1560, 470, 'Pintu', { size: 38, sc: pop(t, 36.96) });
  s += pill(360, 370, 'Jendela', { size: 38, sc: pop(t, 37.64) });
  // air exchange arrows
  const ap = fi(t, 39.0, 0.5);
  if (ap > 0) {
    const stop = eo(p(t, 40.7, 0.6));
    const tr = k => lerp(((t * 0.9) % 1), 0.55 + Math.sin(t * 10) * 0.02, stop) * (1);
    const k = tr();
    // window: cool in (blue), warm out (red)
    s += `<g opacity="${ap}">${arrow(lerp(220, 380, k), 490, lerp(330, 490, k), 490, C.blue, 14, 34)}
      ${arrow(lerp(840, 700, k), 560, lerp(730, 590, k), 560, C.red, 14, 34)}
      ${arrow(lerp(1700, 1540, k), 640, lerp(1590, 1430, k), 640, C.blue, 14, 34)}
      ${arrow(lerp(1080, 1220, k), 740, lerp(1190, 1330, k), 740, C.red, 14, 34)}</g>`;
    s += txt(250, 600, 'udara luar', 30, C.blue, 800) + txt(1680, 720, 'udara luar', 30, C.blue, 800);
    s += xBadge(555, 395, pop(t, 41.0, 0.4)) + xBadge(1365, 515, pop(t, 41.2, 0.4));
  }
  s += pill(960, 380, 'Udara hangat bertahan lebih lama', { size: 36, bg: C.red, sc: pop(t, 42.4) });
  s += pill(960, 80, 'Pertukaran udara sulit', { size: 46, bg: C.navy, sc: pop(t, 40.7) });
  return s;
});

// 6. Kelas penuh: tubuh melepaskan panas
scene(45.3, 54.2, t => {
  let s = `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect y="560" width="${W}" height="520" fill="#E3C9A0"/><rect y="550" width="${W}" height="16" fill="#D9B98A"/>`;
  const hot = eo(p(t, 49.8, 1.2));
  s += `<rect x="70" y="190" width="250" height="300" rx="12" fill="#fff"/><rect x="86" y="206" width="218" height="268" fill="#BFE3FF"/><rect x="190" y="206" width="10" height="268" fill="#fff"/>`;
  const cols = [C.blue, C.orange, C.teal, '#9B5DE5', C.red, '#F15BB5'];
  const rows = [{ y: 520, s: 0.78, n: 5, x0: 600, dx: 190 }, { y: 680, s: 0.9, n: 5, x0: 560, dx: 220 }, { y: 845, s: 1.02, n: 5, x0: 510, dx: 250 }];
  let idx = 0, waves = '';
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++, idx++) {
      const x = r.x0 + i * r.dx, sc = r.s * pop(t, 45.8 + idx * 0.035, 0.45);
      s += student(x, r.y, sc, cols[(idx * 7) % 6], t, hot, idx * 0.13);
      s += desk(x, r.y + 18 * r.s, 140 * r.s, sc > 0 ? 1 : 0);
      if (t > 46.9) waves += `<g opacity="${p(t, 46.9 + idx * 0.02, 0.6)}">${wave(x, r.y - 120 * r.s, t, 80 * r.s, ri === 2 ? C.red : C.orange, idx * 0.17, 6 * r.s)}</g>`;
    }
  });
  s += waves;
  s += thermo(1760, 300, lerp(0.35, 0.9, eo(p(t, 47.8, 3.4))), 330, 'Suhu');
  s += pill(960, 90, 'Kelas penuh', { size: 46, sc: pop(t, 45.9) });
  s += pill(960, 190, '+ Panas dari tubuh kita', { size: 40, bg: C.red, sc: pop(t, 48.0) });
  // weak airflow
  const af = fi(t, 52.6, 0.4);
  if (af > 0) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i * 0.33) % 1;
      s += `<g opacity="${af * (1 - k)}">${arrow(320 + k * 40, 260 + i * 80, 380 + k * 60, 260 + i * 80, C.blue, 9, 22)}</g>`;
    }
    s += pill(200, 545, 'Aliran udara terbatas', { size: 28, bg: C.blue, sc: pop(t, 52.6) });
  }
  return s;
});

// 7. Ringkasan
scene(54.2, 67.7, t => {
  let s = bg('#FFF3E2', '#FFE2C2') + dots(t, '#FFC08A', 0.2);
  s += g(txt(0, 0, 'Jadi…', 72, C.orange, 900), { x: 960, y: 140, s: pop(t, 54.4) });
  s += pill(960, 240, 'Kelas terasa lebih panas saat siang', { size: 48, bg: C.navy, sc: pop(t, 55.4) });
  const cards = [
    { x: 420, t0: 58.3, title: 'Panas matahari', sub: 'masuk ke ruangan', icon: (x, y) => sun(x, y, 46, t, 0.7), col: C.orange },
    { x: 960, t0: 62.2, title: 'Pertukaran udara', sub: 'lancar atau tidak', icon: (x, y) => windIcon(x, y, 1.1), col: C.blue },
    { x: 1500, t0: 63.5, title: 'Jumlah orang', sub: 'di dalam kelas', icon: (x, y) => peopleIcon(x, y, 1), col: C.teal }
  ];
  cards.forEach((c, i) => {
    const k = pop(t, c.t0, 0.55);
    s += g(card(-230, -150, 460, 300, '#fff') + `<rect x="-230" y="-150" width="460" height="14" rx="7" fill="${c.col}"/>` +
      c.icon(0, -50) + txt(0, 70, c.title, 40, C.navy, 900) + txt(0, 115, c.sub, 30, '#6B7390', 600) +
      `<circle cx="-190" cy="-110" r="26" fill="${c.col}"/>` + txt(-190, -100, String(i + 1), 30, '#fff', 900), { x: c.x, y: 480 + (1 - eo(p(t, c.t0, 0.55))) * 60, s: k });
  });
  // gauge
  const gp = fi(t, 64.8, 0.5);
  if (gp > 0) {
    const lv = eo(p(t, 65.3, 1.6));
    s += g(card(-520, -60, 1040, 120, C.navy, 60) + txt(-470, 14, 'Seberapa gerah?', 38, '#fff', 900, 'start') +
      `<rect x="-90" y="-22" width="560" height="44" rx="22" fill="#3A4774"/>
       <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset=".5" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.red}"/></linearGradient></defs>
       <rect x="-90" y="-22" width="${560 * Math.max(lv, 0.02)}" height="44" rx="22" fill="url(#gg)"/>`, { x: 960, y: 760, o: gp, s: lerp(0.9, 1, gp) });
    cards.forEach(c => { s += `<g opacity="${gp * 0.8}">${arrow(c.x, 640, lerp(c.x, 960, 0.35), 690, C.navy, 8, 20)}</g>`; });
  }
  return s;
});

// 8. Penutup: jam terakhir + pertanyaan
scene(67.7, 73.6, t => {
  let s = bg('#1D2B53', '#2C3E75') + dots(t, '#4D96FF', 0.12);
  const ck = pop(t, 67.9, 0.6);
  const m = lerp(0, 90, eio(p(t, 68.3, 1.4)));
  const hh = 12 + Math.floor((m + 30) / 60), mm = (m + 30) % 60;
  s += g(clockFace(0, 0, 130, hh, mm) + `<g transform="translate(0 210)">${pill(0, 0, 'Jam terakhir', { size: 38, bg: C.orange })}</g>`, { x: 400, y: 440, s: ck });
  // top-down map
  const mp = pop(t, 70.2, 0.6);
  let map = card(-420, -300, 840, 600, '#FFF6E9', 30) +
    `<rect x="-420" y="-300" width="840" height="60" rx="30" fill="${C.board}"/>` + txt(0, -258, 'Papan tulis', 26, '#F4F1DE', 800) +
    `<rect x="-436" y="-160" width="16" height="200" fill="#9ED3FF"/><rect x="420" y="130" width="16" height="120" fill="${C.wood}"/>`;
  const blobs = [[-300, -60, 1], [-120, 160, 0.8], [250, 180, 0.7], [200, -100, 0.55]];
  blobs.forEach(([x, y, k], i) => {
    const pu = 0.85 + 0.15 * Math.sin(t * 4 + i);
    map += `<circle cx="${x}" cy="${y}" r="${200 * k * pu * fi(t, 70.6 + i * 0.35, 0.6)}" fill="url(#heatB)" opacity="1"/>`;
  });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) map += `<rect x="${-330 + c * 175}" y="${-180 + r * 140}" width="120" height="60" rx="10" fill="${C.wood}" opacity=".85"/>`;
  s += `<defs><radialGradient id="heatB"><stop offset="0" stop-color="${C.red}" stop-opacity=".85"/><stop offset=".55" stop-color="${C.orange}" stop-opacity=".45"/><stop offset="1" stop-color="${C.sun}" stop-opacity="0"/></radialGradient></defs>`;
  s += g(map, { x: 1270, y: 480, s: mp * 0.9 });
  const qs = pop(t, 70.3, 0.6);
  s += g(txt(0, 0, 'Bagian mana yang paling panas?', 64, '#fff', 900), { x: 960, y: 115, s: qs });
  s += g(txt(0, 40, '?', 150, C.sun, 900), { x: 1700, y: 220 + Math.sin(t * 5) * 10, s: pop(t, 72.6, 0.5), r: 14 });
  return s;
});

// ---------- SUBTITLES ----------
const CHUNKS = (() => {
  const out = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const end = /[.,?!]$/.test(w.w), next = WORDS[i + 1];
    const gap = next ? next.s - w.e : 9;
    if (cur.length >= 7 || /[.?!]$/.test(w.w) || (end && cur.length >= 3) || gap > 0.45 || !next) { out.push(cur); cur = []; }
  });
  return out.map((ws, i, a) => ({ ws, s: ws[0].s, e: Math.min(a[i + 1] ? a[i + 1][0].s : 1e9, ws[ws.length - 1].e + 0.9) }));
})();
function subtitles(t) {
  const ch = CHUNKS.find(c => t >= c.s - 0.08 && t < c.e - 0.02);
  if (!ch) return '';
  const size = 44, sp = measure(' ', size, 800);
  const widths = ch.ws.map(w => measure(w.w, size, 800));
  const total = widths.reduce((a, b) => a + b, 0) + sp * (ch.ws.length - 1);
  let x = 960 - total / 2, sp2 = '';
  ch.ws.forEach((w, i) => {
    const active = t >= w.s - 0.03 && t < (ch.ws[i + 1] ? ch.ws[i + 1].s : w.e + 0.3);
    const said = t >= w.s - 0.03;
    const col = active ? C.sun : said ? '#FFFFFF' : 'rgba(255,255,255,.55)';
    const lift = active ? -4 : 0;
    sp2 += `<text x="${x + widths[i] / 2}" y="${1002 + lift}" font-size="${size}" font-weight="800" fill="${col}" text-anchor="middle" font-family="Inter">${w.w}</text>`;
    x += widths[i] + sp;
  });
  const k = eo(p(t, ch.s - 0.08, 0.18));
  const bw = total + 70;
  return `<g opacity="${k}"><rect x="${960 - bw / 2}" y="${950}" width="${bw}" height="76" rx="38" fill="#141A33" opacity=".82"/>${sp2}</g>`;
}

const DURATION = 73.56;
function render(t) {
  let out = `<defs><radialGradient id="sunGlow"><stop offset="0" stop-color="#FFD166" stop-opacity=".9"/><stop offset="1" stop-color="#FFD166" stop-opacity="0"/></radialGradient></defs>`;
  SCENES.forEach((sc, i) => {
    const last = i === SCENES.length - 1, X = 0.45;
    if (t < sc.start || t > sc.end + (last ? 1 : X)) return;
    const inK = i === 0 ? 1 : eo(p(t, sc.start, X));
    const outK = last ? 1 : 1 - p(t, sc.end, X);
    const s = lerp(1.04, 1, inK);
    out += `<g opacity="${(inK * outK).toFixed(3)}" transform="translate(${960 * (1 - s)} ${540 * (1 - s)}) scale(${s})">${sc.fn(t)}</g>`;
  });
  out += subtitles(t);
  // progress bar
  out += `<rect x="0" y="${H - 8}" width="${W * cl(t / DURATION)}" height="8" fill="${C.orange}"/>`;
  // final fade
  const ff = p(t, DURATION - 0.5, 0.5);
  if (ff > 0) out += `<rect width="${W}" height="${H}" fill="#000" opacity="${ff}"/>`;
  document.getElementById('stage').innerHTML = out;
}
