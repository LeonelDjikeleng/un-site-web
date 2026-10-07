/*
 * Catalogue Milano Performance — données de la boutique.
 *
 * Source : produits repérés dans l'index du site milanoperformance.ca (octobre 2026).
 * En production, ces données viennent directement de Shopify (thème) : ce fichier
 * sert de maquette fonctionnelle et de liste de vérification.
 *
 * Règles :
 * - `url` pointe vers la vraie fiche Shopify (les URL existantes sont conservées).
 * - `prix` reste null tant qu'il n'est pas validé par Milano Performance
 *   (un prix affiché engage le commerçant, LPC). Mettre un nombre pour l'afficher.
 * - `maison` reste null quand la marque n'est pas confirmée.
 * - Aucune disponibilité n'est affichée : les stocks réels se confirment par téléphone ou courriel.
 */

export const BOUTIQUE = 'https://milanoperformance.ca';

export const CATEGORIES = {
  roues: { nom: 'Roues', glyph: 'roue' },
  echappement: { nom: 'Échappement', glyph: 'echappement' },
  fluides: { nom: 'Huiles et fluides', glyph: 'goutte' },
  freins: { nom: 'Freinage', glyph: 'disque' },
  moteur: { nom: 'Moteur et entretien', glyph: 'filtre' },
  suspension: { nom: 'Suspension', glyph: 'suspension' },
  transmission: { nom: 'Transmission', glyph: 'engrenage' },
  confort: { nom: 'Confort et carrosserie', glyph: 'cle' },
  accessoires: { nom: 'Accessoires', glyph: 'cle' },
};

export const MAISONS = {
  pakelo: { nom: 'Pakelo', recherche: 'pakelo' },
  'mclaren-car-care': { nom: 'McLaren Car Care', recherche: 'mclaren' },
  cinel: { nom: 'CINEL', recherche: 'cinel' },
  'evo-corse': { nom: 'EVO Corse', collection: '/collections/roues' },
  ragazzon: { nom: 'Ragazzon', collection: '/collections/echappement-ragazzon' },
  'liqui-moly': { nom: 'Liqui Moly', recherche: 'liqui moly' },
  pentosin: { nom: 'Pentosin', recherche: 'pentosin' },
  brembo: { nom: 'Brembo', recherche: 'brembo' },
};

const p = (nom, handle, categorie, maison = null, ref = null, extra = {}) => ({
  nom, url: `/products/${handle}`, categorie, maison, ref, prix: null, ...extra,
});

