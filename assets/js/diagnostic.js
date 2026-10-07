/*
 * « Promenez la lumière sur la voiture » : le moment interactif du site.
 * Souris : la lumière suit le pointeur et révèle le plan. Doigt et clavier : les points
 * et les boutons de système. Le contenu ne décrit que des services et des pièces
 * réellement présents au catalogue (voir docs/01-dossier-milano-performance.md).
 */
const SYSTEMES = {
  moteur: {
    nom: 'Moteur',
    titre: 'Entretien moteur',
    texte: "Vidange, filtres et fluides avec des produits adaptés, et les pièces d'entretien courantes de la distribution et du refroidissement.",
    points: ['Huiles moteur Pakelo, Liqui Moly', 'Filtres à huile, dont Fiat / Dodge / Jeep 1.4L', 'Chaîne de distribution, pompe à eau, réservoir d\'expansion', 'Sondes à oxygène, pompe haute pression'],
    cat: 'moteur',
  },
  freins: {
    nom: 'Freinage',
    titre: 'Freinage',
    texte: 'Disques et plaquettes remplacés avec des pièces de qualité, pour retrouver un freinage franc et régulier.',
    points: ['Disques de frein avant et arrière', 'Disque arrière Brembo', 'Plaquettes de frein', 'Marques au catalogue : Brembo, Textar'],
    cat: 'freins',
  },
  suspension: {
    nom: 'Suspension',
    titre: 'Suspension et train roulant',
    texte: "Un bruit sur les bosses, une direction imprécise, une usure de pneus inégale : la suspension se vérifie pièce par pièce.",
    points: ['Tables de suspension avant et arrière', 'Marques au catalogue : Bilstein, Powerflex'],
    cat: 'suspension',
  },
  transmission: {
    nom: 'Transmission',
    titre: 'Embrayage et boîte',
    texte: "Embrayage qui patine, passages durs : l'embrayage et les huiles de boîte se choisissent selon la transmission de votre voiture.",
    points: ["Kit d'embrayage", 'Huiles pour boîte manuelle et automatique', 'Liqui Moly DCT 8100 pour boîtes à double embrayage', 'Pakelo Global Gear DLS 75W90'],
    cat: 'transmission',
  },
  echappement: {
    nom: 'Échappement',
    titre: 'Échappement Ragazzon',
    texte: 'Systèmes complets ou sections : downpipe, tuyau intermédiaire, échappement central et arrière, silencieux.',
    points: ["Système d'échappement complet", 'Downpipe et tuyau intermédiaire', 'Échappements central et arrière, silencieux', 'Flexible inox groupe N'],
    cat: 'echappement',
  },
  roues: {
    nom: 'Roues',
    titre: 'Roues EVO Corse et CINEL',
    texte: "Des roues issues de la compétition, choisies selon votre voiture et votre usage. Milano Performance est distributeur EVO Corse.",
    points: ['EVO Corse : X3MA, FormulaCorse, SanremoCorsica, Monte Carlo, Neve', 'CINEL : jantes forgées et flow-formed', 'Boulons M14×1,5 et capuchons de centre'],
    cat: 'roues',
  },
};

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
    panel.innerHTML = `
      <div class="panel-swap">
        <p class="kicker kicker--plain">Système · ${s.nom}</p>
        <h3 class="h3">${s.titre}</h3>
        <p>${s.texte}</p>
        <ul>${s.points.map((x) => `<li>${x}</li>`).join('')}</ul>
        <div class="btn-row">
          <a class="btn btn--primary" href="contact.html?service=${encodeURIComponent(s.nom)}">Prendre rendez-vous</a>
          <a class="btn btn--ghost" href="boutique.html?cat=${s.cat}">Voir les pièces</a>
        </div>
      </div>`;
    panel.appendChild(chips);
    [...hotspots, ...chips.children].forEach((h) => h.setAttribute('aria-pressed', String(h.dataset.system === id)));
  }

  plan.addEventListener('click', (e) => { const h = e.target.closest('.hotspot'); if (h) show(h.dataset.system); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('.chip-btn'); if (b) show(b.dataset.system); });

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
