# Direction artistique, storyboard et plan média

Phase C de MOI 2.0. Ces documents ont été écrits avant le code ; le code les applique.

## 1. Brief de direction artistique

```
CONCEPT : « Sous la lumière de l'atelier ».
  Une voiture sombre dans un studio noir, révélée par des lames de lumière.
  Ce qui est caché devient visible : c'est exactement ce que fait un spécialiste.
ARCHÉTYPE : automobile + local premium · immersion 3,5
  (cinématique sur le hero, éditorial ensuite, utilitaire et clair dans la boutique)
PERSONNALITÉ : précis, passionné, posé · à éviter : « tuning », clinquant, gaming
PALETTE (rôles) :
  --c-night   #090B0D  fond, studio (jamais #000)
  --c-graph   #12161A  surfaces sombres
  --c-steel   #8E98A3  texte secondaire sur sombre
  --c-alu     #E7EAED  sections claires (fiche technique)
  --c-ink     #0E1114  texte sur clair
  --c-caliper #C8211E  rouge étrier : l'action, rien d'autre
  (+ --c-signal #FF5A4E, variante claire de l'étrier pour les petits textes sur noir, contraste AA)
TYPOGRAPHIE :
  Saira (variable : largeur 50-125 %, graisse 100-900, OFL) : titres, logotype, chiffres.
    Ses formes carrées et arrondies rappellent les instruments et le lettrage
    des voitures italiennes des années 60-70 (Eurostile, Novarese, Turin), sans le copier.
    Étendue (125 %) pour le logotype et les sur-titres, condensée (75-85 %) pour les grands titres.
  Hanken Grotesk (variable, OFL) : texte courant, calme et très lisible.
  JetBrains Mono 400 (OFL) : références techniques (75W90, M14×1,5, 15×6), étiquettes de fiche.
COMPOSITION : grille 12 colonnes, marges larges ; alternance sombre (studio) / claire (fiche d'atelier).
PROFONDEUR : couches + lumière ; aucune ombre portée de carte ; filets de 1 px.
STYLE IMAGE : rendus 3D de studio, voiture graphite, fond noir bleuté, softbox plafond,
  lames verticales mobiles, ligne horizontale sur le flanc ; un seul point chaud : l'étrier rouge.
ICÔNES : trait 1,5 px, angles nets, dessinées pour le sujet (roue, échappement, goutte, disque…).
BOUTONS : rectangles à angles de 2 px ; principal rouge étrier ; secondaire filet ; lien souligné.
  Survol : une lame de lumière traverse le bouton (même geste que le hero).
CARTES : uniquement pour les produits (un objet = une carte) ; pas d'ombre, filet + lumière au survol.
MOTION : sec et précis, jamais élastique. Entrées 450-800 ms, ease-out. Un seul moment signature.
DÉTAIL SIGNATURE : la « lame de lumière » : elle révèle la voiture dans le hero, puis devient
  le langage de toute l'interface (survol des boutons et des cartes, séparateurs, chargement).
  + l'étrier rouge comme unique couleur d'action.
RÉFÉRENCES (pourquoi ça fonctionne) :
  1. Sites de constructeurs de supercars : un seul objet, une seule lumière → la retenue fait le luxe.
  2. Photographie automobile « light painting » : la forme n'existe que là où la lumière passe.
  3. Fiches techniques de jantes de compétition : chiffres en chasse fixe, unités, tolérances
     → la crédibilité vient de la précision du vocabulaire.
```

## 2. Storyboard narratif

| Section | Fonction narrative | Média | Mouvement | CTA | Transition |
|---|---|---|---|---|---|
| Hero | Promesse : qui, quoi, où | Vidéo 3D défilée : détail roue + étrier → voiture entière | La caméra recule au rythme du défilement ; titres en 3 temps | Prendre rendez-vous · Voir la boutique | Le noir du studio continue dans la section suivante |
| Manifeste | Différence : une italienne ne se répare pas au hasard | Typographie seule | Révélation ligne par ligne | — | Un filet de lumière descend vers les marques |
| Marques prises en charge | Preuve : « ils font ma voiture » | Noms en grande typo étendue | Défilement doux, pause au survol | Autre marque ? Écrivez-nous | Bascule vers le clair |
| L'atelier (services) | Offre | Rendus de détail (roue, étrier, flanc) | Apparitions échelonnées | Voir l'atelier | — |
| Diagnostic interactif | Expérience : explorer la voiture | Plan technique dessiné | Moment interactif : le visiteur promène la lumière sur la voiture | Demander un diagnostic | — |
| McLaren | Différence premium | Rendu plein cadre, très sombre | Image qui s'agrandit au défilement | Parler à un spécialiste | Retour au clair |
| Boutique / maisons | Offre produits | Rendus par famille (roue, échappement, goutte d'huile, finition) | Survol : lame de lumière | Voir la boutique | — |
| Disponibilité | Réassurance (stock) | Typo + icône | — | Demander une pièce | — |
| Visite | Réassurance locale | Plan, adresse | Carte chargée au clic | Itinéraire · Appeler | — |
| CTA final | Passage à l'action | Plan final de la vidéo | Fondu | Prendre rendez-vous | Pied de page |

## 3. Plan média

| Section | Média | Fonction | Ratio mobile / ordinateur | Source | Statut |
|---|---|---|---|---|---|
| Hero | Vidéo défilée 6 s | Faire ressentir + thèse | image fixe 4:5 / vidéo 16:9 | Rendu 3D (studio maison) | Fait |
| Hero mobile | Image fixe composée pour le portrait | Même thèse, sans vidéo | 4:5 | Rendu 3D | Fait |
| Atelier | 3 détails (roue/étrier, flanc, arrière) | Expliquer, rythmer | 4:5 / 4:3 | Rendu 3D | Fait |
| Maisons | Roue (CINEL, EVO CORSE), échappement (Ragazzon), goutte (Pakelo), finition (McLaren Car Care) | Identité par famille | 1:1 / 16:9 | Rendu 3D (illustrations, jamais présentées comme les produits réels) | Fait |
| Produits | Pictogrammes techniques par catégorie | Expliquer | 1:1 | SVG codé | Fait. Photos produits réelles : fournies par Shopify en production |
| Atelier réel, équipe, façade | Photos réelles | **Prouver** | 4:5 / 16:9 | Client | **À fournir** (liste de prises de vue dans le README) |

Règle de vérité : les rendus 3D sont des **ambiances**. Ils ne représentent ni les locaux, ni l'équipe, ni les produits vendus. Une mention figure dans les mentions légales, et chaque rendu placé près d'une marque porte la légende « Illustration ».

## 4. Partition motion

```
PERSONNALITÉ : sec et précis
MOMENT SIGNATURE : la caméra recule du détail (étrier rouge) à la voiture entière, au défilement
ENTRÉE DE PAGE : logotype → sur-titre (0) → titre (120 ms) → texte (250 ms) → CTA (350 ms) ; < 1 s
DÉFILEMENT : apparitions courtes (16-24 px), séries décalées de 80 ms, plafonnées à 5
TRANSITIONS : le noir du studio s'étire ; passage au clair par une lame de lumière horizontale
INTERACTIONS : lame de lumière au survol (souris) ; appui = échelle 0,98 (tactile) ; focus rouge
INTERACTIF : diagnostic : la lumière suit le pointeur/le doigt sur le plan, les systèmes s'allument
AMBIANCE : grain très léger fixe ; aucune boucle infinie visible
RÉDUIT : image fixe à la place de la vidéo, tout visible immédiatement, aucune translation
```
