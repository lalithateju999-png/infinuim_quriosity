import React, { useEffect } from 'react';
import { GameEngine } from '../game/gameState';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, BarChart3, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OutcomeModalProps {
  engine: GameEngine;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenReplay: () => void;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  engine,
  onNextLevel,
  onRetry,
  onOpenReplay,
}) => {
  const { status, level, measurementResult, callsCount, grover, player } = engine;
  const isSuccess = status === 'success';
  const isOxygenDepleted = player.oxygen <= 0;
  const opt = grover.optimalIterations;
  const isOvershot = callsCount > opt;

  useEffect(() => {
    if (isSuccess) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#06b6d4', '#facc15', '#60a5fa'],
      });
    }
  }, [isSuccess]);

  const targetProb = measurementResult
    ? (measurementResult.targetProbability * 100).toFixed(1)
    : (grover.getTargetProbability() * 100).toFixed(1);

  const measuredIdx = measurementResult ? measurementResult.measuredIndex + 1 : 1;

  // Educational insight — diegetic language that teaches timing through experience
  let collapseInsight = '';
  if (isSuccess) {
    if (callsCount === opt) {
      collapseInsight = `You called exactly ${callsCount} time${callsCount > 1 ? 's' : ''} — the echo was at its absolute strongest. Perfect timing: signal strength was ${targetProb}%.`;
    } else if (callsCount < opt) {
      collapseInsight = `Found Luma in ${callsCount} call${callsCount > 1 ? 's' : ''}, but the echo was still building (${targetProb}%). Calling ${opt} time${opt > 1 ? 's' : ''} gives the strongest signal.`;
    } else {
      collapseInsight = `Luma answered despite ${callsCount} calls — but the echo had already faded past its peak at ${opt}. The signal was ${targetProb}% and still weak. You were fortunate.`;
    }
  } else if (isOxygenDepleted) {
    collapseInsight = 'Oxygen ran out before you committed. Try fewer calls and listen when the echo bars glow brightest.';
  } else if (isOvershot) {
    collapseInsight = `You called ${callsCount} times but the echo peaked at ${opt} call${opt > 1 ? 's' : ''} then faded. Signal was only ${targetProb}% when you committed. Watch the echo bars — listen before they drop.`;
  } else {
    collapseInsight = `The echo was still faint at ${targetProb}% after ${callsCount} call${callsCount > 1 ? 's' : ''}. The signal peaks around ${opt} call${opt > 1 ? 's' : ''}. Call more before committing.`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div
        className={`max-w-xl w-full bg-gradient-to-b from-slate-900 to-slate-950 border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-slate-100 animate-in fade-in zoom-in-95 duration-300 ${
          isSuccess
            ? 'border-cyan-500/60 shadow-[0_0_60px_rgba(6,182,212,0.25)]'
            : 'border-rose-900/60 shadow-[0_0_60px_rgba(244,63,94,0.15)]'
        }`}
      >
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center gap-2.5 border-b border-slate-800/80 pb-4">
          <div
            className={`p-3 rounded-2xl flex items-center justify-center ${
              isSuccess
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-wide">
              {isSuccess
                ? 'LUMA FOUND'
                : isOxygenDepleted
                ? 'OXYGEN DEPLETED'
                : 'WRONG SPIRE — LUMA NOT HERE'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {level.subtitle} • {level.depthMeters}m
            </p>
          </div>
        </div>

        {/* Narrative Outcome */}
        <div className="text-xs sm:text-sm text-slate-300 italic text-center bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60 leading-relaxed">
          {isSuccess ? level.narrativeSuccess : level.narrativeFailure}
        </div>

        {/* Echo Timing Feedback — teaches the player the Grover resonance curve */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs font-mono leading-relaxed ${
            isSuccess
              ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
              : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
          }`}
        >
          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isSuccess ? 'text-cyan-400' : 'text-rose-400'}`} />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              {isSuccess ? 'Echo Timing' : 'What Went Wrong'}
            </span>
            <span>{collapseInsight}</span>
          </div>
        </div>

        {/* Dive Metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400">PULSES (CALLS)</span>
            <span className="text-base font-bold text-cyan-300 font-mono mt-0.5">{callsCount} Pulses</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400">TARGET PROBABILITY</span>
            <span className="text-base font-bold text-cyan-300 font-mono mt-0.5">{targetProb}%</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400">MEASURED RESULT</span>
            <span className={`text-base font-bold font-mono mt-0.5 ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
              Spire {measuredIdx}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isSuccess && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-98"
            >
              <span>DESCEND TO NEXT LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>DIVE AGAIN</span>
            </button>

            {/* Quantum Replay / Analysis Button */}
            <button
              onClick={onOpenReplay}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 text-purple-200 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>QUANTUM REPLAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
