import { GroverSimulator } from '../quantum/grover';
import { MeasurementResult } from '../quantum/measurement';
import { LevelConfig, CAMPAIGN_LEVELS } from './levels';
import { WorldData, generateWorld, AnomalyLocation, Creature, BioPlant } from './proceduralGeneration';
import { sound } from '../audio/sound';

export interface EchoPulse {
  id: number;
  originX: number;
  originY: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
  targetProbability: number;
  hitLocations: Set<number>;
}

export interface CavitationBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export interface CompanionBlinkState {
  delayTimer: number; // counts down ~2.4s before blink starts
  isBlinking: boolean;
  blinkDuration: number; // total duration of the brief glimpse
  blinkElapsed: number;
  targetProbability: number;
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  oxygen: number;
  maxOxygen: number;
  isMoving: boolean;
  lightConeAngle: number;
  lightDistance: number;
}

export type GameStatus =
  | 'menu'
  | 'briefing'
  | 'exploring'
  | 'listening_sequence'
  | 'success'
  | 'failure'
  | 'replay_analysis';

export class GameEngine {
  level: LevelConfig;
  world: WorldData;
  grover: GroverSimulator;
  player: PlayerState;
  status: GameStatus = 'briefing';

  // Dynamic visual/audio effects
  echoPulses: EchoPulse[] = [];
  bubbles: CavitationBubble[] = [];
  pulseCounter: number = 0;

  // Delayed Companion Blink queue
  pendingBlinks: CompanionBlinkState[] = [];

  // Game stats for current run
  callsCount: number = 0;
  measurementResult: MeasurementResult | null = null;
  companionRescueAnimation: number = 0; // 0 to 1 progress on success

  // Per-call target probability history (drives the resonance history display)
  signalHistory: number[] = [];

  // Input keys
  keys: { [key: string]: boolean } = {};

  // Callbacks for UI updates
  onStateChange?: () => void;

  constructor(level: LevelConfig = CAMPAIGN_LEVELS[0]) {
    this.level = level;
    this.world = generateWorld(level);
    this.grover = new GroverSimulator(level.n, this.world.targetIndex);

    this.player = {
      x: this.world.playerStart.x,
      y: this.world.playerStart.y,
      vx: 0,
      vy: 0,
      angle: 0,
      oxygen: level.initialOxygen,
      maxOxygen: level.initialOxygen,
      isMoving: false,
      lightConeAngle: Math.PI / 2.6, // ~69 degree wide searchlight beam
      lightDistance: 520, // Extended range illumination
    };
  }

  public setLevel(level: LevelConfig) {
    this.level = level;
    this.world = generateWorld(level);
    this.grover = new GroverSimulator(level.n, this.world.targetIndex);
    this.player = {
      x: this.world.playerStart.x,
      y: this.world.playerStart.y,
      vx: 0,
      vy: 0,
      angle: 0,
      oxygen: level.initialOxygen,
      maxOxygen: level.initialOxygen,
      isMoving: false,
      lightConeAngle: Math.PI / 2.6,
      lightDistance: 520,
    };
    this.echoPulses = [];
    this.bubbles = [];
    this.pendingBlinks = [];
    this.callsCount = 0;
    this.measurementResult = null;
    this.companionRescueAnimation = 0;
    this.signalHistory = [];
    this.status = 'briefing';
    this.notify();
  }

  public startDive() {
    this.status = 'exploring';
    sound.startAmbient();
    this.notify();
  }

