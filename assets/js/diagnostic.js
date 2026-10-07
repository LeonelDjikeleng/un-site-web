/*
 * « Promenez la lumière sur la voiture » : le moment interactif du site.
 * Souris : la lumière suit le pointeur et révèle le plan. Doigt et clavier : les points
 * et les boutons de système. Le contenu ne décrit que des services et des pièces
 * réellement présents au catalogue (voir docs/01-dossier-milano-performance.md).
 */
import { SYSTEMES, panelHTML } from './systemes.js';

const plan = document.querySelector('[data-diag-plan]');
const panel = document.querySelector('[data-diag-panel]');

if (plan && panel) {
  const hotspots = [...plan.querySelectorAll('.hotspot')];
  // Boutons de système (accessibles au clavier et au doigt, sous le panneau)
  const chips = document.createElement('div');
  chips.className = 'diag__systems';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Choisir un système');
  Object.entries(SYSTEMES).forEach(([id, s]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip-btn'; b.dataset.system = id; b.textContent = s.nom;
    b.setAttribute('aria-pressed', 'false');
    chips.appendChild(b);
  });

  function show(id) {
    const s = SYSTEMES[id];
    if (!s) return;
    panel.innerHTML = panelHTML(id);
    panel.appendChild(chips);
    [...hotspots, ...chips.children].forEach((h) => h.setAttribute('aria-pressed', String(h.dataset.system === id)));
  }

  let userPicked = false;
  plan.addEventListener('click', (e) => { const h = e.target.closest('.hotspot'); if (h) { userPicked = true; show(h.dataset.system); } });
  chips.addEventListener('click', (e) => { const b = e.target.closest('.chip-btn'); if (b) { userPicked = true; show(b.dataset.system); } });

  // Au doigt : un scanner balaie la voiture pendant le défilement et allume chaque système
  if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const order = hotspots.map((h) => ({ h, x: parseFloat(h.style.getPropertyValue('--x')) })).sort((a, b) => a.x - b.x);
    let raf = null, on = false, lastScan = -1, lastId = '', swap = null;
    const tick = () => {
      raf = null;
      const r = plan.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (innerHeight * 0.55)));
      const v = Math.round(p * 500) / 500;
      if (v === lastScan) return;
      lastScan = v;
      plan.style.setProperty('--scan', v);
      plan.classList.toggle('is-scanning', v > 0);
      plan.classList.toggle('scan-done', v >= 1);
      const edge = 6 + 88 * v;
      let current = '';
      order.forEach(({ h, x }) => { const hit = x <= edge + 0.5; h.classList.toggle('is-hit', hit); if (hit) current = h.dataset.system; });
      // Le panneau change quand le doigt marque une pause, pas à chaque système traversé en pleine vitesse
      if (current && current !== lastId && !userPicked) { lastId = current; clearTimeout(swap); swap = setTimeout(() => { if (!userPicked) show(lastId); }, 140); }
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) tick(); }).observe(plan);
    addEventListener('scroll', () => { if (on && raf === null) raf = requestAnimationFrame(tick); }, { passive: true });
  }

  // La lumière suit le pointeur (souris seulement : au doigt, le plan reste entièrement visible)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let raf = null, px = 0, py = 0;
    plan.addEventListener('pointermove', (e) => {
      const r = plan.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 100;
      py = ((e.clientY - r.top) / r.height) * 100;
      if (raf === null) raf = requestAnimationFrame(() => {
        raf = null;
        plan.style.setProperty('--mx', px.toFixed(1) + '%');
        plan.style.setProperty('--my', py.toFixed(1) + '%');
      });
    });
    plan.addEventListener('pointerenter', () => plan.classList.remove('is-idle'));
    plan.addEventListener('pointerleave', () => plan.classList.add('is-idle'));
  }

  show(hotspots.find((h) => h.getAttribute('aria-pressed') === 'true')?.dataset.system || 'moteur');
}
