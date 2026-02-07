import { getNodeById, getNodeRegion } from "../data/map.js";
import { addExperience, ensurePlayerState } from "./progression.js";
import { applyEffectPack } from "./effectApplier.js";

export function createEventSystem(eventDefs) {
  return {
    getAvailableEvents(state, scheduler) {
      return eventDefs.filter((event) => matchEvent(event, state, scheduler));
    },
    pickEvent(state, scheduler) {
      const available = this.getAvailableEvents(state, scheduler);
      if (available.length === 0) {
        return null;
      }

      const totalWeight = available.reduce((sum, event) => sum + (event.weight || 1), 0);
      let ticket = Math.random() * totalWeight;
      for (const event of available) {
        ticket -= event.weight || 1;
        if (ticket <= 0) {
          return event;
        }
      }
      return available[available.length - 1];
    },
    resolveChoice({ event, choiceId, state, onLog, startBattle }) {
      const choice = event.choices.find((item) => item.id === choiceId);
      if (!choice) {
        return { ok: false, message: "未找到选项" };
      }

      const outcome = pickOutcome(choice.outcomes);
      const logs = [];
      logs.push(outcome.text);
      applyEffects({
        effects: outcome.effects || {},
        state,
        logs,
        onLog,
        startBattle
      });

      if (!event.repeatable) {
        state.eventHistory[event.id] = true;
      }

      return {
        ok: true,
        logs,
        outcome
      };
    }
  };
}

function matchEvent(event, state, scheduler) {
  if (!event || !event.conditions || !state.player) {
    return false;
  }

  ensurePlayerState(state.player);

  if (!event.repeatable && state.eventHistory[event.id]) {
    return false;
  }

  const conditions = event.conditions;
  const playerLocation = state.player.location;
  const locationNode = getNodeById(playerLocation);
  const locationRegion = getNodeRegion(playerLocation);
  const npcsAtLocation = scheduler.getNpcsAt(playerLocation);

  if (conditions.locations && !conditions.locations.includes(playerLocation)) {
    return false;
  }

  if (Array.isArray(conditions.regions)) {
    if (!locationRegion || !conditions.regions.includes(locationRegion.id)) {
      return false;
    }
  }

  if (Array.isArray(conditions.locationTags)) {
    if (!locationNode || !hasAnyTag(locationNode.tags, conditions.locationTags)) {
      return false;
    }
  }

  if (Array.isArray(conditions.locationTagsAll)) {
    if (!locationNode || !hasAllTags(locationNode.tags, conditions.locationTagsAll)) {
      return false;
    }
  }

  if (typeof conditions.minHour === "number" && typeof conditions.maxHour === "number") {
    if (!isHourInRange(state.time.hour, conditions.minHour, conditions.maxHour)) {
      return false;
    }
  }

  if (typeof conditions.minDay === "number" && state.time.day < conditions.minDay) {
    return false;
  }

  if (typeof conditions.maxDay === "number" && state.time.day > conditions.maxDay) {
    return false;
  }

  if (conditions.requiresNpc && !npcsAtLocation.some((npc) => npc.id === conditions.requiresNpc)) {
    return false;
  }

  if (Array.isArray(conditions.requiresAnyNpc)) {
    const matched = conditions.requiresAnyNpc.some((npcId) => npcsAtLocation.some((npc) => npc.id === npcId));
    if (!matched) {
      return false;
    }
  }

  if (conditions.requiresNpcTag) {
    const tags = Array.isArray(conditions.requiresNpcTag)
      ? conditions.requiresNpcTag
      : [conditions.requiresNpcTag];
    const ok = npcsAtLocation.some((npc) => hasAnyTag(npc.tags, tags));
    if (!ok) {
      return false;
    }
  }

  if (Array.isArray(conditions.requiresNpcTagsAll)) {
    const ok = npcsAtLocation.some((npc) => hasAllTags(npc.tags, conditions.requiresNpcTagsAll));
    if (!ok) {
      return false;
    }
  }

  if (conditions.requiredAlignment) {
    const allowed = Array.isArray(conditions.requiredAlignment)
      ? conditions.requiredAlignment
      : [conditions.requiredAlignment];
    if (!allowed.includes(state.player.alignment)) {
      return false;
    }
  }

  if (Array.isArray(conditions.requiredFlagsPresent)) {
    for (const key of conditions.requiredFlagsPresent) {
      if (!state.player.flags[key]) {
        return false;
      }
    }
  }

  if (Array.isArray(conditions.requiredFlagsAbsent)) {
    for (const key of conditions.requiredFlagsAbsent) {
      if (state.player.flags[key]) {
        return false;
      }
    }
  }

  if (Array.isArray(conditions.requiredWorldFlagsPresent)) {
    for (const key of conditions.requiredWorldFlagsPresent) {
      if (!state.player.world.flags[key]) {
        return false;
      }
    }
  }

  if (Array.isArray(conditions.requiredWorldFlagsAbsent)) {
    for (const key of conditions.requiredWorldFlagsAbsent) {
      if (state.player.world.flags[key]) {
        return false;
      }
    }
  }

  if (!matchStateMap(state.player.questStates, conditions.requiredQuestStates, { blocked: false })) {
    return false;
  }

  if (!matchStateMap(state.player.questStates, conditions.blockedQuestStates, { blocked: true })) {
    return false;
  }

  if (!matchNumericMap(state.player.reputations, conditions.requiredReputationMin, { upper: false })) {
    return false;
  }

  if (!matchNumericMap(state.player.reputations, conditions.requiredReputationMax, { upper: true })) {
    return false;
  }

  if (!matchNumericMap(state.player.relationships, conditions.requiredRelationMin, { upper: false })) {
    return false;
  }

  if (!matchNumericMap(state.player.relationships, conditions.requiredRelationMax, { upper: true })) {
    return false;
  }

  return true;
}

