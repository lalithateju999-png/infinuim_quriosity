import { describe, it, expect } from 'vitest';
import { QuantumState, createUniformSuperposition } from '../stateVector';
import { applyOracle } from '../oracle';
import { applyDiffusion } from '../diffusion';
import { GroverSimulator } from '../grover';
import { sampleFromDistribution } from '../measurement';
import { complex } from '../complex';

describe('Quantum State Vector & Normalization', () => {
  it('initializes uniform superposition correctly for N=4, 8, 16', () => {
    for (const n of [4, 8, 16, 32]) {
      const state = createUniformSuperposition(n);
      expect(state.n).toBe(n);
      expect(state.isNormalized()).toBe(true);

      const expectedAmp = 1 / Math.sqrt(n);
      const expectedProb = 1 / n;

      for (let i = 0; i < n; i++) {
        expect(state.amplitudes[i].real).toBeCloseTo(expectedAmp, 6);
        expect(state.amplitudes[i].imag).toBe(0);
        expect(state.getProbabilities()[i]).toBeCloseTo(expectedProb, 6);
      }
      expect(state.totalProbability()).toBeCloseTo(1.0, 6);
    }
  });

  it('preserves normalization under oracle and diffusion operations', () => {
    const state = createUniformSuperposition(8);
    const target = 3;

    applyOracle(state, target);
    expect(state.isNormalized()).toBe(true);

    applyDiffusion(state);
    expect(state.isNormalized()).toBe(true);
  });
});

describe('Oracle Phase Flip', () => {
  it('flips the sign of only the marked target state amplitude', () => {
    const state = createUniformSuperposition(4);
    const target = 2;
    const initialAmp = 1 / Math.sqrt(4); // 0.5

    applyOracle(state, target);

    expect(state.amplitudes[target].real).toBeCloseTo(-initialAmp, 6);
    for (let i = 0; i < 4; i++) {
      if (i !== target) {
        expect(state.amplitudes[i].real).toBeCloseTo(initialAmp, 6);
      }
    }
  });

  it('throws when target index is out of bounds', () => {
    const state = createUniformSuperposition(4);
    expect(() => applyOracle(state, -1)).toThrow();
    expect(() => applyOracle(state, 4)).toThrow();
  });
});

describe('Diffusion Operator (Inversion about the Mean)', () => {
  it('correctly inverts amplitudes about the mean', () => {
    // Custom test vector: [0.5, 0.5, -0.5, 0.5] -> Mean is (0.5+0.5-0.5+0.5)/4 = 1.0/4 = 0.25
    // After 2*mean - alpha_i:
    // 2*0.25 - 0.5 = 0
    // 2*0.25 - 0.5 = 0
    // 2*0.25 - (-0.5) = 0.5 + 0.5 = 1.0
    // 2*0.25 - 0.5 = 0
    const state = new QuantumState(4, [
      complex(0.5, 0),
      complex(0.5, 0),
      complex(-0.5, 0),
      complex(0.5, 0),
    ]);

    applyDiffusion(state);

    expect(state.amplitudes[0].real).toBeCloseTo(0, 6);
    expect(state.amplitudes[1].real).toBeCloseTo(0, 6);
    expect(state.amplitudes[2].real).toBeCloseTo(1.0, 6);
    expect(state.amplitudes[3].real).toBeCloseTo(0, 6);

    expect(state.getProbabilities()[2]).toBeCloseTo(1.0, 6);
  });
});

describe('Grover Amplitude Amplification & Overshooting', () => {
  it('achieves 100% target probability in exactly 1 iteration for N=4', () => {
    for (let target = 0; target < 4; target++) {
      const grover = new GroverSimulator(4, target);
      expect(grover.getTargetProbability()).toBeCloseTo(0.25, 6);

      grover.step(); // 1st iteration

      expect(grover.getTargetProbability()).toBeCloseTo(1.0, 6);
      expect(grover.state.isNormalized()).toBe(true);

      // Overshooting test for N=4: calling a 2nd time should drop probability back to 0.25!
      grover.step();
      expect(grover.getTargetProbability()).toBeCloseTo(0.25, 6);
    }
  });

  it('amplifies target with sweet spot and demonstrates overshooting for N=8', () => {
    const grover = new GroverSimulator(8, 5);
    expect(grover.getTargetProbability()).toBeCloseTo(1 / 8, 4); // 12.5%

    // Iteration 1
    grover.step();
    const p1 = grover.getTargetProbability();
    expect(p1).toBeGreaterThan(0.7); // ≈ 78.1%

    // Iteration 2 (Peak for N=8 is 2 iterations: ≈ 94.5%)
    grover.step();
    const p2 = grover.getTargetProbability();
    expect(p2).toBeGreaterThan(p1);
    expect(p2).toBeCloseTo(0.945, 2);

    // Iteration 3: Overshoot! Probability must drop
    grover.step();
    const p3 = grover.getTargetProbability();
    expect(p3).toBeLessThan(p2);

    // Iteration 4: Continued overshoot
    grover.step();
    const p4 = grover.getTargetProbability();
    expect(p4).toBeLessThan(p3);
  });

  it('works for N=16 with optimal iterations around 3', () => {
    const grover = new GroverSimulator(16, 7);
    expect(grover.optimalIterations).toBe(3);

    expect(grover.getTargetProbability()).toBeCloseTo(1 / 16, 4);

    grover.step(); // 1
    const p1 = grover.getTargetProbability();
    grover.step(); // 2
    const p2 = grover.getTargetProbability();
    grover.step(); // 3 (Peak)
    const p3 = grover.getTargetProbability();

    expect(p1).toBeGreaterThan(1 / 16);
    expect(p2).toBeGreaterThan(p1);
    expect(p3).toBeGreaterThan(p2);
    expect(p3).toBeGreaterThan(0.95); // >95% probability at peak!

    // Step 4: Overshooting occurs
    grover.step();
    const p4 = grover.getTargetProbability();
    expect(p4).toBeLessThan(p3);
  });

  it('works correctly for arbitrary target indices in N=32', () => {
    for (const target of [0, 11, 23, 31]) {
      const grover = new GroverSimulator(32, target);
      expect(grover.optimalIterations).toBe(4);

      // Perform 4 iterations
      for (let i = 0; i < 4; i++) {
        grover.step();
      }

      expect(grover.getTargetProbability()).toBeGreaterThan(0.95);
    }
  });
});

describe('Quantum Measurement', () => {
  it('samples correctly according to probability distribution', () => {
    const probs = [0.1, 0.7, 0.2];

    // deterministic mock rng tests
    expect(sampleFromDistribution(probs, () => 0.05)).toBe(0);
    expect(sampleFromDistribution(probs, () => 0.50)).toBe(1);
    expect(sampleFromDistribution(probs, () => 0.85)).toBe(2);
  });

  it('statistically measures target state proportional to quantum probability', () => {
    const grover = new GroverSimulator(8, 2);
    grover.step();
    grover.step(); // ~94.5% target probability

    let targetCount = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      const result = grover.measure();
      if (result.isTarget) targetCount++;
    }

    const measuredFrequency = targetCount / trials;
    expect(measuredFrequency).toBeGreaterThan(0.90);
    expect(measuredFrequency).toBeLessThan(0.99);
  });
});
