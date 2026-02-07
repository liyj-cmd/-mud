import { getMartialById, computeSkillBonuses, starterSkillIds, martialArts } from "../data/martialArts.js";
import { createInitialReputations } from "../data/factions.js";

const DEFAULT_WORLD_CHAPTER = "序章";

export function createInitialPlayer({ name, alignment }) {
  const owned = {};
  for (const item of martialArts) {
    if (item.quality === "凡") {
      owned[item.id] = 1;
    }
  }

  owned.taizu_changquan = 1;
  owned.huashan_jian = 1;

  const reputationSeed =
    alignment === "侠义"
      ? {
          huashan: 6,
          shaolin: 5,
          wudang: 5,
          imperial_court: 4,
          xiangyang_guard: 3,
          heimu_bandits: -10
        }
      : {
          neutral_wulin: 4,
          suzhou_merchants: 3,
          heimu_bandits: 6,
          imperial_court: -6,
          shaolin: -3
        };

  return ensurePlayerState({
    name,
    alignment,
    morality: alignment === "侠义" ? 8 : -8,
    level: 1,
    exp: 0,
    potential: 36,
    gold: 24,
    stats: {
      bone: alignment === "侠义" ? 11 : 10,
      agility: alignment === "诡道" ? 11 : 10,
      insight: 10
    },
    baseHp: 115,
    baseQi: 75,
    hp: 115,
    qi: 75,
    location: "town_gate",
    skills: {
      owned,
      prepared: { ...starterSkillIds }
    },
    flags: {},
    reputations: createInitialReputations(reputationSeed),
    relationships: {},
    questStates: {},
    world: {
      chapter: DEFAULT_WORLD_CHAPTER,
      flags: {},
      timeline: []
    },
    knownNpcs: []
  });
}

export function ensurePlayerState(player) {
  if (!player || typeof player !== "object") {
    return player;
  }

  if (typeof player.name !== "string" || player.name.length === 0) {
    player.name = "无名客";
  }
  if (typeof player.alignment !== "string" || player.alignment.length === 0) {
    player.alignment = "侠义";
  }

  player.level = toNumberOr(player.level, 1);
  player.exp = toNumberOr(player.exp, 0);
  player.potential = toNumberOr(player.potential, 0);
  player.gold = toNumberOr(player.gold, 0);
  player.morality = toNumberOr(player.morality, 0);

  if (!player.stats || typeof player.stats !== "object") {
    player.stats = {};
  }
  player.stats.bone = toNumberOr(player.stats.bone, 10);
  player.stats.agility = toNumberOr(player.stats.agility, 10);
  player.stats.insight = toNumberOr(player.stats.insight, 10);

  player.baseHp = toNumberOr(player.baseHp, 100);
  player.baseQi = toNumberOr(player.baseQi, 70);
  player.hp = toNumberOr(player.hp, player.baseHp);
  player.qi = toNumberOr(player.qi, player.baseQi);

  if (typeof player.location !== "string" || player.location.length === 0) {
    player.location = "town_gate";
  }

  if (!player.skills || typeof player.skills !== "object") {
    player.skills = {};
  }

  if (!player.skills.owned || typeof player.skills.owned !== "object") {
    player.skills.owned = {};
  }

  if (!player.skills.prepared || typeof player.skills.prepared !== "object") {
    player.skills.prepared = { ...starterSkillIds };
  }

  for (const [slot, fallbackSkillId] of Object.entries(starterSkillIds)) {
    if (!player.skills.prepared[slot]) {
      player.skills.prepared[slot] = fallbackSkillId;
    }
  }

  for (const [skillId, level] of Object.entries(player.skills.owned)) {
    player.skills.owned[skillId] = Math.max(1, toNumberOr(level, 1));
  }

  if (!player.flags || typeof player.flags !== "object") {
    player.flags = {};
  }

  player.reputations = createInitialReputations(player.reputations && typeof player.reputations === "object" ? player.reputations : {});

  if (!player.relationships || typeof player.relationships !== "object") {
    player.relationships = {};
  }

  for (const [npcId, value] of Object.entries(player.relationships)) {
    player.relationships[npcId] = clamp(Math.round(toNumberOr(value, 0)), -100, 100);
  }

  if (!player.questStates || typeof player.questStates !== "object") {
    player.questStates = {};
  }

  if (!player.world || typeof player.world !== "object") {
    player.world = {};
  }

  if (!player.world.flags || typeof player.world.flags !== "object") {
    player.world.flags = {};
  }

  if (!Array.isArray(player.world.timeline)) {
    player.world.timeline = [];
  }

  if (typeof player.world.chapter !== "string" || player.world.chapter.length === 0) {
    player.world.chapter = DEFAULT_WORLD_CHAPTER;
  }

  if (!Array.isArray(player.knownNpcs)) {
    player.knownNpcs = [];
  }
  player.knownNpcs = Array.from(new Set(player.knownNpcs.filter((id) => typeof id === "string" && id.length > 0)));

  normalizeVitals(player);
  return player;
}

