#!/usr/bin/env python3
"""Generator subtitle .ASS bergaya "cerita vertikal" dari storyboard JSON.

Menghasilkan:
  - judul hook 2 baris (putih + kuning) di awal video
  - subtitle narasi kapital 2-3 kata dengan efek pop
  - dialog berwarna per karakter + chip nama di atasnya
  - logo channel kecil (dua warna) di kiri atas
  - handle sosial media yang berpindah posisi tiap beberapa detik
  - kartu "BERSAMBUNG..." di akhir

Pemakaian:
  python3 buat_subtitle.py ../contoh_storyboard.json -o subs.ass
  ffmpeg -i video.mp4 -vf "ass=subs.ass:fontsdir=fonts" -c:a copy hasil.mp4

Format storyboard: lihat ../contoh_storyboard.json dan ../PANDUAN_ANIMASI.md bagian 4.
Hanya memakai pustaka standar Python.
"""
import argparse
import json
import sys

BASE_W = 720  # semua ukuran di bawah ditulis untuk lebar 720 lalu diskalakan


def ass_time(t):
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def ass_color(hex_color, alpha=0):
    """'#RRGGBB' -> '&HAABBGGRR' (alpha 0 = opak, 255 = transparan)."""
    h = hex_color.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def esc(text):
    return text.replace("{", "(").replace("}", ")").replace("\n", "\\N")


