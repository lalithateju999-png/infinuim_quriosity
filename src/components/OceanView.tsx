import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/gameState';

interface OceanViewProps {
  engine: GameEngine;
}

export const OceanView: React.FC<OceanViewProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update engine physics and state
      engine.update(dt);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawOceanWorld(ctx, canvas.width, canvas.height, engine);
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
      className="absolute inset-0 w-full h-full block bg-[#01040a] cursor-crosshair select-none"
    />
  );
};

function drawOceanWorld(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  engine: GameEngine
) {
  const { player, world, grover, echoPulses, bubbles, level } = engine;
  const probs = grover.getProbabilities();

  // Camera tracking centered on player with smooth bounds
  const cameraX = Math.max(0, Math.min(world.width - viewWidth, player.x - viewWidth / 2));
  const cameraY = Math.max(0, Math.min(world.height - viewHeight, player.y - viewHeight / 2));

  ctx.save();
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  // 1. Draw Deep Ocean Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
  bgGrad.addColorStop(0, level.biomeColor.bgTop);
  bgGrad.addColorStop(1, level.biomeColor.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  // Apply Camera transform for in-world elements
  ctx.translate(-cameraX, -cameraY);

  // 2. Draw Subtle Ocean Floor / Ambient Seabed Trenches
  drawSeabedAtmosphere(ctx, world, cameraX, cameraY, viewWidth, viewHeight);

  // 3. Draw Marine Snow Particles (Parallax)
  ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
  world.marineSnow.forEach(flake => {
    if (
      flake.x >= cameraX - 50 &&
      flake.x <= cameraX + viewWidth + 50 &&
      flake.y >= cameraY - 50 &&
      flake.y <= cameraY + viewHeight + 50
    ) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(180, 230, 255, ${flake.alpha})`;
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 4. Draw Marine Life (Jellyfish, Manta Rays, Bioluminescent Fish)
  drawCreatures(ctx, world.creatures, cameraX, cameraY, viewWidth, viewHeight);

  // 5. Draw Predators
  drawPredators(ctx, world.predators, cameraX, cameraY, viewWidth, viewHeight);

  // 6. Draw Search Anomaly Nodes (N locations)
  world.nodes.forEach((node, idx) => {
    const prob = probs[idx] ?? (1 / level.n);
    const isTarget = idx === world.targetIndex;
    drawAnomalyNode(ctx, node, prob, isTarget, engine);
  });

  // 7. Draw Echo Pulses (Expanding quantum sonar wavefronts)
  echoPulses.forEach(pulse => {
    drawEchoPulse(ctx, pulse);
  });

  // 8. Draw Bubbles
  ctx.fillStyle = 'rgba(180, 240, 255, 0.6)';
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 245, 255, ${b.alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(125, 211, 252, ${b.alpha * 0.8})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 9. Draw Player Submarine & Headlight Cones
  drawPlayerSubmarine(ctx, player);

  // 10. Draw Companion if Rescue/Success is active
  if (engine.status === 'success' && world.nodes[world.targetIndex]) {
    drawCompanionSubmarine(
      ctx,
      world.nodes[world.targetIndex],
      player,
      engine.companionRescueAnimation
    );
  }

  ctx.restore();

  // Draw Vignette / Deep Water Darkness Overlay on Screen Coordinates
  drawVignette(ctx, viewWidth, viewHeight);
}

function drawSeabedAtmosphere(
  ctx: CanvasRenderingContext2D,
  world: { width: number; height: number },
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  ctx.save();
  const time = performance.now() * 0.001;
  const ventCount = 12;
  for (let i = 0; i < ventCount; i++) {
    const vx = ((i * 370 + 200) % (world.width - 200));
    const vy = ((i * 290 + 300) % (world.height - 200));

    if (vx >= camX - 300 && vx <= camX + w + 300 && vy >= camY - 300 && vy <= camY + h + 300) {
      const grad = ctx.createRadialGradient(vx, vy, 10, vx, vy, 240);
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.8 + i);
      grad.addColorStop(0, `rgba(6, 182, 212, ${0.08 + pulse * 0.05})`);
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(vx, vy, 240, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCreatures(
  ctx: CanvasRenderingContext2D,
  creatures: any[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  creatures.forEach(c => {
    if (c.x < camX - 100 || c.x > camX + w + 100 || c.y < camY - 100 || c.y > camY + h + 100) {
      return;
    }

    ctx.save();
    ctx.translate(c.x, c.y);

    if (c.type === 'jellyfish') {
      const pulse = Math.sin(c.pulsePhase);
      const capRadius = c.size * (0.85 + pulse * 0.15);

      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, capRadius * 1.8);
      glow.addColorStop(0, `hsla(${c.hue}, 90%, 75%, 0.6)`);
      glow.addColorStop(1, `hsla(${c.hue}, 90%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, capRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `hsla(${c.hue}, 85%, 65%, 0.5)`;
      ctx.arc(0, 0, capRadius, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(${c.hue}, 95%, 85%, 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = `hsla(${c.hue}, 80%, 75%, 0.4)`;
      ctx.lineWidth = 1.2;
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        const tx = t * (capRadius * 0.3);
        ctx.moveTo(tx, 0);
        const wave = Math.sin(c.pulsePhase + t * 0.8) * 6;
        ctx.quadraticCurveTo(tx + wave, capRadius * 0.8, tx - wave, capRadius * 1.6);
        ctx.stroke();
      }
    } else if (c.type === 'manta') {
      const angle = Math.atan2(c.vy, c.vx);
      ctx.rotate(angle);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 0, c.size, c.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.size * 0.8, 0);
      ctx.lineTo(-c.size * 0.4, -c.size * 0.7);
      ctx.lineTo(-c.size * 0.6, 0);
      ctx.lineTo(-c.size * 0.4, c.size * 0.7);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-c.size * 0.6, 0);
      ctx.lineTo(-c.size * 1.4, 0);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
      ctx.stroke();
    } else {
      ctx.fillStyle = `hsla(${c.hue}, 90%, 75%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, c.size, c.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawPredators(
  ctx: CanvasRenderingContext2D,
  predators: any[],
  camX: number,
  camY: number,
  w: number,
  h: number
) {
  predators.forEach(p => {
    if (p.x < camX - 200 || p.x > camX + w + 200 || p.y < camY - 200 || p.y > camY + h + 200) {
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.fillStyle = 'rgba(6, 10, 20, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 70, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    const eyeAlpha = 0.3 + p.aggroLevel * 0.7;
    ctx.fillStyle = `rgba(244, 63, 94, ${eyeAlpha})`;
    ctx.beginPath();
    ctx.arc(35, -7, 4, 0, Math.PI * 2);
    ctx.arc(35, 7, 4, 0, Math.PI * 2);
    ctx.fill();

    if (p.aggroLevel > 0.4) {
      ctx.strokeStyle = `rgba(239, 68, 68, ${p.aggroLevel * 0.8})`;
      ctx.lineWidth = 2;
      for (let r = -30; r <= 20; r += 12) {
        ctx.beginPath();
        ctx.moveTo(r, -15);
        ctx.lineTo(r - 5, -25);
        ctx.stroke();
      }
    }

    ctx.restore();
  });
}

function drawAnomalyNode(
  ctx: CanvasRenderingContext2D,
  node: any,
  prob: number,
  isTarget: boolean,
  engine: GameEngine
) {
  const time = performance.now() * 0.001;
  const isOptimalReached = engine.grover.iterations === engine.grover.optimalIterations;
  const isOvershot = engine.grover.iterations > engine.grover.optimalIterations;

  ctx.save();
  ctx.translate(node.x, node.y);

  const baseGlowRadius = 40 + prob * 140;
  const pulseScale = 1.0 + 0.15 * Math.sin(time * (2.0 + prob * 8.0) + node.pulsePhase);
  const currentGlowRadius = baseGlowRadius * pulseScale;

  const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, currentGlowRadius);

  if (isOptimalReached && isTarget) {
    glowGrad.addColorStop(0, `rgba(56, 189, 248, ${0.4 + prob * 0.5})`);
    glowGrad.addColorStop(0.5, `rgba(6, 182, 212, ${0.2 + prob * 0.3})`);
    glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
  } else if (isOvershot && isTarget) {
    glowGrad.addColorStop(0, `rgba(244, 63, 94, ${0.3 + prob * 0.4})`);
    glowGrad.addColorStop(0.6, `rgba(168, 85, 247, ${0.15 + prob * 0.2})`);
    glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
  } else {
    const alpha = 0.15 + prob * 0.6;
    glowGrad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
    glowGrad.addColorStop(0.6, `rgba(14, 116, 144, ${alpha * 0.4})`);
    glowGrad.addColorStop(1, 'rgba(14, 116, 144, 0)');
  }

  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, currentGlowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + prob * 0.6})`;
  ctx.lineWidth = 2;

  if (node.type === 'crystal') {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const r = node.baseRadius * (0.8 + 0.2 * Math.sin(node.pulsePhase));
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (node.type === 'vent') {
    ctx.beginPath();
    ctx.moveTo(-16, 20);
    ctx.lineTo(-8, -20);
    ctx.lineTo(8, -20);
    ctx.lineTo(16, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, node.baseRadius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const coreRadius = 4 + prob * 12;
  ctx.fillStyle = isOptimalReached && isTarget
    ? '#ffffff'
    : `rgba(224, 242, 254, ${0.6 + prob * 0.4})`;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  if (prob > 0.3) {
    ctx.strokeStyle = `rgba(56, 189, 248, ${prob * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, (node.baseRadius + 10) * pulseScale, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(node.label, 0, node.baseRadius + 18);

  ctx.restore();
}

function drawEchoPulse(ctx: CanvasRenderingContext2D, pulse: any) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pulse.originX, pulse.originY, pulse.radius, 0, Math.PI * 2);
  ctx.strokeStyle = pulse.color;
  ctx.globalAlpha = pulse.alpha * 0.75;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pulse.originX, pulse.originY, pulse.radius + 6, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = pulse.alpha * 0.35;
  ctx.stroke();

  ctx.restore();
}

function drawPlayerSubmarine(
  ctx: CanvasRenderingContext2D,
  player: any
) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // 1. Forward Headlights Beam
  ctx.save();
  ctx.rotate(player.angle);

  const lightGrad = ctx.createRadialGradient(15, 0, 10, 160, 0, player.lightDistance);
  lightGrad.addColorStop(0, 'rgba(240, 249, 255, 0.45)');
  lightGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.25)');
  lightGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.1)');
  lightGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = lightGrad;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.arc(0, 0, player.lightDistance, -player.lightConeAngle / 2, player.lightConeAngle / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Submarine Hull
  ctx.rotate(player.angle);

  const hullGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 36);
  hullGlow.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
  hullGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = hullGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(6, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-22, -6, 6, 12);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(21, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCompanionSubmarine(
  ctx: CanvasRenderingContext2D,
  node: any,
  player: any,
  animProgress: number
) {
  ctx.save();
  const time = performance.now() * 0.001;

  const compX = node.x;
  const compY = node.y - 45 * animProgress;

  ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + 0.4 * Math.sin(time * 6)})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -time * 40;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(compX, compY);
  ctx.stroke();
  ctx.setLineDash([]);

  const aura = ctx.createRadialGradient(compX, compY, 5, compX, compY, 70);
  aura.addColorStop(0, 'rgba(250, 204, 21, 0.8)');
  aura.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');
  aura.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(compX, compY, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(compX, compY);
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

  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('LUMA LOCATED', 0, -22);

  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const rad = Math.hypot(w, h) * 0.5;
  const grad = ctx.createRadialGradient(w / 2, h / 2, rad * 0.45, w / 2, h / 2, rad);
  grad.addColorStop(0, 'rgba(0, 2, 8, 0)');
  grad.addColorStop(0.7, 'rgba(0, 2, 8, 0.4)');
  grad.addColorStop(1, 'rgba(0, 2, 8, 0.88)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
