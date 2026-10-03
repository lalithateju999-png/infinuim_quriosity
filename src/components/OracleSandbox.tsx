import React, { useState } from 'react';
import { Sparkles, Cpu, Play, RotateCcw, Check, AlertCircle, Layers, Waves, Eye } from 'lucide-react';
import { PredefinedOracles, OracleDefinition, generateTruthTable, analyzeOracleKind } from '../quantum/oracle';
import { runDeutschJozsaSimulation, AlgorithmStage, StageSnapshot } from '../quantum/deutschJozsa';
import { StepProgressTracker } from './StepProgressTracker';
import { WaveformDisplay } from './WaveformDisplay';
import { sound } from '../audio/sound';

export const OracleSandbox: React.FC = () => {
  const [numQubits, setNumQubits] = useState<1 | 2 | 3>(2);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('2q-bal-xor');
  
  // Custom truth table state: e.g. { '00': 0, '01': 1, '10': 1, '11': 0 }
  const [customTable, setCustomTable] = useState<Record<string, 0 | 1>>(() => {
    return generateTruthTable(2, (x) => (((x >> 1) ^ (x & 1)) ? 1 : 0));
  });

  const [currentStage, setCurrentStage] = useState<AlgorithmStage>('INIT');

  // Build active oracle definition
  const activeOracle: OracleDefinition = React.useMemo(() => {
    const kind = analyzeOracleKind(customTable);
    return {
      id: 'sandbox-custom',
      name: `Custom ${numQubits}-Qubit Oracle`,
      description: `Evaluates custom truth table for ${1 << numQubits} inputs.`,
      numInputQubits: numQubits,
      kind: kind === 'constant' ? 'constant' : 'balanced',
      fn: (x: number) => {
        const bitStr = x.toString(2).padStart(numQubits, '0');
        return customTable[bitStr] ?? 0;
      },
      truthTable: customTable
    };
  }, [numQubits, customTable]);

  const oracleAnalysis = analyzeOracleKind(customTable);
  const isValidPromise = oracleAnalysis === 'constant' || oracleAnalysis === 'balanced';

  // Run simulation
  const execution = React.useMemo(() => {
    return runDeutschJozsaSimulation(activeOracle);
  }, [activeOracle]);

  const stageSnapshots: Record<AlgorithmStage, StageSnapshot> = {
    INIT: execution.snapshots[0],
    SUPERPOSITION: execution.snapshots[1],
    ORACLE: execution.snapshots[2],
    INTERFERENCE: execution.snapshots[3],
    MEASUREMENT: execution.snapshots[4]
  };

  const activeSnapshot = stageSnapshots[currentStage];

  const handleToggleBit = (bitstring: string) => {
    sound.playGateClick(500);
    setCustomTable((prev) => ({
      ...prev,
      [bitstring]: (prev[bitstring] === 1 ? 0 : 1) as 0 | 1
    }));
  };

  const handleSelectPreset = (oracleKey: string) => {
    sound.playGateClick(400);
    const def = PredefinedOracles[oracleKey];
    if (def) {
      setSelectedPresetId(oracleKey);
      setNumQubits(def.numInputQubits as 1 | 2 | 3);
      setCustomTable({ ...def.truthTable });
    }
  };

  const handleSelectQubitsCount = (n: 1 | 2 | 3) => {
    sound.playGateClick(350);
    setNumQubits(n);
    // default to constant 0
    const count = 1 << n;
    const newT: Record<string, 0 | 1> = {};
    for (let i = 0; i < count; i++) {
      newT[i.toString(2).padStart(n, '0')] = 0;
    }
    setCustomTable(newT);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-400 font-bold uppercase">
                Sandbox Mode
              </span>
              <span className="text-xs font-mono text-slate-400">
                Arbitrary Oracle Designer & Quantum Inspector
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Quantum Oracle Laboratory
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Design any boolean truth table, inspect the full <span className="text-cyan-400 font-semibold">2ⁿ⁺¹ State Vector</span>, and watch Phase Kickback and Interference evolve step-by-step.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Input Register Size:</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleSelectQubitsCount(n as 1 | 2 | 3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                  numQubits === n
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 glow-cyan'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {n} Qubit{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preset Oracles bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-mono text-slate-400 shrink-0">Presets:</span>
        {Object.values(PredefinedOracles)
          .filter((o) => o.numInputQubits === numQubits)
          .map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelectPreset(o.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border shrink-0 transition ${
                selectedPresetId === o.id
                  ? 'bg-purple-950/70 border-purple-500 text-purple-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {o.name}
            </button>
          ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Truth Table Editor */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Oracle Truth Table f(x)
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              oracleAnalysis === 'constant'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : oracleAnalysis === 'balanced'
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-rose-950 border-rose-500 text-rose-300'
            }`}>
              {oracleAnalysis.toUpperCase()}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Click on any output value <span className="font-mono text-cyan-300">f(x)</span> to flip between 0 and 1:
          </div>

          {/* Truth Table Grid */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {Object.entries(customTable).map(([bitStr, val]) => (
              <div
                key={bitStr}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs"
              >
                <span className="text-slate-300">Input |{bitStr}⟩:</span>
                <button
                  type="button"
                  onClick={() => handleToggleBit(bitStr)}
                  className={`w-12 py-1 rounded text-center font-bold border transition ${
                    val === 1
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 glow-amber'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              </div>
            ))}
          </div>

          {!isValidPromise && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-[11px] text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Deutsch-Jozsa is promised on <strong>Constant</strong> or <strong>Balanced</strong> functions. Adjust the table so either all bits are equal or exactly half are 1s.
              </span>
            </div>
          )}

          {/* Classical Query Comparison Stats */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400 text-[11px] uppercase">Query Complexity:</div>
            <div className="flex justify-between text-slate-300">
              <span>Classical Worst-Case:</span>
              <span className="text-amber-400 font-bold">{execution.classicalRequiredQueries.worstCase} queries</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Quantum Deutsch-Jozsa:</span>
              <span className="text-cyan-400 font-bold">1 query (100% exact)</span>
            </div>
          </div>
        </div>

        {/* Right: Quantum State Inspector */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
          {/* Interactive Step Navigator */}
          <StepProgressTracker
            currentStage={currentStage}
            onSelectStage={(stage) => {
              sound.playGateClick(450);
              setCurrentStage(stage);
            }}
            interactive={true}
          />

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {activeSnapshot.title}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{activeSnapshot.description}</p>
            </div>
            <div className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-purple-300">
              Target Ancilla: {activeSnapshot.ancillaStateName}
            </div>
          </div>

          {/* Waveform Components View */}
          <WaveformDisplay
            components={activeSnapshot.inputRegisterAmplitudes.map((a) => ({
              label: a.inputBits,
              amplitude: a.realAmp,
              probability: a.probability,
              phaseSign: a.phaseSign,
              phaseDeg: a.phaseDeg,
              fx: a.fx
            }))}
            showOraclesFx={currentStage !== 'INIT' && currentStage !== 'SUPERPOSITION'}
          />

          {/* Full Dirac State Vector Formula */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-slate-500 uppercase text-[10px] block mb-1">Full (n+1) Joint State Vector:</span>
            <div className="text-cyan-300 break-all">
              |Ψ⟩ = {activeSnapshot.stateVector.toDiracNotation()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
