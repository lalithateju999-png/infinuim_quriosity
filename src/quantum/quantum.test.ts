import { describe, it, expect } from 'vitest';
import { C } from './complex';
import { StateVector } from './stateVector';
import { Gates, applySingleQubitGate } from './gates';
import { PredefinedOracles, applyQuantumOracle, analyzeOracleKind } from './oracle';
import { runDeutschJozsaSimulation } from './deutschJozsa';

describe('Complex Arithmetic', () => {
  it('adds and multiplies complex numbers correctly', () => {
    const a = C.new(1, 2);
    const b = C.new(3, -4);
    const sum = C.add(a, b);
    expect(sum.re).toBe(4);
    expect(sum.im).toBe(-2);

    const prod = C.mul(a, b);
    // (1+2i)(3-4i) = 3 - 4i + 6i - 8i^2 = 11 + 2i
    expect(prod.re).toBe(11);
    expect(prod.im).toBe(2);
  });

  it('calculates phase and absSq correctly', () => {
    const pos = C.new(1, 0);
    const neg = C.new(-1, 0);
    expect(C.phaseDeg(pos)).toBe(0);
    expect(C.phaseDeg(neg)).toBe(180);
    expect(C.absSq(C.new(0.6, 0.8))).toBeCloseTo(1.0, 5);
  });
});

describe('Single Qubit Gates & Superposition', () => {
  it('Hadamard creates equal superposition from |0>', () => {
    const q0 = StateVector.fromBasis(1, 0); // |0>
    const plus = applySingleQubitGate(q0, 0, Gates.H); // |+> = 1/√2 |0> + 1/√2 |1>
    expect(plus.amplitudes[0].re).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(plus.amplitudes[1].re).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(plus.getProbability(0)).toBeCloseTo(0.5, 5);
    expect(plus.getProbability(1)).toBeCloseTo(0.5, 5);
  });

  it('Hadamard on |1> creates |-> with 180° phase flip on |1>', () => {
    const q1 = StateVector.fromBasis(1, 1); // |1>
    const minus = applySingleQubitGate(q1, 0, Gates.H); // |-> = 1/√2 |0> - 1/√2 |1>
    expect(minus.amplitudes[0].re).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(minus.amplitudes[1].re).toBeCloseTo(-1 / Math.SQRT2, 5);
    expect(C.phaseDeg(minus.amplitudes[0])).toBe(0);
    expect(C.phaseDeg(minus.amplitudes[1])).toBe(180);
  });

  it('Hadamard is self-inverse: H(H|0>) = |0> and H(H|1>) = |1>', () => {
    const q0 = StateVector.fromBasis(1, 0);
    const res0 = applySingleQubitGate(applySingleQubitGate(q0, 0, Gates.H), 0, Gates.H);
    expect(res0.getProbability(0)).toBeCloseTo(1.0, 5);
    expect(res0.getProbability(1)).toBeCloseTo(0.0, 5);

    const q1 = StateVector.fromBasis(1, 1);
    const res1 = applySingleQubitGate(applySingleQubitGate(q1, 0, Gates.H), 0, Gates.H);
    expect(res1.getProbability(0)).toBeCloseTo(0.0, 5);
    expect(res1.getProbability(1)).toBeCloseTo(1.0, 5);
  });
});

