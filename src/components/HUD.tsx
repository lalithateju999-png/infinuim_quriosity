import React from 'react';
import { GameEngine } from '../game/gameState';
import { Radio, Headphones, Volume2, VolumeX, AlertCircle, Navigation } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onOpenLevelSelect: () => void;
  onCall: () => void;
  onListen: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onOpenLevelSelect,
  onCall,
  onListen,
  onToggleMute,
  isMuted,
}) => {
  const { player, level, status, callsCount, world } = engine;
  const oxygenPct = Math.max(0, Math.min(100, (player.oxygen / player.maxOxygen) * 100));
  const isOxygenLow = oxygenPct < 25;

  // Direction and distance to the candidate spires cluster
  const dx = world.searchCenter.x - player.x;
  const dy = world.searchCenter.y - player.y;
  const angleToSearch = Math.atan2(dy, dx);
  const distToSearch = Math.round(Math.hypot(dx, dy));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans text-slate-100">
      {/* Top Bar: Chapter, Directional Compass & Oxygen */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Chapter / Depth */}
        <div className="flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md border border-cyan-950/60 px-4 py-2.5 rounded-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-bold tracking-wider text-cyan-300 font-mono">
              {level.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>DEPTH: <strong className="text-slate-200">{level.depthMeters}m</strong></span>
            <span>•</span>
            <span>CANDIDATES: <strong className="text-slate-200">{level.n} Spires</strong></span>
            <span>•</span>
            <button
              onClick={onOpenLevelSelect}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
            >
              Change Sector
            </button>
          </div>
        </div>

        {/* Center: Directional Sonar Compass */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-xl">
          <div
            className="w-4 h-4 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${angleToSearch}rad)` }}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />
          </div>
          <span>SPIRES SECTOR: <strong className="text-cyan-300">{distToSearch}m</strong></span>
        </div>

        {/* Right: Oxygen Gauge & Sound Mute */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Oxygen Monitor */}
          <div
            className={`flex flex-col min-w-[140px] sm:min-w-[180px] bg-slate-950/80 backdrop-blur-md border px-3.5 py-2 rounded-xl shadow-2xl transition-all ${
              isOxygenLow
                ? 'border-rose-500/80 bg-rose-950/40 animate-pulse'
                : 'border-cyan-950/60'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono mb-1">
              <span className={`font-semibold flex items-center gap-1 ${isOxygenLow ? 'text-rose-400' : 'text-slate-300'}`}>
                {isOxygenLow && <AlertCircle className="w-3 h-3" />}
                OXYGEN
              </span>
              <span className={`font-bold ${isOxygenLow ? 'text-rose-400' : 'text-cyan-300'}`}>
                {Math.ceil(player.oxygen)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOxygenLow
                    ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${oxygenPct}%` }}
              />
            </div>
          </div>

          {/* Audio Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-700/60 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Center: Signal Feedback & Action Controls */}
      <div className="flex flex-col items-center gap-3 pb-2">
        {/* Diegetic Hydrophone Acoustic Activity Feedback */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-2xl flex items-center gap-3.5 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">HYDROPHONE:</span>
          </div>

          {/* Dynamic 7-bar ambient wave indicator */}
          <div className="flex items-center gap-1 h-4">
            {Array.from({ length: 7 }).map((_, i) => {
              const pulse = 0.4 + 0.6 * Math.sin(performance.now() * 0.004 + i * 0.8);
              const height = Math.min(16, Math.max(3, pulse * (callsCount > 0 ? 14 : 6)));
              return (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-200 bg-cyan-400/80"
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          <div className="text-[11px] font-mono font-medium text-slate-300">
            {callsCount === 0 ? 'DIFFUSE SUPERPOSITION (0 PULSES)' : `AMPLIFYING (${callsCount} ${callsCount === 1 ? 'PULSE' : 'PULSES'})`}
          </div>
        </div>

        {/* Primary Controls: CALL and LISTEN */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          {/* CALL BUTTON */}
          <button
            onClick={onCall}
            disabled={status !== 'exploring' || player.oxygen <= 0}
            className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-slate-900/90 hover:from-cyan-900 hover:to-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-white font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">CALL</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                [SPACE] • -{level.callOxygenCost} O₂
              </span>
            </div>
          </button>

          {/* LISTEN / COMMIT BUTTON */}
          <button
            onClick={onListen}
            disabled={status !== 'exploring'}
            className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-slate-900/90 hover:from-indigo-900 hover:to-slate-800 border border-indigo-500/50 hover:border-indigo-400 text-white font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-300">LISTEN</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">[E] • COMMIT & MEASURE</span>
            </div>
          </button>
        </div>

        {/* Navigation & Learning Hint */}
        <div className="text-[10px] text-slate-400 font-mono bg-slate-950/40 px-3 py-0.5 rounded-full border border-slate-800/30">
          Follow Compass to Spire Sector • [SPACE] to pulse • [E] at Peak Harmony to Measure
        </div>
      </div>
    </div>
  );
};
