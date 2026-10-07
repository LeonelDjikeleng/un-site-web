#!/usr/bin/env python3
"""Aperçu « tout-en-un » : le site entier dans UN SEUL fichier HTML.

Usage : python3 tools/bundle_site.py   -> apercu/milano-performance-site-complet.html

Chaque page devient une vue du même fichier ; un petit routeur intercepte les liens
vers index.html, atelier.html, boutique.html, contact.html, etc. et affiche la bonne vue
(adresse du type #/boutique). Styles, polices, images et vidéo sont intégrés.

Sans JavaScript (visionneuse qui bloque les scripts), le fichier marche quand même :
les liens pointent vers des ancres (#v-boutique, #atelier-mclaren…) et le CSS affiche
la vue qui contient la cible (:target) ; les animations passent en CSS (motion.css).
Sert à montrer le site d'un clic ; la version à mettre en ligne reste celle des pages séparées.
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from bundle import ROOT, OUT, data_uri, hero_loops, module, pick_src, prep_hero, presplit  # noqa: E402

VIEWS = [  # fichier, identifiant de vue, titre d'onglet
    ('index.html', 'accueil'),
    ('atelier.html', 'atelier'),
    ('boutique.html', 'boutique'),
    ('contact.html', 'contact'),
    ('confidentialite.html', 'confidentialite'),
    ('mentions-legales.html', 'mentions'),
]


def inline_images(html: str) -> str:
    html = re.sub(r'\s*<source type="image/avif"[^>]*>', '', html)

    def one_copy(m):
        block = m.group(0)
        src = re.search(r'<source type="image/webp" srcset="([^"]+)"[^>]*>', block)
        if not src:
            return block
        block = block.replace(src.group(0), '')
        return re.sub(r'(<img[^>]*?\s)src="[^"]+"', lambda i: f'{i.group(1)}src="{pick_src(src.group(1))}"', block, count=1)

    html = re.sub(r'<picture>.*?</picture>', one_copy, html, flags=re.S)
    html = re.sub(r'(<source[^>]*?)\ssrcset="(?!data:)([^"]+)"(?:\s+sizes="[^"]*")?', lambda m: f'{m.group(1)} srcset="{data_uri(pick_src(m.group(2)))}"', html)
    html = re.sub(r'\ssrcset="(?!data:)([^"]+)"(?:\s+sizes="[^"]*")?', lambda m: f' srcset="{data_uri(pick_src(m.group(1)))}"', html)
    return re.sub(r'(src|href)="(assets/(?:img|fonts)/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)


def main_inner(html: str) -> str:
    m = re.search(r'<main[^>]*>(.*)</main>', html, flags=re.S)
    return m.group(1)


def build():
    sources = {v: (ROOT / f).read_text(encoding='utf-8') for f, v in VIEWS}
    titles = {v: re.search(r'<title>(.*?)</title>', s).group(1) for v, s in sources.items()}
    inners = {v: main_inner(s) for v, s in sources.items()}

    # Identifiants en double d'une vue à l'autre : préfixés dans les vues autres que l'accueil
    ids = {v: set(re.findall(r'\sid="([^"]+)"', h)) for v, h in inners.items()}
    for v, h in inners.items():
        if v == 'accueil':
            continue
        dup = {i for i in ids[v] if any(i in ids[o] for o in ids if o != v)}
        for i in sorted(dup, key=len, reverse=True):
            new = f'{v}-{i}'
            h = re.sub(rf'(\s(?:id|for)=")({re.escape(i)})"', rf'\g<1>{new}"', h)
            h = re.sub(rf'(\s(?:aria-labelledby|aria-describedby|aria-controls)="[^"]*?)\b{re.escape(i)}\b', rf'\g<1>{new}', h)
            h = h.replace(f'href="#{i}"', f'href="#{new}"')
        inners[v] = h

    base = sources['accueil']
    head = re.search(r'<head>(.*)</head>', base, flags=re.S).group(1)
    head = re.sub(r'<link rel="preload"[^>]*>\n?', '', head)
    css = (ROOT / 'assets/css/main.css').read_text(encoding='utf-8') + (ROOT / 'assets/css/motion.css').read_text(encoding='utf-8')
    css = re.sub(r"url\('\.\./fonts/([^']+)'\)", lambda m: f"url('{data_uri('assets/fonts/' + m.group(1))}')", css)
    css += '''
/* Aperçu tout-en-un */
.view[hidden] { display: none !important; }
'''
    nojs = (ROOT / 'assets/css/nojs.css').read_text(encoding='utf-8') + '''
html:not(.js) .view[hidden]:is(:target, :has(:target)) { display: block !important; }
html:not(.js) main:has(> .view:not([data-view='accueil']):is(:target, :has(:target))) > .view[data-view='accueil'] { display: none !important; }
'''
    head = head.replace('<link rel="stylesheet" href="assets/css/main.css">', f'<style>{css}</style>').replace('<link rel="stylesheet" href="assets/css/motion.css">\n', '')
    head = head.replace('<link rel="stylesheet" href="assets/css/nojs.css" data-nojs>', f'<style data-nojs>{nojs}</style>')
    head = head.replace('<title>', '<script>window.__mpSingleFile = true</script>\n<title>', 1)
    head = head.replace('<title>', '<!-- Aperçu tout-en-un généré par tools/bundle_site.py : ne pas publier tel quel -->\n<title>', 1)

    header = re.search(r'<!-- @header -->(.*?)<!-- /@header -->', base, flags=re.S).group(1)
    footer = re.search(r'<!-- @footer -->(.*?)<!-- /@footer -->', base, flags=re.S).group(1)

    views_html = '\n'.join(
        f'<div class="view" id="v-{v}" data-view="{v}"{"" if v == "accueil" else " hidden"}>{inners[v]}</div>'
        for _, v in VIEWS
    )

    def js(rel):
        return (ROOT / rel).read_text(encoding='utf-8')

    hero = prep_hero(js('assets/js/hero.js'))

    pages = {f: v for f, v in VIEWS}
    router = """
