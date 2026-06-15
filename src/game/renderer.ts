// ============================================================
// DONJON FLASH — Advanced Renderer v2
// Par Hylst - Geoffroy avec l'aide d'une IA
// ============================================================

import { GameState } from "./engine";

// ──────────────────────────────────────────────
// IMAGE CACHE
// ──────────────────────────────────────────────
let floorImg: HTMLImageElement | null = null;
let wallImg: HTMLImageElement | null = null;
let swordImg: HTMLImageElement | null = null;
let bloodImg: HTMLImageElement | null = null;
let onboardingClassesImg: HTMLImageElement | null = null;
let onboardingItemsImg: HTMLImageElement | null = null;
let imagesLoaded = false;

export function preloadImages(): Promise<void> {
  return new Promise((resolve) => {
    let done = 0;
    const total = 6;
    const check = () => { done++; if (done === total) { imagesLoaded = true; resolve(); } };

    floorImg = new Image();
    floorImg.onload = check; floorImg.onerror = check;
    floorImg.src = import.meta.env.BASE_URL + "images/floor_v2.jpg";

    wallImg = new Image();
    wallImg.onload = check; wallImg.onerror = check;
    wallImg.src = import.meta.env.BASE_URL + "images/wall_v2.jpg";

    swordImg = new Image();
    swordImg.onload = check; swordImg.onerror = check;
    swordImg.src = import.meta.env.BASE_URL + "images/sword_effect.png";

    bloodImg = new Image();
    bloodImg.onload = check; bloodImg.onerror = check;
    bloodImg.src = import.meta.env.BASE_URL + "images/blood_particle.png";

    onboardingClassesImg = new Image();
    onboardingClassesImg.onload = check; onboardingClassesImg.onerror = check;
    onboardingClassesImg.src = import.meta.env.BASE_URL + "images/onboarding_classes.jpg";

    onboardingItemsImg = new Image();
    onboardingItemsImg.onload = check; onboardingItemsImg.onerror = check;
    onboardingItemsImg.src = import.meta.env.BASE_URL + "images/onboarding_items.jpg";
  });
}

// ──────────────────────────────────────────────
// MAIN RENDER
// ──────────────────────────────────────────────
export function render(ctx: CanvasRenderingContext2D, state: GameState, canvasW: number, canvasH: number): void {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Compute scale to fit the larger room (900x650)
  const marginX = 20;
  const marginY = 60;
  const availW = canvasW - marginX * 2;
  const availH = canvasH - marginY * 2;
  const scaleX = availW / state.roomWidth;
  const scaleY = availH / state.roomHeight;
  const scale = Math.min(scaleX, scaleY, 1.2);
  state.scale = scale;

  const offsetX = (canvasW - state.roomWidth * scale) / 2;
  const offsetY = (canvasH - state.roomHeight * scale) / 2;

  ctx.save();
  ctx.translate(offsetX + state.camera.offsetX * scale, offsetY + state.camera.offsetY * scale);
  ctx.scale(scale, scale);

  drawRoom(ctx, state);
  drawTorches(ctx, state);
  drawPillars(ctx, state);
  drawDoor(ctx, state);
  drawPickups(ctx, state);
  if (state.key && !state.key.collected) drawKey(ctx, state.key);
  drawEnemies(ctx, state);
  drawProjectiles(ctx, state);
  drawPlayer(ctx, state);
  if (state.swordSwinging) drawSwordArc(ctx, state);
  drawParticles(ctx, state);
  drawFloatingTexts(ctx, state);

  ctx.restore();

  // HUD drawn in screen space
  drawHUD(ctx, state, canvasW, canvasH);
}

// ──────────────────────────────────────────────
// ROOM BACKGROUND
// ──────────────────────────────────────────────
function drawRoom(ctx: CanvasRenderingContext2D, state: GameState): void {
  const w = state.roomWidth;
  const h = state.roomHeight;
  const wallT = 28;

  // Outer void
  ctx.fillStyle = "#0a0808";
  ctx.fillRect(-50, -50, w + 100, h + 100);

  // Floor with texture
  if (imagesLoaded && floorImg) {
    const pat = ctx.createPattern(floorImg, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(wallT, wallT, w - wallT * 2, h - wallT * 2);
    }
  } else {
    // Fallback: gradient floor
    const floorGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 500);
    floorGrad.addColorStop(0, "#1e1a14");
    floorGrad.addColorStop(1, "#12100a");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(wallT, wallT, w - wallT * 2, h - wallT * 2);
  }

  // Floor tile grid
  ctx.strokeStyle = "rgba(80,70,55,0.2)";
  ctx.lineWidth = 0.5;
  for (let x = wallT; x < w - wallT; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, wallT); ctx.lineTo(x, h - wallT); ctx.stroke();
  }
  for (let y = wallT; y < h - wallT; y += 48) {
    ctx.beginPath(); ctx.moveTo(wallT, y); ctx.lineTo(w - wallT, y); ctx.stroke();
  }

  // Blood/dirt stains (procedural, based on room level)
  ctx.save();
  ctx.globalAlpha = Math.min(0.08, 0.035 + state.roomLevel * 0.004);
  for (let i = 0; i < state.roomLevel + 2; i++) {
    const sx = (w * 0.2 + i * 137) % (w - wallT * 2) + wallT;
    const sy = (h * 0.3 + i * 89) % (h - wallT * 2) + wallT;
    const sr = 8 + (i * 23) % 20;
    const bloodGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    bloodGrad.addColorStop(0, "#440000");
    bloodGrad.addColorStop(1, "rgba(40,0,0,0)");
    ctx.fillStyle = bloodGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr * 1.3, sr, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Walls
  if (imagesLoaded && wallImg) {
    const wPat = ctx.createPattern(wallImg, "repeat");
    if (wPat) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = wPat;
      ctx.fillRect(0, 0, w, wallT);
      ctx.fillRect(0, h - wallT, w, wallT);
      ctx.fillRect(0, 0, wallT, h);
      ctx.fillRect(w - wallT, 0, wallT, h);
      ctx.restore();
    }
  }

  // Wall base color
  const wallGrad = ctx.createLinearGradient(0, 0, w, h);
  wallGrad.addColorStop(0, "#2a1e14");
  wallGrad.addColorStop(0.5, "#1e1410");
  wallGrad.addColorStop(1, "#2a1e14");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, wallT);
  ctx.fillRect(0, h - wallT, w, wallT);
  ctx.fillRect(0, 0, wallT, h);
  ctx.fillRect(w - wallT, 0, wallT, h);

  // Wall inner bevel
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 2;
  ctx.strokeRect(wallT, wallT, w - wallT * 2, h - wallT * 2);
  ctx.strokeStyle = "#0a0806";
  ctx.lineWidth = 1;
  ctx.strokeRect(wallT + 1, wallT + 1, w - wallT * 2 - 2, h - wallT * 2 - 2);

  // Wall stone block lines
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  const blockH = 14;
  for (let y = wallT; y < h - wallT; y += blockH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 0; x < w; x += 30) {
    const offset = Math.floor(x / 30) % 2 === 0 ? 0 : blockH / 2;
    for (let y = wallT + offset; y < h - wallT; y += blockH) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + blockH);
      ctx.stroke();
    }
  }
}

