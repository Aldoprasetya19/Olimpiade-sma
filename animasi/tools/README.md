# Tools animasi – resep yang sudah diuji

Semua perintah di bawah sudah dicoba pada video referensi 720×1280 (ffmpeg 6+, Python 3).

## 1. Font Oswald (wajib untuk subtitle)
Google Fonts/GitHub bisa diblokir di lingkungan cloud; jalur npm berhasil:
```bash
mkdir -p fonts tmpfont && cd tmpfont && npm pack @fontsource/oswald --silent && tar xzf fontsource-oswald-*.tgz
pip install fonttools brotli
python3 -c "from fontTools.ttLib import TTFont; f=TTFont('package/files/oswald-latin-700-normal.woff2'); f.flavor=None; f.save('../fonts/Oswald-Bold.ttf')"
```

## 2. Subtitle + branding + end card
```bash
python3 buat_subtitle.py storyboard.json -o subs.ass
ffmpeg -i video.mp4 -vf "ass=subs.ass:fontsdir=fonts" -c:a copy hasil.mp4
```
Untuk cek satu frame di detik T (perhatikan `setpts` — tanpa itu `-ss` mereset waktu subtitle ke 0):
```bash
ffmpeg -ss T -i video.mp4 -vf "setpts=PTS+T/TB,ass=subs.ass:fontsdir=fonts" -frames:v 1 cek.png
```
Ukuran yang sudah dikalibrasi ke referensi (lebar 720): narasi 74, chip 28, judul 112,
logo 32, handle 34, BERSAMBUNG 96, sub-judul 44. Subtitle di y = 70% tinggi.

## 3. Color grade
Realita (hangat):
```bash
-vf "eq=saturation=0.9:contrast=0.95,colorbalance=rm=0.04:bm=-0.04"
```
Khayalan (tint dingin + vignette putih bercahaya):
```bash
F="min(1\,pow(hypot((X-W/2)/(W/2)\,(Y-H/2)/(H/2))/1.35\,2.5))"
-vf "eq=saturation=0.8:brightness=0.04,colorbalance=bs=0.08:gs=0.04:rs=-0.05,geq=r='r(X,Y)+(255-r(X,Y))*$F':g='g(X,Y)+(255-g(X,Y))*$F':b='b(X,Y)+(255-b(X,Y))*$F'"
```
(ganti `colorbalance` untuk ungu: `rs=0.05:bs=0.08:gs=-0.04`). `geq` lambat; untuk video
panjang lebih cepat bikin PNG gradien putih sekali lalu `overlay`.

Alasan/rencana konyol (sepia):
```bash
-vf "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=brightness=0.06:contrast=0.85,vignette=PI/4"
```

## 4. Gerak kamera dari gambar diam (Ken Burns push-in 3 detik)
```bash
ffmpeg -loop 1 -i shot.png -vf "scale=1440:-1,zoompan=z='1+0.06*on/90':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=720x1280:fps=30" -t 3 -pix_fmt yuv420p shot.mp4
```
Pan: ganti `x='(iw-iw/zoom)*on/90'` dengan `z` tetap 1.1.

## 5. Latar end card (frame terakhir diblur + ungu gelap, 2,4 detik)
```bash
ffmpeg -sseof -0.1 -i adegan_terakhir.mp4 -frames:v 1 last.png
ffmpeg -loop 1 -i last.png -vf "gblur=sigma=18,eq=brightness=-0.12,drawbox=c=0x2A2438@0.75:t=fill" -t 2.4 -r 30 -pix_fmt yuv420p endcard.mp4
```
Teks "BERSAMBUNG…" ditambahkan otomatis oleh `buat_subtitle.py` (blok `bersambung`).

## 6. Menggabungkan shot + audio
```bash
# daftar.txt berisi: file 'shot01.mp4' ... (semua 720x1280, 30fps, codec sama)
ffmpeg -f concat -safe 0 -i daftar.txt -c copy video_bisu.mp4
# VO + musik dengan ducking
ffmpeg -i video_bisu.mp4 -i vo.wav -i musik.mp3 -filter_complex \
 "[2:a]volume=0.25[m];[m][1:a]sidechaincompress=threshold=0.05:ratio=8[md];[1:a][md]amix=inputs=2:normalize=0[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -shortest video_suara.mp4
```

## 7. Menganalisis video referensi baru (kalau ada gaya lain)
```bash
ffmpeg -i ref.mp4 -vf "fps=1/3,scale=360:-1,tile=4x2" lembar%02d.jpg            # contact sheet
ffmpeg -i ref.mp4 -vf "fps=2,crop=720:130:0:840,scale=360:-1,drawtext=text='%{pts\:hms}':x=2:y=2:fontsize=12:fontcolor=red,tile=3x16" subs%02d.jpg   # transkrip subtitle
ffmpeg -i ref.mp4 -vf "scale=180:-1,select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"   # waktu cut
```
