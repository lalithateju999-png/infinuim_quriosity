import { QuantumState } from './stateVector';
import { complex } from './complex';

/**
 * Applies the Grover Diffusion Operator (Inversion about the mean)
 * D = 2|s⟩⟨s| - I
 * For each amplitude α_i:
 * mean = (1/N) * Σ α_j
 * α_i' = 2 * mean - α_i
 */
export function applyDiffusion(state: QuantumState): void {
  const n = state.n;
  
  // Calculate average complex amplitude
  let sumReal = 0;
  let sumImag = 0;

  for (let i = 0; i < n; i++) {
    sumReal += state.amplitudes[i].real;
    sumImag += state.amplitudes[i].imag;
  }

  const meanReal = sumReal / n;
  const meanImag = sumImag / n;

  // Invert each amplitude about the mean: 2 * mean - alpha_i
  for (let i = 0; i < n; i++) {
    const cur = state.amplitudes[i];
    state.amplitudes[i] = complex(
      2 * meanReal - cur.real,
      2 * meanImag - cur.imag
    );
  }
}
