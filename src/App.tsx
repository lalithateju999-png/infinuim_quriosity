import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Level1ProbeDiscover } from './components/Level1ProbeDiscover';
import { Level2OracleIntro } from './components/Level2OracleIntro';
import { Level3PhaseKickback } from './components/Level3PhaseKickback';
import { Level4Interference } from './components/Level4Interference';
import { Level5VaultChallenge } from './components/Level5VaultChallenge';
import { OracleSandbox } from './components/OracleSandbox';
import { ClassicalComparisonModal } from './components/ClassicalComparisonModal';
import { GlossaryModal } from './components/GlossaryModal';

export function App() {
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [isClassicalModalOpen, setIsClassicalModalOpen] = useState<boolean>(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState<boolean>(false);

  const handleLevelComplete = (nextLevel: number) => {
    setCurrentLevelId(nextLevel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLevel = () => {
    setResetCounter((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <Navbar
        currentLevelId={currentLevelId}
        onSelectLevel={(lvl) => setCurrentLevelId(lvl)}
        onOpenClassicalRace={() => setIsClassicalModalOpen(true)}
        onOpenGlossary={() => setIsGlossaryModalOpen(true)}
        onResetLevel={handleResetLevel}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div key={`${currentLevelId}-${resetCounter}`}>
          {currentLevelId === 1 && (
            <Level1ProbeDiscover onCompleteLevel={() => handleLevelComplete(2)} />
          )}

          {currentLevelId === 2 && (
            <Level2OracleIntro onCompleteLevel={() => handleLevelComplete(3)} />
          )}

          {currentLevelId === 3 && (
            <Level3PhaseKickback onCompleteLevel={() => handleLevelComplete(4)} />
          )}

          {currentLevelId === 4 && (
            <Level4Interference onCompleteLevel={() => handleLevelComplete(5)} />
          )}

          {currentLevelId === 5 && (
            <Level5VaultChallenge onOpenSandbox={() => handleLevelComplete(6)} />
          )}

          {currentLevelId === 6 && (
            <OracleSandbox />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for <strong className="text-slate-300">Quriosity Hackathon 2026</strong> • ISAQC IIIT Hyderabad
          </div>
          <div className="text-slate-400">
            Option 2: Deutsch–Jozsa (The Parity Oracle)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClassicalComparisonModal
        isOpen={isClassicalModalOpen}
        onClose={() => setIsClassicalModalOpen(false)}
      />

      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
      />
    </div>
  );
}

export default App;
