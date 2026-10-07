#!/usr/bin/env python3
"""Injecte l'en-tête et le pied de page communs dans chaque page HTML.

Usage : python3 tools/build.py

Les pages restent du HTML statique ordinaire (aucune étape de compilation
n'est nécessaire pour les servir). Ce script sert seulement à garder
l'en-tête et le pied de page identiques partout : modifiez `partials/`,
puis relancez-le.

Marqueurs dans chaque page :
    <!-- @header --> ... <!-- /@header -->
    <!-- @footer --> ... <!-- /@footer -->
La page active est lue dans <body data-page="...">.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = {name: (ROOT / 'partials' / f'{name}.html').read_text(encoding='utf-8').strip() for name in ('header', 'footer')}


def build(page: pathlib.Path) -> bool:
    src = page.read_text(encoding='utf-8')
    m = re.search(r'<body[^>]*data-page="([^"]+)"', src)
    current = m.group(1) if m else ''
    out = src
    for name, html in PARTIALS.items():
        if current:
            html = html.replace(f'data-nav="{current}"', f'data-nav="{current}" aria-current="page"')
        block = f'<!-- @{name} -->\n{html}\n<!-- /@{name} -->'
        out = re.sub(rf'<!-- @{name} -->.*?<!-- /@{name} -->', lambda _m: block, out, flags=re.S)
    if out != src:
        page.write_text(out, encoding='utf-8')
        return True
    return False


if __name__ == '__main__':
    for p in sorted(ROOT.glob('*.html')):
        print(('mis à jour ' if build(p) else 'inchangé   ') + p.name)
