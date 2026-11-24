#!/usr/bin/env python3
"""Naskah bertanda + voice-over  ->  episode siap render (engine/episodes/<ep>.js) + subtitle (.ass).

Pemakaian:
  python3 naskah_ke_episode.py naskah.txt vo.mp3 --ep ep4 [--transkrip ep4_transkrip.json]
  lalu: produksi/buat_video.sh ep4 vo.mp3 "Judul-File"

Format naskah (satu baris = satu kalimat VO, urutan sama dengan rekaman):
  # judul: BARIS 1 | BARIS 2            (judul hook 0,7 dtk; opsional)
  # akhir: BERSAMBUNG... | Bagian 2: X  (teks kartu akhir; opsional)
  [kelas] dudukKiri=aldo depanMeja=bagas        <- ganti lokasi + tokoh (lihat LOKASI di engine/lib/auto.js)
  [kantin grade=kenangan] kiri=aldo kanan=reno   <- grade opsional: hangat malam tegang kenangan pagi sore ancaman
  NARATOR: Kalimat narasi.
  ALDO (marah): Kalimat dialog.                  <- dialog = close-up pembicara + mulut bergerak + chip nama
  NARATOR {cu:bagas} (bagas=sedih, bagas:tunduk): Bagas menunduk.
  NARATOR {hp} [Bagas | Potong bagian papannya. | Kirim pakai akun cadangan.]: Ada instruksi.
  NARATOR {hp-notif} [Wali Kelas | Besok datang bersama orang tua.]: Pesan masuk.
  NARATOR {hp-grup} [XII IPA 2 | Sinta: ini Aldo? | Rio: parah]: Grup ramai.
  NARATOR {akhir}: Bersambung.                   <- kartu akhir (tanpa subtitle)
Kamera: cu:<tokoh>, mcu:<tokoh>, dua, lebar, hp, hp-notif, hp-grup, hp-gelap, akhir.
Opsi dalam ( ): ekspresi pembicara (mis. marah), <tokoh>=<ekspresi>, <tokoh>:<pose>, flash.
Ekspresi: netral senyum senang cemas kaget sedih marah serius curiga merem menghindar bersalah lega paksa kecewa fokus
Pose: hp hpAngkat serahkan tunjuk dagu tunduk silang tanganMeja bawa angguk tengok
"""
import argparse, json, os, re, subprocess, sys, difflib
sys.path.insert(0, os.path.dirname(__file__))
from naskah_ke_storyboard import chunks  # noqa
import buat_subtitle  # noqa

WARNA = {'ALDO': '#FFFFFF', 'NAYA': '#FFB3C7', 'GRUP KELAS': '#9BE3B0', 'WALI KELAS': '#A8D8F8', 'WALI': '#A8D8F8', 'IBU': '#FFC98A',
         'NOMOR ASING': '#FF8A8A', 'RENO': '#FFD84A', 'BAGAS': '#C7A4FF', 'DIMAS': '#8FE3D8', 'PESAN': '#FF8A8A'}
CADANGAN = ['#FFD84A', '#8FE3D8', '#C7A4FF', '#FFB3C7', '#A8D8F8', '#FFC98A']
LINE = re.compile(r'^(?P<who>[A-Za-z][A-Za-z ]*?)\s*(\{(?P<cam>[^}]*)\})?\s*(\((?P<ex>[^)]*)\))?\s*(\[(?P<hp>[^\]]*)\])?\s*:\s*(?P<txt>.+)$')
ALIAS = {'santai': 'senyum', 'pelan': 'netral', 'bingung': 'curiga', 'ragu': 'menghindar', 'menahan sedih': 'sedih', 'menyesal': 'bersalah',
         'jujur': 'serius', 'lembut': 'senyum', 'ramah': 'senang', 'hangat': 'senyum', 'kesal': 'marah', 'takut': 'cemas', 'tenang': 'netral'}
ex = lambda e: ALIAS.get(e.strip().lower(), e.strip())
norm = lambda w: re.sub(r'[^0-9a-z]', '', w.lower())

