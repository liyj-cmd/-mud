import { normalizeSceneThemeId } from "../data/sceneThemes.js";
import { buildNpcCharacterModel, buildPlayerCharacterModel } from "../runtime/characterModelRuntime.js";
import { drawCharacterModel } from "./characterModelRenderer.js";

const FLOOR_GRID = 48;
const MARKET_SIGN_BY_STALL_ID = {
  stall_north_west: "绸缎",
  stall_north_mid: "药材",
  stall_north_east: "兵器",
  stall_center: "杂货"
};

const THEME_COLORS = {
  default: {
    exitFillA: "rgba(157, 122, 77, 0.24)",
    exitFillB: "rgba(97, 73, 47, 0.2)",
    exitStroke: "rgba(236, 205, 148, 0.84)",
    exitGlow: "rgba(255, 226, 166, 0.2)",
    exitText: "rgba(255, 239, 196, 0.96)",
    poiGlow: "rgba(255, 212, 132, 0.1)",
    poiFill: "rgba(255, 219, 144, 0.2)",
    poiStroke: "rgba(255, 227, 168, 0.9)",
    poiText: "#ffe8b7"
  },
  market: {
    exitFillA: "rgba(161, 120, 79, 0.28)",
    exitFillB: "rgba(110, 72, 44, 0.24)",
    exitStroke: "rgba(245, 213, 146, 0.88)",
    exitGlow: "rgba(255, 229, 158, 0.22)",
    exitText: "rgba(255, 238, 193, 0.98)",
    poiGlow: "rgba(255, 210, 128, 0.12)",
    poiFill: "rgba(255, 220, 152, 0.2)",
    poiStroke: "rgba(255, 228, 165, 0.9)",
    poiText: "#ffe8b7"
  },
  magistrate_square: {
    exitFillA: "rgba(109, 128, 156, 0.25)",
    exitFillB: "rgba(70, 86, 112, 0.2)",
    exitStroke: "rgba(177, 203, 234, 0.82)",
    exitGlow: "rgba(174, 205, 240, 0.2)",
    exitText: "rgba(226, 238, 255, 0.96)",
    poiGlow: "rgba(167, 199, 235, 0.11)",
    poiFill: "rgba(170, 203, 241, 0.18)",
    poiStroke: "rgba(197, 219, 247, 0.88)",
    poiText: "#ddebff"
  },
  temple_courtyard: {
    exitFillA: "rgba(134, 151, 112, 0.26)",
    exitFillB: "rgba(87, 102, 69, 0.22)",
    exitStroke: "rgba(206, 217, 174, 0.82)",
    exitGlow: "rgba(205, 220, 167, 0.2)",
    exitText: "rgba(236, 243, 212, 0.96)",
    poiGlow: "rgba(209, 224, 166, 0.11)",
    poiFill: "rgba(197, 218, 152, 0.17)",
    poiStroke: "rgba(217, 230, 185, 0.86)",
    poiText: "#e9f0ce"
  }
};

export function drawExploreScene(canvas, payload) {
  if (!canvas || !payload || !payload.scene) {
    return;
  }

  const scene = payload.scene;
  const themeId = normalizeSceneThemeId(scene.themeId);
  const palette = THEME_COLORS[themeId] || THEME_COLORS.default;
  const playerPos = payload.playerPos || scene.spawn;
  const npcs = Array.isArray(payload.npcs) ? payload.npcs : [];
  const selectedNpcId = payload.selectedNpcId || null;
  const now = Number.isFinite(payload.now) ? payload.now : performance.now();

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const scaleX = width / scene.size.width;
  const scaleY = height / scene.size.height;

  ctx.clearRect(0, 0, width, height);
  drawSkyBackdrop(ctx, themeId, width, height);

  ctx.save();
  ctx.scale(scaleX, scaleY);

  drawFloor(ctx, scene, themeId, now);
  drawGrid(ctx, scene.size.width, scene.size.height);
  drawSceneDecorations(ctx, scene, themeId, now);
  drawExits(ctx, scene.exits || [], palette, now);
  drawObstacles(ctx, scene, themeId, now);
  drawPois(ctx, scene, themeId, palette, now);
  drawNpcs(ctx, npcs, selectedNpcId, now);
  drawPlayer(ctx, playerPos, payload.player, now);

  ctx.restore();
}

