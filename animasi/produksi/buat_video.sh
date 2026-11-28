#!/usr/bin/env bash
# Pemakaian: ./buat_video.sh ep1 <file_vo.mp3> <judul_file> [musik_latar.mp3]
# Hasil: output/<judul_file>.mp4 (render 3D + VO + musik latar (ducking) + SFX dari <ep>_sfx.json + subtitle)
set -euo pipefail
cd "$(dirname "$0")"
EP=$1; VO=$2; NAME=$3; MUSIK=${4:-}
mkdir -p ../output tmp
node ../engine/render.cjs "$EP" "tmp/${EP}_video.mp4" 30
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "tmp/${EP}_video.mp4")
python3 ../tools/mix_audio.py "$EP" "$VO" "$DUR" "tmp/${EP}_audio.wav" $MUSIK
ffmpeg -v error -y -i "tmp/${EP}_video.mp4" -i "tmp/${EP}_audio.wav" \
  -filter_complex "[1:a]aresample=48000,loudnorm=I=-15:TP=-1.5:LRA=11[a];[0:v]ass=${EP}.ass:fontsdir=../tools/fonts[v]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "../output/${NAME}.mp4"
echo "Selesai: output/${NAME}.mp4"
