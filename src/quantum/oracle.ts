/**
 * Quantum Oracle Implementation for Deutsch-Jozsa
 * U_f |x, y> = |x, y XOR f(x)>
 */

import { Complex, C } from './complex';
import { StateVector } from './stateVector';

export type OracleKind = 'constant' | 'balanced';

export interface OracleDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly numInputQubits: number;
  readonly kind: OracleKind;
  /** Function evaluating f(x) where x is integer in [0, 2^n - 1] */
  readonly fn: (x: number, n: number) => 0 | 1;
  /** Truth table for display e.g. { "0": 0, "1": 0 } */
  readonly truthTable: Record<string, 0 | 1>;
  readonly formula?: string;
}

/**
 * Apply the reversible quantum oracle U_f to an (n+1)-qubit state vector
 * Input register: qubits 0 to n-1 (MSBs)
 * Target ancilla qubit: qubit n (LSB)
 */
export function applyQuantumOracle(
  state: StateVector,
  oracleFn: (x: number, n: number) => 0 | 1,
  numInputQubits: number
): StateVector {
  const totalQubits = state.numQubits;
  if (totalQubits !== numInputQubits + 1) {
    throw new Error(`Expected ${numInputQubits + 1} qubits, got ${totalQubits}`);
  }

  const newAmps = new Array<Complex>(state.dim).fill(C.zero);

  // In our basis indexing:
  // state index i has binary representation (x_bits, y_bit)
  // x = i >> 1
  // y = i & 1
  for (let i = 0; i < state.dim; i++) {
    const x = i >> 1;
    const y = i & 1;
    const fx = oracleFn(x, numInputQubits);
    const newY = y ^ fx; // y XOR f(x)
    const newIndex = (x << 1) | newY;

    newAmps[newIndex] = state.amplitudes[i];
  }

  return new StateVector(totalQubits, newAmps);
}

/**
 * Generates a truth table record from an oracle function
 */
export function generateTruthTable(
  numInputQubits: number,
  fn: (x: number, n: number) => 0 | 1
): Record<string, 0 | 1> {
  const table: Record<string, 0 | 1> = {};
  const count = 1 << numInputQubits;
  for (let x = 0; x < count; x++) {
    const bitStr = x.toString(2).padStart(numInputQubits, '0');
    table[bitStr] = fn(x, numInputQubits);
  }
  return table;
}

/**
 * Validates whether a truth table represents a constant or balanced function
 */
export function analyzeOracleKind(table: Record<string, 0 | 1>): OracleKind | 'invalid' {
  const entries = Object.values(table);
  const total = entries.length;
  const onesCount = entries.filter((v) => v === 1).length;

  if (onesCount === 0 || onesCount === total) return 'constant';
  if (onesCount === total / 2) return 'balanced';
  return 'invalid';
}

/**
 * Predefined test and level oracles
 */
