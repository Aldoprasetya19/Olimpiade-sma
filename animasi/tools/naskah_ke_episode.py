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
import subprocess as _sp
try:
    TOKOH_NAMA = set(re.findall(r'^  (\w+): \{ jk', open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'engine', 'lib', 'cast.js')).read(), re.M))
except Exception: TOKOH_NAMA = set()

WARNA = {'ALDO': '#FFFFFF', 'NAYA': '#FFB3C7', 'GRUP KELAS': '#9BE3B0', 'WALI KELAS': '#A8D8F8', 'WALI': '#A8D8F8', 'IBU': '#FFC98A',
         'NOMOR ASING': '#FF8A8A', 'RENO': '#FFD84A', 'BAGAS': '#C7A4FF', 'DIMAS': '#8FE3D8', 'PESAN': '#FF8A8A'}
CADANGAN = ['#FFD84A', '#8FE3D8', '#C7A4FF', '#FFB3C7', '#A8D8F8', '#FFC98A']
LINE = re.compile(r'^(?P<who>[A-Za-z][A-Za-z ]*?)\s*(\{(?P<cam>[^}]*)\})?\s*(\((?P<ex>[^)]*)\))?\s*(\[(?P<hp>[^\]]*)\])?\s*:\s*(?P<txt>.+)$')
ALIAS = {'santai': 'senyum', 'pelan': 'netral', 'bingung': 'curiga', 'ragu': 'menghindar', 'menahan sedih': 'sedih', 'menyesal': 'bersalah',
         'jujur': 'serius', 'lembut': 'senyum', 'ramah': 'senang', 'hangat': 'senyum', 'kesal': 'marah', 'takut': 'cemas', 'tenang': 'netral',
         'yakin': 'serius', 'penasaran': 'curiga', 'menyelidik': 'curiga', 'gugup': 'cemas', 'tegas': 'serius', 'kritis': 'serius', 'terbata': 'cemas',
         'mengangguk': 'senyum', 'panik': 'kaget', 'heran': 'curiga', 'sinis': 'curiga', 'datar': 'netral', 'tegang': 'cemas', 'menunduk': 'bersalah',
         'tersenyum': 'senyum', 'tertawa': 'senang'}
key = lambda w: re.sub(r'^(pak|bu|kak) ', '', w.strip().lower()).replace(' ', '')
ex = lambda e: ALIAS.get(e.strip().lower(), e.strip())
norm = lambda w: re.sub(r'[^0-9a-z]', '', w.lower())

