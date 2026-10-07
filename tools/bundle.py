#!/usr/bin/env python3
"""Fabrique des aperçus autonomes : une page = un seul fichier HTML (CSS, JS, polices,
images et vidéo intégrés), qu'on peut ouvrir d'un clic sans serveur.

Usage : python3 tools/bundle.py            -> apercu/milano-*.html

Les aperçus ne remplacent pas le site : ils sont plus lourds (tout est intégré)
et servent seulement à montrer le travail. Le dossier apercu/ n'est pas versionné.
"""
import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'apercu'
PAGES = {
    'index.html': 'milano-accueil.html',
    'atelier.html': 'milano-atelier.html',
    'boutique.html': 'milano-boutique.html',
    'contact.html': 'milano-contact.html',
}
_cache = {}


def data_uri(rel: str) -> str:
    rel = rel.split('#')[0].split('?')[0].lstrip('/')
    if rel not in _cache:
        path = ROOT / rel
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        if path.suffix == '.woff2':
            mime = 'font/woff2'
        if path.suffix == '.avif':
            mime = 'image/avif'
        if path.suffix == '.webp':
            mime = 'image/webp'
        _cache[rel] = f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()
    return _cache[rel]


def pick_src(srcset: str) -> str:
    """Garde une seule largeur (la plus proche de 1000 px) pour alléger l'aperçu."""
    cands = []
    for part in srcset.split(','):
        bits = part.strip().split()
        w = int(bits[1][:-1]) if len(bits) > 1 and bits[1].endswith('w') else 0
        cands.append((abs(w - 1000) if w else 0, -w, bits[0]))
    return sorted(cands)[0][2]


def bundle(src_name: str, out_name: str):
    html = (ROOT / src_name).read_text(encoding='utf-8')

    # Feuille de styles + polices
    css = (ROOT / 'assets/css/main.css').read_text(encoding='utf-8')
    css = re.sub(r"url\('\.\./fonts/([^']+)'\)", lambda m: f"url('{data_uri('assets/fonts/' + m.group(1))}')", css)
    html = html.replace('<link rel="stylesheet" href="assets/css/main.css">', f'<style>{css}</style>')
    html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)

    # Images : on retire les variantes AVIF (doublons) et on réduit chaque srcset à une seule image
    html = re.sub(r'\s*<source type="image/avif"[^>]*>', '', html)

    # Dans chaque <picture>, la source WebP sans media remplace le JPEG de repli (une seule copie)
    def one_copy(m):
        block = m.group(0)
        src = re.search(r'<source type="image/webp" srcset="([^"]+)"[^>]*>', block)
        if not src:
            return block
        block = block.replace(src.group(0), '')
        return re.sub(r'(<img[^>]*?\s)src="[^"]+"', lambda i: f'{i.group(1)}src="{pick_src(src.group(1))}"', block, count=1)
    html = re.sub(r'<picture>.*?</picture>', one_copy, html, flags=re.S)
    html = re.sub(r'(<source[^>]*?)\s(srcset)="(?!data:)([^"]+)"(?:\s+sizes="[^"]*")?', lambda m: f'{m.group(1)} srcset="{data_uri(pick_src(m.group(3)))}"', html)
    html = re.sub(r'\ssrcset="(?!data:)([^"]+)"(?:\s+sizes="[^"]*")?', lambda m: f' srcset="{data_uri(pick_src(m.group(1)))}"', html)
    html = re.sub(r'(src|href)="(assets/(?:img|fonts)/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)

    # Scripts
    def js(rel):
        return (ROOT / rel).read_text(encoding='utf-8')

    hero = js('assets/js/hero.js')
    if 'hero.js' in html:
        video = data_uri('assets/video/hero-scrub.webm')
        hero = hero.replace("'assets/video/hero-scrub.webm'", f"'{video}'").replace("'assets/video/hero-scrub.mp4'", "''")
        hero = hero.replace("'assets/img/hero-start.jpg'", f"'{data_uri('assets/img/hero-start.jpg')}'")
        hero = hero.replace("'assets/img/hero-end-1600.jpg'", f"'{data_uri('assets/img/hero-end-1600.jpg')}'")
        hero = hero.replace("const WEBM = ", "const WEBM = true || ")
    boutique = re.sub(r'^import .*?;\n', '', js('assets/js/boutique.js'), flags=re.M)
    catalogue = js('assets/js/catalogue.js').replace('export ', '')
    scripts = {
        '<script src="assets/js/main.js" defer></script>': f'<script>{js("assets/js/main.js")}</script>',
        '<script src="assets/js/hero.js" defer></script>': f'<script>{hero}</script>',
        '<script type="module" src="assets/js/diagnostic.js"></script>': f'<script type="module">{js("assets/js/diagnostic.js")}</script>',
        '<script type="module" src="assets/js/boutique.js"></script>': f'<script type="module">{catalogue}\n{boutique}</script>',
        '<script src="assets/js/contact.js" defer></script>': f'<script>{js("assets/js/contact.js")}</script>',
    }
    # main.js/hero.js/contact.js étaient en defer : on les place en fin de body (déjà le cas)
    for k, v in scripts.items():
        html = html.replace(k, v.replace('</script>', '</script>', 1))

    # Liens entre pages -> fichiers d'aperçu ; les autres pages restent sur le site
    for src, dst in PAGES.items():
        html = re.sub(rf'href="{re.escape(src)}((?:[#?][^"]*)?)"', rf'href="{dst}\1"', html)
    html = html.replace('<head>', '<head>\n<!-- Aperçu autonome généré par tools/bundle.py : ne pas publier tel quel -->', 1)

    OUT.mkdir(exist_ok=True)
    (OUT / out_name).write_text(html, encoding='utf-8')
    return (OUT / out_name).stat().st_size


if __name__ == '__main__':
    for s, d in PAGES.items():
        print(f'{d}: {bundle(s, d) / 1e6:.1f} Mo')
