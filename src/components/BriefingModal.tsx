import React from 'react';
import { LevelConfig } from '../game/levels';
import { Play, Compass, Wind, Layers, Sparkles } from 'lucide-react';

interface BriefingModalProps {
  level: LevelConfig;
  onStartDive: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({ level, onStartDive }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="max-w-xl w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-900/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col gap-6 text-slate-100 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mission Objective</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-white">
            {level.title}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300 font-mono">
            {level.subtitle} • {level.depthMeters}m Abyss
          </p>
        </div>

        {/* Narrative Intro */}
        <div className="text-sm sm:text-base text-slate-300 leading-relaxed italic bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50">
          "{level.narrativeIntro}"
        </div>

        {/* Level Parameters Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-cyan-900/40 p-3 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL NODES</span>
            </div>
            <span className="text-base font-bold text-cyan-300 font-mono">{level.n} Locations</span>
          </div>

          <div className="bg-slate-950/80 border border-cyan-900/40 p-3 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>OXYGEN SUPPLY</span>
            </div>
            <span className="text-base font-bold text-cyan-300 font-mono">{level.initialOxygen}% Initial</span>
          </div>

          <div className="bg-slate-950/80 border border-cyan-900/40 p-3 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>CALL COST</span>
            </div>
            <span className="text-base font-bold text-cyan-300 font-mono">-{level.callOxygenCost}% O₂ / pulse</span>
          </div>
        </div>

        {/* Key Strategy Tip */}
        <div className="text-xs text-slate-400 font-mono bg-cyan-950/30 border border-cyan-800/40 p-3 rounded-xl flex items-center gap-2">
          <span className="text-cyan-400 font-bold">TACTICAL NOTE:</span>
          <span>
            Send echo pulses to amplify the response, but watch for the sweet spot before the wave scatters.
          </span>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartDive}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all cursor-pointer active:scale-98"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>BEGIN DESCENT</span>
        </button>
      </div>
    </div>
  );
};
