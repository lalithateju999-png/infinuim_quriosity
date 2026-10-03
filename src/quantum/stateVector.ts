/**
 * N-Qubit Quantum State Vector Simulation
 */

import { Complex, C } from './complex';

export class StateVector {
  readonly numQubits: number;
  readonly dim: number;
  readonly amplitudes: Complex[];

  constructor(numQubits: number, amplitudes?: Complex[]) {
    this.numQubits = numQubits;
    this.dim = 1 << numQubits;
    if (amplitudes) {
      if (amplitudes.length !== this.dim) {
        throw new Error(`Expected ${this.dim} amplitudes for ${numQubits} qubits, got ${amplitudes.length}`);
      }
      this.amplitudes = amplitudes;
    } else {
      // Default to |00...0>
      this.amplitudes = new Array(this.dim).fill(C.zero);
      this.amplitudes[0] = C.one;
    }
  }

  static fromBasis(numQubits: number, basisIndex: number): StateVector {
    const sv = new StateVector(numQubits);
    const amps = new Array(sv.dim).fill(C.zero);
    amps[basisIndex] = C.one;
    return new StateVector(numQubits, amps);
  }

  static fromBitstring(bitstring: string): StateVector {
    const numQubits = bitstring.length;
    const index = parseInt(bitstring, 2);
    return StateVector.fromBasis(numQubits, index);
  }

  clone(): StateVector {
    return new StateVector(this.numQubits, [...this.amplitudes]);
  }

  getProbability(index: number): number {
    return C.absSq(this.amplitudes[index]);
  }

  getProbabilities(): number[] {
    return this.amplitudes.map((a) => C.absSq(a));
  }

  getPhases(): number[] {
    return this.amplitudes.map((a) => C.phaseDeg(a));
  }

  getPhaseRads(): number[] {
    return this.amplitudes.map((a) => C.phase(a));
  }

  normalize(): StateVector {
    const totalProb = this.amplitudes.reduce((sum, a) => sum + C.absSq(a), 0);
    if (totalProb < 1e-12) return this;
    const norm = Math.sqrt(totalProb);
    const newAmps = this.amplitudes.map((a) => C.scale(a, 1 / norm));
    return new StateVector(this.numQubits, newAmps);
  }

  tensor(other: StateVector): StateVector {
    const totalQubits = this.numQubits + other.numQubits;
    const newAmps: Complex[] = [];

    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < other.dim; j++) {
        newAmps.push(C.mul(this.amplitudes[i], other.amplitudes[j]));
      }
    }

    return new StateVector(totalQubits, newAmps);
  }

  innerProduct(other: StateVector): Complex {
    if (this.numQubits !== other.numQubits) {
      throw new Error("Mismatched qubit counts for inner product");
    }
    let res = C.zero;
    for (let i = 0; i < this.dim; i++) {
      res = C.add(res, C.mul(C.conj(this.amplitudes[i]), other.amplitudes[i]));
    }
    return res;
  }

  /**
   * Return formatted basis decomposition
   * e.g. "0.707|00> - 0.707|11>"
   */
  toDiracNotation(labels?: string[]): string {
    const terms: string[] = [];
    for (let i = 0; i < this.dim; i++) {
      const amp = this.amplitudes[i];
      if (C.absSq(amp) < 1e-6) continue;

      const bitStr = labels ? labels[i] : i.toString(2).padStart(this.numQubits, '0');
      const formattedAmp = C.format(amp, 3);
      terms.push(`${formattedAmp}|${bitStr}⟩`);
    }
    return terms.length > 0 ? terms.join(' + ') : '0';
  }
}
