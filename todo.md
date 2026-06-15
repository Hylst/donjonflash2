# TODO — DonjonFlash 2

## Intégration plateforme
- [x] Corriger vite.config.ts (ajouter base: '/donjonflash2/')
- [x] Ajouter SEO meta tags (og, twitter, canonical, robots)
- [x] Renommer package name
- [x] Build le jeu (npm run build, single-file ~277 KB)
- [x] Copier dist/ → donjonflash2/ dans le monorepo
- [x] Ajouter carte au main menu
- [x] Générer l'image OG (HuggingFace FLUX.1-dev)
- [x] Générer favicon (PIL 32×32)
- [x] Créer repo GitHub `Hylst/donjonflash2`
- [ ] Déployer via Coolify
- [ ] Tester l'accès : https://games.hylst.fr/donjonflash2/

## Corrections (v1.1.0)
- [x] Fix sélection classe (toujours Guerrier pendant onboarding)
- [x] Fix double-feu Space/click sur le titre
- [x] Touches 1/2/3 autorisées pendant onboarding
- [x] Touch D-pad : onTouchMove pour suivre le doigt
- [x] Touch onboarding : boutons Continuer/Retour
- [x] Boutons classe tactiles (écran titre + onboarding)
- [x] Visée souris (mousemove → getAttackAngle)
- [x] Onboarding adaptatif par classe (3 pages différentes)
- [x] Lore ajouté aux cartes classes
- [x] Fix HUD health bar débordant sur texte (déplacé à droite)
- [x] Touch controls : ajout click souris pour tous les boutons
- [x] D-pad : touch-none → touch-manipulation (events natifs)
- [x] Bouton H pour retour menu depuis la pause

## Mode 2 joueurs — Écran partagé

### Architecture
- [ ] Refactorer `GameState.player` → `players: [PlayerState, PlayerState]`
- [ ] Même liste d'ennemis pour les 2 joueurs
- [ ] Positions distinctes, stats indépendantes
- [ ] HUD double (barre de vie × 2, score × 2)
- [ ] Camera centrée entre les 2 joueurs
- [ ] Split-screen ou vue partagée (à décider)

### Contrôles — Duo de claviers
- [ ] P1 : ZQSD / WASD / Flèches + Espace (attaque) + MAJ (dash) + E (sort)
- [ ] P2 : IJKL + U (attaque) + O (sort) + P (dash)
- [ ] Détection automatique du mode 2P au lancement

### Contrôles — Clavier + Souris
- [ ] P1 : Clavier (WASD + touches)
- [ ] P2 : Souris (déplacement = clic maintenu, attaque = clic droit)
- [ ] Ou inversement (P1 souris, P2 clavier)

### Contrôles — Clavier + Touch
- [ ] P1 : Clavier (WASD + touches)
- [ ] P2 : Écran tactile (D-pad + boutons d'action)
- [ ] P2 : Manette Bluetooth (joystick + boutons)

### Contrôles — 2 Manettes
- [ ] P1 : Manette 1 (left stick + A/X attaque + B/O dash + Y/△ sort)
- [ ] P2 : Manette 2 (même mapping)
- [ ] Support Web Gamepad API

### Gameplay 2 joueurs
- [ ] Dégâts d'équipe OFF par défaut (toggle option)
- [ ] Partage des potions entre les 2 joueurs
- [ ] Revive : un joueur KO → l'autre peut le ressusciter (3s, item nécessaire)
- [ ] Boss scale avec le nombre de joueurs (PV × 1.5, dégâts × 1.3)
- [ ] Score combiné, classement partagé

### UI / HUD
- [ ] Afficher les 2 barres de vie (P1 gauche, P2 droite)
- [ ] Afficher les 2 scores / combos
- [ ] Indicateur de distance entre joueurs
- [ ] Mini-map avec les 2 positions

### Menu
- [ ] Option "1 joueur" / "2 joueurs" sur l'écran titre
- [ ] Choix des classes pour P1 et P2
- [ ] Sélection des contrôles par joueur

## Améliorations futures
- [ ] Ajouter un almanach des ennemis
- [ ] Ajouter mode Endless avec leaderboard
- [ ] Sauvegarde localStorage
- [ ] Optimiser performances mobiles
