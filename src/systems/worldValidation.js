import { mapRegions, mapNodes, mapEdges, regionEdges, getNodeById, getRegionById } from "../data/map.js";
import { npcs, getNpcById } from "../data/npcs.js";
import { events } from "../data/events.js";
import { enemies } from "../data/enemies.js";
import { getMartialById } from "../data/martialArts.js";
import { getFactionById } from "../data/factions.js";

export function validateWorldData() {
  const warnings = [];

  validateMap(warnings);
  validateNpc(warnings);
  validateEvents(warnings);
  validateEnemies(warnings);

  return warnings;
}

function validateMap(warnings) {
  if (!Array.isArray(mapRegions) || mapRegions.length === 0) {
    warnings.push("地图区域为空");
    return;
  }

  if (!Array.isArray(mapNodes) || mapNodes.length === 0) {
    warnings.push("地图节点为空");
    return;
  }

  const regionIds = new Set();
  for (const region of mapRegions) {
    if (!isNonEmptyString(region.id)) {
      warnings.push("区域缺少有效 id");
      continue;
    }

    if (regionIds.has(region.id)) {
      warnings.push(`重复区域ID：${region.id}`);
    }
    regionIds.add(region.id);

    if (!isNonEmptyString(region.name)) {
      warnings.push(`区域 ${region.id} 缺少 name`);
    }
    if (!Number.isFinite(region.x) || !Number.isFinite(region.y)) {
      warnings.push(`区域 ${region.id} 的坐标非法`);
    }
    if (!region.mapBackdrop || !isNonEmptyString(region.mapBackdrop.image)) {
      warnings.push(`区域 ${region.id} 缺少 mapBackdrop.image`);
    }
  }

  const nodeIds = new Set();
  for (const node of mapNodes) {
    if (!isNonEmptyString(node.id)) {
      warnings.push("地点缺少有效 id");
      continue;
    }

    if (nodeIds.has(node.id)) {
      warnings.push(`重复地点ID：${node.id}`);
    }
    nodeIds.add(node.id);

    if (!isNonEmptyString(node.name)) {
      warnings.push(`地点 ${node.id} 缺少 name`);
    }
    if (!isNonEmptyString(node.type)) {
      warnings.push(`地点 ${node.id} 缺少 type`);
    }

    if (!getRegionById(node.regionId)) {
      warnings.push(`地点 ${node.id} 引用了不存在的区域 ${node.regionId}`);
    }

    if (!node.grid || !Number.isFinite(node.grid.col) || !Number.isFinite(node.grid.row)) {
      warnings.push(`地点 ${node.id} 缺少合法 grid`);
    }

    if (node.tags && !isStringArray(node.tags)) {
      warnings.push(`地点 ${node.id} 的 tags 必须是字符串数组`);
    }
  }

  if (!Array.isArray(mapEdges)) {
    warnings.push("mapEdges 必须是数组");
  } else {
    for (const edge of mapEdges) {
      if (!isIdPair(edge)) {
        warnings.push(`地图连线结构非法：${JSON.stringify(edge)}`);
        continue;
      }
      const [from, to] = edge;
      if (!getNodeById(from) || !getNodeById(to)) {
        warnings.push(`地图连线非法：${from} -> ${to}`);
      }
    }
  }

  if (!Array.isArray(regionEdges)) {
    warnings.push("regionEdges 必须是数组");
  } else {
    for (const edge of regionEdges) {
      if (!isIdPair(edge)) {
        warnings.push(`区域连线结构非法：${JSON.stringify(edge)}`);
        continue;
      }
      const [from, to] = edge;
      if (!getRegionById(from) || !getRegionById(to)) {
        warnings.push(`区域连线非法：${from} -> ${to}`);
      }
    }
  }
}

