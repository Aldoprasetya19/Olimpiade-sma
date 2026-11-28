#!/usr/bin/env bash
# Seperti buat_video.sh tetapi render per potongan 20 dtk yang bisa dilanjutkan bila kontainer restart.
# Pemakaian: ./buat_video_resume.sh ep vo.mp3 "Judul" [musik.mp3]
set -euo pipefail
cd "$(dirname "$0")"
EP=$1; VO=$2; NAME=$3; MUSIK=${4:-}
mkdir -p ../output tmp/$EP
DUR=$(node -e "const s=require('fs').readFileSync('../engine/episodes/$EP.js','utf8');const m=s.match(/\"duration\": ([0-9.]+)/);console.log(m?m[1]:'')")
N=$(python3 -c "import math;print(math.ceil($DUR/20))")
: > tmp/$EP/list.txt
for ((k=0;k<N;k++)); do
  a=$((k*20)); b=$(python3 -c "print(min($DUR,($k+1)*20))"); f=tmp/$EP/p$(printf %03d $k).mp4
  if [ ! -s "$f" ]; then node ../engine/render.cjs "$EP" "$f.tmp.mp4" 30 $a $b && mv "$f.tmp.mp4" "$f"; fi
  echo "file 'p$(printf %03d $k).mp4'" >> tmp/$EP/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i tmp/$EP/list.txt -c copy "tmp/${EP}_video.mp4"
python3 ../tools/mix_audio.py "$EP" "$VO" "$DUR" "tmp/${EP}_audio.wav" $MUSIK
ffmpeg -v error -y -i "tmp/${EP}_video.mp4" -i "tmp/${EP}_audio.wav" \
  -filter_complex "[1:a]aresample=48000,loudnorm=I=-15:TP=-1.5:LRA=11[a];[0:v]ass=${EP}.ass:fontsdir=../tools/fonts[v]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "../output/${NAME}.mp4"
echo "Selesai: output/${NAME}.mp4"
