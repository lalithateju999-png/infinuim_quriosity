/**
 * Atmospheric Underwater Web Audio Engine
 * Generates dynamic sonar pings, delayed companion bio-acoustic responses,
 * water movement, distant creature vocalizations, cave echoes, and hydrostatic drones.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private creatureTimer: number | null = null;

  constructor() {
    // Context is initialized on first user interaction to satisfy browser autoplay policy
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.14;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Starts atmospheric dark ocean ambience:
   * Hydrostatic sub-bass drone, gentle water movement, and periodic distant creature calls.
   */
  public startAmbient() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.ambientGain) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.14, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      // Sub-bass drone 1
      const droneOsc1 = this.ctx.createOscillator();
      droneOsc1.type = 'sine';
      droneOsc1.frequency.setValueAtTime(48, this.ctx.currentTime);

      // Sub-bass drone 2 with slow detune beating
      const droneOsc2 = this.ctx.createOscillator();
      droneOsc2.type = 'triangle';
      droneOsc2.frequency.setValueAtTime(48.6, this.ctx.currentTime);

      droneOsc1.connect(filter);
      droneOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      droneOsc1.start();
      droneOsc2.start();

      // Periodic distant creature calls / cave echo ambience
      this.scheduleDistantCreatureCall();
    } catch {
      // AudioContext policy fallback
    }
  }

  private scheduleDistantCreatureCall() {
    if (this.creatureTimer) clearTimeout(this.creatureTimer);
    const nextCallInMs = 9000 + Math.random() * 12000;
    this.creatureTimer = window.setTimeout(() => {
      this.playDistantLeviathanCall();
      this.scheduleDistantCreatureCall();
    }, nextCallInMs);
  }

  /**
   * Plays a faint, deep, haunting leviathan song in the far distance
   */
  public playDistantLeviathanCall() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(160, now);
      filter.Q.setValueAtTime(4, now);

      osc.type = 'sine';
      const startFreq = 110 + Math.random() * 40;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, now + 1.8);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.85, now + 4.0);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 4.3);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays submarine movement thruster cavitation
   */
  public playThruster() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays the primary CALL sonar ping.
   * Modulated strictly by REAL quantum target probability:
   * - Low probability: dull, muffled ping
   * - Higher probability: brighter, resonant harmonic ping
   * - Optimal Peak: crystal-clear, harmonic fifth resonance
   * - Overshot: dissonant detuned warble
   */
  public playEchoPulse(targetProbability: number, isPeak: boolean, isOvershot: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const clampedProb = Math.max(0.05, Math.min(1.0, targetProbability));
      const baseFreq = 280 + clampedProb * 340;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.Q.value = isPeak ? 10 : isOvershot ? 3 : 5 + clampedProb * 4;
      filter.frequency.setValueAtTime(baseFreq, now);

      if (isPeak) {
        // Pure harmonic fifth chord
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.02, now + 1.0);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 * 1.01, now + 1.0);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      } else if (isOvershot) {
        // Detuned minor second warble
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.linearRampToValueAtTime(baseFreq * 0.85, now + 0.8);
        osc2.frequency.setValueAtTime(baseFreq * 1.06, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      } else {
        // Constructive interference building
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc2.frequency.setValueAtTime(baseFreq * 1.33, now);

        const volume = 0.08 + clampedProb * 0.16;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      }

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      const duration = isPeak ? 1.4 : 0.9;
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays the delayed companion bio-acoustic return blink chirp (approx 2-3s after CALL).
   * Clarity and strength are derived from target probability.
   */
  public playCompanionBlink(targetProbability: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const prob = Math.max(0.1, Math.min(1.0, targetProbability));

      // Dual harmonic chime (fundamental + overtone)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(580 + prob * 420, now);
      filter.Q.setValueAtTime(5 + prob * 4, now);

      const f1 = 520 + prob * 360;
      const f2 = f1 * 1.5; // Harmonic Fifth

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc1.frequency.exponentialRampToValueAtTime(f1 * 1.15, now + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(f1 * 1.4, now + 0.8);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(f2, now);
      osc2.frequency.exponentialRampToValueAtTime(f2 * 1.08, now + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(f2 * 1.35, now + 0.8);

      const maxVol = 0.12 + prob * 0.26;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(maxVol, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.15);
      osc2.stop(now + 1.15);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays the LISTEN / MEASUREMENT collapse sound.
   */
  public playMeasurementCollapse(isSuccess: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      if (isSuccess) {
        // Majestic harmonic chime arpeggio
        const frequencies = [440, 554.37, 659.25, 880, 1108.73]; // A Major
        frequencies.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.9);
        });
      } else {
        // Hollow acoustic dispersion
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.85);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEngine();
