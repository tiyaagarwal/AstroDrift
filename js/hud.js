export function drawHUD(ctx, W, H, state) {
  const { score, highScore, lives, wave, player } = state;

  ctx.save();
  ctx.font = '14px Courier New';
  ctx.fillStyle = '#8bc';
  ctx.letterSpacing = '0.08em';

  // Score
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 16, 26);

  // Wave
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${wave}`, W / 2, 26);

  // High score
  ctx.fillText(`BEST  ${highScore}`, W / 2, 46);

  // Lives (ship icons)
  ctx.textAlign = 'right';
  for (let i = 0; i < lives; i++) {
    drawMiniShip(ctx, W - 16 - i * 24, 20, '#0af');
  }

  // Power-up timers
  let timerY = H - 14;
  const now = Date.now();

  if (player.hasShield) {
    const t = Math.ceil((player.shieldTimer - now) / 1000);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0cf';
    ctx.shadowColor = '#0cf';
    ctx.shadowBlur = 6;
    ctx.fillText(`🛡 ${t}s`, 16, timerY);
    timerY -= 20;
  }
  if (player.rapidFire) {
    const t = Math.ceil((player.rapidUntil - now) / 1000);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff0';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 6;
    ctx.fillText(`⚡ ${t}s`, 16, timerY);
  }

  ctx.restore();
}

function drawMiniShip(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, 5.5);
  ctx.lineTo(-3.5, 0);
  ctx.lineTo(-6, -5.5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawWaveBanner(ctx, W, H, wave, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Courier New';
  ctx.fillStyle = '#0af';
  ctx.shadowColor = '#0af';
  ctx.shadowBlur = 24;
  ctx.fillText(`WAVE ${wave}`, W / 2, H / 2 - 16);
  ctx.font = '14px Courier New';
  ctx.fillStyle = '#8bc';
  ctx.shadowBlur = 0;
  ctx.fillText('Good luck, pilot', W / 2, H / 2 + 16);
  ctx.restore();
}
