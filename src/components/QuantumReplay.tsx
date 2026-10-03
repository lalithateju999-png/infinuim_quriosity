import React, { useState } from 'react';
import { GameEngine } from '../game/gameState';
import { GroverStepRecord } from '../quantum/grover';
import { X, ChevronLeft, ChevronRight, Sparkles, Info } from 'lucide-react';

interface QuantumReplayProps {
  engine: GameEngine;
  onClose: () => void;
}

export const QuantumReplay: React.FC<QuantumReplayProps> = ({ engine, onClose }) => {
  const { grover } = engine;
  const history = grover.history;
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(history.length - 1);

  const stepData: GroverStepRecord = history[selectedStepIdx] || history[0];
  const targetIndex = grover.targetIndex;
  const n = grover.n;
  const opt = grover.optimalIterations;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div className="max-w-4xl w-full bg-slate-900/95 border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.15)] flex flex-col gap-6 text-slate-100 my-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              <span>QUANTUM ECHO ANALYSIS • DEBRIEF</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Grover Amplitude Amplification Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Search Space: <strong className="text-purple-300">N = {n}</strong> • Optimal Resonance Peak:{' '}
              <strong className="text-purple-300">~{opt} Iterations</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              REPLAY TIMELINE (PULSE {stepData.iteration} OF {history.length - 1})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStepIdx(prev => Math.max(0, prev - 1))}
                disabled={selectedStepIdx === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedStepIdx(prev => Math.min(history.length - 1, prev + 1))}
                disabled={selectedStepIdx === history.length - 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {history.map((h, idx) => {
              const isSelected = idx === selectedStepIdx;
              const isOpt = h.iteration === opt;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : isOpt
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 hover:bg-purple-900/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{h.iteration === 0 ? 'START' : `CALL ${h.iteration}`}</span>
                  <span className="text-[10px] opacity-80">
                    {(h.targetProbability * 100).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-purple-200 font-mono bg-purple-950/40 border border-purple-900/40 p-2.5 rounded-xl">
            {stepData.description}
          </p>
        </div>

        {/* State Vector & Probabilities Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Probabilities Bar Chart */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-300">PROBABILITY DISTRIBUTION P(i) = |α_i|²</span>
              <span className="text-cyan-400">Target: LOC-{(targetIndex + 1).toString().padStart(2, '0')}</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-2 pt-4 pb-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
              {stepData.probabilities.map((prob, idx) => {
                const isTarget = idx === targetIndex;
                const pct = (prob * 100).toFixed(1);
                const heightPct = Math.min(100, Math.max(4, prob * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity z-10 whitespace-nowrap">
                      {isTarget ? 'TARGET ' : ''}LOC-{idx + 1}: {pct}%
                    </div>

                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isTarget
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          : 'bg-slate-700/60 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 truncate w-full text-center">
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Target Probability: <strong className="text-cyan-300 font-bold">{(stepData.targetProbability * 100).toFixed(1)}%</strong></span>
              <span>Non-Target Average: <strong className="text-slate-300">{(stepData.nonTargetProbability * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Right: State Amplitudes (Real part) & Mean Inversion */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-300">STATE AMPLITUDES (α_i)</span>
              <span className="text-purple-400">Mean: {stepData.meanAmplitudeReal.toFixed(3)}</span>
            </div>

            <div className="h-44 relative flex items-center justify-between gap-1 sm:gap-2 px-2 bg-slate-900/60 rounded-xl border border-slate-800/60 overflow-hidden">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-700" />
              <div
                className="absolute left-0 right-0 h-px bg-purple-400/80 border-t border-dashed border-purple-400 z-10"
                style={{ top: `${50 - (stepData.meanAmplitudeReal * 45)}%` }}
              />

              {stepData.amplitudes.map((amp, idx) => {
                const isTarget = idx === targetIndex;
                const real = amp.real;
                const isPositive = real >= 0;
                const heightPct = Math.min(48, Math.abs(real) * 48);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-center group relative z-10">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity z-20 whitespace-nowrap">
                      α_{idx + 1} = {real.toFixed(3)}
                    </div>

                    <div className="h-1/2 w-full flex items-end justify-center">
                      {isPositive && (
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isTarget ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]' : 'bg-indigo-400/60'
                          }`}
                          style={{ height: `${heightPct * 2}%` }}
                        />
                      )}
                    </div>
                    <div className="h-1/2 w-full flex items-start justify-center">
                      {!isPositive && (
                        <div
                          className={`w-full rounded-b-sm transition-all duration-300 ${
                            isTarget ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]' : 'bg-slate-600'
                          }`}
                          style={{ height: `${heightPct * 2}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Dashed line = Amplitude Mean
              </span>
              <span>Inversion: α' = 2·Mean - α</span>
            </div>
          </div>
        </div>

        {/* Educational Summary / Grover Mechanics */}
        <div className="bg-slate-950/80 border border-purple-900/40 p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase">
            <Info className="w-4 h-4 text-purple-400" />
            <span>HOW GROVER'S ALGORITHM AMPLIFIED YOUR ECHO:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 font-mono">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-300 block mb-1">1. PHASE MARKING (ORACLE)</strong>
              The target signal is marked by flipping its phase sign: α_target → -α_target.
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <strong className="text-purple-300 block mb-1">2. INVERSION ABOUT MEAN</strong>
              The diffusion operator reflects every amplitude across the average, boosting the negative target high above the rest.
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <strong className="text-emerald-300 block mb-1">3. QUADRATIC ADVANTAGE</strong>
              Classically finding 1 in N items takes O(N) checks. Grover finds it in O(√N) pulses!
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer"
        >
          RETURN TO OCEAN
        </button>
      </div>
    </div>
  );
};
