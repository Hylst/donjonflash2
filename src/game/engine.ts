// ============================================================
// DONJON FLASH — Advanced Game Engine v2
// Par Hylst - Geoffroy avec l'aide d'une IA
// ============================================================

export interface Vec2 {
  x: number;
  y: number;
}

const WALL_THICKNESS = 28;
const SPAWN_BUFFER = 10;

export type DungeonMode = "grande_salle" | "couloirs" | "labyrinthe" | "arena";
export type HeroClass = "guerrier" | "ranger" | "filou";
export type ProjectileKind = "arrow" | "dagger" | "spell";
export type PickupKind = "scroll" | "food" | "potion_speed" | "potion_power" | "magic_shield";
export type SoundEvent = "attack" | "arrow" | "dagger" | "spell" | "pickup" | "hurt" | "shield" | "enemy_die" | "key" | "door" | "dash" | "room" | "select" | "pause" | "level_up" | "victory";

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: "pillar" | "wall" | "rubble";
}

export interface Enemy {
  id: number;
  pos: Vec2;
  vel: Vec2;
  size: number;
  speed: number;
  alive: boolean;
  hp: number;
  maxHp: number;
  hitTimer: number;
  spawnAnim: number; // 0-1 fade in
  deathTimer: number;
}

export interface Projectile {
  id: number;
  kind: ProjectileKind;
  pos: Vec2;
  vel: Vec2;
  angle: number;
  radius: number;
  damage: number;
  life: number;
  pierce: number;
  owner: "hero";
}

export interface Pickup {
  id: number;
  kind: PickupKind;
  pos: Vec2;
  size: number;
  bob: number;
  collected: boolean;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  type: "spark" | "blood" | "dust" | "key_sparkle" | "magic";
}

export interface FloatingText {
  pos: Vec2;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vel: Vec2;
  size: number;
}

export interface KeyItem {
  pos: Vec2;
  collected: boolean;
  size: number;
  bobPhase: number;
  glowPulse: number;
}

export interface Torch {
  x: number;
  y: number;
  intensity: number;
  phase: number;
}

export type GamePhase = "fighting" | "key_spawned" | "room_clear" | "game_over" | "title" | "onboarding" | "paused" | "victory";

export interface CameraShake {
  intensity: number;
  duration: number;
  timer: number;
  offsetX: number;
  offsetY: number;
}

export interface GameState {
  phase: GamePhase;
  previousPhase: GamePhase;
  onboardingStep: number;
  roomLevel: number;
  roomsCleared: number;
  maxRooms: number;
  heroLevel: number;
  xp: number;
  xpToNext: number;
  score: number;
  health: number;
  maxHealth: number;

  player: Vec2;
  playerVel: Vec2;
  playerRadius: number;
  playerSpeed: number;
  heroClass: HeroClass;
  aimAngle: number;
  attackTimer: number;
  attackCooldown: number;
  dashTimer: number;
  dashCooldown: number;
  dashCooldownTimer: number;
  scrolls: number;
  damageBoostTimer: number;
  speedBoostTimer: number;
  shieldTimer: number;
  hurtCooldown: number;

  swordAngle: number;
  swordSwinging: boolean;
  swordTimer: number;
  swordDuration: number;
  swordCooldown: number;
  swordCooldownTimer: number;
  swordArcStart: number;
  swordArcLength: number;
  swordTrail: number[];

  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  key: KeyItem | null;
  particles: Particle[];
  floatingTexts: FloatingText[];
  torches: Torch[];

  roomWidth: number;
  roomHeight: number;
  dungeonMode: DungeonMode;
  pillars: Obstacle[];
  door: { x: number; y: number; w: number; h: number; open: boolean; openAnim: number };

  camera: CameraShake;

  lastTime: number;
  deltaTime: number;
  enemyIdCounter: number;
  projectileIdCounter: number;
  pickupIdCounter: number;
  keysDown: Set<string>;

  viewW: number;
  viewH: number;
  scale: number;

  combo: number;
  comboTimer: number;
  soundEvents: SoundEvent[];
}

export function createInitialState(vw: number, vh: number): GameState {
  return {
    phase: "title",
    previousPhase: "title",
    onboardingStep: 0,
    roomLevel: 0,
    roomsCleared: 0,
    maxRooms: 12,
    heroLevel: 1,
    xp: 0,
    xpToNext: 50,
    score: 0,
    health: 5,
    maxHealth: 5,

    player: { x: 450, y: 325 },
    playerVel: { x: 0, y: 0 },
    playerRadius: 13,
    playerSpeed: 160,
    heroClass: "guerrier",
    aimAngle: 0,
    attackTimer: 0,
    attackCooldown: 0.35,
    dashTimer: 0,
    dashCooldown: 1.1,
    dashCooldownTimer: 0,
    scrolls: 1,
    damageBoostTimer: 0,
    speedBoostTimer: 0,
    shieldTimer: 0,
    hurtCooldown: 0,

    swordAngle: 0,
    swordSwinging: false,
    swordTimer: 0,
    swordDuration: 0.22,
    swordCooldown: 0.3,
    swordCooldownTimer: 0,
    swordArcStart: 0,
    swordArcLength: Math.PI * 0.9,
    swordTrail: [],

    enemies: [],
    projectiles: [],
    pickups: [],
    key: null,
    particles: [],
    floatingTexts: [],
    torches: [],

    roomWidth: 900,
    roomHeight: 650,
    dungeonMode: "grande_salle",
    pillars: [],
    door: { x: 0, y: 0, w: 30, h: 60, open: false, openAnim: 0 },

    camera: { intensity: 0, duration: 0, timer: 0, offsetX: 0, offsetY: 0 },

    lastTime: 0,
    deltaTime: 0,
    enemyIdCounter: 0,
    projectileIdCounter: 0,
    pickupIdCounter: 0,
    keysDown: new Set(),

    viewW: vw,
    viewH: vh,
    scale: 1,

    combo: 0,
    comboTimer: 0,
    soundEvents: [],
  };
}

