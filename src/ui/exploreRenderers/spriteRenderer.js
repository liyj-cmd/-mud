import { drawProceduralScene } from "./proceduralRenderer.js";

const PLAYER_TOKEN_SIZE = 50;
const NPC_TOKEN_SIZE = 42;

export function drawSpriteScene(ctx, sceneCtx, assets) {
  if (!ctx || !sceneCtx || !sceneCtx.canvas || !sceneCtx.payload) {
    return;
  }

  const { canvas, payload, scene, now } = sceneCtx;
  const pack = assets?.pack || null;
  const themeAssets = assets?.themeAssets || {};
  const loader = assets?.loader || null;

  // Keep procedural renderer as baseline so any missing sprite naturally falls back.
  drawProceduralScene(canvas, payload);

  if (!loader || !scene) {
    return;
  }

  drawSceneBackground(ctx, scene, themeAssets, loader);
  drawObstacleOverlays(ctx, scene, themeAssets, loader);
  drawExitOverlays(ctx, scene, themeAssets, loader);
  drawPoiOverlays(ctx, scene, themeAssets, loader);
  drawCharacterOverlays(ctx, payload, pack, loader, now);
  drawUiStamp(ctx, scene, pack, loader);
}

function drawSceneBackground(ctx, scene, themeAssets, loader) {
  const bgUrl = themeAssets.sceneBackground;
  const bgImage = loader.getImage(bgUrl);
  if (!bgImage) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.76;
  ctx.drawImage(bgImage, 0, 0, scene.size.width, scene.size.height);
  ctx.restore();
}

function drawObstacleOverlays(ctx, scene, themeAssets, loader) {
  for (const obstacle of scene.obstacles || []) {
    const sprite = resolveSprite(themeAssets.obstacleSprites, obstacle.visualKey, obstacle.id);
    const image = loader.getImage(sprite);
    if (!image) {
      continue;
    }

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.restore();
  }
}

function drawExitOverlays(ctx, scene, themeAssets, loader) {
  for (const exit of scene.exits || []) {
    const sprite = resolveSprite(themeAssets.exitSprites, exit.visualKey, exit.id);
    const image = loader.getImage(sprite);
    if (!image) {
      continue;
    }

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(image, exit.x, exit.y, exit.width, exit.height);
    ctx.fillStyle = "rgba(252, 242, 221, 0.94)";
    ctx.font = "11px 'Noto Serif SC', serif";
    ctx.fillText(exit.label || "出口", exit.x + 6, exit.y + 13);
    ctx.restore();
  }
}

function drawPoiOverlays(ctx, scene, themeAssets, loader) {
  for (const poi of scene.pois || []) {
    const sprite = resolveSprite(themeAssets.poiSprites, poi.visualKey, poi.id);
    const image = loader.getImage(sprite);
    if (!image) {
      continue;
    }

    const radius = Number.isFinite(poi.radius) ? poi.radius : 26;
    const size = Math.max(28, radius * 1.8);
    const x = poi.x - size / 2;
    const y = poi.y - size / 2;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
  }
}

function drawCharacterOverlays(ctx, payload, pack, loader, now) {
  const playerToken = pack?.characters?.playerToken;
  const npcToken = pack?.characters?.npcToken;
  const selectedRing = pack?.characters?.selectedRing;

  const npcs = Array.isArray(payload.npcs) ? payload.npcs : [];
  const selectedNpcId = payload.selectedNpcId || null;

  const ringImage = loader.getImage(selectedRing);
  const npcImage = loader.getImage(npcToken);
  const playerImage = loader.getImage(playerToken);

  for (const npc of npcs) {
    const bob = Math.sin(now / 420 + npc.position.x * 0.01) * 1.6;
    const x = npc.position.x;
    const y = npc.position.y + bob;

    if (ringImage && npc.id === selectedNpcId) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(ringImage, x - 26, y - 52, 52, 52);
      ctx.restore();
    }

    if (npcImage) {
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.drawImage(npcImage, x - NPC_TOKEN_SIZE / 2, y - NPC_TOKEN_SIZE, NPC_TOKEN_SIZE, NPC_TOKEN_SIZE);
      ctx.restore();
    }
  }

  if (playerImage && payload.playerPos) {
    const x = payload.playerPos.x;
    const y = payload.playerPos.y + Math.sin(now / 390 + x * 0.01) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.drawImage(
      playerImage,
      x - PLAYER_TOKEN_SIZE / 2,
      y - PLAYER_TOKEN_SIZE,
      PLAYER_TOKEN_SIZE,
      PLAYER_TOKEN_SIZE
    );
    ctx.restore();
  }
}

function drawUiStamp(ctx, scene, pack, loader) {
  const stampUrl = pack?.ui?.bookStamp;
  const image = loader.getImage(stampUrl);
  if (!image) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.drawImage(image, scene.size.width - 110, scene.size.height - 90, 92, 72);
  ctx.restore();
}

function resolveSprite(spriteTable, visualKey, legacyId) {
  if (!spriteTable || typeof spriteTable !== "object") {
    return null;
  }
  if (isNonEmptyString(visualKey) && spriteTable[visualKey]) {
    return spriteTable[visualKey];
  }
  if (isNonEmptyString(legacyId) && spriteTable[legacyId]) {
    return spriteTable[legacyId];
  }
  return spriteTable.default || null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
