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
- Tangan di `phoneInsert` menggenggam dari belakang/tepi; jangan taruh jari atau jempol di depan layar (permintaan pengguna: tulisan notifikasi harus terbaca).
- Adegan ponsel paling aman lewat `phoneInsert` (bukan ponsel di tangan dari jauh).
- Debug posisi: render kamera dari atas (`cam.up=(0,0,-1)`, lihat ke bawah) untuk melihat tata letak.

## Jalur hemat (dipakai untuk "buatkan video cerita dari voice over ini")
Tidak perlu menulis shot satu per satu atau mengecek kamera berulang:
1. Tulis naskah bertanda (format lengkap di kepala `tools/naskah_ke_episode.py`; contoh:
   `produksi/contoh_naskah/teman_sebangku.txt`). Jika pengguna hanya memberi VO, transkrip dulu lalu beri tanda sendiri.
2. `python3 tools/naskah_ke_episode.py naskah.txt vo.mp3 --ep ep4` → transkrip Whisper (otomatis bila belum ada),
   penjajaran kata naskah↔rekaman, `engine/episodes/ep4.js`, subtitle `produksi/ep4.ass`.
3. Cek SATU lembar cuplikan kecil (titik tengah tiap shot, lebar 130 px), perbaiki hanya shot yang rusak
   dengan menambah `{cu:x}`/`{dua}`/`{lebar}` di naskah lalu jalankan ulang langkah 2.
4. `produksi/buat_video.sh ep4 vo.mp3 "Judul"`.

`lib/auto.js` berisi `LOKASI` (slot tokoh tiap lokasi, batas & penghalang kamera) dan penentu kamera otomatis:
`cu`/`mcu` (sudut 3/4 yang tidak terhalang kepala lain), `dua` (two-shot dari balik bahu), `lebar`, `hp*` (layar ponsel).
Tokoh: kunci di `lib/cast.js` (aturan pengguna: tanpa kerudung; perempuan pakai rambut `panjang`) (`dimas#perban` = varian). Lokasi baru = tambah set di `sets.js` + entri `LOKASI`.
Shot khusus (rekaman CCTV, kejadian fisik) tetap bisa ditambahkan manual ke file episode hasil generator.

### Aksi otomatis dari narasi
`naskah_ke_episode.py` membaca kata kerja di baris NARATOR dan menjalankannya tepat saat kata itu terdengar
(waktu dari transkrip): *berjalan/datang/tiba/maju/menghampiri* → jalan masuk, *mengendap-endap* → jalan jongkok,
*pergi/pulang/menjauh* → jalan keluar, *membuka tas* → tas muncul lalu kertas di tangan, *melihat/membuka kertas/surat/catatan*
dan *membaca* → membaca kertas, *menyerahkan/memberikan/menyodorkan* → barang (kertas/piala/cat/ponsel) pindah ke tokoh
penerima (nama sesudah kata kerja, atau tokoh lain di adegan), *menoleh, menunduk, mengangguk, menunjuk/menemukan,
mengintip, meraba*. Pelaku = nama tokoh terakhir yang disebut (daftar "A, B, dan C" ikut semua). Barang yang dipegang
terbawa ke shot berikutnya dalam adegan yang sama. Pose `(x:piala)`/`(x:cat)` di naskah = mulai memegang barang itu.

### Duduk di kelas, masuk lewat pintu, foto
- `[kelas]` dengan slot `p1..pN`: murid otomatis **duduk** di bangku; guru (eko, agus, wali) berdiri di depan.
  Pakai `[kelas berdiri]` untuk adegan berdiri (presentasi, berkumpul di depan kelas).
- Aksi *masuk/datang/berjalan*: tokoh berjalan dari **pintu** lokasi (pintu terbuka), kamera otomatis `masuk:<tokoh>`
  bila baris tidak diberi kamera, atau tulis `{masuk}`. Lokasi berpintu: kelas, rumah, ruang guru, lobi, gudang, koridor, kantin.
- Foto: `{foto} [Keterangan 1 | Keterangan 2]` menampilkan foto cetak bergambar (gambar menyesuaikan kata seperti
  kantin, lapangan, sampah, penuh, tidak ada); juga otomatis bila narasi berisi *memperlihatkan/menunjukkan/mengedarkan foto*.