// ──────────────────────────────────────────────
// ROOM GENERATION
// ──────────────────────────────────────────────
function buildRoom(state: GameState): void {
  const w = state.roomWidth;
  const h = state.roomHeight;
  state.pillars = [];

  const level = state.roomLevel;
  const mode: DungeonMode =
    level <= 2 ? "grande_salle" :
    level % 5 === 0 ? "arena" :
    level % 4 === 0 ? "labyrinthe" :
    level % 3 === 0 ? "couloirs" : "grande_salle";
  state.dungeonMode = mode;

  const addPillar = (x: number, y: number, size = 40) => {
    state.pillars.push({ x, y, w: size, h: size, kind: "pillar" });
  };
  const addWall = (x: number, y: number, ww: number, hh: number) => {
    state.pillars.push({ x, y, w: ww, h: hh, kind: "wall" });
  };

  if (mode === "grande_salle") {
    addPillar(82, 82, 38);
    addPillar(w - 120, 82, 38);
    addPillar(82, h - 120, 38);
    addPillar(w - 120, h - 120, 38);
    if (level >= 2) addPillar(w / 2 - 24, h / 2 - 24, 48);
    if (level >= 6) {
      addPillar(235, 170, 34);
      addPillar(w - 269, 170, 34);
      addPillar(235, h - 204, 34);
      addPillar(w - 269, h - 204, 34);
    }
  } else if (mode === "couloirs") {
    addWall(92, 165, 295, 30);
    addWall(510, 165, 305, 30);
    addWall(92, 455, 335, 30);
    addWall(548, 455, 267, 30);
    addWall(265, 255, 30, 118);
    addWall(610, 255, 30, 118);
    addPillar(432, 88, 34);
    addPillar(432, h - 122, 34);
    if (level >= 6) {
      addWall(420, 260, 60, 30);
      addWall(420, 360, 60, 30);
    }
  } else if (mode === "labyrinthe") {
    addWall(145, 80, 30, 205);
    addWall(145, 390, 30, 170);
    addWall(320, 70, 30, 190);
    addWall(320, 345, 30, 220);
    addWall(505, 95, 30, 230);
    addWall(505, 455, 30, 112);
    addWall(690, 75, 30, 205);
    addWall(690, 392, 30, 178);
    addWall(175, 145, 145, 28);
    addWall(535, 145, 155, 28);
    addWall(175, 315, 150, 28);
    addWall(535, 315, 155, 28);
    addWall(350, 500, 155, 28);
    if (level >= 8) {
      addWall(350, 225, 155, 28);
      addWall(720, 500, 88, 28);
    }
  } else {
    addPillar(w / 2 - 30, h / 2 - 30, 60);
    addPillar(170, 130, 44);
    addPillar(w - 214, 130, 44);
    addPillar(170, h - 174, 44);
    addPillar(w - 214, h - 174, 44);
    addWall(w / 2 - 115, 122, 230, 26);
    addWall(w / 2 - 115, h - 148, 230, 26);
    addWall(116, h / 2 - 85, 26, 170);
    addWall(w - 142, h / 2 - 85, 26, 170);
  }

  // Door is slightly inside the playable area so the hero can reach it when open.
  state.door = {
    x: w - 52,
    y: h / 2 - 30,
    w: 26,
    h: 60,
    open: false,
    openAnim: 0,
  };

  // Torches at strategic positions
  state.torches = [
    { x: 35, y: 35, intensity: 1, phase: 0 },
    { x: w - 35, y: 35, intensity: 1, phase: 1.5 },
    { x: 35, y: h - 35, intensity: 1, phase: 3.1 },
    { x: w - 35, y: h - 35, intensity: 1, phase: 4.7 },
    { x: w / 2, y: 35, intensity: 0.7, phase: 2.3 },
    { x: w / 2, y: h - 35, intensity: 0.7, phase: 5.1 },
  ];
}

function placeHeroSafely(state: GameState): void {
  const preferred = { x: state.roomWidth / 2, y: state.roomHeight / 2 + 90 };
  const safe = findSafePoint(state, preferred, state.playerRadius, 0);
  state.player.x = safe.x;
  state.player.y = safe.y;
  state.playerVel.x = 0;
  state.playerVel.y = 0;
}

function findEnemySpawnPoint(state: GameState, radius: number): Vec2 {
  const minX = WALL_THICKNESS + radius + SPAWN_BUFFER;
  const maxX = state.roomWidth - WALL_THICKNESS - radius - SPAWN_BUFFER;
  const minY = WALL_THICKNESS + radius + SPAWN_BUFFER;
  const maxY = state.roomHeight - WALL_THICKNESS - radius - SPAWN_BUFFER;

  for (let attempt = 0; attempt < 120; attempt++) {
    const edge = Math.floor(Math.random() * 4);
    let x = minX;
    let y = minY;
    switch (edge) {
      case 0:
        x = minX + Math.random() * (maxX - minX);
        y = minY;
        break;
      case 1:
        x = maxX;
        y = minY + Math.random() * (maxY - minY);
        break;
      case 2:
        x = minX + Math.random() * (maxX - minX);
        y = maxY;
        break;
      default:
        x = minX;
        y = minY + Math.random() * (maxY - minY);
        break;
    }

    if (!isCircleBlocked(state, x, y, radius) && distance({ x, y }, state.player) > 160) {
      return { x, y };
    }
  }

  return findSafePoint(state, { x: state.roomWidth / 2, y: WALL_THICKNESS + 90 }, radius, 160);
}

function findSafePoint(state: GameState, preferred: Vec2, radius: number, minDistanceFromPlayer: number): Vec2 {
  if (isSpawnPointValid(state, preferred.x, preferred.y, radius, minDistanceFromPlayer)) {
    return { ...preferred };
  }

  for (let ring = 1; ring <= 12; ring++) {
    const ringRadius = ring * 28;
    const samples = 16 + ring * 4;
    for (let i = 0; i < samples; i++) {
      const angle = (i / samples) * Math.PI * 2;
      const x = preferred.x + Math.cos(angle) * ringRadius;
      const y = preferred.y + Math.sin(angle) * ringRadius;
      if (isSpawnPointValid(state, x, y, radius, minDistanceFromPlayer)) {
        return { x, y };
      }
    }
  }

  const minX = WALL_THICKNESS + radius + SPAWN_BUFFER;
  const maxX = state.roomWidth - WALL_THICKNESS - radius - SPAWN_BUFFER;
  const minY = WALL_THICKNESS + radius + SPAWN_BUFFER;
  const maxY = state.roomHeight - WALL_THICKNESS - radius - SPAWN_BUFFER;
  for (let attempt = 0; attempt < 300; attempt++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (isSpawnPointValid(state, x, y, radius, minDistanceFromPlayer)) {
      return { x, y };
    }
  }

  return { x: minX, y: minY };
}

