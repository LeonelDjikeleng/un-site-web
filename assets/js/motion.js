/*
 * Milano Performance — moteur d'animation (toutes les pages, sans dépendance).
 *
 * Principe « 10K » : tout le site bouge, mais seulement avec transform/opacity,
 * une seule boucle requestAnimationFrame qui se met au repos, et des observateurs
 * qui n'activent que ce qui est à l'écran. « Réduire les animations » = état final immédiat.
 *
 *  [data-scene]        reçoit --p (0 → 1) pendant qu'il traverse l'écran
 *  [data-parallax=n]   se déplace de n × hauteur d'écran au défilement
 *  [data-words]        titre découpé en mots qui montent derrière un masque
 *  [data-count=1930]   compteur qui monte jusqu'à la valeur réelle
 *  svg [data-draw]     tracés qui se dessinent (au défilement si dans une scène)
 *  [data-hold]         bouton « START » à maintenir (moment interactif)
 *  [data-carousel]     défilement horizontal au doigt, carte active mise en avant
 */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none)').matches;

  /* ---------- Intro de marque : la classe is-intro est posée dans le <head> (1re visite) ---------- */
  if (root.classList.contains('is-intro')) {
    setTimeout(() => { root.classList.add('intro-out'); root.classList.remove('is-intro'); }, 1250);
    setTimeout(() => { root.classList.remove('intro-out'); }, 2150);
  }
  /* Le voile de transition posé dans le <head> se retire en glissant */
  if (root.classList.contains('veil-on')) {
    requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.add('veil-out'); root.classList.remove('veil-on'); }));
  }

  /* ---------- Découpage des titres en mots ---------- */
  document.querySelectorAll('[data-words]').forEach((el) => {
    if (el.dataset.split === 'done') return;
    el.dataset.split = 'done';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    let i = 0, lastWi = null, spaced = true;
    const walk = (node, parent) => {
      node.childNodes.forEach((c) => {
        if (c.nodeType === 3) {
          c.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (!t.trim()) { parent.appendChild(document.createTextNode(' ')); spaced = true; return; }
            // ponctuation collée au mot précédent (« italiennes, ») : même bloc, pas de retour à la ligne
            if (!spaced && lastWi) { lastWi.textContent += t; return; }
            spaced = false;
            const w = document.createElement('span'); w.className = 'wm';
            const inner = document.createElement('span'); inner.className = 'wi'; inner.textContent = t;
            inner.style.setProperty('--i', i++); lastWi = inner;
            w.appendChild(inner); parent.appendChild(w);
          });
        } else if (c.nodeType === 1) {
          const clone = c.cloneNode(false); parent.appendChild(clone); walk(c, clone);
        }
      });
    };
    walk(el, out);
    el.textContent = '';
    el.appendChild(out);
  });

  /* ---------- Manifeste : un mot = une unité de lumière ---------- */
  document.querySelectorAll('[data-manifesto]').forEach((el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const out = document.createElement('span'); out.setAttribute('aria-hidden', 'true');
    let i = 0;
    el.childNodes.forEach((c) => {
      const hl = c.nodeType === 1 && c.classList.contains('hl-src');
      c.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (!t.trim()) { out.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'mw' + (hl ? ' hl' : ''); w.textContent = t;
        w.style.setProperty('--i', i++); out.appendChild(w);
      });
    });
    el.textContent = ''; el.appendChild(out); el.style.setProperty('--n', i);
  });

  /* ---------- Révélations à l'entrée dans l'écran ---------- */
  const revealSel = '[data-words], [data-reveal], [data-draw-in], [data-count], .stagger-x, .kicker';
  const rio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      if (el.dataset.count) count(el);
      rio.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  document.querySelectorAll(revealSel).forEach((el) => {
    if (reduce.matches) { el.classList.add('is-in'); if (el.dataset.count) el.textContent = el.dataset.count; return; }
    rio.observe(el);
  });

  function count(el) {
    const to = +el.dataset.count;
    const from = +(el.dataset.from || Math.max(0, to - 60));
    const t0 = performance.now(), dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Tracés SVG : longueur mesurée une fois ---------- */
  document.querySelectorAll('svg [data-draw], [data-draw-in] path, [data-draw-in] circle, [data-draw-in] line, [data-draw-in] polyline').forEach((p) => {
    try {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
      p.style.strokeDasharray = len;
    } catch { /* élément non mesurable */ }
  });

  /* ---------- Scènes, parallaxe, progression : une seule boucle ---------- */
  const scenes = new Set();
  const all = [...document.querySelectorAll('[data-scene], [data-parallax]')];
  const sio = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? scenes.add(e.target) : scenes.delete(e.target)));
    kick();
  }, { rootMargin: '20% 0px 20% 0px' });
  all.forEach((el) => sio.observe(el));

  const bar = document.querySelector('[data-progress]');
  let raf = null, lastBar = -1;
  function frame() {
    raf = null;
    const vh = innerHeight;
    scenes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (el.hasAttribute('data-scene')) {
        // 0 quand le haut de l'élément entre par le bas, 1 quand son bas sort par le haut
        const mode = el.dataset.scene;
        let p;
        if (mode === 'sticky') p = -r.top / Math.max(1, r.height - vh);
        else if (mode === 'enter') p = (vh - r.top) / (vh * 0.85);
        else p = (vh - r.top) / (vh + r.height);
        p = Math.min(1, Math.max(0, p));
        const v = p.toFixed(3);
        if (el._p !== v) { el._p = v; el.style.setProperty('--p', v); el.dispatchEvent(new CustomEvent('scene', { detail: p })); }
      }
      if (el.hasAttribute('data-parallax')) {
        const k = +el.dataset.parallax || 0.1;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        const y = (c * k * -100).toFixed(2);
        if (el._y !== y) { el._y = y; el.style.setProperty('--py', y + 'px'); }
      }
    });
    if (bar) {
      const max = root.scrollHeight - innerHeight;
      const v = Math.round((max > 0 ? scrollY / max : 0) * 1000) / 1000;
      if (v !== lastBar) { lastBar = v; bar.style.transform = `scaleX(${v})`; }
    }
  }
  function kick() { if (raf === null) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick, { passive: true });
  kick();

  /* ---------- Lumière au toucher (retour tactile visible) ---------- */
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn, .action-bar a, .chip-btn');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--tx', `${e.clientX - r.left}px`);
    b.style.setProperty('--ty', `${e.clientY - r.top}px`);
    b.classList.remove('is-tap'); void b.offsetWidth; b.classList.add('is-tap');
  }, { passive: true });

  /* ---------- Carrousels au doigt : la carte la plus centrée est mise en avant ---------- */
  document.querySelectorAll('[data-carousel]').forEach((track) => {
    const items = [...track.children];
    const dots = track.parentElement.querySelector('[data-dots]');
    if (dots) dots.innerHTML = items.map(() => '<i></i>').join('');
    let t = null;
    const update = () => {
      t = null;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((it, i) => {
        const c = it.offsetLeft + it.offsetWidth / 2;
        const d = Math.abs(c - mid);
        const k = Math.max(0, 1 - d / track.clientWidth);
        it.style.setProperty('--focus', k.toFixed(3));
        if (d < bestD) { bestD = d; best = i; }
      });
      if (dots) [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
    };
    track.addEventListener('scroll', () => { if (t === null) t = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* ---------- Moment interactif : maintenir « START » ---------- */
  document.querySelectorAll('[data-hold]').forEach((box) => {
    const btn = box.querySelector('[data-hold-btn]');
    const needle = box.querySelector('[data-needle]');
    const rpm = box.querySelector('[data-rpm]');
    let v = 0, holding = false, raf2 = null, done = false, last = 0;
    const DURATION = 1500;
    const paint = () => {
      box.style.setProperty('--hold', v.toFixed(3));
      if (needle) needle.style.transform = `rotate(${(-120 + 240 * v).toFixed(1)}deg)`;
      if (rpm) rpm.textContent = String(Math.round(v * 8500 / 100) * 100).padStart(4, '0');
    };
    const loop = (now) => {
      const dt = Math.min(64, now - (last || now)); last = now;
      v += (holding ? 1 : -1.6) * dt / DURATION;
      v = Math.min(1, Math.max(0, v));
      paint();
      if (v >= 1 && !done) {
        done = true; holding = false;
        box.classList.add('is-started');
        if (navigator.vibrate) navigator.vibrate([18, 40, 30]);
        btn.setAttribute('aria-pressed', 'true');
        btn.querySelector('[data-hold-label]').textContent = 'Moteur prêt';
      }
      raf2 = (holding || (v > 0 && !done)) ? requestAnimationFrame(loop) : null;
      if (!raf2) last = 0;
    };
    const start = (e) => { if (done) return; e.preventDefault(); holding = true; box.classList.add('is-holding'); if (!raf2) raf2 = requestAnimationFrame(loop); };
    const stop = () => { holding = false; box.classList.remove('is-holding'); if (!raf2 && !done) raf2 = requestAnimationFrame(loop); };
    btn.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    if (reduce.matches) { v = 1; done = true; paint(); box.classList.add('is-started'); }
  });

  /* ---------- Poussière lumineuse (hero, très discrète) ---------- */
  const cvs = document.querySelector('[data-dust]');
  if (cvs && !reduce.matches) {
    const ctx = cvs.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    const N = innerWidth < 720 ? 26 : 46;
    let w = 0, h = 0, on = false, raf3 = null;
    const parts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.4, s: 0.002 + Math.random() * 0.006, a: 0.15 + Math.random() * 0.45, o: Math.random() * 6.28 }));
    const size = () => { w = cvs.clientWidth; h = cvs.clientHeight; cvs.width = w * dpr; cvs.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.s * 0.16; p.x += Math.sin(t / 2600 + p.o) * 0.00025;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.o));
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r, 0, 6.283); ctx.fillStyle = '#e7eaed'; ctx.fill();
      }
      raf3 = on ? requestAnimationFrame(draw) : null;
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting && !document.hidden; if (on && !raf3) { size(); raf3 = requestAnimationFrame(draw); } }).observe(cvs);
    addEventListener('resize', size);
  }

  /* ---------- Transitions entre pages : le voile couvre, la page suivante le retire ---------- */
  if (document.querySelector('[data-veil]') && !reduce.matches) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!/^[a-z-]+\.html(?:[?#].*)?$/.test(href)) return;
      if (window.__mpSingleFile) return; // aperçu tout-en-un : le routeur s'en charge
      const here = location.pathname.split('/').pop() || 'index.html';
      if (href.split(/[?#]/)[0] === here) return;
      e.preventDefault();
      try { sessionStorage.setItem('mp-veil', '1'); } catch { /* sans stockage : pas de voile à l'arrivée */ }
      root.classList.remove('veil-out'); root.classList.add('veil-in');
      setTimeout(() => { location.href = href; }, 360);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) { root.classList.remove('veil-in'); root.classList.add('veil-out'); } });
  }
})();
