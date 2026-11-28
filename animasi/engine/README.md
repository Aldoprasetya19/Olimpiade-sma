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

### Aturan otomatis tambahan (revisi pengguna, berlaku untuk semua cerita)
- **Kamar & meja belajar**: adegan `[rumah]` yang barisnya menyebut laptop/menulis/mengetik/belajar/mengerjakan/esai/tugas
  otomatis pindah ke lokasi `kamar` (meja belajar + laptop). Kata *laptop/layar* → kamera `laptop` dari belakang-samping
  tokoh sehingga layar terlihat; isi layar mengikuti cerita (kosong / jawaban AI / tulisan sendiri).
- **Tidur**: kata *tidur/tertidur* → shot dipotong tepat di kata itu dan tokoh terlihat berbaring di kasur berselimut.
- **Jam & hari di HP**: diambil dari narasi (*pukul 11* + *malam* → 23.00; pagi/istirahat/siang/sore/malam; nama hari),
  bertambah 1 menit tiap layar HP. `Nama@23.47` di naskah tetap bisa memaksa jam tertentu.
- **Maju ke depan kelas**: murid yang duduk + *berjalan/maju ke depan* → berdiri dari kursi, bergeser ke lorong,
  berjalan ke depan, lalu berbalik menghadap kelas (kamera `kedepan` dari sisi kelas).
- **Menatap teman / saling pandang**: tokoh menoleh ke teman yang disebut, atau ke teman terdekat.
- **Masuk lewat pintu** hanya untuk *masuk/datang/tiba*; *berjalan/maju* biasa tidak memakai pintu.
- **Kaget**: kata *kaget/terkejut/tersentak/terperanjat* di narasi → ekspresi kaget untuk tokoh yang disebut (atau semua tokoh di adegan).
- **Ketiduran di meja**: *ketiduran/terlelap* atau *dahinya menyentuh meja* → kepala tertunduk di meja sampai ada kata *bangun*.
- **Muncul di pintu**: *muncul di pintu* → berjalan masuk dari pintu.
- **Negasi**: kata kerja yang didahului *tidak/nggak/gak/belum/jangan* tidak memicu aksi (mis. "tidak langsung pulang", "gak bisa tidur").
- **Jam HP**: dibaca dari narasi di luar kutipan; *jam 3 lewat 12* → 03.12; *sepulang sekolah* → 14.30; *tadi sore/besok pagi* diabaikan.
- **Game di HP**: kata *match/game/mabar/rank/carry* → mode game; HP dipegang dua tangan dan close-up HP **landscape**
  dengan layar game. *Match ... menang/kalah* → layar "MENANG!"/"KALAH".
- **Ucapan lewat HP**: dialog dari tokoh yang tidak ada di adegan (mis. teriakan di grup) → tampil tokoh yang bicara di
  kamarnya sambil memegang HP → layar pesan/notifikasi → tokoh yang mendengar kaget melihat HP.
- **Kelas penuh**: saat jam pelajaran semua bangku kosong diisi murid figuran yang duduk; kelas jadi sepi otomatis bila
  narasi menyebut *istirahat/sepulang/pulang/remedial/sepi* (atau `{sepi}` lewat kata itu).
- **Belajar bersama**: *belajar bersama/bareng/dengan/di ..., kerja kelompok* → adegan belajar bersama: *di rumah X* →
  meja rumah (tuan rumah berbaju rumah), selain itu di kelas yang sepi; tokoh yang disebut setelah *bersama* menjelaskan.
- **Mimik dari kata sifat**: menguap/mengantuk/lelah → ngantuk, tidak enak/sungkan/canggung → sungkan, malu, bingung/heran,
  gugup/cemas/khawatir/takut, sedih/murung/kusut, menangis, kecewa, marah/kesal, senang/gembira/bersorak, lega,
  menyesal, menelan ludah → cemas (ekspresi yang ditulis eksplisit di naskah tetap dipakai).
- Kursi meja belajar kamar menghadap meja (sandaran di belakang tokoh).

### Motor, jalan, hujan, gubuk, bengkel (seri "Urusan Gelly")
- Lokasi: `jalanAspal`, `jalanTanah` (kebun kelapa), `jalanBerhenti` (ban kempis), `jalanMendung` (hujan), `gubuk` (hujan,
  motor tua datang), `bengkel`, `bengkel5` (lima motor), `jalanBukit` (lima motor menuju bukit), kamar `pinggirKasur`.
- Slot motor: `motor1Depan/motor1Belakang/motor2Depan/motor2Belakang` (berboncengan). **Helm**: semua tokoh di lokasi `jalan*` (melaju, berhenti, hujan) otomatis memakai helm, `motor1Depan..motor5Depan`.
- Kamera: `{riding}` iring-iringan motor, `{ban}` close-up roda belakang, `{motorTua}` jok belakang motor tua, `{pengendara}` wajah
  pengendara motor tua. Flag `(oleng)` = motor oleng & berhenti. Pose: `datangMotor`, `lepasHelm`, `jongkok`, `perbaiki` (kunci pas),
  `teh` (minum teh), `pinggang` (sakit pinggang). Varian `gelly#jas` = jas hujan kuning.
