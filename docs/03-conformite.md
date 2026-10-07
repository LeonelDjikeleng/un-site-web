# Fiche de conformité (Québec / Canada)

Conçu selon les exigences connues au 7 octobre 2026. Ce document n'est pas une attestation de conformité juridique.

## Ce qui a été mis en place

**Loi 25 (renseignements personnels)**
- Aucun témoin de suivi, aucun outil de statistiques, aucun pixel : vérifié, aucune requête vers un tiers au chargement (contrôle automatique sur 4 largeurs d'écran).
- Polices hébergées sur le site (aucune adresse IP envoyée à Google Fonts).
- Carte Google chargée **seulement au clic**, avec une explication avant le clic ; lien « Itinéraire » toujours disponible.
- Formulaire de rendez-vous : prépare un courriel dans l'application de la personne (aucun service tiers, aucune donnée transmise avant qu'elle envoie elle-même) ; finalité indiquée ; données minimales (nom + un moyen de contact) ; aucune case précochée ; aucune infolettre.
- Politique de confidentialité (`confidentialite.html`) reliée depuis chaque page et depuis le formulaire, avec la section témoins.
- Responsable de la protection des renseignements personnels : par défaut la personne ayant la plus haute autorité (nom à confirmer).

**Charte de la langue française**
- Site entièrement en français, typographie française (espaces insécables, guillemets « »).

**Protection du consommateur**
- Aucun prix affiché tant qu'il n'est pas validé (un prix annoncé engage le commerçant). Le système affiche des prix complets dès qu'ils sont saisis.
- Disponibilité jamais présentée comme réelle : avertissement visible sur l'accueil, la boutique et chaque carte produit (« disponibilité à confirmer »).
- Aucun avis, chiffre, certification, garantie ou année d'expérience inventés.
- Images 3D présentées comme des illustrations (légendes « Illustration », mentions légales).
- Marques de tiers citées en texte seulement (aucun logo), avec mention d'usage d'identification ; seule affiliation déclarée : distribution EVO Corse (source : site existant).

**Accessibilité (cible WCAG 2.1 AA)**
- Contrastes calculés : texte courant ≥ 4,5:1 sur chaque fond (rouge étrier #C8211E réservé aux boutons avec texte blanc 5,7:1 ; variante #FF5A4E pour le texte rouge sur fond noir, 6,4:1).
- Lien d'évitement, repères `header`/`nav`/`main`/`footer`, un seul H1 par page, focus visible, cibles tactiles ≥ 44 px, champs à 16 px.
- « Réduire les animations » respecté en direct : la vidéo n'est pas chargée, tout le contenu est visible immédiatement.
- Contenu essentiel et appels à l'action fonctionnels sans JavaScript.

## Ce que Milano Performance doit faire

- Faire valider la politique de confidentialité et les mentions par un conseiller juridique.
- Confirmer le nom et le titre du responsable de la protection des renseignements personnels.
- Fournir le nom légal et le NEQ (mentions légales).
- En production Shopify : activer la bannière de consentement de Shopify avant tout outil de mesure ; déclarer Shopify (hébergement hors Québec possible) et réaliser l'évaluation des facteurs relatifs à la vie privée (EFVP) requise pour ce transfert.
- Tenir un registre des incidents de confidentialité.
- Valider chaque prix avant de l'afficher (`catalogue.js`, champ `prix`).
- Nous signaler tout nouvel outil qui collecte des données (pixel, CRM, clavardage, réservation, infolettre).
