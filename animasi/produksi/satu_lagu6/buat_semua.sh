#!/usr/bin/env bash
# Render 6 bagian "Satu Lagu" (versi 6 bagian): 3 paralel x 2 gelombang. Jalankan dari animasi/produksi.
cd "$(dirname "$0")/.."
M=satu_lagu/musik_between_two_heartbeats.mp3
J=("" "Bagian 1 Vokalis Dadakan" "Bagian 2 Latihan yang Berantakan" "Bagian 3 Pesan dari Nava" "Bagian 4 Senar Pinjaman" "Bagian 5 Tiga Ratus Pasang Mata" "Bagian 6 Satu Lagu")
for g in "1 2 3" "4 5 6"; do
  for i in $g; do ./buat_video_resume.sh sv$i satu_lagu6/vo$i.mp3 "Satu Lagu (6) - ${J[$i]}" $M > tmp_sv$i.log 2>&1 & done; wait
done
echo SEMUA_SELESAI
