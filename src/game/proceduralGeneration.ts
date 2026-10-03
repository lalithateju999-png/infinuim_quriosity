import { LevelConfig } from './levels';

export interface Vector2D {
  x: number;
  y: number;
}

export interface RockFormation {
  x: number;
  y: number;
  radius: number;
  points: Vector2D[];
  hue: number;
  hasClefts: boolean;
}

export interface CaveArch {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  innerGlowHue: number;
}

export interface BioPlant {
  x: number;
  y: number;
  type: 'kelp' | 'anemone' | 'spore_tendril';
  height: number;
  swayPhase: number;
  swaySpeed: number;
  hue: number;
  resonanceEnergy: number; // 0 to 1, boosts when echo pulse hits
}

export interface AlienCoral {
  x: number;
  y: number;
  type: 'branch' | 'fan' | 'spire';
  size: number;
  hue: number;
  glowIntensity: number;
  branches: { length: number; angle: number }[];
}

export interface DistantStructure {
  x: number;
  y: number;
  type: 'monolith' | 'ancient_spire' | 'arch';
  width: number;
  height: number;
  alpha: number;
}

export type SeaLifeType =
  | 'glowing_fish'
  | 'jellyfish'
  | 'alien_fish'
  | 'squid'
  | 'giant_whale'
  | 'alien_shrimp'
  | 'ray'
  | 'plankton';

export interface Creature {
  id: number;
  type: SeaLifeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulsePhase: number;
  hue: number;
  angle: number;
  targetVx?: number;
  targetVy?: number;
  fleeTimer?: number;
}

export interface PlanktonParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulsePhase: number;
  hue: number;
}

export interface AnomalyLocation {
  id: number;
  x: number;
  y: number;
  discovered: boolean;
  isMeasured: boolean;
  featureName: string;
  geologyType: 'crystal_chimney' | 'cavern_crevice' | 'coral_spire' | 'abyssal_vent';
  pulsePhase: number;
  resonanceExcitation: number; // 0 to 1 excitation on echo hit
}

export interface WorldData {
  width: number;
  height: number;
  playerStart: Vector2D;
  searchCenter: Vector2D;
  searchRadius: number;
  locations: AnomalyLocation[];
  targetIndex: number;
  creatures: Creature[];
  plankton: PlanktonParticle[];
  rocks: RockFormation[];
  caves: CaveArch[];
  plants: BioPlant[];
  corals: AlienCoral[];
  distantStructures: DistantStructure[];
}