function isSpawnPointValid(
  state: GameState,
  x: number,
  y: number,
  radius: number,
  minDistanceFromPlayer: number,
): boolean {
  if (isCircleBlocked(state, x, y, radius)) return false;
  if (minDistanceFromPlayer > 0 && distance({ x, y }, state.player) < minDistanceFromPlayer) return false;
  return true;
}

function isCircleBlocked(state: GameState, x: number, y: number, radius: number): boolean {
  if (
    x - radius < WALL_THICKNESS + SPAWN_BUFFER ||
    y - radius < WALL_THICKNESS + SPAWN_BUFFER ||
    x + radius > state.roomWidth - WALL_THICKNESS - SPAWN_BUFFER ||
    y + radius > state.roomHeight - WALL_THICKNESS - SPAWN_BUFFER
  ) {
    return true;
  }

  const clearance = radius + SPAWN_BUFFER;
  for (const p of state.pillars) {
    if (circleRectCollision(x, y, clearance, p)) return true;
  }

  if (!state.door.open && circleRectCollision(x, y, clearance, state.door)) {
    return true;
  }

  return false;
}

function spawnEnemies(state: GameState): void {
  const modeBonus = state.dungeonMode === "labyrinthe" ? 1 : state.dungeonMode === "arena" ? 2 : 0;
  const count = Math.min(20, 3 + Math.floor(state.roomLevel * 1.35) + modeBonus + Math.floor(Math.random() * 3));
  const baseSpeed = 46 + state.roomLevel * 7 + (state.dungeonMode === "couloirs" ? 4 : 0);

  for (let i = 0; i < count; i++) {
    const enemySize = 12 + Math.min(state.roomLevel * 0.5, 6);
    const spawn = findEnemySpawnPoint(state, enemySize);
    const hp = state.roomLevel >= 9 && i % 5 === 0 ? 3 : state.roomLevel >= 5 && i % 3 === 0 ? 2 : 1;
    state.enemies.push({
      id: ++state.enemyIdCounter,
      pos: spawn,
      vel: { x: 0, y: 0 },
      size: enemySize,
      speed: baseSpeed + (Math.random() - 0.5) * 40,
      alive: true,
      hp,
      maxHp: hp,
      hitTimer: 0,
      spawnAnim: -1, // start at -1 for delay
      deathTimer: 0,
    });
  }

  // Stagger spawn animations
  state.enemies.forEach((e, i) => {
    e.spawnAnim = -0.5 - i * 0.08; // negative = delay before appearing
  });
}

export function nextRoom(state: GameState): void {
  state.roomsCleared += 1;
  if (state.roomLevel >= state.maxRooms) {
    state.phase = "victory";
    state.projectiles = [];
    state.pickups = [];
    state.enemies = [];
    state.key = null;
    queueSound(state, "victory");
    return;
  }
  state.roomLevel += 1;
  state.health = Math.min(state.health + 1, state.maxHealth);
  state.phase = "fighting";
  state.enemies = [];
  state.projectiles = [];
  state.pickups = [];
  state.key = null;
  state.particles = [];
  state.floatingTexts = [];
  state.swordTrail = [];
  buildRoom(state);
  placeHeroSafely(state);
  spawnRoomPickups(state);
  spawnEnemies(state);
  queueSound(state, "room");
  triggerShake(state, 6, 0.3);
}

export function startGame(state: GameState): void {
  const chosenClass = state.heroClass;
  const s = createInitialState(state.viewW, state.viewH);
  Object.assign(state, s);
  setHeroClass(state, chosenClass);
  state.phase = "fighting";
  state.lastTime = 0;
  state.roomLevel = 1;
  buildRoom(state);
  placeHeroSafely(state);
  spawnRoomPickups(state);
  spawnEnemies(state);
  queueSound(state, "room");
}

export function beginOnboarding(state: GameState): void {
  if (state.phase !== "title" && state.phase !== "game_over" && state.phase !== "victory") return;
  state.phase = "onboarding";
  state.onboardingStep = 0;
  queueSound(state, "select");
}

export function advanceOnboarding(state: GameState): void {
  if (state.phase !== "onboarding") return;
  if (state.onboardingStep < 2) {
    state.onboardingStep += 1;
    queueSound(state, "select");
    return;
  }
  startGame(state);
}

export function backOnboarding(state: GameState): void {
  if (state.phase !== "onboarding") return;
  state.onboardingStep = Math.max(0, state.onboardingStep - 1);
  queueSound(state, "select");
}

export function togglePause(state: GameState): void {
  if (state.phase === "paused") {
    state.phase = state.previousPhase === "paused" ? "fighting" : state.previousPhase;
    queueSound(state, "pause");
    return;
  }
  if (state.phase === "fighting" || state.phase === "key_spawned" || state.phase === "room_clear") {
    state.previousPhase = state.phase;
    state.phase = "paused";
    queueSound(state, "pause");
  }
}

export function setHeroClass(state: GameState, heroClass: HeroClass): void {
  state.heroClass = heroClass;
  if (heroClass === "guerrier") {
    state.maxHealth = 6;
    state.health = Math.min(Math.max(state.health, 6), state.maxHealth);
    state.playerSpeed = 150;
    state.attackCooldown = 0.34;
  } else if (heroClass === "ranger") {
    state.maxHealth = 5;
    state.health = Math.min(Math.max(state.health, 5), state.maxHealth);
    state.playerSpeed = 172;
    state.attackCooldown = 0.28;
  } else {
    state.maxHealth = 4;
    state.health = Math.min(Math.max(state.health, 4), state.maxHealth);
    state.playerSpeed = 190;
    state.attackCooldown = 0.24;
  }
  queueSound(state, "select");
}

