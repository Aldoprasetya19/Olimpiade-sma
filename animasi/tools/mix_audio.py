#!/usr/bin/env python3
"""Gabungkan VO + musik latar (dikecilkan & ducking saat VO) + SFX dari produksi/<ep>_sfx.json -> WAV.
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
if musik:
    m = baca(musik, loop=True)[:n]; m = m / (np.max(np.abs(m)) or 1)
    # amplop VO untuk ducking
    blk = SR // 20; e = np.array([np.sqrt(np.mean(v[i:i + blk] ** 2)) if i < len(v) else 0 for i in range(0, n, blk)])
    e = np.convolve(e, np.ones(8) / 8, 'same'); g = np.where(e > 0.02, 0.10, 0.22); g = np.repeat(g, blk)[:n]
    fade = np.ones(len(m)); fl = min(len(m), int(SR * 1.5)); fade[:fl] = np.linspace(0, 1, fl); fade[-fl:] = np.linspace(1, 0, fl)
    res[:len(m)] += (m * g[:len(m)] * fade).astype(np.float32)
cf = os.path.join(prod, f'{ep}_sfx.json')
for c in (json.load(open(cf)) if os.path.exists(cf) else []):
    if c['nama'] not in sfx.SFX: print('sfx tidak dikenal:', c['nama']); continue
    x = sfx.buat(c['nama']) * 0.5; i = int(c['t'] * SR); j = min(n, i + len(x)); res[i:j] += x[:j - i]
res = res / max(1.0, float(np.max(np.abs(res))) / 0.95)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', out], input=res.tobytes())
print('audio ->', out)
