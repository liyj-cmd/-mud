import { getNpcById } from "../data/npcs.js";
import { getNpcMartialLoadout, martialSlotOrder } from "../data/npcMartialLoadouts.js";
import { getMartialById, computeSkillBonuses } from "../data/martialArts.js";
import { getNpcInteractionProfile } from "../data/npcInteractionProfiles.js";

export function resolveBattleTarget({ battleConfig, enemies }) {
  if (!battleConfig || typeof battleConfig !== "object") {
    return null;
  }

  if (battleConfig.enemyId) {
    return enemies[battleConfig.enemyId] || null;
  }

  if (battleConfig.npcId) {
    return createBattleEnemyFromNpc(battleConfig.npcId);
  }

  return null;
}

export function createBattleEnemyFromNpc(npcId) {
  const npc = getNpcById(npcId);
  const loadout = getNpcMartialLoadout(npcId);
  if (!npc || !loadout) {
    return null;
  }

  const interaction = getNpcInteractionProfile(npcId);
  const combatTier = Number.isFinite(interaction?.combat?.tier)
    ? Math.max(1, Math.round(interaction.combat.tier))
    : inferCombatTier(npc.tags || []);
  const rewardScale = Number.isFinite(interaction?.combat?.rewardScale)
    ? Math.max(0.4, interaction.combat.rewardScale)
    : 1;

  let bonusAttack = 0;
  let bonusHit = 0;
  let bonusDodge = 0;
  let bonusBlock = 0;
  let bonusParry = 0;
  let bonusBreak = 0;
  let bonusCrit = 0;
  let bonusSpeed = 0;
  let bonusHp = 0;
  let bonusQi = 0;
  let sumLevel = 0;
  let counted = 0;
  const moves = [];

  for (const slot of martialSlotOrder) {
    const skillId = loadout.slots[slot];
    const skill = getMartialById(skillId);
    if (!skill) {
      continue;
    }

    const level = Number.isFinite(loadout.skillLevels[skillId]) ? loadout.skillLevels[skillId] : 1;
    const bonus = computeSkillBonuses(skill, level);
    bonusAttack += bonus.attack;
    bonusHit += bonus.hit;
    bonusDodge += bonus.dodge;
    bonusBlock += bonus.block;
    bonusParry += bonus.parry;
    bonusBreak += bonus.break;
    bonusCrit += bonus.crit;
    bonusSpeed += bonus.speed;
    bonusHp += bonus.hp;
    bonusQi += bonus.qi;
    sumLevel += level;
    counted += 1;

    for (const move of skill.moves || []) {
      const name = typeof move === "string" ? move : move.name;
      if (typeof name === "string" && name.length > 0) {
        moves.push(name);
      }
    }
  }

  const avgLevel = counted > 0 ? sumLevel / counted : 1;
  const uniqMoves = Array.from(new Set(moves)).slice(0, 7);

  const maxHp = Math.round(95 + combatTier * 16 + avgLevel * 9 + bonusHp * 0.9);
  const maxQi = Math.round(70 + combatTier * 12 + avgLevel * 7 + bonusQi * 0.9);
  const attack = Math.round(14 + combatTier * 3 + avgLevel * 1.6 + bonusAttack * 0.6);
  const hit = Math.round(64 + combatTier * 2 + avgLevel * 1.4 + bonusHit * 0.45);
  const dodge = Math.round(10 + combatTier * 1.5 + avgLevel * 0.9 + bonusDodge * 0.45);
  const block = Math.round(8 + combatTier * 1.3 + avgLevel * 0.8 + bonusBlock * 0.45);
  const parry = Math.round(8 + combatTier * 1.5 + avgLevel + bonusParry * 0.5);
  const breakForce = Math.round(9 + combatTier * 1.4 + avgLevel + bonusBreak * 0.5);
  const crit = Math.round(5 + combatTier * 0.8 + avgLevel * 0.5 + bonusCrit * 0.4);
  const speed = Math.round(10 + combatTier + avgLevel * 0.6 + bonusSpeed * 0.4);

  return {
    id: `npc_${npc.id}`,
    npcId: npc.id,
    name: npc.name,
    maxHp,
    maxQi,
    attack,
    hit,
    dodge,
    block,
    parry,
    break: breakForce,
    crit,
    speed,
    xpReward: Math.round((18 + combatTier * 8 + avgLevel * 5) * rewardScale),
    potentialReward: Math.round((10 + combatTier * 5 + avgLevel * 4) * rewardScale),
    goldReward: Math.round((6 + combatTier * 3) * rewardScale),
    moves: uniqMoves.length > 0 ? uniqMoves : ["平掌推云", "错步进身", "转腕封门"],
    background: loadout.realm
  };
}

function inferCombatTier(tags) {
  if (!Array.isArray(tags)) {
    return 3;
  }
  if (tags.includes("legend")) {
    return 8;
  }
  if (tags.includes("leader")) {
    return 6;
  }
  if (tags.includes("mentor") || tags.includes("duel")) {
    return 5;
  }
  if (tags.includes("guard") || tags.includes("training")) {
    return 4;
  }
  return 3;
}
