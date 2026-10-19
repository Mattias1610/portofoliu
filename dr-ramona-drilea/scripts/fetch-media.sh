#!/usr/bin/env bash
# Downloads the three Seedance 2.0 clips generated for this site from the
# Higgsfield CDN and rebuilds assets/media with build-media.sh.
#
# Usage (from the dr-ramona-drilea folder): scripts/fetch-media.sh
set -euo pipefail

CDN=https://d8j0ntlcm91z4.cloudfront.net/user_396gKYuRBkX0ZdORkAwd74zLFKD
SRC=${MEDIA_SRC_DIR:-media-src}
mkdir -p "$SRC"

# Reference images (kept for the record, not used by the site)
#   A  room     hf_20261019_215422_af162506-d3e0-4277-baff-c5a47fb60258.png
#   B  implant  hf_20261019_215423_dcac68d6-e53b-4625-b4fc-f7de5c36a6b1.png
curl -fSL -o "$SRC/clip1-hero.mp4"    "$CDN/hf_20261019_220151_caabae34-e9e1-4039-b015-c002990fc3a4.mp4"
curl -fSL -o "$SRC/clip2-implant.mp4" "$CDN/hf_20261019_220151_668ee27b-8522-437d-955d-8c707cc8f9ea.mp4"
curl -fSL -o "$SRC/clip3-smile.mp4"   "$CDN/hf_20261019_220137_1550e6fe-1f08-4d8f-b317-a27d8d3ab7f4.mp4"
curl -fSL -o "$SRC/ref-a-room.png"    "$CDN/hf_20261019_215422_af162506-d3e0-4277-baff-c5a47fb60258.png"
curl -fSL -o "$SRC/ref-b-implant.png" "$CDN/hf_20261019_215423_dcac68d6-e53b-4625-b4fc-f7de5c36a6b1.png"

"$(dirname "$0")/build-media.sh" "$SRC/clip1-hero.mp4" "$SRC/clip2-implant.mp4" "$SRC/clip3-smile.mp4" assets/media
