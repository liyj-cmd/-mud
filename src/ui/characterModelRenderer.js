export function drawCharacterModel(ctx, {
  x,
  y,
  model,
  label,
  now,
  selected = false,
  isPlayer = false
}) {
  if (!ctx || !model) {
    return;
  }

  const bobScale = Number.isFinite(model.motion?.bob) ? model.motion.bob : 1.2;
  const bob = Math.sin(now / 420 + x * 0.01) * bobScale;
  const drawY = y + bob;

  const silhouette = normalizeSilhouette(model.silhouette || {});
  const palette = normalizePalette(model.palette || {});

  drawShadow(ctx, x, drawY + 10, silhouette.shadowRadius, isPlayer ? 0.26 : 0.2);
  drawAura(ctx, x, drawY - silhouette.height + 6, palette.glow, selected, isPlayer, now);
  drawRobeBody(ctx, x, drawY, silhouette, palette, model.emblem);
  drawHead(ctx, x, drawY - silhouette.height, silhouette.headRadius, palette, model);
  drawAccessory(ctx, x, drawY, silhouette, palette, model.accessory);
  drawNameplate(ctx, {
    x,
    y: drawY - silhouette.height - 28,
    text: label,
    accent: selected || isPlayer ? palette.glow : palette.accent,
    textColor: palette.nameplate
  });
}

function normalizeSilhouette(silhouette) {
  return {
    height: asNumber(silhouette.height, 42),
    shoulderWidth: asNumber(silhouette.shoulderWidth, 16),
    hemWidth: asNumber(silhouette.hemWidth, 20),
    lineWidth: asNumber(silhouette.lineWidth, 2.2),
    headRadius: asNumber(silhouette.headRadius, 8),
    shadowRadius: asNumber(silhouette.shadowRadius, 17)
  };
}

function normalizePalette(palette) {
  return {
    line: palette.line || "#17263a",
    skin: palette.skin || "#f0d8bb",
    robe: palette.robe || "#58779a",
    trim: palette.trim || "#d6bc8a",
    accent: palette.accent || "#9fd1ff",
    glow: palette.glow || "#f6d88f",
    nameplate: palette.nameplate || "#ddeeff"
  };
}

