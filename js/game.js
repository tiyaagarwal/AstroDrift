import { Player }                              from './player.js';
import { ParticleSystem }                       from './particles.js';
import { StarField }                            from './stars.js';
import { spawnWave, splitAsteroid,
         updateAsteroids, drawAsteroids }       from './asteroids.js';
import { spawnPowerup, updatePowerups,
         drawPowerups }                         from './powerups.js';
import { drawHUD, drawWaveBanner }              from './hud.js';

const CANVAS_W = 900;
const CANVAS_H = 600;
const POWERUP_CHANCE = 0.25;
const MAX_LIVES = 5;

export class Game {
  constructor(canvas, ui) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.ui      = ui;

    this.score     = 0;
    this.highScore = parseInt(localStorage.getItem('astrodrift-hs') || '0');
    this.lives     = 3;
    this.wave      = 1;
    this.state     = 'menu';   // menu | playing | dead | paused | wavebanner

    this.player    = new Player(CANVAS_W, CANVAS_H);
    this.particles = new ParticleSystem();
    this.stars     = new StarField(CANVAS_W, CANVAS_H);
    this.asteroids = [];
    this.powerups  = [];

    this.waveBannerAlpha  = 0;
    this.waveBannerTimer  = 0;

    this._bindInput();
    this._loop();
  }

  // ── State transitions ──────────────────────────────────────────────────

  startGame() {
    this.score     = 0;
    this.lives     = 3;
    this.wave      = 1;
    this.asteroids = [];
    this.powerups  = [];
    this.player.reset();
    this.particles.clear();
    this._showWaveBanner();
    this.state = 'wavebanner';
    this.ui.game.classList.remove('hidden');
    this.ui.menu.classList.add('hidden');
    this.ui.over.classList.add('hidden');
  }

  _nextWave() {
    this.wave++;
    this.powerups = [];
    this.player.reset();
    this._showWaveBanner();
    this.state = 'wavebanner';
  }

  _showWaveBanner() {
    this.waveBannerAlpha = 1;
    this.waveBannerTimer = 2400;
    this.asteroids = spawnWave(this.wave, CANVAS_W, CANVAS_H, this.player);
  }

  _playerDied() {
    this.particles.explode(this.player.x, this.player.y, 35, '#0af', '#fff');
    this.lives--;
    if (this.lives <= 0) {
      this.state = 'dead';
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('astrodrift-hs', this.highScore);
      }
      this.ui.over.classList.remove('hidden');
      this.ui.overScore.textContent  = this.score;
      this.ui.overBest.textContent   = this.highScore;
    } else {
      this.player.reset();
    }
  }

  // ── Main loop ──────────────────────────────────────────────────────────

  _loop() {
    requestAnimationFrame(() => this._loop());

    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    this.stars.update(this.player.vx, this.player.vy);
    this.stars.draw(ctx);

    if (this.state === 'menu' || this.state === 'dead') return;

    if (this.state === 'wavebanner') {
      this.waveBannerTimer -= 16;
      this.waveBannerAlpha = Math.min(1, this.waveBannerTimer / 600);
      drawWaveBanner(ctx, CANVAS_W, CANVAS_H, this.wave, this.waveBannerAlpha);
      updateAsteroids(this.asteroids);
      drawAsteroids(ctx, this.asteroids);
      if (this.waveBannerTimer <= 0) this.state = 'playing';
      return;
    }

    if (this.state === 'paused') {
      drawAsteroids(ctx, this.asteroids);
      drawPowerups(ctx, this.powerups);
      this.player.draw(ctx);
      this.particles.draw(ctx);
      drawHUD(ctx, CANVAS_W, CANVAS_H, this._hudState());
      this._drawPauseLabel(ctx);
      return;
    }

    // ── playing ──
    this.player.update(this.particles);
    updateAsteroids(this.asteroids);
    updatePowerups(this.powerups);
    this.particles.update();

    this._checkCollisions();

    drawAsteroids(ctx, this.asteroids);
    drawPowerups(ctx, this.powerups);
    this.particles.draw(ctx);
    this.player.draw(ctx);
    drawHUD(ctx, CANVAS_W, CANVAS_H, this._hudState());

    if (this.asteroids.length === 0) this._nextWave();
  }

  _hudState() {
    return {
      score:     this.score,
      highScore: this.highScore,
      lives:     this.lives,
      wave:      this.wave,
      player:    this.player,
    };
  }

  // ── Collision detection ────────────────────────────────────────────────

  _checkCollisions() {
    const player = this.player;

    // Bullets vs asteroids
    for (let bi = player.bullets.length - 1; bi >= 0; bi--) {
      const b = player.bullets[bi];
      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const a = this.asteroids[ai];
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
          // Hit
          this.score += a.score;
          this.particles.explode(a.x, a.y, a.size === 'large' ? 18 : 10, '#9a7', '#b96');
          const children = splitAsteroid(a, CANVAS_W, CANVAS_H);
          this.asteroids.splice(ai, 1, ...children);
          player.bullets.splice(bi, 1);

          // Chance to drop power-up
          if (a.size !== 'small' && Math.random() < POWERUP_CHANCE) {
            this.powerups.push(spawnPowerup(a.x, a.y));
          }
          break;
        }
      }
    }

    // Player vs asteroids
    if (!player.isInvuln) {
      for (const a of this.asteroids) {
        if (Math.hypot(player.x - a.x, player.y - a.y) < a.r + 14) {
          const died = player.hit();
          if (died) this._playerDied();
          break;
        }
      }
    }

    // Player vs power-ups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (Math.hypot(player.x - p.x, player.y - p.y) < p.r + 16) {
        this.particles.sparkle(p.x, p.y, p.color);
        if (p.kind === 'shield') player.activateShield();
        if (p.kind === 'rapid')  player.activateRapid();
        if (p.kind === 'life' && this.lives < MAX_LIVES) this.lives++;
        this.powerups.splice(i, 1);
      }
    }
  }

  // ── Input ──────────────────────────────────────────────────────────────

  _bindInput() {
    window.addEventListener('keydown', e => {
      this._handleKey(e.code, true);
    });
    window.addEventListener('keyup', e => {
      this._handleKey(e.code, false);
    });

    // Touch buttons
    const bindTouch = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); action(true); }, { passive: false });
      el.addEventListener('touchend',  e => { e.preventDefault(); action(false); }, { passive: false });
    };
    bindTouch('btn-left',   v => this.player.turningL = v);
    bindTouch('btn-right',  v => this.player.turningR = v);
    bindTouch('btn-thrust', v => this.player.thrusting = v);
    bindTouch('btn-fire',   v => this.player.shooting  = v);
  }

  _handleKey(code, down) {
    const p = this.player;
    if (code === 'ArrowLeft'  || code === 'KeyA') p.turningL  = down;
    if (code === 'ArrowRight' || code === 'KeyD') p.turningR  = down;
    if (code === 'ArrowUp'    || code === 'KeyW') p.thrusting = down;
    if (code === 'Space'      || code === 'KeyF') p.shooting  = down;

    if (!down) return;
    if (code === 'KeyP' || code === 'Escape') {
      if (this.state === 'playing') this.state = 'paused';
      else if (this.state === 'paused') this.state = 'playing';
    }
  }

  _drawPauseLabel(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Courier New';
    ctx.fillStyle = '#0af';
    ctx.shadowColor = '#0af';
    ctx.shadowBlur = 20;
    ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2);
    ctx.font = '14px Courier New';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#8bc';
    ctx.fillText('Press P or ESC to resume', CANVAS_W / 2, CANVAS_H / 2 + 30);
    ctx.restore();
  }
}
