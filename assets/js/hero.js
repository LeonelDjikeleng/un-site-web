/*
 * Hero défilé : la vidéo avance quand on descend, recule quand on remonte.
 * Standard « 10K » : vidéo chargée en Blob (indépendant du support Range de l'hébergeur),
 * temps affiché lissé (indépendant de la fréquence d'écran), recherches sérialisées,
 * écritures DOM seulement sur changement, boucle au repos quand rien ne bouge.
 *
 * Cinq conditions donnent une image fixe composée à la place de la vidéo. Elles doivent
 * rester identiques, caractère pour caractère, à celles de main.css.
 */
(() => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  // VP9/WebM quand le navigateur le décode (plus léger), sinon H.264/MP4 (Safari, anciens appareils)
  const probe = document.createElement('video');
  const WEBM = !!probe.canPlayType && probe.canPlayType('video/webm; codecs="vp9"') === 'probably';
  const VIDEO_URL = WEBM ? 'assets/video/hero-scrub.webm' : 'assets/video/hero-scrub.mp4';
  const VIDEO_TYPE = WEBM ? 'video/webm' : 'video/mp4';
  const VIDEO_BYTES = WEBM ? 2271239 : 3843419; // repli si Content-Length est absent (mis à jour à l'encodage)
  const POSTER_URL = 'assets/img/hero-start.jpg';
  const FALLBACK_URL = 'assets/img/hero-end-1600.jpg';

  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)',
  ];

  const video = hero.querySelector('[data-hero-video]');
  const poster = hero.querySelector('[data-hero-poster]');
  const ring = hero.querySelector('[data-ring]');
  const cue = hero.querySelector('[data-scroll-cue]');
  const cueLabel = hero.querySelector('[data-cue-label]');
  const bar = hero.querySelector('[data-hero-bar]');
  const bands = [...hero.querySelectorAll('[data-band]')].map((el, i) => {
    const [a, b] = el.dataset.band.split(',').map(Number);
    return { el, a, b, i, op: -1, k: -1, on: null };
  });

  /* ---------- Découpage des titres en mots (une fois) ---------- */
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  hero.querySelectorAll('[data-split]').forEach((el, n) => {
    const r = rng(17 + n * 31);
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const words = [];
    // garde les balises <em> : on découpe noeud par noeud
    const walk = (node, em) => {
      node.childNodes.forEach((c) => {
        if (c.nodeType === 3) {
          const lead = /^\S/.test(c.textContent) && words.length && !words[words.length - 1].space;
          c.textContent.split(/(\s+)/).forEach((t, k, arr) => {
            if (!t.trim()) { if (words.length) words[words.length - 1].space = true; return; }
            if (k === 0 && lead) { words[words.length - 1].t += t; return; }
            words.push({ t, em, space: false });
          });
        }
        else walk(c, em || c.tagName === 'EM');
      });
    };
    walk(el, false);
    const total = words.length;
    el.setAttribute('aria-label', label);
    el.innerHTML = '';
    const wrap = document.createElement('span');
    wrap.className = 'words';
    wrap.setAttribute('aria-hidden', 'true');
    words.forEach((w, i) => {
      const s = document.createElement(w.em ? 'em' : 'span');
      s.className = 'w';
      s.textContent = w.t;
      s.style.setProperty('--th', ((i / Math.max(1, total)) * 0.55 + r() * 0.05).toFixed(3));
      s.style.setProperty('--jx', `${Math.round((r() - 0.5) * 60 - 20)}px`);
      wrap.appendChild(s);
      if (i < total - 1 && w.space !== false) wrap.appendChild(document.createTextNode(' '));
    });
    el.appendChild(wrap);
  });

  /* ---------- Progression dans la zone épinglée ---------- */
  function heroProgress() {
    const r = hero.getBoundingClientRect();
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
  }
  const smoothstep = (p, e0, e1) => { const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  let loadK = 1; // la première bande s'ouvre composée (entrée gérée en CSS)
    function updateBands(p) {
    const last = bands.length - 1;
    for (const b of bands) {
      const f = Math.min(0.03, (b.b - b.a) / 3);
      let op = (b.i === 0 ? 1 : smoothstep(p, b.a, b.a + f)) * (b.i === last ? 1 : 1 - smoothstep(p, b.b - f, b.b));
      if (b.i === last && p < b.a) op = 0;
      let k = clamp((p - b.a) / Math.min(0.06, (b.b - b.a) * 0.45), 0, 1);
      if (b.i === 0) k = Math.max(k, loadK, p > 0 ? 1 : 0);
      op = Math.round(op * 1000) / 1000;
      if (Math.abs(op - b.op) > 0.004) { b.el.style.opacity = op; b.op = op; }
      if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1)) { b.el.style.setProperty('--k', k.toFixed(3)); b.k = k; }
      const on = op > 0.01;
      if (on !== b.on) { b.el.classList.toggle('is-on', on); b.on = on; }
    }
  }

  /* ---------- Recherches sérialisées (jamais deux à la fois) ---------- */
  let seekBusy = false;
  let pendingTime = null;
  function requestSeek(t) {
    if (!video.duration || !videoReady) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = t;
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });

  /* ---------- Boucle lissée, au repos quand convergée ---------- */
  let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true, lastBar = -1, cueGone = false;
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.14;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    const settled = Math.abs(target - shown) < 0.0004 && loadK >= 1;
    if (settled) { shown = target; rafId = null; lastTick = 0; } else rafId = requestAnimationFrame(tick);
    requestSeek(shown * video.duration);
    updateBands(shown);
    const pb = Math.round(shown * 200) / 200;
    if (pb !== lastBar) { bar.style.transform = `scaleY(${pb})`; lastBar = pb; }
    const gone = shown > 0.02;
    if (gone !== cueGone) { cue.classList.toggle('is-gone', gone); cueGone = gone; }
  }
  function kick() { if (rafId === null && heroOnScreen) { lastTick = 0; rafId = requestAnimationFrame(tick); } }
  function onScroll() { target = heroProgress(); kick(); }
  new IntersectionObserver(([e]) => { heroOnScreen = e.isIntersecting; if (heroOnScreen) onScroll(); }).observe(hero);

  /* ---------- Chargement de la vidéo (Blob en flux + anneau honnête) ---------- */
  let videoReady = false;
  let initDone = false;
  function setRing(frac) { ring.style.setProperty('--ld', Math.round(126 * (1 - frac))); }
  function initHeroOnce() {
    if (initDone) return;
    initDone = true;
    poster.style.backgroundImage = `url('${POSTER_URL}')`;
    let started = false;
    const start = () => { if (started) return; started = true; loadBlob().catch(failVideo); };
    const img = new Image();
    img.onload = start; img.onerror = start; img.src = POSTER_URL;
    setTimeout(start, 4000);
  }
  async function loadBlob() {
    if (navigator.connection && navigator.connection.saveData) throw new Error('save-data');
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('http ' + res.status);
    const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0, lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value);
      got += value.length;
      const now = performance.now();
      if (now - lastRing > 100) { lastRing = now; setRing(Math.min(1, got / total)); }
    }
    clearTimeout(watchdog);
    setRing(1);
    video.src = URL.createObjectURL(new Blob(chunks, { type: VIDEO_TYPE }));
    video.load();
    video.addEventListener('loadeddata', () => {
      videoReady = true;
      hero.classList.add('video-ready');
      cueLabel.textContent = 'Défiler';
      onScroll();
      requestSeek(heroProgress() * video.duration);
    }, { once: true });
    video.addEventListener('error', failVideo, { once: true });
  }
  function failVideo() {
    videoReady = false;
    hero.classList.remove('video-ready');
    hero.classList.add('video-failed');
    poster.style.backgroundImage = `url('${FALLBACK_URL}')`;
    cueLabel.textContent = 'Défiler';
    setRing(1);
  }

  /* ---------- Les cinq conditions, évaluées en direct ---------- */
  let scrubOn = false;
  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    bands.forEach((b) => { b.op = -1; b.k = -1; b.on = null; });
    target = shown = heroProgress();
    updateBands(shown);
    kick();
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    bands.forEach((b) => { b.el.style.opacity = ''; b.el.style.removeProperty('--k'); b.el.classList.remove('is-on'); });
  }
  function applyHeroMode() {
    if (MQLS.some((m) => m.matches)) disableScrub(); else enableScrub();
  }
  const MQLS = GATES.map((q) => matchMedia(q));
  MQLS.forEach((m) => m.addEventListener('change', applyHeroMode));
  applyHeroMode();
})();