export function heroPrimaryAttack(state: GameState): void {
  if (state.phase === "title" || state.phase === "game_over" || state.phase === "victory") {
    beginOnboarding(state);
    return;
  }
  if (state.phase === "onboarding") {
    advanceOnboarding(state);
    return;
  }
  if (state.phase === "paused") return;
  if (state.attackTimer > 0) return;

  if (state.heroClass === "guerrier") {
    swingSword(state);
    queueSound(state, "attack");
    state.attackTimer = state.attackCooldown * (state.damageBoostTimer > 0 ? 0.82 : 1);
    return;
  }

  const angle = getAttackAngle(state);
  state.aimAngle = angle;
  if (state.heroClass === "ranger") {
    shootProjectile(state, "arrow", angle, 390, 1 + (state.damageBoostTimer > 0 ? 1 : 0), 0.95, 1);
    queueSound(state, "arrow");
    state.attackTimer = state.attackCooldown;
  } else {
    shootProjectile(state, "dagger", angle - 0.08, 330, 1 + (state.damageBoostTimer > 0 ? 1 : 0), 0.7, 0);
    shootProjectile(state, "dagger", angle + 0.08, 330, 1 + (state.damageBoostTimer > 0 ? 1 : 0), 0.7, 0);
    queueSound(state, "dagger");
    state.attackTimer = state.attackCooldown;
  }
}

export function castScrollSpell(state: GameState): void {
  if (state.phase === "title" || state.phase === "game_over" || state.phase === "onboarding" || state.phase === "paused" || state.scrolls <= 0) return;
  state.scrolls -= 1;
  const angle = getAttackAngle(state);
  state.aimAngle = angle;
  shootProjectile(state, "spell", angle, 245, 3 + (state.damageBoostTimer > 0 ? 1 : 0), 1.25, 3);
  queueSound(state, "spell");
  triggerShake(state, 4, 0.16);
  state.floatingTexts.push({
    pos: { x: state.player.x, y: state.player.y - 30 },
    text: "SORT!",
    color: "#9df5ff",
    life: 0.8,
    maxLife: 0.8,
    vel: { x: 0, y: -35 },
    size: 14,
  });
}

export function dashHero(state: GameState): void {
  if (state.phase === "title" || state.phase === "game_over" || state.phase === "onboarding" || state.phase === "paused" || state.dashCooldownTimer > 0) return;
  const angle = getAttackAngle(state);
  state.playerVel.x = Math.cos(angle) * 430;
  state.playerVel.y = Math.sin(angle) * 430;
  state.dashTimer = 0.16;
  state.dashCooldownTimer = state.dashCooldown;
  queueSound(state, "dash");
  triggerShake(state, 2, 0.08);
  for (let i = 0; i < 10; i++) {
    state.particles.push({
      pos: { x: state.player.x, y: state.player.y },
      vel: { x: -Math.cos(angle) * (70 + Math.random() * 90) + (Math.random() - 0.5) * 35, y: -Math.sin(angle) * (70 + Math.random() * 90) + (Math.random() - 0.5) * 35 },
      life: 0.22 + Math.random() * 0.15,
      maxLife: 0.38,
      color: "#b9fff0",
      size: 2 + Math.random() * 2,
      decay: 0.9,
      gravity: 0,
      type: "magic",
    });
  }
}

function queueSound(state: GameState, event: SoundEvent): void {
  state.soundEvents.push(event);
}

function grantXP(state: GameState, amount: number): void {
  state.xp += amount;
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.heroLevel += 1;
    state.xpToNext = Math.floor(state.xpToNext * 1.28 + 18);
    state.maxHealth += state.heroLevel % 2 === 0 ? 1 : 0;
    state.health = Math.min(state.maxHealth, state.health + 1);
    state.playerSpeed += state.heroClass === "guerrier" ? 4 : state.heroClass === "ranger" ? 3 : 2;
    state.attackCooldown = Math.max(0.16, state.attackCooldown - 0.012);
    state.scrolls += state.heroLevel % 3 === 0 ? 1 : 0;
    queueSound(state, "level_up");
    state.floatingTexts.push({
      pos: { x: state.player.x, y: state.player.y - 34 },
      text: `NIVEAU ${state.heroLevel}!`,
      color: "#9df5ff",
      life: 1.3,
      maxLife: 1.3,
      vel: { x: 0, y: -34 },
      size: 16,
    });
  }
}

function getAttackAngle(state: GameState): number {
  let aimX = 0, aimY = 0;
  if (state.keysDown.has("ArrowLeft") || state.keysDown.has("KeyA") || state.keysDown.has("q") || state.keysDown.has("Q")) aimX -= 1;
  if (state.keysDown.has("ArrowRight") || state.keysDown.has("KeyD") || state.keysDown.has("d") || state.keysDown.has("D")) aimX += 1;
  if (state.keysDown.has("ArrowUp") || state.keysDown.has("KeyW") || state.keysDown.has("z") || state.keysDown.has("Z") || state.keysDown.has("w") || state.keysDown.has("W")) aimY -= 1;
  if (state.keysDown.has("ArrowDown") || state.keysDown.has("KeyS") || state.keysDown.has("s") || state.keysDown.has("S")) aimY += 1;
  if (aimX !== 0 || aimY !== 0) return Math.atan2(aimY, aimX);

  const nearest = state.enemies
    .filter((enemy) => enemy.alive && enemy.spawnAnim >= 1)
    .sort((a, b) => distance(a.pos, state.player) - distance(b.pos, state.player))[0];
  if (nearest) return Math.atan2(nearest.pos.y - state.player.y, nearest.pos.x - state.player.x);
  return state.aimAngle;
}

function shootProjectile(
  state: GameState,
  kind: ProjectileKind,
  angle: number,
  speed: number,
  damage: number,
  life: number,
  pierce: number,
): void {
  const start = state.playerRadius + 18;
  state.projectiles.push({
    id: ++state.projectileIdCounter,
    kind,
    pos: { x: state.player.x + Math.cos(angle) * start, y: state.player.y + Math.sin(angle) * start },
    vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
    angle,
    radius: kind === "spell" ? 10 : kind === "arrow" ? 5 : 4,
    damage,
    life,
    pierce,
    owner: "hero",
  });

  const color = kind === "spell" ? "#82f7ff" : kind === "arrow" ? "#f0d890" : "#d9e6ff";
  for (let i = 0; i < (kind === "spell" ? 10 : 4); i++) {
    state.particles.push({
      pos: { x: state.player.x + Math.cos(angle) * start, y: state.player.y + Math.sin(angle) * start },
      vel: { x: -Math.cos(angle) * (40 + Math.random() * 60) + (Math.random() - 0.5) * 50, y: -Math.sin(angle) * (40 + Math.random() * 60) + (Math.random() - 0.5) * 50 },
      life: 0.16 + Math.random() * 0.2,
      maxLife: 0.36,
      color,
      size: 2 + Math.random() * 2,
      decay: 0.9,
      gravity: 0,
      type: kind === "spell" ? "magic" : "spark",
    });
  }
}

