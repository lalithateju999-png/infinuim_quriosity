import React, { useState } from 'react';
import { Waves, Sparkles, ArrowRight, CheckCircle2, Eye, HelpCircle } from 'lucide-react';
import { PredefinedOracles, OracleDefinition } from '../quantum/oracle';
import { runDeutschJozsaSimulation, StageSnapshot } from '../quantum/deutschJozsa';
import { WaveformDisplay } from './WaveformDisplay';
import { sound } from '../audio/sound';

interface Level4Props {
  onCompleteLevel: () => void;
}

export const Level4Interference: React.FC<Level4Props> = ({ onCompleteLevel }) => {
  const [selectedOracleKey, setSelectedOracleKey] = useState<'2q-const-0' | '2q-bal-xor'>('2q-bal-xor');
  const oracle: OracleDefinition = PredefinedOracles[selectedOracleKey];

  const execution = runDeutschJozsaSimulation(oracle);
  const oracleStage = execution.snapshots[2]; // after oracle (phase kickback)
  const interferenceStage = execution.snapshots[3]; // after final Hadamard

  const [hasInterferedBoth, setHasInterferedBoth] = useState(false);
  const [testedOracles, setTestedOracles] = useState<Set<string>>(new Set());

  const handleSelectOracle = (key: '2q-const-0' | '2q-bal-xor') => {
    sound.playGateClick(450);
    setSelectedOracleKey(key);
    setTestedOracles((prev) => {
      const next = new Set(prev).add(key);
      if (next.size >= 2) {
        setHasInterferedBoth(true);
      }
      return next;
    });
  };

  const handleTriggerInterferenceSound = () => {
    sound.playInterference();
  };

  const isConstant = oracle.kind === 'constant';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-400 font-bold uppercase">
              Phase 4: Wave Recombination
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Wave Interference: Converting Phase to Probability
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Quantum measurement alone cannot see phase signs because <span className="font-mono text-cyan-300">|−1|² = |+1|² = 1</span>. Applying a final <span className="font-mono text-cyan-400 font-bold">Hadamard (H)</span> collides the waves together: in-phase components amplify, while opposite phases cancel out entirely!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Waves className="w-4 h-4 text-blue-400" />
            Interference Chamber
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Wave comparison and collision */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          {/* Oracle Type Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Compare Oracle Types
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectOracle('2q-bal-xor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                  selectedOracleKey === '2q-bal-xor'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 glow-amber'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Balanced Oracle (XOR)
              </button>
              <button
                type="button"
                onClick={() => handleSelectOracle('2q-const-0')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                  selectedOracleKey === '2q-const-0'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 glow-emerald'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Constant Oracle (0)
              </button>
            </div>
          </div>

          {/* Before Interference: Phase Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Step 3: After Phase Kickback (Hidden In Phase Signs)
              </span>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                Amplitudes: Equal (0.500), but signs differ!
              </span>
            </div>

            <WaveformDisplay
              components={oracleStage.inputRegisterAmplitudes.map((a) => ({
                label: a.inputBits,
                amplitude: a.realAmp,
                probability: a.probability,
                phaseSign: a.phaseSign,
                phaseDeg: a.phaseDeg,
                fx: a.fx
              }))}
              showOraclesFx={true}
            />
          </div>

          {/* Action: Trigger Interference Transformation */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-300">
              Apply Final Hadamard Transformation <span className="text-cyan-400 font-bold">H^(⊗2)</span>:
            </div>
            <button
              type="button"
              onClick={handleTriggerInterferenceSound}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-slate-950 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5" />
              Pulse Waves
            </button>
          </div>

          {/* After Interference: Resulting Probabilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Step 4: After Final Hadamard (Interference Pattern)
              </span>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                isConstant
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
              }`}>
                {isConstant ? 'Constructive on |00⟩ (100%)' : 'Destructive on |00⟩ (0%)!'}
              </span>
            </div>

            <WaveformDisplay
              components={interferenceStage.inputRegisterAmplitudes.map((a) => ({
                label: a.inputBits,
                amplitude: a.realAmp,
                probability: a.probability,
                phaseSign: a.phaseSign,
                phaseDeg: a.phaseDeg
              }))}
            />
          </div>
        </div>

        {/* Right: The Interference Mathematics & Rules */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                The Interference Rule
              </h3>
            </div>

            {/* In-depth explanation card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3">
              <div className="font-mono font-bold text-blue-300">
                Amplitude of Ground State |00...0⟩ after final H:
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700 font-mono text-center text-xs text-cyan-200">
                α₀ = (1 / 2ⁿ) · ∑ (−1)^f(x)
              </div>

              {isConstant ? (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-1">
                  <strong>CONSTANT Case:</strong>
                  <div>All terms have the SAME sign: (+1 + 1 + 1 + 1) / 4 = 1.0</div>
                  <div className="text-[11px] text-emerald-300/80">
                    Constructive interference gives 100% probability to |00⟩!
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-1">
                  <strong>BALANCED Case:</strong>
                  <div>Half are +1, half are −1: (+1 − 1 + 1 − 1) / 4 = 0.0</div>
                  <div className="text-[11px] text-amber-300/80">
                    Total destructive cancellation on |00⟩! The probability of measuring |00⟩ is strictly 0%.
                  </div>
                </div>
              )}
            </div>

            {/* Mission Check */}
            <div className={`p-3.5 rounded-lg border transition-all ${
              hasInterferedBoth
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hasInterferedBoth ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div>
                  <div className="text-xs font-bold font-mono">Mission: Compare Constant & Balanced</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Switch between the <strong>Balanced Oracle</strong> and <strong>Constant Oracle</strong> above to see how wave interference sorts the global property.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Complete Button */}
          <button
            type="button"
            disabled={!hasInterferedBoth}
            onClick={() => {
              sound.playMeasurementSuccess();
              onCompleteLevel();
            }}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
              hasInterferedBoth
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {hasInterferedBoth ? (
              <>
                <span>Interference Mastered — Enter the One-Shot Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Inspect both Constant & Balanced Oracles</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