export const PredefinedOracles: Record<string, OracleDefinition> = {
  // 1-Qubit Oracles (Deutsch Algorithm)
  '1q-const-0': {
    id: '1q-const-0',
    name: 'Zero Lock (f(x)=0)',
    description: 'Always outputs 0 regardless of probe state.',
    numInputQubits: 1,
    kind: 'constant',
    fn: () => 0,
    truthTable: { '0': 0, '1': 0 },
    formula: 'f(x) = 0'
  },
  '1q-const-1': {
    id: '1q-const-1',
    name: 'Active Core (f(x)=1)',
    description: 'Always outputs 1 regardless of probe state.',
    numInputQubits: 1,
    kind: 'constant',
    fn: () => 1,
    truthTable: { '0': 1, '1': 1 },
    formula: 'f(x) = 1'
  },
  '1q-bal-identity': {
    id: '1q-bal-identity',
    name: 'Mirror Barrier (f(x)=x)',
    description: 'Passes the input directly through: f(0)=0, f(1)=1.',
    numInputQubits: 1,
    kind: 'balanced',
    fn: (x) => (x === 1 ? 1 : 0),
    truthTable: { '0': 0, '1': 1 },
    formula: 'f(x) = x'
  },
  '1q-bal-not': {
    id: '1q-bal-not',
    name: 'Inversion Field (f(x)=NOT x)',
    description: 'Flips the input bit: f(0)=1, f(1)=0.',
    numInputQubits: 1,
    kind: 'balanced',
    fn: (x) => (x === 0 ? 1 : 0),
    truthTable: { '0': 1, '1': 0 },
    formula: 'f(x) = 1 - x'
  },

  // 2-Qubit Oracles (Deutsch-Jozsa)
  '2q-const-0': {
    id: '2q-const-0',
    name: 'Silent Vault (f(x)=0)',
    description: 'All 4 binary inputs (00, 01, 10, 11) yield 0.',
    numInputQubits: 2,
    kind: 'constant',
    fn: () => 0,
    truthTable: { '00': 0, '01': 0, '10': 0, '11': 0 },
    formula: 'f(x) = 0'
  },
  '2q-const-1': {
    id: '2q-const-1',
    name: 'Full Alert (f(x)=1)',
    description: 'All 4 binary inputs (00, 01, 10, 11) yield 1.',
    numInputQubits: 2,
    kind: 'constant',
    fn: () => 1,
    truthTable: { '00': 1, '01': 1, '10': 1, '11': 1 },
    formula: 'f(x) = 1'
  },
  '2q-bal-xor': {
    id: '2q-bal-xor',
    name: 'Parity Shifter (f(x)=x₀ ⊕ x₁)',
    description: 'Outputs 1 if bits differ, 0 if bits match.',
    numInputQubits: 2,
    kind: 'balanced',
    fn: (x) => (((x >> 1) ^ (x & 1)) ? 1 : 0),
    truthTable: { '00': 0, '01': 1, '10': 1, '11': 0 },
    formula: 'f(x) = x₀ ⊕ x₁'
  },
  '2q-bal-xnor': {
    id: '2q-bal-xnor',
    name: 'Coherence Resonator (f(x)=¬(x₀ ⊕ x₁))',
    description: 'Outputs 1 if bits match, 0 if bits differ.',
    numInputQubits: 2,
    kind: 'balanced',
    fn: (x) => (((x >> 1) ^ (x & 1)) ? 0 : 1),
    truthTable: { '00': 1, '01': 0, '10': 0, '11': 1 },
    formula: 'f(x) = ¬(x₀ ⊕ x₁)'
  },
  '2q-bal-bit0': {
    id: '2q-bal-bit0',
    name: 'Leading Selector (f(x)=x₀)',
    description: 'Outputs the first input bit directly.',
    numInputQubits: 2,
    kind: 'balanced',
    fn: (x) => ((x >> 1) & 1 ? 1 : 0),
    truthTable: { '00': 0, '01': 0, '10': 1, '11': 1 },
    formula: 'f(x) = x₀'
  },
  '2q-bal-bit1': {
    id: '2q-bal-bit1',
    name: 'Trailing Selector (f(x)=x₁)',
    description: 'Outputs the second input bit directly.',
    numInputQubits: 2,
    kind: 'balanced',
    fn: (x) => (x & 1 ? 1 : 0),
    truthTable: { '00': 0, '01': 1, '10': 0, '11': 1 },
    formula: 'f(x) = x₁'
  },

  // 3-Qubit Oracles
  '3q-const-0': {
    id: '3q-const-0',
    name: 'Hyper-Vault Null (f(x)=0)',
    description: 'All 8 inputs produce 0.',
    numInputQubits: 3,
    kind: 'constant',
    fn: () => 0,
    truthTable: {
      '000': 0, '001': 0, '010': 0, '011': 0,
      '100': 0, '101': 0, '110': 0, '111': 0
    },
    formula: 'f(x) = 0'
  },
  '3q-bal-parity3': {
    id: '3q-bal-parity3',
    name: 'Tri-Parity Core (f(x)=x₀ ⊕ x₁ ⊕ x₂)',
    description: 'Outputs 1 if an odd number of input bits are 1.',
    numInputQubits: 3,
    kind: 'balanced',
    fn: (x) => {
      const b0 = (x >> 2) & 1;
      const b1 = (x >> 1) & 1;
      const b2 = x & 1;
      return ((b0 ^ b1 ^ b2) & 1) as 0 | 1;
    },
    truthTable: {
      '000': 0, '001': 1, '010': 1, '011': 0,
      '100': 1, '101': 0, '110': 0, '111': 1
    },
    formula: 'f(x) = x₀ ⊕ x₁ ⊕ x₂'
  }
};
