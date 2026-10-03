import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  // BUG 2 FIX: Engine held in a stable ref — never recreated by React.
  // setLevel() is always used to switch levels without breaking the ref.
  const engineRef = useRef<GameEngine>(new GameEngine(CAMPAIGN_LEVELS[0]));
  const engine = engineRef.current;

  // Hook engine state change to React updates
  useEffect(() => {
    engine.onStateChange = () => {
      setRenderTrigger(prev => prev + 1);
    };
    return () => {
      engine.onStateChange = undefined;
    };
  }, [engine]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // BUG 3 FIX: Clamp to last level instead of wrapping, show campaign complete state
  const handleNextLevel = useCallback(() => {
    const nextIdx = Math.min(levelIndex + 1, CAMPAIGN_LEVELS.length - 1);
    const nextLevel = CAMPAIGN_LEVELS[nextIdx];
    setLevelIndex(nextIdx);
    setCurrentLevel(nextLevel);
    engine.setLevel(nextLevel);
  }, [levelIndex, engine]);

  const handleRetry = useCallback(() => {
    engine.setLevel(currentLevel);
  }, [engine, currentLevel]);

  const handleSelectLevel = useCallback((lvl: LevelConfig) => {
    const idx = CAMPAIGN_LEVELS.findIndex(l => l.id === lvl.id);
    if (idx !== -1) setLevelIndex(idx);
    setCurrentLevel(lvl);
    engine.setLevel(lvl);
    setIsLevelSelectOpen(false);
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  const isLastLevel = levelIndex >= CAMPAIGN_LEVELS.length - 1;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#01040a]">
      <OceanView engine={engine} />

      <HUD
        engine={engine}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onCall={handleCall}
        onListen={handleListen}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
      />

      {engine.status === 'briefing' && (
        <BriefingModal level={engine.level} onStartDive={handleStartDive} />
      )}

      {(engine.status === 'success' || engine.status === 'failure') && (
        <OutcomeModal
          engine={engine}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          onOpenReplay={() => setIsReplayOpen(true)}
          isLastLevel={isLastLevel}
        />
      )}

      {isReplayOpen && (
        <QuantumReplay engine={engine} onClose={() => setIsReplayOpen(false)} />
      )}

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
