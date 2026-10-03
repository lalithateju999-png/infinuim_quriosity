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
  const { player, level, status, callsCount, world, signalHistory, grover } = engine;
  const oxygenPct = Math.max(0, Math.min(100, (player.oxygen / player.maxOxygen) * 100));
  const isOxygenLow = oxygenPct < 25;

  // Direction and distance to the candidate spires cluster
  const dx = world.searchCenter.x - player.x;
  const dy = world.searchCenter.y - player.y;
  const angleToSearch = Math.atan2(dy, dx);
  const distToSearch = Math.round(Math.hypot(dx, dy));

  // Latest signal strength from real quantum probability (0–1)
  const latestProb = signalHistory.length > 0 ? signalHistory[signalHistory.length - 1] : 0;
  const opt = grover.optimalIterations;
  const isOvershot = grover.iterations > opt;
  const isPeak = grover.iterations === opt;

  // Diegetic echo strength description (no quantum terminology)
  const echoLabel = (() => {
    if (callsCount === 0) return 'LISTENING FOR ECHOES…';
    if (isPeak) return 'SIGNAL AT PEAK — LISTEN NOW';
    if (isOvershot) return 'ECHO FADING — SCATTERED';
    if (latestProb > 0.6) return 'STRONG ECHO DETECTED';
    if (latestProb > 0.3) return 'ECHO GROWING…';
    return 'FAINT ECHO…';
  })();

  // Colour for label based on state
  const echoLabelColor = isPeak
    ? 'text-amber-300'
    : isOvershot
    ? 'text-rose-400'
    : latestProb > 0.3
    ? 'text-cyan-300'
    : 'text-slate-400';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans text-slate-100">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Chapter / Depth — no "SUPERPOSITION" in the title shown here */}
        <div className="flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md border border-cyan-950/60 px-4 py-2.5 rounded-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-bold tracking-wider text-cyan-300 font-mono">
              ECHOES — {level.subtitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>DEPTH: <strong className="text-slate-200">{level.depthMeters}m</strong></span>
            <span>•</span>
            <span>CANDIDATE SPIRES: <strong className="text-slate-200">{level.n}</strong></span>
            <span>•</span>
            <button
              onClick={onOpenLevelSelect}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors"
            >
              Change Sector
            </button>
          </div>
        </div>

        {/* Center: Directional Compass (distance only, no quantum terms) */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-xl">
          <div
            className="w-4 h-4 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${angleToSearch}rad)` }}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />
          </div>
          <span>SPIRES: <strong className="text-cyan-300">{distToSearch}m</strong></span>
        </div>

        {/* Right: Oxygen + Mute */}
        <div className="flex items-center gap-3 pointer-events-auto">
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

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-700/60 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Bottom: Echo Strength History + Controls */}
      <div className="flex flex-col items-center gap-3 pb-2">

        {/* === Resonance Echo Strength History Chart === */}
        {/* Shows the real target probability after each CALL as growing/shrinking bars.
            Player learns to see the curve rise, peak, then fall — core Grover intuition. */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-2xl pointer-events-auto min-w-[260px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">ECHO STRENGTH</span>
            </div>
            <span className={`text-[11px] font-mono font-semibold ${echoLabelColor}`}>
              {echoLabel}
            </span>
          </div>

          {/* Bar chart: each bar = one CALL, height = real target probability */}
          <div className="flex items-end gap-[3px] h-8 w-full justify-center">
            {/* Show up to 12 calls; empty slots are ghosted */}
            {Array.from({ length: Math.max(8, signalHistory.length + 1) }).map((_, i) => {
              if (i >= signalHistory.length) {
                // Future empty slot
                return (
                  <div
                    key={i}
                    className="flex-1 max-w-[14px] rounded-sm bg-slate-800/50"
                    style={{ height: '4px' }}
                  />
                );
              }
              const prob = signalHistory[i];
              const isThisPeak = i + 1 === opt;
              const isThisOvershot = i + 1 > opt;
              const barH = Math.max(4, Math.round(prob * 32)); // max 32px
              const barColor = isThisPeak
                ? '#facc15' // gold for the real peak
                : isThisOvershot
                ? '#f43f5e' // red after overshoot
                : `hsl(${185 + prob * 50}, 80%, ${45 + prob * 30}%)`; // cyan → teal gradient
              return (
                <div
                  key={i}
                  className="flex-1 max-w-[14px] rounded-sm transition-all duration-300"
                  style={{
                    height: `${barH}px`,
                    backgroundColor: barColor,
                    boxShadow: isThisPeak ? `0 0 6px 1px #facc15aa` : isThisOvershot ? 'none' : `0 0 4px ${barColor}88`,
                  }}
                  title={`Call ${i + 1}: ${(prob * 100).toFixed(1)}%`}
                />
              );
            })}
          </div>

          {/* Axis labels: faint and minimal */}
          {signalHistory.length > 0 && (
            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-600">
              <span>CALL 1</span>
              {signalHistory.length > 1 && <span>CALL {signalHistory.length}</span>}
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
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
              <span className="text-[10px] text-slate-400 font-mono font-normal">[E] • COMMIT & DIVE</span>
            </div>
          </button>
        </div>

        {/* Minimal diegetic hint */}
        <div className="text-[10px] text-slate-500 font-mono bg-slate-950/40 px-3 py-0.5 rounded-full border border-slate-800/30">
          Swim toward the spires • [SPACE] to pulse • LISTEN when the echo peaks
        </div>
      </div>
    </div>
  );
};
