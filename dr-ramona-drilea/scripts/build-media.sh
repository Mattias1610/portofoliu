#!/usr/bin/env bash
# Turns the three Seedance clips into web-ready media:
#   - clip 1 (hero) and clip 2 (implant) -> WebP frame sequences for canvas scrubbing,
#     one landscape set for desktop and one portrait crop for phones
#   - clip 3 (smile) -> compressed MP4 + WebM, desktop and portrait, with poster frames
#
# Usage: scripts/build-media.sh clip1.mp4 clip2.mp4 clip3.mp4 [out-dir]
# Needs ffmpeg with libwebp, libx264 and libvpx-vp9.
set -euo pipefail

HERO_SRC=${1:?clip 1 (hero) missing}
IMPLANT_SRC=${2:?clip 2 (implant) missing}
SMILE_SRC=${3:?clip 3 (smile) missing}
OUT=${4:-assets/media}

ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

sequence() { # src out-dir fps filter quality
  rm -rf "$2" && mkdir -p "$2"
  ff -i "$1" -an -vf "fps=$3,$4" -c:v libwebp -quality "$5" -compression_level 6 -preset photo "$2/%03d.webp"
  ls "$2" | wc -l | tr -d ' '
}

# Sources are 1920x1080. Portrait crops keep the subject centred:
#   hero    9:16 around the chair (centre of frame)
#   implant 4:5 around the finished tooth (x ~ 0.48)
#   smile   9:16 around the face (x ~ 0.66)
echo "hero desktop:   $(sequence "$HERO_SRC" "$OUT/hero/d" 12 'scale=1600:900:flags=lanczos' 58) frames"
echo "hero mobile:    $(sequence "$HERO_SRC" "$OUT/hero/m" 12 'crop=608:1080:656:0,scale=540:960:flags=lanczos' 60) frames"
echo "implant desktop: $(sequence "$IMPLANT_SRC" "$OUT/implant/d" 15 'scale=1280:720:flags=lanczos' 64) frames"
echo "implant mobile:  $(sequence "$IMPLANT_SRC" "$OUT/implant/m" 12 'crop=864:1080:490:0,scale=640:800:flags=lanczos' 62) frames"

mkdir -p "$OUT/smile"
SMILE_D='scale=1280:720:flags=lanczos'
SMILE_M='crop=608:1080:950:0,scale=540:960:flags=lanczos'
x264=(-c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -movflags +faststart -an)
vp9=(-c:v libvpx-vp9 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -an)
ff -i "$SMILE_SRC" -vf "$SMILE_D" "${x264[@]}" -crf 23 "$OUT/smile/smile.mp4"
ff -i "$SMILE_SRC" -vf "$SMILE_D" "${vp9[@]}" -crf 33 "$OUT/smile/smile.webm"
ff -i "$SMILE_SRC" -vf "$SMILE_M" "${x264[@]}" -crf 24 "$OUT/smile/smile-m.mp4"
ff -i "$SMILE_SRC" -vf "$SMILE_M" "${vp9[@]}" -crf 34 "$OUT/smile/smile-m.webm"
ff -i "$SMILE_SRC" -vf "$SMILE_D" -frames:v 1 -q:v 4 "$OUT/smile/poster.jpg"
ff -i "$SMILE_SRC" -vf "$SMILE_M" -frames:v 1 -q:v 4 "$OUT/smile/poster-m.jpg"
ff -sseof -0.1 -i "$SMILE_SRC" -vf "$SMILE_D" -frames:v 1 -q:v 4 "$OUT/smile/end.jpg"
ff -sseof -0.1 -i "$SMILE_SRC" -vf "$SMILE_M" -frames:v 1 -q:v 4 "$OUT/smile/end-m.jpg"

du -sh "$OUT"/*/ "$OUT"/*/*/ 2>/dev/null || true