function spawnRoomPickups(state: GameState): void {
  const guaranteed: PickupKind = state.roomLevel === 1 ? "food" : Math.random() < 0.45 ? "scroll" : Math.random() < 0.5 ? "potion_speed" : "potion_power";
  spawnPickup(state, guaranteed, { x: state.roomWidth / 2 - 130, y: state.roomHeight / 2 + 35 });
  if (state.roomLevel >= 3 && Math.random() < 0.45) {
    spawnPickup(state, Math.random() < 0.45 ? "food" : "magic_shield", { x: state.roomWidth / 2 + 135, y: state.roomHeight / 2 - 50 });
  }
}

function maybeDropPickup(state: GameState, pos: Vec2): void {
  if (Math.random() > 0.18) return;
  const roll = Math.random();
  const kind: PickupKind = roll < 0.24 ? "food" : roll < 0.48 ? "scroll" : roll < 0.7 ? "potion_speed" : roll < 0.9 ? "potion_power" : "magic_shield";
  spawnPickup(state, kind, pos);
}

function spawnPickup(state: GameState, kind: PickupKind, preferred: Vec2): void {
  const pos = findSafePoint(state, preferred, 18, 40);
  state.pickups.push({
    id: ++state.pickupIdCounter,
    kind,
    pos,
    size: 14,
    bob: Math.random() * Math.PI * 2,
    collected: false,
  });
}

function applyPickup(state: GameState, pickup: Pickup): void {
  pickup.collected = true;
  queueSound(state, "pickup");
  const labels: Record<PickupKind, string> = {
    scroll: "+1 parchemin",
    food: "+1 vie",
    potion_speed: "Vitesse!",
    potion_power: "Puissance!",
    magic_shield: "Bouclier!",
  };
  if (pickup.kind === "scroll") state.scrolls += 1;
  if (pickup.kind === "food") state.health = Math.min(state.maxHealth, state.health + 1);
  if (pickup.kind === "potion_speed") state.speedBoostTimer = 8;
  if (pickup.kind === "potion_power") state.damageBoostTimer = 8;
  if (pickup.kind === "magic_shield") state.shieldTimer = 7;
  if (pickup.kind === "magic_shield") queueSound(state, "shield");
  state.score += 15;
  state.floatingTexts.push({
    pos: { x: pickup.pos.x, y: pickup.pos.y - 18 },
    text: labels[pickup.kind],
    color: pickup.kind === "food" ? "#8cff8c" : pickup.kind === "scroll" ? "#9df5ff" : "#ffd86b",
    life: 1,
    maxLife: 1,
    vel: { x: 0, y: -36 },
    size: 13,
  });
  for (let i = 0; i < 12; i++) {
    state.particles.push({
      pos: { x: pickup.pos.x, y: pickup.pos.y },
      vel: { x: (Math.random() - 0.5) * 130, y: (Math.random() - 0.5) * 130 },
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.6,
      color: "#fff1a8",
      size: 2 + Math.random() * 2,
      decay: 0.92,
      gravity: 0,
      type: "magic",
    });
  }
}

function damageEnemy(state: GameState, enemy: Enemy, damage: number, impact: ProjectileKind | "sword"): void {
  enemy.hp -= damage;
  enemy.hitTimer = 0.12;
  triggerShake(state, impact === "spell" ? 5 : 3, impact === "spell" ? 0.16 : 0.1);

  const sparkCount = impact === "spell" ? 16 : 7;
  for (let i = 0; i < sparkCount; i++) {
    state.particles.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y },
      vel: { x: (Math.random() - 0.5) * (impact === "spell" ? 340 : 250), y: (Math.random() - 0.5) * (impact === "spell" ? 340 : 250) },
      life: 0.25 + Math.random() * 0.25,
      maxLife: 0.5,
      color: impact === "spell" ? "#82f7ff" : "#ffff88",
      size: 2 + Math.random() * 3,
      decay: 0.93,
      gravity: impact === "spell" ? 0 : 50,
      type: impact === "spell" ? "magic" : "spark",
    });
  }

  if (enemy.hp > 0 || !enemy.alive) return;

  enemy.alive = false;
  queueSound(state, "enemy_die");
  enemy.deathTimer = 0.3;
  state.combo += 1;
  state.comboTimer = 2;
  state.score += 10 + (state.combo > 1 ? state.combo * 5 : 0);
  grantXP(state, 10 + state.roomLevel * 2 + enemy.maxHp * 4);
  maybeDropPickup(state, enemy.pos);

  for (let i = 0; i < 14; i++) {
    state.particles.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y },
      vel: { x: (Math.random() - 0.5) * 280, y: (Math.random() - 0.5) * 280 },
      life: 0.4 + Math.random() * 0.4,
      maxLife: 0.8,
      color: Math.random() > 0.3 ? "#cc2200" : "#ff6622",
      size: 4 + Math.random() * 5,
      decay: 0.94,
      gravity: 150,
      type: "blood",
    });
  }

  if (state.combo > 1) {
    state.floatingTexts.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y - 20 },
      text: `x${state.combo} COMBO!`,
      color: "#ffcc00",
      life: 1.0,
      maxLife: 1.0,
      vel: { x: 0, y: -40 },
      size: 14,
    });
  }
}

// ──────────────────────────────────────────────
// CAMERA SHAKE
// ──────────────────────────────────────────────
export function triggerShake(state: GameState, intensity: number, duration: number): void {
  state.camera.intensity = Math.max(state.camera.intensity, intensity);
  state.camera.duration = Math.max(state.camera.duration, duration);
  state.camera.timer = duration;
}

