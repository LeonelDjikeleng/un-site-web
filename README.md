# Milano Performance — site web

Refonte complète de [milanoperformance.ca](https://milanoperformance.ca) : atelier et boutique spécialisés en voitures italiennes et de performance à Québec (Alfa Romeo, Fiat, Mini, McLaren).

Concept : **« Sous la lumière de l'atelier »**. Une voiture sombre dans un studio noir, révélée par des lames de lumière ; l'étrier de frein rouge est la seule couleur d'action. Voir [`docs/02-direction-artistique.md`](docs/02-direction-artistique.md).

## Aperçu local

Le site est en HTML, CSS et JavaScript, sans framework ni étape de compilation.

```bash
python3 -m http.server 8000      # puis http://localhost:8000
```

Ouvrir `index.html` en double-cliquant fonctionne aussi, mais le hero affiche alors l'image fixe : les navigateurs bloquent le chargement de la vidéo en `file://` (comportement prévu, c'est le mode de repli).

## Structure

```
index.html             Accueil : hero défilé, manifeste, atelier, diagnostic interactif, McLaren, maisons, visite, FAQ
atelier.html           Services détaillés, offre McLaren, étapes, FAQ
boutique.html          Maisons + catalogue filtrable (données : assets/js/catalogue.js)
contact.html           Formulaire de rendez-vous / demande de pièce (prépare un courriel, aucun tiers)
confidentialite.html   Politique Loi 25 et témoins
mentions-legales.html  Mentions, marques, crédits, accessibilité
404.html
partials/              En-tête et pied de page communs
tools/build.py         Réinjecte partials/ dans toutes les pages
tools/process_media.py Encode les rendus en AVIF/WebP/JPEG + vidéo défilée
tools/studio/          Studio 3D (three.js) qui produit toutes les images et la vidéo
docs/                  Dossier, registre des faits, direction artistique, conformité, QA
```

## Modifier le site

- **En-tête ou pied de page** : modifier `partials/header.html` ou `partials/footer.html`, puis `python3 tools/build.py`.
- **Couleurs, typographie, espacements, durées d'animation** : variables en tête de `assets/css/main.css`.
- **Catalogue** : `assets/js/catalogue.js`. Chaque produit pointe vers sa vraie fiche Shopify (`/products/…`). Le champ `prix` reste `null` tant que le prix n'est pas validé ; mettre un nombre l'affiche (prix complet, seules les taxes s'ajoutent). Aucune disponibilité n'est affichée.
- **Coordonnées** : rechercher `581 500-5665`, `+15815005665` et `contact@milanoperformance.ca` dans tous les fichiers.
- **Heures d'ouverture** : emplacements marqués `À COMPLÉTER` dans `index.html` et `contact.html`.

## Médias

Toutes les images et la vidéo sont des **rendus 3D d'illustration** produits par `tools/studio/` (three.js dans Chromium sans écran), à partir du modèle « Car Concept » (Eric Chadwick, Darmstadt Graphics Group, CC BY 4.0) repeint, sans logos, et d'objets modélisés pour le site (échappement en titane, gouttes d'huile). Même studio, même lumière, même étalonnage : l'univers visuel est cohérent d'une image à l'autre. Ils ne représentent ni l'atelier, ni l'équipe, ni les produits vendus (mention dans les mentions légales et légende « Illustration »).

Régénérer :

```bash
cd tools/studio && npm i three@0.170.0
curl -LO https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb
python3 -m http.server 8899 --bind 127.0.0.1 &
N=144 node run.mjs hero2.mjs out/hero 1920 1080        # vidéo du hero (≈1 min/image en logiciel)
./stills.sh                                             # images fixes
python3 -I ../process_media.py out/hero out/stills      # encodage vers assets/
```

### Photos réelles à fournir (priorité n° 1)

Les rendus donnent l'univers ; seules de vraies photos prouvent l'atelier. Liste de prises de vue (téléphone récent, lumière du jour, à l'horizontale **et** à la verticale) :

1. Façade et entrée, de face et de trois quarts (page Contact, section « Nous trouver »).
2. Intérieur de l'atelier, plan large, rangé, lumières allumées (atelier, hero mobile).
3. Une voiture cliente sur le pont (avec autorisation du propriétaire, plaque masquée) ×2.
4. Gestes en gros plan : mains + outil, roue démontée, étrier ×3 (services).
5. Le propriétaire ou l'équipe au travail, naturel ×2 (confiance, section McLaren).
6. Produits en boutique : roues EVO Corse / CINEL, échappement Ragazzon, bidons Pakelo ×4 (maisons).

Les cadres d'image ont des ratios fixes (`aspect-ratio`) : une photo remplace un rendu sans toucher la mise en page.

## Hero défilé (standard « 10K »)

`assets/js/hero.js` : la vidéo (H.264, image clé toutes les 8 images) est chargée en Blob avec un anneau de progression honnête, le temps affiché est lissé indépendamment de la fréquence d'écran, les recherches temporelles sont sérialisées. Cinq conditions donnent une image fixe composée à la place (téléphone, tablette en portrait, pointeur tactile en portrait, téléphone en paysage, mouvement réduit) ; elles sont identiques dans `main.css` et `hero.js` et réévaluées en direct.

## Mise en production (Shopify)

Ce dépôt est la maquette fonctionnelle et la référence de design. En production, la boutique reste sur Shopify :

1. Porter les gabarits dans un thème Shopify (sections Liquid) en gardant le CSS et le JS tels quels.
2. Remplacer `catalogue.js` par les données Shopify (collections, produits, prix réels, images produits).
3. Conserver les URL `/products/…` et `/collections/…` ; rediriger en 301 les anciennes pages (`/pages/about-us` → `/#maison`, `/pages/contact` → `/contact`).
4. Shopify dépose ses propres témoins (panier, statistiques) : activer la bannière de consentement de Shopify (Customer Privacy) avant tout outil de mesure.
5. Mettre à jour `og:image` / `og:url` (commentaires `DEPLOY STEP`).
6. Version anglaise : la structure est prête à être dupliquée sous `/en/` (la version française doit rester au moins aussi complète).

## Licences

- Polices : Saira, Hanken Grotesk, JetBrains Mono — SIL Open Font License 1.1.
- Modèle 3D : « Car Concept », CC BY 4.0 (attribution dans `mentions-legales.html`).
- Code : propriété de Milano Performance.
