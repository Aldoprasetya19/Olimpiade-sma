# Mesin animasi 3D (Three.js, dirender headless)

Dipakai untuk membuat video dari voice-over **tanpa Blender**: semua aset dibuat dari kode
(karakter blocky, set, UI ponsel), dirender frame-per-frame di Chromium headless (SwiftShader),
lalu digabung dengan VO + subtitle oleh ffmpeg. Kecepatan ±0,3 detik/frame (720×1280).

## Struktur
| File | Isi |
|---|---|
| `lib/core.js` | renderer, material toon + outline, pass grading (preset `GRADES`: hangat, malam, tegang, rekaman, kenangan, pagi, sore, ancaman), lapisan HUD 2D |
| `lib/char.js` | kelas `Char` (kepala silinder, wajah canvas dengan ekspresi `PRESETS`, rambut: spiky/bowl/curly/sidepart/teacher/helmet/hijab), `POSES`, `walkPose`, `mixPose`, `addPose`, `idle` |
| `lib/cast.js` | desain pemeran tetap (Aldo, Dimas, Reno, Bagas, Ibu, Wali, Pekerja, siswa) |
| `lib/sets.js` | properti (ponsel, meja, kursi, roti, papan kelas, tangga lipat…) + lokasi `SETS`: rumah, sekolahTangga, belakangKantin, gerbang({sore}), kelas, ruangGuru, kosong |
| `lib/phoneui.js` | UI ponsel 540×1080: layar kunci, chat (grup/pribadi/gelap, bubble video & transfer), banner notifikasi, pemutar video |
| `lib/shots.js` | helper: `phoneInsert` (ponsel memenuhi layar, teks terbaca), `stairsSetup/stairsEvent` (kejadian papan jatuh), `footageView` (tampilan rekaman HP, `crop:true` = klip terpotong), `hudBubble`, `ring`, `talker`, `project` |
| `lib/main.js` | pemutar timeline (`window.renderFrame(t)`), transisi `flashIn/fadeIn/flashOut`, kartu akhir (`endcard:true`) |
| `episodes/epN.js` | daftar shot: `{t0, t1, build(S) → (lt, k, t, hud) => grade}` |
| `render.cjs` | `node render.cjs ep1 out.mp4` atau `node render.cjs ep1 --still 1,5,9 dir/` untuk cek frame |

## Alur kerja satu episode
1. Transkrip VO: faster-whisper `medium`, `language="id"`, `word_timestamps=True` → `produksi/epN_transkrip.json`
   (decode audio lewat ffmpeg ke numpy; versi PyAV terbaru error kalau diberi path langsung).
2. Tulis `produksi/epN_naskah.json` (teks terkoreksi 1:1 per segmen + pembicara) →
   `tools/naskah_ke_storyboard.py` → `tools/buat_subtitle.py` → `epN.ass`.
3. Tulis `episodes/epN.js`: potong shot di batas segmen VO (2–4 dtk), cek dengan `--still`, perbaiki, ulangi.
4. `produksi/buat_video.sh epN epN_vo.mp3 "Judul"` → `output/Judul.mp4`.

## Pelajaran penting (hemat waktu berikutnya)
- **Layar 9:16 itu sempit horizontal**: fov 40 vertikal ≈ 23° horizontal. Medium shot butuh fov 45–55 atau kamera jauh.
- **Over-the-shoulder**: kepala depan harus ≥0,6 unit dari garis kamera→subjek, dan kamera ≥3 unit dari kepala depan;
  kalau ragu, pakai *clean single* dari sudut 3/4 (±45° dari arah hadap subjek). Cek arah hadap: karakter menghadap +z lokal.
- Tinggi kepala (pusat) berdiri ≈ 1,98; duduk ≈ 1,73. Meja 0,92, kursi 0,42.
- Kamera di luar ruangan `room()` boleh (dinding depan satu sisi), lantai sudah diperpanjang 3×.
- Adegan ponsel paling aman lewat `phoneInsert` (bukan ponsel di tangan dari jauh).
- Debug posisi: render kamera dari atas (`cam.up=(0,0,-1)`, lihat ke bawah) untuk melihat tata letak.