// ──────────────────────────────────────────────
// SWORD
// ──────────────────────────────────────────────
export function swingSword(state: GameState): void {
  if (state.swordSwinging) return;
  if (state.swordCooldownTimer > 0) return;
  state.swordSwinging = true;
  state.swordTimer = state.swordDuration;
  state.swordTrail = [];

  let aimX = 0, aimY = 0;
  if (state.keysDown.has("ArrowLeft") || state.keysDown.has("KeyA") || state.keysDown.has("q") || state.keysDown.has("Q")) aimX -= 1;
  if (state.keysDown.has("ArrowRight") || state.keysDown.has("KeyD") || state.keysDown.has("d") || state.keysDown.has("D")) aimX += 1;
  if (state.keysDown.has("ArrowUp") || state.keysDown.has("KeyW") || state.keysDown.has("z") || state.keysDown.has("Z") || state.keysDown.has("w") || state.keysDown.has("W")) aimY -= 1;
  if (state.keysDown.has("ArrowDown") || state.keysDown.has("KeyS") || state.keysDown.has("s") || state.keysDown.has("S")) aimY += 1;
  if (aimX === 0 && aimY === 0) { aimX = 1; }

  state.swordAngle = Math.atan2(aimY, aimX);

  // Sword swing particles
  for (let i = 0; i < 6; i++) {
    const a = state.swordAngle - state.swordArcLength / 2 + (i / 5) * state.swordArcLength;
    state.particles.push({
      pos: {
        x: state.player.x + Math.cos(a) * (state.playerRadius + 25),
        y: state.player.y + Math.sin(a) * (state.playerRadius + 25),
      },
      vel: { x: Math.cos(a) * 80, y: Math.sin(a) * 80 },
      life: 0.2,
      maxLife: 0.2,
      color: "#aaddff",
      size: 3,
      decay: 0.95,
      gravity: 0,
      type: "spark",
    });
  }
}