def build(sb):
    v = sb.get("video", {})
    W, H = v.get("width", 720), v.get("height", 1280)
    k = W / BASE_W
    st = sb.get("gaya", {})
    font = st.get("font", "Oswald")
    kuning = st.get("warna_aksen", "#FFD84A")
    gelap = st.get("warna_gelap", "#1E1E2A")
    cap_y = H * st.get("posisi_subtitle", 0.70)
    cap_size = round(74 * k)
    chip_size = round(28 * k)

    chars = sb.get("karakter", {})
    narr = sb.get("narator", "narator")

    def S(n):
        return round(n * k)

    styles = [
        # Name, Font, Size, Primary, Secondary, Outline, Back, Bold, Italic, Underline, Strike,
        # ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, ML, MR, MV, Enc
        f"Style: Narasi,{font},{cap_size},&H00FFFFFF,&H00FFFFFF,{ass_color(gelap, 0x40)},&H90000000,"
        f"-1,0,0,0,100,100,{S(0.5)},0,1,{S(2)},{S(4)},5,10,10,10,1",
        f"Style: Chip,{font},{chip_size},{ass_color(gelap)},&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,"
        f"-1,0,0,0,100,100,{S(3)},0,3,{S(4)},0,5,10,10,10,1",
        f"Style: Judul,{font},{S(112)},&H00FFFFFF,&H00FFFFFF,{ass_color(gelap, 0x30)},&H90000000,"
        f"-1,0,0,0,100,100,{S(1)},0,1,{S(2)},{S(3)},5,10,10,10,1",
        f"Style: Logo,{font},{S(32)},&H00FFFFFF,&H00FFFFFF,&H80000000,&H00000000,"
        f"-1,0,0,0,100,100,{S(1.5)},0,1,{S(0.8)},0,7,10,10,10,1",
        f"Style: Handle,{font},{S(34)},&H60FFFFFF,&H60FFFFFF,&HA0000000,&H00000000,"
        f"0,0,0,0,100,100,0,0,1,{S(0.6)},0,7,10,10,10,1",
        f"Style: Bersambung,{font},{S(96)},{ass_color(kuning)},&H00FFFFFF,&H60000000,&H00000000,"
        f"-1,0,0,0,100,100,{S(1)},0,1,{S(1.5)},{S(2)},5,10,10,10,1",
        f"Style: SubJudul,{font},{S(44)},&H00FFFFFF,&H00FFFFFF,&H60000000,&H00000000,"
        f"-1,0,0,0,100,100,0,0,1,{S(1)},{S(1)},5,10,10,10,1",
    ]

    ev = []

    def add(layer, start, end, style, text):
        if end <= start:
            return
        ev.append(f"Dialogue: {layer},{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}")

    # ---- kumpulkan potongan subtitle (start absolut; end default = start berikutnya)
    caps = []
    for shot in sb.get("shots", []):
        for c in shot.get("subtitle", []):
            caps.append(dict(c))
    caps.sort(key=lambda c: c["start"])
    durasi = sb.get("durasi") or (max([c.get("end", c["start"] + 1) for c in caps] + [0]))
    end_card = sb.get("bersambung")
    batas = end_card["start"] if end_card else durasi
    for i, c in enumerate(caps):
        if "end" not in c:
            nxt = caps[i + 1]["start"] if i + 1 < len(caps) else c["start"] + 1.2
            c["end"] = min(nxt, c["start"] + 2.0, batas)

    pop = r"\fscx88\fscy88\t(0,90,\fscx100\fscy100)"
    x = W / 2
    for c in caps:
        who = c.get("siapa", narr)
        teks = esc(c["teks"].upper())
        if who == narr:
            add(2, c["start"], c["end"], "Narasi", f"{{\\pos({x:.0f},{cap_y:.0f}){pop}}}{teks}")
            continue
        info = chars.get(who, {})
        col = info.get("warna", "#FFFFFF")
        glow = info.get("glow", False)
        extra = rf"\3c{ass_color(col)}\3a&H90&\blur{S(4)}" if glow else ""
        add(2, c["start"], c["end"], "Narasi",
            f"{{\\pos({x:.0f},{cap_y + S(6):.0f})\\1c{ass_color(col)}{extra}{pop}}}{teks}")
        chip_y = cap_y - cap_size * 0.72
        label = esc(info.get("label", who).upper())
        add(3, c["start"], c["end"], "Chip",
            f"{{\\pos({x:.0f},{chip_y:.0f})\\3c{ass_color(col)}\\4c{ass_color(col)}}}{label}")

    # ---- judul hook
    j = sb.get("judul")
    if j:
        js, je = j.get("start", 0), j.get("end", 0.6)
        jy = H * 0.33
        add(4, js, je, "Judul", f"{{\\pos({x:.0f},{jy:.0f})}}{esc(j['baris1'].upper())}")
        add(4, js, je, "Judul",
            f"{{\\pos({x:.0f},{jy + S(84):.0f})\\1c{ass_color(kuning)}}}{esc(j['baris2'].upper())}")

    # ---- branding
    br = sb.get("brand")
    if br:
        a, b = esc(br.get("nama_a", "")), esc(br.get("nama_b", ""))
        add(5, 0, durasi, "Logo",
            f"{{\\pos({S(28)},{S(22)})}}{a}{{\\1c{ass_color(kuning)}}}{b}")
        handle = esc(br.get("handle", ""))
        if handle:
            posisi = [(S(30), S(66)), (W - S(260), S(66)), (S(30), H * 0.30)]
            tiap = br.get("ganti_posisi_detik", 4.5)
            t, i = 0.0, 0
            akhir = end_card["start"] if end_card else durasi
            while t < akhir:
                px, py = posisi[i % len(posisi)]
                add(5, t, min(t + tiap, akhir), "Handle", f"{{\\pos({px:.0f},{py:.0f})}}{handle}")
                t += tiap
                i += 1

    # ---- end card
    if end_card:
        s, e = end_card["start"], end_card.get("end", durasi)
        add(6, s, e, "Bersambung",
            f"{{\\pos({x:.0f},{H * 0.47:.0f})\\fad(250,0)}}{esc(end_card.get('judul', 'BERSAMBUNG...'))}")
        add(6, s + 0.2, e, "SubJudul",
            f"{{\\pos({x:.0f},{H * 0.47 + S(80):.0f})\\fad(250,0)}}{esc(end_card.get('sub', ''))}")
        if br:
            add(6, s + 0.3, e, "Logo",
                f"{{\\an5\\pos({x:.0f},{H * 0.86:.0f})\\fad(250,0)}}{esc(br.get('nama_a', ''))}"
                f"{{\\1c{ass_color(kuning)}}}{esc(br.get('nama_b', ''))}")

    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
""" + "\n".join(styles) + """

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    return head + "\n".join(ev) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard")
    ap.add_argument("-o", "--output", default="-")
    a = ap.parse_args()
    with open(a.storyboard, encoding="utf-8") as f:
        sb = json.load(f)
    out = build(sb)
    if a.output == "-":
        sys.stdout.write(out)
    else:
        with open(a.output, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"Tersimpan: {a.output}")


if __name__ == "__main__":
    main()
