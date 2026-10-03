import React from 'react';

interface PhaseDialProps {
  phaseDeg: number;
  phaseSign: 1 | -1 | 0;
  amplitude: number;
  size?: number;
  label?: string;
}

export const PhaseDial: React.FC<PhaseDialProps> = ({
  phaseDeg,
  phaseSign,
  amplitude,
  size = 56,
  label
}) => {
  const isNegative = phaseSign === -1 || Math.abs(phaseDeg - 180) < 5;
  const isZero = Math.abs(amplitude) < 1e-4;

  const colorClass = isZero
    ? 'text-slate-600 border-slate-800'
    : isNegative
    ? 'text-amber-400 border-amber-500/50 bg-amber-500/10 glow-amber'
    : 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 glow-cyan';

  // Arrow angle in degrees: 0 deg points right (+1), 180 deg points left (-1)
  const angle = isZero ? 0 : phaseDeg;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ${colorClass}`}
        style={{ width: size, height: size }}
        title={`Phase: ${phaseDeg}°, Sign: ${phaseSign > 0 ? '+1' : phaseSign < 0 ? '-1' : '0'}`}
      >
        {/* Axis guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-px bg-current" />
          <div className="h-full w-px bg-current absolute" />
        </div>

        {/* Phase Arrow */}
        {!isZero && (
          <div
            className="absolute flex items-center justify-start origin-center transition-transform duration-500"
            style={{
              width: '80%',
              transform: `rotate(${-angle}deg)`
            }}
          >
            <div className="h-0.5 bg-current w-full flex items-center justify-end">
              <div className="w-2 h-2 border-t-2 border-r-2 border-current transform rotate-45" />
            </div>
          </div>
        )}

        {/* Sign Indicator badge in center */}
        <span className="text-xs font-mono font-bold z-10">
          {isZero ? '0' : isNegative ? '−' : '+'}
        </span>
      </div>

      {label && (
        <span className="text-[11px] font-mono text-slate-400 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