function pickOutcome(outcomes) {
  if (!outcomes || outcomes.length === 0) {
    return { text: "江湖无事发生。", effects: {} };
  }

  const totalChance = outcomes.reduce((sum, item) => sum + (item.chance || 0), 0);
  const random = Math.random() * totalChance;
  let cursor = 0;
  for (const item of outcomes) {
    cursor += item.chance || 0;
    if (random <= cursor) {
      return item;
    }
  }
  return outcomes[outcomes.length - 1];
}

function applyEffects({ effects, state, logs, onLog, startBattle }) {
  applyEffectPack({
    effects,
    player: state.player,
    time: state.time,
    onExperience: (amount) => {
      addExperience(state.player, amount, onLog);
    },
    onStartBattle: (battleConfig) => {
      if (startBattle) {
        startBattle(battleConfig);
      }
    },
    onLog: (message) => {
      logs.push(message);
    }
  });
}

function isHourInRange(hour, startHour, endHour) {
  if (startHour === endHour) {
    return true;
  }
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

function hasAnyTag(rawTags, expected) {
  if (!Array.isArray(rawTags)) {
    return false;
  }
  const tagSet = new Set(rawTags);
  return expected.some((tag) => tagSet.has(tag));
}

function hasAllTags(rawTags, expected) {
  if (!Array.isArray(rawTags)) {
    return false;
  }
  const tagSet = new Set(rawTags);
  return expected.every((tag) => tagSet.has(tag));
}

function matchStateMap(actual, requirements, { blocked }) {
  if (!requirements || typeof requirements !== "object") {
    return true;
  }

  for (const [key, expected] of Object.entries(requirements)) {
    const actualValue = actual[key];
    const expectedValues = Array.isArray(expected) ? expected : [expected];
    const matched = expectedValues.includes(actualValue);
    if (!blocked && !matched) {
      return false;
    }
    if (blocked && matched) {
      return false;
    }
  }

  return true;
}

function matchNumericMap(actual, requirements, { upper }) {
  if (!requirements || typeof requirements !== "object") {
    return true;
  }

  for (const [key, threshold] of Object.entries(requirements)) {
    if (!Number.isFinite(threshold)) {
      continue;
    }
    const value = Number.isFinite(actual[key]) ? actual[key] : 0;
    if (!upper && value < threshold) {
      return false;
    }
    if (upper && value > threshold) {
      return false;
    }
  }

  return true;
}
