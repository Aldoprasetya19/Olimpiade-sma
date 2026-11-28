#!/usr/bin/env bash
# Teaser musik "Es Teh Boba Sultan: Liburan Bersama" (episode tz1, lagu sebagai audio utama).
# Pemakaian (dari mana saja):
#   ./buat_teaser.sh          → output/Teaser Es Teh Boba Sultan - Liburan Bersama.mp4 (potret 720x1280)
#   ./buat_teaser.sh --land   → output/Teaser Es Teh Boba Sultan - Liburan Bersama (Landscape).mp4 (1280x720)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p ../output tmp
if [ "${1:-}" = "--land" ]; then export LAND=1; P=tz1L; ASS=tz1_land.ass; NAME="Teaser Es Teh Boba Sultan - Liburan Bersama (Landscape)"; python3 teaser/lirik_tz1.py --land
else unset LAND || true; P=tz1; ASS=tz1.ass; NAME="Teaser Es Teh Boba Sultan - Liburan Bersama"; python3 teaser/lirik_tz1.py; fi
for r in "0 60 a" "60 120 b" "120 178.5 c"; do set -- $r; node ../engine/render.cjs tz1 "tmp/${P}_$3.mp4" 30 $1 $2 & done; wait
printf "file '${P}_a.mp4'\nfile '${P}_b.mp4'\nfile '${P}_c.mp4'\n" > tmp/${P}_list.txt
ffmpeg -v error -y -f concat -safe 0 -i tmp/${P}_list.txt -c copy tmp/${P}_video.mp4
ffmpeg -v error -y -i tmp/${P}_video.mp4 -i teaser/lagu_es_teh_plastikan.mp3 \
  -filter_complex "[1:a]aresample=48000,afade=t=out:st=175.5:d=3,loudnorm=I=-14:TP=-1.5:LRA=11[a];[0:v]ass=${ASS}:fontsdir=../tools/fonts[v]" \
  -map "[v]" -map "[a]" -t 178.5 -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \
  "../output/${NAME}.mp4"
echo "Selesai: output/${NAME}.mp4"
