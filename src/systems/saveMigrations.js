import { ensurePlayerState } from "./progression.js";
import { DEFAULT_TIME } from "./time.js";

export const LATEST_SAVE_VERSION = 2;

export function migrateSnapshot(rawSnapshot) {
  if (!rawSnapshot || typeof rawSnapshot !== "object" || !rawSnapshot.game) {
    return null;
  }

  const snapshot = deepClone(rawSnapshot);
  const sourceVersion = Number.isFinite(snapshot.version) ? snapshot.version : 1;

  if (sourceVersion <= 1) {
    migrateV1ToV2(snapshot);
  }

  snapshot.version = LATEST_SAVE_VERSION;
  snapshot.savedAt = Number.isFinite(snapshot.savedAt) ? snapshot.savedAt : Date.now();
  return snapshot;
}

function migrateV1ToV2(snapshot) {
  const game = snapshot.game;

  game.player = ensurePlayerState(game.player);

  if (!game.time || typeof game.time !== "object") {
    game.time = { ...DEFAULT_TIME };
  }

  game.time.day = Number.isFinite(game.time.day) ? Math.max(1, Math.round(game.time.day)) : DEFAULT_TIME.day;
  game.time.hour = Number.isFinite(game.time.hour) ? clamp(Math.round(game.time.hour), 0, 23) : DEFAULT_TIME.hour;
  game.time.minute = Number.isFinite(game.time.minute)
    ? clamp(Math.round(game.time.minute), 0, 59)
    : DEFAULT_TIME.minute;

  if (!game.eventHistory || typeof game.eventHistory !== "object") {
    game.eventHistory = {};
  }

  if (!Array.isArray(game.logs)) {
    game.logs = [];
  }

  if (!game.meta || typeof game.meta !== "object") {
    game.meta = {};
  }

  game.meta.schemaVersion = 2;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