export function generateWorld(level: LevelConfig): WorldData {
  const width = 3600;
  const height = 2800;

  const playerStart: Vector2D = { x: 600, y: 1400 };
  const searchCenter: Vector2D = { x: 2000, y: 1400 };
  const searchRadius = 850;

  // Pick true hidden target index among 0..N-1
  const targetIndex = Math.floor(Math.random() * level.n);

  // 1. Generate N Candidate Geological Locations (No debug balls or lines)
  const locations: AnomalyLocation[] = [];
  const geologyTypes: ('crystal_chimney' | 'cavern_crevice' | 'coral_spire' | 'abyssal_vent')[] = [
    'crystal_chimney',
    'coral_spire',
    'cavern_crevice',
    'abyssal_vent',
  ];

  const angleStep = (Math.PI * 2) / level.n;
  for (let i = 0; i < level.n; i++) {
    const angle = i * angleStep + (Math.random() - 0.5) * 0.35;
    const dist = searchRadius * (0.65 + Math.random() * 0.35);

    const nx = Math.max(250, Math.min(width - 250, searchCenter.x + Math.cos(angle) * dist));
    const ny = Math.max(250, Math.min(height - 250, searchCenter.y + Math.sin(angle) * dist));

    locations.push({
      id: i,
      x: nx,
      y: ny,
      discovered: false,
      isMeasured: false,
      featureName: `Location ${i + 1}`,
      geologyType: geologyTypes[i % geologyTypes.length],
      pulsePhase: Math.random() * Math.PI * 2,
      resonanceExcitation: 0,
    });
  }

  // 2. Generate Sea Life (Strictly ONLY allowed animal types, sparse & atmospheric)
  const creatures: Creature[] = [];
  let creatureId = 0;

  // Giant whale-like creature: Rare (1 solitary leviathan drifting in background)
  creatures.push({
    id: ++creatureId,
    type: 'giant_whale',
    x: 1200 + Math.random() * 1000,
    y: 400 + Math.random() * 1600,
    vx: (Math.random() > 0.5 ? 1 : -1) * 0.22,
    vy: (Math.random() - 0.5) * 0.08,
    size: 140,
    pulsePhase: Math.random() * Math.PI * 2,
    hue: 195,
    angle: 0,
  });

  // Jellyfish (sparse: 6-10)
  for (let i = 0; i < 7; i++) {
    creatures.push({
      id: ++creatureId,
      type: 'jellyfish',
      x: 300 + Math.random() * (width - 600),
      y: 200 + Math.random() * (height - 400),
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.25 - Math.random() * 0.25,
      size: 18 + Math.random() * 14,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.4 ? 185 : 280,
      angle: 0,
    });
  }

  // Rays / Manta-like creatures (sparse: 2-3)
  for (let i = 0; i < 3; i++) {
    const vx = (Math.random() - 0.5) * 0.9;
    const vy = (Math.random() - 0.5) * 0.4;
    creatures.push({
      id: ++creatureId,
      type: 'ray',
      x: 400 + Math.random() * (width - 800),
      y: 300 + Math.random() * (height - 600),
      vx,
      vy,
      size: 38 + Math.random() * 16,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: 200,
      angle: Math.atan2(vy, vx),
    });
  }

  // Squids (sparse: 3-4)
  for (let i = 0; i < 4; i++) {
    const vx = (Math.random() - 0.5) * 0.7;
    const vy = (Math.random() - 0.5) * 0.5;
    creatures.push({
      id: ++creatureId,
      type: 'squid',
      x: 300 + Math.random() * (width - 600),
      y: 300 + Math.random() * (height - 600),
      vx,
      vy,
      size: 16 + Math.random() * 8,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: 175,
      angle: Math.atan2(vy, vx),
    });
  }

  // Glowing Fish (small schools / pairs: ~12)
  for (let i = 0; i < 12; i++) {
    const vx = (Math.random() - 0.5) * 0.8;
    const vy = (Math.random() - 0.5) * 0.4;
    creatures.push({
      id: ++creatureId,
      type: 'glowing_fish',
      x: 200 + Math.random() * (width - 400),
      y: 200 + Math.random() * (height - 400),
      vx,
      vy,
      size: 7 + Math.random() * 5,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? 190 : 160,
      angle: Math.atan2(vy, vx),
    });
  }

  // Alien Fish (sleek bioluminescent fish: ~8)
  for (let i = 0; i < 8; i++) {
    const vx = (Math.random() - 0.5) * 1.1;
    const vy = (Math.random() - 0.5) * 0.5;
    creatures.push({
      id: ++creatureId,
      type: 'alien_fish',
      x: 300 + Math.random() * (width - 600),
      y: 300 + Math.random() * (height - 600),
      vx,
      vy,
      size: 14 + Math.random() * 8,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: 215,
      angle: Math.atan2(vy, vx),
    });
  }

  // Alien Shrimp (attached/scuttling near geological features: ~10)
  for (let i = 0; i < 10; i++) {
    creatures.push({
      id: ++creatureId,
      type: 'alien_shrimp',
      x: 200 + Math.random() * (width - 400),
      y: 300 + Math.random() * (height - 400),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: 6 + Math.random() * 4,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: 140,
      angle: 0,
    });
  }

  // 3. Generate Plankton / Tiny Glowing Organisms (Marine Snow)
  const plankton: PlanktonParticle[] = [];
  for (let i = 0; i < 280; i++) {
    const alpha = 0.12 + Math.random() * 0.35;
    plankton.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.0 + Math.random() * 2.2,
      alpha,
      baseAlpha: alpha,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 0.15 + Math.random() * 0.35,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.3 ? 185 : 155,
    });
  }

  // 4. Generate Rocks & Boulders
  const rocks: RockFormation[] = [];
  for (let i = 0; i < 35; i++) {
    const rx = 100 + Math.random() * (width - 200);
    const ry = 100 + Math.random() * (height - 200);
    const baseRadius = 35 + Math.random() * 75;
    const vertexCount = 7 + Math.floor(Math.random() * 5);
    const points: Vector2D[] = [];

    for (let v = 0; v < vertexCount; v++) {
      const angle = (v / vertexCount) * Math.PI * 2;
      const r = baseRadius * (0.75 + Math.random() * 0.5);
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    rocks.push({
      x: rx,
      y: ry,
      radius: baseRadius,
      points,
      hue: 205 + Math.floor(Math.random() * 25),
      hasClefts: Math.random() > 0.4,
    });
  }

  // 5. Generate Caves & Cavern Crevices
  const caves: CaveArch[] = [];
  for (let i = 0; i < 12; i++) {
    caves.push({
      x: 300 + Math.random() * (width - 600),
      y: 300 + Math.random() * (height - 600),
      radiusX: 70 + Math.random() * 60,
      radiusY: 50 + Math.random() * 40,
      rotation: (Math.random() - 0.5) * 0.8,
      innerGlowHue: Math.random() > 0.5 ? 190 : 220,
    });
  }

  // 6. Generate Bioluminescent Plants (Alien kelp, anemones, spore tendrils)
  const plants: BioPlant[] = [];
  for (let i = 0; i < 70; i++) {
    const type: 'kelp' | 'anemone' | 'spore_tendril' =
      i % 3 === 0 ? 'kelp' : i % 3 === 1 ? 'anemone' : 'spore_tendril';
    plants.push({
      x: 100 + Math.random() * (width - 200),
      y: 100 + Math.random() * (height - 200),
      type,
      height: type === 'kelp' ? 70 + Math.random() * 60 : 30 + Math.random() * 25,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.8 + Math.random() * 1.2,
      hue: type === 'kelp' ? 170 : type === 'anemone' ? 195 : 280,
      resonanceEnergy: 0,
    });
  }

  // 7. Generate Alien Reef / Coral
  const corals: AlienCoral[] = [];
  for (let i = 0; i < 40; i++) {
    const type: 'branch' | 'fan' | 'spire' =
      i % 3 === 0 ? 'branch' : i % 3 === 1 ? 'fan' : 'spire';
    const branches: { length: number; angle: number }[] = [];
    const count = 4 + Math.floor(Math.random() * 5);
    for (let b = 0; b < count; b++) {
      branches.push({
        length: 15 + Math.random() * 25,
        angle: -Math.PI / 2 + (b - count / 2) * 0.35 + (Math.random() - 0.5) * 0.2,
      });
    }

    corals.push({
      x: 150 + Math.random() * (width - 300),
      y: 150 + Math.random() * (height - 300),
      type,
      size: 25 + Math.random() * 35,
      hue: 180 + Math.floor(Math.random() * 50),
      glowIntensity: 0.2 + Math.random() * 0.4,
      branches,
    });
  }

  // 8. Distant Faint Structures (Ancient spires immersed in deep fog)
  const distantStructures: DistantStructure[] = [];
  for (let i = 0; i < 8; i++) {
    distantStructures.push({
      x: 300 + Math.random() * (width - 600),
      y: 200 + Math.random() * (height - 400),
      type: i % 2 === 0 ? 'ancient_spire' : 'monolith',
      width: 45 + Math.random() * 30,
      height: 180 + Math.random() * 140,
      alpha: 0.08 + Math.random() * 0.08, // very faint silhouette in dark ocean
    });
  }

  return {
    width,
    height,
    playerStart,
    searchCenter,
    searchRadius,
    locations,
    targetIndex,
    creatures,
    plankton,
    rocks,
    caves,
    plants,
    corals,
    distantStructures,
  };
}
