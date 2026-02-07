export function drawBattleCanvas(canvas, battle) {
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const now = Date.now();

  ctx.clearRect(0, 0, width, height);
  drawBackdrop(ctx, width, height);

  const leftBase = { x: width * 0.28, y: height * 0.78 };
  const rightBase = { x: width * 0.72, y: height * 0.78 };

  if (!battle) {
    drawStickman(ctx, { ...leftBase, color: "#f5de70", facing: 1, shiftX: 0, shiftY: 0, pose: "idle" });
    drawStickman(ctx, { ...rightBase, color: "#99a5b8", facing: -1, shiftX: 0, shiftY: 0, pose: "idle" });

    ctx.fillStyle = "#7a8799";
    ctx.font = "14px 'Noto Serif SC', serif";
    ctx.fillText("尚未交手", width * 0.45, height - 14);
    return;
  }

  const pulse = getStrikePulse(battle.animation, now);
  const { playerShiftX, playerShiftY, enemyShiftX, enemyShiftY } = getShifts(battle, pulse);

  drawStickman(ctx, {
    ...leftBase,
    color: "#f5de70",
    facing: 1,
    shiftX: playerShiftX,
    shiftY: playerShiftY,
    pose: battle.animation.playerPose || "idle"
  });

  drawStickman(ctx, {
    ...rightBase,
    color: "#9ba7ba",
    facing: -1,
    shiftX: enemyShiftX,
    shiftY: enemyShiftY,
    pose: battle.animation.enemyPose || "idle"
  });

  if (pulse > 0.01 && battle.animation.flash !== "none") {
    if (battle.animation.flash === "right") {
      drawFlash(ctx, rightBase.x - 58, rightBase.y - 46, pulse);
    } else {
      drawFlash(ctx, leftBase.x + 58, leftBase.y - 46, pulse);
    }
  }

  ctx.fillStyle = "#7b8aa0";
  ctx.font = "13px 'Noto Serif SC', serif";
  ctx.fillText(`${battle.player.name} vs ${battle.enemy.name}`, 14, 20);
}

function drawBackdrop(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a2432");
  gradient.addColorStop(1, "#090d14");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(150,165,185,0.08)";
  drawHill(ctx, width * 0.02, height * 0.82, width * 0.2, height * 0.2);
  drawHill(ctx, width * 0.19, height * 0.8, width * 0.28, height * 0.22);
  drawHill(ctx, width * 0.53, height * 0.82, width * 0.38, height * 0.24);

  ctx.strokeStyle = "#2f3d53";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.81);
  ctx.lineTo(width, height * 0.81);
  ctx.stroke();
}

function drawHill(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + width * 0.3, y - height, x + width * 0.65, y - height * 0.35);
  ctx.quadraticCurveTo(x + width * 0.85, y - height * 0.07, x + width, y);
  ctx.lineTo(x + width, y + height * 0.2);
  ctx.lineTo(x, y + height * 0.2);
  ctx.closePath();
  ctx.fill();
}

function drawStickman(ctx, { x, y, color, facing, shiftX, shiftY, pose }) {
  const baseX = x + shiftX;
  const baseY = y + shiftY;

  let bodyTilt = 0;
  let armReach = 12;
  let legSpread = 10;

  if (pose === "strike") {
    bodyTilt = facing * 4;
    armReach = 22;
    legSpread = 14;
  } else if (pose === "evade") {
    bodyTilt = -facing * 3;
    armReach = 7;
    legSpread = 16;
  } else if (pose === "hit") {
    bodyTilt = -facing * 6;
    armReach = 9;
    legSpread = 11;
  } else if (pose === "block") {
    bodyTilt = -facing * 2;
    armReach = 5;
    legSpread = 10;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;

  const headX = baseX;
  const headY = baseY - 56;

  ctx.beginPath();
  ctx.arc(headX, headY, 11, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(headX, headY + 12);
  ctx.lineTo(headX + bodyTilt, baseY - 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(headX, baseY - 40);
  ctx.lineTo(headX + facing * armReach, baseY - 30);
  ctx.moveTo(headX, baseY - 40);
  ctx.lineTo(headX - facing * 14, baseY - 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(headX + bodyTilt, baseY - 20);
  ctx.lineTo(headX + facing * legSpread, baseY + 9);
  ctx.moveTo(headX + bodyTilt, baseY - 20);
  ctx.lineTo(headX - facing * 10, baseY + 9);
  ctx.stroke();
}

function drawFlash(ctx, x, y, pulse) {
  ctx.fillStyle = `rgba(255, 103, 93, ${0.12 + pulse * 0.52})`;
  ctx.beginPath();
  ctx.arc(x, y, 18 + pulse * 14, 0, Math.PI * 2);
  ctx.fill();
}

function getStrikePulse(animation, now) {
  if (!animation || !animation.strikeAt) {
    return 0;
  }
  const elapsed = now - animation.strikeAt;
  if (elapsed > 380) {
    return 0;
  }
  const progress = clamp(elapsed / 380, 0, 1);
  return Math.sin(progress * Math.PI);
}

function getShifts(battle, pulse) {
  const result = battle.animation.result;
  const active = battle.animation.activeSide;
  const attackShift = 26 * pulse;

  let playerShiftX = 0;
  let enemyShiftX = 0;
  let playerShiftY = 0;
  let enemyShiftY = 0;

  if (active === "player") {
    playerShiftX += attackShift;

    if (result === "hit") {
      enemyShiftX += attackShift * 0.62;
      enemyShiftY += -pulse * 3;
    }
    if (result === "block") {
      enemyShiftX += attackShift * 0.3;
    }
    if (result === "dodge" || result === "miss") {
      enemyShiftX += 18 * pulse;
      enemyShiftY += -5 * pulse;
    }
  }

  if (active === "enemy") {
    enemyShiftX -= attackShift;

    if (result === "hit") {
      playerShiftX -= attackShift * 0.62;
      playerShiftY += -pulse * 3;
    }
    if (result === "block") {
      playerShiftX -= attackShift * 0.3;
    }
    if (result === "dodge" || result === "miss") {
      playerShiftX -= 18 * pulse;
      playerShiftY += -5 * pulse;
    }
  }

  return { playerShiftX, playerShiftY, enemyShiftX, enemyShiftY };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
