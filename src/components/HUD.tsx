import React from 'react';
import { GameEngine } from '../game/gameState';
import { Radio, Headphones, Volume2, VolumeX, Navigation, AlertCircle } from 'lucide-react';

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
  const { player, level, grover, status } = engine;
  const oxygenPct = Math.max(0, Math.min(100, (player.oxygen / player.maxOxygen) * 100));
  const isOxygenLow = oxygenPct < 25;

  // Signal Resonance Gauge
  const targetProb = grover.getTargetProbability();
  const opt = grover.optimalIterations;
  const isOptimal = grover.iterations === opt;
  const isOvershot = grover.iterations > opt;

  // Angle toward search center for the compass
  const dx = engine.world.searchCenter.x - player.x;
  const dy = engine.world.searchCenter.y - player.y;
  const angleToSearch = Math.atan2(dy, dx);
  const distToSearch = Math.round(Math.hypot(dx, dy));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans text-slate-100">
      {/* Top Bar: Mission Info & Oxygen */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Chapter / Depth */}
        <div className="flex flex-col gap-1 bg-slate-950/75 backdrop-blur-md border border-cyan-900/40 px-4 py-2.5 rounded-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-xs sm:text-sm font-bold tracking-wider text-cyan-300 font-mono">
              {level.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>DEPTH: <strong className="text-slate-200">{level.depthMeters}m</strong></span>
            <span>•</span>
            <span>TARGETS: <strong className="text-slate-200">{level.n} Spires</strong></span>
            <span>•</span>
            <button
              onClick={onOpenLevelSelect}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
            >
              Change Zone
            </button>
          </div>
        </div>

        {/* Center: Search Area Compass */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-950/75 backdrop-blur-md border border-slate-800/60 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-xl">
          <div
            className="w-5 h-5 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${angleToSearch}rad)` }}
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
          </div>
          <span>SIGNAL BEACON: <strong className="text-cyan-300">{distToSearch}m</strong></span>
        </div>

        {/* Right: Oxygen Gauge & Audio Toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Oxygen Monitor */}
          <div
            className={`flex flex-col min-w-[150px] sm:min-w-[190px] bg-slate-950/80 backdrop-blur-md border px-3.5 py-2 rounded-xl shadow-2xl transition-all ${
              isOxygenLow
                ? 'border-rose-500/80 bg-rose-950/40 animate-pulse'
                : 'border-cyan-900/50'
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
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
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
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 hover:border-cyan-700/60 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Center: Action Controls & Signal Resonance Meter */}
      <div className="flex flex-col items-center gap-3.5 pb-2">
        {/* Signal Resonance Wave Meter */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Radio className={`w-4 h-4 ${isOptimal ? 'text-cyan-400 animate-spin' : isOvershot ? 'text-rose-400' : 'text-slate-400'}`} />
            <span className="text-slate-300">ECHO HARMONICS:</span>
          </div>

          {/* Visual Resonance Waveform */}
          <div className="flex items-center gap-1.5 h-6">
            {Array.from({ length: 9 }).map((_, i) => {
              const centerDist = Math.abs(i - 4);
              const heightMultiplier = Math.max(0.2, 1 - centerDist * 0.18);
              const activeHeight = Math.min(24, Math.max(4, targetProb * 24 * heightMultiplier));
              
              const barColor = isOptimal
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                : isOvershot
                ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                : 'bg-cyan-600/70';

              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${barColor}`}
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>

          <div className="text-[11px] font-mono font-medium">
            {isOptimal ? (
              <span className="text-cyan-300 font-bold tracking-wide animate-pulse">RESONANCE PEAK</span>
            ) : isOvershot ? (
              <span className="text-rose-400 font-bold tracking-wide">DISPERSION / SCATTERING</span>
            ) : grover.iterations === 0 ? (
              <span className="text-slate-400">UNIFORM DIFFUSE</span>
            ) : (
              <span className="text-cyan-400">AMPLIFYING ({grover.iterations} PULSES)</span>
            )}
          </div>
        </div>

        {/* Primary Controls: CALL and LISTEN */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* CALL BUTTON */}
          <button
            onClick={onCall}
            disabled={status !== 'exploring' || player.oxygen <= 0}
            className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-slate-900/90 hover:from-cyan-900 hover:to-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-white font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
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
            className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-slate-900/90 hover:from-indigo-900 hover:to-slate-800 border border-indigo-500/50 hover:border-indigo-400 text-white font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-300">LISTEN</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">[E] • COMMIT SEARCH</span>
            </div>
          </button>
        </div>

        {/* Navigation Hint */}
        <div className="text-[11px] text-slate-400 font-mono bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800/40">
          [W, A, S, D] or [ARROWS] to swim • Follow the signal resonance
        </div>
      </div>
    </div>
  );
};
