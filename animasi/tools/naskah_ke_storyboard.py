#!/usr/bin/env python3
"""Gabungkan transkrip Whisper (word timestamps) + naskah koreksi -> storyboard JSON untuk buat_subtitle.py.

naskah.json:
{
  "judul": ["BARIS 1", "BARIS 2"], "judul_durasi": 1.0,
  "durasi": 67.6,
  "bersambung": {"start": 64.3, "judul": "BERSAMBUNG...", "sub": "Bagian 2: ..."},
  "karakter": {"NAYA": {"warna": "#FFB3C7"}},
  "segmen": [ {"teks": "Kalimat terkoreksi.", "siapa": "NAYA"}, {"skip": true}, ... ]   # 1:1 dengan segmen whisper
}
Pemakaian: python3 naskah_ke_storyboard.py transkrip.json naskah.json -o storyboard.json
"""
import argparse, json, re

def chunks(words, maxw=3, maxc=20):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        txt = ' '.join(words[j] for j in cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        punct = re.search(r'[,.?!…]$', w)
        if punct or len(cur) >= maxw or (nxt and len(txt) + 1 + len(nxt) > maxc):
            out.append(cur); cur = []
    if cur:
        if out and len(cur) == 1 and len(words[cur[0]]) <= 4 and len(out[-1]) < maxw:
            out[-1] += cur
        else: out.append(cur)
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('transkrip'); ap.add_argument('naskah'); ap.add_argument('-o', '--output', required=True)
    a = ap.parse_args()
    tr = json.load(open(a.transkrip)); nk = json.load(open(a.naskah))
    segs = nk['segmen']
    assert len(segs) == len(tr), f"jumlah segmen naskah {len(segs)} != transkrip {len(tr)}"
    jd = nk.get('judul_durasi', 1.0) if nk.get('judul') else 0
    caps = []
    for s, w in zip(segs, tr):
        if s.get('skip'): continue
        words = s['teks'].split()
        ww = w['words']; t0, t1 = w['start'], w['end']
        def at(i):
            if len(ww) == len(words): return ww[i]['s']
            return t0 + (t1 - t0) * i / len(words)
        groups = chunks(words)
        for gi, g in enumerate(groups):
            st = max(at(g[0]), jd if not caps else 0)
            en = at(groups[gi + 1][0]) if gi + 1 < len(groups) else t1 + 0.15
            if en - st < 0.25: st = en - 0.25
            c = {'start': round(st, 2), 'end': round(en, 2), 'teks': ' '.join(words[j] for j in g)}
            if s.get('siapa'): c['siapa'] = s['siapa']
            caps.append(c)
    while len(caps) > 1 and caps[0]['end'] - jd < 0.45 and len(caps[0]['teks']) + len(caps[1]['teks']) < 22:
        caps[1]['teks'] = caps[0]['teks'] + ' ' + caps[1]['teks']; caps[1]['start'] = round(jd, 2); caps.pop(0)
    if caps and caps[0]['start'] < jd: caps[0]['start'] = round(jd, 2)
    for i in range(len(caps) - 1):
        caps[i]['end'] = min(caps[i]['end'], caps[i + 1]['start'])
    sb = {
        'video': {'width': 720, 'height': 1280, 'fps': 30}, 'durasi': nk['durasi'],
        'gaya': {'font': 'Oswald', 'warna_aksen': '#FFD84A', 'warna_gelap': '#1E1E2A', 'posisi_subtitle': 0.70},
        'narator': 'narator', 'karakter': nk.get('karakter', {}),
        'shots': [{'id': 1, 'start': 0, 'end': nk['durasi'], 'subtitle': caps}],
    }
    if nk.get('judul'): sb['judul'] = {'baris1': nk['judul'][0], 'baris2': nk['judul'][1], 'start': 0, 'end': jd}
    if nk.get('bersambung'): sb['bersambung'] = {**nk['bersambung'], 'end': nk['durasi']}
    if nk.get('brand'): sb['brand'] = nk['brand']
    json.dump(sb, open(a.output, 'w'), ensure_ascii=False, indent=1)
    print(f"{len(caps)} potongan subtitle -> {a.output}")

if __name__ == '__main__': main()
