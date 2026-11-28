#!/usr/bin/env bash
# Teaser musik "Es Teh Boba Sultan: Liburan Bersama" (episode tz1, lagu sebagai audio utama).
# Pemakaian (dari folder produksi/teaser): ./buat_teaser.sh   → ../../output/Teaser Es Teh Boba Sultan - Liburan Bersama.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p ../output tmp
python3 teaser/lirik_tz1.py
for r in "0 60 a" "60 120 b" "120 178.5 c"; do set -- $r; node ../engine/render.cjs tz1 "tmp/tz1_$3.mp4" 30 $1 $2 & done; wait
printf "file 'tz1_a.mp4'\nfile 'tz1_b.mp4'\nfile 'tz1_c.mp4'\n" > tmp/tz1_list.txt
ffmpeg -v error -y -f concat -safe 0 -i tmp/tz1_list.txt -c copy tmp/tz1_video.mp4
ffmpeg -v error -y -i tmp/tz1_video.mp4 -i teaser/lagu_es_teh_plastikan.mp3 \
  -filter_complex "[1:a]aresample=48000,afade=t=out:st=175.5:d=3,loudnorm=I=-14:TP=-1.5:LRA=11[a];[0:v]ass=tz1.ass:fontsdir=../tools/fonts[v]" \
  -map "[v]" -map "[a]" -t 178.5 -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \
  "../output/Teaser Es Teh Boba Sultan - Liburan Bersama.mp4"
echo "Selesai"
