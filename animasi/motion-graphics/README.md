# Jalur "video motion graphics" (gaya edukasi / ilmu pengetahuan)

Dipakai bila pengguna berkata **"buatkan video motion graphics dari voice over ini"**.
Hasilnya bukan cerita berkarakter 3D, melainkan *explainer* datar penuh ilustrasi dan teks
yang bergerak tepat per kata narasi.

## Urutan kerja
1. **Panggil skill `anthropic-skills:flowmotion`** (lewat tool Skill) dan ikuti alurnya. Skill itu
   membuat motion graphic minimalis berbasis Remotion yang dipasangkan per kata dengan voice-over.
2. Gaya visual acuan pengguna = contoh `contoh-kelas-gerah/` ("Kenapa kelas terasa gerah saat siang?",
   73,5 dtk). Jika skill tidak tersedia/gagal di lingkungan ini, kerjakan langsung dengan pola contoh tersebut.
3. Satu file VO = satu video terpisah.

## Ciri gaya contoh (yang disukai pengguna)
- Ilustrasi vektor datar (SVG): matahari berputar, termometer naik, siswa sederhana yang berkeringat,
  panah, ikon angin/orang, jam, kartu putih membulat dengan bayangan lembut, latar pola titik.
- Palet cerah: navy `#1D2B53`, krem `#FFF6E9`, kuning `#FFC93C`, oranye `#FF7A3D`, merah `#E63946`,
  biru `#4D96FF`, teal `#2EC4B6`. Font Inter tebal (800–900).
- Label "pil" (kapsul berwarna) yang *pop* dengan easing back, kartu masuk dari samping, perbandingan
  kiri–kanan (mis. PAGI vs SIANG), angka/indikator yang beranimasi mengikuti kata yang diucapkan.
- Subtitle gaya karaoke di bawah: kapsul gelap, kata aktif kuning, kata yang sudah diucapkan putih,
  kata berikutnya transparan. Bilah progres oranye di dasar layar.
- Transisi antar-adegan: crossfade 0,45 dtk + sedikit zoom (1,04 → 1).
- Resolusi contoh 1920×1080 30 fps. Tanyakan/ikuti permintaan bila ingin vertikal 1080×1920.

## Struktur kode contoh (`contoh-kelas-gerah/`)
| File | Isi |
|---|---|
| `transcript.json` | transkrip faster-whisper dengan `words` (s/e per kata) |
| `words.js` | `const WORDS=[{w,s,e}...]` untuk subtitle karaoke |
| `anim.js` | helper (`g`, `txt`, `pill`, `card`, `sun`, `thermo`, `student`, `arrow`…), `scene(start,end,fn)` per bagian narasi, `render(t)` menggambar SVG |
| `index.html` | panggung SVG 1920×1080 |
| `render.js` | Playwright → screenshot per frame → ffmpeg (+ `vo.mp3`) → `out.mp4`; `node render.js stills 3 12 40` untuk cek frame |

Catatan: `index.html` contoh belum memuat font Inter secara eksplisit; muat lewat `@fontsource/inter`
(npm, sudah terbukti bisa diunduh di lingkungan ini) agar hasil konsisten.
