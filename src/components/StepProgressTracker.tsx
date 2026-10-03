import React from 'react';
import { Sparkles, Cpu, Eye, Waves, Layers } from 'lucide-react';
import { AlgorithmStage } from '../quantum/deutschJozsa';

interface StepProgressTrackerProps {
  currentStage: AlgorithmStage;
  onSelectStage?: (stage: AlgorithmStage) => void;
  interactive?: boolean;
}

const STAGES: {
  id: AlgorithmStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { id: 'INIT', label: '1. PREPARE', icon: Layers, description: 'Ground state registers' },
  { id: 'SUPERPOSITION', label: '2. SUPERPOSITION', icon: Sparkles, description: 'Hadamard H^(⊗n)' },
  { id: 'ORACLE', label: '3. ORACLE (U_f)', icon: Cpu, description: 'Phase Kickback (-1)^f(x)' },
  { id: 'INTERFERENCE', label: '4. INTERFERENCE', icon: Waves, description: 'Final Hadamard' },
  { id: 'MEASUREMENT', label: '5. MEASURE', icon: Eye, description: 'Constant vs Balanced' },
];

export const StepProgressTracker: React.FC<StepProgressTrackerProps> = ({
  currentStage,
  onSelectStage,
  interactive = false
}) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        {STAGES.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onSelectStage?.(step.id)}
                className={`flex-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 ${
                  isCurrent
                    ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-200 glow-cyan font-semibold'
                    : isPassed
                    ? 'bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-950/40 border border-slate-900 text-slate-500 opacity-60'
                } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-mono tracking-wide">{step.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{step.description}</div>
                </div>
              </button>

              {idx < STAGES.length - 1 && (
                <div className="hidden md:block text-slate-600 font-mono text-xs">
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
