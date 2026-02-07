import { getFactionById, clampReputation } from "../data/factions.js";
import { getNpcById } from "../data/npcs.js";
import { getMartialById } from "../data/martialArts.js";
import { addExperience, ensurePlayerState, normalizeVitals } from "./progression.js";

export function applyEffectPack({
  effects,
  player,
  time,
  questRuntime,
  onExperience,
  onStartBattle,
  onLog
}) {
  const logs = [];
  const p = ensurePlayerState(player);
  const pack = effects || {};

  const emit = (message) => {
    logs.push(message);
    if (typeof onLog === "function") {
      onLog(message);
    }
  };

  if (isNonZeroNumber(pack.gold)) {
    p.gold = Math.max(0, p.gold + pack.gold);
    emit(pack.gold > 0 ? `银两 +${pack.gold}` : `银两 ${pack.gold}`);
  }

  if (isNonZeroNumber(pack.hp)) {
    p.hp += pack.hp;
    emit(pack.hp > 0 ? `气血 +${pack.hp}` : `气血 ${pack.hp}`);
  }

  if (isNonZeroNumber(pack.qi)) {
    p.qi += pack.qi;
    emit(pack.qi > 0 ? `内息 +${pack.qi}` : `内息 ${pack.qi}`);
  }

  if (isNonZeroNumber(pack.potential)) {
    p.potential += pack.potential;
    emit(pack.potential > 0 ? `潜能 +${pack.potential}` : `潜能 ${pack.potential}`);
  }

  if (isNonZeroNumber(pack.exp)) {
    if (typeof onExperience === "function") {
      const handled = onExperience(pack.exp, emit);
      if (handled !== true) {
        emit(`经验 +${pack.exp}`);
      }
    } else {
      addExperience(p, pack.exp, (message) => emit(message));
      emit(`经验 +${pack.exp}`);
    }
  }

  if (isNonZeroNumber(pack.morality)) {
    p.morality += pack.morality;
    emit(pack.morality > 0 ? `侠义倾向 +${pack.morality}` : `侠义倾向 ${pack.morality}`);
  }

  if (pack.statGain) {
    for (const [key, value] of Object.entries(pack.statGain)) {
      if (p.stats[key] !== undefined && Number.isFinite(value)) {
        p.stats[key] += value;
        emit(`${toStatLabel(key)} +${value}`);
      }
    }
  }

  if (pack.setFlags) {
    for (const [key, value] of Object.entries(pack.setFlags)) {
      p.flags[key] = value;
    }
  }

  if (Array.isArray(pack.removeFlags)) {
    for (const key of pack.removeFlags) {
      delete p.flags[key];
    }
  }

  if (pack.setWorldFlags) {
    for (const [key, value] of Object.entries(pack.setWorldFlags)) {
      p.world.flags[key] = value;
    }
  }

  if (pack.reputationDelta) {
    for (const [factionId, delta] of Object.entries(pack.reputationDelta)) {
      if (!Number.isFinite(delta)) {
        continue;
      }
      const next = clampReputation((p.reputations[factionId] || 0) + delta);
      p.reputations[factionId] = next;
      const faction = getFactionById(factionId);
      emit(`${faction ? faction.name : factionId}声望 ${formatSigned(delta)}`);
    }
  }

  if (pack.relationDelta) {
    for (const [npcId, delta] of Object.entries(pack.relationDelta)) {
      if (!Number.isFinite(delta)) {
        continue;
      }
      const next = clampRelation((p.relationships[npcId] || 0) + delta);
      p.relationships[npcId] = next;
      const npc = getNpcById(npcId);
      emit(`与${npc ? npc.name : npcId}关系 ${formatSigned(delta)}`);
    }
  }

  if (pack.setQuestState) {
    for (const [questId, questState] of Object.entries(pack.setQuestState)) {
      if (questRuntime) {
        questRuntime.setState(questId, questState);
      } else {
        p.questStates[questId] = questState;
      }
      emit(`任务「${questId}」状态：${questState}`);
    }
  }

  if (pack.advanceQuest) {
    for (const [questId, step] of Object.entries(pack.advanceQuest)) {
      const next = questRuntime
        ? questRuntime.advanceState(questId, step)
        : advanceQuestDirectly(p, questId, step);
      emit(`任务「${questId}」推进至：${next}`);
    }
  }

  if (pack.addKnownNpc) {
    const list = Array.isArray(pack.addKnownNpc) ? pack.addKnownNpc : [pack.addKnownNpc];
    for (const npcId of list) {
      if (typeof npcId !== "string" || npcId.length === 0) {
        continue;
      }
      if (!p.knownNpcs.includes(npcId)) {
        p.knownNpcs.push(npcId);
      }
    }
  }

  if (typeof pack.timelineNote === "string" && pack.timelineNote.length > 0) {
    if (questRuntime) {
      questRuntime.addTimeline(pack.timelineNote);
    } else {
      p.world.timeline.push({
        day: time?.day ?? 1,
        hour: time?.hour ?? 0,
        minute: time?.minute ?? 0,
        note: pack.timelineNote
      });
      if (p.world.timeline.length > 120) {
        p.world.timeline = p.world.timeline.slice(-120);
      }
    }
  }

  if (typeof pack.setChapter === "string" && pack.setChapter.length > 0) {
    if (questRuntime) {
      questRuntime.setChapter(pack.setChapter);
    } else {
      p.world.chapter = pack.setChapter;
    }
  }

  if (pack.addSkill) {
    const skill = getMartialById(pack.addSkill);
    if (skill && !p.skills.owned[skill.id]) {
      p.skills.owned[skill.id] = 1;
      emit(`习得新武学：${skill.name}`);
    }
  }

  normalizeVitals(p);

  if (pack.battle && typeof onStartBattle === "function") {
    onStartBattle(pack.battle);
  }

  return {
    logs,
    triggeredBattle: Boolean(pack.battle)
  };
}

function advanceQuestDirectly(player, questId, step) {
  if (Number.isFinite(step)) {
    const current = Number.isFinite(player.questStates[questId]) ? player.questStates[questId] : 0;
    player.questStates[questId] = current + step;
  } else {
    player.questStates[questId] = step;
  }
  return player.questStates[questId];
}

function toStatLabel(key) {
  if (key === "bone") {
    return "根骨";
  }
  if (key === "agility") {
    return "身法";
  }
  if (key === "insight") {
    return "悟性";
  }
  return key;
}

function isNonZeroNumber(value) {
  return typeof value === "number" && value !== 0;
}

function clampRelation(value) {
  return Math.max(-100, Math.min(100, Math.round(value || 0)));
}

function formatSigned(value) {
  return value > 0 ? `+${value}` : `${value}`;
}