function validateNpc(warnings) {
  if (!Array.isArray(npcs)) {
    warnings.push("NPC 列表必须是数组");
    return;
  }

  for (const npc of npcs) {
    if (!isNonEmptyString(npc.id)) {
      warnings.push("NPC 缺少有效 id");
      continue;
    }

    if (!isNonEmptyString(npc.name)) {
      warnings.push(`NPC ${npc.id} 缺少 name`);
    }

    if (!isNonEmptyString(npc.home)) {
      warnings.push(`NPC ${npc.id} 缺少 home`);
    } else if (!getNodeById(npc.home)) {
      warnings.push(`NPC ${npc.id} home 不存在：${npc.home}`);
    }

    if (npc.factionId && !getFactionById(npc.factionId)) {
      warnings.push(`NPC ${npc.id} faction 不存在：${npc.factionId}`);
    }

    if (npc.tags && !isStringArray(npc.tags)) {
      warnings.push(`NPC ${npc.id} tags 必须是字符串数组`);
    }

    if (npc.affinityOnTalk !== undefined && !Number.isFinite(npc.affinityOnTalk)) {
      warnings.push(`NPC ${npc.id} affinityOnTalk 必须是数字`);
    }

    if (!Array.isArray(npc.schedule) || npc.schedule.length === 0) {
      warnings.push(`NPC ${npc.id} 缺少 schedule`);
    } else {
      for (const slot of npc.schedule) {
        if (!Number.isFinite(slot.from) || !Number.isFinite(slot.to)) {
          warnings.push(`NPC ${npc.id} 行程时间非法`);
        }
        if (!isNonEmptyString(slot.location)) {
          warnings.push(`NPC ${npc.id} 行程缺少 location`);
        } else if (!getNodeById(slot.location)) {
          warnings.push(`NPC ${npc.id} 行程引用不存在地点：${slot.location}`);
        }
        if (!isNonEmptyString(slot.action)) {
          warnings.push(`NPC ${npc.id} 行程缺少 action`);
        }
      }
    }

    if (!Array.isArray(npc.talks) || npc.talks.length === 0) {
      warnings.push(`NPC ${npc.id} 缺少 talks`);
    } else {
      for (const talk of npc.talks) {
        if (!isNonEmptyString(talk.text)) {
          warnings.push(`NPC ${npc.id} 存在空对白`);
        }
      }
    }

    for (const relation of npc.relationshipSeeds || []) {
      if (!isNonEmptyString(relation.targetId)) {
        warnings.push(`NPC ${npc.id} 关系缺少 targetId`);
        continue;
      }
      if (!getNpcById(relation.targetId)) {
        warnings.push(`NPC ${npc.id} 关系引用不存在角色：${relation.targetId}`);
      }
      if (relation.affinity !== undefined && !Number.isFinite(relation.affinity)) {
        warnings.push(`NPC ${npc.id} 与 ${relation.targetId} 的 affinity 非法`);
      }
    }
  }
}

function validateEvents(warnings) {
  if (!Array.isArray(events) || events.length === 0) {
    warnings.push("事件列表为空");
    return;
  }

  const eventIds = new Set();

  for (const event of events) {
    if (!isNonEmptyString(event.id)) {
      warnings.push("事件缺少有效 id");
      continue;
    }

    if (eventIds.has(event.id)) {
      warnings.push(`重复事件ID：${event.id}`);
    }
    eventIds.add(event.id);

    if (!isNonEmptyString(event.title)) {
      warnings.push(`事件 ${event.id} 缺少 title`);
    }
    if (!isNonEmptyString(event.description)) {
      warnings.push(`事件 ${event.id} 缺少 description`);
    }
    if (typeof event.repeatable !== "boolean") {
      warnings.push(`事件 ${event.id} repeatable 必须是布尔值`);
    }
    if (!Number.isFinite(event.weight) || event.weight <= 0) {
      warnings.push(`事件 ${event.id} weight 必须是正数`);
    }

    validateEventConditions(event, warnings);

    if (!Array.isArray(event.choices) || event.choices.length === 0) {
      warnings.push(`事件 ${event.id} 缺少 choices`);
      continue;
    }

    for (const choice of event.choices) {
      if (!isNonEmptyString(choice.id) || !isNonEmptyString(choice.label)) {
        warnings.push(`事件 ${event.id} 存在非法选项`);
      }

      if (!Array.isArray(choice.outcomes) || choice.outcomes.length === 0) {
        warnings.push(`事件 ${event.id}/${choice.id} 缺少 outcomes`);
        continue;
      }

      const totalChance = choice.outcomes.reduce((sum, item) => sum + (Number.isFinite(item.chance) ? item.chance : 0), 0);
      if (totalChance <= 0) {
        warnings.push(`事件 ${event.id}/${choice.id} 的 outcome chance 总和必须大于0`);
      }

      for (const outcome of choice.outcomes) {
        if (!Number.isFinite(outcome.chance) || outcome.chance <= 0) {
          warnings.push(`事件 ${event.id}/${choice.id} 存在非法 chance`);
        }
        if (!isNonEmptyString(outcome.text)) {
          warnings.push(`事件 ${event.id}/${choice.id} 存在空 outcome 文本`);
        }
        validateEffectCore(event.id, outcome.effects, warnings);

        const battle = outcome.effects && outcome.effects.battle;
        if (battle) {
          if (!isNonEmptyString(battle.enemyId) || !enemies[battle.enemyId]) {
            warnings.push(`事件 ${event.id} 战斗敌人不存在：${battle.enemyId}`);
          }

          if (battle.onVictory) {
            validateEffectCore(event.id, battle.onVictory, warnings, "onVictory");
          }

          if (battle.onDefeat) {
            validateEffectCore(event.id, battle.onDefeat, warnings, "onDefeat");
          }
        }
      }
    }
  }
}

