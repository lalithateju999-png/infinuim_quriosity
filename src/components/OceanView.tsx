import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/gameState';
import {
  WorldData,
  Creature,
  RockFormation,
  CaveArch,
  BioPlant,
  AlienCoral,
  DistantStructure,
  PlanktonParticle,
  AnomalyLocation,
} from '../game/proceduralGeneration';

interface OceanViewProps {
  engine: GameEngine;
}

export const OceanView: React.FC<OceanViewProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // BUG 8 FIX: cache the offscreen mask canvas — never allocate inside the animation loop
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    // Create the persistent offscreen mask canvas once
    maskCanvasRef.current = document.createElement('canvas');

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      engine.update(dt);

      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (canvas && maskCanvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawDarkOceanScene(ctx, canvas.width, canvas.height, engine, maskCanvas);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = window.innerWidth;
        maskCanvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block bg-[#010408] cursor-crosshair select-none"
    />
  );
};

/**
 * Main Atmospheric Dark Ocean Render Pipeline
 */
function drawDarkOceanScene(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  engine: GameEngine,
  maskCanvas: HTMLCanvasElement   // BUG 8 FIX: cached mask canvas passed from component
) {
  const { player, world, echoPulses, bubbles, level, pendingBlinks, status } = engine;

  // Smooth camera tracking centered on player
  const cameraX = Math.max(0, Math.min(world.width - viewWidth, player.x - viewWidth / 2));
  const cameraY = Math.max(0, Math.min(world.height - viewHeight, player.y - viewHeight / 2));

  ctx.save();
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  // 1. Deep Abyssal Base Gradient (Extremely dark ocean)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
  bgGrad.addColorStop(0, level.biomeColor.bgTop);
  bgGrad.addColorStop(1, level.biomeColor.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  // World coordinate space transformation
  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // 2. Distant Deep Silhouettes
  drawDistantLayer(ctx, world, cameraX, cameraY, viewWidth, viewHeight);

  // 3. Environment: Caves, Rocks, Corals, Bioluminescent Plants
  drawEnvironmentGeology(ctx, world, cameraX, cameraY, viewWidth, viewHeight);

  // 4. Candidate Locations (Natural geological spires/vents, NO debug primitives)
  drawGeologicalLocations(ctx, world.locations, cameraX, cameraY, viewWidth, viewHeight);

  // 5. Marine Life
  drawSeaLife(ctx, world.creatures, cameraX, cameraY, viewWidth, viewHeight);

  // 6. Plankton & Marine Snow Particles
  drawPlankton(ctx, world.plankton, cameraX, cameraY, viewWidth, viewHeight);

  // 7. Expanding Underwater Acoustic Ripple Waves
  echoPulses.forEach(pulse => {
    drawAcousticWave(ctx, pulse);
  });

  // 8. Delayed Companion Bio-Blink (Brief glimpse 2-3s after CALL)
  // BUG 9 FIX: pass cameraX/Y so the function can compute screen coords correctly
  drawCompanionBlinkGlimpse(ctx, pendingBlinks, cameraX, cameraY, viewWidth, viewHeight);

  // 9. Cavitation Bubbles
  drawBubbles(ctx, bubbles);

  // 10. Player Submarine
  drawPlayerSubmarine(ctx, player);

  // 11. Companion Vessel if measurement succeeded
  if (status === 'success' && world.locations[world.targetIndex]) {
    drawRescuedCompanion(
      ctx,
      world.locations[world.targetIndex],
      engine.companionRescueAnimation
    );
  }

  // 12. Quantum Measurement Collapse Sequence Animation
  if (status === 'listening_sequence' && engine.measurementResult) {
    drawQuantumCollapseSequence(ctx, world, engine.measurementResult);
  }

  // Restore camera transform
  ctx.restore();

  // 13. Dynamic Torch & Darkness Mask (uses cached maskCanvas — no allocation)
  drawTorchDarknessMask(ctx, viewWidth, viewHeight, player, cameraX, cameraY, echoPulses, pendingBlinks, maskCanvas);

  // 14. Cinematic Vignette
  drawCinematicVignette(ctx, viewWidth, viewHeight);

  ctx.restore();
}

/**
 * Distant Deep Background (Whale / Leviathan, ancient spires, deep fog)
 */
function drawDistantLayer(
  ctx: CanvasRenderingContext2D,
  world: WorldData,
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  // Distant monoliths and spires
  world.distantStructures.forEach((struct: DistantStructure) => {
    if (
      struct.x + struct.width < camX - 100 ||
      struct.x > camX + w + 100 ||
      struct.y + struct.height < camY - 100 ||
      struct.y > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.fillStyle = `rgba(3, 14, 28, ${struct.alpha})`;
    ctx.strokeStyle = `rgba(6, 182, 212, ${struct.alpha * 0.4})`;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(struct.x - struct.width / 2, struct.y + struct.height);
    ctx.lineTo(struct.x - struct.width * 0.3, struct.y);
    ctx.lineTo(struct.x + struct.width * 0.3, struct.y);
    ctx.lineTo(struct.x + struct.width / 2, struct.y + struct.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  // Distant Giant Whale / Leviathan (rare, slow, majestic)
  const whale = world.creatures.find(c => c.type === 'giant_whale');
  if (whale) {
    if (
      whale.x + whale.size * 2 >= camX - 300 &&
      whale.x - whale.size * 2 <= camX + w + 300 &&
      whale.y + whale.size >= camY - 200 &&
      whale.y - whale.size <= camY + h + 200
    ) {
      ctx.save();
      ctx.translate(whale.x, whale.y);
      const isFacingRight = whale.vx >= 0;
      if (!isFacingRight) ctx.scale(-1, 1);

      // Deep water silhouette with faint bioluminescent ridges
      ctx.fillStyle = 'rgba(2, 10, 22, 0.65)';
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.25)';
      ctx.lineWidth = 2;

      // Whale Body
      ctx.beginPath();
      ctx.moveTo(-whale.size * 0.9, 0);
      ctx.bezierCurveTo(
        -whale.size * 0.5,
        -whale.size * 0.45,
        whale.size * 0.4,
        -whale.size * 0.4,
        whale.size * 0.95,
        0
      );
      ctx.bezierCurveTo(
        whale.size * 0.5,
        whale.size * 0.35,
        -whale.size * 0.4,
        whale.size * 0.35,
        -whale.size * 0.9,
        0
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fluke / Tail
      const tailWave = Math.sin(whale.pulsePhase * 0.8) * 12;
      ctx.beginPath();
      ctx.moveTo(-whale.size * 0.9, 0);
      ctx.lineTo(-whale.size * 1.25, -whale.size * 0.3 + tailWave);
      ctx.lineTo(-whale.size * 1.15, 0);
      ctx.lineTo(-whale.size * 1.25, whale.size * 0.3 + tailWave);
      ctx.closePath();
      ctx.fillStyle = 'rgba(2, 10, 22, 0.6)';
      ctx.fill();

      // Faint bioluminescent flank markings
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 + 0.05 * Math.sin(whale.pulsePhase)})`;
      ctx.lineWidth = 1.5;
      for (let r = -whale.size * 0.4; r <= whale.size * 0.5; r += 26) {
        ctx.beginPath();
        ctx.moveTo(r, -whale.size * 0.15);
        ctx.lineTo(r - 8, whale.size * 0.1);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

/**
 * Environment Geology (Caves, Rocks, Corals, Bioluminescent Plants)
 */
function drawEnvironmentGeology(
  ctx: CanvasRenderingContext2D,
  world: WorldData,
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  // 1. Caves & Deep Crevices
  world.caves.forEach((cave: CaveArch) => {
    if (
      cave.x + cave.radiusX < camX - 100 ||
      cave.x - cave.radiusX > camX + w + 100 ||
      cave.y + cave.radiusY < camY - 100 ||
      cave.y - cave.radiusY > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.translate(cave.x, cave.y);
    ctx.rotate(cave.rotation);

    // Deep cave darkness
    const caveGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, cave.radiusX);
    caveGrad.addColorStop(0, 'rgba(0, 2, 4, 0.98)');
    caveGrad.addColorStop(0.7, 'rgba(1, 5, 12, 0.85)');
    caveGrad.addColorStop(1, 'rgba(2, 12, 24, 0)');

    ctx.fillStyle = caveGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, cave.radiusX, cave.radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle bio-rim on cave edge
    ctx.strokeStyle = 'rgba(14, 116, 144, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  });

  // 2. Rocks & Boulders
  world.rocks.forEach((rock: RockFormation) => {
    if (
      rock.x + rock.radius < camX - 100 ||
      rock.x - rock.radius > camX + w + 100 ||
      rock.y + rock.radius < camY - 100 ||
      rock.y - rock.radius > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.translate(rock.x, rock.y);

    ctx.fillStyle = '#07121e';
    ctx.strokeStyle = 'rgba(30, 58, 86, 0.6)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    rock.points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rock striations / cracks
    if (rock.hasClefts) {
      ctx.strokeStyle = 'rgba(8, 28, 48, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-rock.radius * 0.4, -rock.radius * 0.3);
      ctx.lineTo(rock.radius * 0.1, rock.radius * 0.2);
      ctx.lineTo(rock.radius * 0.5, rock.radius * 0.1);
      ctx.stroke();
    }

    ctx.restore();
  });

  // 3. Alien Reef & Coral Formations
  world.corals.forEach((coral: AlienCoral) => {
    if (
      coral.x + coral.size < camX - 100 ||
      coral.x - coral.size > camX + w + 100 ||
      coral.y + coral.size < camY - 100 ||
      coral.y - coral.size > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.translate(coral.x, coral.y);

    // Coral soft glow
    const coralGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, coral.size * 1.4);
    coralGlow.addColorStop(0, `hsla(${coral.hue}, 80%, 65%, ${coral.glowIntensity * 0.4})`);
    coralGlow.addColorStop(1, `hsla(${coral.hue}, 80%, 50%, 0)`);
    ctx.fillStyle = coralGlow;
    ctx.beginPath();
    ctx.arc(0, 0, coral.size * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Coral Branches
    ctx.strokeStyle = `hsla(${coral.hue}, 70%, 55%, 0.75)`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    coral.branches.forEach(branch => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const bx = Math.cos(branch.angle) * branch.length;
      const by = Math.sin(branch.angle) * branch.length;
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Branch tip polyp
      ctx.fillStyle = `hsla(${coral.hue}, 90%, 75%, 0.85)`;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  });

  // 4. Bioluminescent Plants (Alien kelp, anemones, spore tendrils)
  world.plants.forEach((plant: BioPlant) => {
    if (
      plant.x < camX - 100 ||
      plant.x > camX + w + 100 ||
      plant.y < camY - 100 ||
      plant.y > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.translate(plant.x, plant.y);

    const resonance = plant.resonanceEnergy; // boosted by echo pulses
    const sway = Math.sin(plant.swayPhase) * (plant.height * 0.25);

    if (plant.type === 'kelp') {
      // Fluid undulating stem
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        sway * 0.4,
        -plant.height * 0.35,
        -sway * 0.6,
        -plant.height * 0.7,
        sway,
        -plant.height
      );
      ctx.strokeStyle = `hsla(${plant.hue}, 75%, 45%, ${0.5 + resonance * 0.5})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glowing bioluminescent leaves along stem
      for (let i = 1; i <= 3; i++) {
        const frac = i / 3.5;
        const ly = -plant.height * frac;
        const lx = sway * frac;
        const leafSway = Math.sin(plant.swayPhase + i) * 12;

        ctx.fillStyle = `hsla(${plant.hue}, 85%, 65%, ${0.35 + resonance * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(lx + leafSway, ly, 7, 3, plant.swayPhase + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (plant.type === 'anemone') {
      // Glowing tentacles radiating outward
      const tentacleCount = 6;
      for (let t = 0; t < tentacleCount; t++) {
        const angle = -Math.PI / 2 + ((t - tentacleCount / 2) * 0.4);
        const len = plant.height * (0.8 + 0.2 * Math.sin(plant.swayPhase + t));
        const tx = Math.cos(angle) * len;
        const ty = Math.sin(angle) * len;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(tx * 0.5 + Math.sin(plant.swayPhase + t) * 6, ty * 0.5, tx, ty);
        ctx.strokeStyle = `hsla(${plant.hue}, 85%, 60%, ${0.45 + resonance * 0.55})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = `hsla(${plant.hue}, 95%, 75%, ${0.6 + resonance * 0.4})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Spore tendril: vertical stalk with pulsing spore bulb
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sway * 0.5, -plant.height);
      ctx.strokeStyle = `hsla(${plant.hue}, 70%, 40%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spore Bulb
      const bulbGlow = ctx.createRadialGradient(
        sway * 0.5,
        -plant.height,
        1,
        sway * 0.5,
        -plant.height,
        14
      );
      bulbGlow.addColorStop(0, `hsla(${plant.hue}, 95%, 75%, ${0.7 + resonance * 0.3})`);
      bulbGlow.addColorStop(1, `hsla(${plant.hue}, 90%, 50%, 0)`);
      ctx.fillStyle = bulbGlow;
      ctx.beginPath();
      ctx.arc(sway * 0.5, -plant.height, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

/**
 * Natural Geological Candidate Locations (No debug balls, no lines, organic spires/vents)
 */
function drawGeologicalLocations(
  ctx: CanvasRenderingContext2D,
  locations: AnomalyLocation[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  locations.forEach(loc => {
    if (
      loc.x < camX - 120 ||
      loc.x > camX + w + 120 ||
      loc.y < camY - 120 ||
      loc.y > camY + h + 120
    ) {
      return;
    }

    ctx.save();
    ctx.translate(loc.x, loc.y);

    const resonance = loc.resonanceExcitation; // 0 to 1 when hit by echo pulse
    const pulse = 0.5 + 0.5 * Math.sin(loc.pulsePhase);

    // Natural geological feature shape
    if (loc.geologyType === 'crystal_chimney') {
      // Hydrothermal crystal spire
      ctx.fillStyle = '#0a1622';
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 + resonance * 0.65})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-18, 30);
      ctx.lineTo(-8, -25);
      ctx.lineTo(0, -38);
      ctx.lineTo(8, -25);
      ctx.lineTo(18, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crystal facet highlights
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(0, 30);
      ctx.stroke();

      // Subtle vent glow at apex
      const apexGlow = ctx.createRadialGradient(0, -38, 2, 0, -38, 24 + resonance * 20);
      apexGlow.addColorStop(0, `rgba(56, 189, 248, ${0.3 + pulse * 0.2 + resonance * 0.5})`);
      apexGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = apexGlow;
      ctx.beginPath();
      ctx.arc(0, -38, 24 + resonance * 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (loc.geologyType === 'coral_spire') {
      // Ancient coral spire
      ctx.fillStyle = '#08131d';
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.25 + resonance * 0.65})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 30 + resonance * 20);
      glow.addColorStop(0, `rgba(6, 182, 212, ${0.25 + pulse * 0.2 + resonance * 0.5})`);
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 30 + resonance * 20, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Abyssal vent or cavern crevice
      ctx.fillStyle = '#050c14';
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.2 + resonance * 0.6})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const ventGlow = ctx.createRadialGradient(0, 0, 3, 0, 0, 26 + resonance * 18);
      ventGlow.addColorStop(0, `rgba(129, 140, 248, ${0.2 + pulse * 0.2 + resonance * 0.5})`);
      ventGlow.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = ventGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + resonance * 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

/**
 * Sea Life Rendering (Strictly ONLY allowed animals)
 */
function drawSeaLife(
  ctx: CanvasRenderingContext2D,
  creatures: Creature[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  creatures.forEach((c: Creature) => {
    // Skip whale here as it is drawn in background layer
    if (c.type === 'giant_whale') return;

    if (
      c.x < camX - 100 ||
      c.x > camX + w + 100 ||
      c.y < camY - 100 ||
      c.y > camY + h + 100
    ) {
      return;
    }

    ctx.save();
    ctx.translate(c.x, c.y);

    if (c.type === 'jellyfish') {
      // Pulsing translucent bell with glowing tendrils
      const pulse = Math.sin(c.pulsePhase);
      const capRadius = c.size * (0.85 + pulse * 0.15);

      // Bell Aura
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, capRadius * 1.8);
      aura.addColorStop(0, `hsla(${c.hue}, 90%, 70%, 0.4)`);
      aura.addColorStop(1, `hsla(${c.hue}, 90%, 50%, 0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, capRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Bell Cap
      ctx.beginPath();
      ctx.fillStyle = `hsla(${c.hue}, 80%, 60%, 0.35)`;
      ctx.arc(0, 0, capRadius, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(${c.hue}, 95%, 85%, 0.8)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Trailing tentacles
      ctx.strokeStyle = `hsla(${c.hue}, 85%, 75%, 0.5)`;
      ctx.lineWidth = 1.2;
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        const tx = t * (capRadius * 0.28);
        ctx.moveTo(tx, 0);
        const wave = Math.sin(c.pulsePhase + t * 0.7) * 7;
        ctx.quadraticCurveTo(tx + wave, capRadius * 0.9, tx - wave * 0.5, capRadius * 1.8);
        ctx.stroke();
      }
    } else if (c.type === 'ray') {
      // Graceful manta / ray with flowing wings
      ctx.rotate(c.angle);
      const wingFlap = Math.sin(c.pulsePhase) * 0.25;

      ctx.fillStyle = 'rgba(6, 24, 42, 0.85)';
      ctx.strokeStyle = `hsla(${c.hue}, 80%, 70%, 0.7)`;
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(c.size * 0.8, 0);
      ctx.lineTo(-c.size * 0.3, -c.size * (0.8 + wingFlap));
      ctx.lineTo(-c.size * 0.6, 0);
      ctx.lineTo(-c.size * 0.3, c.size * (0.8 + wingFlap));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trailing thin tail
      ctx.beginPath();
      ctx.moveTo(-c.size * 0.6, 0);
      ctx.lineTo(-c.size * 1.5, Math.sin(c.pulsePhase * 1.5) * 4);
      ctx.strokeStyle = `hsla(${c.hue}, 80%, 70%, 0.45)`;
      ctx.stroke();
    } else if (c.type === 'squid') {
      // Alien squid with reactive jet propulsion
      ctx.rotate(c.angle);

      // Mantle
      ctx.fillStyle = 'rgba(8, 28, 48, 0.85)';
      ctx.strokeStyle = `hsla(${c.hue}, 85%, 75%, 0.75)`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(c.size * 0.9, 0);
      ctx.lineTo(-c.size * 0.2, -c.size * 0.4);
      ctx.lineTo(-c.size * 0.5, 0);
      ctx.lineTo(-c.size * 0.2, c.size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trailing tentacles
      for (let t = -1; t <= 1; t++) {
        ctx.beginPath();
        ctx.moveTo(-c.size * 0.5, t * 3);
        const wave = Math.sin(c.pulsePhase + t) * 5;
        ctx.lineTo(-c.size * 1.3, t * 4 + wave);
        ctx.strokeStyle = `hsla(${c.hue}, 90%, 80%, 0.6)`;
        ctx.stroke();
      }
    } else if (c.type === 'alien_fish') {
      // Sleek bioluminescent alien fish with organic tail and fins (no forward beam lines)
      ctx.rotate(c.angle);

      // Tail fin
      ctx.fillStyle = `hsla(${c.hue}, 80%, 65%, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(-c.size * 0.7, 0);
      ctx.lineTo(-c.size * 1.3, -c.size * 0.4);
      ctx.lineTo(-c.size * 1.1, 0);
      ctx.lineTo(-c.size * 1.3, c.size * 0.4);
      ctx.closePath();
      ctx.fill();

      // Fish Body
      ctx.fillStyle = 'rgba(6, 24, 44, 0.9)';
      ctx.strokeStyle = `hsla(${c.hue}, 85%, 75%, 0.75)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, c.size, c.size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Soft glowing dorsal fin
      ctx.fillStyle = `hsla(${c.hue}, 90%, 75%, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(-c.size * 0.2, -c.size * 0.38);
      ctx.quadraticCurveTo(0, -c.size * 0.7, c.size * 0.3, -c.size * 0.38);
      ctx.fill();

      // Subtle biological glowing eye
      ctx.fillStyle = `hsla(${c.hue}, 95%, 85%, 0.9)`;
      ctx.beginPath();
      ctx.arc(c.size * 0.55, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === 'glowing_fish') {
      // Small glowing fish with organic swimming tail (no beam lines)
      ctx.rotate(c.angle);

      const tailWiggle = Math.sin(c.pulsePhase * 3) * (c.size * 0.25);

      // Tail
      ctx.fillStyle = `hsla(${c.hue}, 90%, 70%, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(-c.size * 0.6, 0);
      ctx.lineTo(-c.size * 1.2, -c.size * 0.35 + tailWiggle);
      ctx.lineTo(-c.size * 1.2, c.size * 0.35 + tailWiggle);
      ctx.closePath();
      ctx.fill();

      // Soft body
      ctx.fillStyle = `hsla(${c.hue}, 90%, 80%, 0.85)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, c.size, c.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft biological eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(c.size * 0.5, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === 'alien_shrimp') {
      // Tiny curved alien shrimp (no forward beam lines/torches)
      ctx.rotate(c.angle);
      ctx.fillStyle = `hsla(${c.hue}, 80%, 65%, 0.75)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, c.size, c.size * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small fan tail
      ctx.fillStyle = `hsla(${c.hue}, 85%, 75%, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(-c.size * 0.8, 0);
      ctx.lineTo(-c.size * 1.2, -3);
      ctx.lineTo(-c.size * 1.2, 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  });
}

/**
 * Plankton & Marine Snow Particles
 */
function drawPlankton(
  ctx: CanvasRenderingContext2D,
  plankton: PlanktonParticle[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  plankton.forEach(p => {
    if (
      p.x < camX - 40 ||
      p.x > camX + w + 40 ||
      p.y < camY - 40 ||
      p.y > camY + h + 40
    ) {
      return;
    }

    const pulse = 0.6 + 0.4 * Math.sin(p.pulsePhase);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.alpha * pulse})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Expanding Underwater Acoustic Ripple
 */
function drawAcousticWave(ctx: CanvasRenderingContext2D, pulse: any) {
  ctx.save();

  const isReturnWave = pulse.color === '#facc15';

  if (isReturnWave) {
    // Golden Companion Bio-Resonance Wavefront
    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, pulse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fef08a';
    ctx.globalAlpha = pulse.alpha * 0.95;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, Math.max(0, pulse.radius - 12), 0, Math.PI * 2);
    ctx.strokeStyle = '#facc15';
    ctx.globalAlpha = pulse.alpha * 0.6;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, Math.max(0, pulse.radius - 24), 0, Math.PI * 2);
    ctx.strokeStyle = '#eab308';
    ctx.globalAlpha = pulse.alpha * 0.3;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Standard Player Outgoing Sonar Pulse
    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, pulse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = pulse.color;
    ctx.globalAlpha = pulse.alpha * 0.7;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Soft outer refraction wavefront
    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, Math.max(0, pulse.radius - 8), 0, Math.PI * 2);
    ctx.strokeStyle = pulse.color;
    ctx.globalAlpha = pulse.alpha * 0.3;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Delayed Companion Bio-Blink Glimpse (2-3s after CALL)
 * On-screen: golden halo + silhouette at Luma's exact position.
 * Off-screen: loud multi-arc directional indicator at screen edge + animated arrow + distance text.
 * Blink strength scales directly with REAL target probability.
 */
function drawCompanionBlinkGlimpse(
  ctx: CanvasRenderingContext2D,
  pendingBlinks: any[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  pendingBlinks.forEach(blink => {
    if (!blink.isBlinking) return;

    const progress = Math.min(1.0, blink.blinkElapsed / blink.blinkDuration);
    const envelope = Math.sin(progress * Math.PI); // 0 → 1 → 0 bell curve
    const prob = Math.max(0.08, Math.min(1.0, blink.targetProbability));
    const effectiveAlpha = envelope * (0.2 + prob * 0.75);

    const screenX = blink.x - camX;
    const screenY = blink.y - camY;
    const margin = 60;
    const isOffScreen =
      screenX < margin || screenX > w - margin || screenY < margin || screenY > h - margin;

    if (!isOffScreen) {
      // === ON-SCREEN: golden halo + submarine silhouette ===
      const radius = 28 + prob * 70;
      ctx.save();
      ctx.translate(blink.x, blink.y);

      const aura = ctx.createRadialGradient(0, 0, 3, 0, 0, radius);
      aura.addColorStop(0, `rgba(250, 204, 21, ${effectiveAlpha})`);
      aura.addColorStop(0.45, `rgba(234, 179, 8, ${effectiveAlpha * 0.45})`);
      aura.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Second pulsing outer ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(250, 204, 21, ${effectiveAlpha * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (prob > 0.2) {
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = `rgba(250, 204, 21, ${effectiveAlpha * 0.9})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = `rgba(254, 240, 138, ${effectiveAlpha})`;
        ctx.beginPath();
        ctx.arc(4, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else {
      // === OFF-SCREEN: prominent directional indicator at screen edge ===
      // BUG 9 FIX: we're inside ctx.translate(-camX,-camY) world transform.
      // We must reset to screen space before drawing screen-edge UI elements.
      const centerX = camX + w / 2;
      const centerY = camY + h / 2;
      const angle = Math.atan2(blink.y - centerY, blink.x - centerX);

      // Clamp to screen edge with padding
      const edgePad = 52;
      const halfW = w / 2 - edgePad;
      const halfH = h / 2 - edgePad;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const scaleToEdge = Math.min(
        Math.abs(halfW / (cos || 0.0001)),
        Math.abs(halfH / (sin || 0.0001))
      );
      // Position in screen space (0,0 = top-left of viewport)
      const edgeScreenX = w / 2 + cos * scaleToEdge;
      const edgeScreenY = h / 2 + sin * scaleToEdge;

      // Distance in world units (meters)
      const lumaDist = Math.round(Math.hypot(blink.x - centerX, blink.y - centerY));

      ctx.save();
      // Reset to screen space by undoing the world transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(edgeScreenX, edgeScreenY);
      ctx.rotate(angle);

      // --- Background glow blob ---
      const glowR = 42 + envelope * 22;
      const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowR);
      glowGrad.addColorStop(0, `rgba(250, 204, 21, ${effectiveAlpha * 0.55})`);
      glowGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();

      // --- Three expanding concentric arcs pointing outward ---
      const arcAngles = [Math.PI / 2.2, Math.PI / 3.2, Math.PI / 4.8];
      arcAngles.forEach((span, idx) => {
        const r = 18 + idx * 14 + envelope * 12;
        ctx.beginPath();
        ctx.arc(0, 0, r, -span / 2, span / 2);
        ctx.strokeStyle = `rgba(250, 204, 21, ${effectiveAlpha * (0.9 - idx * 0.22)})`;
        ctx.lineWidth = 3.5 - idx * 0.8;
        ctx.stroke();
      });

      // --- Arrow head pointing toward Luma ---
      const arrowLen = 16 + prob * 10;
      const arrowW = 6 + prob * 4;
      ctx.beginPath();
      ctx.moveTo(arrowLen + 14, 0);
      ctx.lineTo(arrowLen + 14 - arrowW, -arrowW * 0.6);
      ctx.lineTo(arrowLen + 14 - arrowW, arrowW * 0.6);
      ctx.closePath();
      ctx.fillStyle = `rgba(250, 204, 21, ${effectiveAlpha * 0.95})`;
      ctx.fill();

      ctx.restore();

      // --- Distance label in screen space (unrotated) ---
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = effectiveAlpha * 0.95;
      ctx.font = `bold ${10 + Math.round(prob * 3)}px monospace`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      // Offset label inward from edge
      const labelX = edgeScreenX - cos * 62;
      const labelY = edgeScreenY - sin * 62;
      ctx.fillText(`◈ ECHO ${lumaDist}m`, labelX, labelY);
      // Tiny strength dot-scale indicator
      const dotCount = Math.round(prob * 5);
      const dotStr = '●'.repeat(dotCount) + '○'.repeat(5 - dotCount);
      ctx.font = '8px monospace';
      ctx.fillStyle = '#facc15';
      ctx.shadowBlur = 3;
      ctx.fillText(dotStr, labelX, labelY + 14);
      ctx.restore();
    }
  });
}

/**
 * Player Submarine with Volumetric High-Intensity Torch Beam
 */
function drawPlayerSubmarine(ctx: CanvasRenderingContext2D, player: any) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  // 1. High-Intensity Volumetric Torch Beam in World Layer
  ctx.save();

  // Outer Volumetric Cone
  const outerBeamGrad = ctx.createRadialGradient(
    20,
    0,
    10,
    220,
    0,
    player.lightDistance
  );
  outerBeamGrad.addColorStop(0, 'rgba(240, 250, 255, 0.42)');
  outerBeamGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.28)');
  outerBeamGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.14)');
  outerBeamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = outerBeamGrad;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.arc(
    0,
    0,
    player.lightDistance,
    -player.lightConeAngle / 2,
    player.lightConeAngle / 2
  );
  ctx.closePath();
  ctx.fill();

  // Focused High-Power Central Beam Core
  const coreBeamGrad = ctx.createRadialGradient(
    20,
    0,
    5,
    160,
    0,
    player.lightDistance * 0.75
  );
  coreBeamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
  coreBeamGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.35)');
  coreBeamGrad.addColorStop(0.75, 'rgba(125, 211, 252, 0.12)');
  coreBeamGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');

  ctx.fillStyle = coreBeamGrad;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.arc(
    0,
    0,
    player.lightDistance * 0.75,
    -player.lightConeAngle / 3.8,
    player.lightConeAngle / 3.8
  );
  ctx.closePath();
  ctx.fill();

  // Headlight Lens Flare & Corona
  const flareGrad = ctx.createRadialGradient(21, 0, 1, 21, 0, 24);
  flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  flareGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.6)');
  flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(21, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 2. Submarine Hull Perimeter Ambient Glow
  const hullAura = ctx.createRadialGradient(0, 0, 4, 0, 0, 50);
  hullAura.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  hullAura.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = hullAura;
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.fill();

  // 3. Submarine Hull
  ctx.fillStyle = '#0a1420';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cockpit dome
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(6, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Engine mount & propeller
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-22, -5, 5, 10);

  // Forward headlight fixture
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(21, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Rescued Companion upon measurement success
 */
function drawRescuedCompanion(
  ctx: CanvasRenderingContext2D,
  loc: AnomalyLocation,
  progress: number
) {
  const compX = loc.x;
  const compY = loc.y - 40 * progress;

  ctx.save();
  ctx.translate(compX, compY);

  const aura = ctx.createRadialGradient(0, 0, 3, 0, 0, 75);
  aura.addColorStop(0, 'rgba(250, 204, 21, 0.85)');
  aura.addColorStop(0.5, 'rgba(234, 179, 8, 0.35)');
  aura.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(5, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('LUMA LOCATED', 0, -20);

  ctx.restore();
}

/**
 * Cavitation Bubbles
 */
function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: any[]) {
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(215, 245, 255, ${b.alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(125, 211, 252, ${b.alpha * 0.7})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/**
 * Torch & Ocean Darkness Mask
 * Cuts out torch cone and ambient halo to make the torch the primary source of visibility.
 * BUG 8 FIX: uses a pre-allocated offscreen canvas from the component — no per-frame allocation.
 */
function drawTorchDarknessMask(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  player: any,
  cameraX: number,
  cameraY: number,
  echoPulses: any[],
  pendingBlinks: any[],
  tempCanvas: HTMLCanvasElement  // pre-allocated, passed from OceanView component
) {
  // Screen-space player position
  const screenPX = player.x - cameraX;
  const screenPY = player.y - cameraY;

  ctx.save();

  // Use the pre-allocated offscreen mask canvas (no allocation per frame)
  // Resize only if dimensions changed (resize is cheap, avoids clearing valid pixels)
  if (tempCanvas.width !== viewWidth) tempCanvas.width = viewWidth;
  if (tempCanvas.height !== viewHeight) tempCanvas.height = viewHeight;
  const maskCtx = tempCanvas.getContext('2d');

  if (maskCtx) {
    // Clear and redraw darkness each frame
    maskCtx.clearRect(0, 0, viewWidth, viewHeight);
    // Fill darkness (softened to ~77% so ocean has subtle atmospheric ambient light)
    maskCtx.fillStyle = 'rgba(1, 6, 14, 0.77)';
    maskCtx.fillRect(0, 0, viewWidth, viewHeight);

    maskCtx.globalCompositeOperation = 'destination-out';

    // 1. Cut out Forward High-Intensity Torch Beam
    maskCtx.save();
    maskCtx.translate(screenPX, screenPY);
    maskCtx.rotate(player.angle);

    const beamGrad = maskCtx.createRadialGradient(
      15,
      0,
      5,
      200,
      0,
      player.lightDistance
    );
    beamGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    beamGrad.addColorStop(0.65, 'rgba(0, 0, 0, 1.0)');
    beamGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.75)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    maskCtx.fillStyle = beamGrad;
    maskCtx.beginPath();
    maskCtx.moveTo(15, 0);
    maskCtx.arc(
      0,
      0,
      player.lightDistance,
      -player.lightConeAngle / 2,
      player.lightConeAngle / 2
    );
    maskCtx.closePath();
    maskCtx.fill();

    // 2. Cut out Immediate Submarine Hull Perimeter Glow (Clear visibility around player)
    const hullHalo = maskCtx.createRadialGradient(0, 0, 4, 0, 0, 105);
    hullHalo.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    hullHalo.addColorStop(0.6, 'rgba(0, 0, 0, 0.85)');
    hullHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    maskCtx.fillStyle = hullHalo;
    maskCtx.beginPath();
    maskCtx.arc(0, 0, 105, 0, Math.PI * 2);
    maskCtx.fill();

    maskCtx.restore();

    // 3. Cut out expanding acoustic ripple wave illumination
    echoPulses.forEach(pulse => {
      const pulseScreenX = pulse.originX - cameraX;
      const pulseScreenY = pulse.originY - cameraY;

      const waveHalo = maskCtx.createRadialGradient(
        pulseScreenX,
        pulseScreenY,
        Math.max(0, pulse.radius - 20),
        pulseScreenX,
        pulseScreenY,
        pulse.radius + 20
      );
      waveHalo.addColorStop(0, 'rgba(0, 0, 0, 0)');
      waveHalo.addColorStop(0.5, `rgba(0, 0, 0, ${pulse.alpha * 0.55})`);
      waveHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');

      maskCtx.fillStyle = waveHalo;
      maskCtx.beginPath();
      maskCtx.arc(pulseScreenX, pulseScreenY, pulse.radius + 20, 0, Math.PI * 2);
      maskCtx.fill();
    });

    // 4. Cut out companion blink illumination if active
    pendingBlinks.forEach(blink => {
      if (!blink.isBlinking) return;
      const bScreenX = blink.x - cameraX;
      const bScreenY = blink.y - cameraY;
      const progress = Math.min(1.0, blink.blinkElapsed / blink.blinkDuration);
      const envelope = Math.sin(progress * Math.PI);
      const prob = Math.max(0.08, Math.min(1.0, blink.targetProbability));
      const rad = 30 + prob * 70;

      const blinkHole = maskCtx.createRadialGradient(bScreenX, bScreenY, 2, bScreenX, bScreenY, rad);
      blinkHole.addColorStop(0, `rgba(0, 0, 0, ${envelope * (0.3 + prob * 0.6)})`);
      blinkHole.addColorStop(1, 'rgba(0, 0, 0, 0)');
      maskCtx.fillStyle = blinkHole;
      maskCtx.beginPath();
      maskCtx.arc(bScreenX, bScreenY, rad, 0, Math.PI * 2);
      maskCtx.fill();
    });

    // Draw the final darkness mask over the canvas
    ctx.drawImage(tempCanvas, 0, 0);
  }

  ctx.restore();
}

/**
 * Cinematic Vignette
 */
function drawCinematicVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const rad = Math.hypot(w, h) * 0.52;
  const grad = ctx.createRadialGradient(w / 2, h / 2, rad * 0.45, w / 2, h / 2, rad);
  grad.addColorStop(0, 'rgba(0, 2, 6, 0)');
  grad.addColorStop(0.7, 'rgba(0, 2, 6, 0.35)');
  grad.addColorStop(1, 'rgba(0, 1, 4, 0.72)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Quantum Collapse Sequence Visualizer (Reveals which spire was measured vs true target)
 */
function drawQuantumCollapseSequence(
  ctx: CanvasRenderingContext2D,
  world: WorldData,
  result: any
) {
  if (!result) return;
  const time = performance.now() * 0.001;
  const measuredLoc = world.locations[result.measuredIndex];
  if (!measuredLoc) return;

  ctx.save();
  ctx.translate(measuredLoc.x, measuredLoc.y);

  const isTarget = result.isTarget;
  const pulseRadius = 45 + 25 * Math.sin(time * 12);
  const ringColor = isTarget ? 'rgba(250, 204, 21, 0.9)' : 'rgba(244, 63, 94, 0.85)';

  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Reticle crosshair
  ctx.beginPath();
  ctx.moveTo(-pulseRadius - 12, 0);
  ctx.lineTo(pulseRadius + 12, 0);
  ctx.moveTo(0, -pulseRadius - 12);
  ctx.lineTo(0, pulseRadius + 12);
  ctx.stroke();

  // BUG 11 FIX: set textBaseline so text renders at the correct vertical position
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  // BUG 10 FIX: diegetic language — no quantum jargon during gameplay
  ctx.fillStyle = isTarget ? '#fef08a' : '#fda4af';
  ctx.textAlign = 'center';
  ctx.fillText(
    isTarget ? '◈ LUMA FOUND' : `◈ WRONG SPIRE — signal: ${(result.targetProbability * 100).toFixed(0)}%`,
    0,
    -pulseRadius - 20
  );

  ctx.restore();

  // If measured incorrectly, briefly show faint spectral clue where the true target was
  if (!isTarget && world.locations[result.targetIndex]) {
    const trueTarget = world.locations[result.targetIndex];
    ctx.save();
    ctx.translate(trueTarget.x, trueTarget.y);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    // BUG 12 FIX: set dashes inside save/restore; reset explicitly before restore so they don't leak
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
    // BUG 10 FIX: diegetic label instead of "TARGET PHASE LOCATION"
    ctx.setLineDash([]); // reset line dash before drawing text
    ctx.textBaseline = 'middle'; // BUG 11 FIX
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('LUMA IS HERE', 0, -58);
    ctx.restore();
  }
}