def transcribe(vo):
    import numpy as np
    from faster_whisper import WhisperModel
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', vo, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    m = WhisperModel('medium', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(a, language='id', word_timestamps=True, beam_size=5)
    return [{'start': s.start, 'end': s.end, 'text': s.text, 'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in s.words]} for s in segs]

# ---- aksi dari kata kerja narasi
VERB = [(r'^(berjalan|jalan|melangkah|mendekat|menghampiri|menghampirinya|datang|tiba|maju|masuk)$', 'jalan', 2.0),
        (r'^(mengendap|mengendapendap)$', 'endap', 2.5), (r'^(pergi|pulang|menjauh|meninggalkan|keluar)$', 'pergi', 2.2),
        (r'^(membaca|membacanya)$', 'baca', 2.0), (r'^(menyerahkan|memberikan|menyodorkan|memberi)$', 'beri', 1.6),
        (r'^(menoleh)$', 'menoleh', 0.5), (r'^(menunduk)$', 'tunduk', 1.0), (r'^(mengangguk|menganggukangguk)$', 'angguk', 1.6), (r'^(menyilangkan)$', 'silang', 1.0), (r'^(menahan)$', 'tahan', 1.4),
        (r'^(menaruh|menaruhnya|meletakkan)$', 'taruh', 1.2), (r'^(melirik)$', 'menoleh', 0.5),
        (r'^(menunjuk|menemukan)$', 'tunjuk', 1.4), (r'^(mengintip)$', 'intip', 1.6), (r'^(meraba)$', 'raba', 2.0)]
PROPW = {'map': 'kertas', 'foto': 'kertas', 'kertas': 'kertas', 'surat': 'kertas', 'catatan': 'kertas', 'lembar': 'kertas', 'piala': 'piala', 'cat': 'cat', 'kaleng': 'cat', 'ponsel': 'hp', 'hp': 'hp', 'mikrofon': 'mic', 'mic': 'mic'}

def detect_actions(L, castnames, hold, last_subj, scene_loc='', scene_berdiri=False):
    toks = [w[0][1] for w in L['words']]; times = [w[1][0] for w in L['words']]
    acts, subj = [], last_subj
    NEG = ('tidak', 'nggak', 'gak', 'belum', 'jangan', 'bukan', 'enggak')
    for i, w in enumerate(toks):
        if i > 0 and toks[i - 1] in NEG and not w in castnames: continue
        if i > 0 and toks[i - 1] in ('saat', 'terus', 'musik', 'lagu', 'intro') and not w in castnames: continue
        if w == 'masuk' and i + 1 < len(toks) and toks[i + 1] == 'dengan': continue
        if w == 'keluar' and not (i + 1 < len(toks) and toks[i + 1] in ('dari', 'studio', 'kelas', 'rumah', 'ruangan')): continue  # 'baris pertama keluar terlalu pelan' bukan pergi  # 'masuk dengan ketukan drum' = mulai bermain, bukan berjalan  # 'musik terus berjalan', 'saat masuk reff'
        if i > 1 and toks[i - 2] in NEG and toks[i - 1] in ('bisa', 'langsung', 'mau', 'sempat') and not w in castnames: continue
        if w in castnames:
            if i > 0 and subj and toks[i - 1] in castnames + ['dan', 's'] and w not in subj: subj = subj + [w]
            elif not (subj and w in subj and i > 0 and toks[i - 1] in castnames + ['dan', 's']): subj = [w]
        if w == 'aldo' and i + 1 < len(toks) and toks[i + 1] == 's' and 'aldos' in castnames: subj = ['aldos']
        if w == 'membuka' and i + 1 < len(toks) and toks[i + 1].startswith('tas'):
            for s_ in subj or []: acts.append({'who': s_, 'a': 'bukaTas', 't': round(times[i], 2), 'dur': 1.6, 'prop': 'kertas'}); hold[s_] = 'kertas'
            continue
        if w in ('melihat', 'menatap', 'membuka') and any(x in PROPW and PROPW[x] == 'kertas' for x in toks[i + 1:i + 4]):
            for s_ in subj or []: acts.append({'who': s_, 'a': 'baca', 't': round(times[i], 2), 'dur': 2.0, 'prop': 'kertas'}); hold[s_] = 'kertas'
            continue
        if w == 'saling' and i + 1 < len(toks) and toks[i + 1] in ('pandang', 'menatap', 'tatap', 'berpandangan', 'pandangan'):
            for s_ in subj or []: acts.append({'who': s_, 'a': 'tatap', 't': round(times[i], 2), 'dur': 2.5, 'to': '*'})
            continue
        if w in ('menatap', 'memandang', 'melihat', 'menoleh') and subj:
            tgt = next((x for x in toks[i + 1:i + 4] if x in castnames and x not in subj), None)
            if tgt or any(x.startswith(('sahabat', 'teman', 'temannya')) for x in toks[i + 1:i + 3]):
                for s_ in subj: acts.append({'who': s_, 'a': 'tatap', 't': round(times[i], 2), 'dur': 2.5, 'to': tgt or '*'})
                continue
        if re.match(r'^(berjalan|jalan|melangkah|maju)$', w) and subj and 'depan' in toks[i + 1:i + 4] and scene_loc == 'kelas' and not scene_berdiri:
            for s_ in subj: acts.append({'who': s_, 'a': 'kedepan', 't': round(max(L['start'], times[i] - 0.3), 2), 'dur': 4.0})
            continue
        if re.match(r'^(kaget|terkejut|tersentak|terperanjat|kagetnya|mengagetkan|terkaget)$', w):
            for s_ in (subj or castnames): acts.append({'who': s_, 'a': 'kaget', 't': round(times[i], 2), 'dur': 2.5})
        if w in ('ketiduran', 'terlelap') or (w == 'menyentuh' and 'meja' in toks[i + 1:i + 3]):
            for s_ in subj or []: acts.append({'who': s_, 'a': 'ketiduran', 't': round(times[i], 2), 'dur': 3.0})
            continue
        if w == 'muncul' and subj and any(x in toks[i + 1:i + 4] for x in ('pintu', 'depan')):
            for s_ in subj: acts.append({'who': s_, 'a': 'jalan', 't': round(max(L['start'], times[i] - 0.8), 2), 'dur': 2.0, 'dari': 'pintu'})
            continue
        for rx, a, dur in VERB:
            if not re.match(rx, w) or not subj: continue
            if w == 'masuk' and i > 0 and toks[i - 1] in ('pesan', 'notifikasi', 'chat', 'telepon'): continue
            prop = next((PROPW[x] for x in toks[i + 1:i + 5] if x in PROPW), None)
            for s_ in subj:
                e = {'who': s_, 'a': a, 't': round(max(L['start'], times[i] - (0.8 if a in ('jalan', 'endap') else 0)), 2), 'dur': dur}
                if a in ('jalan', 'endap') and w in ('masuk', 'datang', 'tiba'): e['dari'] = 'pintu'
                if a == 'pergi' and (w == 'keluar' or scene_loc in ('studio', 'kelas', 'ruangGuru', 'lobi', 'gudang', 'teras')): e['lewat'] = 'pintu'
                if a == 'beri':
                    to = next((x for x in toks[i + 1:] if x in castnames and x != s_), None) or next((x for x in castnames if x != s_), None)
                    if not to: continue
                    e['to'] = to; e['prop'] = prop or hold.get(s_) or 'kertas'; hold.pop(s_, None); hold[to] = e['prop']
                if a == 'baca': e['prop'] = 'kertas'; hold[s_] = 'kertas'
                acts.append(e)
    return acts, subj

MIMIK = {'menguap': 'ngantuk', 'mengantuk': 'ngantuk', 'ngantuk': 'ngantuk', 'lelah': 'ngantuk', 'capek': 'ngantuk', 'letih': 'ngantuk', 'lesu': 'ngantuk',
         'sungkan': 'paksa', 'canggung': 'paksa', 'malu': 'malu', 'gugup': 'cemas', 'cemas': 'cemas', 'khawatir': 'cemas', 'gelisah': 'cemas', 'takut': 'cemas',
         'pucat': 'cemas', 'tegang': 'cemas', 'bingung': 'bingung', 'heran': 'bingung', 'sedih': 'sedih', 'murung': 'sedih', 'kusut': 'sedih', 'menangis': 'nangis',
         'kecewa': 'kecewa', 'marah': 'marah', 'kesal': 'marah', 'geram': 'marah', 'senang': 'senang', 'gembira': 'senang', 'bahagia': 'senang', 'bersorak': 'senang',
         'tertawa': 'senang', 'tersenyum': 'senyum', 'lega': 'lega', 'menyesal': 'bersalah', 'bersalah': 'bersalah', 'terdiam': 'serius', 'cemberut': 'marah'}
FRASA = [('tidak enak', 'bersalah'), ('nggak enak', 'bersalah'), ('gak enak', 'bersalah'), ('menelan ludah', 'cemas'), ('mata merah', 'ngantuk')]
GAME = ('match', 'game', 'mabar', 'rank', 'carry', 'ngegame')

def mimik(L, castnames, last_subj):
    toks = [w[0][1] for w in L['words']]; out = {}; subj = list(last_subj or [])
    txt = ' '.join(toks)
    for i, w in enumerate(toks):
        if w in castnames: subj = [w]
        if w == 's' and i > 0 and toks[i - 1] == 'aldo' and 'aldos' in castnames: subj = ['aldos']
        if w in ('mereka', 'semua', 'seisi', 'teman', 'temanteman'): subj = list(castnames)
        if w in MIMIK:
            for s_ in (subj or castnames[:1]): out[s_] = MIMIK[w]
    for f, e in FRASA:
        if f in txt:
            for s_ in (subj or castnames[:1]): out[s_] = e
    return out

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
            scene = {'loc': m.group(1), 'berdiri': 'berdiri' in m.group(2).split(), 'grade': opts.get('grade'), 'cast': dict(x.split('=') for x in m.group(3).split() if '=' in x), 'expr': {}, 'hold': {}}
            continue
        m = LINE.match(s)
        if not m: sys.exit(f'Baris tidak dikenali: {s}')
        lines.append({**m.groupdict(), 'scene': scene})

    BELAJAR = re.compile(r'\b(laptop|laptopnya|menulis|menulisnya|mengetik|belajar|mengerjakan|esai|tugas|pr)\b', re.I)
    for L in lines:
        sc = L['scene']
        if sc and sc['loc'] == 'rumah' and not sc.get('_cek'):
            sc['_cek'] = True
            if any(BELAJAR.search(x['txt']) for x in lines if x['scene'] is sc):
                sc['loc'] = 'kamar'; sc['cast'] = {('mejaBelajar' if i == 0 else f'p{i}'): v for i, v in enumerate(sc['cast'].values())}
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
    talk_all = [[round(L['start'], 2), round(L['end'], 2), key(L['who'])] for L in lines if L['who'].strip().upper() != 'NARATOR']
    spoken = [L for L in lines if (L['cam'] or '') != 'akhir']
    last_subj, last_scene, prev_acts, state, sfx_cues = None, None, [], {}, []
    for n, L in enumerate(spoken):
        who = L['who'].strip().upper(); sc = L['scene'] or {'loc': 'kelas', 'cast': {}, 'expr': {}}
        castnames = [v.split('#')[0] for v in sc['cast'].values()]
        expr, pose, flash, grade = sc['expr'], {}, False, sc.get('grade')
        for o in [x.strip() for x in (L['ex'] or '').split(',') if x.strip()]:
            if o == 'flash': flash = True
            elif o in ('oleng', 'tanpa', 'ceria', 'diam') or o.startswith(('sfx=', 'ledakan')): pass
            elif o.startswith('grade='): grade = o[6:]
            elif '=' in o: k, v = o.split('='); expr[k.strip().lower()] = ex(v)
            elif ':' in o: k, v = o.split(':'); pose[k.strip().lower()] = v.strip()
            elif who != 'NARATOR': expr[key(who)] = ex(o)
        cam = (L['cam'] or '').strip()
        if not cam:
            if who != 'NARATOR' and key(who) in castnames: cam = f'cu:{key(who)}'
            else:
                first = norm(L['txt'].split()[0])
                cam = f'mcu:{first}' if first in castnames else ('dua' if n % 2 == 0 else 'lebar')
        t0 = 0 if n == 0 else round(L['start'] - 0.05, 2)
        t1 = round(spoken[n + 1]['start'] - 0.05, 2) if n + 1 < len(spoken) else (akhir or duration)
        d = {'tl': [round(L['start'], 2), round(L['end'], 2)], 't0': t0, 't1': t1, 'loc': sc['loc'], 'cast': sc['cast'], 'cam': cam.split('-')[0] if cam.startswith('hp') else cam,
             'expr': dict(expr), 'pose': pose, 'talk': talk_all, 'flash': flash}
        if grade: d['grade'] = grade
        if sc.get('berdiri'): d['berdiri'] = True
        toks0 = [w[0][1] for w in L['words']]
        low = re.sub(r'["“][^"”]*["”]', ' ', L['txt'].lower()) if not L['txt'].lower().startswith('bagian') else ''
        tl = re.findall(r'[a-z0-9]+', low)
        mj = re.search(r'(?:pukul|jam) (\d{1,2})(?:[.:](\d{2})| lewat (\d{1,2}))?', low)
        if mj and who == 'NARATOR' and 'dilihat' not in low[:mj.start()][-25:]:
            hh = int(mj.group(1)); hh = hh + 12 if (('malam' in low or 'sore' in low) and hh < 12 and hh >= 3) else hh
            state['jam'] = f"{hh:02d}.{int(mj.group(2) or mj.group(3) or 0):02d}"; state['menit'] = 0
        else:
            for kata, jj in (('pagi', '06.45'), ('istirahat', '10.00'), ('siang', '12.30'), ('sepulang', '14.30'), ('sore', '16.00'), ('malam', '20.00')):
                if kata in tl and tl[tl.index(kata) - 1:tl.index(kata)] not in (['besok'], ['tadi']) and not state.get('_set_' + kata): state['jam'] = jj; state['menit'] = 0; state['_set_' + kata] = True; break
        for hr in ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'):
            if hr in toks0 and who == 'NARATOR' and toks0[toks0.index(hr) - 1:toks0.index(hr)] != ['besok']: state['hari'] = hr.capitalize()
        if state.get('jam'):
            h_, m_ = map(int, state['jam'].split('.')); m_ += state.get('menit', 0); d['jam'] = f"{(h_ + m_ // 60) % 24:02d}.{m_ % 60:02d}"
        if state.get('hari'): d['hari'] = state['hari']
        if cam.startswith('hp'): state['menit'] = state.get('menit', 0) + 1
        if sc['loc'] == 'kamar':
            if 'ai' in toks0 and 'tidak' not in toks0: state['layar'] = 'ai'
            if any(x in toks0 for x in ('menulis', 'mengetik', 'menyalinnya')): state['layar'] = 'nulis' if ('ai' not in toks0 or 'tidak' in toks0) else 'ai'
            if 'kosong' in toks0: state['layar'] = 'kosong'
            d['layar'] = state.get('layar', 'kosong')
            name0 = list(castnames)[0] if castnames else None
            if not (L['cam'] or '').strip() or (L['cam'] or '').startswith(('mcu', 'lebar', 'dua')):
                if 'laptop' in toks0 or 'laptopnya' in toks0 or 'layar' in toks0: d['cam'] = 'laptop'
            if name0 and name0 not in pose: pose[name0] = 'mengetik'
        toks0 = [w[0][1] for w in L['words']]
        if cam == 'foto' or (any(x.startswith('foto') for x in toks0) and any(v in toks0 for v in ('memperlihatkan', 'menunjukkan', 'mengedarkan', 'membagikan', 'memamerkan'))):
            d['foto'] = [x.strip() for x in (L['hp'] or '').split('|') if x.strip()] if cam == 'foto' else []
            if cam == 'foto': d['cam'] = 'lebar'
        if cam == 'kertas': d['kertas'] = (L['hp'] or '').strip(); d['cam'] = 'lebar'
        if cam.startswith('hp'):
            parts = [x.strip() for x in (L['hp'] or '').split('|')]
            d['phone'] = {'judul': parts[0] if parts else '', 'pesan': parts[1:], 'jenis': 'notif' if 'notif' in cam else 'lokasi' if 'lokasi' in cam else 'status' if 'status' in cam else 'post' if 'post' in cam else 'retak' if 'retak' in cam else 'chat',
                          'grup': 'grup' in cam, 'gelap': 'gelap' in cam}
        hold0 = dict(sc.setdefault('hold', {}))
        for nm, ps in list(pose.items()):
            if ps in ('piala', 'cat', 'kertas'): hold0[nm] = ps; sc['hold'][nm] = ps; del pose[nm]
        if who == 'NARATOR':
            acts, last_subj = detect_actions(L, castnames, sc['hold'], last_subj if last_scene is sc else None, sc['loc'], sc.get('berdiri'))
        else: acts = []
        last_scene = sc
        if any(e['a'] == 'kedepan' for e in acts) and (not (L['cam'] or '').strip() or (L['cam'] or '').strip() in ('lebar', 'dua')): d['cam'] = 'kedepan'
        for e in acts:
            if e['a'] == 'kaget': d['expr'][e['who']] = 'kaget'
        if 'bangun' in [w[0][1] for w in L['words']]:
            for e in prev_acts:
                if e['a'] == 'ketiduran': e['sampai'] = round(L['start'], 2)
        jl = [e for e in acts if e['a'] in ('jalan', 'endap')]
        if jl and (L['cam'] or '').strip() == 'masuk': d['cam'] = 'masuk:' + jl[0]['who']
        if jl and not (L['cam'] or '').strip() and not d.get('foto') and not d.get('kertas'): d['cam'] = 'masuk:' + jl[0]['who']
        d['acts'] = prev_acts + acts; d['hold'] = hold0; prev_acts = acts
        _tw = [w[0][1] for w in L['words']]
        tid = next((k for k, tk in enumerate(_tw) if tk in ('tidur', 'tertidur') and not any(x in ('tidak', 'nggak', 'gak', 'belum', 'bisa', 'jangan') for x in _tw[max(0, k - 2):k])), None) if who == 'NARATOR' else None
        flags = {x.strip() for x in (L['ex'] or '').split(',')}
        if 'oleng' in flags: d['oleng'] = True
        if sc['loc'].startswith('jalan'): d['helm'] = [v.split('#')[0] for v in sc['cast'].values()]  # semua yang sedang dalam perjalanan motor memakai helm
        if sc['loc'] == 'gubuk' and any(v == 'lepasHelm' or v == 'datangMotor' for v in pose.values()): d['helm'] = [k_ for k_, v in pose.items() if v in ('lepasHelm', 'datangMotor')]
        if who == 'NARATOR' and re.search(r'menel[e]?pon|telepon', L['txt'].lower()): state['_telepon'] = sc
        def waktu_kata(kata):
            for (tk, tm) in L['words']:
                if tk[1].startswith(norm(kata)): return round(tm[0], 2)
            return round(L['start'], 2)
        if 'ceria' in flags: d['ceria'] = True
        if 'diam' in flags: d['diam'] = True
        for fl in flags:
            if fl.startswith('ledakan'): d['ledakan'] = waktu_kata(fl.split('@')[1]) if '@' in fl else round(L['start'], 2)
            if fl.startswith('sfx='):
                for j, item in enumerate(fl[4:].split('+')):
                    nm_, _, kata = item.partition('@')
                    sfx_cues.append({'nama': nm_.strip(), 't': waktu_kata(kata) if kata else round(L['start'] + j * 0.35, 2)})
        # --- mimik dari kata sifat (tidak menimpa ekspresi yang ditulis eksplisit)
        eksplisit = {x.split('=')[0].strip().lower() for x in (L['ex'] or '').split(',') if '=' in x}
        if who == 'NARATOR':
            for nm, e in mimik(L, castnames, last_subj).items():
                if nm not in eksplisit and d['expr'].get(nm) != 'kaget': d['expr'][nm] = e
        # --- kelas sepi saat istirahat / pulang
        if sc['loc'] == 'kelas' and who == 'NARATOR' and any(x in _tw for x in ('istirahat', 'sepulang', 'pulang', 'sepi', 'remedial')): sc['sepi'] = True
        if sc.get('sepi'): d['sepi'] = True
        # --- game di HP: landscape
        if any(x in _tw for x in GAME) or sc.get('_game'):
            if any(x in _tw for x in GAME) and 'keluar' not in _tw: sc['_game'] = True
            if 'keluar' in _tw: sc['_game'] = False
            if 'match' in _tw and ('menang' in _tw or 'kalah' in _tw) and not (L['cam'] or '').startswith('hp'):
                d['cam'] = 'hp'; d['phone'] = {'judul': '', 'pesan': [], 'jenis': 'game', 'hasil': 'menang' if 'menang' in _tw else 'kalah'}
            for nm, ps in list(d['pose'].items()):
                if ps == 'hp' and sc.get('_game'): d['pose'][nm] = 'game'
        # --- belajar bersama
        lowt = ' '.join(_tw)
        mb = re.search(r'belajar (bersama|bareng|dengan|di)|kerja kelompok', lowt)
        if who == 'NARATOR' and mb:
            ikut = list(castnames) if ('mereka' in _tw or not last_subj) else list(last_subj)
            for x in _tw[_tw.index(mb.group(0).split()[0]):]:
                if x in TOKOH_NAMA and x not in ikut: ikut.append(x)
            mr = re.search(r'di rumah (\w+)', lowt)
            if mr:
                tuan = mr.group(1)
                d.update({'loc': 'rumah', 'cast': {sl: (k + '#rumah' if k == tuan else k) for sl, k in zip(['meja', 'seberang', 'kiriMeja', 'kananMeja'], ikut[:4])}, 'cam': 'lebar', 'grade': d.get('grade') or 'hangat'})
            else:
                d.update({'loc': 'kelas', 'cast': {f'p{i + 1}': k for i, k in enumerate(ikut[:6])}, 'cam': 'lebar', 'sepi': True})
            guru = [x for x in _tw[_tw.index(mb.group(0).split()[0]):] if x in ikut]
            d['pose'] = {k: ('tunjuk' if guru and k == guru[0] else 'tanganMeja') for k in ikut}
            d['expr'] = {k: ('senyum' if guru and k == guru[0] else 'fokus') for k in ikut}
        # --- ucapan/teriakan lewat HP oleh tokoh yang tidak ada di adegan
        if who != 'NARATOR' and 'tanpa' not in flags and key(who) not in castnames and castnames and (d['cam'] in ('hp',) or sc['loc'] in ('kamar', 'rumah')):
            spk, lis = key(who), castnames[0]; dur = d['t1'] - d['t0']
            malam = d.get('jam') and (int(d['jam'][:2]) >= 18 or int(d['jam'][:2]) < 5)
            s1 = dict(d); s1.update({'t1': round(d['t0'] + dur * (0.45 if dur > 2.4 else 0.6), 2), 'loc': 'kamar', 'cast': {'mejaBelajar': spk + '#rumah'}, 'cam': f'cu:{spk}',
                                     'pose': {spk: 'telepon' if state.get('_telepon') is sc else 'game' if sc.get('_game') else 'hp'}, 'expr': {spk: d['expr'].get(spk, 'senang')}, 'acts': [], 'grade': 'malam' if malam else d.get('grade')})
            s1.pop('phone', None); shots.append(s1)
            if dur > 2.4 and d['cam'] == 'hp':
                s2 = dict(d); s2['t0'] = s1['t1']; s2['t1'] = round(d['t0'] + dur * 0.75, 2); shots.append(s2)
            d = dict(d); d.update({'t0': shots[-1]['t1'], 'cam': f'cu:{lis}', 'expr': {**d['expr'], lis: d['expr'].get(lis) or ('netral' if state.get('_telepon') is sc else 'kaget')}, 'pose': {**d['pose'], lis: 'telepon' if state.get('_telepon') is sc else 'game' if sc.get('_game') else 'hp'}})
            d.pop('phone', None)
        if tid is not None and castnames and sc['loc'] in ('kamar', 'rumah'):
            tt = round(L['words'][tid][1][0] - 0.2, 2); who0 = (last_subj or castnames)[0] if (last_subj or castnames) else castnames[0]
            key0 = next((v for v in sc['cast'].values() if v.split('#')[0] == who0), who0)
            if tt - d['t0'] > 0.8:
                d2 = dict(d); d2['t1'] = tt; shots.append(d2)
                d = dict(d); d['t0'] = tt
            d.update({'loc': 'kamar', 'cast': {'kasur': key0}, 'cam': 'tidur', 'pose': {who0: 'tidur'}, 'expr': {who0: 'merem'}, 'acts': [], 'grade': 'malam'})
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

    # pecah shot panjang (>4,5 dtk) dengan sudut bergantian agar tidak statis
    import math, copy
    out = []
    for d in shots:
        dur = d['t1'] - d['t0']; cam = d['cam']
        if cam == 'hp' or dur <= 4.5: out.append(d); continue
        names = [v.split('#')[0] for v in d['cast'].values()]
        if cam.startswith(('cu:', 'mcu:')):
            who = cam.split(':')[1]; others = [x for x in names if x != who]
            cyc = [cam, 'dua' if len(names) >= 2 else ('mcu:' + who if cam.startswith('cu') else 'cu:' + who)] + ([f'cu:{others[0]}'] if others else []) + [cam]
        elif cam in ('penonton', 'sorot'): cyc = [cam, 'lebar']
        elif cam == 'barisDepan': cyc = [cam, 'penonton']
        elif cam.startswith('drummer:'): cyc = [cam, 'lebar']
        else: cyc = [cam, 'lebar' if cam == 'dua' else ('cu:' + names[0] if len(names) > 2 else 'dua')]
        n = math.ceil(dur / 4.0)
        for k in range(n):
            e = copy.deepcopy(d); e['t0'] = round(d['t0'] + dur * k / n, 2); e['t1'] = round(d['t0'] + dur * (k + 1) / n, 2)
            e['cam'] = cyc[k % len(cyc)]; e['flash'] = d['flash'] and k == 0; out.append(e)
    shots = out
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
    json.dump(sfx_cues, open(os.path.join(prod, f'{a.ep}_sfx.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'{len(shots)} shot, {len(caps)} subtitle, durasi {duration}s -> {js}')
    cocok = sum(1 for v in sm.get_matching_blocks() for _ in range(v.size))
    print(f'kata naskah cocok dengan rekaman: {cocok}/{len(nk)}' + ('  (periksa naskah vs rekaman!)' if cocok < 0.7 * len(nk) else ''))

if __name__ == '__main__': main()
