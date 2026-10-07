import { PRODUITS, CATEGORIES, MAISONS } from './catalogue.js';
import { card, norm } from './catalogue-view.js';

const grid = document.querySelector('[data-products]');
const filters = document.querySelector('[data-filters]');
const search = document.querySelector('[data-search]');
const count = document.querySelector('[data-count]');

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
  // Aperçu tout-en-un : les paramètres arrivent sans rechargement de page
  addEventListener('mp:params', (e) => {
    const c = e.detail.get('cat');
    cat = CATEGORIES[c] ? c : 'tout';
    q = e.detail.get('q') || '';
    search.value = q;
    render();
  });
  const active = filters.querySelector('[aria-pressed="true"]');
  if (active && cat !== 'tout') filters.scrollLeft = active.offsetLeft - filters.clientWidth / 2 + active.offsetWidth / 2;
}