describe('Phase Kickback Mechanism', () => {
  it('Phase kickback flips phase by 180° when target is in |-> and f(x)=1', () => {
    // 2-qubit state: input |1> (x=1), target |-> = 1/√2 |0> - 1/√2 |1>
    // State is |1> ⊗ |-> = 1/√2 |10> - 1/√2 |11>
    const inputQubit = StateVector.fromBasis(1, 1); // |1>
    const targetQubit = applySingleQubitGate(StateVector.fromBasis(1, 1), 0, Gates.H); // |->
    const jointState = inputQubit.tensor(targetQubit);

    // Oracle f(x) = 1 (constant 1)
    const oracleConst1 = PredefinedOracles['1q-const-1'];
    const afterOracle = applyQuantumOracle(jointState, oracleConst1.fn, 1);

    // Original jointState: amps = [0, 0, +1/√2, -1/√2]
    // After oracle with f(1)=1: |1,0> -> |1,1> and |1,1> -> |1,0>
    // Result amps: [0, 0, -1/√2, +1/√2] = -1 * (|1> ⊗ |->)
    expect(afterOracle.amplitudes[2].re).toBeCloseTo(-1 / Math.SQRT2, 5);
    expect(afterOracle.amplitudes[3].re).toBeCloseTo(1 / Math.SQRT2, 5);
  });
});

describe('Deutsch-Jozsa Algorithm Rigorous Verification', () => {
  it('classifies all 1-qubit Constant and Balanced oracles accurately in 1 shot', () => {
    for (const oracleId of ['1q-const-0', '1q-const-1', '1q-bal-identity', '1q-bal-not']) {
      const oracle = PredefinedOracles[oracleId];
      const result = runDeutschJozsaSimulation(oracle);

      if (oracle.kind === 'constant') {
        expect(result.finalMeasurement.isAllZeros).toBe(true);
        expect(result.finalMeasurement.probabilities['0']).toBeCloseTo(1.0, 5);
        expect(result.finalMeasurement.probabilities['1']).toBeCloseTo(0.0, 5);
        expect(result.finalMeasurement.predictedKind).toBe('constant');
      } else {
        expect(result.finalMeasurement.isAllZeros).toBe(false);
        expect(result.finalMeasurement.probabilities['0']).toBeCloseTo(0.0, 5);
        expect(result.finalMeasurement.probabilities['1']).toBeCloseTo(1.0, 5);
        expect(result.finalMeasurement.predictedKind).toBe('balanced');
      }
      expect(result.finalMeasurement.isCorrect).toBe(true);
    }
  });

  it('classifies all 2-qubit Constant and Balanced oracles accurately in 1 shot', () => {
    const twoQubitOracles = [
      '2q-const-0',
      '2q-const-1',
      '2q-bal-xor',
      '2q-bal-xnor',
      '2q-bal-bit0',
      '2q-bal-bit1'
    ];

    for (const oracleId of twoQubitOracles) {
      const oracle = PredefinedOracles[oracleId];
      const result = runDeutschJozsaSimulation(oracle);

      if (oracle.kind === 'constant') {
        expect(result.finalMeasurement.isAllZeros).toBe(true);
        expect(result.finalMeasurement.probabilities['00']).toBeCloseTo(1.0, 5);
        expect(result.finalMeasurement.predictedKind).toBe('constant');
      } else {
        expect(result.finalMeasurement.isAllZeros).toBe(false);
        expect(result.finalMeasurement.probabilities['00']).toBeCloseTo(0.0, 5);
        expect(result.finalMeasurement.predictedKind).toBe('balanced');
      }
      expect(result.finalMeasurement.isCorrect).toBe(true);
    }
  });

  it('classifies 3-qubit Oracles accurately in 1 shot', () => {
    const threeQubitOracles = ['3q-const-0', '3q-bal-parity3'];

    for (const oracleId of threeQubitOracles) {
      const oracle = PredefinedOracles[oracleId];
      const result = runDeutschJozsaSimulation(oracle);

      if (oracle.kind === 'constant') {
        expect(result.finalMeasurement.isAllZeros).toBe(true);
        expect(result.finalMeasurement.probabilities['000']).toBeCloseTo(1.0, 5);
      } else {
        expect(result.finalMeasurement.isAllZeros).toBe(false);
        expect(result.finalMeasurement.probabilities['000']).toBeCloseTo(0.0, 5);
      }
      expect(result.finalMeasurement.isCorrect).toBe(true);
    }
  });
});
