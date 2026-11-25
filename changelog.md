# Changelog — DonjonFlash 2

## [1.3.0] 2026-11-25

### Corrige
- Ecran titre sur mobile : le HUD Canvas, le selecteur de classe HTML et le bouton Infos se recouvraient. Le HUD et les controles tactiles ne sont plus dessines sur le titre ni pendant l'onboarding, le selecteur de classe reste disponible pendant l'onboarding et le bouton Infos passe en icone seule sous 640 px.
- Etiquette DIFFICULTE : espacement augmente avec les boutons de mode, et test de clic aligne sur la nouvelle position des cartes (8 px d'ecart corriger).
- Cartes de classe sur ecran court (320 x 568) : le texte d'ambiance recouvrait la ligne de statistiques. Les lignes se compressent sous 200 px de hauteur de carte et disparaissent sous 150 px.
- HUD en jeu : texte de classe raccourci sous 600 px, barre de vie reduite, indicateurs de cle et de porte deplaces dans un bandeau centre sous le HUD (ils recouvraient le score), icones de boost masquees sur mobile faute de place.

### Verifie
- QA Playwright sur 1792 x 984, 1440 x 900, 1024 x 768, 768 x 1024, 390 x 844 et 320 x 568 : aucun chevauchement de boutons HTML, aucune erreur console.
- Parcours complet : selection de classe au clic, onboarding, apparition des controles tactiles, attaque, aux six resolutions.
- Build unique de 295 712 octets, aucune requete externe supplementaire.

## [1.2.0] 2026-08-03

### Ajoute
- Bouton « Infos » sur l'ecran titre (coin superieur droit), ouvrant une modale avec la
  stack, les graphismes, la musique (approche hybride : morceau principal en fichier audio,
  effets et nappe de tension synthetises en direct), les interactions, l'architecture et les
  algorithmes notables (generation procedurale des salles et vagues d'ennemis). Etape 15 du
  chantier de retrofit decrit dans `todo.md` racine du monorepo.

### Corrige
- **Les boutons superposes conditionnes par la phase de jeu (selecteur de classe, boutons
  Continuer/Retour de l'onboarding) ne s'affichaient jamais en production**, decouvert en
  verifiant que le nouveau bouton Infos apparaissait bien. Cause : `const phase =
  stateRef.current?.phase` lit la ref une seule fois, au tout premier rendu du composant
  (avant meme l'initialisation de l'etat de jeu dans l'effet suivant), et rien ne
  redeclenchait de re-render React ensuite (la boucle de jeu dessine directement sur le
  Canvas via `requestAnimationFrame`, sans passer par du state React). `phase` restait donc
  fige a `undefined` pour toute la duree de vie du composant, rendant injoignables au
  clic/tactile la selection de classe et la navigation du tutoriel (les raccourcis clavier
  fonctionnaient, eux, car ils lisent la ref directement dans le gestionnaire d'evenement).
  Corrige avec un sondage leger (`setInterval` 150ms) qui synchronise un vrai `useState`
  React sur la phase reelle du jeu. **Verifie sur l'application reelle** : le selecteur de
  classe (« Guerrier », « Ranger ») est desormais visible et cliquable des le chargement,
  la ou il ne l'etait pas avant le correctif.

### Verifie
- Build propre, modale Infos testee a l'ouverture/fermeture, aucune erreur console, aucun
  404, aucun debordement horizontal en 390x844.

## [1.1.0] — 2025-06-15
### Fix
- Correction sélection classe pendant onboarding (toujours Guerrier avant)
- Double-feu Space/click sur le titre corrigé (keyHandledRef debounce)
- Touches 1/2/3 autorisées pendant l'onboarding
- Touch D-pad : ajout onTouchMove pour suivre le doigt glissant
- Touch onboarding : boutons Continuer/Retour sur mobile
- Boutons classe tactiles en haut de l'écran
- Visée souris (mousemove) avec fallback auto-aim
- Onglet souris caché quand la souris sort du canvas

### Amélioration
- Onboarding adaptatif par classe (3 pages spécifiques à chaque héros)
- Lore ajouté aux cartes classes sur l'écran titre
- Cartes classes : stats affichées sous forme compacte

## [1.0.0] — 2025-06-15
### Ajout
- Premier jeu : **DonjonFlash 2** (`/donjonflash2/`)
- Action-RPG tactique procédural
- Vagues d'assaut géométriques
- Classes de héros avec progression
- Donjons infinis avec boss
- Audio procédural (Web Audio API)
- Rendu Canvas 2D
- Contrôles tactiles et clavier
- Meta tags SEO complets
