import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { GameEngine } from './gameState';
import { CAMPAIGN_LEVELS, LevelConfig } from './levels';
import { OceanView } from '../components/OceanView';
import { HUD } from '../components/HUD';
import { BriefingModal } from '../components/BriefingModal';
import { OutcomeModal } from '../components/OutcomeModal';
import { QuantumReplay } from '../components/QuantumReplay';
import { LevelSelectModal } from '../components/LevelSelectModal';
import { sound } from '../audio/sound';

export const Game: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(CAMPAIGN_LEVELS[0]);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isReplayOpen, setIsReplayOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());
  const [, setRenderTrigger] = useState<number>(0);

  // Initialize GameEngine instance
  const engine = useMemo(() => {
    return new GameEngine(currentLevel);
  }, [currentLevel]);

  // Hook engine state change to React updates
  useEffect(() => {
    engine.onStateChange = () => {
      setRenderTrigger(prev => prev + 1);
    };
  }, [engine]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if typing or in modal that isn't game
      if (isReplayOpen || isLevelSelectOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (engine.status === 'exploring') {
          engine.call();
        }
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        if (engine.status === 'exploring') {
          engine.listen();
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        engine.keys[e.code] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        engine.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, isReplayOpen, isLevelSelectOpen]);

  const handleStartDive = useCallback(() => {
    engine.startDive();
  }, [engine]);

  const handleCall = useCallback(() => {
    engine.call();
  }, [engine]);

  const handleListen = useCallback(() => {
    engine.listen();
  }, [engine]);

  const handleNextLevel = useCallback(() => {
    const nextIdx = (levelIndex + 1) % CAMPAIGN_LEVELS.length;
    setLevelIndex(nextIdx);
    setCurrentLevel(CAMPAIGN_LEVELS[nextIdx]);
    engine.setLevel(CAMPAIGN_LEVELS[nextIdx]);
  }, [levelIndex, engine]);

  const handleRetry = useCallback(() => {
    engine.setLevel(currentLevel);
  }, [engine, currentLevel]);

  const handleSelectLevel = useCallback((lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    engine.setLevel(lvl);
    setIsLevelSelectOpen(false);
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#01040a]">
      {/* Real-time HTML5 Canvas Ocean Renderer */}
      <OceanView engine={engine} />

      {/* Main Underwater Exploration HUD */}
      <HUD
        engine={engine}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onCall={handleCall}
        onListen={handleListen}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
      />

      {/* Level Briefing Modal */}
      {engine.status === 'briefing' && (
        <BriefingModal level={engine.level} onStartDive={handleStartDive} />
      )}

      {/* Outcome / Measurement Collapse Modal */}
      {(engine.status === 'success' || engine.status === 'failure') && (
        <OutcomeModal
          engine={engine}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          onOpenReplay={() => setIsReplayOpen(true)}
        />
      )}

      {/* Quantum Replay / Echo Analysis Debrief */}
      {isReplayOpen && (
        <QuantumReplay engine={engine} onClose={() => setIsReplayOpen(false)} />
      )}

      {/* Level / Sector Select Modal */}
      {isLevelSelectOpen && (
        <LevelSelectModal
          currentLevelId={currentLevel.id}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}
    </div>
  );
};
