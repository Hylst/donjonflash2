# TODO — DonjonFlash 2

## Intégration plateforme
- [x] Corriger vite.config.ts (ajouter base: '/donjonflash2/')
- [x] Ajouter SEO meta tags (og, twitter, canonical, robots)
- [x] Build le jeu (npm run build, single-file ~287 KB)
- [x] Copier dist/ → donjonflash2/ dans le monorepo
- [x] Ajouter carte au main menu
- [x] Générer l'image OG (HuggingFace FLUX.1-dev)
- [x] Générer favicon (PIL 32×32)
- [x] Créer repo GitHub `Hylst/donjonflash2`
- [ ] Déployer via Coolify
- [ ] Tester l'accès : https://games.hylst.fr/donjonflash2/

## v1.2.0 — Corrections
- [x] Fix HUD: coeur ❤️ restauré dans barre de vie
- [x] Fix HUD: barre de vie repositionnée (après texte classe, pas de chevauchement)
- [x] Fix HUD: bonus icons colorées (🏃VIT, ⚔️PUI, 🛡️BOUCLIER)
- [x] Fix onboarding: panel responsive (aspect 16/10, centré verticalement)
- [x] Fix onboarding: hauteur adaptative (plus de perte d'espace)
- [x] Touch controls: ajout click souris pour tous les boutons
- [x] D-pad: touch-none → touch-manipulation
- [x] Touche H pour retour menu depuis la pause

## v1.2.0 — Nouvelles fonctionnalités
- [x] Écran titre: lore/storytelling (2 lignes d'intro)
- [x] Écran titre: sélecteur 1 joueur / 2 joueurs
- [x] Écran titre: sélecteur de difficulté (5 niveaux)
- [x] Difficulté: très facile / facile / normal / difficile / très difficile
- [x] Difficulté: multiplicateurs PV, dégâts, nombre d'ennemis
- [x] Caisses à casser (2-3 par salle, drops loot)
- [x] Caisses: rendu bois avec planches, clous, fissures

## v1.2.0 — Audio
- [x] Drone ambient (sine 55Hz + triangle 82Hz, LFO modulation)
- [x] Progression harmonique Am - F - C - G (4 accords)
- [x] Hi-hat sur les beats (intensity > 1)
- [x] Delay atmosphérique (0.35s, feedback 18%)
- [x] SFX épée enrichi (swoosh métallique + impact + anneau)
- [x] SFX arc (twang + sifflement)
- [x] SFX dague (flick métallique rapide)
- [x] SFX sort (chime magique montant + sparkle)
- [x] SFX blessure (crunch + echo retardé)
- [x] SFX bouclier (clang métallique)
- [x] SFX ennemi mort (burst gore + libération d'âme)
- [x] SFX caisse (crack bois + shatter + debris)
- [x] SFX porte (grincement + chime)

## Mode 2 joueurs — Écran partagé
- [ ] Refactorer `GameState.player` → `players: [PlayerState, PlayerState]`
- [ ] Même liste d'ennemis pour les 2 joueurs
- [ ] Positions distinctes, stats indépendantes
- [ ] HUD double (barre de vie × 2, score × 2)
- [ ] Camera centrée entre les 2 joueurs

### Contrôles — Duo de claviers
- [ ] P1 : ZQSD + Espace (attaque) + MAJ (dash) + E (sort)
- [ ] P2 : IJKL + U (attaque) + O (sort) + P (dash)

### Contrôles — Clavier + Souris
- [ ] P1 : Clavier (WASD + touches)
- [ ] P2 : Souris (clic maintenu = déplacement, clic droit = attaque)

### Contrôles — Clavier + Touch
- [ ] P1 : Clavier (WASD + touches)
- [ ] P2 : Écran tactile (D-pad + boutons d'action)

### Contrôles — 2 Manettes
- [ ] P1 : Manette 1 (joystick + A attaque + B dash + Y sort)
- [ ] P2 : Manette 2 (même mapping)
- [ ] Support Web Gamepad API

### Gameplay 2 joueurs
- [ ] Dégâts d'équipe OFF par défaut
- [ ] Revive : un joueur KO → l'autre peut le ressusciter
- [ ] Boss scale avec le nombre de joueurs (PV ×1.5, dégâts ×1.3)

## Améliorations futures
- [ ] Ajouter un almanach des ennemis
- [ ] Ajouter mode Endless avec leaderboard
- [ ] Sauvegarde localStorage
- [ ] Optimiser performances mobiles
