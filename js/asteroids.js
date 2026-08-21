import { rand, randInt, wrap } from './utils.js';

const SIZES = {
  large:  { r: 40, score: 20,  children: 2, speed: [0.6, 1.4] },
  medium: { r: 22, score: 50,  children: 2, speed: [1.0, 2.2] },
  small:  { r: 11, score: 100, children: 0, speed: [1.8, 3.2] },
};

function makeShape(r, sides = randInt(7, 12)) {
  const verts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const dr = r * rand(0.75, 1.25);
    verts.push({ x: Math.cos(a) * dr, y: Math.sin(a) * dr });
  }
  return verts;
}

function makeAsteroid(x, y, size, W, H) {
  const cfg = SIZES[size];
  const angle = rand(0, Math.PI * 2);
  const speed = rand(...cfg.speed);
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.025, 0.025),
    r: cfg.r,
    size,
    score: cfg.score,
    shape: makeShape(cfg.r),
    W, H,
  };
}

export function spawnWave(wave, W, H, player) {
  const count = 3 + wave;
  const asteroids = [];
  for (let i = 0; i < count; i++) {
    // Spawn off-screen away from player
    let x, y;
    do {
      const edge = randInt(0, 3);
      if (edge === 0) { x = rand(0, W); y = -50; }
      else if (edge === 1) { x = W + 50; y = rand(0, H); }
      else if (edge === 2) { x = rand(0, W); y = H + 50; }
      else { x = -50; y = rand(0, H); }
    } while (Math.hypot(x - player.x, y - player.y) < 160);
    asteroids.push(makeAsteroid(x, y, 'large', W, H));
  }
  return asteroids;
}

export function splitAsteroid(ast, W, H) {
  const cfg = SIZES[ast.size];
  if (cfg.children === 0) return [];
  const childSize = ast.size === 'large' ? 'medium' : 'small';
  return Array.from({ length: cfg.children }, () =>
    makeAsteroid(ast.x, ast.y, childSize, W, H)
  );
}

export function updateAsteroids(asteroids) {
  for (const a of asteroids) {
    a.x = wrap(a.x + a.vx, 0, a.W);
    a.y = wrap(a.y + a.vy, 0, a.H);
    a.angle += a.spin;
  }
}

export function drawAsteroids(ctx, asteroids) {
  for (const a of asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    const hue = a.size === 'large' ? '#9a7' : a.size === 'medium' ? '#b96' : '#c87';
    ctx.strokeStyle = hue;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = hue;
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.moveTo(a.shape[0].x, a.shape[0].y);
    for (let i = 1; i < a.shape.length; i++) {
      ctx.lineTo(a.shape[i].x, a.shape[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}
