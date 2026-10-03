export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  n: number; // Search space size (8, 16, 32)
  depthMeters: number;
  initialOxygen: number;
  oxygenDepletionRate: number; // oxygen lost per second
  callOxygenCost: number; // oxygen cost per pulse
  ambientCreatureCount: number;
  narrativeIntro: string;
  narrativeSuccess: string;
  narrativeFailure: string;
  biomeColor: {
    bgTop: string;
    bgBottom: string;
    ambientLight: string;
    waterFog: string;
  };
}

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'LEVEL 1 — SUPERPOSITION & RESONANCE',
    subtitle: 'Shallow Bioluminescent Shelf (8 Candidate Locations)',
    n: 8,
    depthMeters: 180,
    initialOxygen: 100,
    oxygenDepletionRate: 0.2,
    callOxygenCost: 3,
    ambientCreatureCount: 16,
    narrativeIntro:
      'Your partner Luma is separated in the deep. Faint bio-frequencies linger among 8 candidate seabed spires (12.5% baseline probability each). Send pulses to amplify her wave before committing to LISTEN.',
    narrativeSuccess:
      'Quantum state collapsed onto target! Luma’s bio-beacon answered the measurement.',
    narrativeFailure:
      'The measurement collapsed onto an empty decoy spire. Recalibrate and observe the resonance sweet spot.',
    biomeColor: {
      bgTop: '#041d33',
      bgBottom: '#010d1c',
      ambientLight: '#0ea5e9',
      waterFog: 'rgba(4, 29, 51, 0.85)',
    },
  },
  {
    id: 2,
    title: 'LEVEL 2 — ORACLE & ANOMALY',
    subtitle: 'Mesopelagic Cavern Grid (8 Candidate Locations)',
    n: 8,
    depthMeters: 650,
    initialOxygen: 90,
    oxygenDepletionRate: 0.28,
    callOxygenCost: 4,
    ambientCreatureCount: 18,
    narrativeIntro:
      'In the cavern field, a hidden phase inversion marks Luma’s true location. Listen carefully: each pulse drives constructive interference toward a sweet spot around 2 pulses. Calling further will scatter the wave.',
    narrativeSuccess:
      'The marked phase converged into high-probability collapse! Luma is safe.',
    narrativeFailure:
      'Measurement collapsed onto an inert cavern. The target amplitude was not high enough at commit.',
    biomeColor: {
      bgTop: '#03172c',
      bgBottom: '#010916',
      ambientLight: '#38bdf8',
      waterFog: 'rgba(3, 23, 44, 0.88)',
    },
  },
  {
    id: 3,
    title: 'LEVEL 3 — AMPLIFICATION SPEEDUP',
    subtitle: 'Bathypelagic Trench (16 Candidate Locations)',
    n: 16,
    depthMeters: 1400,
    initialOxygen: 85,
    oxygenDepletionRate: 0.35,
    callOxygenCost: 4,
    ambientCreatureCount: 22,
    narrativeIntro:
      '16 candidate spires span the trench. Notice the quadratic speedup: instead of checking 16 locations one by one, constructive interference reaches ~96% peak in just 3 pulses. Recognize the peak harmony, then LISTEN.',
    narrativeSuccess:
      'Amplification threshold achieved in 3 pulses! The quantum search locked onto Luma.',
    narrativeFailure:
      'The wave was either measured prematurely or overshot past the peak.',
    biomeColor: {
      bgTop: '#021124',
      bgBottom: '#010612',
      ambientLight: '#818cf8',
      waterFog: 'rgba(2, 17, 36, 0.90)',
    },
  },
  {
    id: 4,
    title: 'LEVEL 4 — OVERSHOOT & THE ABYSS',
    subtitle: 'Midnight Abyss (32 Candidate Locations)',
    n: 32,
    depthMeters: 2800,
    initialOxygen: 80,
    oxygenDepletionRate: 0.4,
    callOxygenCost: 5,
    ambientCreatureCount: 25,
    narrativeIntro:
      '32 candidate spires in the vast abyss. Baseline is only ~3%. Around 4 pulses, amplitude reaches maximum (~97%). Beyond 4 pulses, destructive interference degrades the signal. Trust your ears and eyes.',
    narrativeSuccess:
      'Masterful intuition! You measured at the exact peak of quantum resonance before overshooting.',
    narrativeFailure:
      'The probability overshot the peak or was measured with low probability.',
    biomeColor: {
      bgTop: '#020b1c',
      bgBottom: '#01040e',
      ambientLight: '#a855f7',
      waterFog: 'rgba(2, 11, 28, 0.92)',
    },
  },
];
