import { clamp, wrap } from './utils.js';

const TURN_SPEED   = 0.055;
const THRUST       = 0.18;
const MAX_SPEED    = 6.5;
const FRICTION     = 0.985;
const BULLET_SPEED = 12;
const SHOOT_CD     = 200;  // ms
const INVULN_TIME  = 2000; // ms after hit

export class Player {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.reset();
  }

  reset() {
    this.x     = this.W / 2;
    this.y     = this.H / 2;
    this.vx    = 0;
    this.vy    = 0;
    this.angle = -Math.PI / 2;
    this.thrusting  = false;
    this.turningL   = false;
    this.turningR   = false;
    this.shooting   = false;
    this.lastShot   = 0;
    this.invulnUntil = 0;
    this.shield     = false;
    this.shieldTimer = 0;
    this.rapidUntil = 0;
    this.bullets    = [];
  }

  get isInvuln() { return Date.now() < this.invulnUntil; }
  get hasShield() { return Date.now() < this.shieldTimer; }
  get rapidFire() { return Date.now() < this.rapidUntil; }

  hit() {
    if (this.hasShield) {
      this.shieldTimer = 0;
      this.invulnUntil = Date.now() + 800;
      return false; // shield absorbed
    }
    if (this.isInvuln) return false;
    this.invulnUntil = Date.now() + INVULN_TIME;
    return true;
  }

  activateShield(dur = 6000) { this.shieldTimer = Date.now() + dur; }
  activateRapid(dur = 5000)  { this.rapidUntil  = Date.now() + dur; }

  update(particles) {
    if (this.turningL) this.angle -= TURN_SPEED;
    if (this.turningR) this.angle += TURN_SPEED;

    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST;
      this.vy += Math.sin(this.angle) * THRUST;
      particles.thruster(this.x, this.y, this.angle, 2);
    }

    this.vx = clamp(this.vx * FRICTION, -MAX_SPEED, MAX_SPEED);
    this.vy = clamp(this.vy * FRICTION, -MAX_SPEED, MAX_SPEED);

    this.x = wrap(this.x + this.vx, 0, this.W);
    this.y = wrap(this.y + this.vy, 0, this.H);

    const cd = this.rapidFire ? SHOOT_CD * 0.35 : SHOOT_CD;
    if (this.shooting && Date.now() - this.lastShot > cd) {
      this.lastShot = Date.now();
      this.bullets.push({
        x: this.x + Math.cos(this.angle) * 18,
        y: this.y + Math.sin(this.angle) * 18,
        vx: this.vx + Math.cos(this.angle) * BULLET_SPEED,
        vy: this.vy + Math.sin(this.angle) * BULLET_SPEED,
        life: 55,
      });
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x = wrap(b.x + b.vx, 0, this.W);
      b.y = wrap(b.y + b.vy, 0, this.H);
      b.life--;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }
  }

  draw(ctx) {
    const now = Date.now();
    // Blink during invulnerability
    if (this.isInvuln && Math.floor(now / 80) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Shield glow
    if (this.hasShield) {
      const pulse = 0.6 + 0.4 * Math.sin(now * 0.006);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,200,255,${pulse * 0.9})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#0cf';
      ctx.shadowBlur = 18;
      ctx.stroke();
    }

    // Ship body
    ctx.shadowColor = '#0af';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = this.thrusting ? '#fff' : '#0af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-12, 11);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-12, -11);
    ctx.closePath();
    ctx.stroke();

    // Thruster flame
    if (this.thrusting) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#f80' : '#ff0';
      ctx.shadowColor = '#f80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, 5);
      ctx.lineTo(-7 - 8 - Math.random() * 6, 0);
      ctx.lineTo(-7, -5);
      ctx.stroke();
    }

    ctx.restore();

    // Rapid fire indicator
    if (this.rapidFire) {
      ctx.save();
      ctx.strokeStyle = '#ff0';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Bullets
    for (const b of this.bullets) {
      ctx.save();
      ctx.fillStyle = this.rapidFire ? '#ff0' : '#0f8';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
