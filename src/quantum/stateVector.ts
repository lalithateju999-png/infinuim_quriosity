import { Complex, complex, magnitudeSquared } from './complex';

/**
 * Represents an N-dimensional pure quantum state vector |ψ⟩ = Σ α_i |i⟩
 */
export class QuantumState {
  readonly n: number;
  amplitudes: Complex[];

  constructor(n: number, amplitudes?: Complex[]) {
    if (n <= 0) {
      throw new Error(`Dimension N must be greater than 0, got ${n}`);
    }
    this.n = n;
    if (amplitudes) {
      if (amplitudes.length !== n) {
        throw new Error(`Amplitudes length (${amplitudes.length}) must match dimension N (${n})`);
      }
      this.amplitudes = amplitudes.map(c => ({ ...c }));
    } else {
      // Default to uniform superposition |s⟩ = (1/√N) Σ |i⟩
      const invSqrtN = 1 / Math.sqrt(n);
      this.amplitudes = Array.from({ length: n }, () => complex(invSqrtN, 0));
    }
  }

  /**
   * Calculates probabilities P(i) = |α_i|^2
   */
  getProbabilities(): number[] {
    return this.amplitudes.map(a => magnitudeSquared(a));
  }

  /**
   * Total probability check (should be ≈ 1.0)
   */
  totalProbability(): number {
    return this.getProbabilities().reduce((acc, p) => acc + p, 0);
  }

  /**
   * Verifies state normalization within epsilon
   */
  isNormalized(tolerance: number = 1e-6): boolean {
    return Math.abs(this.totalProbability() - 1.0) <= tolerance;
  }

  /**
   * Normalize state vector if slight numerical drift occurs
   */
  normalize(): void {
    const norm = Math.sqrt(this.totalProbability());
    if (norm > 0) {
      this.amplitudes = this.amplitudes.map(a => complex(a.real / norm, a.imag / norm));
    }
  }

  /**
   * Clone the state vector
   */
  clone(): QuantumState {
    return new QuantumState(this.n, this.amplitudes);
  }
}

/**
 * Creates uniform superposition |s⟩ = 1/√N Σ |i⟩
 */
export function createUniformSuperposition(n: number): QuantumState {
  return new QuantumState(n);
}