export const PRODUITS = [
  // Roues — EVO Corse (distributeur)
  p('X3MA Zero', 'x3mazero', 'roues', 'evo-corse', 'Compétition'),
  p('X3MA', 'x3ma-zero', 'roues', 'evo-corse', 'Compétition'),
  p('X3MA Forged', 'x3ma-forged', 'roues', 'evo-corse', 'Forgée'),
  p('SanremoCorsica', 'sanremocorse-15x6', 'roues', 'evo-corse', '15×6'),
  p('FormulaCorse', 'formulacorse', 'roues', 'evo-corse', 'Compétition'),
  p('Monte Carlo', 'montecarlo', 'roues', 'evo-corse', 'Rallye'),
  p('Neve', 'neve', 'roues', 'evo-corse', 'Rallye'),
  p('Capuchon de centre', 'center-cap', 'roues', null, 'Accessoire de roue'),
  p('Capuchon de centre (variante)', 'cap-de-centre', 'roues', null, 'Accessoire de roue'),
  p('Boulon de roue M14×1,5', 'boulon-de-roue-m14x1-5', 'roues', null, 'M14×1,5'),
  p('EVO Jack', 'evojack', 'accessoires', null, 'Cric'),

  // Échappement — Ragazzon
  p("Système d'échappement Ragazzon", 'systeme-dechappement-ragazzon', 'echappement', 'ragazzon', 'Système complet'),
  p('Échappement arrière Ragazzon', 'echappement-ragazzon', 'echappement', 'ragazzon', 'Section arrière'),
  p('Échappement central Ragazzon', 'echappement-central-ragazzon', 'echappement', 'ragazzon', 'Section centrale'),
  p('Downpipe Ragazzon', 'downpipe-ragazzon', 'echappement', 'ragazzon', 'Downpipe'),
  p('Tuyau intermédiaire Ragazzon', 'tuyau-intermediaire-ragazzon', 'echappement', 'ragazzon', 'Intermédiaire'),
  p('Silencieux Ragazzon', 'silencieux-ragazzon-2', 'echappement', 'ragazzon', 'Silencieux'),
  p('Flexible avec tube intermédiaire, groupe N, sans silencieux, inox', 'flexible-avec-tube-intermediaire-groupe-n-sans-silencieux-en-inox', 'echappement', null, 'Inox · groupe N'),

  // Huiles et fluides
  p('Global Gear DLS 75W90', 'global-gear-dls-75w90', 'fluides', 'pakelo', '75W90'),
  p('Krypton XT LA 5W30', 'krypton-xt-la-5w30', 'fluides', 'pakelo', '5W30'),
  p('Liqui Moly 5W40', 'liqui-moly-5w40', 'fluides', 'liqui-moly', '5W40'),
  p('Liqui Moly DCT 8100', 'liqui-moly-dct-8100', 'fluides', 'liqui-moly', 'Boîte DCT'),
  p('Pentosin CHF 11S', 'pentosin-chf-11s', 'fluides', 'pentosin', 'Hydraulique'),
  p('Huile moteur 5W20', 'huile-moteur-5w20', 'fluides', null, '5W20'),
  p('Huile pour transmission automatique', 'huile-pour-transmission-automatique', 'fluides', null, 'Boîte automatique'),
  p('Huile pour boîte manuelle', 'huile-pour-boite-manuelle', 'fluides', null, 'Boîte manuelle'),
  p('Urée', 'uree', 'fluides', null, 'Diesel'),

  // Freinage
  p('Disque de frein arrière Brembo', 'disque-de-frein-arriere-brembo-2', 'freins', 'brembo', 'Arrière'),
  p('Disque de frein avant', 'disque-de-frein', 'freins', null, 'Avant'),
  p('Plaquettes de frein arrière', 'plaquettes-de-freins-2', 'freins', null, 'Arrière'),

  // Moteur et entretien
  p('Filtre à huile moteur Fiat / Dodge / Jeep 1.4L', 'filtre-huile-moteur-fiat-500', 'moteur', null, '1.4L', { compat: 'Fiat, Dodge, Jeep — moteur 1.4L' }),
  p('Filtre à huile', 'filtre-huile', 'moteur', null, 'Filtration'),
  p('Filtre à huile (variante)', 'filtre-huile-1', 'moteur', null, 'Filtration'),
  p('Filtre à huile moteur', 'filtre-huile-moteur-2', 'moteur', null, 'Filtration'),
  p('Chaîne de distribution', 'chaine-de-distribution', 'moteur', null, 'Distribution'),
  p('Pompe à eau', 'pompe-a-eau', 'moteur', null, 'Refroidissement'),
  p("Réservoir d'expansion", 'reservoir-dexpansion', 'moteur', null, 'Refroidissement'),
  p('Pompe haute pression', 'pompe-haute-pression', 'moteur', null, 'Carburant'),
  p('Sonde à oxygène', 'sonde-a-oxygene', 'moteur', null, 'Capteur'),
  p('Sonde à oxygène arrière', 'sonde-oxygene-arriere', 'moteur', null, 'Capteur'),
  p('Panne à huile moteur', 'panne-a-huile-moteur', 'moteur', null, 'Carter'),
  p('Panne à huile moteur (variante)', 'panne-huile-moteur', 'moteur', null, 'Carter'),

  // Suspension
  p('Table de suspension avant', 'table-de-suspension-avant', 'suspension', null, 'Avant'),
  p('Table de suspension arrière', 'table-de-suspension-arriere', 'suspension', null, 'Arrière'),

  // Transmission
  p("Kit d'embrayage", 'kit-dembrayage', 'transmission', null, 'Embrayage'),

  // Confort et carrosserie
  p('Moteur de chaufferette', 'moteur-de-chaufferette', 'confort', null, 'Chauffage'),
  p('Pompe de lave-glace', 'pompe-de-lave-vitre', 'confort', null, 'Lave-glace'),
];

export function urlProduit(prod) { return BOUTIQUE + prod.url; }
export function urlMaison(m) {
  const d = MAISONS[m];
  if (!d) return BOUTIQUE + '/collections/all';
  return d.collection ? BOUTIQUE + d.collection : `${BOUTIQUE}/search?q=${encodeURIComponent(d.recherche)}`;
}
