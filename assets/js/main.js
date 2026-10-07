/* Milano Performance — comportements communs à toutes les pages. Aucune dépendance. */
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- En-tête : opaque après le haut de page, caché en descendant ---------- */
  const header = document.querySelector('[data-header]');
  const actionBar = document.querySelector('[data-action-bar]');
  let lastY = scrollY, ticking = false, lastSolid = null, lastHidden = null, lastBar = null;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const solid = y > 40;
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      let hidden = lastHidden;
      if (y < 200 || goingUp) hidden = false; else if (goingDown && !document.body.classList.contains('menu-open')) hidden = true;
      if (solid !== lastSolid) { header.classList.toggle('is-solid', solid); lastSolid = solid; }
      if (hidden !== lastHidden) { header.classList.toggle('is-hidden', !!hidden); lastHidden = hidden; }
      const bar = y > innerHeight * 0.6;
      if (actionBar && bar !== lastBar) { actionBar.classList.toggle('is-in', bar); lastBar = bar; }
      lastY = y;
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.sr-only').textContent = open ? 'Fermer le menu' : 'Menu';
    if (open) { header.classList.remove('is-hidden'); lastHidden = false; menu.querySelector('a').focus(); }
  }
  if (menuBtn && menu) {
    menu.inert = true;
    menuBtn.addEventListener('click', () => { const o = !document.body.classList.contains('menu-open'); menu.inert = !o; setMenu(o); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.inert = true; setMenu(false); } });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { menu.inert = true; setMenu(false); menuBtn.focus(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) { menu.inert = true; setMenu(false); } });
  }

  /* ---------- Apparitions : seulement sous la ligne de flottaison au chargement ---------- */
  const targets = [...document.querySelectorAll('.reveal, .stagger, .blade, .frame__zoom')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.remove('pre');
      el.classList.add('in');
      if (el.classList.contains('stagger')) setTimeout(() => el.classList.add('done'), 1400);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!reduce.matches && r.top > innerHeight * 0.92) el.classList.add('pre');
    else { el.classList.add('in', 'done'); return; }
    io.observe(el);
  });

  /* ---------- Manifeste : les phrases s'allument à la lecture ---------- */
  const manifesto = document.querySelector('[data-manifesto]');
  if (manifesto) {
    const parts = [...manifesto.querySelectorAll('.dim')];
    const mio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('lit'); mio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -30% 0px' });
    parts.forEach((p) => mio.observe(p));
  }

  /* ---------- Section McLaren : l'image se resserre en approchant ---------- */
  const zoom = document.querySelector('[data-zoom]');
  if (zoom && !reduce.matches) {
    const img = zoom.querySelector('img');
    let on = false, raf = null, last = -1;
    const draw = () => {
      raf = null;
      const r = zoom.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.3) / innerHeight));
      const s = (1.14 - 0.14 * t).toFixed(4);
      if (s !== last) { img.style.setProperty('--s', s); last = s; }
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) draw(); }).observe(zoom);
    addEventListener('scroll', () => { if (on && raf === null) raf = requestAnimationFrame(draw); }, { passive: true });
  }

  /* ---------- Copier (utile quand tel: ou mailto: ne fonctionnent pas) ---------- */
  document.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copié'; }
      catch { b.textContent = 'Sélectionnez le texte'; }
      setTimeout(() => { b.textContent = 'Copier'; }, 1800);
    });
  });

  /* ---------- Carte Google : chargée seulement au clic (Loi 25) ---------- */
  document.querySelectorAll('[data-map-load]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('[data-map]');
      const f = document.createElement('iframe');
      f.title = 'Carte : 19 rue Odette-Pinard, Québec';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=19+rue+Odette-Pinard,+Qu%C3%A9bec,+QC+G1E+5P6&output=embed';
      box.appendChild(f);
      box.querySelector('.map__inner').hidden = true;
    });
  });

  /* ---------- Divers ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
  if (!matchMedia('(hover: hover)').matches) doc.classList.add('no-hover');

  // Mouvement réduit activé en cours de visite : tout passe à l'état final
  reduce.addEventListener('change', (e) => {
    if (!e.matches) return;
    document.querySelectorAll('.pre').forEach((el) => el.classList.remove('pre'));
    document.querySelectorAll('.dim').forEach((el) => el.classList.add('lit'));
  });
})();
