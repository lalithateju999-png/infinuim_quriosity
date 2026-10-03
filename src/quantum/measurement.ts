import { QuantumState } from './stateVector';

export interface MeasurementResult {
  measuredIndex: number;
  isTarget: boolean;
  targetIndex: number;
  targetProbability: number;
  probabilities: number[];
  iterationsCompleted: number;
}

/**
 * Samples a state index according to the given probability distribution
 */
export function sampleFromDistribution(probabilities: number[], rng: () => number = Math.random): number {
  const r = rng();
  let cumulative = 0;

  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (r <= cumulative || i === probabilities.length - 1) {
      return i;
    }
  }

  return probabilities.length - 1;
}

/**
 * Performs quantum measurement on the state vector
 */
export function performMeasurement(
  state: QuantumState,
  targetIndex: number,
  iterationsCompleted: number,
  rng: () => number = Math.random
): MeasurementResult {
  const probabilities = state.getProbabilities();
  const measuredIndex = sampleFromDistribution(probabilities, rng);
  const targetProbability = probabilities[targetIndex];

  return {
    measuredIndex,
    isTarget: measuredIndex === targetIndex,
    targetIndex,
    targetProbability,
    probabilities,
    iterationsCompleted,
  };
}
