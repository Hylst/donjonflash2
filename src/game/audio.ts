import type { SoundEvent } from "./engine";

type OscType = OscillatorType;

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private drone: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private delay: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private musicTimer = 0;
  private intensity = 1;
  private muted = false;
  private chordIndex = 0;
  // Am - F - C - G progression
  private readonly chords = [
    [220, 261.63, 329.63],    // Am
    [174.61, 220, 349.23],    // F
    [261.63, 329.63, 392],    // C
    [196, 246.94, 392],       // G
  ];

  async start(): Promise<void> {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    if (!this.ctx) {
      this.ctx = new AudioCtor();

      // Master
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);

      // Delay for atmosphere
      this.delay = this.ctx.createDelay(1.0);
      this.delay.delayTime.value = 0.35;
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.value = 0.18;
      this.delay.connect(this.delayGain);
      this.delayGain.connect(this.master);
      this.delayGain.connect(this.delay);

      // Music bus
      this.music = this.ctx.createGain();
      this.music.gain.value = 0.08;
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = "lowpass";
      this.musicFilter.frequency.value = 1800;
      this.music.connect(this.musicFilter);
      this.musicFilter.connect(this.master);

      // Drone bus
      this.drone = this.ctx.createGain();
      this.drone.gain.value = 0.025;
      this.drone.connect(this.musicFilter);

      this.startDrone();
      this.scheduleMusic();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.22;
    return this.muted;
  }

  setIntensity(roomLevel: number, active: boolean): void {
    this.intensity = Math.min(2.1, 0.85 + roomLevel * 0.07);
    if (this.music && this.ctx) {
      this.music.gain.setTargetAtTime(active ? 0.075 * this.intensity : 0.035, this.ctx.currentTime, 0.35);
    }
    if (this.musicFilter && this.ctx) {
      this.musicFilter.frequency.setTargetAtTime(active ? 1450 + roomLevel * 80 : 850, this.ctx.currentTime, 0.5);
    }
    if (this.drone && this.ctx) {
      this.drone.gain.setTargetAtTime(active ? 0.02 + roomLevel * 0.003 : 0.015, this.ctx.currentTime, 0.6);
    }
  }

  play(event: SoundEvent): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    const map: Record<SoundEvent, () => void> = {
      attack: () => { this.swordSwing(now); },
      arrow: () => { this.arrowShot(now); },
      dagger: () => { this.daggerThrow(now); },
      spell: () => this.spellCast(now),
      pickup: () => this.pickupSound(now),
      hurt: () => this.heroHurt(now),
      shield: () => this.shieldHit(now),
      enemy_die: () => this.enemyDeath(now),
      key: () => this.keyPickup(now),
      door: () => this.doorOpen(now),
      dash: () => this.dashSound(now),
      room: () => this.roomEnter(now),
      select: () => this.uiSelect(now),
      pause: () => this.uiPause(now),
      level_up: () => this.levelUp(now),
      victory: () => this.victoryFanfare(now),
      crate_hit: () => this.crateHit(now),
      crate_break: () => this.crateBreak(now),
    };
    map[event]?.();
  }

  // ── AMBIENT DRONE ──
  private startDrone(): void {
    if (!this.ctx || !this.drone) return;
    // Low sustained pad
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.value = 55;
    this.droneOsc1.connect(this.drone);
    this.droneOsc1.start();

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.value = 82.41;
    const droneLfo = this.ctx.createOscillator();
    const droneLfoGain = this.ctx.createGain();
    droneLfo.type = "sine";
    droneLfo.frequency.value = 0.15;
    droneLfoGain.gain.value = 3;
    droneLfo.connect(droneLfoGain);
    droneLfoGain.connect(this.droneOsc2.frequency);
    droneLfo.start();
    this.droneOsc2.connect(this.drone);
    this.droneOsc2.start();
  }

  // ── MUSIC ──
  private scheduleMusic(): void {
    if (!this.ctx || !this.music) return;
    const step = () => {
      if (!this.ctx || !this.music) return;
      const now = this.ctx.currentTime;
      const pace = Math.max(0.28, 0.44 - (this.intensity - 1) * 0.03);
      const chord = this.chords[this.chordIndex % this.chords.length];

      // Pad chord
      chord.forEach((freq, i) => {
        this.tone(now, freq, pace * 5, "sine", 0.018 + this.intensity * 0.005, this.music);
        this.tone(now, freq * 2, pace * 4, "sine", 0.008, this.music);
      });

      // Arpeggio notes
      for (let i = 0; i < 8; i++) {
        const noteIdx = (this.musicTimer + i * 2) % chord.length;
        const octave = i % 2 === 0 ? 2 : 4;
        const note = chord[noteIdx] * (octave === 2 ? 0.5 : 1);
        const t = now + i * pace * 0.75;
        this.tone(t, note, pace * 0.5, i % 3 === 0 ? "triangle" : "sine", 0.022 + this.intensity * 0.008, this.music);
      }

      // Bass note
      this.tone(now, chord[0] * 0.5, pace * 4, "sine", 0.03, this.music);

      // Kick
      this.musicKick(now);
      if (this.intensity > 1.2) this.musicKick(now + pace * 3, 0.5);

      // Hi-hat on beats
      if (this.intensity > 1.0) {
        for (let i = 0; i < 4; i++) {
          this.hihat(now + i * pace * 1.5, 0.015);
        }
      }

      this.musicTimer = (this.musicTimer + 1) % 8;
      if (this.musicTimer === 0) this.chordIndex = (this.chordIndex + 1) % this.chords.length;
      window.setTimeout(step, Math.floor(pace * 6 * 1000));
    };
    step();
  }

  private musicKick(time: number, gainScale = 1): void {
    if (!this.ctx || !this.music) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(72, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.18);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.04 * gainScale, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    osc.connect(g);
    g.connect(this.music!);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  private hihat(time: number, vol: number): void {
    if (!this.ctx || !this.music) return;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 8000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(f);
    f.connect(g);
    g.connect(this.music!);
    src.start(time);
  }

  // ── SOUND EFFECTS ──
  private swordSwing(time: number): void {
    if (!this.ctx || !this.master) return;
    // Metallic swoosh
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(180, time);
    osc1.frequency.exponentialRampToValueAtTime(680, time + 0.06);
    osc1.frequency.exponentialRampToValueAtTime(120, time + 0.14);
    g1.gain.setValueAtTime(0.0001, time);
    g1.gain.exponentialRampToValueAtTime(0.1, time + 0.015);
    g1.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc1.connect(g1);
    g1.connect(this.master);
    osc1.start(time);
    osc1.stop(time + 0.18);

    // Impact thud
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(140, time + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(50, time + 0.12);
    g2.gain.setValueAtTime(0.0001, time + 0.03);
    g2.gain.exponentialRampToValueAtTime(0.07, time + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    osc2.connect(g2);
    g2.connect(this.master);
    osc2.start(time + 0.03);
    osc2.stop(time + 0.17);

    // Metal ring
    this.tone(time + 0.02, 1800, 0.08, "sine", 0.03, this.delay);
  }

  private arrowShot(time: number): void {
    // Bow twang
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.12);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.08, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    osc.connect(g);
    g.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.16);

    // Whistle
    this.tone(time + 0.01, 2200, 0.1, "sine", 0.025, this.delay);
  }

  private daggerThrow(time: number): void {
    // Quick metallic flick
    this.tone(time, 1200, 0.06, "triangle", 0.08);
    this.tone(time + 0.01, 2400, 0.04, "sine", 0.04);
    this.tone(time + 0.02, 600, 0.05, "sawtooth", 0.03);
  }

  private spellCast(time: number): void {
    // Rising magical chime
    this.chime(time, [523, 659, 784, 1047]);
    this.tone(time + 0.15, 1047, 0.4, "sine", 0.06);
    this.tone(time, 82, 0.4, "sine", 0.07);
    // Sparkle delay
    this.chime(time + 0.3, [784, 1047, 1318]);
  }

  private pickupSound(time: number): void {
    this.chime(time, [660, 880, 1320]);
    this.tone(time + 0.08, 1760, 0.15, "sine", 0.04);
  }

  private heroHurt(time: number): void {
    // Pain crunch
    this.noiseBurst(time, 0.12, 300);
    this.tone(time, 85, 0.2, "sawtooth", 0.07);
    this.tone(time + 0.05, 120, 0.1, "square", 0.03);
    // Delayed echo
    this.noiseBurst(time + 0.1, 0.06, 200);
  }

  private shieldHit(time: number): void {
    // Metallic clang
    this.tone(time, 1200, 0.15, "sine", 0.06);
    this.tone(time, 1800, 0.1, "triangle", 0.04);
    this.tone(time + 0.02, 2400, 0.08, "sine", 0.03);
    this.noiseBurst(time, 0.06, 4000);
  }

  private enemyDeath(time: number): void {
    // Gore burst
    this.noiseBurst(time, 0.15, 180);
    this.tone(time, 65, 0.2, "sawtooth", 0.06);
    this.tone(time + 0.04, 45, 0.15, "sine", 0.04);
    // Soul release chime
    this.chime(time + 0.1, [330, 440, 550]);
  }

  private keyPickup(time: number): void {
    this.chime(time, [740, 988, 1480]);
    this.chime(time + 0.15, [988, 1480, 1976]);
    this.tone(time, 370, 0.6, "sine", 0.05);
  }

  private doorOpen(time: number): void {
    this.chime(time, [220, 330, 440]);
    this.tone(time, 55, 0.6, "sine", 0.06);
    this.tone(time + 0.2, 110, 0.5, "sine", 0.04);
    // Creaking
    const osc = this.ctx?.createOscillator();
    const g = this.ctx?.createGain();
    if (osc && g && this.ctx) {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.linearRampToValueAtTime(120, time + 0.3);
      osc.frequency.linearRampToValueAtTime(60, time + 0.6);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.04, time + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);
      osc.connect(g);
      g.connect(this.master!);
      osc.start(time);
      osc.stop(time + 0.65);
    }
  }

  private dashSound(time: number): void {
    // Quick air whoosh
    const osc = this.ctx?.createOscillator();
    const g = this.ctx?.createGain();
    if (!osc || !g || !this.ctx) return;
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.exponentialRampToValueAtTime(900, time + 0.05);
    osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.08, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    osc.connect(g);
    g.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.14);
    // Wind noise
    this.noiseBurst(time, 0.08, 3000);
  }

  private roomEnter(time: number): void {
    this.chime(time, [196, 247, 392]);
    this.tone(time + 0.15, 392, 0.4, "sine", 0.03);
  }

  private uiSelect(time: number): void {
    this.pluck(time, 660, 0.06);
  }

  private uiPause(time: number): void {
    this.pluck(time, 330, 0.08);
  }

  private levelUp(time: number): void {
    this.chime(time, [392, 523.25, 659.25, 783.99, 1046.5]);
    this.tone(time + 0.2, 523.25, 0.6, "sine", 0.06);
    this.tone(time + 0.4, 1046.5, 0.4, "triangle", 0.04);
  }

  private victoryFanfare(time: number): void {
    this.chime(time, [261.63, 329.63, 392, 523.25, 659.25]);
    this.tone(time, 130.81, 1.2, "sine", 0.08);
    this.chime(time + 0.5, [523.25, 659.25, 783.99, 1046.5]);
  }

  private crateHit(time: number): void {
    // Wood crack
    this.noiseBurst(time, 0.06, 800);
    this.tone(time, 200, 0.08, "triangle", 0.07);
    this.tone(time + 0.01, 350, 0.04, "sine", 0.03);
  }

  private crateBreak(time: number): void {
    // Big wood shatter
    this.noiseBurst(time, 0.18, 600);
    this.tone(time, 120, 0.15, "triangle", 0.08);
    this.tone(time + 0.03, 80, 0.12, "sine", 0.05);
    // Debris scatter
    for (let i = 0; i < 3; i++) {
      this.noiseBurst(time + 0.05 + i * 0.04, 0.04, 400 + i * 300);
    }
  }

  // ── HELPERS ──
  private tone(time: number, freq: number, duration: number, type: OscType, gain = 0.12, dest?: GainNode | null): void {
    const output = dest || this.master;
    if (!this.ctx || !output) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(g);
    g.connect(output);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  private pluck(time: number, freq: number, duration: number): void {
    this.tone(time, freq, duration, "triangle", 0.12);
    this.tone(time, freq * 2.01, duration * 0.75, "sine", 0.04);
  }

  private chime(time: number, notes: number[]): void {
    notes.forEach((note, i) => this.tone(time + i * 0.045, note, 0.22, "triangle", 0.09));
  }

  private noiseBurst(time: number, duration: number, filterFreq: number): void {
    if (!this.ctx || !this.master) return;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(time);
  }
}
