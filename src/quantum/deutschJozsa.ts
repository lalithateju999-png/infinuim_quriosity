/**
 * Deutsch-Jozsa Quantum Algorithm Engine & Step-by-Step Simulation
 */

import { C } from './complex';
import { StateVector } from './stateVector';
import { Gates, applySingleQubitGate, applyHadamardRegister } from './gates';
import { OracleDefinition, applyQuantumOracle } from './oracle';

export type AlgorithmStage = 
  | 'INIT'           // Input: |0...0>, Ancilla: |1>
  | 'SUPERPOSITION'  // Apply H on inputs (-> |+...>) and H on ancilla (-> |->)
  | 'ORACLE'         // Apply U_f once -> Phase Kickback (-1)^f(x)
  | 'INTERFERENCE'   // Apply H on inputs -> Wave Interference
  | 'MEASUREMENT';   // Measure input register -> All-zeros = Constant, Non-zero = Balanced

export interface BasisStateDetail {
  readonly bitstring: string;
  readonly inputBits: string;
  readonly ancillaBit: string;
  readonly realAmp: number;
  readonly imagAmp: number;
  readonly probability: number;
  readonly phaseDeg: number;
  readonly phaseSign: 1 | -1 | 0; // for real phases: +1 (0°), -1 (180°)
  readonly fx?: 0 | 1;
}

export interface StageSnapshot {
  readonly stage: AlgorithmStage;
  readonly stageIndex: number;
  readonly title: string;
  readonly description: string;
  readonly stateVector: StateVector;
  readonly inputRegisterAmplitudes: {
    inputBits: string;
    realAmp: number;
    phaseSign: 1 | -1 | 0;
    phaseDeg: number;
    probability: number;
    fx?: 0 | 1;
  }[];
  readonly ancillaStateName: '|0⟩' | '|1⟩' | '|+⟩' | '|−⟩' | 'other';
  readonly basisDetails: BasisStateDetail[];
  readonly explanation: string;
  readonly keyConcept: string;
}

export interface DeutschJozsaExecution {
  readonly oracle: OracleDefinition;
  readonly numInputQubits: number;
  readonly snapshots: StageSnapshot[];
  readonly finalMeasurement: {
    readonly measuredBitstring: string;
    readonly isAllZeros: boolean;
    readonly predictedKind: 'constant' | 'balanced';
    readonly isCorrect: boolean;
    readonly probabilities: Record<string, number>;
  };
  readonly classicalRequiredQueries: {
    readonly worstCase: number;
    readonly bestCase: number;
    readonly average: number;
  };
}

/**
 * Executes the full Deutsch-Jozsa algorithm deterministically and returns detailed snapshots at each step
 */
