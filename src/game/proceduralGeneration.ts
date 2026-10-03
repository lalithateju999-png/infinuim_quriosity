import { LevelConfig } from './levels';

export interface Vector2D {
  x: number;
  y: number;
}

export interface AnomalyNode {
  id: number;
  x: number;
  y: number;
  label: string; // Faint alphanumeric marker (e.g., "LOC-01", "LOC-02")
  baseRadius: number;
  pulsePhase: number;
  isMeasured: boolean;
  discovered: boolean;
  type: 'crystal' | 'vent' | 'coral' | 'ancient_monolith';
}

export interface Creature {
  id: number;
  type: 'jellyfish' | 'manta' | 'biolum_fish';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulsePhase: number;
  hue: number;
  tentaclePhases?: number[];
}

export interface Predator {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aggroLevel: number; // 0 to 1
  patrolCenter: Vector2D;
  patrolRadius: number;
  angle: number;
}

export interface Bubble {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export interface MarineSnow {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export interface WorldData {
  width: number;
  height: number;
  playerStart: Vector2D;
  searchCenter: Vector2D;
  searchRadius: number;
  nodes: AnomalyNode[];
  targetIndex: number;
  creatures: Creature[];
  predators: Predator[];
  marineSnow: MarineSnow[];
}

export function generateWorld(level: LevelConfig): WorldData {
  const width = 3200;
  const height = 2400;

  const playerStart: Vector2D = { x: 500, y: 1200 };
  const searchCenter: Vector2D = { x: 1800, y: 1200 };
  const searchRadius = 750;

  // Pick random hidden target location among N
  const targetIndex = Math.floor(Math.random() * level.n);

  // Distribute N anomaly nodes in organic clusters around the search area
  const nodes: AnomalyNode[] = [];
  const nodeTypes: ('crystal' | 'vent' | 'coral' | 'ancient_monolith')[] = [
    'crystal',
    'vent',
    'coral',
    'ancient_monolith',
  ];

  const angleStep = (Math.PI * 2) / level.n;
  for (let i = 0; i < level.n; i++) {
    // Add organic jitter to radius and angle so they feel natural
    const angle = i * angleStep + (Math.random() - 0.5) * 0.4;
    const dist = searchRadius * (0.55 + Math.random() * 0.4);

    const nx = searchCenter.x + Math.cos(angle) * dist;
    const ny = searchCenter.y + Math.sin(angle) * dist;

    nodes.push({
      id: i,
      x: Math.max(200, Math.min(width - 200, nx)),
      y: Math.max(200, Math.min(height - 200, ny)),
      label: `LOC-${(i + 1).toString().padStart(2, '0')}`,
      baseRadius: 28,
      pulsePhase: Math.random() * Math.PI * 2,
      isMeasured: false,
      discovered: false,
      type: nodeTypes[i % nodeTypes.length],
    });
  }

  // Generate ambient creatures
  const creatures: Creature[] = [];
  for (let i = 0; i < level.ambientCreatureCount; i++) {
    const isManta = i % 4 === 0;
    const isJelly = i % 2 === 0;
    const type = isManta ? 'manta' : isJelly ? 'jellyfish' : 'biolum_fish';

    creatures.push({
      id: i,
      type,
      x: 200 + Math.random() * (width - 400),
      y: 200 + Math.random() * (height - 400),
      vx: (Math.random() - 0.5) * (type === 'manta' ? 1.2 : 0.4),
      vy: (Math.random() - 0.5) * (type === 'manta' ? 0.6 : 0.3),
      size: type === 'manta' ? 45 : type === 'jellyfish' ? 22 : 12,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: Math.floor(Math.random() * 60) + (level.id === 3 ? 270 : 180),
      tentaclePhases: Array.from({ length: 5 }, () => Math.random() * Math.PI * 2),
    });
  }

  // Generate predators if configured for chapter
  const predators: Predator[] = [];
  for (let i = 0; i < level.predatorCount; i++) {
    predators.push({
      id: i,
      x: searchCenter.x + (Math.random() - 0.5) * 800,
      y: searchCenter.y + (Math.random() - 0.5) * 800,
      vx: 0,
      vy: 0,
      aggroLevel: 0,
      patrolCenter: { x: searchCenter.x + (i - 0.5) * 400, y: searchCenter.y },
      patrolRadius: 400,
      angle: Math.random() * Math.PI * 2,
    });
  }

  // Generate floating marine snow particles
  const marineSnow: MarineSnow[] = [];
  for (let i = 0; i < 200; i++) {
    marineSnow.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.5,
      speed: 0.2 + Math.random() * 0.5,
      alpha: 0.15 + Math.random() * 0.4,
    });
  }

  return {
    width,
    height,
    playerStart,
    searchCenter,
    searchRadius,
    nodes,
    targetIndex,
    creatures,
    predators,
    marineSnow,
  };
}
