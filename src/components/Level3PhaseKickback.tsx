import React, { useState } from 'react';
import { Zap, HelpCircle, ArrowRight, CheckCircle2, RotateCcw, Cpu, Sparkles } from 'lucide-react';
import { PredefinedOracles, applyQuantumOracle } from '../quantum/oracle';
import { StateVector } from '../quantum/stateVector';
import { Gates, applySingleQubitGate } from '../quantum/gates';
import { PhaseDial } from './PhaseDial';
import { sound } from '../audio/sound';

interface Level3Props {
  onCompleteLevel: () => void;
}

export const Level3PhaseKickback: React.FC<Level3Props> = ({ onCompleteLevel }) => {
  const oracle = PredefinedOracles['1q-bal-not']; // f(0)=1, f(1)=0

  // Ancilla setup: '0' (classical target) vs 'minus' (phase kickback target |->)
  const [ancillaMode, setAncillaMode] = useState<'0' | 'minus'>('minus');
  const [hasQueriedOracle, setHasQueriedOracle] = useState(false);
  const [currentState, setCurrentState] = useState<StateVector>(() => {
    // Input |+>, Ancilla |->
    const qIn = applySingleQubitGate(StateVector.fromBasis(1, 0), 0, Gates.H);
    const qAnc = applySingleQubitGate(StateVector.fromBasis(1, 1), 0, Gates.H);
    return qIn.tensor(qAnc);
  });

  const [hasObservedPhaseFlip, setHasObservedPhaseFlip] = useState(false);

  const resetCircuit = (mode: '0' | 'minus') => {
    sound.playGateClick(350);
    setAncillaMode(mode);
    setHasQueriedOracle(false);

    const qIn = applySingleQubitGate(StateVector.fromBasis(1, 0), 0, Gates.H); // |+>
    const qAnc = mode === 'minus'
      ? applySingleQubitGate(StateVector.fromBasis(1, 1), 0, Gates.H) // |->
      : StateVector.fromBasis(1, 0); // |0>

    setCurrentState(qIn.tensor(qAnc));
  };

  const handleFireOracle = () => {
    sound.playPhaseKickback();
    const next = applyQuantumOracle(currentState, oracle.fn, 1);
    setCurrentState(next);
    setHasQueriedOracle(true);

    if (ancillaMode === 'minus') {
      setHasObservedPhaseFlip(true);
    }
  };

  // Inspect the 4 basis amplitudes: |00>, |01>, |10>, |11>
  // |x, y> where x is input bit (MSB), y is ancilla bit (LSB)
  const a00 = currentState.amplitudes[0];
  const a01 = currentState.amplitudes[1];
  const a10 = currentState.amplitudes[2];
  const a11 = currentState.amplitudes[3];

  // Effective input register phases when ancilla is |->:
  // For x=0: amplitude for |0> ⊗ |->
  // For x=1: amplitude for |1> ⊗ |->
  const input0PhaseDeg = currentState.getPhases()[0]; // phase of |00>
  const input1PhaseDeg = currentState.getPhases()[2]; // phase of |10>
  const input0Sign = a00.re < -0.01 ? -1 : 1;
  const input1Sign = a10.re < -0.01 ? -1 : 1;

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-400 font-bold uppercase">
              Phase 3: The Secret Weapon
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Phase Kickback: U_f(|x⟩|−⟩) = (−1)^f(x) |x⟩|−⟩
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              By preparing the ancilla target qubit in the <span className="font-mono text-amber-300">|−⟩ = (|0⟩ − |1⟩)/√2</span> state, the Oracle’s bit flip <span className="font-mono text-cyan-300">y ⊕ f(x)</span> is transferred as a <span className="text-amber-400 font-semibold">phase inversion (−1)^f(x)</span> into the input state!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Zap className="w-4 h-4 text-purple-400" />
            Phase Kickback Engine
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Circuit & State View */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Ancilla Mode Configuration
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resetCircuit('minus')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border transition ${
                  ancillaMode === 'minus'
                    ? 'bg-purple-950 border-purple-500 text-purple-300 glow-purple'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Target |−⟩ (Phase Mode)
              </button>
              <button
                type="button"
                onClick={() => resetCircuit('0')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border transition ${
                  ancillaMode === '0'
                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Target |0⟩ (Standard Mode)
              </button>
            </div>
          </div>

          {/* Circuit Visual Pipeline */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Quantum Register Flow
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              {/* Input Register Wire */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30">
                <span className="text-cyan-400 font-bold shrink-0">Input |x⟩</span>
                <span className="text-slate-500">──</span>
                <span className="px-2 py-1 bg-cyan-950 border border-cyan-700 text-cyan-300 rounded font-bold">
                  [H] → |+⟩
                </span>
                <span className="text-slate-500 flex-1 border-t border-slate-700 mx-2" />
                <span className="px-3 py-1.5 bg-slate-800 border border-purple-500/60 text-purple-300 rounded font-bold">
                  Oracle (U_f)
                </span>
                <span className="text-slate-500 flex-1 border-t border-slate-700 mx-2" />
                <span className={`px-2.5 py-1 rounded font-bold ${
                  hasQueriedOracle && ancillaMode === 'minus'
                    ? 'bg-amber-950 border border-amber-500 text-amber-300 glow-amber'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}>
                  {hasQueriedOracle && ancillaMode === 'minus' ? '(−1)^f(x)|x⟩ (Phase Kicked!)' : '|x⟩'}
                </span>
              </div>

              {/* Target Ancilla Wire */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/90 border border-purple-500/30">
                <span className="text-purple-400 font-bold shrink-0">Target |y⟩</span>
                <span className="text-slate-500">──</span>
                <span className={`px-2 py-1 rounded font-bold ${
                  ancillaMode === 'minus'
                    ? 'bg-purple-950 border border-purple-700 text-purple-300'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}>
                  {ancillaMode === 'minus' ? 'X + H → |−⟩' : '|0⟩'}
                </span>
                <span className="text-slate-500 flex-1 border-t border-slate-700 mx-2" />
                <span className="px-3 py-1.5 bg-slate-800 border border-purple-500/60 text-purple-300 rounded font-bold">
                  Target ⊕ f(x)
                </span>
                <span className="text-slate-500 flex-1 border-t border-slate-700 mx-2" />
                <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
                  {ancillaMode === 'minus' ? '|−⟩ (Unchanged!)' : `|f(x)⟩`}
                </span>
              </div>
            </div>

            {/* Oracle Activation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFireOracle}
                disabled={hasQueriedOracle}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  !hasQueriedOracle
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 glow-purple cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                {hasQueriedOracle ? 'Oracle Evaluated' : 'Execute Oracle Query [1 Shot]'}
              </button>
            </div>
          </div>

          {/* Phase inspection comparison cards */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Input State Phase Vector
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* x = 0 branch */}
              <div className={`p-4 rounded-xl border transition-all ${
                input0Sign === -1
                  ? 'bg-amber-950/30 border-amber-500/60 glow-amber'
                  : 'bg-slate-950 border-cyan-500/40 glow-cyan'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-sm text-slate-200">|x = 0⟩ State</span>
                  <span className="text-xs font-mono text-slate-400">Oracle f(0) = {oracle.fn(0, 1)}</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <PhaseDial
                    phaseDeg={input0PhaseDeg}
                    phaseSign={input0Sign}
                    amplitude={0.707}
                    size={52}
                    label={input0Sign === -1 ? 'Phase: −1 (Inverted)' : 'Phase: +1 (Standard)'}
                  />
                </div>
                <div className="text-center text-xs font-mono mt-1 text-slate-300">
                  Phase Factor: <strong className={input0Sign === -1 ? 'text-amber-400' : 'text-cyan-400'}>
                    (−1)^{oracle.fn(0, 1)} = {input0Sign > 0 ? '+1' : '−1'}
                  </strong>
                </div>
              </div>

              {/* x = 1 branch */}
              <div className={`p-4 rounded-xl border transition-all ${
                input1Sign === -1
                  ? 'bg-amber-950/30 border-amber-500/60 glow-amber'
                  : 'bg-slate-950 border-cyan-500/40 glow-cyan'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-sm text-slate-200">|x = 1⟩ State</span>
                  <span className="text-xs font-mono text-slate-400">Oracle f(1) = {oracle.fn(1, 1)}</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <PhaseDial
                    phaseDeg={input1PhaseDeg}
                    phaseSign={input1Sign}
                    amplitude={0.707}
                    size={52}
                    label={input1Sign === -1 ? 'Phase: −1 (Inverted)' : 'Phase: +1 (Standard)'}
                  />
                </div>
                <div className="text-center text-xs font-mono mt-1 text-slate-300">
                  Phase Factor: <strong className={input1Sign === -1 ? 'text-amber-400' : 'text-cyan-400'}>
                    (−1)^{oracle.fn(1, 1)} = {input1Sign > 0 ? '+1' : '−1'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Insight & Progression */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                The Kickback Insight
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-mono font-bold text-purple-300">Why does Phase Kickback happen?</div>
                <p>
                  Recall that <span className="font-mono text-amber-300">|−⟩ = (|0⟩ − |1⟩)/√2</span>.
                </p>
                <p>
                  When <span className="font-mono text-cyan-300">f(x) = 0</span>:
                  <br />
                  <span className="font-mono text-slate-400">|0 ⊕ 0⟩ − |1 ⊕ 0⟩ = |0⟩ − |1⟩ = +1 |−⟩</span>
                </p>
                <p>
                  When <span className="font-mono text-cyan-300">f(x) = 1</span>:
                  <br />
                  <span className="font-mono text-slate-400">|0 ⊕ 1⟩ − |1 ⊕ 1⟩ = |1⟩ − |0⟩ = −1 (|0⟩ − |1⟩) = −1 |−⟩</span>
                </p>
                <p className="text-amber-300 font-semibold pt-1">
                  The bit-flip is literally kicked back as an overall negative sign!
                </p>
              </div>

              <div className={`p-3.5 rounded-lg border transition-all ${
                hasObservedPhaseFlip
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hasObservedPhaseFlip ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">Mission: Trigger Phase Kickback</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Ensure Target is set to <span className="text-purple-300 font-mono">|−⟩</span> and click <strong>Execute Oracle Query</strong>. Observe the phase arrow flip on <span className="text-amber-300 font-mono">|0⟩</span> because <span className="text-amber-300 font-mono">f(0)=1</span>!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed button */}
          <button
            type="button"
            disabled={!hasObservedPhaseFlip}
            onClick={() => {
              sound.playMeasurementSuccess();
              onCompleteLevel();
            }}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
              hasObservedPhaseFlip
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {hasObservedPhaseFlip ? (
              <>
                <span>Phase Kickback Mastered — Proceed to Level 4</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Execute Oracle with Target in |−⟩ to Proceed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
