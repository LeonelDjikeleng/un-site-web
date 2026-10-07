/*
 * Systèmes du diagnostic interactif : données et rendu du panneau. Partagé par
 * diagnostic.js (navigateur) et tools/prerender.mjs (panneaux écrits d'avance, visibles sans JavaScript).
 * Ne décrit que des services et des pièces réellement présents au catalogue.
 */
export const SYSTEMES = {
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

export function panelHTML(id) {
  const s = SYSTEMES[id];
  return `
    <div class="panel-swap" data-sys="${id}">
      <p class="kicker kicker--plain">Système · ${s.nom}</p>
      <h3 class="h3">${s.titre}</h3>
      <p>${s.texte}</p>
      <ul>${s.points.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="btn-row">
        <a class="btn btn--primary" href="contact.html?service=${encodeURIComponent(s.nom)}">Prendre rendez-vous</a>
        <a class="btn btn--ghost" href="boutique.html?cat=${s.cat}">Voir les pièces</a>
      </div>
    </div>`;
}
