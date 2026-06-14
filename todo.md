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

## Améliorations futures
- [ ] Mode 2 joueurs local (écran partagé)
- [ ] Ajouter un almanach des ennemis
- [ ] Ajouter mode Endless avec leaderboard
- [ ] Sauvegarde localStorage
- [ ] Optimiser performances mobiles
