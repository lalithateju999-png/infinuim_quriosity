import { describe, it, expect } from 'vitest';
import { C } from './complex';
import { StateVector } from './stateVector';
import { Gates, applySingleQubitGate } from './gates';
import { PredefinedOracles, applyQuantumOracle, analyzeOracleKind, OracleDefinition } from './oracle';
import { runDeutschJozsaSimulation } from './deutschJozsa';

describe('Complex Arithmetic', () => {
  it('adds and multiplies complex numbers correctly', () => {
    const a = C.new(1, 2);
    const b = C.new(3, -4);
    const sum = C.add(a, b);
    expect(sum.re).toBe(4);
    expect(sum.im).toBe(-2);

    const prod = C.mul(a, b);
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
    const inputQubit = StateVector.fromBasis(1, 1); // |1>
    const targetQubit = applySingleQubitGate(StateVector.fromBasis(1, 1), 0, Gates.H); // |->
    const jointState = inputQubit.tensor(targetQubit);

    const oracleConst1 = PredefinedOracles['1q-const-1'];
    const afterOracle = applyQuantumOracle(jointState, oracleConst1.fn, 1);

    expect(afterOracle.amplitudes[2].re).toBeCloseTo(-1 / Math.SQRT2, 5);
    expect(afterOracle.amplitudes[3].re).toBeCloseTo(1 / Math.SQRT2, 5);
  });
});

describe('Deutsch-Jozsa Exhaustive & Randomized Mathematical Proof', () => {
  it('exhaustively validates ALL 1-qubit boolean functions (2 constant, 2 balanced)', () => {
    // 1-qubit functions have 2^2 = 4 combinations: [0,0], [1,1], [0,1], [1,0]
    const combinations: [number, number][] = [
      [0, 0], [1, 1], [0, 1], [1, 0]
    ];

    for (const [f0, f1] of combinations) {
      const isConst = f0 === f1;
      const oracle: OracleDefinition = {
        id: `test-1q-${f0}-${f1}`,
        name: `f(${f0},${f1})`,
        description: 'Test oracle',
        numInputQubits: 1,
        kind: isConst ? 'constant' : 'balanced',
        fn: (x: number) => (x === 0 ? f0 : f1) as 0 | 1,
        truthTable: { '0': f0 as 0 | 1, '1': f1 as 0 | 1 }
      };

      const res = runDeutschJozsaSimulation(oracle);
      if (isConst) {
        expect(res.finalMeasurement.probabilities['0']).toBeCloseTo(1.0, 5);
        expect(res.finalMeasurement.probabilities['1']).toBeCloseTo(0.0, 5);
        expect(res.finalMeasurement.predictedKind).toBe('constant');
      } else {
        expect(res.finalMeasurement.probabilities['0']).toBeCloseTo(0.0, 5);
        expect(res.finalMeasurement.probabilities['1']).toBeCloseTo(1.0, 5);
        expect(res.finalMeasurement.predictedKind).toBe('balanced');
      }
    }
  });

  it('exhaustively validates ALL 16 possible 2-qubit boolean functions for constant and balanced cases', () => {
    // 2-qubit has 4 inputs: 00, 01, 10, 11 -> 2^4 = 16 functions
    for (let mask = 0; mask < 16; mask++) {
      const table: Record<string, 0 | 1> = {
        '00': ((mask >> 3) & 1) as 0 | 1,
        '01': ((mask >> 2) & 1) as 0 | 1,
        '10': ((mask >> 1) & 1) as 0 | 1,
        '11': (mask & 1) as 0 | 1,
      };

      const kind = analyzeOracleKind(table);
      if (kind === 'invalid') continue; // only test promised constant or balanced functions

      const oracle: OracleDefinition = {
        id: `test-2q-${mask}`,
        name: `2Q Oracle ${mask}`,
        description: 'Exhaustive test',
        numInputQubits: 2,
        kind,
        fn: (x: number) => {
          const bitStr = x.toString(2).padStart(2, '0');
          return table[bitStr];
        },
        truthTable: table
      };

      const res = runDeutschJozsaSimulation(oracle);

      if (kind === 'constant') {
        expect(res.finalMeasurement.probabilities['00']).toBeCloseTo(1.0, 5);
        expect(res.finalMeasurement.isAllZeros).toBe(true);
        expect(res.finalMeasurement.predictedKind).toBe('constant');
      } else {
        // Balanced: MUST strictly have P(00) = 0
        expect(res.finalMeasurement.probabilities['00']).toBeCloseTo(0.0, 5);
        expect(res.finalMeasurement.isAllZeros).toBe(false);
        expect(res.finalMeasurement.predictedKind).toBe('balanced');
      }
    }
  });

  it('validates multiple 3-qubit Constant and Balanced permutations (8 inputs)', () => {
    // Constant 0 and Constant 1
    for (const constVal of [0, 1]) {
      const oracle: OracleDefinition = {
        id: `test-3q-const-${constVal}`,
        name: `3Q Constant ${constVal}`,
        description: '3Q Constant',
        numInputQubits: 3,
        kind: 'constant',
        fn: () => constVal as 0 | 1,
        truthTable: Object.fromEntries(
          Array.from({ length: 8 }, (_, i) => [i.toString(2).padStart(3, '0'), constVal as 0 | 1])
        )
      };
      const res = runDeutschJozsaSimulation(oracle);
      expect(res.finalMeasurement.probabilities['000']).toBeCloseTo(1.0, 5);
      expect(res.finalMeasurement.predictedKind).toBe('constant');
    }

    // Balanced: 10 different random balanced permutations (4 zeros, 4 ones)
    for (let testRound = 0; testRound < 10; testRound++) {
      const arr: (0 | 1)[] = [0, 0, 0, 0, 1, 1, 1, 1];
      // shuffle
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      const table: Record<string, 0 | 1> = {};
      for (let i = 0; i < 8; i++) {
        table[i.toString(2).padStart(3, '0')] = arr[i];
      }

      const oracle: OracleDefinition = {
        id: `test-3q-bal-rand-${testRound}`,
        name: `3Q Balanced Random ${testRound}`,
        description: 'Random 3Q Balanced',
        numInputQubits: 3,
        kind: 'balanced',
        fn: (x: number) => {
          const bitStr = x.toString(2).padStart(3, '0');
          return table[bitStr];
        },
        truthTable: table
      };

      const res = runDeutschJozsaSimulation(oracle);
      // Probability of |000> MUST BE ZERO
      expect(res.finalMeasurement.probabilities['000']).toBeCloseTo(0.0, 5);
      expect(res.finalMeasurement.isAllZeros).toBe(false);
      expect(res.finalMeasurement.predictedKind).toBe('balanced');
    }
  });
});