function validateEventConditions(event, warnings) {
  const conditions = event.conditions;
  if (!conditions || typeof conditions !== "object") {
    warnings.push(`事件 ${event.id} 缺少 conditions`);
    return;
  }

  if (conditions.locations && !isStringArray(conditions.locations)) {
    warnings.push(`事件 ${event.id} conditions.locations 必须是字符串数组`);
  }

  if (conditions.regions && !isStringArray(conditions.regions)) {
    warnings.push(`事件 ${event.id} conditions.regions 必须是字符串数组`);
  }

  for (const nodeId of conditions.locations || []) {
    if (!getNodeById(nodeId)) {
      warnings.push(`事件 ${event.id} 条件引用地点不存在：${nodeId}`);
    }
  }

  for (const regionId of conditions.regions || []) {
    if (!getRegionById(regionId)) {
      warnings.push(`事件 ${event.id} 条件引用区域不存在：${regionId}`);
    }
  }

  if (conditions.requiresNpc && !getNpcById(conditions.requiresNpc)) {
    warnings.push(`事件 ${event.id} requiresNpc 不存在：${conditions.requiresNpc}`);
  }

  for (const npcId of conditions.requiresAnyNpc || []) {
    if (!getNpcById(npcId)) {
      warnings.push(`事件 ${event.id} requiresAnyNpc 不存在：${npcId}`);
    }
  }

  if (conditions.requiredAlignment && !isStringArrayOrString(conditions.requiredAlignment)) {
    warnings.push(`事件 ${event.id} requiredAlignment 必须是字符串或字符串数组`);
  }
}

function validateEnemies(warnings) {
  if (!enemies || typeof enemies !== "object") {
    warnings.push("敌人数据非法");
    return;
  }

  const requiredNumericFields = [
    "maxHp",
    "attack",
    "hit",
    "dodge",
    "block",
    "speed",
    "xpReward",
    "potentialReward",
    "goldReward"
  ];

  for (const [enemyId, enemy] of Object.entries(enemies)) {
    if (!isNonEmptyString(enemy.id) || enemy.id !== enemyId) {
      warnings.push(`敌人 ${enemyId} 的 id 字段非法或与键不一致`);
    }

    if (!isNonEmptyString(enemy.name)) {
      warnings.push(`敌人 ${enemyId} 缺少 name`);
    }

    for (const field of requiredNumericFields) {
      if (!Number.isFinite(enemy[field]) || enemy[field] <= 0) {
        warnings.push(`敌人 ${enemyId} 的 ${field} 必须是正数`);
      }
    }

    if (!isStringArray(enemy.moves) || enemy.moves.length === 0) {
      warnings.push(`敌人 ${enemyId} 的 moves 必须是非空字符串数组`);
    }
  }
}

function validateEffectCore(eventId, effectPack, warnings, suffix = "") {
  if (!effectPack || typeof effectPack !== "object") {
    return;
  }

  if (effectPack.addSkill && !getMartialById(effectPack.addSkill)) {
    warnings.push(`事件 ${eventId}${suffix ? `/${suffix}` : ""} addSkill 不存在：${effectPack.addSkill}`);
  }

  if (effectPack.reputationDelta) {
    for (const factionId of Object.keys(effectPack.reputationDelta)) {
      if (!getFactionById(factionId)) {
        warnings.push(`事件 ${eventId}${suffix ? `/${suffix}` : ""} 引用未知阵营：${factionId}`);
      }
    }
  }

  if (effectPack.relationDelta) {
    for (const npcId of Object.keys(effectPack.relationDelta)) {
      if (!getNpcById(npcId)) {
        warnings.push(`事件 ${eventId}${suffix ? `/${suffix}` : ""} 引用未知角色：${npcId}`);
      }
    }
  }
}

function isIdPair(value) {
  return Array.isArray(value) && value.length === 2 && isNonEmptyString(value[0]) && isNonEmptyString(value[1]);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringArrayOrString(value) {
  return isNonEmptyString(value) || isStringArray(value);
}
