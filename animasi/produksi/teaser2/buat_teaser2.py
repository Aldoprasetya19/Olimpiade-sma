#!/usr/bin/env python3
"""Teaser "VOKALIS DADAKAN" (episode tz2, lagu Ratusan Bintang) — subtitle lirik + campur SFX + rakit video landscape.
Pemakaian (dari folder animasi/produksi): python3 teaser2/buat_teaser2.py [--render]
  --render : render ulang 3 bagian paralel (LAND=1) sebelum merakit."""
import os, sys, subprocess, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import sfx
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
LAGU = 'teaser2/lagu_ratusan_bintang.mp3'; DUR = 174.6
C1 = ["Lalu cahaya itu, menyala di depanku", "Ratusan bintang, di tengah malam syahdu", "Bukan lagi takut, ku temukan suaraku", "Bernyanyi bersama, kalian di sampingku"]
LIRIK = [(7.9, 12.9, "Hanya di kamar, pintu terkunci rapat"), (12.9, 17.2, "Menyimpan nada yang tak pernah sempat"),
 (17.3, 21.6, "Kini di panggung, kaki terasa berat"), (21.6, 26.0, "Mikrofon ini, terasa sangat hebat"),
 (26.1, 30.1, "Febri menyentuh gitar, Stefan menekan bass"), (30.1, 35.1, "Jantungku berdebar, napas terasa lepas"),
 (35.6, 40.0, C1[0]), (40.0, 44.3, C1[1]), (44.4, 48.6, C1[2]), (48.6, 53.6, C1[3]),
 (69.0, 74.0, C1[3]), (74.0, 78.4, "Suara pertama, pecah di tengah napas"), (78.5, 85.8, "Tawa di belakang, membuatku ingin lepas"),
 (87.3, 92.3, C1[0]), (92.3, 96.7, C1[1]), (96.8, 101.0, C1[2]), (101.0, 108.2, C1[3]),
 (108.3, 113.4, "Tak ada lagi ragu, di balik rasa takut"), (113.4, 119.7, "Tetaplah bernyanyi, meski nyawa terasa surut"),
 (120.3, 125.1, C1[0]), (125.1, 129.5, C1[1]), (129.6, 133.8, C1[2]), (133.8, 138.4, C1[3]),
 (138.5, 146.6, "Tepuk tangan ini untuk kita semua"), (146.6, 155.0, "Lagu sudah usai, tapi mimpi baru saja"), (155.1, 163.8, "Baru saja terbuka")]
SFX = [('ceklek', 0.7, 1.0), ('mikrofon', 63.7, 0.5), ('sorak', 48.7, 0.35), ('dengung', 69.15, 0.55), ('tawa', 78.7, 0.6), ('sorak', 138.6, 0.4), ('tepuk', 138.8, 0.45), ('sorak', 142.4, 0.3)]

def ts(t): return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lirik,Oswald,32,&H00FFFFFF,&H0030C2F2,&H00000000,&H64000000,-1,0,0,0,100,100,1,0,1,2,0,2,40,40,26,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + ''.join(f"Dialogue: 0,{ts(a)},{ts(b)},Lirik,,0,0,0,,{{\\fad(250,250)}}{l}\n" for a, b, l in LIRIK)
open('tz2.ass', 'w').write(ass)

SR = sfx.SR
song = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', LAGU, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
n = int(DUR * SR); out = np.zeros(n, np.float32); out[:min(n, len(song))] = song[:n]
pk = np.max(np.abs(song)) or 1
for nm, t, g in SFX:
    x = sfx.buat(nm); x = x / (np.max(np.abs(x)) or 1) * pk * g; i = int(t * SR); out[i:i + len(x)] += x[:max(0, n - i)]
out = out / max(1.0, np.max(np.abs(out)) / 0.98)
os.makedirs('tmp', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', 'tmp/tz2_audio.wav'], input=(out * 32767).astype(np.int16).tobytes(), check=True)

if '--render' in sys.argv:
    env = {**os.environ, 'LAND': '1'}
    ps = [subprocess.Popen(['node', '../engine/render.cjs', 'tz2', f'tmp/tz2_{p}.mp4', '30', str(a), str(b)], env=env) for p, a, b in (('a', 0, 58), ('b', 58, 116), ('c', 116, DUR))]
    for p in ps: p.wait()
open('tmp/tz2_list.txt', 'w').write(''.join(f"file 'tz2_{p}.mp4'\n" for p in 'abc'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'tmp/tz2_list.txt', '-c', 'copy', 'tmp/tz2_video.mp4'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'tmp/tz2_video.mp4', '-i', 'tmp/tz2_audio.wav', '-filter_complex',
    '[1:a]aresample=48000,afade=t=out:st=171.8:d=2.8,loudnorm=I=-14:TP=-1.5:LRA=11[a];[0:v]ass=tz2.ass:fontsdir=../tools/fonts[v]',
    '-map', '[v]', '-map', '[a]', '-t', str(DUR), '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '5M', '-bufsize', '10M', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '../output/Teaser Vokalis Dadakan - Ratusan Bintang.mp4'], check=True)
print('Selesai: output/Teaser Vokalis Dadakan - Ratusan Bintang.mp4')
