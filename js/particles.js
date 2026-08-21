import { rand } from './utils.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Thruster exhaust trail
  thruster(x, y, angle, count = 3) {
    for (let i = 0; i < count; i++) {
      const spread = 0.4;
      const a = angle + Math.PI + rand(-spread, spread);
      const speed = rand(1, 3.5);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 1,
        decay: rand(0.04, 0.09),
        size: rand(1.5, 3.5),
        type: 'thrust',
        color: rand(0, 1) > 0.4 ? '#f80' : '#0af',
      });
    }
  }

  // Explosion burst
  explode(x, y, count = 22, colorA = '#f80', colorB = '#f00') {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(0.8, 5);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 1,
        decay: rand(0.02, 0.055),
        size: rand(2, 5),
        type: 'explode',
        color: rand(0, 1) > 0.5 ? colorA : colorB,
      });
    }
  }

  // Star / sparkle pickup effect
  sparkle(x, y, color = '#0f8', count = 12) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
      const speed = rand(1, 4);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 1,
        decay: rand(0.025, 0.05),
        size: rand(2, 4),
        type: 'sparkle',
        color,
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.type === 'sparkle') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear() { this.particles = []; }
}