// ──────────────────────────────────────────────
// TORCHES
// ──────────────────────────────────────────────
function drawTorches(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const torch of state.torches) {
    const t = state.lastTime / 1000;
    const flicker = 0.7 + 0.3 * Math.sin(t * 8 + torch.phase) * Math.cos(t * 5.3 + torch.phase * 1.4);
    const pulse = 0.8 + 0.2 * Math.sin(t * 3 + torch.phase);

    // Torch light stays readable without adding heavy haze.
    const lightR = 52 * flicker * torch.intensity * pulse;
    const lightGrad = ctx.createRadialGradient(torch.x, torch.y, 5, torch.x, torch.y, lightR);
    lightGrad.addColorStop(0, `rgba(255,160,40,${0.24 * flicker * torch.intensity})`);
    lightGrad.addColorStop(0.3, `rgba(255,100,20,${0.09 * flicker * torch.intensity})`);
    lightGrad.addColorStop(0.7, `rgba(200,60,10,${0.025 * flicker * torch.intensity})`);
    lightGrad.addColorStop(1, "rgba(100,20,5,0)");
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y, lightR, 0, Math.PI * 2);
    ctx.fill();

    // Torch bracket
    ctx.fillStyle = "#444";
    ctx.fillRect(torch.x - 3, torch.y - 2, 6, 10);
    ctx.fillStyle = "#3a2010";
    ctx.fillRect(torch.x - 2, torch.y - 5, 4, 6);

    // Flame
    const flameH = 8 * flicker;
    const flameGrad = ctx.createRadialGradient(torch.x, torch.y - 4, 0, torch.x, torch.y - 4, flameH);
    flameGrad.addColorStop(0, "#ffffcc");
    flameGrad.addColorStop(0.3, "#ffaa22");
    flameGrad.addColorStop(0.7, "#ff5500");
    flameGrad.addColorStop(1, "rgba(200,30,0,0)");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(torch.x, torch.y - 4, 3 * flicker, flameH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Embers
    for (let i = 0; i < 2; i++) {
      const ex = torch.x + Math.sin(t * 12 + i * 3 + torch.phase) * 3;
      const ey = torch.y - 6 - (t * 20 + i * 10) % 15;
      ctx.fillStyle = `rgba(255,150,50,${0.8 - ((t * 20 + i * 10) % 15) / 20})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ──────────────────────────────────────────────
// PILLARS
// ──────────────────────────────────────────────
function drawPillars(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.pillars) {
    if (p.kind === "wall") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(p.x + 4, p.y + 4, p.w, p.h);

      const wallG = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
      wallG.addColorStop(0, "#4a3828");
      wallG.addColorStop(0.45, "#2d2118");
      wallG.addColorStop(1, "#16100c");
      ctx.fillStyle = wallG;
      ctx.fillRect(p.x, p.y, p.w, p.h);

      ctx.strokeStyle = "rgba(130,105,78,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      for (let yy = p.y + 10; yy < p.y + p.h; yy += 14) {
        ctx.beginPath();
        ctx.moveTo(p.x, yy);
        ctx.lineTo(p.x + p.w, yy);
        ctx.stroke();
      }
      for (let xx = p.x + 22; xx < p.x + p.w; xx += 44) {
        ctx.beginPath();
        ctx.moveTo(xx, p.y + 2);
        ctx.lineTo(xx, p.y + p.h - 2);
        ctx.stroke();
      }
      continue;
    }

    // Pillar shadow
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(p.x + 4, p.y + 4, p.w, p.h);

    // Pillar base
    const pGrad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
    pGrad.addColorStop(0, "#6b5a4a");
    pGrad.addColorStop(0.3, "#4a3a2a");
    pGrad.addColorStop(0.7, "#3a2a1a");
    pGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = pGrad;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // Pillar stone texture lines
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.5;
    for (let py = p.y; py < p.y + p.h; py += 8) {
      ctx.beginPath();
      ctx.moveTo(p.x, py);
      ctx.lineTo(p.x + p.w, py);
      ctx.stroke();
    }

    // Pillar border
    ctx.strokeStyle = "#8b7a6a";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = "#1a1008";
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);

    // Runic glow on pillars
    const runeAlpha = 0.2 + 0.15 * Math.sin(state.lastTime / 800);
    ctx.fillStyle = `rgba(200,160,80,${runeAlpha})`;
    ctx.font = `${Math.min(p.w, p.h) * 0.5}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⬥", p.x + p.w / 2, p.y + p.h / 2);

    // Torch light on nearby pillars
    for (const torch of state.torches) {
      const dist = Math.hypot(torch.x - (p.x + p.w / 2), torch.y - (p.y + p.h / 2));
      if (dist < 100) {
        const lightAlpha = (1 - dist / 100) * 0.15;
        const lightGrad = ctx.createRadialGradient(
          p.x + p.w / 2, p.y + p.h / 2, 5,
          p.x + p.w / 2, p.y + p.h / 2, Math.max(p.w, p.h)
        );
        lightGrad.addColorStop(0, `rgba(255,160,40,${lightAlpha})`);
        lightGrad.addColorStop(1, "rgba(255,100,20,0)");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(p.x - 10, p.y - 10, p.w + 20, p.h + 20);
      }
    }
  }
}