export function runDeutschJozsaSimulation(
  oracle: OracleDefinition,
  customInitialAncilla: '0' | '1' = '1' // allows demonstrating why ancilla must be |1> for phase kickback
): DeutschJozsaExecution {
  const n = oracle.numInputQubits;
  const totalQubits = n + 1;
  const ancillaQubitIndex = n;
  const inputQubits = Array.from({ length: n }, (_, i) => i);

  const snapshots: StageSnapshot[] = [];

  // ==========================================
  // STAGE 0: INITIALIZATION
  // |0...0> for inputs, |1> for target ancilla
  // ==========================================
  const initialBitstring = '0'.repeat(n) + customInitialAncilla;
  let state = StateVector.fromBitstring(initialBitstring);

  snapshots.push(
    createSnapshot(
      'INIT',
      0,
      '1. Prepare Registers',
      `Input register set to |${'0'.repeat(n)}⟩. Ancilla target qubit set to |${customInitialAncilla}⟩.`,
      state,
      n,
      customInitialAncilla === '1' ? '|1⟩' : '|0⟩',
      'Classical bit registers initialized. The probe starts at ground state.',
      'Ground State Initialization',
      oracle
    )
  );

  // ==========================================
  // STAGE 1: SUPERPOSITION
  // H on inputs -> |+>^n, H on ancilla -> |->
  // ==========================================
  state = applyHadamardRegister(state, inputQubits);
  state = applySingleQubitGate(state, ancillaQubitIndex, Gates.H);

  const ancillaName = customInitialAncilla === '1' ? '|−⟩' : '|+⟩';
  snapshots.push(
    createSnapshot(
      'SUPERPOSITION',
      1,
      '2. Create Superposition',
      `Hadamard gates put all input paths into equal superposition |+⟩^${n}, and target qubit into ${ancillaName}.`,
      state,
      n,
      ancillaName,
      'The quantum probe now exists across all 2ⁿ input states simultaneously in equal positive phase.',
      'Hadamard Superposition (H|0⟩ = |+⟩, H|1⟩ = |−⟩)',
      oracle
    )
  );

  // ==========================================
  // STAGE 2: ORACLE APPLICATION & PHASE KICKBACK
  // U_f |x, y> = |x, y XOR f(x)>
  // When y = |-> = (|0> - |1>)/√2:
  // U_f(|x>|->) = (-1)^f(x) |x>|->
  // ==========================================
  state = applyQuantumOracle(state, oracle.fn, n);

  snapshots.push(
    createSnapshot(
      'ORACLE',
      2,
      '3. Oracle Query & Phase Kickback',
      `The Oracle evaluates f(x) exactly ONCE. Because the target is in |−⟩, bit-flips are converted into PHASE flips (-1)^f(x) in the input register!`,
      state,
      n,
      '|−⟩',
      oracle.kind === 'constant'
        ? `Constant Oracle: All input states received the SAME phase shift (${oracle.fn(0, n) === 1 ? 'all flipped -1' : 'all stayed +1'}).`
        : `Balanced Oracle: Exactly half of the input states flipped to negative phase (-1), and half remained positive (+1).`,
      'Phase Kickback: U_f(|x⟩|−⟩) = (-1)^f(x) |x⟩|−⟩',
      oracle
    )
  );

  // ==========================================
  // STAGE 3: INTERFERENCE
  // Final Hadamard H^n applied to input register
  // Converts phase differences into constructive / destructive interference
  // ==========================================
  state = applyHadamardRegister(state, inputQubits);

  snapshots.push(
    createSnapshot(
      'INTERFERENCE',
      3,
      '4. Wave Interference',
      `Final Hadamard transformation recombines input waves. In-phase components reinforce; opposite-phase components cancel out completely!`,
      state,
      n,
      '|−⟩',
      oracle.kind === 'constant'
        ? `Constructive interference on |${'0'.repeat(n)}⟩ (100% probability). Destructive interference cancels all other states.`
        : `Complete destructive interference on |${'0'.repeat(n)}⟩ (0% probability). Constructive interference lands on non-zero states!`,
      'Interference: H converts phase differences into detectable basis states',
      oracle
    )
  );

  // ==========================================
  // STAGE 4: MEASUREMENT
  // ==========================================
  // Extract probabilities of the input register
  const inputProbabilities: Record<string, number> = {};
  const numInputStates = 1 << n;

  for (let x = 0; x < numInputStates; x++) {
    const bitStr = x.toString(2).padStart(n, '0');
    // Sum probabilities over ancilla bit y in {0, 1}
    const idx0 = (x << 1) | 0;
    const idx1 = (x << 1) | 1;
    const prob = state.getProbability(idx0) + state.getProbability(idx1);
    inputProbabilities[bitStr] = Math.round(prob * 10000) / 10000;
  }

  // Deterministic highest probability outcome or sampled
  let maxProb = -1;
  let measuredBitstring = '0'.repeat(n);
  for (const [bitStr, prob] of Object.entries(inputProbabilities)) {
    if (prob > maxProb) {
      maxProb = prob;
      measuredBitstring = bitStr;
    }
  }

  const isAllZeros = measuredBitstring === '0'.repeat(n);
  const predictedKind = isAllZeros ? 'constant' : 'balanced';
  const isCorrect = predictedKind === oracle.kind;

  snapshots.push(
    createSnapshot(
      'MEASUREMENT',
      4,
      '5. Final Measurement',
      `Input register measured: |${measuredBitstring}⟩. Result: ${isAllZeros ? 'ALL ZEROS (CONSTANT)' : 'NON-ZERO (BALANCED)'}.`,
      state,
      n,
      '|−⟩',
      isAllZeros
        ? `Measured |${'0'.repeat(n)}⟩ with 100% certainty → Function is CONSTANT!`
        : `Measured non-zero state |${measuredBitstring}⟩ → Function is BALANCED!`,
      'Measurement Theorem: |00...0⟩ ⟺ Constant, Any |x≠0⟩ ⟺ Balanced',
      oracle
    )
  );

  // Classical query calculations:
  // For n inputs, total inputs = 2^n.
  // To be 100% sure deterministically:
  // Worst case: 2^(n-1) + 1 queries
  // Best case: 2 queries (if first 2 differ)
  const totalInputs = 1 << n;
  const worstCase = (totalInputs >> 1) + 1;

  return {
    oracle,
    numInputQubits: n,
    snapshots,
    finalMeasurement: {
      measuredBitstring,
      isAllZeros,
      predictedKind,
      isCorrect,
      probabilities: inputProbabilities
    },
    classicalRequiredQueries: {
      worstCase,
      bestCase: 2,
      average: Number((((totalInputs >> 1) + 1 + 2) / 2).toFixed(1))
    }
  };
}

