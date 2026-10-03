import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { StateVector } from '../quantum/stateVector';
import { Gates, applySingleQubitGate } from '../quantum/gates';
import { PhaseDial } from './PhaseDial';
import { sound } from '../audio/sound';

interface Level1Props {
  onCompleteLevel: () => void;
}

export const Level1ProbeDiscover: React.FC<Level1Props> = ({ onCompleteLevel }) => {
  // Current 1-qubit state
  const [state, setState] = useState<StateVector>(StateVector.fromBasis(1, 0)); // |0>
  const [history, setHistory] = useState<string[]>(['Init |0⟩']);
  
  // Mission tracking
  const [hasCreatedPlus, setHasCreatedPlus] = useState(false);
  const [hasCreatedMinus, setHasCreatedMinus] = useState(false);
  const [hasReversedHadamard, setHasReversedHadamard] = useState(false);

  const amp0 = state.amplitudes[0];
  const amp1 = state.amplitudes[1];
  const prob0 = state.getProbability(0);
  const prob1 = state.getProbability(1);
  const phase0 = state.getPhases()[0];
  const phase1 = state.getPhases()[1];

  const handleReset = (basis: 0 | 1) => {
    sound.playGateClick(300);
    const newState = StateVector.fromBasis(1, basis);
    setState(newState);
    setHistory([`Reset to |${basis}⟩`]);
  };

  const handleApplyH = () => {
    sound.playHadamardSuperposition();
    const next = applySingleQubitGate(state, 0, Gates.H);
    setState(next);
    setHistory((prev) => [...prev, 'Hadamard (H)']);

    // Check conditions
    if (Math.abs(next.amplitudes[0].re - 1 / Math.SQRT2) < 0.05 && Math.abs(next.amplitudes[1].re - 1 / Math.SQRT2) < 0.05) {
      setHasCreatedPlus(true);
    }
    if (Math.abs(next.amplitudes[0].re - 1 / Math.SQRT2) < 0.05 && Math.abs(next.amplitudes[1].re - (-1 / Math.SQRT2)) < 0.05) {
      setHasCreatedMinus(true);
    }
    if (hasCreatedPlus && Math.abs(next.getProbability(0) - 1) < 0.05) {
      setHasReversedHadamard(true);
    }
  };

  const handleApplyX = () => {
    sound.playGateClick(500);
    const next = applySingleQubitGate(state, 0, Gates.X);
    setState(next);
    setHistory((prev) => [...prev, 'Bit Flip (X)']);
  };

  const isLevelReadyToComplete = hasCreatedPlus && hasCreatedMinus;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold uppercase">
              Phase 1: Foundations
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Discover the Quantum Probe: Superposition & Phase
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              A classical bit is rigidly 0 or 1. A quantum probe can exist in a <span className="text-cyan-400 font-semibold">superposition</span> of both, with individual <span className="text-amber-400 font-semibold">phase signs</span> (+ or −) that govern how waves combine.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            1-Qubit Probe Simulator
          </div>
        </div>
      </div>

      {/* Interactive Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: State Visualization */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Live Probe State Vector
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/60">
              |ψ⟩ = {state.toDiracNotation()}
            </span>
          </div>

          {/* Basis states cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* |0> component */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              prob0 > 0.01 ? 'bg-slate-950 border-cyan-500/50 glow-cyan' : 'bg-slate-950/40 border-slate-800 opacity-40'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold font-mono text-cyan-300">|0⟩ Basis</span>
                <span className="text-xs font-mono text-slate-400">{(prob0 * 100).toFixed(0)}% chance</span>
              </div>

              <div className="flex items-center justify-center py-3">
                <PhaseDial
                  phaseDeg={phase0}
                  phaseSign={amp0.re < -0.01 ? -1 : 1}
                  amplitude={amp0.re}
                  size={58}
                  label={amp0.re < -0.01 ? 'Phase: −1 (180°)' : 'Phase: +1 (0°)'}
                />
              </div>

              <div className="text-xs font-mono text-center text-slate-300 mt-2">
                Amplitude: <span className="font-bold text-cyan-400">{amp0.re > 0 ? `+${amp0.re.toFixed(3)}` : amp0.re.toFixed(3)}</span>
              </div>
            </div>

            {/* |1> component */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              prob1 > 0.01
                ? amp1.re < -0.01
                  ? 'bg-slate-950 border-amber-500/50 glow-amber'
                  : 'bg-slate-950 border-cyan-500/50 glow-cyan'
                : 'bg-slate-950/40 border-slate-800 opacity-40'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold font-mono text-amber-300">|1⟩ Basis</span>
                <span className="text-xs font-mono text-slate-400">{(prob1 * 100).toFixed(0)}% chance</span>
              </div>

              <div className="flex items-center justify-center py-3">
                <PhaseDial
                  phaseDeg={phase1}
                  phaseSign={amp1.re < -0.01 ? -1 : 1}
                  amplitude={amp1.re}
                  size={58}
                  label={amp1.re < -0.01 ? 'Phase: −1 (180°)' : 'Phase: +1 (0°)'}
                />
              </div>

              <div className="text-xs font-mono text-center text-slate-300 mt-2">
                Amplitude: <span className={amp1.re < -0.01 ? 'font-bold text-amber-400' : 'font-bold text-cyan-400'}>
                  {amp1.re > 0 ? `+${amp1.re.toFixed(3)}` : amp1.re.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Gate Actions */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Quantum Gate Controls
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleReset(0)}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Set |0⟩
              </button>

              <button
                type="button"
                onClick={() => handleReset(1)}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Set |1⟩
              </button>

              <button
                type="button"
                onClick={handleApplyX}
                className="px-3 py-2.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-xs font-mono font-bold text-purple-300 border border-purple-600/50 transition flex items-center justify-center gap-1.5"
                title="Bit-Flip Gate (Pauli-X)"
              >
                Gate [X] (Flip)
              </button>

              <button
                type="button"
                onClick={handleApplyH}
                className="px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-slate-950 border border-cyan-400 glow-cyan transition flex items-center justify-center gap-1.5"
                title="Hadamard Superposition Gate"
              >
                Gate [H] (Hadamard)
              </button>
            </div>
          </div>

          {/* Gate History Breadcrumb */}
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-500 shrink-0">Sequence:</span>
            {history.map((h, i) => (
              <React.Fragment key={i}>
                <span className="text-cyan-300">{h}</span>
                {i < history.length - 1 && <span className="text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right: Guided Discovery Tasks */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Discovery Objectives
              </h3>
            </div>

            <div className="space-y-3">
              {/* Objective 1 */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                hasCreatedPlus
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hasCreatedPlus ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">Objective 1: Create |+⟩ State</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Reset to <span className="text-cyan-300 font-mono">|0⟩</span> and apply <span className="text-cyan-300 font-mono">[H]</span>. Notice both amplitudes are positive <span className="text-cyan-300 font-mono">(+1/√2)</span>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective 2 */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                hasCreatedMinus
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hasCreatedMinus ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">Objective 2: Create |−⟩ State (Phase Flip)</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Set to <span className="text-amber-300 font-mono">|1⟩</span> and apply <span className="text-cyan-300 font-mono">[H]</span>. Notice the amplitude for |1⟩ flips to negative <span className="text-amber-400 font-mono">(−1/√2, 180° phase)</span>!
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective 3 */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                hasReversedHadamard
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hasReversedHadamard ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">Bonus: Wave Reversibility</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Apply <span className="text-cyan-300 font-mono">[H]</span> a second time. The superposition collapses back into deterministic <span className="text-cyan-300 font-mono">|0⟩</span>!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aha Insight callout */}
            <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs text-cyan-200 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">The "Aha!" Moment:</strong> The <span className="font-mono text-amber-300">|−⟩</span> state carries a built-in negative phase sign. In Level 3, we will use this exact sign flip to perform <em>Phase Kickback</em>!
              </div>
            </div>
          </div>

          {/* Level Progression Button */}
          <button
            type="button"
            disabled={!isLevelReadyToComplete}
            onClick={() => {
              sound.playMeasurementSuccess();
              onCompleteLevel();
            }}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
              isLevelReadyToComplete
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isLevelReadyToComplete ? (
              <>
                <span>Probe Calibrated — Proceed to Level 2</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Complete Objectives 1 & 2 to Proceed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
