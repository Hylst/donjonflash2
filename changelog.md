# Changelog — DonjonFlash 2

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
