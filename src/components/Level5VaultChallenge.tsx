import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Cpu, Waves, Sparkles, Eye, Trophy, RotateCcw, AlertTriangle, ArrowRight, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { PredefinedOracles, OracleDefinition } from '../quantum/oracle';
import { runDeutschJozsaSimulation, AlgorithmStage, DeutschJozsaExecution } from '../quantum/deutschJozsa';
import { StepProgressTracker } from './StepProgressTracker';
import { WaveformDisplay } from './WaveformDisplay';
import { sound } from '../audio/sound';

interface Level5Props {
  onOpenSandbox: () => void;
}

const VAULT_ROUNDS = [
  { id: '1q-round', pool: ['1q-const-0', '1q-bal-identity', '1q-const-1', '1q-bal-not'], label: 'Vault Sector 1 (1-Qubit Oracle)' },
  { id: '2q-round', pool: ['2q-const-0', '2q-bal-xor', '2q-const-1', '2q-bal-xnor', '2q-bal-bit0'], label: 'Vault Sector 2 (2-Qubit Oracle)' },
  { id: '3q-round', pool: ['3q-const-0', '3q-bal-parity3'], label: 'Vault Sector 3 (3-Qubit Hyper-Oracle)' },
];

export const Level5VaultChallenge: React.FC<Level5Props> = ({ onOpenSandbox }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentOracle, setCurrentOracle] = useState<OracleDefinition | null>(null);
  const [execution, setExecution] = useState<DeutschJozsaExecution | null>(null);

  // Circuit pipeline stage
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [measuredResult, setMeasuredResult] = useState<string | null>(null);
  const [playerVerdict, setPlayerVerdict] = useState<'constant' | 'balanced' | null>(null);
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize round oracle
  const startRound = (roundIdx: number) => {
    const roundConfig = VAULT_ROUNDS[roundIdx];
    const pool = roundConfig.pool;
    const randomKey = pool[Math.floor(Math.random() * pool.length)];
    const oracle = PredefinedOracles[randomKey];
    const exec = runDeutschJozsaSimulation(oracle);

    setCurrentOracle(oracle);
    setExecution(exec);
    setCurrentStageIdx(0);
    setMeasuredResult(null);
    setPlayerVerdict(null);
    setIsRoundCompleted(false);
  };

  useEffect(() => {
    startRound(currentRoundIdx);
  }, [currentRoundIdx]);

  if (!currentOracle || !execution) return null;

  const currentSnapshot = execution.snapshots[currentStageIdx];
  const stagesList: AlgorithmStage[] = ['INIT', 'SUPERPOSITION', 'ORACLE', 'INTERFERENCE', 'MEASUREMENT'];

  // Pipeline step handlers
  const handleNextStep = () => {
    if (currentStageIdx >= 4) return;
    const nextIdx = currentStageIdx + 1;

    if (nextIdx === 1) sound.playHadamardSuperposition();
    else if (nextIdx === 2) sound.playPhaseKickback();
    else if (nextIdx === 3) sound.playInterference();
    else if (nextIdx === 4) {
      sound.playMeasurementSuccess();
      setMeasuredResult(execution.finalMeasurement.measuredBitstring);
    } else {
      sound.playGateClick(400);
    }

    setCurrentStageIdx(nextIdx);
  };

  const handleSelectVerdict = (verdict: 'constant' | 'balanced') => {
    setPlayerVerdict(verdict);
    const isCorrect = verdict === currentOracle.kind;

    if (isCorrect) {
      sound.playMeasurementSuccess();
      setScore((s) => s + 100);
      setIsRoundCompleted(true);

      if (currentRoundIdx === VAULT_ROUNDS.length - 1) {
        setVaultUnlocked(true);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas not mounted
        }
      }
    } else {
      sound.playGateClick(200);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < VAULT_ROUNDS.length - 1) {
      setCurrentRoundIdx((r) => r + 1);
    }
  };

  const handleRestartVault = () => {
    setScore(0);
    setVaultUnlocked(false);
    setCurrentRoundIdx(0);
    startRound(0);
  };

  const roundConfig = VAULT_ROUNDS[currentRoundIdx];
  const isMeasurementStep = currentStageIdx === 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold uppercase">
                Final Protocol: The Vault
              </span>
              <span className="text-xs font-mono text-slate-400">
                Sector {currentRoundIdx + 1} of {VAULT_ROUNDS.length}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              {roundConfig.label}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              You are granted <span className="text-amber-400 font-bold">1 Quantum Oracle Ticket</span>. Execute the 4-step Deutsch-Jozsa pipeline and determine the vault security class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Quantum Score</div>
              <div className="text-lg font-bold text-cyan-400">{score} PTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Status Banner */}
      {vaultUnlocked && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-2 border-emerald-500/60 glow-emerald shadow-2xl space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center glow-emerald">
            <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-2xl font-black font-mono text-emerald-300">
              MASTER VAULT BREACHED WITH 1-SHOT CERTAINTY!
            </h3>
            <p className="text-sm text-slate-200 mt-1 max-w-xl mx-auto">
              You have successfully classified 1-qubit, 2-qubit, and 3-qubit Oracles with <strong>exactly 1 query each</strong>. Where a classical computer would have spent multiple sequential queries, wave interference delivered the answer instantly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestartVault}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Replay Vault Challenge
            </button>
            <button
              type="button"
              onClick={onOpenSandbox}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider glow-cyan transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Open Quantum Oracle Sandbox
            </button>
          </div>
        </div>
      )}

      {/* Progress Step Tracker */}
      <StepProgressTracker
        currentStage={stagesList[currentStageIdx]}
      />

      {/* Main Grid: Pipeline Controls & Wave State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: State & Waveform display */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Current Quantum State
              </span>
              <div className="text-xs text-cyan-400 font-mono mt-0.5">
                {currentSnapshot.title}
              </div>
            </div>
            <div className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
              Target Ancilla: <span className="font-bold text-purple-300">{currentSnapshot.ancillaStateName}</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-mono font-bold text-cyan-300">
              {currentSnapshot.keyConcept}
            </div>
            <p className="text-slate-400">{currentSnapshot.explanation}</p>
          </div>

          {/* Waveform Components */}
          <WaveformDisplay
            components={currentSnapshot.inputRegisterAmplitudes.map((a) => ({
              label: a.inputBits,
              amplitude: a.realAmp,
              probability: a.probability,
              phaseSign: a.phaseSign,
              phaseDeg: a.phaseDeg,
              fx: currentStageIdx >= 2 ? a.fx : undefined
            }))}
            showOraclesFx={currentStageIdx >= 2}
          />
        </div>

        {/* Right: Controller & Decision Area */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Quantum Execution Console
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800 text-amber-300">
                Tickets Left: {currentStageIdx >= 2 ? '0' : '1'}
              </span>
            </div>

            {/* Step Action Button */}
            {!isMeasurementStep && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-300">
                  {currentStageIdx === 0 && 'Ready to initialize ground states into equal superposition.'}
                  {currentStageIdx === 1 && 'Superposition active across all input paths. Ready to query mysterious Oracle.'}
                  {currentStageIdx === 2 && 'Phase Kickback complete! Ready to apply final Hadamard transformation to interfere waves.'}
                  {currentStageIdx === 3 && 'Waves have recombined! Ready to measure the input register.'}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider glow-cyan transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {currentStageIdx === 0 && '1. Apply Hadamard Superposition [H^(⊗n)]'}
                  {currentStageIdx === 1 && '2. Fire Quantum Probe [Query Oracle]'}
                  {currentStageIdx === 2 && '3. Trigger Wave Interference [H^(⊗n)]'}
                  {currentStageIdx === 3 && '4. Measure Input Register'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Measurement Outcome Box */}
            {isMeasurementStep && (
              <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-cyan-500/50 glow-cyan space-y-3 text-center">
                <div className="text-xs font-mono text-slate-400 uppercase">
                  Measured Input Register
                </div>
                <div className="text-3xl font-black font-mono tracking-widest text-cyan-300">
                  |{measuredResult}⟩
                </div>
                <div className="text-xs text-slate-300">
                  {measuredResult === '0'.repeat(currentOracle.numInputQubits) ? (
                    <span className="text-emerald-300 font-semibold">
                      Measured All-Zeros (|{'0'.repeat(currentOracle.numInputQubits)}⟩) → 100% Constructive Interference!
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold">
                      Measured Non-Zero (|{measuredResult}⟩) → All-zeros destructively cancelled out!
                    </span>
                  )}
                </div>

                {/* Player Decision Buttons */}
                {!isRoundCompleted && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-mono text-slate-400">
                      Submit your 1-Shot Oracle Classification:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectVerdict('constant')}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 font-mono text-xs font-bold text-cyan-300 transition"
                      >
                        CONSTANT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectVerdict('balanced')}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-400 font-mono text-xs font-bold text-amber-300 transition"
                      >
                        BALANCED
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verdict Feedback */}
            {isRoundCompleted && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold font-mono text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  VERDICT CONFIRMED: {currentOracle.kind.toUpperCase()}
                </div>
                <p>
                  Identity: <span className="font-mono font-bold text-white">{currentOracle.name}</span>
                </p>
                <p className="text-slate-300">
                  {currentOracle.description}
                </p>
              </div>
            )}
          </div>

          {/* Next Round Button */}
          {isRoundCompleted && !vaultUnlocked && (
            <button
              type="button"
              onClick={handleNextRound}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider glow-emerald transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next Vault Sector ({currentRoundIdx + 2}/{VAULT_ROUNDS.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
