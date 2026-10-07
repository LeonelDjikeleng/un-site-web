#!/usr/bin/env python3
"""Prépare les médias du site à partir des rendus du studio 3D (tools/studio).

Usage : python3 -I tools/process_media.py <dossier_rendus_hero> <dossier_rendus_fixes>

Produit dans assets/img/ : AVIF + WebP + JPEG à plusieurs largeurs (balises <picture>),
et dans assets/video/ : la vidéo défilée (H.264, image clé toutes les 8 images).
"""
import pathlib
import subprocess
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
VID = ROOT / 'assets' / 'video'

# nom du rendu -> largeurs servies (le JPEG de repli est produit pour la plus grande largeur
# et pour celles qui sont citées dans le HTML)
STILLS = {
    'hero-mobile': [720, 1080],
    'detail-roue': [600, 1000],
    'roue-face': [600, 1000],
    'roue-rasante': [600, 1000],
    'finition': [600, 1000],
    'echappement': [600, 1000],
    'goutte': [600, 1000],
    'profil': [960, 1600, 2400],
    'arriere': [960, 1600, 2400],
}


def save_set(im: Image.Image, name: str, widths, jpeg_widths=None):
    im = im.convert('RGB')
    for w in widths:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        r.save(IMG / f'{name}-{w}.avif', quality=58, speed=4)
        r.save(IMG / f'{name}-{w}.webp', quality=78, method=6)
        if jpeg_widths is None or w in jpeg_widths:
            r.save(IMG / f'{name}-{w}.jpg', quality=80, optimize=True, progressive=True)


def main(hero_dir: pathlib.Path, stills_dir: pathlib.Path):
    IMG.mkdir(parents=True, exist_ok=True)
    VID.mkdir(parents=True, exist_ok=True)

    frames = sorted(hero_dir.glob('*.jpg'))
    if frames:
        subprocess.run([
            'ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', str(hero_dir / '%04d.jpg'),
            '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-tune', 'film', '-g', '8', '-keyint_min', '8',
            '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', str(VID / 'hero-scrub.mp4'),
        ], check=True)
        subprocess.run([
            'ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', str(hero_dir / '%04d.jpg'),
            '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '33', '-g', '8', '-keyint_min', '8', '-row-mt', '1',
            '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', str(VID / 'hero-scrub.webm'),
        ], check=True)
        first = Image.open(frames[0]).convert('RGB')
        first.save(IMG / 'hero-start.jpg', quality=78, optimize=True, progressive=True)
        save_set(Image.open(frames[-1]), 'hero-end', [960, 1600, 1920], jpeg_widths=[1600])

    # JPEG de repli : seulement aux largeurs citées dans le <img> du HTML
    jpeg = {'hero-mobile': [], 'profil': [1600], 'arriere': [1600]}
    for name, widths in STILLS.items():
        src = next(iter(stills_dir.glob(f'{name}.*')), None)
        if src:
            save_set(Image.open(src), name, widths, jpeg_widths=jpeg.get(name, [1000]))

    og = stills_dir / 'og.jpg'
    if og.exists():
        Image.open(og).convert('RGB').save(IMG / 'og.jpg', quality=82, optimize=True, progressive=True)

    plan = stills_dir / 'plan.png'
    if plan.exists():
        # traits clairs sur noir -> traits sur transparent (la luminosité devient l'opacité)
        import numpy as np
        from PIL import ImageFilter
        # épaissit les traits (1 px en WebGL) pour qu'ils restent nets une fois réduits
        a = np.asarray(Image.open(plan).convert('RGB').filter(ImageFilter.MaxFilter(3))).astype(np.float32)
        alpha = a.max(axis=2)
        rgb = np.where(alpha[..., None] > 0, a * 255.0 / np.maximum(alpha[..., None], 1), 0)
        alpha = np.clip(alpha * 1.25, 0, 255)
        out = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
        for w in (1800,):
            h = round(out.height * w / out.width)
            out.resize((w, h), Image.LANCZOS).save(IMG / f'plan-{w}.webp', quality=86, method=6)


if __name__ == '__main__':
    main(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]))
