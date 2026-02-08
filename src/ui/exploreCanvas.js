import { DEFAULT_ART_PACK_ID, resolveArtPack } from "../data/artPacks.js";
import { normalizeSceneThemeId } from "../data/sceneThemes.js";
import { createSceneAssetLoader } from "../systems/sceneAssetLoader.js";
import { drawProceduralScene } from "./exploreRenderers/proceduralRenderer.js";
import { drawSpriteScene } from "./exploreRenderers/spriteRenderer.js";

const fallbackAssetLoader = createSceneAssetLoader();

export function drawExploreScene(canvas, payload) {
  if (!canvas || !payload || !payload.scene) {
    return;
  }

  const themeId = normalizeSceneThemeId(payload.scene.themeId);
  const artPack = resolveArtPack(payload.artPackId || DEFAULT_ART_PACK_ID);
  const themeAssets = resolveThemeAssets(artPack, themeId);

  if (!themeAssets || themeAssets.renderer !== "sprite") {
    drawProceduralScene(canvas, payload);
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const assetLoader = payload.assetLoader || fallbackAssetLoader;
  const preloadUrls = collectPackThemeUrls(artPack, themeAssets);
  assetLoader.prime(preloadUrls);

  drawSpriteScene(
    ctx,
    {
      canvas,
      payload,
      scene: payload.scene,
      now: Number.isFinite(payload.now) ? payload.now : performance.now()
    },
    {
      pack: artPack,
      themeAssets,
      loader: assetLoader
    }
  );
}

function resolveThemeAssets(artPack, themeId) {
  if (!artPack || !artPack.themes || typeof artPack.themes !== "object") {
    return null;
  }
  return artPack.themes[themeId] || artPack.themes.default || null;
}

function collectPackThemeUrls(artPack, themeAssets) {
  const urls = [];

  pushIfString(urls, themeAssets.sceneBackground);
  pushValues(urls, themeAssets.obstacleSprites);
  pushValues(urls, themeAssets.exitSprites);
  pushValues(urls, themeAssets.poiSprites);

  const characters = artPack?.characters || {};
  pushIfString(urls, characters.playerToken);
  pushIfString(urls, characters.npcToken);
  pushIfString(urls, characters.selectedRing);

  const ui = artPack?.ui || {};
  pushIfString(urls, ui.bookStamp);

  return urls;
}

function pushValues(urls, table) {
  if (!table || typeof table !== "object") {
    return;
  }
  for (const value of Object.values(table)) {
    pushIfString(urls, value);
  }
}

function pushIfString(urls, value) {
  if (typeof value === "string" && value.length > 0) {
    urls.push(value);
  }
}
