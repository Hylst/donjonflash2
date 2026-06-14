# Structure — DonjonFlash 2

## Arborescence monorepo
```
hylst.games/
├── donjonflash2/
│   ├── index.html          # Build single-file (~305 KB)
│   └── favicon.png         # Favicon (128×128)
├── donjon-flash-2-game-development/  # Sources (gitignore)
├── donjonflash/            # DonjonFlash original
├── synthrider/             # SynthRider
└── index.html              # Main menu
```

## Fichiers principaux
- `src/App.tsx` — Composant React principal (359 lignes)
- `src/game/engine.ts` — Logique du jeu
- `src/game/renderer.ts` — Rendu Canvas 2D
- `src/game/audio.ts` — Audio procedural
