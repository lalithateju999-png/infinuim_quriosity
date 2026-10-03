import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Atom, ChevronRight } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Term {
  title: string;
  category: string;
  simpleExplanation: string;
  mathExplanation: string;
}

const GLOSSARY_TERMS: Term[] = [
  {
    title: 'Qubit (Quantum Bit)',
    category: 'Foundations',
    simpleExplanation: 'Unlike a regular switch that is strictly ON (1) or OFF (0), a qubit can be in a blend of both states at once until it is inspected.',
    mathExplanation: '|ψ⟩ = α|0⟩ + β|1⟩, where α, β ∈ ℂ and |α|² + |β|² = 1.'
  },
  {
    title: 'Superposition',
    category: 'Foundations',
    simpleExplanation: 'A physical state where multiple computational basis states coexist as simultaneous wave amplitudes.',
    mathExplanation: 'For n qubits: |+⟩^(⊗n) = (1/√2ⁿ) ∑_{x ∈ {0,1}ⁿ} |x⟩.'
  },
  {
    title: 'Hadamard Gate (H)',
    category: 'Gates',
    simpleExplanation: 'The gateway between certainty and superposition. Applying H to |0⟩ creates (+, +) in-phase superposition. Applying H to |1⟩ creates (+, −) with a 180° inverted phase!',
    mathExplanation: 'H = (1/√2) [[1, 1], [1, -1]]. H|0⟩ = |+⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = |−⟩ = (|0⟩−|1⟩)/√2.'
  },
  {
    title: 'Ancilla Target Qubit',
    category: 'Hardware',
    simpleExplanation: 'An auxiliary qubit that is prepared in the |−⟩ state. Its sole purpose is to capture the Oracle’s bit flip and reflect it as a phase kickback onto the main register.',
    mathExplanation: 'Initial target: |1⟩ —[H]→ |−⟩ = (|0⟩ − |1⟩)/√2.'
  },
  {
    title: 'Phase Kickback',
    category: 'Core Phenomenon',
    simpleExplanation: 'The secret engine of quantum speedup! When the target qubit is in |−⟩, evaluating the Oracle flips the wave direction of the input qubit without collapsing its superposition.',
    mathExplanation: 'U_f(|x⟩|−⟩) = |x⟩ (|0 ⊕ f(x)⟩ − |1 ⊕ f(x)⟩)/√2 = (−1)^f(x) |x⟩|−⟩.'
  },
  {
    title: 'Interference',
    category: 'Core Phenomenon',
    simpleExplanation: 'Waves that are in-phase reinforce each other (constructive), while waves that are out-of-phase cancel each other out (destructive).',
    mathExplanation: 'After final H^(⊗n), the amplitude of |00...0⟩ is α₀ = (1/2ⁿ) ∑_{x} (−1)^f(x).'
  },
  {
    title: 'Constant vs Balanced',
    category: 'The Promise Problem',
    simpleExplanation: 'Constant: f(x) gives the same output for all inputs. Balanced: f(x) outputs 0 for exactly half the inputs, and 1 for the other half.',
    mathExplanation: 'If constant: ∑ (−1)^f(x) = ±2ⁿ ⇒ P(|0...0⟩) = 1. If balanced: ∑ (−1)^f(x) = 0 ⇒ P(|0...0⟩) = 0.'
  }
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [showAdvancedMath, setShowAdvancedMath] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Foundations', 'Gates', 'Core Phenomenon', 'The Promise Problem'];

  const filteredTerms = selectedCategory === 'All'
    ? GLOSSARY_TERMS
    : GLOSSARY_TERMS.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Quantum Guide & Dirac Formulary
              </h2>
              <p className="text-xs text-slate-400">
                Concepts simplified for high school & first-principles intuition
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Math Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAdvancedMath}
              onChange={(e) => setShowAdvancedMath(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
            />
            <span>Show Dirac Bra-Ket Math</span>
          </label>
        </div>

        {/* Terms list */}
        <div className="space-y-3">
          {filteredTerms.map((t) => (
            <div
              key={t.title}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-cyan-300">
                  {t.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {t.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {t.simpleExplanation}
              </p>

              {showAdvancedMath && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-cyan-950 font-mono text-xs text-cyan-300">
                  <span className="text-slate-500 text-[10px] block mb-0.5 uppercase tracking-wider">Exact Dirac Notation:</span>
                  {t.mathExplanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
