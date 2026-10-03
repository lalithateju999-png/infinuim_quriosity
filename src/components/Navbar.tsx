import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, Cpu, RotateCcw, Shield, Layers } from 'lucide-react';
import { sound } from '../audio/sound';

interface NavbarProps {
  currentLevelId: number; // 1 to 5, or 6 for Sandbox
  onSelectLevel: (levelId: number) => void;
  onOpenClassicalRace: () => void;
  onOpenGlossary: () => void;
  onResetLevel: () => void;
}

const NAV_LEVELS = [
  { id: 1, label: 'L1: Probe' },
  { id: 2, label: 'L2: Oracle' },
  { id: 3, label: 'L3: Kickback' },
  { id: 4, label: 'L4: Waves' },
  { id: 5, label: 'L5: The Vault' },
  { id: 6, label: '🧪 Sandbox' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLevelId,
  onSelectLevel,
  onOpenClassicalRace,
  onOpenGlossary,
  onResetLevel
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Title / Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan shadow-md">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black font-mono tracking-wider text-slate-100 uppercase">
                ONE SHOT: <span className="text-cyan-400">THE ORACLE</span>
              </h1>
              <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold">
                Quriosity 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Deutsch–Jozsa Quantum Game • ISAQC IIIT Hyderabad
            </p>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
          {NAV_LEVELS.map((lvl) => {
            const isActive = currentLevelId === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 glow-cyan'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </nav>

        {/* Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenClassicalRace}
            title="Classical vs Quantum Speedup Race"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition"
          >
            <Cpu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenGlossary}
            title="Quantum Theory & Dirac Math Guide"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={onResetLevel}
            title="Reset Current Level"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