// ──────────────────────────────────────────────
// MAIN UPDATE
// ──────────────────────────────────────────────
export function update(state: GameState, time: number): void {
  if (state.phase === "title" || state.phase === "onboarding" || state.phase === "paused" || state.phase === "game_over" || state.phase === "victory") return;

  // Delta time
  if (state.lastTime === 0) state.lastTime = time;
  let dt = (time - state.lastTime) / 1000;
  if (dt > 0.05) dt = 0.05;
  state.deltaTime = dt;
  state.lastTime = time;

  // Camera shake update
  if (state.camera.timer > 0) {
    state.camera.timer -= dt;
    const t = state.camera.timer / state.camera.duration;
    const shake = state.camera.intensity * t;
    state.camera.offsetX = (Math.random() - 0.5) * shake * 2;
    state.camera.offsetY = (Math.random() - 0.5) * shake * 2;
  } else {
    state.camera.offsetX = 0;
    state.camera.offsetY = 0;
    state.camera.intensity = 0;
  }

  // Combo timer
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  if (state.attackTimer > 0) state.attackTimer -= dt;
  if (state.dashCooldownTimer > 0) state.dashCooldownTimer -= dt;
  if (state.dashTimer > 0) state.dashTimer -= dt;
  if (state.damageBoostTimer > 0) state.damageBoostTimer -= dt;
  if (state.speedBoostTimer > 0) state.speedBoostTimer -= dt;
  if (state.shieldTimer > 0) state.shieldTimer -= dt;
  if (state.hurtCooldown > 0) state.hurtCooldown -= dt;

  // ── Player movement with smooth velocity ──
  let targetDX = 0, targetDY = 0;
  if (state.keysDown.has("ArrowLeft") || state.keysDown.has("KeyA") || state.keysDown.has("q") || state.keysDown.has("Q")) targetDX -= 1;
  if (state.keysDown.has("ArrowRight") || state.keysDown.has("KeyD") || state.keysDown.has("d") || state.keysDown.has("D")) targetDX += 1;
  if (state.keysDown.has("ArrowUp") || state.keysDown.has("KeyW") || state.keysDown.has("z") || state.keysDown.has("Z") || state.keysDown.has("w") || state.keysDown.has("W")) targetDY -= 1;
  if (state.keysDown.has("ArrowDown") || state.keysDown.has("KeyS") || state.keysDown.has("s") || state.keysDown.has("S")) targetDY += 1;

  if (targetDX !== 0 && targetDY !== 0) { targetDX *= 0.707; targetDY *= 0.707; }

  const accel = 12;
  const speedBoost = state.speedBoostTimer > 0 ? 1.28 : 1;
  const classDashControl = state.dashTimer > 0 ? 0.18 : 1;
  state.playerVel.x += (targetDX * state.playerSpeed * speedBoost - state.playerVel.x) * accel * dt * classDashControl;
  state.playerVel.y += (targetDY * state.playerSpeed * speedBoost - state.playerVel.y) * accel * dt * classDashControl;
  if (targetDX !== 0 || targetDY !== 0) state.aimAngle = Math.atan2(targetDY, targetDX);

  // Apply velocity with wall friction
  const nx = state.player.x + state.playerVel.x * dt;
  const ny = state.player.y + state.playerVel.y * dt;

  const margin = WALL_THICKNESS, pr = state.playerRadius;
  const newX = clamp(nx, margin + pr, state.roomWidth - margin - pr);
  const newY = clamp(ny, margin + pr, state.roomHeight - margin - pr);

  // Pillar collision with slide
  let finalX = newX, finalY = newY;
  for (let pass = 0; pass < 2; pass++) {
    for (const p of state.pillars) {
      const col = circleRectCollision(finalX, finalY, pr, p);
      if (col) {
        finalX += col.nx * col.depth;
        finalY += col.ny * col.depth;
      }
    }

    if (!state.door.open) {
      const col = circleRectCollision(finalX, finalY, pr, state.door);
      if (col) {
        finalX += col.nx * col.depth;
        finalY += col.ny * col.depth;
      }
    }
  }

  state.player.x = clamp(finalX, margin + pr, state.roomWidth - margin - pr);
  state.player.y = clamp(finalY, margin + pr, state.roomHeight - margin - pr);

  // Dust particles when moving
  if ((Math.abs(state.playerVel.x) > 20 || Math.abs(state.playerVel.y) > 20) && Math.random() < 0.12) {
    state.particles.push({
      pos: { x: state.player.x, y: state.player.y + state.playerRadius * 0.5 },
      vel: { x: (Math.random() - 0.5) * 30, y: -Math.random() * 20 },
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      color: "#887766",
          size: 1.5 + Math.random() * 1.5,
      decay: 0.92,
      gravity: -10,
      type: "dust",
    });
  }

  // ── Sword update ──
  if (state.swordCooldownTimer > 0) state.swordCooldownTimer -= dt;

  if (state.swordSwinging) {
    state.swordTimer -= dt;
    const progress = 1 - state.swordTimer / state.swordDuration;
    const arcLen = state.swordArcLength;
    state.swordArcStart = state.swordAngle - arcLen / 2 + progress * arcLen;

    // Store trail positions for afterimage
    state.swordTrail.push(time);
    if (state.swordTrail.length > 8) state.swordTrail.shift();

    if (state.swordTimer <= 0) {
      state.swordSwinging = false;
      state.swordCooldownTimer = state.swordCooldown;
    }
  }

  // ── Projectiles: arrows, daggers and scroll spells ──
  for (const projectile of state.projectiles) {
    projectile.life -= dt;
    projectile.pos.x += projectile.vel.x * dt;
    projectile.pos.y += projectile.vel.y * dt;

    const blockedByWall =
      projectile.pos.x < WALL_THICKNESS ||
      projectile.pos.y < WALL_THICKNESS ||
      projectile.pos.x > state.roomWidth - WALL_THICKNESS ||
      projectile.pos.y > state.roomHeight - WALL_THICKNESS;
    const blockedByObstacle = state.pillars.some((p) => circleRectCollision(projectile.pos.x, projectile.pos.y, projectile.radius, p));
    if (blockedByWall || blockedByObstacle) {
      projectile.life = 0;
      continue;
    }

    for (const enemy of state.enemies) {
      if (!enemy.alive || enemy.spawnAnim < 1) continue;
      if (distance(projectile.pos, enemy.pos) > projectile.radius + enemy.size) continue;

      if (projectile.kind === "spell") {
        const blastRadius = 54;
        for (const blastEnemy of state.enemies) {
          if (blastEnemy.alive && distance(projectile.pos, blastEnemy.pos) < blastRadius + blastEnemy.size) {
            damageEnemy(state, blastEnemy, projectile.damage, "spell");
          }
        }
        projectile.life = 0;
        break;
      }

      damageEnemy(state, enemy, projectile.damage, projectile.kind);
      projectile.pierce -= 1;
      if (projectile.pierce < 0) {
        projectile.life = 0;
        break;
      }
    }

    if (projectile.kind === "spell" && Math.random() < 0.75) {
      state.particles.push({
        pos: { x: projectile.pos.x, y: projectile.pos.y },
        vel: { x: (Math.random() - 0.5) * 45, y: (Math.random() - 0.5) * 45 },
        life: 0.25,
        maxLife: 0.25,
        color: "#82f7ff",
        size: 2 + Math.random() * 2,
        decay: 0.9,
        gravity: 0,
        type: "magic",
      });
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);

  // ── Enemies ──
  if (state.phase === "fighting") {
    for (const enemy of state.enemies) {
      if (!enemy.alive) {
        enemy.deathTimer -= dt;
        continue;
      }

      // Spawn animation
      if (enemy.spawnAnim < 1) {
        enemy.spawnAnim += dt * 2;
        continue;
      }
      enemy.hitTimer -= dt;

      // Chase player with simple steering
      const dx = state.player.x - enemy.pos.x;
      const dy = state.player.y - enemy.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ndx = dx / dist;
      const ndy = dy / dist;

      // Smooth velocity steering
      const targetVx = ndx * enemy.speed;
      const targetVy = ndy * enemy.speed;
      enemy.vel.x += (targetVx - enemy.vel.x) * 4 * dt;
      enemy.vel.y += (targetVy - enemy.vel.y) * 4 * dt;

      enemy.pos.x += enemy.vel.x * dt;
      enemy.pos.y += enemy.vel.y * dt;
      enemy.pos.x = clamp(enemy.pos.x, WALL_THICKNESS + enemy.size, state.roomWidth - WALL_THICKNESS - enemy.size);
      enemy.pos.y = clamp(enemy.pos.y, WALL_THICKNESS + enemy.size, state.roomHeight - WALL_THICKNESS - enemy.size);

      // Pillar collision
      for (const p of state.pillars) {
        const col = circleRectCollision(enemy.pos.x, enemy.pos.y, enemy.size, p);
        if (col) {
          enemy.pos.x += col.nx * col.depth;
          enemy.pos.y += col.ny * col.depth;
          enemy.vel.x *= 0.5;
          enemy.vel.y *= 0.5;
        }
      }

      // Door collision
      if (!state.door.open) {
        const col = circleRectCollision(enemy.pos.x, enemy.pos.y, enemy.size, state.door);
        if (col) {
          enemy.pos.x += col.nx * col.depth;
          enemy.pos.y += col.ny * col.depth;
        }
      }

      // Enemy touches player
      const touchDist = distance(enemy.pos, state.player);
      if (touchDist < state.playerRadius + enemy.size && state.hurtCooldown <= 0) {
        if (state.shieldTimer <= 0) state.health -= 1;
        queueSound(state, state.shieldTimer > 0 ? "shield" : "hurt");
        state.hurtCooldown = state.shieldTimer > 0 ? 0.35 : 0.75;
        state.combo = 0;
        state.comboTimer = 0;
        triggerShake(state, 8, 0.25);

        // Blood splatter, or shield sparks when protected.
        for (let i = 0; i < 10; i++) {
          state.particles.push({
            pos: { x: state.player.x, y: state.player.y },
            vel: { x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 },
            life: 0.4 + Math.random() * 0.4,
            maxLife: 0.8,
            color: state.shieldTimer > 0 ? "#a68cff" : Math.random() > 0.4 ? "#aa0000" : "#ff3333",
            size: state.shieldTimer > 0 ? 2 + Math.random() * 3 : 3 + Math.random() * 5,
            decay: 0.95,
            gravity: state.shieldTimer > 0 ? 0 : 200,
            type: state.shieldTimer > 0 ? "magic" : "blood",
          });
        }

        // Knockback player
        const kbAngle = Math.atan2(state.player.y - enemy.pos.y, state.player.x - enemy.pos.x);
        state.playerVel.x = Math.cos(kbAngle) * 200;
        state.playerVel.y = Math.sin(kbAngle) * 200;

        if (state.health <= 0) {
          state.health = 0;
          state.phase = "game_over";
          // Death explosion
          for (let i = 0; i < 30; i++) {
            state.particles.push({
              pos: { x: state.player.x, y: state.player.y },
              vel: { x: (Math.random() - 0.5) * 350, y: (Math.random() - 0.5) * 350 },
              life: 0.6 + Math.random() * 0.5,
              maxLife: 1.1,
              color: Math.random() > 0.5 ? "#44ff44" : "#22aa22",
              size: 4 + Math.random() * 6,
              decay: 0.94,
              gravity: 100,
              type: "spark",
            });
          }
          return;
        }
      }

      // Sword hit
      if (state.swordSwinging && enemy.spawnAnim >= 1) {
        if (enemy.hitTimer <= 0 && hitBySwordArc(state, enemy)) {
          damageEnemy(state, enemy, 1 + (state.damageBoostTimer > 0 ? 1 : 0), "sword");
        }
      }
    }

    // Remove fully dead enemies
    state.enemies = state.enemies.filter((e) => e.alive || e.deathTimer > 0);

    // All enemies dead → spawn key
    if (state.enemies.filter((e) => e.alive).length === 0) {
      state.phase = "key_spawned";
      const keyPoint = findSafePoint(
        state,
        { x: state.roomWidth / 2, y: state.roomHeight / 2 - 115 },
        22,
        70,
      );
      state.key = {
        pos: keyPoint,
        collected: false,
        size: 16,
        bobPhase: 0,
        glowPulse: 0,
      };
    }
  }

  // ── Pickups: scrolls, food, potions and magic items ──
  for (const pickup of state.pickups) {
    if (pickup.collected) continue;
    pickup.bob += dt * 3;
    if (distance(state.player, pickup.pos) < state.playerRadius + pickup.size) {
      applyPickup(state, pickup);
    }
  }
  state.pickups = state.pickups.filter((pickup) => !pickup.collected);

  // ── Key animation & collection ──
  if (state.phase === "key_spawned" && state.key && !state.key.collected) {
    state.key.bobPhase += dt * 3;
    state.key.glowPulse += dt * 4;

    // Sparkle particles around key
    if (Math.random() < 0.22) {
      const angle = Math.random() * Math.PI * 2;
      const radius = state.key.size * 1.5;
      state.particles.push({
        pos: {
          x: state.key.pos.x + Math.cos(angle) * radius,
          y: state.key.pos.y + Math.sin(angle) * radius,
        },
        vel: { x: (Math.random() - 0.5) * 20, y: -Math.random() * 30 },
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color: "#ffd700",
        size: 2 + Math.random() * 2,
        decay: 0.9,
        gravity: -20,
        type: "key_sparkle",
      });
    }

    if (distance(state.player, state.key.pos) < state.playerRadius + state.key.size) {
      state.key.collected = true;
      state.door.open = true;
      queueSound(state, "key");
      queueSound(state, "door");
      state.score += 50 + state.roomLevel * 10;
      triggerShake(state, 4, 0.2);

      for (let i = 0; i < 20; i++) {
        state.particles.push({
          pos: { x: state.key.pos.x, y: state.key.pos.y },
          vel: { x: (Math.random() - 0.5) * 350, y: (Math.random() - 0.5) * 350 },
          life: 0.5 + Math.random() * 0.6,
          maxLife: 1.1,
          color: Math.random() > 0.5 ? "#ffd700" : "#ffffff",
          size: 3 + Math.random() * 5,
          decay: 0.93,
          gravity: 80,
          type: "key_sparkle",
        });
      }
      state.phase = "room_clear";
    }
  }

  // Door animation
  if (state.door.open && state.door.openAnim < 1) {
    state.door.openAnim += dt * 3;
  }

  // Door exit
  if (state.phase === "room_clear" && state.door.open) {
    const db = state.door;
    if (
      state.player.x + state.playerRadius > db.x &&
      state.player.x - state.playerRadius < db.x + db.w &&
      state.player.y + state.playerRadius > db.y &&
      state.player.y - state.playerRadius < db.y + db.h
    ) {
      nextRoom(state);
    }
  }

  // ── Particles ──
  for (const p of state.particles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.vel.y += p.gravity * dt;
    p.vel.x *= p.decay;
    p.vel.y *= p.decay;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  // ── Floating texts ──
  for (const ft of state.floatingTexts) {
    ft.pos.x += ft.vel.x * dt;
    ft.pos.y += ft.vel.y * dt;
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((ft) => ft.life > 0);
}

// ──────────────────────────────────────────────
// SWORD ARC HIT DETECTION
// ──────────────────────────────────────────────
function hitBySwordArc(state: GameState, enemy: Enemy): boolean {
  const sx = state.player.x;
  const sy = state.player.y;
  const swordReach = state.playerRadius + 32;
  const ex = enemy.pos.x;
  const ey = enemy.pos.y;
  const dx = ex - sx, dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > swordReach + enemy.size) return false;

  let angleToEnemy = Math.atan2(dy, dx);
  let arcStart = ((state.swordArcStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let arcEnd = arcStart + state.swordArcLength;
  let a = ((angleToEnemy % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  if (arcEnd > Math.PI * 2) {
    return a >= arcStart || a <= arcEnd - Math.PI * 2;
  }
  return a >= arcStart && a <= arcEnd;
}

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function circleRectCollision(
  cx: number,
  cy: number,
  r: number,
  rect: { x: number; y: number; w: number; h: number },
): { nx: number; ny: number; depth: number } | null {
  const closestX = clamp(cx, rect.x, rect.x + rect.w);
  const closestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq < r * r) {
    const dist = Math.sqrt(distSq) || 0.001;
    return { nx: dx / dist, ny: dy / dist, depth: r - dist };
  }
  return null;
}