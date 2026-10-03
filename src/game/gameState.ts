import { GroverSimulator } from '../quantum/grover';
import { MeasurementResult } from '../quantum/measurement';
import { LevelConfig, CAMPAIGN_LEVELS } from './levels';
import { WorldData, generateWorld, Bubble, AnomalyNode } from './proceduralGeneration';
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
  hitNodes: Set<number>;
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
  bubbles: Bubble[] = [];
  pulseCounter: number = 0;
  
  // Game stats for current run
  callsCount: number = 0;
  measurementResult: MeasurementResult | null = null;
  companionRescueAnimation: number = 0; // 0 to 1 progress
  
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
      lightConeAngle: Math.PI / 3.5,
      lightDistance: 320,
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
      lightConeAngle: Math.PI / 3.5,
      lightDistance: 320,
    };
    this.echoPulses = [];
    this.bubbles = [];
    this.callsCount = 0;
    this.measurementResult = null;
    this.companionRescueAnimation = 0;
    this.status = 'briefing';
    this.notify();
  }

  public startDive() {
    this.status = 'exploring';
    sound.startAmbient();
    this.notify();
  }

  /**
   * Action: CALL (Send Echo Pulse)
   * Corresponds directly to ONE Grover Amplitude Amplification iteration!
   */
  public call(): boolean {
    if (this.status !== 'exploring') return false;
    if (this.player.oxygen <= 0) return false;

    // Deduct oxygen cost
    this.player.oxygen = Math.max(0, this.player.oxygen - this.level.callOxygenCost);
    this.callsCount++;

    // Execute genuine Grover iteration
    this.grover.step();
    const targetProb = this.grover.getTargetProbability();
    const opt = this.grover.optimalIterations;
    const isPeak = this.grover.iterations === opt;
    const isOvershot = this.grover.iterations > opt;

    // Play procedural dynamic Web Audio sound
    sound.playEchoPulse(targetProb, isPeak, isOvershot);

    // Alert predators in vicinity
    this.world.predators.forEach(p => {
      p.aggroLevel = Math.min(1.0, p.aggroLevel + 0.35);
    });

    // Create expanding echo pulse wavefront
    const pulseColor = isPeak
      ? '#38bdf8'
      : isOvershot
      ? '#f43f5e'
      : '#06b6d4';

    this.echoPulses.push({
      id: ++this.pulseCounter,
      originX: this.player.x,
      originY: this.player.y,
      radius: 10,
      maxRadius: 1800,
      speed: 480, // pixels per second
      alpha: 1.0,
      color: pulseColor,
      targetProbability: targetProb,
      hitNodes: new Set<number>(),
    });

    // Emit burst of cavitation bubbles
    for (let i = 0; i < 12; i++) {
      this.bubbles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -0.8 - Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        alpha: 0.9,
        maxLife: 2.0,
        life: 0,
      });
    }

    if (this.player.oxygen <= 0) {
      this.status = 'failure';
    }

    this.notify();
    return true;
  }

  /**
   * Action: LISTEN (Commit & Quantum Measurement)
   * Triggers true quantum collapse according to state vector probabilities!
   */
  public listen(): MeasurementResult | null {
    if (this.status !== 'exploring') return null;

    this.status = 'listening_sequence';
    this.notify();

    // Perform genuine quantum measurement
    const result = this.grover.measure();
    this.measurementResult = result;

    // Mark measured node in world
    if (this.world.nodes[result.measuredIndex]) {
      this.world.nodes[result.measuredIndex].isMeasured = true;
    }

    // Play collapse sound
    sound.playMeasurementCollapse(result.isTarget);

    // Smooth transition from listening animation to outcome
    setTimeout(() => {
      if (result.isTarget) {
        this.status = 'success';
      } else {
        this.status = 'failure';
      }
      this.notify();
    }, 1400);

    return result;
  }

  /**
   * Updates game physics, movement, ocean life and particles
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

    // 2. Player navigation physics
    this.updatePlayer(dt);

    // 3. Update expanding echo pulses
    this.updateEchoPulses(dt);

    // 4. Update bubbles
    this.updateBubbles(dt);

    // 5. Update marine life & predators
    this.updateEcosystem(dt);

    // 6. Update marine snow
    this.world.marineSnow.forEach(flake => {
      flake.y += flake.speed * 60 * dt;
      if (flake.y > this.world.height) {
        flake.y = 0;
        flake.x = Math.random() * this.world.width;
      }
    });

    // 7. Companion rescue animation on success
    if (this.status === 'success' && this.companionRescueAnimation < 1.0) {
      this.companionRescueAnimation = Math.min(1.0, this.companionRescueAnimation + dt * 0.8);
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

    const acceleration = 340;
    const friction = 0.94;
    const maxSpeed = 220;

    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      this.player.vx += (moveX / len) * acceleration * dt;
      this.player.vy += (moveY / len) * acceleration * dt;

      const targetAngle = Math.atan2(moveY, moveX);
      // Smooth angle interpolation
      let angleDiff = targetAngle - this.player.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.player.angle += angleDiff * 6 * dt;

      // Spawn occasional thruster bubble
      if (Math.random() < 0.35) {
        this.bubbles.push({
          x: this.player.x - Math.cos(this.player.angle) * 22,
          y: this.player.y - Math.sin(this.player.angle) * 22,
          vx: -Math.cos(this.player.angle) * 1.5 + (Math.random() - 0.5),
          vy: -Math.sin(this.player.angle) * 1.5 - 0.5,
          size: 1.5 + Math.random() * 3,
          alpha: 0.7,
          maxLife: 1.2,
          life: 0,
        });
        if (Math.random() < 0.1) {
          sound.playThruster();
        }
      }
    }

    // Apply friction and speed clamp
    this.player.vx *= Math.pow(friction, dt * 60);
    this.player.vy *= Math.pow(friction, dt * 60);

    const speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > maxSpeed) {
      this.player.vx = (this.player.vx / speed) * maxSpeed;
      this.player.vy = (this.player.vy / speed) * maxSpeed;
    }

    this.player.x = Math.max(80, Math.min(this.world.width - 80, this.player.x + this.player.vx * dt));
    this.player.y = Math.max(80, Math.min(this.world.height - 80, this.player.y + this.player.vy * dt));
  }

  private updateEchoPulses(dt: number) {
    for (let i = this.echoPulses.length - 1; i >= 0; i--) {
      const pulse = this.echoPulses[i];
      pulse.radius += pulse.speed * dt;
      pulse.alpha = Math.max(0, 1 - (pulse.radius / pulse.maxRadius));

      // Check collision with anomaly nodes to trigger resonance flash
      this.world.nodes.forEach((node: AnomalyNode) => {
        if (!pulse.hitNodes.has(node.id)) {
          const dist = Math.hypot(node.x - pulse.originX, node.y - pulse.originY);
          if (Math.abs(dist - pulse.radius) < 30) {
            pulse.hitNodes.add(node.id);
            node.discovered = true;
            // Excitation effect: target node resonates brighter according to P(target)!
            node.pulsePhase = 0; // trigger immediate pulse shine
          }
        }
      });

      if (pulse.radius >= pulse.maxRadius || pulse.alpha <= 0) {
        this.echoPulses.splice(i, 1);
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
    // Roam creatures
    this.world.creatures.forEach(c => {
      c.x += c.vx * 60 * dt;
      c.y += c.vy * 60 * dt;
      c.pulsePhase += dt * (c.type === 'jellyfish' ? 2.5 : 1.5);

      // Bounce off boundaries gently
      if (c.x < 100 || c.x > this.world.width - 100) c.vx *= -1;
      if (c.y < 100 || c.y > this.world.height - 100) c.vy *= -1;
    });

    // Update predators
    this.world.predators.forEach(p => {
      // If aggro is elevated, slowly stalk toward player's last location
      if (p.aggroLevel > 0.3) {
        const dx = this.player.x - p.x;
        const dy = this.player.y - p.y;
        const dist = Math.hypot(dx, dy);
        const stalkSpeed = 65 * p.aggroLevel;

        if (dist > 180) {
          p.vx = (dx / dist) * stalkSpeed;
          p.vy = (dy / dist) * stalkSpeed;
          p.angle = Math.atan2(dy, dx);
        }
      } else {
        // Calm circular patrol
        p.angle += 0.4 * dt;
        p.vx = Math.cos(p.angle) * 30;
        p.vy = Math.sin(p.angle) * 20;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Aggro decays over time if player stops calling
      p.aggroLevel = Math.max(0, p.aggroLevel - dt * 0.04);
    });

    // Node ambient pulse
    this.world.nodes.forEach(n => {
      n.pulsePhase += dt * 2.0;
    });
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
