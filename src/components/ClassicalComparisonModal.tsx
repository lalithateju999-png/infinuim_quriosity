import React, { useState } from 'react';
import { X, Play, RotateCcw, Cpu, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PredefinedOracles } from '../quantum/oracle';
import { runDeutschJozsaSimulation } from '../quantum/deutschJozsa';
import { sound } from '../audio/sound';

interface ClassicalComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassicalComparisonModal: React.FC<ClassicalComparisonModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedBits, setSelectedBits] = useState<number>(3); // 3 bits = 8 inputs
  const [isSimulating, setIsSimulating] = useState(false);
  const [classicalQueriesDone, setClassicalQueriesDone] = useState<number>(0);
  const [classicalResult, setClassicalResult] = useState<string | null>(null);
  const [quantumResult, setQuantumResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalInputs = 1 << selectedBits;
  const worstCaseClassical = (totalInputs >> 1) + 1; // 2^(n-1) + 1

  const handleRunRace = () => {
    sound.playPhaseKickback();
    setIsSimulating(true);
    setClassicalQueriesDone(0);
    setClassicalResult(null);
    setQuantumResult(null);

    // Quantum finishes immediately in 1 shot
    setTimeout(() => {
      sound.playInterference();
      setQuantumResult('IDENTIFIED IN 1 SHOT (100% Exact)');
    }, 400);

    // Classical steps query by query
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setClassicalQueriesDone(count);
      sound.playGateClick(300 + count * 50);

      if (count >= worstCaseClassical) {
        clearInterval(interval);
        setIsSimulating(false);
        setClassicalResult(`IDENTIFIED AFTER ${worstCaseClassical} QUERIES`);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Classical vs Quantum: The Speedup Reality
              </h2>
              <p className="text-xs text-slate-400">
                Understanding why Deutsch-Jozsa is deterministically superior
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Misconception Buster Alert */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-cyan-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            CRITICAL CONCEPT: What the Quantum Computer Is (and IS NOT) Doing
          </div>
          <p>
            ❌ <span className="text-rose-300 font-semibold">Common Myth:</span> "The quantum computer checks all inputs simultaneously and reads all answers at once."
            <br />
            <span className="text-slate-400">If you measure in superposition, the wave collapses to a single random answer, telling you no more than 1 classical query!</span>
          </p>
          <p>
            ✓ <span className="text-emerald-300 font-semibold">The True Physics:</span> The quantum probe uses <strong>Phase Kickback</strong> to encode the function into wave interference. The final Hadamard transformation collides these waves so that <strong>global parity</strong> is extracted directly into measurement without ever reading individual answers!
          </p>
        </div>

        {/* Interactive Query Race */}
        <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Simulation: n = {selectedBits} Bits ({totalInputs} Total Inputs)
            </div>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 6].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBits(b);
                    setClassicalQueriesDone(0);
                    setClassicalResult(null);
                    setQuantumResult(null);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition ${
                    selectedBits === b
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {b} bits ({1 << b} inputs)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Classical Track */}
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Classical Deterministic
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {classicalQueriesDone} / {worstCaseClassical} queries
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-400 h-full transition-all duration-300 glow-amber"
                  style={{ width: `${(classicalQueriesDone / worstCaseClassical) * 100}%` }}
                />
              </div>

              <div className="text-xs font-mono text-slate-300 min-h-[32px] flex items-center">
                {classicalResult ? (
                  <span className="text-amber-300 font-bold">{classicalResult}</span>
                ) : isSimulating ? (
                  <span className="text-slate-400 animate-pulse">Testing individual inputs x=0, 1, 2...</span>
                ) : (
                  <span className="text-slate-500">Requires worst-case 2^(n-1)+1 queries</span>
                )}
              </div>
            </div>

            {/* Quantum Track */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Deutsch-Jozsa Quantum
                </span>
                <span className="text-xs font-mono text-slate-400">
                  1 / 1 query
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300 glow-cyan"
                  style={{ width: quantumResult ? '100%' : '0%' }}
                />
              </div>

              <div className="text-xs font-mono text-slate-300 min-h-[32px] flex items-center">
                {quantumResult ? (
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    {quantumResult}
                  </span>
                ) : isSimulating ? (
                  <span className="text-cyan-400 animate-pulse">Executing Superposition → Phase Kickback → Interference</span>
                ) : (
                  <span className="text-slate-500">Always 1 query via wave interference</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleRunRace}
            className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              !isSimulating
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer'
                : 'bg-slate-950 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Launch Query Comparison Race
          </button>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">Input Bits (n)</th>
                <th className="py-2 px-3">Total Inputs (2ⁿ)</th>
                <th className="py-2 px-3 text-amber-400">Classical Worst-Case (2ⁿ⁻¹ + 1)</th>
                <th className="py-2 px-3 text-cyan-400 font-bold">Deutsch-Jozsa Quantum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2 px-3 font-bold">n = 1 (Deutsch)</td>
                <td className="py-2 px-3">2</td>
                <td className="py-2 px-3 text-amber-300">2 queries</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">1 query (2x speedup)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">n = 2</td>
                <td className="py-2 px-3">4</td>
                <td className="py-2 px-3 text-amber-300">3 queries</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">1 query (3x speedup)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">n = 10</td>
                <td className="py-2 px-3">1,024</td>
                <td className="py-2 px-3 text-amber-300">513 queries</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">1 query (513x speedup)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">n = 100</td>
                <td className="py-2 px-3">~1.26 × 10³⁰</td>
                <td className="py-2 px-3 text-amber-300">~6.33 × 10²⁹ queries</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">1 query (Exponential!)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
