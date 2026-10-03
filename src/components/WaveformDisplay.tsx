import React from 'react';
import { PhaseDial } from './PhaseDial';

export interface WaveComponent {
  label: string;
  amplitude: number;
  probability: number;
  phaseSign: 1 | -1 | 0;
  phaseDeg: number;
  fx?: 0 | 1;
}

interface WaveformDisplayProps {
  components: WaveComponent[];
  title?: string;
  subtitle?: string;
  showOraclesFx?: boolean;
  highlightIndex?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  components,
  title,
  subtitle,
  showOraclesFx = false,
  highlightIndex
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm shadow-xl">
      {(title || subtitle) && (
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            {title && <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              +Phase (0°)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              −Phase (180°)
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {components.map((c, idx) => {
          const isHighlighted = highlightIndex === idx;
          const isNeg = c.phaseSign === -1;
          const isZero = Math.abs(c.probability) < 0.001;

          return (
            <div
              key={c.label}
              className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isHighlighted
                  ? 'border-cyan-400 bg-cyan-950/40 glow-cyan ring-1 ring-cyan-400'
                  : isZero
                  ? 'border-slate-800/60 bg-slate-950/40 opacity-40'
                  : isNeg
                  ? 'border-amber-500/30 bg-amber-950/20'
                  : 'border-cyan-500/30 bg-cyan-950/20'
              }`}
            >
              <div className="text-xs font-mono font-semibold text-slate-300 mb-1">
                |{c.label}⟩
              </div>

              {/* Phase dial */}
              <div className="my-1">
                <PhaseDial
                  phaseDeg={c.phaseDeg}
                  phaseSign={c.phaseSign}
                  amplitude={c.amplitude}
                  size={46}
                />
              </div>

              {/* Amplitude & Probability Bars */}
              <div className="w-full mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Amp</span>
                  <span className={isNeg ? 'text-amber-400 font-bold' : isZero ? 'text-slate-600' : 'text-cyan-400 font-bold'}>
                    {c.amplitude > 0 ? `+${c.amplitude.toFixed(3)}` : c.amplitude.toFixed(3)}
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isZero
                        ? 'bg-slate-700'
                        : isNeg
                        ? 'bg-amber-400 glow-amber'
                        : 'bg-cyan-400 glow-cyan'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(c.probability * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Prob</span>
                  <span className="text-slate-200">
                    {(c.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Oracle function tag if applicable */}
              {showOraclesFx && c.fx !== undefined && (
                <div className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  f({c.label}) = <span className="font-bold text-amber-300">{c.fx}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