def transcribe(vo):
    import numpy as np
    from faster_whisper import WhisperModel
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', vo, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    m = WhisperModel('medium', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(a, language='id', word_timestamps=True, beam_size=5)
    return [{'start': s.start, 'end': s.end, 'text': s.text, 'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in s.words]} for s in segs]

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('naskah'); ap.add_argument('vo'); ap.add_argument('--ep', required=True); ap.add_argument('--transkrip')
    a = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prod = os.path.join(root, 'produksi')
    tpath = a.transkrip or os.path.join(prod, f'{a.ep}_transkrip.json')
    if os.path.exists(tpath): tr = json.load(open(tpath))
    else: tr = transcribe(a.vo); json.dump(tr, open(tpath, 'w'), ensure_ascii=False, indent=1)
    audio = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.vo], capture_output=True, text=True).stdout)

    meta, lines, scene = {}, [], None
    for raw in open(a.naskah, encoding='utf-8'):
        s = raw.strip()
        if not s: continue
        if s.startswith('#'):
            k, _, v = s[1:].partition(':'); meta[k.strip()] = [x.strip() for x in v.split('|')]; continue
        if s.startswith('['):
            m = re.match(r'\[(\w+)([^\]]*)\]\s*(.*)', s)
            opts = dict(x.split('=') for x in m.group(2).split() if '=' in x)
            scene = {'loc': m.group(1), 'grade': opts.get('grade'), 'cast': dict(x.split('=') for x in m.group(3).split() if '=' in x), 'expr': {}}
            continue
        m = LINE.match(s)
        if not m: sys.exit(f'Baris tidak dikenali: {s}')
        lines.append({**m.groupdict(), 'scene': scene})

    # --- penjajaran kata naskah <-> kata whisper
    W = [w for seg in tr for w in seg['words']]
    wn = [norm(w['w']) for w in W]
    nk = []
    for i, L in enumerate(lines):
        for w in L['txt'].split(): nk.append((i, norm(w)))
    sm = difflib.SequenceMatcher(None, [x[1] for x in nk], wn, autojunk=False)
    tmap = [None] * len(nk)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size): tmap[blk.a + j] = (W[blk.b + j]['s'], W[blk.b + j]['e'])
    # isi yang kosong dengan interpolasi
    known = [i for i, v in enumerate(tmap) if v]
    for i in range(len(tmap)):
        if tmap[i]: continue
        prv = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
        t0 = tmap[prv][1] if prv is not None else 0.0; t1 = tmap[nxt][0] if nxt is not None else audio
        lo = prv if prv is not None else -1; hi = nxt if nxt is not None else len(tmap)
        f = (i - lo) / (hi - lo); t = t0 + (t1 - t0) * f; tmap[i] = (t, t + 0.25)
    for i, L in enumerate(lines):
        idx = [j for j, (li, _) in enumerate(nk) if li == i]
        L['words'] = [(nk[j], tmap[j]) for j in idx]
        L['start'], L['end'] = tmap[idx[0]][0], tmap[idx[-1]][1]

    # --- shot & subtitle
    akhir = next((L['start'] for L in lines if (L['cam'] or '') == 'akhir'), None)
    duration = round(max(audio + 0.3, (akhir or audio) + 3.3), 2)
    jd = 0.7 if meta.get('judul') else 0
    shots, caps, karakter, ci = [], [], {}, 0
    talk_all = [[round(L['start'], 2), round(L['end'], 2), L['who'].strip().lower()] for L in lines if L['who'].strip().upper() != 'NARATOR']
    spoken = [L for L in lines if (L['cam'] or '') != 'akhir']
    for n, L in enumerate(spoken):
        who = L['who'].strip().upper(); sc = L['scene'] or {'loc': 'kelas', 'cast': {}, 'expr': {}}
        castnames = [v.split('#')[0] for v in sc['cast'].values()]
        expr, pose, flash, grade = sc['expr'], {}, False, sc.get('grade')
        for o in [x.strip() for x in (L['ex'] or '').split(',') if x.strip()]:
            if o == 'flash': flash = True
            elif o.startswith('grade='): grade = o[6:]
            elif '=' in o: k, v = o.split('='); expr[k.strip().lower()] = ex(v)
            elif ':' in o: k, v = o.split(':'); pose[k.strip().lower()] = v.strip()
            elif who != 'NARATOR': expr[who.lower()] = ex(o)
        cam = (L['cam'] or '').strip()
        if not cam:
            if who != 'NARATOR' and who.lower() in castnames: cam = f'cu:{who.lower()}'
            else:
                first = norm(L['txt'].split()[0])
                cam = f'mcu:{first}' if first in castnames else ('dua' if n % 2 == 0 else 'lebar')
        t0 = 0 if n == 0 else round(L['start'] - 0.05, 2)
        t1 = round(spoken[n + 1]['start'] - 0.05, 2) if n + 1 < len(spoken) else (akhir or duration)
        d = {'t0': t0, 't1': t1, 'loc': sc['loc'], 'cast': sc['cast'], 'cam': cam.split('-')[0] if cam.startswith('hp') else cam,
             'expr': dict(expr), 'pose': pose, 'talk': talk_all, 'flash': flash}
        if grade: d['grade'] = grade
        if cam.startswith('hp'):
            parts = [x.strip() for x in (L['hp'] or '').split('|')]
            d['phone'] = {'judul': parts[0] if parts else '', 'pesan': parts[1:], 'jenis': 'notif' if 'notif' in cam else 'post' if 'post' in cam else 'chat',
                          'grup': 'grup' in cam, 'gelap': 'gelap' in cam}
        shots.append(d)
        # subtitle
        words = L['txt'].split()
        times = [w[1][0] for w in L['words']]
        groups = chunks(words)
        for gi, g in enumerate(groups):
            st = max(times[g[0]], jd if not caps else 0)
            en = times[groups[gi + 1][0]] if gi + 1 < len(groups) else L['end'] + 0.15
            c = {'start': round(st, 2), 'end': round(max(en, st + 0.3), 2), 'teks': ' '.join(words[j] for j in g)}
            if who != 'NARATOR':
                c['siapa'] = who
                if who not in karakter: karakter[who] = {'warna': WARNA.get(who, CADANGAN[ci % len(CADANGAN)])}; ci += 1
            caps.append(c)
    for i in range(len(caps) - 1): caps[i]['end'] = min(caps[i]['end'], caps[i + 1]['start'])

    data = {'duration': duration, 'endcard': akhir and round(akhir - 0.05, 2), 'shots': shots}
    js = os.path.join(root, 'engine', 'episodes', f'{a.ep}.js')
    open(js, 'w').write("// Dibuat otomatis oleh tools/naskah_ke_episode.py — boleh diedit/ditambah shot khusus.\n"
                        "import { autoEpisode } from '../lib/auto.js';\n"
                        f"const DATA = {json.dumps(data, ensure_ascii=False)};\n"
                        "export const { shots, duration } = autoEpisode(DATA);\n")
    sb = {'video': {'width': 720, 'height': 1280, 'fps': 30}, 'durasi': duration,
          'gaya': {'font': 'Oswald', 'warna_aksen': '#FFD84A', 'warna_gelap': '#1E1E2A', 'posisi_subtitle': 0.70},
          'narator': 'narator', 'karakter': karakter, 'shots': [{'id': 1, 'start': 0, 'end': duration, 'subtitle': caps}]}
    if meta.get('judul'): sb['judul'] = {'baris1': meta['judul'][0], 'baris2': meta['judul'][-1], 'start': 0, 'end': jd}
    if akhir is not None:
        ak = meta.get('akhir', ['BERSAMBUNG...', ''])
        sb['bersambung'] = {'start': round(akhir, 2), 'end': duration, 'judul': ak[0], 'sub': ak[1] if len(ak) > 1 else ''}
    json.dump(sb, open(os.path.join(prod, f'{a.ep}_storyboard.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(prod, f'{a.ep}.ass'), 'w').write(buat_subtitle.build(sb))
    print(f'{len(shots)} shot, {len(caps)} subtitle, durasi {duration}s -> {js}')
    cocok = sum(1 for v in sm.get_matching_blocks() for _ in range(v.size))
    print(f'kata naskah cocok dengan rekaman: {cocok}/{len(nk)}' + ('  (periksa naskah vs rekaman!)' if cocok < 0.7 * len(nk) else ''))

if __name__ == '__main__': main()