  /**
   * Action: CALL
   * Real Grover iteration → expanding acoustic ripple → environmental reaction →
   * wait ~2.3s → brief companion glimpse fades in & out.
   */
  public call(): boolean {
    if (this.status !== 'exploring') return false;
    // BUG 5 FIX: check oxygen BEFORE deducting — prevents running Grover step on an already-dead run
    if (this.player.oxygen <= 0) {
      this.status = 'failure';
      this.notify();
      return false;
    }

    // 1. Deduct oxygen cost
    this.player.oxygen = Math.max(0, this.player.oxygen - this.level.callOxygenCost);
    this.callsCount++;

    // 2. Execute genuine Grover iteration
    this.grover.step();
    const targetProb = this.grover.getTargetProbability();
    const opt = this.grover.optimalIterations;
    const isPeak = this.grover.iterations === opt;
    const isOvershot = this.grover.iterations > opt;

    // Record real probability for resonance history display
    this.signalHistory.push(targetProb);

    // 3. Play dynamic Web Audio sonar ping derived from real quantum probability
    sound.playEchoPulse(targetProb, isPeak, isOvershot);

    // 4. Create expanding underwater pressure ripple
    const pulseColor = isPeak
      ? '#38bdf8'
      : isOvershot
      ? '#f43f5e'
      : '#06b6d4';

    this.echoPulses.push({
      id: ++this.pulseCounter,
      originX: this.player.x,
      originY: this.player.y,
      radius: 12,
      maxRadius: 2200,
      speed: 520,
      alpha: 1.0,
      color: pulseColor,
      targetProbability: targetProb,
      hitLocations: new Set<number>(),
    });

    // 5. Environmental reaction: creatures react, plants sway, cavitation bubbles burst
    this.triggerEnvironmentalPulseReaction();

    // 6. Schedule delayed companion blink: wait ~2.3 seconds before glimpse appears
    // BUG 7 FIX: only allow 1 pending blink at a time — prevents golden pulse stacking from rapid CALL presses
    const targetLoc = this.world.locations[this.world.targetIndex];
    if (targetLoc && this.pendingBlinks.length === 0) {
      const blinkDuration = 0.8 + Math.min(1, targetProb) * 0.8;
      this.pendingBlinks.push({
        delayTimer: 2.3,
        isBlinking: false,
        blinkDuration,
        blinkElapsed: 0,
        targetProbability: targetProb,
        x: targetLoc.x,
        y: targetLoc.y,
      });
    }

    // Check oxygen depletion after this call
    if (this.player.oxygen <= 0) {
      this.status = 'failure';
    }

    this.notify();
    return true;
  }

