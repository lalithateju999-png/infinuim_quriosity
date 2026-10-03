import React, { useState } from 'react';
import { CAMPAIGN_LEVELS, LevelConfig } from '../game/levels';
import { X, Layers, Play, Sliders, ChevronRight } from 'lucide-react';

interface LevelSelectModalProps {
  currentLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'campaign' | 'custom'>('campaign');

  // Custom Dive State
  const [customN, setCustomN] = useState<number>(8);
  const [customOxygen, setCustomOxygen] = useState<number>(80);
  const [customNoise, setCustomNoise] = useState<boolean>(false);
  const [customPredators, setCustomPredators] = useState<number>(0);

  const handleStartCustom = () => {
    const customConfig: LevelConfig = {
      id: 99,
      title: 'EXPEDITION — CUSTOM ABYSS',
      subtitle: `Deep Research Field (N = ${customN})`,
      n: customN,
      depthMeters: 3000 + customN * 50,
      initialOxygen: customOxygen,
      oxygenDepletionRate: 0.4,
      callOxygenCost: 5,
      ambientCreatureCount: 16,
      predatorCount: customPredators,
      environmentalNoise: customNoise,
      narrativeIntro: `Custom simulation initialized with ${customN} candidate echo chambers. Balance acoustic pulses and listen when resonance peaks.`,
      narrativeSuccess: 'Custom field search completed with positive locator lock!',
      narrativeFailure: 'Signal lost in custom sector.',
      biomeColor: {
        bgTop: '#041d2d',
        bgBottom: '#010a14',
        ambientLight: '#38bdf8',
        nodeGlow: '#06b6d4',
      },
    };
    onSelectLevel(customConfig);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div className="max-w-2xl w-full bg-slate-900/95 border border-cyan-900/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] flex flex-col gap-6 text-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Ocean Sectors & Expeditions
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300 font-mono mt-0.5">
              Select campaign chapter or launch custom dive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-cyan-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5-Chapter Campaign</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-cyan-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Abyss Mode</span>
          </button>
        </div>

        {/* Campaign Chapters List */}
        {activeTab === 'campaign' && (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {CAMPAIGN_LEVELS.map(lvl => {
              const isCurrent = lvl.id === currentLevelId;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl)}
                  className={`group p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-cyan-800 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        CHAPTER {lvl.id}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">• {lvl.depthMeters}m</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {lvl.title.replace(/CHAPTER [IVX]+ — /, '')}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      N = {lvl.n} Locations • Initial O₂: {lvl.initialOxygen}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-xs font-mono font-semibold hidden sm:inline">DIVE</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Mode Configurator */}
        {activeTab === 'custom' && (
          <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            {/* Search Space Size N */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                SEARCH SPACE SIZE (N LOCATIONS)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 16, 32].map(nVal => (
                  <button
                    key={nVal}
                    onClick={() => setCustomN(nVal)}
                    className={`py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      customN === nVal
                        ? 'bg-cyan-600 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    N = {nVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Oxygen Supply Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-semibold uppercase">OXYGEN SUPPLY:</span>
                <span className="text-cyan-300 font-bold">{customOxygen}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={customOxygen}
                onChange={e => setCustomOxygen(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Environmental Decoys Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                FALSE ACOUSTIC DECOYS:
              </span>
              <button
                onClick={() => setCustomNoise(!customNoise)}
                className={`px-4 py-1.5 rounded-lg border font-mono text-xs font-semibold cursor-pointer transition-colors ${
                  customNoise
                    ? 'bg-cyan-600 border-cyan-400 text-slate-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {customNoise ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Hazards / Predators */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                ABYSSAL PREDATORS:
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(count => (
                  <button
                    key={count}
                    onClick={() => setCustomPredators(count)}
                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold cursor-pointer ${
                      customPredators === count
                        ? 'bg-cyan-600 border-cyan-400 text-slate-950'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {count === 0 ? 'None' : `${count}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartCustom}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>LAUNCH CUSTOM EXPEDITION</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
