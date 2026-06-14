# DonjonFlash 2

**Action-RPG tactique procedural — vagues d'assaut geometriques.**

Joue sur : [games.hylst.fr/donjonflash2/](https://games.hylst.fr/donjonflash2/)

## Comment jouer
Choisis ta classe de heros, affronte des vagues d'ennemis proceduraux, collecte le loot et monte en niveau. Explore des donjons infinis avec des boss tous les 5 niveaux.

## Controles
| Action | Clavier | Tactile |
|--------|---------|---------|
| Deplacement | WASD / Fleches | Joystick virtuel |
| Attaque primaire | Clic gauche / Espace | bouton attaque |
| Attaque secondaire | Clic droit / Shift | bouton sort |
| Dash | Double tap direction | Swipe |
| Pause | Echap / P | bouton pause |

## Structure
```
donjon-flash-2-game-development/
├── src/
│   ├── App.tsx          # Composant principal React
│   ├── main.tsx         # Point d'entree
│   ├── game/
│   │   ├── engine.ts    # Logique du jeu
│   │   ├── renderer.ts  # Rendu Canvas 2D
│   │   └── audio.ts     # Audio procedural
│   ├── utils/
│   │   └── ...
│   └── index.css
├── public/
│   └── images/          # Assets (favicon, textures)
├── package.json
└── vite.config.ts
```

## Development
```bash
npm install
npm run dev      # Serveur de developpement
npm run build    # Build single-file
npm run preview  # Preview du build
```
