import { QuantumState } from './stateVector';
import { negate } from './complex';

/**
 * Applies the phase oracle O_f: |x⟩ -> (-1)^f(x) |x⟩
 * Flips the sign of the marked target state amplitude: α_target -> -α_target
 */
export function applyOracle(state: QuantumState, targetIndex: number): void {
  if (targetIndex < 0 || targetIndex >= state.n) {
    throw new Error(`Target index ${targetIndex} out of bounds [0, ${state.n - 1}]`);
  }

  state.amplitudes[targetIndex] = negate(state.amplitudes[targetIndex]);
}
