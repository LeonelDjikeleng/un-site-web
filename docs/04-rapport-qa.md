# Rapport de contrôle qualité

Tests effectués le 7 octobre 2026 dans Chromium (Playwright), serveur local. Aucun test sur un vrai téléphone (environnement sans appareil) : à faire avant la mise en ligne.

## Technique

| Test | Résultat |
|---|---|
| Débordement horizontal à 360, 390, 768, 1440 px, 7 pages | Aucun (corrigé : en-tête et bloc adresse à 360 px) |
| Erreurs JavaScript, 7 pages × 4 largeurs | Aucune |
| Requêtes vers des tiers au chargement | Aucune (Google Maps seulement au clic) |
| Sans JavaScript | Contenu complet, hero en image fixe, catalogue remplacé par des liens vers les collections |
| « Réduire les animations » | Contenu visible, vidéo jamais demandée ; bascule en direct gérée |
| Menu mobile | Ouverture, fermeture, touche Échap, liens qui ferment le menu |
| Clavier | Lien d'évitement, ordre de tabulation logique, focus visible, diagnostic utilisable au clavier |
| Formulaire | Erreurs claires et focus sur le champ fautif ; préremplissage par l'URL ; courriel préparé et aperçu copiable |
| Boutique | 47 produits, filtres, recherche sans accents, état vide, URL partageable (`?cat=`, `?q=`) |
| Titres | Un seul H1 par page, hiérarchie respectée |
| Revue de texte (standard 10K) | Aucun tiret cadratin ni mot creux (« solutions », « sans couture »…) |

## Hero défilé

| Test | Résultat |
|---|---|
| Chargement | Affiche immédiate, vidéo en flux avec anneau, WebM VP9 (2,2 Mo) ou MP4 H.264 (3,8 Mo) selon le navigateur |
| Repli | Codec non pris en charge ou réseau coupé → image de fin, textes et boutons intacts (vérifié) |
| Test des coups de molette | Pas de 120 px : bandes lisibles pendant 7, 6, 5 et 5 crans ; pas de 360 px : aucune bande sautée |
| Lisibilité | Voile directionnel + ombre de texte sur chaque bande ; colonne de texte resserrée pour dégager la roue |

## Performance (accueil, réseau local)

| Mesure | Mobile 390 px | Ordinateur 1440 px |
|---|---|---|
| Poids au premier chargement | 284 Ko | 2,6 Mo (dont 2,2 Mo de vidéo, chargée après l'affiche) |
| Polices | 151 Ko (3 fichiers) | idem |
| JavaScript | 21 Ko | 21 Ko |
| CLS | 0,000 | 0,000 |

Toutes les images : AVIF + WebP (+ JPEG de repli), largeurs multiples, dimensions déclarées, chargement différé hors écran. Ensemble des images : 1,9 Mo pour tout le site.

## Creative QA (note sur 5)

| Bloc | Note | Commentaire |
|---|---|---|
| Direction artistique | 4,5 | Univers unique et reconnaissable sans logo : studio noir, lames de lumière, étrier rouge comme seul accent |
| Images | 4 | Parfaitement cohérentes (un seul studio), mais ce sont des illustrations : les photos réelles de l'atelier restent la priorité n° 1 |
| Motion | 4,5 | Un moment signature (le film du hero) + un moment interactif (diagnostic) ; le site reste beau immobile |
| UX et conversion | 4,5 | Qui/quoi/où/quoi faire lisible en 5 s ; rendez-vous visible partout ; objection « stock » traitée honnêtement |
| Mobile | 4 | Conçu pour le doigt (barre d'action, cartes horizontales) ; à valider sur un vrai téléphone |
| Cohérence | 4,5 | Les sections se répondent (noir studio ↔ fiche d'atelier claire) ; aucun gabarit répété deux fois de suite |

## Pièges rencontrés (à ajouter à MOI 2.0)

1. Le Chromium de Playwright ne décode pas le H.264 : servir aussi une version WebM VP9 (choisie par `canPlayType`), sinon le hero défilé ne peut pas être testé et certains navigateurs libres tombent en repli.
2. Capture pleine page au-delà d'environ 16 000 px : Chromium rend du vide. Capturer en faisant défiler écran par écran.
3. `pkill -f` dans une commande qui contient le même motif tue sa propre coquille : tuer par PID.
4. Une géométrie de révolution (`LatheGeometry`) avec deux sommets seulement sur sa longueur ne peut pas porter un dégradé de couleurs par sommet : subdiviser le profil.
