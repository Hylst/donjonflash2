import type { SoundEvent } from "./engine";

type OscType = OscillatorType;

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicTimer = 0;
  private intensity = 1;
  private muted = false;

  async start(): Promise<void> {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    if (!this.ctx) {
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
      this.music = this.ctx.createGain();
      this.music.gain.value = 0.08;
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = "lowpass";
      this.musicFilter.frequency.value = 1800;
      this.music.connect(this.musicFilter);
      this.musicFilter.connect(this.master);
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
  }

  play(event: SoundEvent): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    const map: Record<SoundEvent, () => void> = {
      attack: () => { this.swipe(now); this.tone(now + 0.025, 144, 0.08, "triangle", 0.05); },
      arrow: () => { this.pluck(now, 660, 0.08); this.tone(now, 1200, 0.04, "sine", 0.035); },
      dagger: () => { this.pluck(now, 940, 0.055); this.tone(now + 0.018, 1480, 0.045, "triangle", 0.045); },
      spell: () => this.spell(now),
      pickup: () => this.chime(now, [660, 880, 1320]),
      hurt: () => { this.noiseBurst(now, 0.16, 220); this.tone(now, 92, 0.18, "sawtooth", 0.06); },
      shield: () => { this.chime(now, [520, 740]); this.tone(now, 1040, 0.22, "sine", 0.04); },
      enemy_die: () => { this.noiseBurst(now, 0.12, 120); this.tone(now, 70, 0.16, "triangle", 0.05); },
      key: () => this.chime(now, [740, 988, 1480]),
      door: () => { this.chime(now, [220, 330, 440]); this.tone(now, 55, 0.55, "sine", 0.05); },
      dash: () => this.swipe(now, true),
      room: () => this.chime(now, [196, 247, 392]),
      select: () => this.pluck(now, 520, 0.06),
      pause: () => this.pluck(now, 260, 0.08),
      level_up: () => this.chime(now, [392, 523.25, 659.25, 783.99, 1046.5]),
      victory: () => { this.chime(now, [261.63, 329.63, 392, 523.25, 659.25]); this.tone(now, 130.81, 1.1, "sine", 0.08); },
    };
    map[event]();
  }

  private tone(time: number, freq: number, duration: number, type: OscType, gain = 0.12, dest = this.master): void {
    if (!this.ctx || !dest) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(g);
    g.connect(dest);
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

  private swipe(time: number, reverse = false): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(reverse ? 720 : 190, time);
    osc.frequency.exponentialRampToValueAtTime(reverse ? 180 : 780, time + 0.09);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.09, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    osc.connect(g);
    g.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  private spell(time: number): void {
    this.chime(time, [392, 554, 784, 1175]);
    this.tone(time, 98, 0.35, "sine", 0.08);
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
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(time);
  }

  private scheduleMusic(): void {
    if (!this.ctx || !this.music) return;
    const scale = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392];
    const step = () => {
      if (!this.ctx || !this.music) return;
      const now = this.ctx.currentTime;
      const pace = Math.max(0.26, 0.42 - (this.intensity - 1) * 0.035);
      for (let i = 0; i < 12; i++) {
        const note = scale[(this.musicTimer + i * (this.musicTimer % 2 ? 3 : 2)) % scale.length];
        const t = now + i * pace;
        this.tone(t, note, pace * 0.7, i % 3 ? "triangle" : "sine", 0.028 + this.intensity * 0.01, this.music);
        if (i % 4 === 0) this.tone(t, note / 2, pace * 1.7, "sine", 0.028 + this.intensity * 0.006, this.music);
        if (i % 6 === 3) this.tone(t, note * 1.5, pace * 0.45, "sine", 0.018, this.music);
      }
      this.musicKick(now);
      this.musicKick(now + pace * 6, 0.6);
      this.musicTimer = (this.musicTimer + 1) % scale.length;
      window.setTimeout(step, Math.floor(pace * 12 * 1000));
    };
    step();
  }

  private musicKick(time: number, gainScale = 1): void {
    if (!this.ctx || !this.music) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(68, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.16);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.035 * gainScale, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    osc.connect(g);
    g.connect(this.music);
    osc.start(time);
    osc.stop(time + 0.22);
  }
}