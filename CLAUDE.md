# Catatan untuk Claude

## Animasi cerita pendek vertikal
Jika pengguna meminta membuat animasi/video cerita (gaya 3D toon blocky, narasi "gue/lo",
subtitle kapital 2–3 kata, serial "Bagian N" dengan "BERSAMBUNG…"), **jangan analisis ulang
video referensi**. Baca dulu:
- `animasi/PANDUAN_ANIMASI.md` – style bible, kamera, teks, struktur cerita, pipeline, checklist
- `animasi/referensi/breakdown_bagian1.md` – bedah shot-per-shot video referensi
- `animasi/contoh_storyboard.json` – format storyboard (input generator subtitle)
- `animasi/tools/buat_subtitle.py` + `animasi/tools/README.md` – subtitle .ass & resep ffmpeg yang sudah diuji

Untuk mengubah voice-over jadi video animasi 3D, pakai mesin di `animasi/engine/` (baca `animasi/engine/README.md`;
contoh lengkap: `animasi/produksi/` + `animasi/engine/episodes/`).

Pakai brand, karakter, dan naskah milik pengguna, bukan milik channel referensi.