// ──────────────────────────────────────────────
// DOOR
// ──────────────────────────────────────────────
function drawDoor(ctx: CanvasRenderingContext2D, state: GameState): void {
  const door = state.door;
  const openP = Math.min(door.openAnim, 1);
  const doorW = door.w * Math.max(0.1, 1 - openP * 0.9);
  const centerY = door.y + door.h / 2;
  const pulse = 0.65 + 0.35 * Math.sin(state.lastTime / 180);

  // Exit marker: visible even when the wooden door has fully opened.
  const markerG = ctx.createRadialGradient(door.x + 4, centerY, 4, door.x + 4, centerY, door.open ? 72 : 44);
  markerG.addColorStop(0, door.open ? `rgba(100,255,130,${0.42 * pulse})` : "rgba(255,190,65,0.25)");
  markerG.addColorStop(0.45, door.open ? `rgba(50,190,80,${0.14 * pulse})` : "rgba(190,95,35,0.08)");
  markerG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = markerG;
  ctx.beginPath();
  ctx.arc(door.x + 4, centerY, door.open ? 72 : 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = door.open ? `rgba(120,255,130,${0.65 * pulse})` : "rgba(255,190,80,0.55)";
  ctx.lineWidth = door.open ? 3 : 2;
  ctx.setLineDash(door.open ? [8, 6] : [5, 5]);
  ctx.strokeRect(door.x - 8, door.y - 8, door.w + 16, door.h + 16);
  ctx.setLineDash([]);

  ctx.fillStyle = door.open ? "#9cff9c" : "#ffcc66";
  ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(door.open ? "SORTIE" : "PORTE", door.x + door.w / 2, door.y - 17);

  if (door.open) {
    ctx.beginPath();
    ctx.moveTo(door.x - 34 + pulse * 5, centerY);
    ctx.lineTo(door.x - 15 + pulse * 5, centerY - 10);
    ctx.lineTo(door.x - 15 + pulse * 5, centerY + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  if (door.open && openP > 0.94) return;

  // Door shadow
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(door.x + 3, door.y + 3, doorW, door.h);

  // Door body
  const dGrad = ctx.createLinearGradient(door.x, door.y, door.x + doorW, door.y);
  dGrad.addColorStop(0, "#5a2820");
  dGrad.addColorStop(0.4, "#3a1810");
  dGrad.addColorStop(1, "#2a0a05");
  ctx.fillStyle = dGrad;
  ctx.fillRect(door.x, door.y, doorW, door.h);

  // Wood grain
  ctx.strokeStyle = "rgba(80,30,10,0.5)";
  ctx.lineWidth = 0.8;
  for (let gy = door.y + 8; gy < door.y + door.h; gy += 10) {
    ctx.beginPath();
    ctx.moveTo(door.x + 2, gy);
    ctx.bezierCurveTo(
      door.x + doorW * 0.3, gy + 2,
      door.x + doorW * 0.7, gy - 1,
      door.x + doorW - 2, gy
    );
    ctx.stroke();
  }

  // Iron bands
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(door.x, door.y, doorW, door.h);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(door.x, door.y + door.h * 0.3);
  ctx.lineTo(door.x + doorW, door.y + door.h * 0.3);
  ctx.moveTo(door.x, door.y + door.h * 0.65);
  ctx.lineTo(door.x + doorW, door.y + door.h * 0.65);
  ctx.stroke();

  // Rivets
  ctx.fillStyle = "#999";
  for (let ry = door.y + 8; ry < door.y + door.h; ry += 20) {
    for (let rx = door.x + 4; rx < door.x + doorW - 2; rx += 10) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (!door.open) {
    // Lock plate
    ctx.fillStyle = "#333";
    ctx.fillRect(door.x + doorW / 2 - 6, door.y + door.h / 2 - 8, 12, 16);
    ctx.fillStyle = "#cc4444";
    ctx.font = "10px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⬢", door.x + doorW / 2, door.y + door.h / 2);
  } else {
    // Open glow
    const glowG = ctx.createRadialGradient(
      door.x, door.y + door.h / 2, 3,
      door.x, door.y + door.h / 2, 35
    );
    glowG.addColorStop(0, "rgba(100,255,100,0.5)");
    glowG.addColorStop(1, "rgba(50,200,50,0)");
    ctx.fillStyle = glowG;
    ctx.beginPath();
    ctx.arc(door.x, door.y + door.h / 2, 35, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ──────────────────────────────────────────────
// KEY
// ──────────────────────────────────────────────
function drawKey(ctx: CanvasRenderingContext2D, key: { pos: { x: number; y: number }; size: number; bobPhase: number; glowPulse: number }): void {
  const bob = Math.sin(key.bobPhase) * 4;
  const pulse = 0.6 + 0.4 * Math.sin(key.glowPulse);
  const { x, y } = key.pos;
  const s = key.size;

  // Glow
  const glowR = s * 2.5 * pulse;
  const glowG = ctx.createRadialGradient(x, y + bob, s * 0.5, x, y + bob, glowR);
  glowG.addColorStop(0, `rgba(255,215,0,${0.5 * pulse})`);
  glowG.addColorStop(0.4, `rgba(255,180,0,${0.2 * pulse})`);
  glowG.addColorStop(1, "rgba(200,150,0,0)");
  ctx.fillStyle = glowG;
  ctx.beginPath();
  ctx.arc(x, y + bob, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Key ring
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2 + bob, s * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffea80";
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2 + bob, s * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Key shaft
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x - s * 0.12, y + s * 0.1 + bob, s * 0.24, s * 0.85);
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - s * 0.12, y + s * 0.1 + bob, s * 0.24, s * 0.85);

  // Key teeth
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x + s * 0.12, y + s * 0.25 + bob, s * 0.28, s * 0.1);
  ctx.fillRect(x + s * 0.12, y + s * 0.45 + bob, s * 0.28, s * 0.1);
  ctx.fillRect(x + s * 0.12, y + s * 0.65 + bob, s * 0.18, s * 0.1);

  // Sparkle
  ctx.fillStyle = "#ffffff";
  const sparkleAngle = (key.glowPulse * 2) % (Math.PI * 2);
  const sparkleR = s * 1.2;
  ctx.beginPath();
  ctx.arc(
    x + Math.cos(sparkleAngle) * sparkleR,
    y + bob + Math.sin(sparkleAngle) * sparkleR,
    2, 0, Math.PI * 2
  );
  ctx.fill();
}

// ──────────────────────────────────────────────
// PICKUPS AND PROJECTILES
// ──────────────────────────────────────────────
function drawPickups(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.lastTime / 1000;
  for (const item of state.pickups) {
    const y = item.pos.y + Math.sin(item.bob) * 4;
    const pulse = 0.75 + 0.25 * Math.sin(t * 4 + item.id);
    const colors = {
      scroll: ["#8eeeff", "#1a6d8f"],
      food: ["#ffdf8e", "#9d3c1f"],
      potion_speed: ["#72ff9b", "#16753b"],
      potion_power: ["#ff74e8", "#7e1c74"],
      magic_shield: ["#a68cff", "#4733a0"],
    }[item.kind];

    const glow = ctx.createRadialGradient(item.pos.x, y, 2, item.pos.x, y, item.size * 2.4);
    glow.addColorStop(0, `${colors[0]}88`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.pos.x, y, item.size * 2.4 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(item.pos.x, y);
    ctx.scale(1 + Math.sin(t * 5 + item.id) * 0.04, 1 + Math.sin(t * 5 + item.id) * 0.04);
    ctx.fillStyle = colors[0];
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = 2;

    if (item.kind === "scroll") {
      ctx.fillRect(-9, -12, 18, 24);
      ctx.strokeRect(-9, -12, 18, 24);
      ctx.strokeStyle = "#14506d";
      ctx.lineWidth = 1;
      for (let yy = -5; yy <= 6; yy += 5) {
        ctx.beginPath();
        ctx.moveTo(-5, yy);
        ctx.lineTo(5, yy);
        ctx.stroke();
      }
    } else if (item.kind === "food") {
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#5c2a13";
      ctx.fillRect(-4, 0, 8, 12);
    } else if (item.kind === "magic_shield") {
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(11, -5);
      ctx.lineTo(8, 10);
      ctx.lineTo(0, 15);
      ctx.lineTo(-8, 10);
      ctx.lineTo(-11, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.lineTo(9, 10);
      ctx.quadraticCurveTo(0, 16, -9, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(-3, -15, 6, 4);
    }
    ctx.restore();
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const projectile of state.projectiles) {
    ctx.save();
    ctx.translate(projectile.pos.x, projectile.pos.y);
    ctx.rotate(projectile.angle);
    if (projectile.kind === "arrow") {
      ctx.strokeStyle = "#e8d29a";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      ctx.fillStyle = "#dfeaff";
      ctx.beginPath();
      ctx.moveTo(17, 0);
      ctx.lineTo(8, -5);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5cb36a";
      ctx.fillRect(-16, -4, 7, 2);
      ctx.fillRect(-16, 2, 7, 2);
    } else if (projectile.kind === "dagger") {
      ctx.fillStyle = "#dce7ff";
      ctx.strokeStyle = "#6d7890";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(3, -5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#7b5a2c";
      ctx.fillRect(-12, -3, 7, 6);
    } else {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.25, "#82f7ff");
      glow.addColorStop(1, "rgba(20,140,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e6fbff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ──────────────────────────────────────────────
// PLAYER
// ──────────────────────────────────────────────
function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { x, y } = state.player;
  const r = state.playerRadius;
  const t = state.lastTime / 1000;
  const moving = Math.hypot(state.playerVel.x, state.playerVel.y) > 8;
  const facing = state.swordSwinging ? state.swordAngle : moving ? Math.atan2(state.playerVel.y, state.playerVel.x) : state.swordAngle;
  const bob = moving ? Math.sin(t * 14) * 1.2 : Math.sin(t * 3) * 0.35;
  const classPalette = {
    guerrier: { glow: "90,255,130", cloak: "#0b3a1c", bright: "#d8ffd8", mid: "#68e86c", dark: "#09531e", trim: "#d5d1a0" },
    ranger: { glow: "125,210,95", cloak: "#163b16", bright: "#f1ffc6", mid: "#82b84f", dark: "#294f22", trim: "#c99f52" },
    filou: { glow: "150,110,255", cloak: "#211343", bright: "#e7dcff", mid: "#8263d6", dark: "#2b185d", trim: "#9aa3b2" },
  }[state.heroClass];

  // Soft aura, intentionally subtle so the character remains crisp.
  const glowR = ctx.createRadialGradient(x, y + bob, r * 0.6, x, y + bob, r * 2.1);
  glowR.addColorStop(0, `rgba(${classPalette.glow},0.24)`);
  glowR.addColorStop(0.55, `rgba(${classPalette.glow},0.08)`);
  glowR.addColorStop(1, `rgba(${classPalette.glow},0)`);
  ctx.fillStyle = glowR;
  ctx.beginPath();
  ctx.arc(x, y + bob, r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.95, r * 0.95, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + bob);

  // Small cloak opposite the facing direction.
  const cloakA = facing + Math.PI;
  ctx.fillStyle = classPalette.cloak;
  ctx.beginPath();
  ctx.moveTo(Math.cos(cloakA) * r * 0.4, Math.sin(cloakA) * r * 0.4);
  ctx.lineTo(Math.cos(cloakA + 0.55) * r * 1.2, Math.sin(cloakA + 0.55) * r * 1.2);
  ctx.lineTo(Math.cos(cloakA) * r * 1.75, Math.sin(cloakA) * r * 1.75);
  ctx.lineTo(Math.cos(cloakA - 0.55) * r * 1.2, Math.sin(cloakA - 0.55) * r * 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(90,220,120,0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Main readable green circle body.
  const bodyG = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  bodyG.addColorStop(0, classPalette.bright);
  bodyG.addColorStop(0.28, classPalette.mid);
  bodyG.addColorStop(0.72, classPalette.dark);
  bodyG.addColorStop(1, "#08120a");
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#bcffbd";
  ctx.lineWidth = 1.7;
  ctx.stroke();

  // Chest armor plate and shoulder guards.
  ctx.fillStyle = "rgba(210,240,200,0.34)";
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.72);
  ctx.lineTo(r * 0.48, -r * 0.1);
  ctx.lineTo(0, r * 0.62);
  ctx.lineTo(-r * 0.48, -r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(220,255,220,0.55)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = classPalette.trim;
  ctx.beginPath();
  ctx.arc(-r * 0.72, -r * 0.08, r * 0.26, 0, Math.PI * 2);
  ctx.arc(r * 0.72, -r * 0.08, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(70,60,35,0.5)";
  ctx.stroke();

  // Helmet/hood rim.
  ctx.strokeStyle = "rgba(15,55,24,0.8)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -r * 0.12, r * 0.72, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // Eyes with blink and directional pupils.
  const blink = Math.sin(t * 0.5) > 0.98 ? 0.1 : 1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.18, r * 0.24, r * 0.22 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.32, -r * 0.18, r * 0.24, r * 0.22 * blink, 0, 0, Math.PI * 2);
  ctx.fill();

  const lookX = Math.cos(facing) * r * 0.08;
  const lookY = Math.sin(facing) * r * 0.08;
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-r * 0.32 + lookX, -r * 0.18 + lookY, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.32 + lookX, -r * 0.18 + lookY, r * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine and small belt buckle.
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(-r * 0.39, -r * 0.25, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.25, -r * 0.25, r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#806020";
  ctx.fillRect(-r * 0.5, r * 0.38, r, r * 0.13);
  ctx.fillStyle = "#f0d060";
  ctx.fillRect(-r * 0.11, r * 0.33, r * 0.22, r * 0.22);

  // Class weapon sprite, oriented toward movement or target.
  ctx.save();
  ctx.rotate(facing);
  ctx.lineCap = "round";
  if (state.heroClass === "ranger") {
    ctx.strokeStyle = "#8b5b2b";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(r * 0.25, 0, r * 0.82, -0.9, 0.9);
    ctx.stroke();
    ctx.strokeStyle = "#e6d7a2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.76, -r * 0.64);
    ctx.lineTo(r * 0.76, r * 0.64);
    ctx.stroke();
    ctx.strokeStyle = "#e8d29a";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, 0);
    ctx.lineTo(r * 1.35, 0);
    ctx.stroke();
  } else if (state.heroClass === "filou") {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(r * 0.58, side * r * 0.42);
      ctx.rotate(side * 0.22);
      ctx.fillStyle = "#dce7ff";
      ctx.strokeStyle = "#65718a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(r * 0.8, 0);
      ctx.lineTo(0, -r * 0.18);
      ctx.lineTo(-r * 0.25, 0);
      ctx.lineTo(0, r * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else {
    ctx.strokeStyle = "#d8e9ff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.6, -r * 0.45);
    ctx.lineTo(r * 1.38, -r * 0.45);
    ctx.stroke();
    ctx.strokeStyle = "#7b5a20";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.45);
    ctx.lineTo(r * 0.69, -r * 0.45);
    ctx.stroke();
    ctx.strokeStyle = "#d7b84b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.75);
    ctx.lineTo(r * 0.55, -r * 0.15);
    ctx.stroke();
  }
  ctx.restore();

  if (state.shieldTimer > 0) {
    ctx.strokeStyle = `rgba(150,135,255,${0.45 + 0.2 * Math.sin(t * 8)})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// ──────────────────────────────────────────────
// ENEMIES
// ──────────────────────────────────────────────
function drawEnemies(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const enemy of state.enemies) {
    if (!enemy.alive && enemy.deathTimer <= 0) continue;
    if (enemy.spawnAnim < 0) continue;

    const { x, y } = enemy.pos;
    const s = enemy.size;
    const t = state.lastTime / 1000;
    const dying = !enemy.alive;
    const spawnAlpha = Math.min(enemy.spawnAnim, 1);
    const deathAlpha = dying ? Math.max(enemy.deathTimer / 0.3, 0) : 1;
    const alpha = spawnAlpha * deathAlpha;
    const spawnScale = 0.35 + spawnAlpha * 0.65;
    const deathScale = dying ? 1 + (1 - deathAlpha) * 0.55 : 1;
    const pulse = 1 + Math.sin(t * 7 + enemy.id) * 0.035;
    const hitFlash = enemy.hitTimer > 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(spawnScale * deathScale * pulse, spawnScale * deathScale * pulse);
    const facing = Math.atan2(enemy.vel.y, enemy.vel.x || 0.001) + Math.PI / 2;
    ctx.rotate(facing);

    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath();
    ctx.ellipse(2, s * 0.95, s * 0.95, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(Math.PI / 4 + Math.sin(t * 2 + enemy.id) * 0.04);
    const backG = ctx.createLinearGradient(-s * 1.1, -s * 1.1, s * 1.1, s * 1.1);
    backG.addColorStop(0, dying ? "#771010" : "#b01818");
    backG.addColorStop(1, dying ? "#330000" : "#4a0000");
    ctx.fillStyle = backG;
    ctx.fillRect(-s * 0.82, -s * 0.82, s * 1.64, s * 1.64);
    ctx.strokeStyle = hitFlash ? "#ffffff" : "rgba(255,90,90,0.55)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-s * 0.82, -s * 0.82, s * 1.64, s * 1.64);
    ctx.restore();

    ctx.fillStyle = hitFlash ? "#ffe0e0" : "#2b0000";
    const spike = s * 0.55;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.9);
    ctx.lineTo(-s * 0.25, -s * 1.35);
    ctx.lineTo(-s * 0.05, -s * 0.82);
    ctx.moveTo(s * 0.55, -s * 0.9);
    ctx.lineTo(s * 0.25, -s * 1.35);
    ctx.lineTo(s * 0.05, -s * 0.82);
    ctx.moveTo(-s * 0.95, s * 0.15);
    ctx.lineTo(-s * 0.95 - spike * 0.35, s * 0.35);
    ctx.lineTo(-s * 0.88, s * 0.55);
    ctx.moveTo(s * 0.95, s * 0.15);
    ctx.lineTo(s * 0.95 + spike * 0.35, s * 0.35);
    ctx.lineTo(s * 0.88, s * 0.55);
    ctx.fill();

    const bodyG = ctx.createLinearGradient(-s, -s, s, s);
    if (hitFlash) {
      bodyG.addColorStop(0, "#ffffff");
      bodyG.addColorStop(1, "#ffb0b0");
    } else if (dying) {
      bodyG.addColorStop(0, "#7e1010");
      bodyG.addColorStop(1, "#270000");
    } else {
      bodyG.addColorStop(0, "#ff3d2e");
      bodyG.addColorStop(0.38, "#b31313");
      bodyG.addColorStop(1, "#4d0000");
    }
    ctx.fillStyle = bodyG;
    ctx.fillRect(-s, -s, s * 2, s * 2);

    ctx.strokeStyle = hitFlash ? "#ffffff" : "#ff6860";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = "rgba(255,180,150,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s + 2, -s + 2);
    ctx.lineTo(s - 2, -s + 2);
    ctx.lineTo(s - 2, s - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(40,0,0,0.55)";
    ctx.beginPath();
    ctx.moveTo(-s + 2, s - 2);
    ctx.lineTo(-s + 2, -s + 2);
    ctx.lineTo(s - 2, s - 2);
    ctx.stroke();

    const coreGlow = 0.55 + 0.45 * Math.sin(t * 8 + enemy.id);
    const coreG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.95);
    coreG.addColorStop(0, `rgba(255,150,110,${coreGlow})`);
    coreG.addColorStop(0.35, `rgba(255,40,30,${0.35 * coreGlow})`);
    coreG.addColorStop(1, "rgba(120,0,0,0)");
    ctx.fillStyle = coreG;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.95, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hitFlash ? "#380000" : "#160000";
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.2);
    ctx.lineTo(-s * 0.15, -s * 0.35);
    ctx.lineTo(-s * 0.18, s * 0.02);
    ctx.lineTo(-s * 0.58, s * 0.02);
    ctx.closePath();
    ctx.moveTo(s * 0.55, -s * 0.2);
    ctx.lineTo(s * 0.15, -s * 0.35);
    ctx.lineTo(s * 0.18, s * 0.02);
    ctx.lineTo(s * 0.58, s * 0.02);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = hitFlash ? "#ffffff" : `rgba(255,70,50,${0.8 + coreGlow * 0.2})`;
    ctx.beginPath();
    ctx.arc(-s * 0.36, -s * 0.11, s * 0.11, 0, Math.PI * 2);
    ctx.arc(s * 0.36, -s * 0.11, s * 0.11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2a0000";
    ctx.fillRect(-s * 0.42, s * 0.34, s * 0.84, s * 0.18);
    ctx.fillStyle = "#ffd6c6";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.22 - s * 0.06, s * 0.35);
      ctx.lineTo(i * s * 0.22 + s * 0.06, s * 0.35);
      ctx.lineTo(i * s * 0.22, s * 0.53);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    if (enemy.maxHp > 1 && !dying) {
      const hpW = s * 2.2;
      ctx.fillStyle = "#282020";
      ctx.fillRect(x - hpW / 2, y - s - 11, hpW, 4);
      ctx.fillStyle = enemy.hitTimer > 0 ? "#fff" : "#cc2222";
      ctx.fillRect(x - hpW / 2, y - s - 11, hpW * (enemy.hp / enemy.maxHp), 4);
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - hpW / 2, y - s - 11, hpW, 4);
    }
  }
}

// ──────────────────────────────────────────────
// SWORD ARC
// ──────────────────────────────────────────────
function drawSwordArc(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { x, y } = state.player;
  const innerR = state.playerRadius + 3;
  const outerR = state.playerRadius + 35;
  const startAngle = state.swordArcStart;
  const endAngle = startAngle + state.swordArcLength;

  // Trail afterimages
  for (let i = 0; i < state.swordTrail.length; i++) {
    const age = (state.lastTime - state.swordTrail[i]) / 1000;
    const alpha = Math.max(0, 0.15 - age * 0.8);
    if (alpha > 0) {
      const trailStart = startAngle - (state.swordTrail.length - i) * 0.08;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#88ccff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, outerR - (state.swordTrail.length - i) * 2, trailStart, trailStart + state.swordArcLength * 0.7);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Main arc glow
  ctx.save();
  const arcGlow = ctx.createRadialGradient(x, y, innerR, x, y, outerR + 5);
  arcGlow.addColorStop(0, "rgba(180,220,255,0.1)");
  arcGlow.addColorStop(0.5, "rgba(150,200,255,0.25)");
  arcGlow.addColorStop(1, "rgba(100,160,255,0)");
  ctx.fillStyle = arcGlow;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(startAngle) * innerR, y + Math.sin(startAngle) * innerR);
  ctx.arc(x, y, innerR, startAngle, endAngle);
  ctx.arc(x, y, outerR, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fill();

  // Arc fill
  const arcFill = ctx.createRadialGradient(x, y, innerR, x, y, outerR);
  arcFill.addColorStop(0, "rgba(200,230,255,0.3)");
  arcFill.addColorStop(1, "rgba(150,200,255,0.05)");
  ctx.fillStyle = arcFill;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(startAngle) * innerR, y + Math.sin(startAngle) * innerR);
  ctx.arc(x, y, innerR, startAngle, endAngle);
  ctx.arc(x, y, outerR, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fill();

  // Arc edge
  ctx.strokeStyle = "rgba(220,240,255,0.9)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, outerR, startAngle, endAngle);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, innerR, startAngle, endAngle);
  ctx.stroke();

  // Leading edge sparkles
  for (let i = 0; i < 6; i++) {
    const a = startAngle + (i / 5) * state.swordArcLength;
    const sparkG = ctx.createRadialGradient(
      x + Math.cos(a) * outerR, y + Math.sin(a) * outerR, 0,
      x + Math.cos(a) * outerR, y + Math.sin(a) * outerR, 6
    );
    sparkG.addColorStop(0, "rgba(255,255,255,0.9)");
    sparkG.addColorStop(0.3, "rgba(200,230,255,0.5)");
    sparkG.addColorStop(1, "rgba(150,200,255,0)");
    ctx.fillStyle = sparkG;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * outerR, y + Math.sin(a) * outerR, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ──────────────────────────────────────────────
// PARTICLES
// ──────────────────────────────────────────────
function drawParticles(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.type === "spark") {
      const g = ctx.createRadialGradient(p.pos.x, p.pos.y, 0, p.pos.x, p.pos.y, p.size * 2);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.3, p.color);
      g.addColorStop(1, "rgba(255,200,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "blood") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,100,100,${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "dust") {
      ctx.fillStyle = `rgba(120,100,80,${alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "key_sparkle") {
      const starG = ctx.createRadialGradient(p.pos.x, p.pos.y, 0, p.pos.x, p.pos.y, p.size * 2);
      starG.addColorStop(0, "#ffffff");
      starG.addColorStop(0.4, p.color);
      starG.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = starG;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ──────────────────────────────────────────────
// FLOATING TEXTS
// ──────────────────────────────────────────────
function drawFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const ft of state.floatingTexts) {
    const alpha = ft.life / ft.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${ft.size}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(ft.text, ft.pos.x, ft.pos.y);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ──────────────────────────────────────────────
// HUD
// ──────────────────────────────────────────────
export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, canvasW: number, _canvasH: number): void {
  const pad = 16;
  const hudH = 50;

  // HUD bar
  ctx.fillStyle = "rgba(8,6,15,0.92)";
  ctx.fillRect(0, 0, canvasW, hudH);

  // Bottom border
  ctx.strokeStyle = "rgba(180,140,60,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hudH);
  ctx.lineTo(canvasW, hudH);
  ctx.stroke();

  // Title
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("⚔️ DONJON FLASH", pad, hudH / 2);

  // Room level
  ctx.fillStyle = "#cc9966";
  ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
  const modeLabel = {
    grande_salle: "Grande salle",
    couloirs: "Couloirs",
    labyrinthe: "Labyrinthe",
    arena: "Arène",
  }[state.dungeonMode];
  ctx.fillText(`Salle ${state.roomLevel} · ${modeLabel}`, pad + 185, hudH / 2);

  const classLabel = { guerrier: "Guerrier", ranger: "Ranger", filou: "Filou" }[state.heroClass];
  ctx.fillStyle = "#b9d7ff";
  ctx.fillText(`${classLabel} niv.${state.heroLevel} · ${state.roomsCleared}/${state.maxRooms} salles · Parchemins ${state.scrolls}`, pad + 185, hudH / 2 + 16);

  // Score
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`⭐ ${state.score}`, canvasW - pad, hudH / 2 - 8);

  // Combo
  if (state.combo > 1) {
    ctx.fillStyle = "#ff8800";
    ctx.font = "bold 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(`×${state.combo} COMBO`, canvasW - pad, hudH / 2 + 9);
  }

  // Health bar — right side, below score
  const hbW = 120, hbH = 14;
  const hbX = canvasW - pad - hbW;
  const hbY = hudH / 2 - hbH / 2;
  const hp = state.health / state.maxHealth;

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(hbX, hbY, hbW, hbH);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.strokeRect(hbX, hbY, hbW, hbH);

  // Health fill
  const hGrad = ctx.createLinearGradient(hbX, hbY, hbX + hbW, hbY);
  if (hp > 0.5) {
    hGrad.addColorStop(0, "#44cc44");
    hGrad.addColorStop(1, "#228822");
  } else if (hp > 0.25) {
    hGrad.addColorStop(0, "#ccaa22");
    hGrad.addColorStop(1, "#886611");
  } else {
    hGrad.addColorStop(0, "#cc2222");
    hGrad.addColorStop(1, "#881111");
  }
  ctx.fillStyle = hGrad;
  ctx.fillRect(hbX + 1, hbY + 1, (hbW - 2) * hp, hbH - 2);

  // Health text
  ctx.fillStyle = "#fff";
  ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`❤️ ${state.health}/${state.maxHealth}`, hbX + hbW / 2, hbY + hbH / 2 + 1);

  const xpW = 120;
  const xpY = hbY + hbH + 4;
  const xpPct = Math.min(1, state.xp / state.xpToNext);
  ctx.fillStyle = "#111724";
  ctx.fillRect(hbX, xpY, xpW, 4);
  ctx.fillStyle = "#6bc7ff";
  ctx.fillRect(hbX, xpY, xpW * xpPct, 4);

  // Enemy counter
  const aliveEnemies = state.enemies.filter((e) => e.alive).length;
  if (state.phase === "fighting" || state.phase === "key_spawned") {
    ctx.fillStyle = "#cc6666";
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Ennemis: ${aliveEnemies}`, canvasW - pad, hudH / 2 + 22);
  }

  // Key indicator
  if (state.key && !state.key.collected) {
    ctx.fillStyle = "#ffd700";
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🗝️ Clé apparue!", hbX + hbW + 20, hudH / 2);
  }
  if (state.door.open) {
    ctx.fillStyle = "#44ff44";
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🚪 Porte ouverte — sortez!", hbX + hbW + 20, hudH / 2);
  }

  const boostTexts = [];
  if (state.speedBoostTimer > 0) boostTexts.push(`VIT ${Math.ceil(state.speedBoostTimer)}s`);
  if (state.damageBoostTimer > 0) boostTexts.push(`PUI ${Math.ceil(state.damageBoostTimer)}s`);
  if (state.shieldTimer > 0) boostTexts.push(`BOUCLIER ${Math.ceil(state.shieldTimer)}s`);
  if (boostTexts.length > 0) {
    ctx.fillStyle = "#9df5ff";
    ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(boostTexts.join(" · "), hbX + hbW + 20, hudH / 2 + 15);
  }
}

// ──────────────────────────────────────────────
// TITLE SCREEN
// ──────────────────────────────────────────────
export function drawTitle(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, state: GameState): void {
  ctx.fillStyle = "rgba(5,3,12,0.94)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW / 2;
  const t = performance.now() / 1000;

  // Decorative frame
  ctx.strokeStyle = "rgba(180,130,40,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(canvasW * 0.06, canvasH * 0.06, canvasW * 0.88, canvasH * 0.88);

  // Floating particles
  for (let i = 0; i < 15; i++) {
    const px = (cx + Math.sin(t * 0.3 + i * 1.7) * canvasW * 0.35 + i * 47) % canvasW;
    const py = (canvasH * 0.5 + Math.cos(t * 0.2 + i * 2.3) * canvasH * 0.35 + i * 31) % canvasH;
    const pa = 0.08 + 0.08 * Math.sin(t + i);
    ctx.fillStyle = `rgba(200,150,50,${pa})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── TITLE ──
  ctx.save();
  ctx.shadowColor = "rgba(255,200,0,0.5)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#ffd700";
  ctx.font = `bold ${Math.min(canvasW * 0.065, 48)}px 'Georgia', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚔️  DONJON FLASH  ⚔️", cx, canvasH * 0.1);
  ctx.restore();

  ctx.fillStyle = "#aa8844";
  ctx.font = `italic ${Math.min(canvasW * 0.02, 14)}px 'Georgia', serif`;
  ctx.fillText("Action-RPG tactique procedural", cx, canvasH * 0.1 + 30);

  // ── CLASS CARDS ──
  const classes = [
    { key: "1", id: "guerrier" as const, icon: "⚔️", label: "Guerrier", desc: "Épée large, solide,\n idéal pour débuter", lore: "Ancien chevalier déchu,\nil protège les siens par\nla force brute.", color: "#ff6644", stats: "❤️ 6 PV  ·  🛡️ Armure+", colorBg: "rgba(255,60,30,0.08)" },
    { key: "2", id: "ranger" as const, icon: "🏹", label: "Ranger", desc: "Arc précis, tir rapide\n à distance", lore: "Chasseur des ombres,\nil frappe sans que l'ennemi\nne voie la flèche.", color: "#44cc66", stats: "❤️ 5 PV  ·  🎯 Double tir", colorBg: "rgba(40,200,80,0.08)" },
    { key: "3", id: "filou" as const, icon: "🗡️", label: "Filou", desc: "Deux dagues, vitesse\n élevée, nerveux", lore: "Ombre furtive, chaque strike\nest un calcul mortel —\nvitesse et précision.", color: "#bb66ff", stats: "❤️ 4 PV  ·  ⚡ Crit ×2.5", colorBg: "rgba(160,80,255,0.08)" },
  ];

  const cardW = Math.min(canvasW * 0.24, 200);
  const cardH = canvasH * 0.32;
  const cardY = canvasH * 0.19;
  const gap = Math.min(canvasW * 0.03, 24);
  const totalW = classes.length * cardW + (classes.length - 1) * gap;
  const startX = cx - totalW / 2;

  classes.forEach((cls, i) => {
    const x = startX + i * (cardW + gap);
    const selected = state.heroClass === cls.id;

    // Card background
    ctx.fillStyle = selected ? cls.colorBg : "rgba(255,255,255,0.02)";
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(x + r, cardY);
    ctx.lineTo(x + cardW - r, cardY);
    ctx.quadraticCurveTo(x + cardW, cardY, x + cardW, cardY + r);
    ctx.lineTo(x + cardW, cardY + cardH - r);
    ctx.quadraticCurveTo(x + cardW, cardY + cardH, x + cardW - r, cardY + cardH);
    ctx.lineTo(x + r, cardY + cardH);
    ctx.quadraticCurveTo(x, cardY + cardH, x, cardY + cardH - r);
    ctx.lineTo(x, cardY + r);
    ctx.quadraticCurveTo(x, cardY, x + r, cardY);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = selected ? cls.color : "rgba(255,255,255,0.08)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.stroke();

    // Selected glow
    if (selected) {
      ctx.save();
      ctx.shadowColor = cls.color;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = cls.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    const cardCx = x + cardW / 2;

    // Key badge
    ctx.fillStyle = selected ? cls.color : "rgba(255,255,255,0.2)";
    ctx.font = `bold ${Math.min(canvasW * 0.016, 12)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`[${cls.key}]`, cardCx, cardY + 18);

    // Icon
    ctx.font = `${Math.min(canvasW * 0.05, 36)}px serif`;
    ctx.fillText(cls.icon, cardCx, cardY + 52);

    // Label
    ctx.fillStyle = selected ? "#ffffff" : "#aaa";
    ctx.font = `bold ${Math.min(canvasW * 0.024, 18)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText(cls.label, cardCx, cardY + 78);

    // Description (2 lines)
    ctx.fillStyle = selected ? "#ccc" : "#777";
    ctx.font = `${Math.min(canvasW * 0.016, 12)}px 'Segoe UI', system-ui, sans-serif`;
    const lines = cls.desc.split("\n");
    lines.forEach((line, li) => {
      ctx.fillText(line.trim(), cardCx, cardY + 98 + li * 16);
    });

    // Lore (italic)
    ctx.fillStyle = selected ? "rgba(200,180,140,0.8)" : "rgba(150,140,120,0.5)";
    ctx.font = `italic ${Math.min(canvasW * 0.014, 10)}px 'Georgia', serif`;
    const loreLines = cls.lore.split("\n");
    loreLines.forEach((line, li) => {
      ctx.fillText(line.trim(), cardCx, cardY + 136 + li * 14);
    });

    // Stats
    ctx.fillStyle = selected ? cls.color : "#666";
    ctx.font = `${Math.min(canvasW * 0.015, 11)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText(cls.stats, cardCx, cardY + cardH - 14);
  });

  // ── CONTROLS (compact) ──
  const ctrlY = cardY + cardH + canvasH * 0.04;
  const controls = [
    "🎮 ZQSD / WASD / Flèches — Se déplacer",
    "⚔️ ESPACE / CLIC — Attaque de classe",
    "📜 E — Sort (si parchemin)    💨 MAJ — Esquive rapide",
    "🍖 Ramasse loot    ⭐ XP → niveau → 12 salles",
  ];
  ctx.font = `${Math.min(canvasW * 0.017, 12)}px 'Segoe UI', system-ui, sans-serif`;
  controls.forEach((line, i) => {
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    ctx.fillText(line, cx, ctrlY + i * 20);
  });

  // ── START PROMPT (pulsing) ──
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#ffcc00";
  ctx.font = `bold ${Math.min(canvasW * 0.026, 18)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("ESPACE ou CLIQUE pour commencer", cx, canvasH * 0.92);
  ctx.restore();
}

// ──────────────────────────────────────────────
// ONBOARDING
// ──────────────────────────────────────────────
export function drawOnboarding(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, state: GameState): void {
  ctx.fillStyle = "rgba(4,3,10,0.94)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW / 2;
  const panelW = Math.min(canvasW * 0.84, 920);
  const panelH = Math.min(canvasH * 0.82, 660);
  const px = cx - panelW / 2;
  const py = canvasH * 0.08;
  const step = state.onboardingStep;

  ctx.fillStyle = "rgba(18,14,28,0.92)";
  ctx.fillRect(px, py, panelW, panelH);
  ctx.strokeStyle = "rgba(220,170,70,0.38)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px, py, panelW, panelH);

  // ── IMAGE (top, contained, landscape aspect) ──
  const classImg = onboardingClassesImg;
  const img = step === 1 ? onboardingItemsImg : classImg;
  const imgX = px + 24;
  const imgY = py + 20;
  const imgW = panelW - 48;
  const imgH = panelH * 0.38;
  if (img) drawContainImage(ctx, img, imgX, imgY, imgW, imgH);

  // ── TITLE (below image) ──
  const tx = px + 36;
  const titleY = imgY + imgH + 24;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffd66b";
  ctx.font = `bold ${Math.min(canvasW * 0.032, 28)}px 'Georgia', serif`;

  const classPages: Record<string, Array<{ title: string; lines: string[] }>> = {
    guerrier: [
      {
        title: "⚔️ Guerrier — Le rempart",
        lines: [
          "L'épée large balaye les ennemis proches.",
          "Solide et endurant, il encaisse les coups.",
          "Idéal pour débuter — le plus résistant.",
        ],
      },
      {
        title: "Objets et magie",
        lines: [
          "Parchemins: E lance une Boule de Feu.",
          "Nourriture: récupère un point de vie.",
          "Potions: vitesse ou puissance temporaires.",
          "Bouclier: absorbe les contacts ennemis.",
        ],
      },
      {
        title: "Survivre au donjon",
        lines: [
          "Espace / Clic: balayage d'épée en arc.",
          "MAJ: dash pour repositionner.",
          "Tue la vague, ramasse la clé, suis la porte.",
          "P / Échap: pause avec rappel des règles.",
        ],
      },
    ],
    ranger: [
      {
        title: "🏹 Ranger — Le chasseur",
        lines: [
          "Flèches rapides à distance, frappe précise.",
          "Double tir au NV3, flèche perçante au NV6.",
          "Garde tes distances — faible en mêlée.",
        ],
      },
      {
        title: "Objets et magie",
        lines: [
          "Parchemins: E lance une Nova de Gel.",
          "La nova ralentit les ennemis en zone.",
          "Nourriture: récupère un point de vie.",
          "Potions: vitesse ou puissance temporaires.",
        ],
      },
      {
        title: "Survivre au donjon",
        lines: [
          "Espace / Clic: tir de flèche auto-visé.",
          "MAJ: dash pour esquiver les assauts.",
          "Tue la vague, ramasse la clé, suis la porte.",
          "P / Échap: pause avec rappel des règles.",
        ],
      },
    ],
    filou: [
      {
        title: "🗡️ Filou — L'ombre",
        lines: [
          "Deux dagues en éventail, vitesse fulgurante.",
          "Crit ×2.5 au NV6, cooldown réduit au NV10.",
          "Joue au plus près — le plus rapide, le plus fragile.",
        ],
      },
      {
        title: "Objets et magie",
        lines: [
          "Parchemins: E lance une Boule de Feu.",
          "Nourriture: récupère un point de vie.",
          "Potions: boostent ta vitesse déjà élevée.",
          "Bouclier: vital pour survivre en mêlée.",
        ],
      },
      {
        title: "Survivre au donjon",
        lines: [
          "Espace / Clic: double dague en éventail.",
          "MAJ: dash pour entrer/sortir frappe.",
          "Tue la vague, ramasse la clé, suis la porte.",
          "P / Échap: pause avec rappel des règles.",
        ],
      },
    ],
  };

  const pages = classPages[state.heroClass] ?? classPages.guerrier;
  const page = pages[step] ?? pages[0];

  ctx.fillText(page.title, tx, titleY);

  // ── TEXT LINES ──
  ctx.font = `${Math.min(canvasW * 0.021, 18)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#e8dcc6";
  const lineStartY = titleY + 38;
  page.lines.forEach((line, i) => {
    if (line) ctx.fillText(line, tx, lineStartY + i * 30);
  });

  // ── HERO BOX (anchored at panel bottom) ──
  const classLabel = { guerrier: "Guerrier", ranger: "Ranger", filou: "Filou" }[state.heroClass];
  const classColor = { guerrier: "#ff6644", ranger: "#44cc66", filou: "#bb66ff" }[state.heroClass];
  const boxH = 56;
  const boxY = py + panelH - boxH - 14;
  ctx.fillStyle = "rgba(255,210,80,0.14)";
  ctx.fillRect(tx, boxY, panelW * 0.92, boxH);
  ctx.strokeStyle = "rgba(255,210,80,0.38)";
  ctx.strokeRect(tx, boxY, panelW * 0.92, boxH);
  ctx.fillStyle = classColor;
  ctx.font = `bold ${Math.min(canvasW * 0.02, 17)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText(`Héros sélectionné: ${classLabel}`, tx + 18, boxY + 10);
  ctx.fillStyle = "#cfc6b6";
  ctx.font = `${Math.min(canvasW * 0.017, 13)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText(step === 2 ? "Entrée / Espace: entrer dans le donjon" : "Entrée / Espace: continuer · Retour: précédent · 1/2/3: classe", tx + 18, boxY + 32);

  // ── PAGE DOTS ──
  ctx.textAlign = "center";
  const dotsY = py + panelH + 20;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === step ? "#ffd66b" : "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(cx - 20 + i * 20, dotsY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ──────────────────────────────────────────────
// PAUSE OVERLAY
// ──────────────────────────────────────────────
export function drawPauseOverlay(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, state: GameState): void {
  ctx.fillStyle = "rgba(4,3,10,0.78)";
  ctx.fillRect(0, 0, canvasW, canvasH);
  const w = Math.min(760, canvasW * 0.82);
  const h = Math.min(520, canvasH * 0.72);
  const x = canvasW / 2 - w / 2;
  const y = canvasH / 2 - h / 2;
  ctx.fillStyle = "rgba(18,14,28,0.96)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,210,80,0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffd66b";
  ctx.font = `bold ${Math.min(canvasW * 0.044, 38)}px 'Georgia', serif`;
  ctx.fillText("PAUSE", canvasW / 2, y + 28);

  const classLabel = { guerrier: "Guerrier", ranger: "Ranger", filou: "Filou" }[state.heroClass];
  ctx.fillStyle = "#d8d0bd";
  ctx.font = `${Math.min(canvasW * 0.019, 16)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText(`${classLabel} niv.${state.heroLevel} · Salle ${state.roomLevel}/${state.maxRooms} · XP ${state.xp}/${state.xpToNext} · Parchemins ${state.scrolls}`, canvasW / 2, y + 82);

  const left = x + 58;
  const top = y + 130;
  const rules = [
    "Déplacement: ZQSD / WASD / Flèches",
    "Attaque: Espace ou clic, avec auto-visée si aucune direction n'est pressée",
    "Sort: E consomme un parchemin et crée une explosion magique",
    "Dash: MAJ pour traverser rapidement les couloirs dangereux",
    "Objets: nourriture = soin, potions = bonus, bouclier = protection",
    "Objectif: élimine la vague, récupère la clé, rejoins la porte lumineuse",
    "Audio: M coupe ou remet la musique et les effets",
  ];
  ctx.textAlign = "left";
  ctx.font = `${Math.min(canvasW * 0.018, 15)}px 'Segoe UI', system-ui, sans-serif`;
  rules.forEach((line, i) => {
    ctx.fillStyle = i % 2 ? "#cfc6b6" : "#f0e5cb";
    ctx.fillText(line, left, top + i * 34);
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "#9df5ff";
  ctx.font = `bold ${Math.min(canvasW * 0.02, 17)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText("P ou Échap pour reprendre", canvasW / 2, y + h - 58);
  ctx.fillStyle = "rgba(255,100,100,0.8)";
  ctx.font = `${Math.min(canvasW * 0.018, 15)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText("H pour revenir au menu principal", canvasW / 2, y + h - 32);
}

function drawContainImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,210,80,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

export function drawVictory(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, state: GameState): void {
  ctx.fillStyle = "rgba(4,12,8,0.88)";
  ctx.fillRect(0, 0, canvasW, canvasH);
  const cx = canvasW / 2;
  const t = performance.now() / 1000;

  for (let i = 0; i < 34; i++) {
    const x = (cx + Math.sin(t * 0.4 + i) * canvasW * 0.35 + i * 73) % canvasW;
    const y = (canvasH * 0.25 + Math.cos(t * 0.25 + i * 1.6) * canvasH * 0.18 + i * 41) % canvasH;
    ctx.fillStyle = `rgba(255,215,90,${0.18 + 0.16 * Math.sin(t * 2 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.shadowColor = "rgba(255,220,90,0.8)";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#ffdc68";
  ctx.font = `bold ${Math.min(canvasW * 0.07, 54)}px 'Georgia', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DONJON CONQUIS", cx, canvasH * 0.28);
  ctx.restore();

  ctx.fillStyle = "#e7dec6";
  ctx.font = `${Math.min(canvasW * 0.03, 22)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText(`Salles terminées : ${state.roomsCleared}/${state.maxRooms}`, cx, canvasH * 0.42);
  ctx.fillText(`Niveau du héros : ${state.heroLevel}`, cx, canvasH * 0.48);
  ctx.fillText(`Score final : ${state.score}`, cx, canvasH * 0.54);

  ctx.fillStyle = "#9df5ff";
  ctx.font = `${Math.min(canvasW * 0.022, 17)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText("Espace ou Entrée pour repartir dans un nouveau donjon", cx, canvasH * 0.67);
}

// ──────────────────────────────────────────────
// GAME OVER SCREEN
// ──────────────────────────────────────────────
export function drawGameOver(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, state: GameState): void {
  ctx.fillStyle = "rgba(12,0,0,0.9)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW / 2;
  const t = performance.now() / 1000;

  // Blood drip effect at top
  for (let i = 0; i < 8; i++) {
    const bx = (cx + i * 113 - 400) % canvasW;
    const bh = 30 + (i * 47) % 60;
    ctx.fillStyle = `rgba(120,0,0,${0.3 + 0.1 * Math.sin(t + i)})`;
    ctx.fillRect(bx, 0, 4, bh);
    ctx.beginPath();
    ctx.arc(bx + 2, bh, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.shadowColor = "rgba(255,0,0,0.5)";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ff3333";
  ctx.font = `bold ${Math.min(canvasW * 0.07, 48)}px 'Georgia', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💀 GAME OVER 💀", cx, canvasH * 0.28);
  ctx.restore();

  ctx.fillStyle = "#aaa";
  ctx.font = `${Math.min(canvasW * 0.03, 22)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText(`Score final : ⭐ ${state.score} points`, cx, canvasH * 0.42);
  ctx.fillText(`Salle atteinte : ${state.roomLevel}`, cx, canvasH * 0.49);

  if (state.roomLevel >= 10) {
    ctx.fillStyle = "#ff8800";
    ctx.font = `bold ${Math.min(canvasW * 0.025, 18)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText("🏆 Maître du Donjon!", cx, canvasH * 0.57);
  } else if (state.roomLevel >= 5) {
    ctx.fillStyle = "#ccaa22";
    ctx.font = `bold ${Math.min(canvasW * 0.025, 18)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText("⚔️ Guerrier aguerri!", cx, canvasH * 0.57);
  }

  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#ffcc00";
  ctx.font = `${Math.min(canvasW * 0.025, 18)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText("Appuie sur ESPACE pour rejouer", cx, canvasH * 0.66);
  ctx.restore();
}