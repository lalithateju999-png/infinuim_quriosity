import React, { useState } from 'react';
import { Cpu, HelpCircle, ArrowRight, ShieldAlert, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { PredefinedOracles } from '../quantum/oracle';
import { sound } from '../audio/sound';

interface Level2Props {
  onCompleteLevel: () => void;
}

export const Level2OracleIntro: React.FC<Level2Props> = ({ onCompleteLevel }) => {
  const [selectedOracleKey] = useState<'1q-bal-identity'>('1q-bal-identity');
  const oracle = PredefinedOracles[selectedOracleKey];

  // Probing state
  const [classicalQueries, setClassicalQueries] = useState<Record<string, number>>({});
  const [lastQueried, setLastQueried] = useState<string | null>(null);
  const [playerGuess, setPlayerGuess] = useState<'constant' | 'balanced' | null>(null);
  const [hasQueriedBoth, setHasQueriedBoth] = useState(false);

  const queryCount = Object.keys(classicalQueries).length;

  const handleQueryClassical = (x: 0 | 1) => {
    sound.playGateClick(400);
    const fx = oracle.fn(x, 1);
    const bitStr = x.toString();
    setLastQueried(bitStr);
    setClassicalQueries((prev) => {
      const next = { ...prev, [bitStr]: fx };
      if (Object.keys(next).length >= 2) {
        setHasQueriedBoth(true);
      }
      return next;
    });
  };

  const handleGuess = (guess: 'constant' | 'balanced') => {
    sound.playGateClick(600);
    setPlayerGuess(guess);
  };

  const isGuessCorrect = playerGuess === oracle.kind;

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-400 font-bold uppercase">
              Phase 2: The Oracle Dilemma
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Meet the Oracle & The Classical Bottleneck
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              The Vault is locked behind an unknown black-box function <span className="font-mono text-cyan-300">f(x) → {'{0, 1}'}</span>. It is guaranteed to be either <span className="font-semibold text-emerald-400">CONSTANT</span> (all outputs identical) or <span className="font-semibold text-amber-400">BALANCED</span> (half 0s, half 1s).
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-amber-400" />
            Classical Query Testbed
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Classical Oracle Terminal */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold font-mono text-slate-200">
                MYSTERIOUS ORACLE BLACK-BOX [U_f]
              </span>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
              Query Count: <span className="font-bold text-amber-400">{queryCount}</span> / 2
            </span>
          </div>

          {/* Mysterious Black Box Graphic */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-700/80 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center glow-amber">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-slate-100">
                Hidden Oracle: <span className="text-amber-400">SECRET_VAULT_f(x)</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Evaluates input <span className="font-mono text-cyan-300">x</span> and returns <span className="font-mono text-amber-300">f(x)</span>
              </div>
            </div>

            {/* Classical Query Inputs */}
            <div className="w-full pt-3">
              <div className="text-xs font-mono text-slate-400 mb-2">Send Classical Probe Input:</div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => handleQueryClassical(0)}
                  className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono font-bold text-cyan-300 transition flex items-center justify-center gap-2"
                >
                  Send x = 0
                </button>
                <button
                  type="button"
                  onClick={() => handleQueryClassical(1)}
                  className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono font-bold text-cyan-300 transition flex items-center justify-center gap-2"
                >
                  Send x = 1
                </button>
              </div>
            </div>
          </div>

          {/* Query Results Table */}
          <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Classical Query Log
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className={`p-3 rounded-lg border flex justify-between items-center ${
                classicalQueries['0'] !== undefined
                  ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600'
              }`}>
                <span>f(x = 0):</span>
                <span className="font-bold text-sm">
                  {classicalQueries['0'] !== undefined ? classicalQueries['0'] : '??? (Unqueried)'}
                </span>
              </div>

              <div className={`p-3 rounded-lg border flex justify-between items-center ${
                classicalQueries['1'] !== undefined
                  ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600'
              }`}>
                <span>f(x = 1):</span>
                <span className="font-bold text-sm">
                  {classicalQueries['1'] !== undefined ? classicalQueries['1'] : '??? (Unqueried)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Dilemma & Insight */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                The 1-Shot Dilemma
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5 text-slate-300">
              <p>
                Suppose you are only allowed <strong className="text-amber-400">EXACTLY ONE</strong> query ticket.
              </p>
              {queryCount === 0 && (
                <p className="text-slate-400 italic">
                  Query either x=0 or x=1 on the left to see what information a single query yields.
                </p>
              )}
              {queryCount === 1 && (
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200">
                  ⚠️ <strong>Notice:</strong> You found that f({lastQueried}) = {classicalQueries[lastQueried!]}. But is the function Constant or Balanced? You <strong>CANNOT</strong> know without querying the other input!
                </div>
              )}
              {queryCount >= 2 && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                  ✓ Now you know both f(0)={classicalQueries['0']} and f(1)={classicalQueries['1']}. Since they differ, it is <strong>BALANCED</strong>. But you had to spend <strong>2 queries</strong>!
                </div>
              )}
            </div>

            {/* Verdict prompt */}
            {queryCount >= 2 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-slate-400">Classify the function based on your findings:</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleGuess('constant')}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition ${
                      playerGuess === 'constant'
                        ? isGuessCorrect ? 'bg-emerald-600 text-slate-950 border-emerald-400' : 'bg-rose-600 text-slate-100 border-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    CONSTANT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGuess('balanced')}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition ${
                      playerGuess === 'balanced'
                        ? isGuessCorrect ? 'bg-emerald-600 text-slate-950 border-emerald-400 glow-emerald' : 'bg-rose-600 text-slate-100 border-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    BALANCED
                  </button>
                </div>
              </div>
            )}

            {/* Quantum hook */}
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs text-cyan-200 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">The Quantum Solution:</strong> A quantum computer doesn't read the individual outputs. Instead, using <em>Phase Kickback</em> and <em>Interference</em>, it determines whether the function is <strong>CONSTANT or BALANCED</strong> in a single shot!
              </div>
            </div>
          </div>

          {/* Level Complete Button */}
          <button
            type="button"
            disabled={!hasQueriedBoth || !isGuessCorrect}
            onClick={() => {
              sound.playMeasurementSuccess();
              onCompleteLevel();
            }}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
              hasQueriedBoth && isGuessCorrect
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {hasQueriedBoth && isGuessCorrect ? (
              <>
                <span>Bottleneck Understood — Proceed to Level 3</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Query both inputs and submit the verdict</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
