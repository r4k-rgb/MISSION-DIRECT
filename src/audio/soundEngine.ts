import { CharacterId } from '../types/game';

export type MusicMood = 'none' | 'title' | 'hangar' | 'cutscene' | 'launch' | 'finale';

class PixelSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private bgmMuted = false;
  private sfxMuted = false;
  private currentMood: MusicMood = 'none';
  private stepTimer: number | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.bgmMuted ? 0 : 0.22;
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxMuted ? 0 : 0.4;
        this.sfxGain.connect(this.masterGain);
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setBgmMuted(muted: boolean): void {
    this.bgmMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx.currentTime, 0.03);
    }
  }

  public isBgmMuted(): boolean {
    return this.bgmMuted;
  }

  public isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    target: 'sfx' | 'bgm',
    volume = 0.2,
    slideToFreq?: number,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const dest = target === 'bgm' ? this.bgmGain : this.sfxGain;
    if (!dest) return;
    if (target === 'bgm' && this.bgmMuted) return;
    if (target === 'sfx' && this.sfxMuted) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.015, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, filterFreq: number, volume = 0.25, target: 'sfx' | 'bgm' = 'sfx'): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const dest = target === 'bgm' ? this.bgmGain : this.sfxGain;
    if (!dest) return;
    if (target === 'bgm' && this.bgmMuted) return;
    if (target === 'sfx' && this.sfxMuted) return;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + duration);
  }

  // --- SFX Triggers ---
  public click(): void {
    this.playTone(580, 0.045, 'square', 'sfx', 0.12, 720);
  }

  public equip(): void {
    this.playTone(330, 0.06, 'square', 'sfx', 0.14);
    this.playTone(495, 0.08, 'square', 'sfx', 0.14, undefined, 0.05);
  }

  public unequip(): void {
    this.playTone(420, 0.06, 'triangle', 'sfx', 0.15, 260);
  }

  public upgrade(): void {
    [440, 554, 659, 880].forEach((f, idx) => {
      this.playTone(f, 0.11, 'square', 'sfx', 0.14, undefined, idx * 0.065);
    });
  }

  public countdown(final = false): void {
    this.playTone(final ? 880 : 440, final ? 0.25 : 0.1, 'square', 'sfx', 0.18);
  }

  public thrusterPulse(): void {
    this.playNoise(0.14, 380, 0.2);
  }

  public stageSep(): void {
    this.playNoise(0.18, 900, 0.28);
    this.playTone(220, 0.16, 'sawtooth', 'sfx', 0.15, 95);
  }

  public timingHit(perfect: boolean): void {
    if (perfect) {
      this.playTone(660, 0.08, 'square', 'sfx', 0.16);
      this.playTone(990, 0.15, 'square', 'sfx', 0.16, undefined, 0.07);
    } else {
      this.playTone(440, 0.1, 'triangle', 'sfx', 0.14);
    }
  }

  public collect(): void {
    this.playTone(740, 0.06, 'square', 'sfx', 0.13);
    this.playTone(1108, 0.1, 'square', 'sfx', 0.13, undefined, 0.05);
  }

  public shield(): void {
    this.playTone(300, 0.18, 'sine', 'sfx', 0.2, 820);
    this.playTone(620, 0.14, 'triangle', 'sfx', 0.12, 950, 0.04);
  }

  public hit(): void {
    this.playNoise(0.22, 500, 0.32);
    this.playTone(140, 0.2, 'sawtooth', 'sfx', 0.22, 55);
  }

  public explode(): void {
    this.playNoise(0.65, 420, 0.45);
    this.playTone(110, 0.55, 'sawtooth', 'sfx', 0.28, 35);
  }

  public signalPulse(): void {
    this.playTone(880, 0.18, 'sine', 'sfx', 0.16, 440);
    this.playTone(660, 0.22, 'triangle', 'sfx', 0.14, 990, 0.15);
  }

  public alertBeep(): void {
    this.playTone(720, 0.09, 'square', 'sfx', 0.15);
    this.playTone(540, 0.12, 'square', 'sfx', 0.15, undefined, 0.11);
  }

  public victory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.playTone(f, i === 3 ? 0.38 : 0.12, 'square', 'sfx', 0.16, undefined, i * 0.11);
    });
  }

  public defeat(): void {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((f, i) => {
      this.playTone(f, i === 3 ? 0.42 : 0.14, 'sawtooth', 'sfx', 0.14, undefined, i * 0.14);
    });
  }

  public voiceBlip(speaker: CharacterId | null): void {
    const map: Record<CharacterId, { f: number; t: OscillatorType }> = {
      N: { f: 740, t: 'square' },
      R: { f: 340, t: 'triangle' },
      B: { f: 280, t: 'square' },
      V: { f: 210, t: 'sawtooth' },
      T: { f: 460, t: 'triangle' },
      O: { f: 390, t: 'sine' },
      S: { f: 240, t: 'sine' },
    };
    const cfg = speaker ? map[speaker] : { f: 520, t: 'triangle' as OscillatorType };
    const jitter = (Math.random() - 0.5) * 38;
    this.playTone(cfg.f + jitter, 0.036, cfg.t, 'sfx', 0.08);
  }

  // --- Chiptune BGM Sequencer ---
  public setMusicMood(mood: MusicMood): void {
    if (this.currentMood === mood && this.stepTimer !== null) return;
    this.currentMood = mood;
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.stepIndex = 0;
    if (mood === 'none') return;

    const tempoMs: Record<Exclude<MusicMood, 'none'>, number> = {
      title: 210,
      hangar: 230,
      cutscene: 300,
      launch: 145,
      finale: 190,
    };

    const tick = () => {
      if (this.bgmMuted || this.currentMood !== mood) return;
      this.playSequencerStep(mood, this.stepIndex++);
    };

    this.stepTimer = window.setInterval(tick, tempoMs[mood]);
  }

  private playSequencerStep(mood: Exclude<MusicMood, 'none'>, step: number): void {
    if (mood === 'title') {
      const lead = [392, 0, 493.88, 587.33, 783.99, 0, 587.33, 659.25, 523.25, 0, 659.25, 783.99, 659.25, 587.33, 493.88, 0];
      const bass = [130.81, 130.81, 196, 130.81, 146.83, 146.83, 220, 146.83];
      const n = lead[step % lead.length];
      const b = bass[step % bass.length];
      if (n > 0) this.playTone(n, 0.16, 'square', 'bgm', 0.12);
      if (step % 2 === 0) this.playTone(b, 0.24, 'triangle', 'bgm', 0.18);
    } else if (mood === 'hangar') {
      const arp = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23, 440, 587.33, 440, 349.23, 246.94, 293.66, 392, 493.88];
      const bass = [130.81, 0, 130.81, 0, 146.83, 0, 146.83, 0, 123.47, 0, 123.47, 0, 110, 0, 130.81, 0];
      const a = arp[step % arp.length];
      const b = bass[step % bass.length];
      this.playTone(a, 0.14, 'triangle', 'bgm', 0.11);
      if (b > 0) this.playTone(b, 0.22, 'square', 'bgm', 0.08);
    } else if (mood === 'cutscene') {
      const pad = [220, 0, 329.63, 0, 261.63, 0, 392, 0, 196, 0, 293.66, 0, 246.94, 0, 349.23, 0];
      const chime = [0, 0, 0, 659.25, 0, 0, 0, 783.99, 0, 0, 0, 587.33, 0, 0, 0, 880];
      const p = pad[step % pad.length];
      const c = chime[step % chime.length];
      if (p > 0) this.playTone(p, 0.45, 'sine', 'bgm', 0.15);
      if (c > 0) this.playTone(c, 0.25, 'triangle', 'bgm', 0.1);
    } else if (mood === 'launch') {
      const lead = [329.63, 329.63, 440, 493.88, 523.25, 493.88, 440, 392, 329.63, 392, 440, 523.25, 587.33, 523.25, 493.88, 392];
      const bass = [110, 220, 110, 220, 130.81, 261.63, 130.81, 261.63, 146.83, 293.66, 146.83, 293.66, 123.47, 246.94, 123.47, 246.94];
      this.playTone(lead[step % lead.length], 0.11, 'square', 'bgm', 0.12);
      this.playTone(bass[step % bass.length], 0.12, 'sawtooth', 'bgm', 0.09);
      if (step % 4 === 2) this.playNoise(0.05, 1800, 0.08, 'bgm');
    } else if (mood === 'finale') {
      const lead = [440, 523.25, 659.25, 880, 783.99, 659.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5, 0];
      const bass = [110, 0, 164.81, 0, 130.81, 0, 196, 0, 146.83, 0, 220, 0, 164.81, 0, 246.94, 0];
      const n = lead[step % lead.length];
      const b = bass[step % bass.length];
      if (n > 0) this.playTone(n, 0.17, 'square', 'bgm', 0.12);
      if (b > 0) this.playTone(b, 0.25, 'triangle', 'bgm', 0.16);
    }
  }
}

export const sound = new PixelSoundEngine();
