# Panduan Animasi Cerita Pendek Vertikal (gaya "3D toon blocky + narasi lucu")

> **Untuk Claude di sesi berikutnya:** baca file ini dulu sebelum membuat animasi serupa.
> Isinya adalah hasil bedah lengkap video referensi (Bagian 1/6, ±92 detik, 720×1280, 30 fps)
> sehingga tidak perlu menganalisis ulang. Breakdown shot per shot ada di
> `referensi/breakdown_bagian1.md`, contoh storyboard siap pakai di `contoh_storyboard.json`,
> dan generator subtitle di `tools/buat_subtitle.py`.
>
> Catatan orisinalitas: referensi adalah milik kreator lain (brand "KACAURUS"). Yang kita tiru
> adalah **teknik & format**, bukan nama channel, watermark, karakter, atau naskahnya.
> Selalu pakai nama brand, karakter, dan cerita milik pengguna sendiri.

---

## 1. Ringkasan format

| Aspek | Nilai |
|---|---|
| Rasio / resolusi | 9:16, 720×1280 (render 1080×1920 kalau bisa) |
| FPS | 30 |
| Durasi per episode | 80–95 detik, serial (Bagian 1/6, 2/6, …) |
| Jumlah shot | ±30 shot → rata-rata **3 detik per shot** |
| Suara | 1 narator orang pertama (voice-over, bahasa gaul Jakarta "gue/lo"), dialog karakter pendek, musik latar lembut kontinu, hampir tidak ada jeda hening |
| Teks | Subtitle "kata demi kata" 2–3 kata per potongan, huruf kapital, condensed bold |
| Akhir | Cliffhanger + kartu "BERSAMBUNG… / Bagian 2: <judul>" |

Kenapa formatnya efektif: hook judul di 0,5 detik pertama, potongan gambar cepat mengikuti
ritme narasi, subtitle besar untuk ditonton tanpa suara, dan twist di 5 detik terakhir supaya
penonton mencari bagian berikutnya.

---

## 2. Gaya visual (style bible)

### 2.1 Karakter
- **Figur blocky ala mainan bata**: kepala silinder/kotak membulat besar, rambut sebagai "blok"
  terpisah (berpotongan kotak/ikal kotak), badan kotak, lengan silinder bersendi, tangan bulat
  tanpa jari (mitten). Proporsi chibi ±2,5 kepala.
- **Wajah 2D di atas kepala 3D** (decal/tekstur yang bisa diganti): mata oval hitam dengan
  highlight putih, alis garis tebal, mulut garis pendek, **blush merah muda bulat di pipi**.
  Ekspresi = ganti tekstur wajah (netral, senyum, mata tertutup, sipit/curiga, cemas mulut
  bergelombang "~~~", kaget mulut "o", senyum licik satu sisi).
