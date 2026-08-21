import { rand } from './utils.js';

export class StarField {
  constructor(W, H, count = 160) {
    this.W = W;
    this.H = H;
    this.stars = Array.from({ length: count }, () => this._make());
  }

  _make() {
    const layer = Math.random();
    return {
      x: rand(0, this.W),
      y: rand(0, this.H),
      r: layer < 0.5 ? rand(0.4, 0.8) : layer < 0.85 ? rand(0.8, 1.4) : rand(1.4, 2.2),
      speed: layer < 0.5 ? rand(0.1, 0.3) : layer < 0.85 ? rand(0.3, 0.6) : rand(0.6, 1.1),
      alpha: rand(0.3, 1),
      twinkle: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.01, 0.04),
    };
  }

  update(shipSpeedX = 0, shipSpeedY = 0) {
    for (const s of this.stars) {
      s.x -= shipSpeedX * s.speed * 0.08;
      s.y -= shipSpeedY * s.speed * 0.08;
      s.twinkle += s.twinkleSpeed;

      if (s.x < 0) s.x += this.W;
      if (s.x > this.W) s.x -= this.W;
      if (s.y < 0) s.y += this.H;
      if (s.y > this.H) s.y -= this.H;
    }
  }

  draw(ctx) {
    for (const s of this.stars) {
      const alpha = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