function drawSkyBackdrop(ctx, themeId, width, height) {
  if (themeId === "market") {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#456a92");
    sky.addColorStop(0.45, "#2e4a6c");
    sky.addColorStop(1, "#18283d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 226, 157, 0.2)";
    ctx.beginPath();
    ctx.arc(width * 0.16, height * 0.12, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(154, 201, 248, 0.14)";
    ctx.beginPath();
    ctx.ellipse(width * 0.82, height * 0.18, 190, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (themeId === "magistrate_square") {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#50647f");
    sky.addColorStop(0.5, "#344457");
    sky.addColorStop(1, "#1e2836");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(213, 228, 255, 0.08)";
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.16, 210, 84, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (themeId === "temple_courtyard") {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#5e7566");
    sky.addColorStop(0.44, "#3f5648");
    sky.addColorStop(1, "#223328");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(214, 230, 196, 0.1)";
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.14, 170, 76, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(204, 221, 188, 0.08)";
    ctx.beginPath();
    ctx.ellipse(width * 0.8, height * 0.18, 200, 88, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#27405f");
  sky.addColorStop(0.52, "#1a2b42");
  sky.addColorStop(1, "#101a2a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
}

function drawFloor(ctx, scene, themeId, now) {
  if (themeId === "market") {
    drawMarketStreet(ctx, scene.size.width, scene.size.height, now);
    return;
  }

  if (themeId === "magistrate_square") {
    drawMagistrateSquareGround(ctx, scene.size.width, scene.size.height, now);
    return;
  }

  if (themeId === "temple_courtyard") {
    drawTempleCourtyardGround(ctx, scene.size.width, scene.size.height, now);
    return;
  }

  const floorTop = scene.size.height * 0.3;
  const floor = ctx.createLinearGradient(0, floorTop, 0, scene.size.height);
  floor.addColorStop(0, "rgba(62, 84, 111, 0.46)");
  floor.addColorStop(1, "rgba(25, 38, 56, 0.7)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorTop, scene.size.width, scene.size.height - floorTop);
}

function drawMarketStreet(ctx, width, height, now) {
  const horizon = height * 0.26;
  const roadTop = height * 0.36;

  const farWall = ctx.createLinearGradient(0, horizon, 0, roadTop);
  farWall.addColorStop(0, "rgba(116, 90, 66, 0.78)");
  farWall.addColorStop(1, "rgba(72, 55, 40, 0.58)");
  ctx.fillStyle = farWall;
  ctx.fillRect(0, horizon, width, roadTop - horizon);

  drawRoofBlocks(ctx, width, horizon);
  drawCrowdSilhouettes(ctx, width, roadTop, now);

  const road = ctx.createLinearGradient(0, roadTop, 0, height);
  road.addColorStop(0, "rgba(145, 126, 103, 0.4)");
  road.addColorStop(1, "rgba(92, 76, 58, 0.7)");
  ctx.fillStyle = road;
  ctx.fillRect(0, roadTop, width, height - roadTop);

  drawCobblestone(ctx, width, height, roadTop);
  drawLanternLines(ctx, width, horizon + 20, now);
}

function drawMagistrateSquareGround(ctx, width, height, now) {
  const horizon = height * 0.25;
  const stoneTop = height * 0.33;

  const yamenWall = ctx.createLinearGradient(0, horizon, 0, stoneTop);
  yamenWall.addColorStop(0, "rgba(82, 92, 106, 0.84)");
  yamenWall.addColorStop(1, "rgba(63, 74, 90, 0.64)");
  ctx.fillStyle = yamenWall;
  ctx.fillRect(0, horizon, width, stoneTop - horizon);

  drawYamenRoofline(ctx, width, horizon + 4);
  drawPatrolSilhouettes(ctx, width, stoneTop, now);

  const square = ctx.createLinearGradient(0, stoneTop, 0, height);
  square.addColorStop(0, "rgba(134, 148, 167, 0.38)");
  square.addColorStop(1, "rgba(86, 100, 118, 0.66)");
  ctx.fillStyle = square;
  ctx.fillRect(0, stoneTop, width, height - stoneTop);

  drawStonePlates(ctx, width, height, stoneTop);
  drawYamenBannerLines(ctx, width, horizon + 18, now);
}

function drawTempleCourtyardGround(ctx, width, height, now) {
  const horizon = height * 0.24;
  const courtTop = height * 0.34;

  const mountain = ctx.createLinearGradient(0, horizon, 0, courtTop);
  mountain.addColorStop(0, "rgba(72, 92, 74, 0.7)");
  mountain.addColorStop(1, "rgba(55, 73, 57, 0.56)");
  ctx.fillStyle = mountain;
  ctx.fillRect(0, horizon, width, courtTop - horizon);

  drawTempleRoofBlocks(ctx, width, horizon);
  drawFogBelt(ctx, width, courtTop, now);

  const court = ctx.createLinearGradient(0, courtTop, 0, height);
  court.addColorStop(0, "rgba(138, 147, 119, 0.36)");
  court.addColorStop(1, "rgba(92, 101, 77, 0.62)");
  ctx.fillStyle = court;
  ctx.fillRect(0, courtTop, width, height - courtTop);

  drawTempleFlagstones(ctx, width, height, courtTop);
}

function drawRoofBlocks(ctx, width, horizon) {
  const blocks = [
    { x: 40, w: 160, h: 42 },
    { x: 212, w: 146, h: 54 },
    { x: 386, w: 196, h: 48 },
    { x: 610, w: 142, h: 58 },
    { x: 768, w: 156, h: 46 }
  ];

  for (const block of blocks) {
    ctx.fillStyle = "rgba(58, 45, 35, 0.78)";
    ctx.fillRect(block.x, horizon - block.h, block.w, block.h);

    ctx.fillStyle = "rgba(126, 72, 52, 0.82)";
    ctx.beginPath();
    ctx.moveTo(block.x - 10, horizon - block.h);
    ctx.lineTo(block.x + block.w + 10, horizon - block.h);
    ctx.lineTo(block.x + block.w - 8, horizon - block.h - 15);
    ctx.lineTo(block.x + 8, horizon - block.h - 15);
    ctx.closePath();
    ctx.fill();
  }
}

function drawYamenRoofline(ctx, width, y) {
  const segments = [
    { x: 56, w: 210, h: 46 },
    { x: 286, w: 392, h: 58 },
    { x: 708, w: 196, h: 42 }
  ];

  for (const segment of segments) {
    ctx.fillStyle = "rgba(45, 56, 73, 0.84)";
    ctx.fillRect(segment.x, y - segment.h, segment.w, segment.h);

    ctx.fillStyle = "rgba(96, 110, 130, 0.86)";
    ctx.beginPath();
    ctx.moveTo(segment.x - 10, y - segment.h + 6);
    ctx.lineTo(segment.x + segment.w + 10, y - segment.h + 6);
    ctx.lineTo(segment.x + segment.w - 8, y - segment.h - 10);
    ctx.lineTo(segment.x + 8, y - segment.h - 10);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTempleRoofBlocks(ctx, width, horizon) {
  const blocks = [
    { x: 72, w: 198, h: 52 },
    { x: 294, w: 362, h: 62 },
    { x: 696, w: 188, h: 50 }
  ];

  for (const block of blocks) {
    ctx.fillStyle = "rgba(54, 68, 52, 0.84)";
    ctx.fillRect(block.x, horizon - block.h, block.w, block.h);

    ctx.fillStyle = "rgba(122, 104, 68, 0.82)";
    ctx.beginPath();
    ctx.moveTo(block.x - 8, horizon - block.h + 4);
    ctx.lineTo(block.x + block.w + 8, horizon - block.h + 4);
    ctx.lineTo(block.x + block.w - 10, horizon - block.h - 12);
    ctx.lineTo(block.x + 10, horizon - block.h - 12);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCrowdSilhouettes(ctx, width, baselineY, now) {
  const crowd = [
    { x: 90, h: 21 },
    { x: 130, h: 17 },
    { x: 210, h: 23 },
    { x: 264, h: 18 },
    { x: 320, h: 22 },
    { x: 402, h: 19 },
    { x: 488, h: 24 },
    { x: 546, h: 16 },
    { x: 620, h: 20 },
    { x: 698, h: 18 },
    { x: 758, h: 22 },
    { x: 832, h: 19 }
  ];

  ctx.fillStyle = "rgba(33, 27, 24, 0.56)";
  for (const item of crowd) {
    const bob = Math.sin(now / 700 + item.x * 0.03) * 1.4;
    const y = baselineY + bob;
    ctx.beginPath();
    ctx.ellipse(item.x, y, 9, item.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPatrolSilhouettes(ctx, width, baselineY, now) {
  const patrol = [
    { x: 124, h: 21 },
    { x: 200, h: 24 },
    { x: 318, h: 20 },
    { x: 432, h: 22 },
    { x: 548, h: 19 },
    { x: 660, h: 23 },
    { x: 784, h: 20 }
  ];

  ctx.fillStyle = "rgba(33, 42, 56, 0.5)";
  for (const unit of patrol) {
    const bob = Math.sin(now / 680 + unit.x * 0.018) * 1.2;
    const y = baselineY + bob;
    ctx.beginPath();
    ctx.ellipse(unit.x, y, 8.5, unit.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCobblestone(ctx, width, height, startY) {
  const rowHeight = 15;
  const colWidth = 22;
  for (let y = startY; y < height; y += rowHeight) {
    for (let x = -20; x < width + 20; x += colWidth) {
      const offset = Math.floor((y - startY) / rowHeight) % 2 === 0 ? 0 : 11;
      const sx = x + offset;
      ctx.fillStyle = (x / colWidth + y / rowHeight) % 2 === 0 ? "rgba(173, 154, 128, 0.18)" : "rgba(124, 104, 83, 0.16)";
      roundedRect(ctx, sx, y, 18, 9, 2);
      ctx.fill();
    }
  }
}

function drawStonePlates(ctx, width, height, startY) {
  const rowHeight = 24;
  const colWidth = 52;

  for (let y = startY; y < height; y += rowHeight) {
    for (let x = -30; x < width + 30; x += colWidth) {
      const shift = Math.floor((y - startY) / rowHeight) % 2 === 0 ? 0 : 26;
      const sx = x + shift;
      ctx.fillStyle = (x / colWidth + y / rowHeight) % 2 === 0 ? "rgba(174, 188, 206, 0.2)" : "rgba(123, 138, 158, 0.18)";
      roundedRect(ctx, sx, y, 46, 16, 3);
      ctx.fill();
    }
  }
}

function drawTempleFlagstones(ctx, width, height, startY) {
  const rowHeight = 22;
  const colWidth = 48;

  for (let y = startY; y < height; y += rowHeight) {
    for (let x = -24; x < width + 24; x += colWidth) {
      const shift = Math.floor((y - startY) / rowHeight) % 2 === 0 ? 0 : 24;
      const sx = x + shift;
      ctx.fillStyle = (x / colWidth + y / rowHeight) % 2 === 0 ? "rgba(186, 194, 164, 0.2)" : "rgba(132, 141, 114, 0.17)";
      roundedRect(ctx, sx, y, 42, 14, 3);
      ctx.fill();
    }
  }
}

function drawFogBelt(ctx, width, baselineY, now) {
  ctx.fillStyle = "rgba(212, 224, 198, 0.08)";
  for (let i = 0; i < 5; i += 1) {
    const x = (i + 0.5) * (width / 5);
    const wobble = Math.sin(now / 1200 + i * 0.8) * 8;
    ctx.beginPath();
    ctx.ellipse(x + wobble, baselineY + i * 4, 128, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLanternLines(ctx, width, y, now) {
  const lines = [
    { x1: 20, y1: y + 10, x2: width - 20, y2: y - 6, count: 8 },
    { x1: 80, y1: y + 34, x2: width - 70, y2: y + 16, count: 7 }
  ];

  for (const line of lines) {
    ctx.strokeStyle = "rgba(83, 61, 48, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();

    for (let i = 0; i < line.count; i += 1) {
      const t = (i + 1) / (line.count + 1);
      const x = line.x1 + (line.x2 - line.x1) * t;
      const yPos = line.y1 + (line.y2 - line.y1) * t;
      drawLantern(ctx, x, yPos + 8, now + i * 180);
    }
  }
}

function drawYamenBannerLines(ctx, width, y, now) {
  const lines = [
    { x1: 42, y1: y + 8, x2: width - 42, y2: y + 2, count: 7 },
    { x1: 92, y1: y + 32, x2: width - 98, y2: y + 22, count: 6 }
  ];

  for (const line of lines) {
    ctx.strokeStyle = "rgba(81, 92, 114, 0.74)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();

    for (let i = 0; i < line.count; i += 1) {
      const t = (i + 1) / (line.count + 1);
      const x = line.x1 + (line.x2 - line.x1) * t;
      const yPos = line.y1 + (line.y2 - line.y1) * t;
      drawYamenBanner(ctx, x, yPos + 8, now + i * 130);
    }
  }
}

function drawLantern(ctx, x, y, now) {
  const sway = Math.sin(now / 550 + x * 0.02) * 2;
  const lx = x + sway;

  ctx.strokeStyle = "rgba(100, 73, 57, 0.76)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(lx, y - 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 126, 90, 0.88)";
  roundedRect(ctx, lx - 7, y - 2, 14, 17, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 230, 164, 0.45)";
  roundedRect(ctx, lx - 4, y + 1, 8, 11, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(140, 66, 47, 0.9)";
  ctx.fillRect(lx - 2, y + 15, 4, 3);
}

function drawYamenBanner(ctx, x, y, now) {
  const sway = Math.sin(now / 480 + x * 0.015) * 2;
  const bx = x + sway;

  ctx.strokeStyle = "rgba(96, 109, 133, 0.82)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(bx, y - 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(88, 112, 148, 0.9)";
  roundedRect(ctx, bx - 8, y - 2, 16, 19, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(221, 230, 247, 0.9)";
  ctx.font = "10px 'Noto Serif SC', serif";
  ctx.fillText("令", bx - 3, y + 11);
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = "rgba(224, 211, 187, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += FLOOR_GRID) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += FLOOR_GRID) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawSceneDecorations(ctx, scene, themeId, now) {
  if (themeId === "market") {
    drawMarketBanner(ctx, 56, 182, "布庄");
    drawMarketBanner(ctx, 732, 184, "酒肆");
    drawMarketBanner(ctx, 476, 196, "百货");
    drawSteam(ctx, 278, 332, now);
    return;
  }

  if (themeId === "magistrate_square") {
    drawMarketBanner(ctx, 70, 172, "牌票");
    drawMarketBanner(ctx, 772, 172, "案簿");
    drawYamenSign(ctx, 438, 160, "开封府");
    return;
  }

  if (themeId === "temple_courtyard") {
    drawTemplePlaque(ctx, 430, 160, "少林");
    drawIncenseSmokeField(ctx, 488, 262, now);
  }
}

function drawMarketBanner(ctx, x, y, text) {
  ctx.fillStyle = "rgba(118, 49, 41, 0.92)";
  roundedRect(ctx, x, y, 44, 82, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(240, 211, 148, 0.86)";
  ctx.lineWidth = 1.4;
  roundedRect(ctx, x, y, 44, 82, 5);
  ctx.stroke();

  ctx.fillStyle = "#f8e4bc";
  ctx.font = "13px 'Noto Serif SC', serif";
  ctx.fillText(text.slice(0, 1), x + 14, y + 25);
  ctx.fillText(text.slice(1, 2) || "", x + 14, y + 44);
  ctx.fillText(text.slice(2, 3) || "", x + 14, y + 63);
}

function drawYamenSign(ctx, x, y, text) {
  ctx.fillStyle = "rgba(70, 85, 109, 0.92)";
  roundedRect(ctx, x, y, 86, 30, 4);
  ctx.fill();
  ctx.strokeStyle = "rgba(199, 216, 238, 0.82)";
  ctx.lineWidth = 1.2;
  roundedRect(ctx, x, y, 86, 30, 4);
  ctx.stroke();

  ctx.fillStyle = "#e7f0ff";
  ctx.font = "14px 'Noto Serif SC', serif";
  ctx.fillText(text, x + 14, y + 20);
}

function drawTemplePlaque(ctx, x, y, text) {
  ctx.fillStyle = "rgba(95, 82, 54, 0.9)";
  roundedRect(ctx, x, y, 78, 28, 4);
  ctx.fill();
  ctx.strokeStyle = "rgba(227, 212, 171, 0.82)";
  ctx.lineWidth = 1.2;
  roundedRect(ctx, x, y, 78, 28, 4);
  ctx.stroke();

  ctx.fillStyle = "#eee5cd";
  ctx.font = "14px 'Noto Serif SC', serif";
  ctx.fillText(text, x + 17, y + 20);
}

function drawExits(ctx, exits, palette, now) {
  for (const exit of exits) {
    const arch = ctx.createLinearGradient(exit.x, exit.y, exit.x + exit.width, exit.y + exit.height);
    arch.addColorStop(0, palette.exitFillA);
    arch.addColorStop(1, palette.exitFillB);
    ctx.fillStyle = arch;
    roundedRect(ctx, exit.x, exit.y, exit.width, exit.height, 6);
    ctx.fill();

    ctx.strokeStyle = palette.exitStroke;
    ctx.lineWidth = 1.8;
    roundedRect(ctx, exit.x, exit.y, exit.width, exit.height, 6);
    ctx.stroke();

    const pulse = 0.78 + Math.sin(now / 220 + exit.x * 0.01) * 0.12;
    ctx.fillStyle = alphaColor(palette.exitGlow, 0.2 * pulse);
    roundedRect(ctx, exit.x + 2, exit.y + 2, exit.width - 4, 16, 4);
    ctx.fill();

    ctx.fillStyle = palette.exitText;
    ctx.font = "12px 'Noto Serif SC', serif";
    ctx.fillText(exit.label || "出口", exit.x + 8, exit.y + 14);
  }
}

function drawObstacles(ctx, scene, themeId, now) {
  for (const obstacle of scene.obstacles || []) {
    if (themeId === "market") {
      if (obstacle.id.startsWith("stall_")) {
        drawMarketStall(ctx, obstacle, now);
        continue;
      }
      if (obstacle.id === "tea_table") {
        drawTeaTable(ctx, obstacle, now);
        continue;
      }
    }

    if (themeId === "magistrate_square") {
      if (obstacle.id === "yamen_gate") {
        drawYamenGate(ctx, obstacle);
        continue;
      }
      if (obstacle.id === "drum_tower") {
        drawDrumTower(ctx, obstacle, now);
        continue;
      }
      if (obstacle.id === "patrol_booth") {
        drawPatrolBooth(ctx, obstacle);
        continue;
      }
      if (obstacle.id === "archive_cart" || obstacle.id === "river_crates") {
        drawArchiveGoods(ctx, obstacle);
        continue;
      }
    }

    if (themeId === "temple_courtyard") {
      if (obstacle.id === "buddha_hall") {
        drawTempleHall(ctx, obstacle);
        continue;
      }
      if (obstacle.id === "incense_cauldron") {
        drawIncenseCauldron(ctx, obstacle, now);
        continue;
      }
      if (obstacle.id === "pine_north_west" || obstacle.id === "pine_north_east") {
        drawPineCluster(ctx, obstacle, now);
        continue;
      }
      if (obstacle.id === "scripture_table" || obstacle.id === "training_rack") {
        drawTempleFixture(ctx, obstacle);
        continue;
      }
    }

    drawGenericObstacle(ctx, obstacle);
  }
}

function drawMarketStall(ctx, obstacle, now) {
  const bodyY = obstacle.y + 18;
  const canopyHeight = 28;
  const stripe = 18;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  roundedRect(ctx, obstacle.x + 4, obstacle.y + obstacle.height - 2, obstacle.width, 13, 7);
  ctx.fill();

  for (let i = 0; i < obstacle.width; i += stripe) {
    const odd = Math.floor(i / stripe) % 2 === 0;
    ctx.fillStyle = odd ? "rgba(194, 78, 63, 0.9)" : "rgba(236, 209, 161, 0.88)";
    roundedRect(ctx, obstacle.x + i, obstacle.y, Math.min(stripe, obstacle.width - i), canopyHeight, 4);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(105, 70, 44, 0.88)";
  ctx.lineWidth = 1.2;
  roundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, canopyHeight, 4);
  ctx.stroke();

  ctx.fillStyle = "rgba(80, 57, 39, 0.95)";
  ctx.fillRect(obstacle.x + 6, bodyY, 8, obstacle.height - 24);
  ctx.fillRect(obstacle.x + obstacle.width - 14, bodyY, 8, obstacle.height - 24);

  ctx.fillStyle = "rgba(117, 86, 60, 0.9)";
  roundedRect(ctx, obstacle.x + 14, bodyY + 10, obstacle.width - 28, obstacle.height - 34, 4);
  ctx.fill();

  drawGoodsPile(ctx, obstacle.x + 20, obstacle.y + obstacle.height - 18, obstacle.width - 40);

  const sign = MARKET_SIGN_BY_STALL_ID[obstacle.id] || "货摊";
  drawSignBoard(ctx, obstacle.x + obstacle.width / 2 - 20, obstacle.y + canopyHeight + 4, sign, now);
}

function drawYamenGate(ctx, obstacle) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(85, 103, 129, 0.9)",
    bottom: "rgba(54, 67, 89, 0.88)",
    stroke: "rgba(192, 210, 236, 0.42)"
  });

  ctx.fillStyle = "rgba(62, 49, 42, 0.84)";
  roundedRect(ctx, obstacle.x + 14, obstacle.y + 18, obstacle.width - 28, obstacle.height - 30, 7);
  ctx.fill();

  ctx.fillStyle = "rgba(211, 194, 158, 0.86)";
  roundedRect(ctx, obstacle.x + obstacle.width / 2 - 38, obstacle.y + 30, 76, 24, 4);
  ctx.fill();
  ctx.fillStyle = "#425978";
  ctx.font = "13px 'Noto Serif SC', serif";
  ctx.fillText("明镜高悬", obstacle.x + obstacle.width / 2 - 28, obstacle.y + 47);
}

function drawDrumTower(ctx, obstacle, now) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(78, 90, 116, 0.92)",
    bottom: "rgba(52, 62, 82, 0.88)",
    stroke: "rgba(180, 198, 226, 0.4)"
  });

  const centerX = obstacle.x + obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2 + 8;
  const pulse = 0.88 + Math.sin(now / 330) * 0.08;
  ctx.fillStyle = alphaColor("rgba(213, 178, 130, 1)", 0.74 * pulse);
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(110, 78, 56, 0.86)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPatrolBooth(ctx, obstacle) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(96, 112, 136, 0.9)",
    bottom: "rgba(63, 78, 100, 0.9)",
    stroke: "rgba(182, 204, 236, 0.4)"
  });

  ctx.fillStyle = "rgba(206, 219, 241, 0.7)";
  roundedRect(ctx, obstacle.x + 16, obstacle.y + 22, obstacle.width - 32, 22, 4);
  ctx.fill();

  ctx.fillStyle = "#3f5777";
  ctx.font = "12px 'Noto Serif SC', serif";
  ctx.fillText("巡防", obstacle.x + obstacle.width / 2 - 14, obstacle.y + 38);
}

function drawArchiveGoods(ctx, obstacle) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(128, 108, 86, 0.92)",
    bottom: "rgba(84, 67, 50, 0.88)",
    stroke: "rgba(214, 191, 162, 0.38)"
  });

  for (let i = 0; i < obstacle.width - 24; i += 22) {
    ctx.fillStyle = i % 44 === 0 ? "rgba(178, 149, 116, 0.82)" : "rgba(143, 118, 89, 0.8)";
    roundedRect(ctx, obstacle.x + 12 + i, obstacle.y + obstacle.height - 26, 16, 12, 2);
    ctx.fill();
  }
}

function drawTeaTable(ctx, obstacle, now) {
  drawGenericObstacle(ctx, obstacle);

  const centerX = obstacle.x + obstacle.width / 2;
  const topY = obstacle.y + 24;
  ctx.fillStyle = "rgba(134, 95, 67, 0.92)";
  roundedRect(ctx, centerX - 26, topY, 52, 24, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(99, 70, 48, 0.95)";
  ctx.fillRect(centerX - 12, topY + 24, 6, 22);
  ctx.fillRect(centerX + 6, topY + 24, 6, 22);

  drawTeaSet(ctx, centerX, topY + 10, now);
}

function drawTempleHall(ctx, obstacle) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(93, 93, 69, 0.92)",
    bottom: "rgba(69, 69, 49, 0.9)",
    stroke: "rgba(219, 209, 173, 0.4)"
  });

  ctx.fillStyle = "rgba(116, 87, 58, 0.88)";
  roundedRect(ctx, obstacle.x + 18, obstacle.y + 18, obstacle.width - 36, obstacle.height - 28, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(221, 209, 169, 0.84)";
  roundedRect(ctx, obstacle.x + obstacle.width / 2 - 42, obstacle.y + 30, 84, 20, 4);
  ctx.fill();
  ctx.fillStyle = "#4e5f46";
  ctx.font = "13px 'Noto Serif SC', serif";
  ctx.fillText("般若堂", obstacle.x + obstacle.width / 2 - 22, obstacle.y + 45);
}

function drawIncenseCauldron(ctx, obstacle, now) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(110, 118, 98, 0.9)",
    bottom: "rgba(72, 78, 64, 0.88)",
    stroke: "rgba(206, 214, 182, 0.38)"
  });

  const centerX = obstacle.x + obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2 + 10;
  ctx.fillStyle = "rgba(128, 113, 87, 0.9)";
  roundedRect(ctx, centerX - 22, centerY - 14, 44, 28, 6);
  ctx.fill();

  drawSteam(ctx, centerX - 6, centerY - 16, now);
}

function drawPineCluster(ctx, obstacle, now) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(77, 101, 76, 0.88)",
    bottom: "rgba(49, 69, 47, 0.86)",
    stroke: "rgba(176, 201, 161, 0.34)"
  });

  const centerX = obstacle.x + obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2;
  for (let i = -1; i <= 1; i += 1) {
    const sway = Math.sin(now / 720 + i) * 2;
    ctx.fillStyle = "rgba(46, 80, 48, 0.72)";
    ctx.beginPath();
    ctx.moveTo(centerX + i * 20 + sway, centerY - 30);
    ctx.lineTo(centerX + i * 20 - 16 + sway, centerY + 22);
    ctx.lineTo(centerX + i * 20 + 16 + sway, centerY + 22);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTempleFixture(ctx, obstacle) {
  drawGenericObstacle(ctx, obstacle, {
    top: "rgba(128, 110, 81, 0.9)",
    bottom: "rgba(87, 71, 52, 0.88)",
    stroke: "rgba(214, 193, 157, 0.36)"
  });

  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = "rgba(223, 214, 183, 0.72)";
    roundedRect(ctx, obstacle.x + 14 + i * 26, obstacle.y + 14, 18, 12, 2);
    ctx.fill();
  }
}

function drawGoodsPile(ctx, x, y, width) {
  const step = 18;
  for (let i = 0; i <= width; i += step) {
    const odd = Math.floor(i / step) % 2 === 0;
    ctx.fillStyle = odd ? "rgba(181, 127, 74, 0.88)" : "rgba(96, 145, 89, 0.78)";
    ctx.beginPath();
    ctx.arc(x + i, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSignBoard(ctx, x, y, text, now) {
  const swing = Math.sin(now / 680 + x * 0.02) * 1.2;
  const sx = x + swing;

  ctx.strokeStyle = "rgba(86, 60, 42, 0.84)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx + 4, y - 8);
  ctx.lineTo(sx + 4, y);
  ctx.moveTo(sx + 36, y - 8);
  ctx.lineTo(sx + 36, y);
  ctx.stroke();

  ctx.fillStyle = "rgba(237, 219, 172, 0.93)";
  roundedRect(ctx, sx, y, 40, 17, 3);
  ctx.fill();
  ctx.strokeStyle = "rgba(135, 103, 66, 0.8)";
  roundedRect(ctx, sx, y, 40, 17, 3);
  ctx.stroke();

  ctx.fillStyle = "#5d4126";
  ctx.font = "11px 'Noto Serif SC', serif";
  ctx.fillText(text.slice(0, 2), sx + 5, y + 12);
}

function drawTeaSet(ctx, x, y, now) {
  ctx.fillStyle = "rgba(214, 188, 148, 0.93)";
  ctx.beginPath();
  ctx.arc(x - 9, y + 7, 4, 0, Math.PI * 2);
  ctx.arc(x + 9, y + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(170, 141, 101, 0.96)";
  roundedRect(ctx, x - 4, y + 2, 8, 9, 2);
  ctx.fill();

  drawSteam(ctx, x, y - 1, now);
}

function drawIncenseSmokeField(ctx, x, y, now) {
  drawSteam(ctx, x, y, now);
  drawSteam(ctx, x + 18, y + 4, now + 120);
}

function drawSteam(ctx, x, y, now) {
  ctx.strokeStyle = "rgba(233, 231, 218, 0.45)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i += 1) {
    const drift = Math.sin(now / 360 + i * 0.8) * 3;
    ctx.beginPath();
    ctx.moveTo(x + i * 4 - 4, y - i * 2);
    ctx.bezierCurveTo(
      x - 5 + drift + i * 4,
      y - 8 - i * 7,
      x + 4 + drift + i * 3,
      y - 14 - i * 11,
      x + drift + i * 2,
      y - 22 - i * 15
    );
    ctx.stroke();
  }
}

function drawGenericObstacle(
  ctx,
  obstacle,
  colors = {
    top: "rgba(70, 95, 125, 0.92)",
    bottom: "rgba(38, 57, 81, 0.88)",
    stroke: "rgba(184, 218, 252, 0.44)"
  }
) {
  const roof = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
  roof.addColorStop(0, colors.top);
  roof.addColorStop(1, colors.bottom);

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  roundedRect(ctx, obstacle.x + 5, obstacle.y + obstacle.height - 4, obstacle.width, 12, 6);
  ctx.fill();

  ctx.fillStyle = roof;
  roundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 7);
  ctx.fill();

  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1.5;
  roundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 7);
  ctx.stroke();
}

function drawPois(ctx, scene, themeId, palette, now) {
  for (const poi of scene.pois || []) {
    if (themeId === "market" && poi.id === "notice_board") {
      drawNoticeBoardPoi(ctx, poi, palette, now);
      continue;
    }
    if (themeId === "market" && poi.id === "tea_stall") {
      drawTeaPoi(ctx, poi, palette, now);
      continue;
    }

    if (themeId === "magistrate_square") {
      if (poi.id === "warrant_wall") {
        drawWarrantWallPoi(ctx, poi, palette, now);
        continue;
      }
      if (poi.id === "yamen_drum") {
        drawYamenDrumPoi(ctx, poi, palette, now);
        continue;
      }
      if (poi.id === "river_manifest") {
        drawManifestPoi(ctx, poi, palette, now);
        continue;
      }
    }

    if (themeId === "temple_courtyard") {
      if (poi.id === "bell_frame") {
        drawBellFramePoi(ctx, poi, palette, now);
        continue;
      }
      if (poi.id === "incense_basin") {
        drawIncensePoi(ctx, poi, palette, now);
        continue;
      }
      if (poi.id === "meditation_mat") {
        drawMeditationPoi(ctx, poi, palette, now);
        continue;
      }
    }

    drawDefaultPoi(ctx, poi, palette, now);
  }
}

function drawNoticeBoardPoi(ctx, poi, palette, now) {
  const radius = Number.isFinite(poi.radius) ? poi.radius : 26;
  const pulse = 0.82 + Math.sin(now / 310) * 0.11;

  ctx.fillStyle = alphaColor(palette.poiGlow, 0.16 * pulse);
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(121, 84, 56, 0.9)";
  roundedRect(ctx, poi.x - 18, poi.y - 28, 36, 52, 4);
  ctx.fill();
  ctx.strokeStyle = "rgba(213, 186, 136, 0.86)";
  ctx.lineWidth = 1.4;
  roundedRect(ctx, poi.x - 18, poi.y - 28, 36, 52, 4);
  ctx.stroke();

  drawPaper(ctx, poi.x - 12, poi.y - 20, 10, 16);
  drawPaper(ctx, poi.x + 1, poi.y - 17, 11, 14);
  drawPaper(ctx, poi.x - 4, poi.y + 1, 12, 15);

  ctx.fillStyle = palette.poiText;
  ctx.font = "12px 'Noto Serif SC', serif";
  ctx.fillText(poi.label || "告示牌", poi.x - radius + 4, poi.y - radius - 8);
}

function drawWarrantWallPoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  ctx.fillStyle = "rgba(87, 102, 130, 0.9)";
  roundedRect(ctx, poi.x - 20, poi.y - 28, 40, 52, 4);
  ctx.fill();
  drawPaper(ctx, poi.x - 14, poi.y - 21, 12, 16);
  drawPaper(ctx, poi.x + 2, poi.y - 17, 10, 14);
  drawPaper(ctx, poi.x - 6, poi.y + 1, 12, 14);
}

function drawYamenDrumPoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  const pulse = 0.9 + Math.sin(now / 240) * 0.08;
  ctx.fillStyle = alphaColor("rgba(190, 152, 108, 1)", 0.78 * pulse);
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(109, 80, 57, 0.84)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, 14, 0, Math.PI * 2);
  ctx.stroke();
}

function drawManifestPoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  for (let i = 0; i < 3; i += 1) {
    drawPaper(ctx, poi.x - 15 + i * 10, poi.y - 10 + i, 10, 14);
  }
}

function drawBellFramePoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  ctx.strokeStyle = "rgba(209, 199, 159, 0.84)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(poi.x - 16, poi.y + 16);
  ctx.lineTo(poi.x - 16, poi.y - 18);
  ctx.lineTo(poi.x + 16, poi.y - 18);
  ctx.lineTo(poi.x + 16, poi.y + 16);
  ctx.stroke();
  ctx.fillStyle = "rgba(156, 130, 87, 0.9)";
  ctx.beginPath();
  ctx.arc(poi.x, poi.y - 2, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawIncensePoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  ctx.fillStyle = "rgba(130, 115, 85, 0.9)";
  roundedRect(ctx, poi.x - 14, poi.y - 7, 28, 14, 5);
  ctx.fill();
  drawSteam(ctx, poi.x - 3, poi.y - 8, now);
}

function drawMeditationPoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  ctx.fillStyle = "rgba(187, 165, 126, 0.82)";
  roundedRect(ctx, poi.x - 16, poi.y - 10, 32, 20, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(128, 109, 74, 0.76)";
  ctx.lineWidth = 1;
  roundedRect(ctx, poi.x - 16, poi.y - 10, 32, 20, 6);
  ctx.stroke();
}

function drawPaper(ctx, x, y, w, h) {
  ctx.fillStyle = "rgba(234, 219, 189, 0.9)";
  roundedRect(ctx, x, y, w, h, 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(154, 128, 94, 0.4)";
  ctx.lineWidth = 0.8;
  roundedRect(ctx, x, y, w, h, 2);
  ctx.stroke();
}

function drawTeaPoi(ctx, poi, palette, now) {
  drawDefaultPoi(ctx, poi, palette, now);
  drawSteam(ctx, poi.x - 8, poi.y - 6, now);
}

function drawDefaultPoi(ctx, poi, palette, now) {
  const radius = Number.isFinite(poi.radius) ? poi.radius : 26;
  const pulse = 0.85 + Math.sin(now / 360) * 0.12;

  ctx.fillStyle = alphaColor(palette.poiGlow, 0.1 * pulse);
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = alphaColor(palette.poiFill, 0.2 * pulse);
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.poiStroke;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(poi.x, poi.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = palette.poiText;
  ctx.font = "12px 'Noto Serif SC', serif";
  ctx.fillText(poi.label || "观察点", poi.x - radius + 4, poi.y - radius - 7);
}

function drawNpcs(ctx, npcs, selectedNpcId, now) {
  for (const npc of npcs) {
    const selected = npc.id === selectedNpcId;
    const model = buildNpcCharacterModel(npc);
    drawCharacterModel(ctx, {
      x: npc.position.x,
      y: npc.position.y,
      model,
      label: npc.name,
      now,
      selected,
      isPlayer: false
    });
  }
}

function drawPlayer(ctx, position, player, now) {
  const model = buildPlayerCharacterModel(player);
  drawCharacterModel(ctx, {
    x: position.x,
    y: position.y,
    model,
    label: "你",
    now,
    selected: false,
    isPlayer: true
  });
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

function alphaColor(rgbaLike, alpha) {
  if (typeof rgbaLike !== "string") {
    return rgbaLike;
  }
  const match = rgbaLike.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/i);
  if (!match) {
    return rgbaLike;
  }
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Math.max(0, Math.min(alpha, 1))})`;
}
