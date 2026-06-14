import { useEffect, useRef, useCallback } from "react";
import {
  GameState,
  createInitialState,
  update,
  heroPrimaryAttack,
  castScrollSpell,
  dashHero,
  setHeroClass,
  advanceOnboarding,
  backOnboarding,
  togglePause,
} from "./game/engine";
import { GameAudio } from "./game/audio";
import {
  render,
  drawHUD,
  drawTitle,
  drawOnboarding,
  drawPauseOverlay,
  drawVictory,
  drawGameOver,
  preloadImages,
} from "./game/renderer";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const audioRef = useRef<GameAudio | null>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (stateRef.current) {
      stateRef.current.viewW = rect.width;
      stateRef.current.viewH = rect.height;
    }
  }, []);

  const loop = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    if (!state) return;

    update(state, time);
    audioRef.current?.setIntensity(state.roomLevel, state.phase !== "title" && state.phase !== "onboarding" && state.phase !== "paused" && state.phase !== "game_over");
    if (audioRef.current && state.soundEvents.length > 0) {
      for (const event of state.soundEvents) audioRef.current.play(event);
      state.soundEvents = [];
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);

    if (state.phase === "title") {
      render(ctx, state, cw, ch); // render empty room behind
      drawTitle(ctx, cw, ch, state);
      drawHUD(ctx, state, cw, ch);
    } else if (state.phase === "onboarding") {
      render(ctx, state, cw, ch);
      drawOnboarding(ctx, cw, ch, state);
      drawHUD(ctx, state, cw, ch);
    } else if (state.phase === "paused") {
      render(ctx, state, cw, ch);
      drawHUD(ctx, state, cw, ch);
      drawPauseOverlay(ctx, cw, ch, state);
    } else if (state.phase === "game_over") {
      render(ctx, state, cw, ch);
      drawHUD(ctx, state, cw, ch);
      drawGameOver(ctx, cw, ch, state);
    } else if (state.phase === "victory") {
      render(ctx, state, cw, ch);
      drawHUD(ctx, state, cw, ch);
      drawVictory(ctx, cw, ch, state);
    } else {
      render(ctx, state, cw, ch);
      drawHUD(ctx, state, cw, ch);
    }

    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Init state
    const rect = canvas.getBoundingClientRect();
    stateRef.current = createInitialState(rect.width, rect.height);
    audioRef.current = new GameAudio();

    // Preload images
    preloadImages();

    // Start animation
    animRef.current = requestAnimationFrame(loop);

    // Resize observer
    const observer = new ResizeObserver(() => {
      resize();
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [loop, resize]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (!state) return;
      audioRef.current?.start();

      // Prevent default for game keys
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "ShiftLeft",
          "ShiftRight",
          "KeyE",
          "KeyM",
          "KeyP",
          "Escape",
          "Backspace",
          "Enter",
          "Digit1",
          "Digit2",
          "Digit3",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "KeyZ",
          "KeyQ",
          "keyW",
          "keyA",
          "keyS",
          "keyD",
          "keyZ",
          "keyQ",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      state.keysDown.add(e.code);

      if (state.phase === "title") {
        if (e.code === "Digit1") setHeroClass(state, "guerrier");
        if (e.code === "Digit2") setHeroClass(state, "ranger");
        if (e.code === "Digit3") setHeroClass(state, "filou");
      }

      // Space to start game or swing sword
      if (e.code === "Space") {
        heroPrimaryAttack(state);
      }

      if (e.code === "KeyE") {
        castScrollSpell(state);
      }

      if (e.code === "KeyP" || e.code === "Escape") {
        togglePause(state);
      }

      if (e.code === "Backspace") {
        backOnboarding(state);
      }

      if (e.code === "KeyM") {
        audioRef.current?.toggleMute();
      }

      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        dashHero(state);
      }

      // Enter also starts
      if (e.code === "Enter") {
        if (state.phase === "onboarding") {
          advanceOnboarding(state);
        } else if (state.phase === "title" || state.phase === "game_over" || state.phase === "victory") {
          heroPrimaryAttack(state);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (!state) return;
      state.keysDown.delete(e.code);
    };

    // Click to start on title/game over
    const handleClick = (_e: MouseEvent) => {
      const state = stateRef.current;
      if (!state) return;
      audioRef.current?.start();
      // During gameplay, click to use the class attack.
      heroPrimaryAttack(state);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden bg-black"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block cursor-crosshair"
      />

      {/* Mobile touch overlay for sword */}
      <button
        className="absolute bottom-6 right-6 z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500/50 bg-black/60 text-2xl text-yellow-400 shadow-lg shadow-yellow-900/30 active:bg-yellow-600/30 active:scale-90 transition-transform select-none"
        onTouchStart={(e) => {
          e.preventDefault();
          const state = stateRef.current;
          if (!state) return;
          heroPrimaryAttack(state);
        }}
        aria-label="Attaque de classe"
      >
        ⚔️
      </button>

      <button
        className="absolute bottom-24 right-7 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/50 bg-black/60 text-xl text-cyan-200 shadow-lg shadow-cyan-900/25 active:bg-cyan-600/30 active:scale-90 transition-transform select-none"
        onTouchStart={(e) => {
          e.preventDefault();
          const state = stateRef.current;
          if (!state) return;
          castScrollSpell(state);
        }}
        aria-label="Sort de parchemin"
      >
        📜
      </button>

      <button
        className="absolute bottom-6 right-24 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/60 text-lg text-white shadow-lg active:bg-white/20 active:scale-90 transition-transform select-none"
        onTouchStart={(e) => {
          e.preventDefault();
          const state = stateRef.current;
          if (!state) return;
          dashHero(state);
        }}
        aria-label="Esquive"
      >
        ⇢
      </button>

      {/* Mobile D-pad */}
      <div className="absolute bottom-6 left-6 z-10 grid grid-cols-3 grid-rows-3 gap-1 select-none">
        <div />
        <button
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white active:bg-white/20"
          onTouchStart={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.add("ArrowUp");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.delete("ArrowUp");
          }}
          aria-label="Haut"
        >
          ▲
        </button>
        <div />
        <button
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white active:bg-white/20"
          onTouchStart={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.add("ArrowLeft");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.delete("ArrowLeft");
          }}
          aria-label="Gauche"
        >
          ◀
        </button>
        <div className="flex h-12 w-12 items-center justify-center text-white/30 text-xs">
          MOVE
        </div>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white active:bg-white/20"
          onTouchStart={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.add("ArrowRight");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.delete("ArrowRight");
          }}
          aria-label="Droite"
        >
          ▶
        </button>
        <div />
        <button
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white active:bg-white/20"
          onTouchStart={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.add("ArrowDown");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stateRef.current?.keysDown.delete("ArrowDown");
          }}
          aria-label="Bas"
        >
          ▼
        </button>
        <div />
      </div>
    </div>
  );
}
