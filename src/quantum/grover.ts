import { QuantumState, createUniformSuperposition } from './stateVector';
import { applyOracle } from './oracle';
import { applyDiffusion } from './diffusion';
import { performMeasurement, MeasurementResult } from './measurement';

export interface GroverStepRecord {
  iteration: number;
  amplitudes: { real: number; imag: number }[];
  probabilities: number[];
  targetProbability: number;
  nonTargetProbability: number; // probability of any individual non-target state
  meanAmplitudeReal: number;
  description: string;
}

export class GroverSimulator {
  readonly n: number;
  readonly targetIndex: number;
  state: QuantumState;
  iterations: number = 0;
  readonly history: GroverStepRecord[] = [];

  constructor(n: number, targetIndex: number) {
    if (n < 2) {
      throw new Error(`Dimension N must be at least 2, got ${n}`);
    }
    if (targetIndex < 0 || targetIndex >= n) {
      throw new Error(`Target index ${targetIndex} must be within [0, ${n - 1}]`);
    }

    this.n = n;
    this.targetIndex = targetIndex;
    this.state = createUniformSuperposition(n);

    // Record initial uniform superposition state (iteration 0)
    this.recordHistory('Initial uniform superposition (all echoes equally faint)');
  }

  /**
   * Calculates the exact theoretical optimal number of iterations:
   * R ≈ (π / 4) * √N (or exact arcsin formula)
   */
  static getOptimalIterations(n: number): number {
    const theta = Math.asin(1 / Math.sqrt(n));
    const exact = (Math.PI / (4 * theta)) - 0.5;
    return Math.max(1, Math.round(exact));
  }

  get optimalIterations(): number {
    return GroverSimulator.getOptimalIterations(this.n);
  }

  /**
   * Executes one full Grover iteration:
   * 1. Oracle (phase flip target)
   * 2. Diffusion (inversion about mean)
   */
  step(): GroverStepRecord {
    applyOracle(this.state, this.targetIndex);
    applyDiffusion(this.state);
    this.iterations++;

    const desc = this.generateStepDescription();
    return this.recordHistory(desc);
  }

  /**
   * Performs quantum measurement on the current state
   */
  measure(rng?: () => number): MeasurementResult {
    return performMeasurement(this.state, this.targetIndex, this.iterations, rng);
  }

  /**
   * Returns current probabilities
   */
  getProbabilities(): number[] {
    return this.state.getProbabilities();
  }

  /**
   * Returns current probability of the hidden target
   */
  getTargetProbability(): number {
    return this.state.getProbabilities()[this.targetIndex];
  }

  /**
   * Resets the simulator with new or same parameters
   */
  reset(n: number = this.n, targetIndex: number = this.targetIndex): void {
    (this as { n: number }).n = n;
    (this as { targetIndex: number }).targetIndex = targetIndex;
    this.state = createUniformSuperposition(n);
    this.iterations = 0;
    this.history.length = 0;
    this.recordHistory('Initial uniform superposition');
  }

  private recordHistory(description: string): GroverStepRecord {
    const probs = this.state.getProbabilities();
    const otherIndex = this.targetIndex === 0 ? 1 : 0;
    const nonTargetProb = probs[otherIndex] ?? 0;
    
    let sumReal = 0;
    for (let i = 0; i < this.n; i++) {
      sumReal += this.state.amplitudes[i].real;
    }
    const meanAmplitudeReal = sumReal / this.n;

    const record: GroverStepRecord = {
      iteration: this.iterations,
      amplitudes: this.state.amplitudes.map(a => ({ real: a.real, imag: a.imag })),
      probabilities: probs,
      targetProbability: probs[this.targetIndex],
      nonTargetProbability: nonTargetProb,
      meanAmplitudeReal,
      description,
    };

    this.history.push(record);
    return record;
  }

  private generateStepDescription(): string {
    const p = this.getTargetProbability();
    const opt = this.optimalIterations;

    if (this.iterations === opt) {
      return `Pulse ${this.iterations}: Peak resonance achieved (${(p * 100).toFixed(1)}% signal clarity)`;
    } else if (this.iterations < opt) {
      return `Pulse ${this.iterations}: Constructive interference building (${(p * 100).toFixed(1)}% signal clarity)`;
    } else {
      return `Pulse ${this.iterations}: Overshoot! Destructive interference dispersing signal (${(p * 100).toFixed(1)}% signal clarity)`;
    }
  }
}