- Kulit sawo matang hangat (#C98A4B–#B8743A). Seragam SMA putih dengan **name tag hitam**
  bertuliskan nama (RAKA, DIMAS) dan **badge bintang biru-kuning** di dada → membantu penonton
  hafal nama karakter.
- Pembeda karakter dengan 1–2 aksesori kuat: kacamata bulat besar (Dimas), hijab merah marun
  (guru BK), hijab pink + headset (motivator), jas dokter + stetoskop + clipboard (dokter).
- Hewan dibuat dengan gaya sama (kucing oranye belang, blocky, wajah 2D).

### 2.2 Render & shading
- **Toon/cel shading** 2–3 tingkat + **garis outline** tipis cokelat gelap (bukan hitam pekat).
- Ambient occlusion lembut, bayangan lembut, tanpa refleksi tajam.
- **Depth of field** kuat pada close-up (latar blur) → tampak "sinematik".
- Partikel debu/bokeh kecil melayang + **film grain** halus.

### 2.3 Color grade (kunci suasana)
| Suasana | Grade |
|---|---|
| Realita (kelas) | Hangat, krem-oranye, kontras rendah, sedikit desaturasi |
| Khayalan sukses orang lain | **Vignette putih bercahaya (bloom)** di tepi frame + tint dingin (dokter: putih-teal; CEO: abu-biru; seminar: ungu-pink) |
| Khayalan diri sendiri "kosong" | Hampir putih total, latar void abu-putih, karakter kecil di tengah |
| Alasan/rencana konyol | Tint sepia + vignette krem |
| Twist/plot | Kembali ke grade hangat, kamera lebih dekat |
| End card | Frame terakhir di-blur + overlay ungu gelap (#2A2438, opacity ±80%) |

### 2.4 Set & properti
- Ruang kelas Indonesia: dinding krem, **lis dinding hijau** di bagian bawah, lantai teraso
  berbintik, meja-kursi kayu oranye dengan kaki besi hitam, jendela nako (kaca lamel), papan
  tulis putih, papan "XII IPS 3", jam dinding, mading/papan gabus berisi kertas warna.
- **Prop kertas yang terbaca** (angket) dibuat sebagai tekstur resolusi tinggi dengan tulisan
  jelas: judul, isian tulisan tangan (font handwriting biru), kolom kosong yang jadi inti cerita,
  catatan merah "Dikumpulkan paling lambat: JUMAT". Prop ini dipakai berulang untuk insert shot.
- Detail plot ditulis di dunia (diegetic text): papan tulis "ANGKET BK – Dikumpul: JUMAT",
  layar "20 PERUSAHAAN", spanduk "SEMUA ADA HARGANYA", clipboard "JADWAL … Kuliah: kedokteran ✓".

---

## 3. Bahasa kamera

- Jenis shot yang berulang: wide kelas (eye level siswa), two-shot dua sahabat sebangku,
  over-the-shoulder dari belakang siswa, **insert close-up kertas** (kamera pan pelan),
  close-up wajah, **extreme close-up wajah** (setengah wajah, untuk monolog batin), low angle
  guru/tokoh berwibawa, top-down meja.
- **Setiap shot selalu bergerak**: slow push-in, slow pan, atau drift kecil (±3–8% zoom dalam
  3 detik). Tidak ada frame benar-benar statis.
- Ritme potong mengikuti frasa narasi: ganti shot setiap 1–2 potongan subtitle (2–4 detik).
- Push-in ke wajah + mata menutup = tanda masuk khayalan (lihat transisi).
- Gerak karakter minimal tapi ada: kedip, ganti ekspresi, gigit pulpen, tangan di dagu,
  jalan masuk kelas, tunjuk ke kamera. Lip-sync cukup buka-tutup mulut sederhana.

### 3.1 Transisi
| Transisi | Cara |
|---|---|
| Cut biasa | Hard cut (mayoritas) |
| Masuk khayalan | Push-in ke wajah → mata menutup → **whip/flash putih + blur** 6–8 frame → adegan khayalan dengan vignette putih |
| "Pikiran kosong" | Extreme close-up mata → fade ke putih → void putih dengan karakter kecil |
| Keluar khayalan | Hard cut kembali ke kelas (kontras grade membuatnya lucu) |
| Ke end card | Freeze frame terakhir → blur + gelapkan → teks BERSAMBUNG muncul |

---

## 4. Teks di layar (paling penting untuk "rasa" videonya)

Semua sudah diimplementasikan di `tools/buat_subtitle.py` (format ASS untuk ffmpeg).

### 4.1 Subtitle narasi
- Font: **Oswald Bold** (alternatif: Bebas Neue / Anton). Huruf KAPITAL semua.
- Ukuran ±40 px pada lebar 720 (≈5,5% lebar frame). Putih #FFFFFF.
- Tanpa kotak; **drop shadow lembut** gelap (offset 2px, blur) + outline tipis.
- Posisi tengah horizontal, **±70% tinggi frame** (y≈900 dari 1280) — di atas area UI
  TikTok/Reels/Shorts.
- Potongan **2–3 kata**, tampil 0,5–1,5 detik, mengikuti ucapan; tiap potongan muncul
  dengan pop kecil (scale 90%→100% dalam 80 ms).
- Elipsis "…" untuk jeda dramatis ("GUE SENDIRI…", "KAMU ADA…").

### 4.2 Dialog karakter
- Teks dialog **berwarna khusus per karakter**, ditambah **chip nama kecil** di atasnya
  (kotak membulat berwarna sama, tulisan nama gelap, huruf kapital ±16 px, letter-spacing lebar).
- Warna yang dipakai referensi:
  - Narator/tokoh utama (Raka) bila bicara langsung: teks putih, chip putih.
  - Sahabat (Dimas): kuning **#FFD84A**.
  - Guru (Bu Ratna): biru muda **#A8D8F8**.
  - Tokoh khayalan (Kak Sari): lavender **#C7A4FF** (+ glow).
- Kalimat tanya tetap pakai "?" ("DARI SENIN?", "KA?").

### 4.3 Judul hook (0–0,6 detik)
- 2 baris besar di ±35% tinggi frame: baris 1 putih, baris 2 kuning (#FFD84A),
  contoh "ANGKET / CITA-CITA". Ukuran ±70 px. Hilang begitu narasi dimulai.

### 4.4 Branding / anti re-upload
- Logo teks channel kecil di kiri atas, dua warna (putih + kuning), ukuran ±18 px.
- Handle sosial media (ikon + "@namachannel") semi-transparan (±60%), **berpindah posisi
  setiap ±4–5 detik** (kiri atas, kanan atas, tengah kiri) dan ikon platform berganti
  (IG/TikTok → YouTube → FB/Threads). Ini mempersulit crop/re-upload.

### 4.5 End card
- "BERSAMBUNG…" kuning tebal ±64 px di tengah, di bawahnya "Bagian N: <Judul>" putih ±30 px,
  logo channel di bawah. Latar = frame terakhir di-blur + overlay ungu gelap. Durasi 2–3 detik.

---

## 5. Struktur cerita (template yang bisa dipakai ulang)

Pola Bagian 1 referensi (durasi ±92 detik):

| Waktu | Babak | Isi | Fungsi |
|---|---|---|---|
| 0–6 s | Hook | Tokoh bengong menatap 1 masalah konkret (kolom "Mau jadi apa?" kosong) | Masalah relatable dalam 1 kalimat |
| 6–24 s | Setup | Siapa yang memberi tugas, aturan, tenggat, ancaman ("yang kosong orang tuanya dipanggil"), hari ini sudah H-1 | Taruhan & jam berdetak |
| 24–47 s | Kontras | Khayalan orang lain yang sudah jelas masa depannya (sepupu dokter, kakak CEO → motivator) dengan detail lebay | Komedi dari pembesar-besaran |
| 47–54 s | Punchline 1 | Khayalan diri sendiri = **kosong**, "kayak TV yang sinyalnya ilang" | Gag visual |
| 54–65 s | Foil | Sahabat yang angketnya sudah penuh, dialog singkat | Kontras + dialog |
| 65–76 s | Rencana konyol | Daftar alasan (es teh tumpah / terbang ke jendela / dimakan kucing) — tiap alasan 1 shot cepat | Komedi daftar 3 |
| 76–90 s | Twist | Guru bilang angketnya "sudah masuk"… padahal belum ngumpulin… "ada **tiga**" | Cliffhanger |
| 90–92 s | End card | BERSAMBUNG… Bagian 2: Tiga Angket | Retensi serial |

Prinsip menulis naskah:
1. Narator orang pertama, bahasa santai ("gue", "lo", "kalo", "doang", "banget").
2. Kalimat pendek; tiap kalimat dipecah jadi potongan 2–3 kata untuk subtitle.
3. Aturan tiga (3 khayalan sukses / 3 alasan / 3 angket).
4. Angka & detail spesifik bikin lucu (20 perusahaan, sudah menentukan sejak kelas enam).
5. Setiap kalimat narasi harus punya gambar yang **menunjukkan** apa yang diucapkan.
6. Akhiri dengan informasi baru yang membalik situasi, bukan penutup.

---

## 6. Pipeline produksi yang direkomendasikan

Langkah (ikuti urutan ini):

1. **Naskah** → tulis narasi + dialog, lalu pecah ke `storyboard.json`
   (format lihat `contoh_storyboard.json`): daftar shot, tiap shot punya deskripsi kamera,
   grade, dan daftar baris (`narator` / nama karakter) beserta teksnya.
2. **Voice-over** → rekam sendiri atau TTS bahasa Indonesia (suara remaja laki-laki untuk
   narator; suara berbeda untuk tiap karakter). Simpan per baris (`vo/001.wav`, …).
3. **Timing** → ukur durasi tiap baris (`ffprobe`) atau pakai transkrip ber-timestamp
   (mis. Whisper word-level) lalu isi `start`/`end` tiap potongan subtitle.
4. **Aset 3D** → salah satu jalur:
   - **Blender** (disarankan): karakter low-poly blocky, material toon (Shader to RGB +
     Color Ramp konstan), outline via *Line Art* / *Solidify* flip normal, wajah sebagai
     tekstur PNG yang di-swap per ekspresi (Image Texture + driver/keyframe), DOF di kamera,
     render EEVEE 1080×1920 30 fps.
   - **Web / kode** (bila dikerjakan penuh oleh Claude): Three.js `MeshToonMaterial` +
     `OutlineEffect`, wajah sebagai `CanvasTexture`, dirender frame-per-frame dengan
     Remotion (`@remotion/three`) atau Playwright → PNG → ffmpeg.
   - Generator gambar AI per shot + animasi "Ken Burns" (push-in/pan) juga bisa sebagai
     jalur cepat; kunci konsistensi karakter dengan lembar karakter yang sama.
5. **Grade** → LUT/kurva hangat untuk realita; untuk khayalan tambahkan vignette putih
   (ffmpeg: `vignette` + `colorbalance` atau layer PNG gradien radial putih).
6. **Subtitle & branding** → `python3 tools/buat_subtitle.py storyboard.json -o subs.ass`
   lalu bakar: `ffmpeg -i video.mp4 -vf "ass=subs.ass" -c:a copy hasil.mp4`.
7. **Audio mix** → VO −14 LUFS-ish, musik latar −28 dB di bawah VO (ducking), SFX kecil
   (pop pada judul, whoosh pada transisi khayalan, "tring" pada twist).
8. **End card** → lihat perintah ffmpeg di `tools/README.md`.
9. **Cek akhir**: tidak ada frame statis > 1 detik, subtitle tidak tertutup UI aplikasi
   (aman di area y 15%–80%), teks prop terbaca saat dijeda, total ≤ 95 detik.

---

## 6b. Jalur yang sudah terbukti: mesin 3D berbasis kode
Untuk mengubah voice-over menjadi animasi sepenuhnya oleh Claude, pakai `engine/` (lihat `engine/README.md`).
Contoh produksi lengkap 3 episode (drama misteri "Grup Kelas": Jangan Buka Grup Kelas / Yang Ada di Luar Bingkai /
Teman Sebangku) ada di `produksi/` dan `engine/episodes/ep1-3.js`. Pola visual yang dipakai:
layar ponsel (chat, notifikasi, video) sebagai penggerak cerita, rekaman HP dengan grade `rekaman`,
kenangan dengan vignette putih, dialog dengan chip nama berwarna, kartu BERSAMBUNG/SELESAI.

## 7. Checklist cepat saat membuat episode baru

- [ ] Hook judul 2 baris (putih + kuning) di 0,5 detik pertama
- [ ] Masalah + tenggat + ancaman jelas dalam 20 detik pertama
- [ ] Setidaknya 1 sekuens khayalan dengan grade berbeda + vignette putih
- [ ] Satu gag visual "lebay" dan satu daftar-tiga
- [ ] Dialog pakai warna + chip nama per karakter (konsisten antar episode!)
- [ ] Prop kertas/layar dengan tulisan yang mendukung plot
- [ ] Semua shot bergerak pelan; ganti shot tiap 2–4 detik
- [ ] Handle sosial media berpindah posisi tiap ±5 detik
- [ ] Twist di 10 detik terakhir + kartu BERSAMBUNG dengan judul bagian berikutnya
- [ ] Brand/karakter milik sendiri, bukan milik channel referensi
