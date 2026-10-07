// Écrit d'avance, dans le HTML, ce que le JavaScript construit d'habitude :
//  - boutique.html : les 47 cartes produits et les filtres (filtres en CSS pur quand le JS est bloqué) ;
//  - index.html : les six panneaux du diagnostic et leurs boutons.
// Ainsi le site reste complet et animé même si un lecteur de fichiers bloque les scripts.
// Le JavaScript, quand il tourne, remplace ces blocs par sa version interactive.
// Usage : node tools/prerender.mjs   (à relancer après une modification de catalogue.js ou systemes.js)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { PRODUITS, CATEGORIES } = await import(path.join(root, 'assets/js/catalogue.js'));
const { card, esc } = await import(path.join(root, 'assets/js/catalogue-view.js'));
const { SYSTEMES, panelHTML } = await import(path.join(root, 'assets/js/systemes.js'));

function fill(file, marker, content) {
  const f = path.join(root, file);
  const html = readFileSync(f, 'utf8');
  const re = new RegExp(`<!-- @${marker} -->[\\s\\S]*?<!-- /@${marker} -->`);
  if (!re.test(html)) throw new Error(`${file} : marqueur @${marker} absent`);
  writeFileSync(f, html.replace(re, () => `<!-- @${marker} -->\n${content}\n<!-- /@${marker} -->`));
}

/* ---------- Boutique ---------- */
fill('boutique.html', 'produits', PRODUITS.map((p, i) => card(p, i)).join('\n'));
const counts = PRODUITS.reduce((a, p) => ((a[p.categorie] = (a[p.categorie] || 0) + 1), a), {});
const cats = [['tout', 'Tout', PRODUITS.length], ...Object.entries(CATEGORIES).filter(([id]) => counts[id]).map(([id, c]) => [id, c.nom, counts[id]])];
const radios = cats.map(([id], k) => `<input class="sr-only" type="radio" name="filtre" id="f-${id}"${k ? '' : ' checked'}>`).join('');
const labels = cats.map(([id, nom, n]) => `<label class="chip-btn" for="f-${id}">${esc(nom)}<span>${n}</span></label>`).join('');
const css = cats.slice(1).map(([id]) => `html:not(.js) #catalogue:has(#f-${id}:checked) .product:not([data-cat="${id}"])`).join(',\n') + ' { display: none; }\n'
  + cats.map(([id]) => `html:not(.js) #catalogue:has(#f-${id}:checked) label[for="f-${id}"]`).join(',\n') + ' { background: var(--c-ink); color: var(--c-alu); border-color: var(--c-ink); }';
fill('boutique.html', 'filtres', `${radios}${labels}<style>\n${css}\n</style>`);

/* ---------- Diagnostic ---------- */
const ids = Object.keys(SYSTEMES);
const sysRadios = ids.map((id) => `<input class="sr-only" type="radio" name="systeme" id="sys-${id}"${id === 'moteur' ? ' checked' : ''}>`).join('');
const panels = ids.map((id) => panelHTML(id)).join('');
const chips = `<div class="diag__systems" role="group" aria-label="Choisir un système">${ids.map((id) => `<label class="chip-btn" for="sys-${id}">${SYSTEMES[id].nom}</label>`).join('')}</div>`;
fill('index.html', 'diagnostic', `<div class="diag__static">${sysRadios}${panels}${chips}</div>`);

console.log(`${PRODUITS.length} produits, ${cats.length - 1} filtres, ${ids.length} panneaux de diagnostic`);
