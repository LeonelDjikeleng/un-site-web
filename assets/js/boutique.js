import { PRODUITS, CATEGORIES, MAISONS, urlProduit } from './catalogue.js';

/* Pictogrammes techniques (trait 1,5 px, dessinés pour le sujet). L'accent rouge = étrier. */
const GLYPHS = {
  roue: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="9"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M60 51 L56 22 M60 51 L64 22" transform="rotate(${a} 60 60)"/>`).join('')}<path class="accent" d="M28 34a40 40 0 0 1 22-14" stroke-width="5"/></svg>`,
  echappement: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="40" cy="60" rx="16" ry="20"/><ellipse cx="40" cy="60" rx="11" ry="15"/><ellipse cx="80" cy="60" rx="16" ry="20"/><ellipse cx="80" cy="60" rx="11" ry="15"/><path d="M40 40h40M40 80h40"/><path class="accent" d="M24 98h72" stroke-width="2"/></svg>`,
  goutte: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M60 14C48 36 34 52 34 72a26 26 0 0 0 52 0c0-20-14-36-26-58z"/><path d="M46 74a14 14 0 0 0 10 14" /><path class="accent" d="M60 104v8" stroke-width="2"/></svg>`,
  disque: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="60" cy="60" r="46"/><circle cx="60" cy="60" r="18"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="60" cy="28" r="2" transform="rotate(${i * 30} 60 60)"/>`).join('')}<path class="accent" d="M88 22a48 48 0 0 1 16 22l-12 6a36 36 0 0 0-12-17z" fill="currentColor" stroke="none"/></svg>`,
  filtre: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="34" y="22" width="52" height="76" rx="6"/><path d="M34 34h52M34 86h52"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${42 + i * 6} 40v40"/>`).join('')}<path class="accent" d="M50 14h20" stroke-width="2"/></svg>`,
  suspension: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 80 60 40l40 40"/><circle cx="20" cy="80" r="7"/><circle cx="100" cy="80" r="7"/><circle cx="60" cy="40" r="9"/><path d="M60 31V12"/><path class="accent" d="M52 12h16" stroke-width="2"/></svg>`,
  engrenage: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="10"/>${Array.from({ length: 12 }, (_, i) => `<rect x="56" y="22" width="8" height="10" transform="rotate(${i * 30} 60 60)"/>`).join('')}<path class="accent" d="M60 98v10" stroke-width="2"/></svg>`,
  cle: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M76 20a20 20 0 0 0-18 28L22 84l14 14 36-36a20 20 0 0 0 28-18l-10 10-12-4-4-12z"/><path class="accent" d="M28 92l6 6" stroke-width="3"/></svg>`,
};

const grid = document.querySelector('[data-products]');
const filters = document.querySelector('[data-filters]');
const search = document.querySelector('[data-search]');
const count = document.querySelector('[data-count]');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const prix = (p) => p.prix == null
  ? 'Prix sur la fiche · disponibilité à confirmer'
  : `${p.prix.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} · disponibilité à confirmer`;

function card(p) {
  const c = CATEGORIES[p.categorie];
  const m = p.maison ? MAISONS[p.maison].nom : c.nom;
  const demande = `contact.html?sujet=piece&produit=${encodeURIComponent(p.nom)}`;
  return `<li class="product">
    <div class="product__glyph" aria-hidden="true"><span class="product__code">${esc(c.nom)}</span>${GLYPHS[c.glyph] || ''}<span class="product__big${(p.ref || c.nom).length > 9 ? ' is-long' : ''}">${esc(p.ref || c.nom)}</span></div>
    <div class="product__body">
      <p class="product__house">${esc(m)}</p>
      <h3>${esc(p.nom)}</h3>
      <div class="product__meta"><span class="ref">${esc(c.nom)}</span></div>
      ${p.compat ? `<p class="product__compat">Compatibilité indiquée : ${esc(p.compat)}</p>` : ''}
    </div>
    <div class="product__foot">
      <p class="product__price">${prix(p)}</p>
      <div class="product__actions">
        <a class="primary" href="${urlProduit(p)}" rel="noopener">Voir la fiche <svg aria-hidden="true"><use href="#i-out"/></svg><span class="sr-only"> : ${esc(p.nom)} (boutique en ligne)</span></a>
        <a href="${demande}">Vérifier la dispo<span class="sr-only"> : ${esc(p.nom)}</span></a>
      </div>
    </div>
  </li>`;
}

const params = new URLSearchParams(location.search);
let cat = CATEGORIES[params.get('cat')] ? params.get('cat') : 'tout';
let q = params.get('q') || '';

function render() {
  const nq = norm(q.trim());
  const list = PRODUITS.filter((p) => (cat === 'tout' || p.categorie === cat)
    && (!nq || norm(`${p.nom} ${p.ref || ''} ${p.maison ? MAISONS[p.maison].nom : ''} ${CATEGORIES[p.categorie].nom} ${p.compat || ''}`).includes(nq)));
  grid.innerHTML = list.length
    ? list.map(card).join('')
    : `<li class="empty"><p><strong>Aucun produit ne correspond.</strong></p><p style="margin-top:8px">Cette liste n'est pas exhaustive&nbsp;: <a href="contact.html?sujet=piece${q ? '&produit=' + encodeURIComponent(q) : ''}">demandez-nous la pièce</a>, on vérifie pour vous.</p></li>`;
  count.textContent = `${list.length} produit${list.length > 1 ? 's' : ''}${cat !== 'tout' ? ' · ' + CATEGORIES[cat].nom : ''}${q ? ` · « ${q} »` : ''}`;
  filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  const u = new URL(location.href);
  cat === 'tout' ? u.searchParams.delete('cat') : u.searchParams.set('cat', cat);
  q ? u.searchParams.set('q', q) : u.searchParams.delete('q');
  history.replaceState(null, '', u);
}

if (grid && filters) {
  const counts = PRODUITS.reduce((a, p) => ((a[p.categorie] = (a[p.categorie] || 0) + 1), a), {});
  const btn = (id, nom, n) => `<button class="chip-btn" type="button" data-cat="${id}" aria-pressed="false">${nom}<span>${n}</span></button>`;
  filters.innerHTML = btn('tout', 'Tout', PRODUITS.length)
    + Object.entries(CATEGORIES).filter(([id]) => counts[id]).map(([id, c]) => btn(id, c.nom, counts[id])).join('');
  filters.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.cat; render(); });
  search.value = q;
  let t;
  search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { q = search.value; render(); }, 120); });
  render();
  const active = filters.querySelector('[aria-pressed="true"]');
  if (active && cat !== 'tout') filters.scrollLeft = active.offsetLeft - filters.clientWidth / 2 + active.offsetWidth / 2;
}
