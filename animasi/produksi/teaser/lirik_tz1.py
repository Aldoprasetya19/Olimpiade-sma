# Membuat subtitle lirik (tz1.ass) untuk teaser "Es Teh Boba Sultan: Liburan Bersama".
# Waktu dari transkrip whisper lagu (tz1_transkrip.json); verse 1 sebelum 30 dtk diperkirakan.
LIRIK = [
 (17.5, 21.4, "Uang kas tinggal dua ratus ribu saja"), (21.4, 25.2, "Mereka pamer mesin boba di depan mata"),
 (25.2, 28.9, "Sultan bersanding spanduk besar berwibawa"), (28.9, 32.8, "Hanya es teh plastikan kita tertawa"),
 (33.2, 48.4, "Ayo lawan boba pakai semangat ini"), (49.2, 52.1, "Modal tipis bukan alasan tuk berhenti"),
 (52.1, 56.9, "Tiap tetes keringat jadi bukti abadi"), (56.9, 65.0, "Kita kan menang bersama di Market Day ini"),
 (65.1, 69.3, "Tiga puluh empat derajat matahari membakar"), (69.3, 73.4, "Gelas seratus siap tapi esnya tak nampak"),
 (73.4, 77.0, "Nava Febri tancap gas berburu ke pasar"), (77.0, 81.4, "Gitar Stefan berbunyi galau tak bergerak"),
 (81.4, 96.9, "Ayo lawan boba pakai semangat ini"), (96.9, 100.1, "Modal tipis bukan alasan tuk berhenti"),
 (100.1, 104.9, "Tiap tetes keringat jadi bukti abadi"), (104.9, 110.8, "Kita kan menang bersama di Market Day ini"),
 (112.1, 119.8, "Mesin boba mati es teh kehabisan es"), (119.8, 128.1, "Bukan saingan ini jalannya sukses"),
 (128.1, 135.8, "Dua kelas bersatu hapus batas kasta"), (135.8, 144.3, "Terciptalah kolaborasi paling juara"),
 (144.3, 151.4, "Gelas pun habis senyum merekah di pipi"), (152.1, 159.6, "Hadiah jalan-jalan menanti di hari nanti"),
 (159.6, 165.3, "Jangan pelit sama adik kelas ya nanti"), (165.3, 169.6, "Jangan pelit sama adik kelas ya nanti"),
 (169.6, 171.0, "Tahun depan giliran kami yang beraksi"),
]
def ts(t): h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h}:{m:02d}:{s:05.2f}"
out = """[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lirik,Oswald,34,&H00FFFFFF,&H0030C2F2,&H00000000,&H64000000,-1,0,0,0,100,100,1,0,1,2,0,2,40,40,52,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for a, b, l in LIRIK:
    out += f"Dialogue: 0,{ts(a)},{ts(b)},Lirik,,0,0,0,,{{\\fad(250,250)}}{l}\n"
open('../tz1.ass' if __import__('os').path.basename(__import__('os').getcwd())=='teaser' else 'tz1.ass','w').write(out)
