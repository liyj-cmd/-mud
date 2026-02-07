import { getMartialById } from "../data/martialArts.js";
import { getItemById } from "../data/items.js";
import { getNpcInteractionProfile } from "../data/npcInteractionProfiles.js";
import { ensurePlayerState, getSkillLevel } from "../systems/progression.js";

export function getNpcInteractionOptions({ npc, player }) {
  const p = ensurePlayerState(player);
  const profile = getNpcInteractionProfile(npc?.id);
  if (!npc || !profile) {
    return { canLearn: false, canSteal: false, canChallenge: false };
  }

  const availableTeachables = listLearnableFromNpc({ npc, player: p, profile });
  return {
    canLearn: availableTeachables.length > 0,
    canSteal: Boolean(profile.steal?.enabled),
    canChallenge: Boolean(profile.combat?.enabled)
  };
}

export function attemptLearnFromNpc({ npc, state, adjustNpcRelation, adjustFactionReputation }) {
  if (!npc || !state?.player) {
    return { ok: false, logs: ["你找不到合适的请教对象。"] };
  }

  const player = ensurePlayerState(state.player);
  const profile = getNpcInteractionProfile(npc.id);
  if (!profile) {
    return { ok: false, logs: [`${npc.name}暂时无可传授武学。`] };
  }

  const candidates = listLearnableFromNpc({ npc, player, profile });
  if (candidates.length === 0) {
    return { ok: false, logs: [`${npc.name}暂时不愿传授你新招。`] };
  }

  const target = candidates[0];
  const skill = getMartialById(target.skillId);
  if (!skill) {
    return { ok: false, logs: ["该武学暂不可传授。"] };
  }

  const cost = Math.max(0, target.potentialCost || 0);
  if (player.potential < cost) {
    return { ok: false, logs: [`潜能不足（需${cost}）。`] };
  }

  player.potential -= cost;
  player.skills.owned[skill.id] = Math.max(1, player.skills.owned[skill.id] || 0);

  if (typeof adjustNpcRelation === "function") {
    adjustNpcRelation(npc.id, 2);
  }
  if (npc.factionId && typeof adjustFactionReputation === "function") {
    adjustFactionReputation(npc.factionId, 1);
  }

  const logs = [`${npc.name}指点你一番，你习得了「${skill.name}」${cost > 0 ? `（潜能-${cost}）` : ""}。`];
  return { ok: true, logs, learnedSkillId: skill.id };
}

export function attemptStealFromNpc({ npc, state, adjustNpcRelation, adjustFactionReputation }) {
  if (!npc || !state?.player || !state?.time) {
    return { ok: false, logs: ["你一时无从下手。"] };
  }

  const player = ensurePlayerState(state.player);
  const profile = getNpcInteractionProfile(npc.id);
  if (!profile?.steal?.enabled) {
    return { ok: false, logs: [`${npc.name}几乎不给你可乘之机。`] };
  }

  const lockFlag = `steal_lock_${npc.id}_day_${state.time.day}`;
  if (player.flags[lockFlag]) {
    return { ok: false, logs: [`你今天已在${npc.name}身上动过手，再下手太冒险。`] };
  }

  const qinggongId = player.skills.prepared?.qinggong;
  const qinggongLevel = qinggongId ? getSkillLevel(player, qinggongId) : 1;
  const chance = clamp(
    36 + player.stats.agility * 2 + player.stats.insight * 0.8 + qinggongLevel * 3 - profile.steal.difficulty,
    8,
    85
  );

  player.flags[lockFlag] = true;

  if (Math.random() * 100 > chance) {
    if (typeof adjustNpcRelation === "function") {
      adjustNpcRelation(npc.id, profile.steal.relationPenaltyOnFail || -8);
    }
    if (npc.factionId && typeof adjustFactionReputation === "function") {
      adjustFactionReputation(npc.factionId, profile.steal.reputationPenaltyOnFail || -2);
    }

    return {
      ok: false,
      logs: [`你行窃失手，被${npc.name}察觉。`]
    };
  }

  const loot = pickLoot(profile.steal.loot || []);
  if (!loot) {
    return { ok: true, logs: [`你悄悄摸过一圈，却只得手些许零散银两。`] };
  }

  const amount = randomInt(loot.min || 1, loot.max || Math.max(1, loot.min || 1));
  if (loot.type === "gold") {
    player.gold += amount;
    return { ok: true, logs: [`你顺手牵来${amount}两碎银。`] };
  }

  if (loot.type === "item") {
    const item = getItemById(loot.itemId);
    if (!item) {
      return { ok: true, logs: ["你摸到一件无名杂物。"] };
    }
    addItem(player, item.id, amount);
    return {
      ok: true,
      logs: [`你悄悄得手：${item.name}${amount > 1 ? ` x${amount}` : ""}。`]
    };
  }

  return { ok: true, logs: ["你得手后迅速退开，未被察觉。"] };
}

export function buildNpcChallengeConfig({ npc }) {
  const profile = getNpcInteractionProfile(npc?.id);
  if (!npc || !profile?.combat?.enabled) {
    return { ok: false, message: `${npc ? npc.name : "此人"}不愿与你动手。` };
  }

  return {
    ok: true,
    battleConfig: {
      npcId: npc.id,
      onVictory: {
        relationDelta: { [npc.id]: 2 },
        potential: Math.round(8 + profile.combat.tier * 2),
        exp: Math.round(10 + profile.combat.tier * 3)
      },
      onDefeat: {
        relationDelta: { [npc.id]: -1 }
      }
    }
  };
}

function listLearnableFromNpc({ npc, player, profile }) {
  const relation = Number.isFinite(player.relationships[npc.id]) ? player.relationships[npc.id] : 0;
  return (profile.teachableSkills || []).filter((item) => {
    if (!item || typeof item.skillId !== "string") {
      return false;
    }
    if (player.skills.owned[item.skillId]) {
      return false;
    }
    const minRelation = Number.isFinite(item.relationMin) ? item.relationMin : 0;
    if (relation < minRelation) {
      return false;
    }
    return Boolean(getMartialById(item.skillId));
  });
}

function addItem(player, itemId, amount) {
  if (!player.inventory || typeof player.inventory !== "object") {
    player.inventory = {};
  }
  const current = Number.isFinite(player.inventory[itemId]) ? player.inventory[itemId] : 0;
  player.inventory[itemId] = Math.max(0, current + Math.max(1, amount));
}

function pickLoot(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  const total = entries.reduce((sum, item) => sum + (Number.isFinite(item.weight) ? item.weight : 1), 0);
  if (total <= 0) {
    return entries[0] || null;
  }
  let ticket = Math.random() * total;
  for (const entry of entries) {
    ticket -= Number.isFinite(entry.weight) ? entry.weight : 1;
    if (ticket <= 0) {
      return entry;
    }
  }
  return entries[entries.length - 1] || null;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