  private triggerEnvironmentalPulseReaction() {
    // Spawn cavitation bubbles at player thruster / hull
    for (let i = 0; i < 14; i++) {
      this.bubbles.push({
        x: this.player.x + (Math.random() - 0.5) * 24,
        y: this.player.y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -0.8 - Math.random() * 2.0,
        size: 2 + Math.random() * 4,
        alpha: 0.9,
        maxLife: 1.8,
        life: 0,
      });
    }

    // Nearby fish and squid flinch and gently dart away
    this.world.creatures.forEach((c: Creature) => {
      const dist = Math.hypot(c.x - this.player.x, c.y - this.player.y);
      if (dist < 800) {
        const dx = c.x - this.player.x;
        const dy = c.y - this.player.y;
        const angle = Math.atan2(dy, dx);
        const impulse = Math.max(0.5, 2.0 - dist / 400);
        c.vx += Math.cos(angle) * impulse;
        c.vy += Math.sin(angle) * impulse;
        c.fleeTimer = 1.5;
      }
    });

    // Nearby plants resonate
    this.world.plants.forEach((p: BioPlant) => {
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < 900) {
        p.resonanceEnergy = Math.min(1.0, p.resonanceEnergy + 0.8);
      }
    });
  }

  /**
   * Action: LISTEN
   * Quantum measurement according to statevector probabilities!
   * BUG 4 FIX: guarded against double-invocation via status check — status switches to
   * 'listening_sequence' immediately so a second call() or listen() before setTimeout
   * resolves is rejected by the status guard at the top.
   */
  public listen(): MeasurementResult | null {
    if (this.status !== 'exploring') return null;

    // Immediately lock status so no second call can slip through
    this.status = 'listening_sequence';
    this.notify();

    // Perform genuine quantum measurement
    const result = this.grover.measure();
    this.measurementResult = result;

    // Mark measured location in world
    if (this.world.locations[result.measuredIndex]) {
      this.world.locations[result.measuredIndex].isMeasured = true;
    }

    // Play collapse sound
    sound.playMeasurementCollapse(result.isTarget);

    setTimeout(() => {
      if (result.isTarget) {
        this.status = 'success';
      } else {
        this.status = 'failure';
      }
      this.notify();
    }, 1300);

    return result;
  }

  /**
   * Main game loop update
   */
  public update(dt: number) {
    if (this.status === 'menu' || this.status === 'briefing' || this.status === 'replay_analysis') {
      return;
    }

    // 1. Oxygen consumption
    if (this.status === 'exploring') {
      this.player.oxygen = Math.max(0, this.player.oxygen - this.level.oxygenDepletionRate * dt);
      if (this.player.oxygen <= 0) {
        this.status = 'failure';
        this.notify();
        return;
      }
    }

    // 2. Player movement
    this.updatePlayer(dt);

    // 3. Update expanding pulses & environmental resonance
    this.updateEchoPulses(dt);

    // 4. Update delayed companion blinks
    this.updatePendingBlinks(dt);

    // 5. Update marine life
    this.updateEcosystem(dt);

    // 6. Update bubbles
    this.updateBubbles(dt);

    // 7. Update plankton
    this.world.plankton.forEach(p => {
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.pulsePhase += dt * 1.5;
      if (p.y > this.world.height) {
        p.y = 0;
        p.x = Math.random() * this.world.width;
      }
      if (p.x < 0) p.x = this.world.width;
      if (p.x > this.world.width) p.x = 0;
    });

    // 8. Companion rescue animation on success
    if (this.status === 'success' && this.companionRescueAnimation < 1.0) {
      this.companionRescueAnimation = Math.min(1.0, this.companionRescueAnimation + dt * 0.7);
    }
  }

  private updatePlayer(dt: number) {
    let moveX = 0;
    let moveY = 0;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += 1;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;

    const isMoving = moveX !== 0 || moveY !== 0;
    this.player.isMoving = isMoving;

    const acceleration = 360;
    const friction = 0.94;
    const maxSpeed = 230;

    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      this.player.vx += (moveX / len) * acceleration * dt;
      this.player.vy += (moveY / len) * acceleration * dt;

      const targetAngle = Math.atan2(moveY, moveX);
      let angleDiff = targetAngle - this.player.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.player.angle += angleDiff * 6 * dt;

      if (Math.random() < 0.35) {
        this.bubbles.push({
          x: this.player.x - Math.cos(this.player.angle) * 22,
          y: this.player.y - Math.sin(this.player.angle) * 22,
          vx: -Math.cos(this.player.angle) * 1.5 + (Math.random() - 0.5),
          vy: -Math.sin(this.player.angle) * 1.5 - 0.5,
          size: 1.5 + Math.random() * 3,
          alpha: 0.75,
          maxLife: 1.2,
          life: 0,
        });
        if (Math.random() < 0.08) {
          sound.playThruster();
        }
      }
    }

    this.player.vx *= Math.pow(friction, dt * 60);
    this.player.vy *= Math.pow(friction, dt * 60);

    const speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > maxSpeed) {
      this.player.vx = (this.player.vx / speed) * maxSpeed;
      this.player.vy = (this.player.vy / speed) * maxSpeed;
    }

    this.player.x = Math.max(90, Math.min(this.world.width - 90, this.player.x + this.player.vx * dt));
    this.player.y = Math.max(90, Math.min(this.world.height - 90, this.player.y + this.player.vy * dt));
  }

  private updateEchoPulses(dt: number) {
    for (let i = this.echoPulses.length - 1; i >= 0; i--) {
      const pulse = this.echoPulses[i];
      pulse.radius += pulse.speed * dt;
      pulse.alpha = Math.max(0, 1 - pulse.radius / pulse.maxRadius);

      // Check collision with geological locations
      this.world.locations.forEach((loc: AnomalyLocation) => {
        if (!pulse.hitLocations.has(loc.id)) {
          const dist = Math.hypot(loc.x - pulse.originX, loc.y - pulse.originY);
          if (Math.abs(dist - pulse.radius) < 35) {
            pulse.hitLocations.add(loc.id);
            loc.discovered = true;
            loc.resonanceExcitation = 1.0;
          }
        }
      });

      if (pulse.radius >= pulse.maxRadius || pulse.alpha <= 0) {
        this.echoPulses.splice(i, 1);
      }
    }
  }

  private updatePendingBlinks(dt: number) {
    for (let i = this.pendingBlinks.length - 1; i >= 0; i--) {
      const blink = this.pendingBlinks[i];

      if (!blink.isBlinking) {
        blink.delayTimer -= dt;
        if (blink.delayTimer <= 0) {
          // Delay elapsed! Start brief glimpse and play bio-response chime
          blink.isBlinking = true;
          sound.playCompanionBlink(blink.targetProbability);

          // Spawn radiating golden return echo wave travelling from Luma's location through the water
          this.echoPulses.push({
            id: ++this.pulseCounter,
            originX: blink.x,
            originY: blink.y,
            radius: 12,
            maxRadius: 2800,
            speed: 640,
            alpha: 1.0,
            color: '#facc15',
            targetProbability: blink.targetProbability,
            hitLocations: new Set<number>(),
          });

          // Excite target spire's resonance
          if (this.world.locations[this.world.targetIndex]) {
            this.world.locations[this.world.targetIndex].resonanceExcitation = 1.0;
          }
        }
      } else {
        blink.blinkElapsed += dt;
        if (blink.blinkElapsed >= blink.blinkDuration) {
          // Finished glimpse, remove
          this.pendingBlinks.splice(i, 1);
        }
      }
    }
  }

  private updateBubbles(dt: number) {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.x += b.vx * dt * 30;
      b.y += b.vy * dt * 45;
      b.life += dt;
      b.alpha = Math.max(0, 1 - b.life / b.maxLife);
      if (b.life >= b.maxLife) {
        this.bubbles.splice(i, 1);
      }
    }
  }

  private updateEcosystem(dt: number) {
    // Update plants decay of excitation
    this.world.plants.forEach(p => {
      p.swayPhase += dt * p.swaySpeed;
      if (p.resonanceEnergy > 0) {
        p.resonanceEnergy = Math.max(0, p.resonanceEnergy - dt * 0.6);
      }
    });

    // Update location excitation decay
    this.world.locations.forEach(loc => {
      loc.pulsePhase += dt * 1.8;
      if (loc.resonanceExcitation > 0) {
        loc.resonanceExcitation = Math.max(0, loc.resonanceExcitation - dt * 0.5);
      }
    });

    // Update creatures
    this.world.creatures.forEach(c => {
      if (c.fleeTimer && c.fleeTimer > 0) {
        c.fleeTimer -= dt;
      } else {
        // Gently return velocity to roaming speed
        const speed = Math.hypot(c.vx, c.vy);
        const normalSpeed =
          c.type === 'giant_whale'
            ? 0.22
            : c.type === 'ray'
            ? 0.9
            : c.type === 'squid'
            ? 0.7
            : c.type === 'alien_fish'
            ? 1.0
            : c.type === 'glowing_fish'
            ? 0.7
            : 0.3;
        if (speed > normalSpeed * 1.5) {
          c.vx *= Math.pow(0.96, dt * 60);
          c.vy *= Math.pow(0.96, dt * 60);
        }
      }

      c.x += c.vx * 60 * dt;
      c.y += c.vy * 60 * dt;
      c.pulsePhase += dt * (c.type === 'jellyfish' ? 2.2 : 1.4);

      if (c.type === 'ray' || c.type === 'squid' || c.type === 'alien_fish' || c.type === 'glowing_fish') {
        c.angle = Math.atan2(c.vy, c.vx);
      }

      // BUG 6 FIX: clamp position AND flip velocity so creatures never jitter outside the wall
      if (c.x < 120) { c.x = 120; c.vx = Math.abs(c.vx); }
      if (c.x > this.world.width - 120) { c.x = this.world.width - 120; c.vx = -Math.abs(c.vx); }
      if (c.y < 120) { c.y = 120; c.vy = Math.abs(c.vy); }
      if (c.y > this.world.height - 120) { c.y = this.world.height - 120; c.vy = -Math.abs(c.vy); }
    });
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