function drawShadow(ctx, x, y, radius, alpha) {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAura(ctx, x, y, glowColor, selected, isPlayer, now) {
  if (!selected && !isPlayer) {
    return;
  }
  const pulse = 0.84 + Math.sin(now / 260) * 0.12;
  const radius = isPlayer ? 18 : 14;
  const alpha = isPlayer ? 0.18 : 0.14;

  ctx.fillStyle = toRgba(glowColor, alpha * pulse);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (selected) {
    ctx.strokeStyle = toRgba(glowColor, 0.92);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawRobeBody(ctx, x, y, silhouette, palette, emblem) {
  const shoulderY = y - silhouette.height + 16;
  const hemY = y - 8;

  ctx.fillStyle = palette.robe;
  ctx.beginPath();
  ctx.moveTo(x - silhouette.shoulderWidth, shoulderY);
  ctx.lineTo(x + silhouette.shoulderWidth, shoulderY);
  ctx.lineTo(x + silhouette.hemWidth, hemY);
  ctx.lineTo(x - silhouette.hemWidth, hemY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = silhouette.lineWidth;
  ctx.beginPath();
  ctx.moveTo(x - silhouette.shoulderWidth, shoulderY);
  ctx.lineTo(x + silhouette.shoulderWidth, shoulderY);
  ctx.lineTo(x + silhouette.hemWidth, hemY);
  ctx.lineTo(x - silhouette.hemWidth, hemY);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = palette.trim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, shoulderY + 4);
  ctx.lineTo(x, hemY - 2);
  ctx.stroke();

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = silhouette.lineWidth;
  ctx.beginPath();
  ctx.moveTo(x - 2, hemY - 2);
  ctx.lineTo(x - 8, y + 8);
  ctx.moveTo(x + 2, hemY - 2);
  ctx.lineTo(x + 8, y + 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - silhouette.shoulderWidth + 1, shoulderY + 3);
  ctx.lineTo(x - silhouette.shoulderWidth - 10, shoulderY + 13);
  ctx.moveTo(x + silhouette.shoulderWidth - 1, shoulderY + 3);
  ctx.lineTo(x + silhouette.shoulderWidth + 10, shoulderY + 13);
  ctx.stroke();

  drawEmblem(ctx, x, shoulderY + 10, emblem, palette);
}

function drawHead(ctx, x, y, radius, palette, model) {
  ctx.fillStyle = palette.skin;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  drawHair(ctx, x, y, radius, model.hairStyle, palette.line);
  drawHeadwear(ctx, x, y, radius, model.headwear, palette);
}

function drawHair(ctx, x, y, radius, hairStyle, color) {
  if (hairStyle === "bald") {
    return;
  }

  ctx.fillStyle = color;
  if (hairStyle === "long") {
    ctx.beginPath();
    ctx.moveTo(x - radius + 1, y - radius + 2);
    ctx.lineTo(x + radius - 1, y - radius + 2);
    ctx.lineTo(x + radius - 3, y + radius + 8);
    ctx.lineTo(x - radius + 3, y + radius + 8);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y - radius + 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeadwear(ctx, x, y, radius, headwear, palette) {
  if (!headwear || headwear === "none") {
    return;
  }

  if (headwear === "headband") {
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius - 1, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    return;
  }

  if (headwear === "cap") {
    ctx.fillStyle = palette.trim;
    roundedRect(ctx, x - radius + 1, y - radius - 5, radius * 2 - 2, 7, 3);
    ctx.fill();
    return;
  }

  if (headwear === "official_cap") {
    ctx.fillStyle = palette.trim;
    roundedRect(ctx, x - radius - 2, y - radius - 5, radius * 2 + 4, 7, 2);
    ctx.fill();
    ctx.fillStyle = palette.line;
    ctx.fillRect(x - 2, y - radius - 9, 4, 4);
    return;
  }

  if (headwear === "straw_hat") {
    ctx.fillStyle = "#c39a62";
    ctx.beginPath();
    ctx.ellipse(x, y - radius - 2, radius + 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b1854f";
    ctx.beginPath();
    ctx.moveTo(x - radius + 1, y - radius - 2);
    ctx.lineTo(x + radius - 1, y - radius - 2);
    ctx.lineTo(x, y - radius - 10);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (headwear === "hood") {
    ctx.fillStyle = toRgba(palette.line, 0.86);
    ctx.beginPath();
    ctx.arc(x, y - 2, radius + 3, Math.PI, 0);
    ctx.lineTo(x + radius + 1, y + radius + 2);
    ctx.lineTo(x - radius - 1, y + radius + 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawAccessory(ctx, x, y, silhouette, palette, accessory) {
  if (!accessory || accessory === "none") {
    return;
  }

  const shoulderY = y - silhouette.height + 16;
  const hemY = y - 8;
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = palette.line;

  if (accessory === "sword") {
    ctx.beginPath();
    ctx.moveTo(x + silhouette.shoulderWidth + 4, shoulderY + 2);
    ctx.lineTo(x + silhouette.hemWidth + 10, hemY + 4);
    ctx.stroke();
    ctx.fillStyle = palette.trim;
    ctx.fillRect(x + silhouette.shoulderWidth + 2, shoulderY, 4, 6);
    return;
  }

  if (accessory === "spear" || accessory === "staff") {
    ctx.beginPath();
    ctx.moveTo(x + silhouette.hemWidth + 8, shoulderY - 10);
    ctx.lineTo(x + silhouette.hemWidth + 8, y + 10);
    ctx.stroke();
    if (accessory === "spear") {
      ctx.fillStyle = palette.trim;
      ctx.beginPath();
      ctx.moveTo(x + silhouette.hemWidth + 8, shoulderY - 18);
      ctx.lineTo(x + silhouette.hemWidth + 3, shoulderY - 10);
      ctx.lineTo(x + silhouette.hemWidth + 13, shoulderY - 10);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (accessory === "whisk") {
    ctx.beginPath();
    ctx.moveTo(x + silhouette.hemWidth + 8, shoulderY - 6);
    ctx.lineTo(x + silhouette.hemWidth + 8, y + 9);
    ctx.stroke();
    ctx.strokeStyle = toRgba(palette.trim, 0.86);
    for (let i = -4; i <= 4; i += 2) {
      ctx.beginPath();
      ctx.moveTo(x + silhouette.hemWidth + 8, shoulderY - 6);
      ctx.lineTo(x + silhouette.hemWidth + 14 + i, shoulderY - 14);
      ctx.stroke();
    }
    return;
  }

  if (accessory === "ledger" || accessory === "scroll" || accessory === "abacus") {
    ctx.fillStyle = accessory === "scroll" ? "#e5d8ba" : "#8d6743";
    roundedRect(ctx, x - silhouette.hemWidth - 18, hemY - 8, 13, 16, 2);
    ctx.fill();
    if (accessory === "abacus") {
      ctx.strokeStyle = palette.trim;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - silhouette.hemWidth - 16, hemY - 4 + i * 4);
        ctx.lineTo(x - silhouette.hemWidth - 7, hemY - 4 + i * 4);
        ctx.stroke();
      }
    }
    return;
  }

  if (accessory === "lantern") {
    ctx.strokeStyle = palette.line;
    ctx.beginPath();
    ctx.moveTo(x + silhouette.hemWidth + 8, shoulderY + 6);
    ctx.lineTo(x + silhouette.hemWidth + 8, hemY + 5);
    ctx.stroke();
    ctx.fillStyle = toRgba(palette.trim, 0.88);
    roundedRect(ctx, x + silhouette.hemWidth + 1, hemY + 4, 14, 12, 3);
    ctx.fill();
    return;
  }

  if (accessory === "beads") {
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, shoulderY + 2, 7, 0.1, Math.PI - 0.1);
    ctx.stroke();
    return;
  }

  if (accessory === "cloak") {
    ctx.fillStyle = toRgba(palette.line, 0.32);
    ctx.beginPath();
    ctx.moveTo(x - silhouette.shoulderWidth - 2, shoulderY + 1);
    ctx.lineTo(x - silhouette.hemWidth - 8, hemY + 6);
    ctx.lineTo(x - silhouette.hemWidth + 2, hemY + 2);
    ctx.lineTo(x - silhouette.shoulderWidth + 2, shoulderY + 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawEmblem(ctx, x, y, emblem, palette) {
  if (!emblem || emblem === "none") {
    return;
  }

  ctx.fillStyle = toRgba(palette.trim, 0.92);
  if (emblem === "lotus") {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (emblem === "badge") {
    roundedRect(ctx, x - 2.5, y - 2.5, 5, 5, 1);
    ctx.fill();
    return;
  }

  if (emblem === "hero") {
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.lineTo(x - 3, y + 3);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (emblem === "shadow") {
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20, 24, 33, 0.56)";
    ctx.beginPath();
    ctx.arc(x + 1, y - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x - 2, y - 2);
  ctx.lineTo(x + 2, y - 2);
  ctx.lineTo(x + 2, y + 2);
  ctx.lineTo(x - 2, y + 2);
  ctx.closePath();
  ctx.fill();
}

function drawNameplate(ctx, { x, y, text, accent, textColor }) {
  const label = text || "";
  const width = Math.max(28, 14 + label.length * 14);
  const height = 20;
  const left = x - width / 2;
  const top = y - height / 2;

  ctx.fillStyle = "rgba(12, 20, 32, 0.8)";
  roundedRect(ctx, left, top, width, height, 10);
  ctx.fill();

  ctx.strokeStyle = toRgba(accent, 0.92);
  ctx.lineWidth = 1.1;
  roundedRect(ctx, left, top, width, height, 10);
  ctx.stroke();

  ctx.fillStyle = textColor || "#ddeeff";
  ctx.font = "12px 'Noto Serif SC', serif";
  ctx.fillText(label, left + 10, top + 14);
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function asNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function toRgba(hex, alpha) {
  if (typeof hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return `rgba(255, 230, 170, ${alpha})`;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
