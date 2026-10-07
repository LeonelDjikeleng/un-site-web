#!/bin/bash
# Rend toutes les images fixes du site dans out/stills (serveur local sur :8899 requis).
cd "$(dirname "$0")"
mkdir -p out/stills
run() { ONLY=$1 timeout 1200 node run.mjs $2 out/stills $3 $4 2>&1 | tail -1; }
run plan bp.mjs 2400 923
run echappement props.mjs 1600 1600
run goutte props.mjs 1600 1600
run hero-mobile mobile.mjs 1080 2000
run detail-roue stills.mjs 1200 1500
run roue-face stills.mjs 1600 1600
run roue-rasante stills.mjs 1600 1600
run finition stills.mjs 1600 1600
run profil stills.mjs 2400 1200
run arriere stills.mjs 2400 1350
run og stills.mjs 1200 630
