/**
 * Web Audio API procedural sound engine for atmospheric underwater audio.
 * Generates dynamic sonar pings, harmonic resonance, overshooting dissonance,
 * bubble streams, sub thrusters, and abyssal ambient drones.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.15;
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
   * Starts ambient ocean deep drone
   */
  public startAmbient() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.ambientGain) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Low abyssal drone 1
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      // Low abyssal drone 2 (slight detune for sub-bass beating)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(55.8, this.ctx.currentTime);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Plays submarine thruster cavitation sound
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
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays the CALL echo pulse.
   * Sound characteristics map to quantum probability of target:
   * - Lower probability: faint, diffuse, dull ping
   * - High probability (amplification peak): resonant, crystalline harmonic dual tone
   * - Overshot (past optimal): dissonant detuned warble
   */
  public playEchoPulse(targetProbability: number, isPeak: boolean, isOvershot: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Base frequency scales from 320Hz to 640Hz based on target probability
      const baseFreq = 320 + Math.min(1, targetProbability) * 320;

      // Primary tone
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.Q.value = isPeak ? 12 : (isOvershot ? 3 : 6);
      filter.frequency.setValueAtTime(baseFreq, now);

      if (isPeak) {
        // Pure resonant chord (Harmonic Fifth: base + 1.5*base)
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.02, now + 0.8);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 * 1.01, now + 0.8);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      } else if (isOvershot) {
        // Dissonant minor second / detune
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.linearRampToValueAtTime(baseFreq * 0.88, now + 0.7);
        osc2.frequency.setValueAtTime(baseFreq * 1.06, now); // tritone/minor 2nd clash

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      } else {
        // Standard constructive build
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc2.frequency.setValueAtTime(baseFreq * 2, now); // octave

        const volume = 0.12 + targetProbability * 0.15;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      }

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      const duration = isPeak ? 1.2 : 0.8;
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Fallback
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
        // Triumphant, celestial harmonic chime arpeggio
        const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major
        frequencies.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 1.7);
        });
      } else {
        // Hollow, dispersing failure tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.9);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Plays subtle bubble pop
   */
  public playBubble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 400 + Math.random() * 500;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEngine();
