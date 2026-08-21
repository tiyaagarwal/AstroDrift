import { rand } from './utils.js';

const TYPES = [
  { kind: 'shield', color: '#0cf', label: '🛡', glow: '#0cf' },
  { kind: 'rapid',  color: '#ff0', label: '⚡', glow: '#ff0' },
  { kind: 'life',   color: '#f0f', label: '♥',  glow: '#f0f' },
];

export function spawnPowerup(x, y) {
  const t = TYPES[Math.floor(Math.random() * TYPES.length)];
  return {
    x, y,
    ...t,
    r: 14,
    pulse: rand(0, Math.PI * 2),
    collected: false,
  };
}

export function updatePowerups(powerups) {
  for (const p of powerups) {
    p.pulse += 0.04;
  }
}

export function drawPowerups(ctx, powerups) {
  for (const p of powerups) {
    if (p.collected) continue;
    const scale = 1 + 0.12 * Math.sin(p.pulse);

    ctx.save();
    ctx.translate(p.x, p.y);

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, p.r * scale, 0, Math.PI * 2);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Icon
    ctx.font = `${14 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(p.label, 0, 1);

    ctx.restore();
  }
}
