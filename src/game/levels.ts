export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  n: number; // Search space size (4, 8, 16, 32)
  depthMeters: number;
  initialOxygen: number;
  oxygenDepletionRate: number; // oxygen lost per second
  callOxygenCost: number; // oxygen cost per pulse
  ambientCreatureCount: number;
  predatorCount: number;
  environmentalNoise: boolean; // whether false auditory/visual echoes occur
  narrativeIntro: string;
  narrativeSuccess: string;
  narrativeFailure: string;
  biomeColor: {
    bgTop: string;
    bgBottom: string;
    ambientLight: string;
    nodeGlow: string;
  };
}

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'CHAPTER I — THE FIRST ECHO',
    subtitle: 'Shallow Bioluminescent Shelf',
    n: 4,
    depthMeters: 180,
    initialOxygen: 100,
    oxygenDepletionRate: 0.25,
    callOxygenCost: 2,
    ambientCreatureCount: 8,
    predatorCount: 0,
    environmentalNoise: false,
    narrativeIntro: 'Your exploration partner Luma became separated during the trench descent. A faint bio-frequency lingers among 4 nearby seabed spires. Send echo pulses to amplify her signature.',
    narrativeSuccess: 'Signal matched! Luma’s locator lock engaged. You felt the echo surge into crystal resonance with just one focused pulse.',
    narrativeFailure: 'The frequency collapsed into empty reef. The signal was too dispersed. Let us re-calibrate.',
    biomeColor: {
      bgTop: '#041d2d',
      bgBottom: '#010a14',
      ambientLight: '#06b6d4',
      nodeGlow: '#38bdf8',
    },
  },
  {
    id: 2,
    title: 'CHAPTER II — THE DEEP',
    subtitle: 'Twilight Zone (Mesopelagic)',
    n: 8,
    depthMeters: 650,
    initialOxygen: 90,
    oxygenDepletionRate: 0.35,
    callOxygenCost: 4,
    ambientCreatureCount: 14,
    predatorCount: 0,
    environmentalNoise: false,
    narrativeIntro: 'Deeper in the twilight waters, 8 candidate caverns scatter her acoustic response. Each call draws substantial power from your life support. Find her before oxygen drops.',
    narrativeSuccess: 'Resonance achieved across the 8-node cluster! Luma’s life signature is secure.',
    narrativeFailure: 'Measurement yielded an inert salt chimney. The target probability wasn’t high enough at commit.',
    biomeColor: {
      bgTop: '#031424',
      bgBottom: '#00060d',
      ambientLight: '#3b82f6',
      nodeGlow: '#60a5fa',
    },
  },
  {
    id: 3,
    title: 'CHAPTER III — FALSE ECHOES',
    subtitle: 'Hydrothermal Vent Fields',
    n: 8,
    depthMeters: 1400,
    initialOxygen: 85,
    oxygenDepletionRate: 0.4,
    callOxygenCost: 5,
    ambientCreatureCount: 22,
    predatorCount: 1,
    environmentalNoise: true,
    narrativeIntro: 'Drifting pyrosomes and thermal vents generate acoustic decoys across the field. Observe how the true quantum constructive interference cuts through the background noise.',
    narrativeSuccess: 'Despite thermal shimmer and false bioluminescence, you timed the resonance threshold perfectly.',
    narrativeFailure: 'Decoy interference lured the sensor away. Re-align and listen for constructive harmonic build.',
    biomeColor: {
      bgTop: '#021020',
      bgBottom: '#020409',
      ambientLight: '#8b5cf6',
      nodeGlow: '#a78bfa',
    },
  },
  {
    id: 4,
    title: 'CHAPTER IV — THE RESONANCE',
    subtitle: 'Midnight Trench (Bathypelagic)',
    n: 16,
    depthMeters: 2800,
    initialOxygen: 80,
    oxygenDepletionRate: 0.45,
    callOxygenCost: 5,
    ambientCreatureCount: 18,
    predatorCount: 1,
    environmentalNoise: true,
    narrativeIntro: '16 candidate spires span the vast trench. Here, amplification reaches a razor-thin sweet spot around 3 pulses. Calling beyond this point will cause destructive interference and signal dispersion.',
    narrativeSuccess: 'Masterful intuition! You stopped precisely at the peak before overshooting the quantum envelope.',
    narrativeFailure: 'The echo dissipated or missed. Remember: calling too many times overshoots the amplitude peak and scatters the wave.',
    biomeColor: {
      bgTop: '#050c1e',
      bgBottom: '#010206',
      ambientLight: '#ec4899',
      nodeGlow: '#f472b6',
    },
  },
  {
    id: 5,
    title: 'CHAPTER V — THE ABYSS',
    subtitle: 'Hadal Rift (Final Descent)',
    n: 16,
    depthMeters: 4500,
    initialOxygen: 75,
    oxygenDepletionRate: 0.5,
    callOxygenCost: 6,
    ambientCreatureCount: 25,
    predatorCount: 2,
    environmentalNoise: true,
    narrativeIntro: 'The bottom of the alien ocean. Extreme pressure, crushing darkness, 16 deep anomalies, and an abyssal stalker hunting high-energy acoustic pulses. Balance signal amplification against predator awareness.',
    narrativeSuccess: 'Reunion complete! You locked onto Luma’s signal in the ultimate depths of the ocean. The quantum search is finished.',
    narrativeFailure: 'Oxygen critical or signal lost in the abyss. Re-dive and harmonize your pulses with care.',
    biomeColor: {
      bgTop: '#020612',
      bgBottom: '#000103',
      ambientLight: '#10b981',
      nodeGlow: '#34d399',
    },
  },
];
