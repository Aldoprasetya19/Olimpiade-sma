# Catatan untuk Claude

## Pilih jenis video dari kalimat perintah pengguna
| Perintah pengguna | Jenis video | Cara membuat |
|---|---|---|
| "buatkan video **motion graphics** dari voice over ini" | Motion graphic edukasi/ilmu pengetahuan (ilustrasi datar, teks & ikon bergerak per kata, subtitle karaoke) | Panggil skill `anthropic-skills:flowmotion`, gaya acuan & cadangan: `animasi/motion-graphics/` (baca `README.md`-nya) |
| "buatkan video **cerita** dari voice over ini" | Animasi cerita 3D toon blocky (karakter, lokasi, layar ponsel, subtitle kapital + chip nama, BERSAMBUNG/SELESAI) | Mesin `animasi/engine/` (baca `animasi/engine/README.md`; contoh lengkap `animasi/produksi/` + `animasi/engine/episodes/`) |

- Satu file voice-over = satu video terpisah. Transkrip VO dengan faster-whisper `medium`, `language="id"`, `word_timestamps=True`.
- Kalau perintahnya tidak jelas termasuk yang mana, tanyakan dulu sebelum mulai.
- Jangan analisis ulang video referensi; semua yang perlu sudah tercatat di file-file di atas.

## Animasi cerita pendek vertikal (jalur "video cerita")
Baca dulu:
- `animasi/PANDUAN_ANIMASI.md` – style bible, kamera, teks, struktur cerita, pipeline, checklist
- `animasi/referensi/breakdown_bagian1.md` – bedah shot-per-shot video referensi
- `animasi/contoh_storyboard.json` – format storyboard (input generator subtitle)
- `animasi/tools/buat_subtitle.py` + `animasi/tools/README.md` – subtitle .ass & resep ffmpeg yang sudah diuji
- `animasi/engine/README.md` – mesin 3D, alur kerja per episode, pelajaran kamera

Pakai brand, karakter, dan naskah milik pengguna, bukan milik channel referensi.
