/**
 * Quantum Gates & Matrix Operations
 */

import { Complex, C } from './complex';
import { StateVector } from './stateVector';

export type Matrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

const INV_SQRT2 = 1 / Math.SQRT2;

export const Gates = {
  I: [
    [C.one, C.zero],
    [C.zero, C.one]
  ] as Matrix2x2,

  X: [
    [C.zero, C.one],
    [C.one, C.zero]
  ] as Matrix2x2,

  Z: [
    [C.one, C.zero],
    [C.zero, C.negOne]
  ] as Matrix2x2,

  Y: [
    [C.zero, C.negI],
    [C.i, C.zero]
  ] as Matrix2x2,

  H: [
    [C.new(INV_SQRT2, 0), C.new(INV_SQRT2, 0)],
    [C.new(INV_SQRT2, 0), C.new(-INV_SQRT2, 0)]
  ] as Matrix2x2,
};

/**
 * Apply a single-qubit gate to target qubit index in an n-qubit StateVector
 * Target qubit 0 is the most significant bit (leftmost bit in bitstring)
 */
export function applySingleQubitGate(
  state: StateVector,
  targetQubit: number,
  gate: Matrix2x2
): StateVector {
  const n = state.numQubits;
  if (targetQubit < 0 || targetQubit >= n) {
    throw new Error(`Target qubit ${targetQubit} out of range for ${n}-qubit state`);
  }

  const newAmps = new Array<Complex>(state.dim).fill(C.zero);
  const shift = n - 1 - targetQubit;
  const bitMask = 1 << shift;

  for (let i = 0; i < state.dim; i++) {
    // If the target bit is 0, process the pair (i, i | bitMask)
    if ((i & bitMask) === 0) {
      const i0 = i;
      const i1 = i | bitMask;

      const a0 = state.amplitudes[i0];
      const a1 = state.amplitudes[i1];

      // [u00*a0 + u01*a1]
      // [u10*a0 + u11*a1]
      newAmps[i0] = C.add(C.mul(gate[0][0], a0), C.mul(gate[0][1], a1));
      newAmps[i1] = C.add(C.mul(gate[1][0], a0), C.mul(gate[1][1], a1));
    }
  }

  return new StateVector(n, newAmps);
}

/**
 * Apply Hadamard to all specified qubits (e.g. input register)
 */
export function applyHadamardRegister(
  state: StateVector,
  qubitIndices: number[]
): StateVector {
  let current = state;
  for (const q of qubitIndices) {
    current = applySingleQubitGate(current, q, Gates.H);
  }
  return current;
}
