#!/usr/bin/env python3
"""Fabrique des aperçus autonomes : une page = un seul fichier HTML (CSS, JS, polices,
images et vidéo intégrés), qu'on peut ouvrir d'un clic sans serveur.

Usage : python3 tools/bundle.py            -> apercu/milano-*.html

Les aperçus ne remplacent pas le site : ils sont plus lourds (tout est intégré)
et servent seulement à montrer le travail. Le dossier apercu/ n'est pas versionné.
"""
import base64
import html as htmllib
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


def prep_hero(js: str) -> str:
    """hero.js autonome : vidéos (ordinateur + verticale) et images intégrées, WebM imposé.
    Version ordinateur allégée pour l'aperçu (1280 px, hero-scrub-apercu.webm) : fichier plus court à ouvrir."""
    js = re.sub(r"const VIDEO_URL = [^;]+;",
                lambda _m: "const VIDEO_URL = TALL ? '%s' : '%s';" % (data_uri('assets/video/hero-scrub-m.webm'), data_uri('assets/video/hero-scrub-apercu.webm')), js)
    js = js.replace('const WEBM = ', 'const WEBM = true || ')
    return re.sub(r"'(assets/img/[^']+)'", lambda m: f"'{data_uri(m.group(1))}'", js)


def module(*rels: str) -> str:
    """Modules ES réunis en un seul script : imports retirés, exports rendus locaux."""
    out = []
    for rel in rels:
        src = (ROOT / rel).read_text(encoding='utf-8')
        src = re.sub(r'^import .*?;\n', '', src, flags=re.M)
        out.append(re.sub(r'^export ', '', src, flags=re.M))
    return '\n'.join(out)


def _attr(text: str) -> str:
    text = re.sub(r'\s+', ' ', htmllib.unescape(re.sub(r'<[^>]+>', '', text))).strip()
    return text.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def presplit(html: str) -> str:
    """Découpe d'avance les titres [data-words] et le manifeste, exactement comme motion.js,
    pour que les animations CSS fonctionnent aussi quand une visionneuse bloque le JavaScript."""
    def words(m):
        tag, attrs, inner = m.group(1), m.group(2), m.group(3)
        out, i, spaced, last = [], 0, True, None
        for tok in re.split(r'(<[^>]+>)', inner):
            if tok.startswith('<'):
                out.append(tok)
                continue
            for t in re.split(r'(\s+)', htmllib.unescape(tok)):
                if not t:
                    continue
                if not t.strip():
                    out.append(' ')
                    spaced = True
                    continue
                if not spaced and last is not None:
                    out[last] = out[last].replace('</span></span>', htmllib.escape(t, quote=False) + '</span></span>')
                    continue
                spaced = False
                out.append(f'<span class="wm"><span class="wi" style="--i:{i}">{htmllib.escape(t, quote=False)}</span></span>')
                last = len(out) - 1
                i += 1
        return f'<{tag}{attrs} data-split="done" aria-label="{_attr(inner)}"><span aria-hidden="true">{"".join(out)}</span></{tag}>'
    html = re.sub(r'<(h1|h2|h3|p)(\s[^>]*?\bdata-words\b[^>]*)>(.*?)</\1>', words, html, flags=re.S)

    def manifesto(m):
        attrs, inner = m.group(1), m.group(2)
        out, i = [], 0
        parts = [(bool(a), a or b) for a, b in re.findall(r'<span class="hl-src">(.*?)</span>|([^<]+)', inner)]
        for hl, tok in parts:
            for t in re.split(r'(\s+)', htmllib.unescape(tok)):
                if not t:
                    continue
                if not t.strip():
                    out.append(' ')
                    continue
                out.append(f'<span class="mw{" hl" if hl else ""}" style="--i:{i}">{htmllib.escape(t, quote=False)}</span>')
                i += 1
        attrs = re.sub(r'style="([^"]*)"', lambda s: f'style="{s.group(1)};--n:{i}"', attrs) if 'style="' in attrs else attrs + f' style="--n:{i}"'
        return f'<p{attrs} data-split="done" aria-label="{_attr(inner)}"><span aria-hidden="true">{"".join(out)}</span></p>'
    return re.sub(r'<p(\s[^>]*?\bdata-manifesto\b[^>]*)>(.*?)</p>', manifesto, html, flags=re.S)


def hero_loops(html: str) -> str:
    """Films en boucle (lecture automatique, sans script) glissés dans le hero de l'aperçu."""
    def vid(kind, name):
        return (f'<video class="hero__loop hero__loop--{kind}" autoplay muted loop playsinline disablepictureinpicture aria-hidden="true" tabindex="-1">'
                f'<source src="{data_uri(f"assets/video/{name}.webm")}" type="video/webm">'
                # H.264 en secours pour le film vertical seulement (iPhone) ; Safari ordinateur lit le WebM
                + (f'<source src="{data_uri(f"assets/video/{name}.mp4")}" type="video/mp4">' if kind == 'm' else '') + '</video>')
    return html.replace('data-hero-video></video>', 'data-hero-video></video>\n        ' + vid('m', 'hero-loop-m') + vid('d', 'hero-loop'), 1)


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
    css = (ROOT / 'assets/css/main.css').read_text(encoding='utf-8') + (ROOT / 'assets/css/motion.css').read_text(encoding='utf-8')
    css = re.sub(r"url\('\.\./fonts/([^']+)'\)", lambda m: f"url('{data_uri('assets/fonts/' + m.group(1))}')", css)
    html = html.replace('<link rel="stylesheet" href="assets/css/main.css">', f'<style>{css}</style>').replace('<link rel="stylesheet" href="assets/css/motion.css">\n', '')
    html = html.replace('<link rel="stylesheet" href="assets/css/nojs.css" data-nojs>', f'<style data-nojs>{(ROOT / "assets/css/nojs.css").read_text(encoding="utf-8")}</style>')
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

    hero = prep_hero(js('assets/js/hero.js'))
    html = hero_loops(presplit(html))
    scripts = {
        '<script src="assets/js/main.js" defer></script>': f'<script>{js("assets/js/main.js")}</script>',
        '<script src="assets/js/motion.js" defer></script>': f'<script>{js("assets/js/motion.js")}</script>',
        '<script src="assets/js/hero.js" defer></script>': f'<script>{hero}</script>',
        '<script type="module" src="assets/js/diagnostic.js"></script>': f'<script type="module">{module("assets/js/systemes.js", "assets/js/diagnostic.js")}</script>',
        '<script type="module" src="assets/js/boutique.js"></script>': f'<script type="module">{module("assets/js/catalogue.js", "assets/js/catalogue-view.js", "assets/js/boutique.js")}</script>',
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
