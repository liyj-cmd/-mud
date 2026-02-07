import { LATEST_SAVE_VERSION, migrateSnapshot } from "./saveMigrations.js";

const STORAGE_KEYS = {
  active: "jingyong_mvp_save_v2",
  legacy: ["jingyong_mvp_save_v1"]
};

export function saveGame(state) {
  try {
    const snapshot = {
      version: LATEST_SAVE_VERSION,
      savedAt: Date.now(),
      game: state
    };
    localStorage.setItem(STORAGE_KEYS.active, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.error("Save failed", error);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = readRawSnapshot();
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw.value);
    const migrated = migrateSnapshot(parsed);
    if (!migrated || !migrated.game) {
      return null;
    }

    // If loaded from legacy key or old version, rewrite into active slot.
    if (raw.key !== STORAGE_KEYS.active || migrated.version !== parsed.version) {
      localStorage.setItem(STORAGE_KEYS.active, JSON.stringify(migrated));
    }

    return migrated;
  } catch (error) {
    console.error("Load failed", error);
    return null;
  }
}

export function hasSave() {
  if (localStorage.getItem(STORAGE_KEYS.active)) {
    return true;
  }
  return STORAGE_KEYS.legacy.some((key) => Boolean(localStorage.getItem(key)));
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEYS.active);
  for (const legacyKey of STORAGE_KEYS.legacy) {
    localStorage.removeItem(legacyKey);
  }
}

export function getStorageKey() {
  return STORAGE_KEYS.active;
}

function readRawSnapshot() {
  const active = localStorage.getItem(STORAGE_KEYS.active);
  if (active) {
    return { key: STORAGE_KEYS.active, value: active };
  }

  for (const key of STORAGE_KEYS.legacy) {
    const raw = localStorage.getItem(key);
    if (raw) {
      return { key, value: raw };
    }
  }

  return null;
}