(() => {
  const PAGES = %s;
  const TITLES = %s;
  const views = [...document.querySelectorAll('.view')];
  function show(view, anchor, params, push) {
    if (!TITLES[view]) view = 'accueil';
    views.forEach((el) => { el.hidden = el.dataset.view !== view; });
    document.title = TITLES[view];
    document.querySelectorAll('[data-nav]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === view));
    document.body.classList.remove('menu-open');
    const m = document.querySelector('[data-menu]'); if (m) m.inert = true;
    dispatchEvent(new CustomEvent('mp:params', { detail: params || new URLSearchParams() }));
    const target = anchor && (document.getElementById(view + '-' + anchor) || document.getElementById(anchor));
    requestAnimationFrame(() => { target ? target.scrollIntoView() : scrollTo(0, 0); dispatchEvent(new Event('scroll')); });
    const h = '#/' + view + (anchor ? '/' + anchor : '');
    if (push && location.hash !== h) history.pushState(null, '', h);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const m = (a.dataset.href || a.getAttribute('href')).match(/^([a-z-]+\\.html)(\\?[^#]*)?(#.*)?$/);
    if (!m || !PAGES[m[1]]) return;
    e.preventDefault();
    show(PAGES[m[1]], m[3] ? m[3].slice(1) : '', new URLSearchParams(m[2] || ''), true);
  });
  function fromHash() {
    const m = location.hash.match(/^#\\/([a-z-]+)(?:\\/([\\w-]+))?/);
    if (m) show(m[1], m[2] || '', null, false);
  }
  addEventListener('popstate', fromHash);
  fromHash();
})();
""" % (json.dumps(pages), json.dumps(titles, ensure_ascii=False))

    body = f"""<body data-page="accueil">
{header}
<main id="main" tabindex="-1">
{views_html}
</main>
{footer}
<script>{js('assets/js/main.js')}</script>
<script>{js('assets/js/motion.js')}</script>
<script>{hero}</script>
<script>{js('assets/js/contact.js')}</script>
<script type="module">{module('assets/js/systemes.js', 'assets/js/diagnostic.js')}</script>
<script type="module">{module('assets/js/catalogue.js', 'assets/js/catalogue-view.js', 'assets/js/boutique.js')}</script>
<script>{router}</script>
</body>"""
    html = f'<!doctype html>\n<html lang="fr-CA">\n<head>{head}</head>\n{body}\n</html>\n'
    html = hero_loops(presplit(html))

    # Liens entre pages -> ancres (sans JS : le CSS montre la vue ciblée ; avec JS : data-href pour le routeur)
    all_ids = set(re.findall(r'\sid="([^"]+)"', html))

    def link(m):
        page, query, anchor = m.group(1), m.group(2) or '', (m.group(3) or '')[1:]
        if page not in pages:
            return m.group(0)
        v = pages[page]
        target = f'v-{v}'
        if anchor:
            target = f'{v}-{anchor}' if f'{v}-{anchor}' in all_ids else (anchor if anchor in all_ids else target)
        return f'href="#{target}" data-href="{page}{query}{"#" + anchor if anchor else ""}"'
    html = re.sub(r'href="([a-z-]+\.html)(\?[^"#]*)?(#[^"]*)?"', link, html)
    html = inline_images(html)
    OUT.mkdir(exist_ok=True)
    out = OUT / 'milano-performance-site-complet.html'
    out.write_text(html, encoding='utf-8')
    print(f'{out.name}: {out.stat().st_size / 1e6:.1f} Mo')


if __name__ == '__main__':
    build()