function createSnapshot(
  stage: AlgorithmStage,
  stageIndex: number,
  title: string,
  description: string,
  state: StateVector,
  numInputQubits: number,
  ancillaName: '|0⟩' | '|1⟩' | '|+⟩' | '|−⟩' | 'other',
  explanation: string,
  keyConcept: string,
  oracle: OracleDefinition
): StageSnapshot {
  const basisDetails: BasisStateDetail[] = [];
  const numInputStates = 1 << numInputQubits;

  for (let i = 0; i < state.dim; i++) {
    const x = i >> 1;
    const y = i & 1;
    const bitstring = i.toString(2).padStart(numInputQubits + 1, '0');
    const inputBits = x.toString(2).padStart(numInputQubits, '0');
    const ancillaBit = y.toString();
    const amp = state.amplitudes[i];
    const prob = state.getProbability(i);
    const phaseDeg = state.getPhases()[i];
    
    let phaseSign: 1 | -1 | 0 = 0;
    if (Math.abs(amp.re) > 1e-6) {
      phaseSign = amp.re > 0 ? 1 : -1;
    }

    basisDetails.push({
      bitstring,
      inputBits,
      ancillaBit,
      realAmp: Number(amp.re.toFixed(4)),
      imagAmp: Number(amp.im.toFixed(4)),
      probability: Number(prob.toFixed(4)),
      phaseDeg: Math.round(phaseDeg),
      phaseSign,
      fx: oracle.fn(x, numInputQubits)
    });
  }

  // Input register view (summing / isolating input states)
  const inputRegisterAmplitudes: StageSnapshot['inputRegisterAmplitudes'] = [];
  for (let x = 0; x < numInputStates; x++) {
    const inputBits = x.toString(2).padStart(numInputQubits, '0');
    // Look at the amplitude when ancilla is in the superposition component
    // If state is |x> (1/√2 |0> - 1/√2 |1>), the amplitude for (x, 0) is alpha_x / √2
    const idx0 = (x << 1) | 0;
    const idx1 = (x << 1) | 1;
    const amp0 = state.amplitudes[idx0];
    const amp1 = state.amplitudes[idx1];

    const prob = state.getProbability(idx0) + state.getProbability(idx1);
    
    // Effective input amplitude sign
    let phaseSign: 1 | -1 | 0 = 1;
    let realAmp = amp0.re;
    if (Math.abs(amp0.re) > 1e-6) {
      realAmp = amp0.re * Math.SQRT2;
      phaseSign = amp0.re > 0 ? 1 : -1;
    } else if (Math.abs(amp1.re) > 1e-6) {
      realAmp = -amp1.re * Math.SQRT2;
      phaseSign = amp1.re > 0 ? -1 : 1;
    }

    inputRegisterAmplitudes.push({
      inputBits,
      realAmp: Number(realAmp.toFixed(4)),
      phaseSign,
      phaseDeg: phaseSign === -1 ? 180 : 0,
      probability: Number(prob.toFixed(4)),
      fx: oracle.fn(x, numInputQubits)
    });
  }

  return {
    stage,
    stageIndex,
    title,
    description,
    stateVector: state,
    inputRegisterAmplitudes,
    ancillaStateName: ancillaName,
    basisDetails,
    explanation,
    keyConcept
  };
}
