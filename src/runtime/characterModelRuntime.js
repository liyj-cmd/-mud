import {
  baseCharacterModelProfile,
  factionCharacterModelProfiles,
  roleCharacterModelProfiles,
  tagCharacterModelProfiles,
  npcCharacterModelOverrides,
  playerCharacterModelProfile
} from "../data/characterModelProfiles.js";

export function buildNpcCharacterModel(npc) {
  const model = createBaseModel();
  if (!npc || typeof npc !== "object") {
    return model;
  }

  applyProfile(model, factionCharacterModelProfiles[npc.factionId]);

  if (isNonEmptyString(npc.role)) {
    for (const entry of roleCharacterModelProfiles) {
      if (npc.role.includes(entry.keyword)) {
        applyProfile(model, entry.profile);
      }
    }
  }

  if (Array.isArray(npc.tags)) {
    for (const tag of npc.tags) {
      applyProfile(model, tagCharacterModelProfiles[tag]);
    }
  }

  applyProfile(model, npcCharacterModelOverrides[npc.id]);
  applyDeterministicVariant(model, npc.id);
  return model;
}

export function buildPlayerCharacterModel(player) {
  const model = createBaseModel();
  applyProfile(model, playerCharacterModelProfile);

  if (player && isNonEmptyString(player.alignment)) {
    if (player.alignment.includes("诡")) {
      model.palette.robe = "#7e5a5a";
      model.palette.trim = "#e0b0a2";
      model.palette.accent = "#f0b2a2";
      model.palette.glow = "#f1b395";
      model.emblem = "shadow";
    } else if (player.alignment.includes("侠")) {
      model.palette.robe = "#8b7041";
      model.palette.trim = "#f6dfa8";
      model.palette.accent = "#f7dc80";
      model.palette.glow = "#f8df88";
      model.emblem = "hero";
    }
  }

  return model;
}

function createBaseModel() {
  return deepClone(baseCharacterModelProfile);
}

function applyProfile(target, patch) {
  if (!patch || typeof patch !== "object") {
    return;
  }
  mergeInto(target, patch);
}

function mergeInto(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      target[key] = value.slice();
      continue;
    }

    if (typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeInto(target[key], value);
      continue;
    }

    target[key] = value;
  }
}

function applyDeterministicVariant(model, seedText) {
  if (!isNonEmptyString(seedText)) {
    return;
  }
  const hash = hashString(seedText);
  const shift = (hash % 7) - 3;
  model.palette.robe = shiftHex(model.palette.robe, shift * 6);
  model.palette.trim = shiftHex(model.palette.trim, shift * 3);
}

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function shiftHex(hex, delta) {
  if (!isHexColor(hex)) {
    return hex;
  }
  const r = clamp(parseInt(hex.slice(1, 3), 16) + delta, 0, 255);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + delta, 0, 255);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + delta, 0, 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, inner] of Object.entries(value)) {
      next[key] = deepClone(inner);
    }
    return next;
  }
  return value;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