export function getExpToNext(level) {
  return 80 + level * 55;
}

export function getSkillLevel(player, skillId) {
  return player.skills.owned[skillId] || 0;
}

export function listPreparedSkills(player) {
  const prepared = player.skills.prepared;
  const result = {};
  for (const slot of Object.keys(prepared)) {
    const skillId = prepared[slot];
    const skill = getMartialById(skillId);
    const level = getSkillLevel(player, skillId);
    result[slot] = {
      skill,
      level,
      bonuses: computeSkillBonuses(skill, level || 1)
    };
  }
  return result;
}

export function computeDerivedStats(player) {
  const prepared = listPreparedSkills(player);
  let attackBonus = 0;
  let hitBonus = 0;
  let dodgeBonus = 0;
  let blockBonus = 0;
  let hpBonus = 0;
  let qiBonus = 0;

  for (const slot of Object.keys(prepared)) {
    const item = prepared[slot];
    attackBonus += item.bonuses.attack;
    hitBonus += item.bonuses.hit;
    dodgeBonus += item.bonuses.dodge;
    blockBonus += item.bonuses.block;
    hpBonus += item.bonuses.hp;
    qiBonus += item.bonuses.qi;
  }

  const maxHp = player.baseHp + player.stats.bone * 7 + hpBonus;
  const maxQi = player.baseQi + player.stats.insight * 6 + qiBonus;
  const attack = 14 + player.stats.bone * 1.8 + attackBonus;
  const hit = 62 + player.stats.agility * 1.7 + hitBonus;
  const dodge = 10 + player.stats.agility * 1.5 + dodgeBonus;
  const block = 8 + player.stats.bone * 0.8 + blockBonus;
  const speed = 8 + player.stats.agility * 0.9 + (prepared.qinggong ? prepared.qinggong.level : 1);

  return {
    maxHp: Math.round(maxHp),
    maxQi: Math.round(maxQi),
    attack: Math.round(attack),
    hit: Math.round(hit),
    dodge: Math.round(dodge),
    block: Math.round(block),
    speed: Math.round(speed)
  };
}

export function normalizeVitals(player) {
  const derived = computeDerivedStats(player);
  player.hp = clamp(player.hp, 0, derived.maxHp);
  player.qi = clamp(player.qi, 0, derived.maxQi);
  return derived;
}

export function healToFull(player) {
  const derived = computeDerivedStats(player);
  player.hp = derived.maxHp;
  player.qi = derived.maxQi;
}

export function addExperience(player, amount, onLog) {
  if (!amount || amount <= 0) {
    return;
  }

  player.exp += amount;
  let leveled = false;

  while (player.exp >= getExpToNext(player.level)) {
    const need = getExpToNext(player.level);
    player.exp -= need;
    player.level += 1;
    player.stats.bone += 1;
    player.stats.agility += 1;
    player.stats.insight += 1;
    player.baseHp += 8;
    player.baseQi += 6;
    player.potential += 12;
    leveled = true;
  }

  if (leveled && onLog) {
    onLog(`你突破到${player.level}重境界，三维齐增。`, "good");
  }

  normalizeVitals(player);
}

export function trainSkill(player, skillId) {
  const cost = 12;
  if (player.potential < cost) {
    return { ok: false, reason: "潜能不足" };
  }

  const ownedLevel = player.skills.owned[skillId];
  if (!ownedLevel) {
    return { ok: false, reason: "未习得该武学" };
  }

  player.potential -= cost;
  player.skills.owned[skillId] = ownedLevel + 1;
  normalizeVitals(player);
  return { ok: true, newLevel: player.skills.owned[skillId], cost };
}

function toNumberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