- HP: `{hp-lokasi}` live location / peta (`[Peta | ...]` menampilkan titik bengkel), `{hp-status} [Baterai | 8%]` / `[Sinyal | 1]`.
- Telepon: setelah narasi *menelepon*, ucapan tokoh di seberang tampil dengan pose menelepon; flag `(tanpa)` = jangan tampilkan pembicara.
- Animasi yang memakai seluruh durasi kalimat (motor datang, lepas helm) tetap mulus meski shot dipecah.
- **Pakaian**: di lokasi sekolah (kelas, koridor, kantin, lobi, gudang, gerbang, lapangan, ruang guru) tokoh siswa berseragam;
  di lokasi lain (rumah, kamar, jalan, gubuk, bengkel, toko, kafe) otomatis **baju santai** dengan warna tetap per tokoh
  (`BAJU` di `lib/cast.js`), tanpa papan nama/lencana. Paksa seragam di luar sekolah dengan `nama#seragam`.
- **Suhu**: `{kertas} [34°C | keterangan]` tampil sebagai **termometer** (tabung, cairan merah naik, layar digital); angka/uang
  (`[100 | ...]`, `[200.000 | ...]`, `[Rp7.000 | ...]`) tampil besar merah di kertas.
- **Suara**: `(sfx=nama@kata+nama2)` di naskah menaruh efek suara pada kata tersebut (daftar nama di `tools/sfx.py`);
  `(ledakan@kata)` = kilat + asap di mesin boba. `produksi/buat_video.sh ep vo.mp3 Judul musik.mp3` mencampur VO, musik latar
  (dikecilkan & ducking saat ada suara) dan SFX.

## Teaser / video musik (contoh: `episodes/tz1.js`)
Dipakai jika pengguna memberi **lagu + panduan bagian (timestamp)**, bukan VO cerita. Episode ditulis tangan (bukan `autoEpisode`):
- Pembungkus `shot(t0, t1, grade, build, {fadeOut})` menambah **letterbox** (bar hitam 150 px) dan **kartu judul** (`KARTU`: teks Oswald di tengah, layar belakang digelapkan + blur) otomatis per waktu global.
- Set baru di `lib/sets.js`: `busDalam` (interior bus, kursi baris z=-5+1,6r, x ±1,0/±1,9, bangku belakang z=4,6, pohon lewat di grup `gerak` sumbu z), `bus()` (prop, pintu `pintuBus`), `gerbangBus`, `pantai` (ombak bergerak, sumber laut di -z), `kemah` (senja, air terjun bertekstur bergulir `airTerjun`, panggangan `grill`, tenda), `apiUnggun` (malam, `nyala`, `cahayaApi`, percikan `userData.percik`, bintang).
- Grade baru: `pantai`, `senja`, `unggun`. Pose baru: `lambai`, `tepukTangan`, `kipas`, `rangkul`.
- Tokoh ukuran ±2,3 m: untuk video vertikal, dua orang butuh jarak kamera ≥5 m (fov 40); spanduk 3–4 m butuh ≥10 m.
- Lirik: `produksi/teaser/lirik_tz1.py` → `produksi/tz1.ass` (waktu dari transkrip whisper lagu). Rakit: `produksi/teaser/buat_teaser.sh` (render 3 bagian paralel → concat → lagu + lirik); `--land` untuk versi landscape 1280x720.
- **Landscape**: `LAND=1 node render.cjs ...` (core.js membaca `?land=1` → W=1280,H=720). Di tz1, letterbox 88 px, fov kamera ×1,2, dan penumpang terdekat disembunyikan di close-up bus. Video musik/teaser dengan banyak tokoh lebih cocok landscape.

### Band, studio musik, panggung pentas (seri "Satu Lagu")
- Lokasi: `studio` (slot `vokal`, `gitaris`, `bassis`, `keyboardis`, `drummer` duduk, `sudut`, `depanSudut`; pintu di dinding kanan),
  `panggung` (malam, lampu warna-warni bergerak, penonton), `panggungSorot` (lampu redup + satu sorot di tengah), `panggungGelap`
  (sorot + beberapa senter), `panggungSenter` (lautan senter HP), slot penonton baris depan `d1..d12`, `sisiPanggung`;
  `belakangPanggung` (tirai hitam, jalan ke gerbang belakang; slot `tunggu`, `kiri`, `kanan`, `menuju`, `penahan`).
- Pose alat (bergerak otomatis, `ceria` = lebih cepat, `diam` = berhenti main): `gitarBerdiri` (gitar listrik), `bass`, `drum` (stik),
  `keyboard`, `vokal` (di mic stand), `micDua` (pegang mic), `gemetar` (lutut & tangan bergetar), `senter` (HP + lampu menyala).
  Pose statis: `angkat` (ampli), `sodorMic`, `ngeri`, `garuk`, `telinga`, `tunjukMata`, `jempol`, `peluk`, `usap`, `lehar` (pegang leher).
- Varian tokoh `nava#syal` = memakai syal. Barang `mikrofon` bisa disodorkan (aksi *menyodorkan*).
- Kamera: `{penonton}` (dari belakang kerumunan ke panggung), `{barisDepan}` (dari panggung ke penonton baris depan),
  `{sorot}` (penyanyi di bawah sorot), `{drummer:nama}`; lokasi bisa punya `lebarCam`/`masukCam` tetap. Tinggi panggung (slot ke-5)
  ikut dihitung untuk close-up.
- SFX baru: `dengung` (feedback pengeras suara), `simbal`. *masuk dengan ...* dan *musik terus berjalan* tidak memicu aksi berjalan.
