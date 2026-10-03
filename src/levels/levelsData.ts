/**
 * Game Level Progression & Interactive Story Script
 */

import { PredefinedOracles, OracleDefinition } from '../quantum/oracle';

export interface LevelStepTask {
  id: string;
  instruction: string;
  hint: string;
  isComplete: (context: any) => boolean;
}

export interface GameLevel {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  oracleId?: string;
  customOraclesPool?: string[];
  allowGateControls?: boolean;
  allowStepByStep?: boolean;
  guidedMode?: boolean;
  learningFocus: string;
  keyTakeaway: string;
}

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    slug: 'discover-the-probe',
    title: 'LEVEL 1 — DISCOVER THE PROBE',
    subtitle: 'State, Superposition & Phase',
    description: 'Before challenging the Oracle Vault, learn to operate your Quantum Probe. Explore how standard bits differ from quantum states.',
    learningFocus: 'Superposition & Phase Signs',
    keyTakeaway: 'Hadamard (H) puts a bit into equal superposition. H|0⟩ yields (+, +) in-phase, while H|1⟩ yields (+, -) with a 180° phase flip!'
  },
  {
    id: 2,
    slug: 'meet-the-oracle',
    title: 'LEVEL 2 — MEET THE ORACLE',
    subtitle: 'The Black Box & The Classical Bottleneck',
    description: 'Encounter the Vault Oracle. It evaluates a secret function f(x). Try testing inputs classically to understand why classical computers struggle with limited query budgets.',
    oracleId: '1q-bal-identity',
    learningFocus: 'The Parity Problem & Query Budgets',
    keyTakeaway: 'Classically, you must test multiple inputs to be sure if f(x) is Constant or Balanced. Under a strict 1-query limit, classical probing fails.'
  },
  {
    id: 3,
    slug: 'phase-kickback',
    title: 'LEVEL 3 — PHASE KICKBACK',
    subtitle: 'The Secret Quantum Reversal',
    description: 'When the target ancilla qubit is prepared in |−⟩, the Oracle does not just flip bits—it kicks the function value f(x) back as a phase inversion (-1)^f(x)!',
    oracleId: '1q-bal-not',
    learningFocus: 'Phase Kickback Mechanism: U_f(|x⟩|−⟩) = (-1)^f(x) |x⟩|−⟩',
    keyTakeaway: 'Phase kickback encodes the secret answer into the wave orientation of the input qubit without collapsing the superposition.'
  },
  {
    id: 4,
    slug: 'interference',
    title: 'LEVEL 4 — WAVE INTERFERENCE',
    subtitle: 'Turning Phase into Measurement',
    description: 'Phases cannot be read directly. By applying a final Hadamard transformation, we recombine the waves. In-phase states reinforce; opposite phases cancel out!',
    oracleId: '2q-bal-xor',
    learningFocus: 'Constructive & Destructive Interference',
    keyTakeaway: 'Constant functions have identical phases and interfere constructively into |0...0⟩. Balanced functions have opposing phases and cancel |0...0⟩ completely!'
  },
  {
    id: 5,
    slug: 'one-shot-vault',
    title: 'LEVEL 5 — THE ONE-SHOT VAULT',
    subtitle: 'Master the Deutsch-Jozsa Protocol',
    description: 'The Vault is locked behind mysterious unknown Oracles. You have exactly ONE query ticket per stage. Use the complete 4-step quantum pipeline to identify each oracle and unlock the vault!',
    customOraclesPool: [
      '2q-const-0',
      '2q-bal-xor',
      '2q-const-1',
      '2q-bal-xnor',
      '3q-bal-parity3',
      '3q-const-0'
    ],
    learningFocus: '1-Shot Quantum Advantage (Deutsch-Jozsa)',
    keyTakeaway: 'In a single quantum evaluation, wave interference reveals the global property (Constant vs Balanced) with 100% mathematical certainty!'
  }
];
