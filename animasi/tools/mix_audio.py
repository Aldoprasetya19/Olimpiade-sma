#!/usr/bin/env python3
"""Gabungkan VO + musik latar (dikecilkan & ducking saat VO) + SFX dari produksi/<ep>_sfx.json
+ potongan lagu (diegetik: latihan/pentas) dari produksi/<ep>_lagu.json -> WAV.
<ep>_lagu.json: {"lagu": "teaser2/lagu.mp3", "potong": [{"at": dtk_vo, "dari": dtk_lagu, "sampai": dtk_lagu, "gain": 0.6, "hp": false, "fi": 0.3, "fo": 0.2}]}
  hp=true -> suara lewat speaker HP (bandpass). Musik latar dimatikan selama potongan lagu.
Pemakaian: python3 mix_audio.py <ep> <vo.mp3> <durasi_detik> <out.wav> [musik.mp3]"""
import sys, os, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__)); import sfx
ep, vo, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]; musik = sys.argv[5] if len(sys.argv) > 5 else None
SR = sfx.SR; prod = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'produksi')
def baca(f, loop=False):
    args = ['ffmpeg', '-v', 'error'] + (['-stream_loop', '-1'] if loop else []) + ['-i', f, '-t', str(dur), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(args, capture_output=True).stdout, np.float32).copy()
n = int(SR * dur); res = np.zeros(n, np.float32)
v = baca(vo); v = v / (np.max(np.abs(v)) or 1) * 0.85; res[:len(v)] += v[:n]
lc = os.path.join(prod, f'{ep}_lagu.json'); LG = json.load(open(lc)) if os.path.exists(lc) else None
diam = np.ones(n, np.float32)  # pengali musik latar (0 saat lagu diegetik)
if LG:
    import sfx as _s
    blk0 = SR // 20; e0 = np.array([np.sqrt(np.mean(v[i:i + blk0] ** 2)) if i < len(v) else 0 for i in range(0, n, blk0)]); e0 = np.convolve(e0, np.ones(8) / 8, 'same')
    duckv = np.repeat(np.where(e0 > 0.02, 0.5, 1.0), blk0)[:n].astype(np.float32); duckv = np.convolve(duckv, np.ones(SR // 10) / (SR // 10), 'same')
    for c in LG['potong']:
        f = os.path.join(prod, LG['lagu']); seg = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(c['dari']), '-t', str(c['sampai'] - c['dari']), '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).copy()
        if c.get('hp'): seg = _s.bp(seg, 500, 3200) * 1.6
        L = len(seg); fi = int(SR * c.get('fi', 0.3)); fo = int(SR * c.get('fo', 0.2)); env_ = np.ones(L, np.float32)
        if fi: env_[:fi] = np.linspace(0, 1, fi)
        if fo: env_[-fo:] *= np.linspace(1, 0, fo)
        i = int(c['at'] * SR); j = min(n, i + L); seg = seg / (np.max(np.abs(seg)) or 1)
        res[i:j] += (seg[:j - i] * env_[:j - i] * c.get('gain', 0.6) * duckv[i:j]).astype(np.float32)
        a0 = max(0, i - SR // 2); b0 = min(n, j + SR // 2); diam[a0:b0] = 0
    diam = np.convolve(diam, np.ones(SR // 2) / (SR // 2), 'same').astype(np.float32)
if musik:
    m = baca(musik, loop=True)[:n]; m = m / (np.max(np.abs(m)) or 1)
    # amplop VO untuk ducking
    blk = SR // 20; e = np.array([np.sqrt(np.mean(v[i:i + blk] ** 2)) if i < len(v) else 0 for i in range(0, n, blk)])
    e = np.convolve(e, np.ones(8) / 8, 'same'); g = np.where(e > 0.02, 0.10, 0.22); g = np.repeat(g, blk)[:n]
    fade = np.ones(len(m)); fl = min(len(m), int(SR * 1.5)); fade[:fl] = np.linspace(0, 1, fl); fade[-fl:] = np.linspace(1, 0, fl)
    res[:len(m)] += (m * g[:len(m)] * fade * diam[:len(m)]).astype(np.float32)
cf = os.path.join(prod, f'{ep}_sfx.json')
for c in (json.load(open(cf)) if os.path.exists(cf) else []):
    if c['nama'] not in sfx.SFX: print('sfx tidak dikenal:', c['nama']); continue
    x = sfx.buat(c['nama']) * 0.5; i = int(c['t'] * SR); j = min(n, i + len(x)); res[i:j] += x[:j - i]
res = res / max(1.0, float(np.max(np.abs(res))) / 0.95)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', out], input=res.tobytes())
print('audio ->', out)
