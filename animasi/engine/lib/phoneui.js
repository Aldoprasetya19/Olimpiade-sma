// Gambar UI ponsel (chat, notifikasi, pemutar video) di canvas 2D. Ukuran logis 540x1080.
export const PW = 540, PH = 1080;
const F = 'Nunito';

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function wrap(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
export function avatar(ctx, x, y, r, a = {}) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = a.bg || '#9aa4b1'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  if (a.unknown) { ctx.fillStyle = '#e6e9ee'; ctx.beginPath(); ctx.arc(x, y - r * 0.15, r * 0.38, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * 0.8, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (a.group) { ctx.fillStyle = '#fff'; ctx.font = `800 ${r * 0.8}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.group, x, y + 2); }
  else {
    // wajah blocky mini
    ctx.fillStyle = a.skin || '#c98a52'; rr(ctx, x - r * 0.5, y - r * 0.45, r, r * 1.05, r * 0.2); ctx.fill();
    ctx.fillStyle = a.hair || '#2b2118';
    if (a.hijab) { ctx.beginPath(); ctx.arc(x, y - r * 0.05, r * 0.68, Math.PI, 0); ctx.lineTo(x + r * 0.68, y + r); ctx.lineTo(x + r * 0.5, y + r); ctx.lineTo(x + r * 0.5, y - r * 0.2); ctx.lineTo(x - r * 0.5, y - r * 0.2); ctx.lineTo(x - r * 0.5, y + r); ctx.lineTo(x - r * 0.68, y + r); ctx.fill(); }
    else { rr(ctx, x - r * 0.56, y - r * 0.62, r * 1.12, r * 0.36, r * 0.1); ctx.fill(); }
    ctx.fillStyle = '#2a1a12';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.2, y + r * 0.05, r * 0.07, r * 0.1, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#2a1a12'; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(x, y + r * 0.18, r * 0.14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

export function statusBar(ctx, dark = false, time = '19.42') {
  ctx.fillStyle = dark ? '#fff' : '#111'; ctx.font = `700 26px ${F}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(time, 34, 34); ctx.textAlign = 'right'; ctx.fillText('4G  ▮▮▮  82%', PW - 30, 34);
}

// layar kunci + notifikasi
export function drawLock(ctx, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, o.bg1 || '#2b3a67'); g.addColorStop(1, o.bg2 || '#6a4c7d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH); statusBar(ctx, true, o.time);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `300 130px ${F}`; ctx.fillText(o.time || '19.42', PW / 2, 220);
  ctx.font = `600 28px ${F}`; ctx.fillText(o.date || 'Senin, 14 Juli', PW / 2, 300);
  let y = 380;
  for (const n of o.notifs || []) {
    const a = n.alpha ?? 1; if (a <= 0) continue; ctx.globalAlpha = a;
    const yy = y + (1 - a) * -40;
    ctx.fillStyle = 'rgba(255,255,255,0.88)'; rr(ctx, 24, yy, PW - 48, 150, 28); ctx.fill();
    avatar(ctx, 80, yy + 75, 36, n.av || {});
    ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.font = `800 28px ${F}`; ctx.fillText(n.title, 136, yy + 50);
    ctx.font = `500 24px ${F}`; ctx.fillStyle = '#333';
    wrap(ctx, n.body, PW - 190).slice(0, 2).forEach((l, i) => ctx.fillText(l, 136, yy + 90 + i * 30));
    ctx.font = `600 20px ${F}`; ctx.fillStyle = '#777'; ctx.textAlign = 'right'; ctx.fillText(n.when || 'baru saja', PW - 48, yy + 40);
    ctx.globalAlpha = 1; y += 170;
  }
}

// banner notifikasi di atas layar apa pun (k = 0..1 masuk)
export function drawBanner(ctx, k, n) {
  if (k <= 0) return; const y = -170 + k * 200;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(250,250,250,0.97)'; rr(ctx, 18, y, PW - 36, 150, 30); ctx.fill(); ctx.restore();
  avatar(ctx, 78, y + 75, 38, n.av || {});
  ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `800 27px ${F}`; ctx.fillText(n.title, 134, y + 48);
  ctx.font = `500 24px ${F}`; ctx.fillStyle = '#333'; wrap(ctx, n.body, PW - 180).slice(0, 2).forEach((l, i) => ctx.fillText(l, 134, y + 88 + i * 30));
}

// layar chat. msgs: {from, text, me, color, kind:'text'|'video'|'transfer'|'sys', alpha, time}
export function drawChat(ctx, o) {
  drawChat.jam = o.time;
  const dark = !!o.dark;
  ctx.fillStyle = dark ? '#0f1416' : '#ece5dd'; ctx.fillRect(0, 0, PW, PH);
  // pola latar halus
  ctx.globalAlpha = dark ? 0.06 : 0.07; ctx.fillStyle = dark ? '#fff' : '#8a7a66';
  for (let i = 0; i < 60; i++) { const x = (i * 97) % PW, y = (i * 173) % PH; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // isi pesan (dari bawah ke atas)
  const top = 150, bottom = PH - 110;
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, PW, bottom - top); ctx.clip();
  let y = bottom - 16 + (o.scroll || 0);
  const list = [...(o.messages || [])].reverse();
  for (const m of list) {
    const a = m.alpha ?? 1; if (a <= 0) continue;
    ctx.globalAlpha = a;
    const h = drawMsg(ctx, m, y, o.group, dark, (1 - a) * 30);
    y -= h + 14; ctx.globalAlpha = 1;
    if (y < top - 400) break;
  }
  ctx.restore();
  // header
  ctx.fillStyle = dark ? '#1f2c33' : (o.headerColor || '#0f6d5f'); ctx.fillRect(0, 0, PW, 150);
  statusBar(ctx, true, o.time);
  ctx.fillStyle = '#fff'; ctx.font = `700 34px ${F}`; ctx.textAlign = 'left'; ctx.fillText('‹', 18, 108);
  avatar(ctx, 82, 106, 32, o.av || {});
  ctx.font = `800 28px ${F}`; ctx.fillText(o.title || '', 128, 94);
  if (o.titleBlur) { ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillText(o.titleBlur, 128, 94); ctx.restore(); }
  ctx.font = `500 20px ${F}`; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(o.subtitle || '', 128, 124);
  // input
  ctx.fillStyle = dark ? '#0f1416' : '#ece5dd'; ctx.fillRect(0, PH - 110, PW, 110);
  ctx.fillStyle = dark ? '#1f2c33' : '#fff';
  const txt = o.input || '';
  ctx.font = `500 24px ${F}`;
  const lines = txt ? wrap(ctx, txt, PW - 170) : [];
  const ih = Math.max(70, 26 + lines.length * 30);
  rr(ctx, 16, PH - 24 - ih, PW - 110, ih, 35); ctx.fill();
  ctx.fillStyle = txt ? (dark ? '#eee' : '#111') : '#999'; ctx.textAlign = 'left';
  if (lines.length) lines.slice(-8).forEach((l, i, arr) => ctx.fillText(l + (i === arr.length - 1 && o.caret ? '|' : ''), 40, PH - 24 - ih + 36 + i * 30));
  else ctx.fillText('Ketik pesan', 40, PH - 24 - 35);
  ctx.fillStyle = '#18a37f'; ctx.beginPath(); ctx.arc(PW - 52, PH - 60, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `800 30px ${F}`; ctx.textAlign = 'center'; ctx.fillText(txt ? '➤' : '🎤', PW - 52, PH - 58);
  if (o.unread) { ctx.fillStyle = '#25d366'; rr(ctx, PW - 120, 80, 96, 46, 23); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `800 26px ${F}`; ctx.fillText(o.unread, PW - 72, 104); }
}

function drawMsg(ctx, m, yBottom, group, dark, dy) {
  ctx.textBaseline = 'alphabetic';
  if (m.kind === 'sys') {
    ctx.font = `700 20px ${F}`; const w = ctx.measureText(m.text).width + 36;
    ctx.fillStyle = dark ? '#1f2c33' : '#d8eef9'; rr(ctx, PW / 2 - w / 2, yBottom - 40 + dy, w, 40, 14); ctx.fill();
    ctx.fillStyle = dark ? '#ccc' : '#45606e'; ctx.textAlign = 'center'; ctx.fillText(m.text, PW / 2, yBottom - 13 + dy); return 40;
  }
  const maxW = 360; ctx.font = `500 25px ${F}`;
  let lines = m.kind === 'text' || !m.kind ? wrap(ctx, m.text, maxW - 36) : [];
  let w = Math.max(160, ...lines.map(l => ctx.measureText(l).width + 40));
  let h = 30 + lines.length * 32 + 26;
  const showName = group && !m.me;
  if (showName) h += 28;
  if (m.kind === 'video') { w = 330; h = 260 + (showName ? 28 : 0); }
  if (m.kind === 'transfer') { w = 330; h = 170 + (showName ? 28 : 0); }
  const x = m.me ? PW - 20 - w : 20, y = yBottom - h + dy;
  ctx.fillStyle = m.me ? (dark ? '#005c4b' : '#d9fdd3') : (dark ? '#1f2c33' : '#fff'); rr(ctx, x, y, w, h, 18); ctx.fill();
  let cy = y + 12;
  if (showName) { ctx.fillStyle = m.color || '#d35400'; ctx.font = `800 21px ${F}`; ctx.textAlign = 'left'; ctx.fillText(m.from, x + 18, cy + 20); cy += 28; }
  ctx.fillStyle = dark ? '#e9edef' : '#111'; ctx.font = `500 25px ${F}`; ctx.textAlign = 'left';
  if (m.kind === 'video') {
    const g = ctx.createLinearGradient(0, cy, 0, cy + 200); g.addColorStop(0, '#6b7a80'); g.addColorStop(1, '#3a4448');
    ctx.fillStyle = g; rr(ctx, x + 10, cy + 4, w - 20, 200, 12); ctx.fill();
    // siluet tangga
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 30 + i * 30, cy + 180 - i * 22, 140, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(x + w / 2, cy + 104, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 12, cy + 84); ctx.lineTo(x + w / 2 + 20, cy + 104); ctx.lineTo(x + w / 2 - 12, cy + 124); ctx.fill();
    ctx.font = `700 20px ${F}`; ctx.fillText('▶ ' + (m.dur || '0:17') + '   🔇', x + 24, cy + 190);
    if (m.text) { ctx.font = `500 23px ${F}`; ctx.fillStyle = dark ? '#e9edef' : '#111'; ctx.fillText(m.text, x + 18, cy + 236); }
  } else if (m.kind === 'transfer') {
    ctx.fillStyle = '#e8f6ef'; rr(ctx, x + 10, cy + 4, w - 20, 110, 12); ctx.fill();
    ctx.fillStyle = '#0d8a5f'; ctx.font = `800 22px ${F}`; ctx.fillText('TRANSFER BERHASIL ✓', x + 28, cy + 40);
    ctx.fillStyle = '#111'; ctx.font = `800 34px ${F}`; ctx.fillText(m.amount || 'Rp300.000', x + 28, cy + 90);
  } else lines.forEach((l, i) => ctx.fillText(l, x + 18, cy + 30 + i * 32));
  ctx.font = `500 17px ${F}`; ctx.fillStyle = dark ? '#8696a0' : '#777'; ctx.textAlign = 'right'; ctx.fillText((m.time || drawChat.jam || '19.40') + (m.me ? ' ✓✓' : ''), x + w - 14, y + h - 10);
  return h;
}

// pemutar video layar penuh di ponsel (tanpa isi gambar; isi gambar dari 3D)
export function drawPlayerChrome(ctx, o) {
  const { cur = 0, dur = 17, muted = true, w = PW, h = PH, paused = false } = o;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const g = ctx.createLinearGradient(0, h - 200, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = g; ctx.fillRect(0, h - 200, w, 200);
  const bx = 36, bw = w - 72, by = h - 70;
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, bx, by, bw, 8, 4); ctx.fill();
  if (o.highlight) { ctx.fillStyle = 'rgba(255,80,80,0.9)'; rr(ctx, bx + bw * o.highlight[0] / dur, by - 3, bw * (o.highlight[1] - o.highlight[0]) / dur, 14, 4); ctx.fill(); }
  ctx.fillStyle = '#fff'; rr(ctx, bx, by, bw * Math.min(1, cur / dur), 8, 4); ctx.fill();
  ctx.beginPath(); ctx.arc(bx + bw * Math.min(1, cur / dur), by + 4, 13, 0, Math.PI * 2); ctx.fill();
  ctx.font = `700 ${Math.round(w / 20)}px ${F}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${fmt(cur)} / ${fmt(dur)}`, bx, by - 22);
  ctx.textAlign = 'right'; ctx.fillText(muted ? '🔇' : '🔊', bx + bw, by - 22);
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(w / 2 - 18, h / 2 - 30); ctx.lineTo(w / 2 + 32, h / 2); ctx.lineTo(w / 2 - 18, h / 2 + 30); ctx.fill();
  }
}
