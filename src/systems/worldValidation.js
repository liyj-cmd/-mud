import { mapRegions, mapNodes, mapEdges, regionEdges, getNodeById, getRegionById, getAdjacentNodeIds } from "../data/map.js";
import { nodeScenes } from "../data/nodeScenes.js";
import { npcs, getNpcById } from "../data/npcs.js";
import { events } from "../data/events.js";
import { enemies } from "../data/enemies.js";
import { getMartialById } from "../data/martialArts.js";
import { getFactionById } from "../data/factions.js";
import { npcMartialLoadoutOverrides, getNpcMartialLoadout, martialSlotOrder } from "../data/npcMartialLoadouts.js";
import { npcInteractionProfiles, getNpcInteractionProfile } from "../data/npcInteractionProfiles.js";
import { getItemById } from "../data/items.js";
import { sceneThemes, isSceneThemeId, getSceneTheme } from "../data/sceneThemes.js";
import { isAmbientMusicProfileId } from "../data/ambientMusicProfiles.js";
import { listArtPacks } from "../data/artPacks.js";
import {
  factionCharacterModelProfiles,
  npcCharacterModelOverrides,
  roleCharacterModelProfiles,
  tagCharacterModelProfiles
} from "../data/characterModelProfiles.js";

export function validateWorldData() {
  const warnings = [];

  validateMap(warnings);
  validateSceneThemes(warnings);
  validateArtPacks(warnings);
  validateNodeScenes(warnings);
  validateNpc(warnings);
  validateNpcMartialLoadouts(warnings);
  validateNpcInteractionProfiles(warnings);
  validateCharacterModels(warnings);
  validateEvents(warnings);
  validateEnemies(warnings);

  return warnings;
}

function validateArtPacks(warnings) {
  const packs = listArtPacks();
  if (!Array.isArray(packs) || packs.length === 0) {
    warnings.push("artPacks 不能为空");
    return;
  }

  const packIds = new Set();
  for (const pack of packs) {
    if (!pack || typeof pack !== "object") {
      warnings.push("artPacks 存在非法项");
      continue;
    }

    if (!isNonEmptyString(pack.id)) {
      warnings.push("artPack 缺少 id");
      continue;
    }
    if (packIds.has(pack.id)) {
      warnings.push(`重复 artPack：${pack.id}`);
    }
    packIds.add(pack.id);

    if (!isNonEmptyString(pack.name)) {
      warnings.push(`artPack ${pack.id} 缺少 name`);
    }
    if (!isNonEmptyString(pack.version)) {
      warnings.push(`artPack ${pack.id} 缺少 version`);
    }
    if (!isNonEmptyString(pack.license)) {
      warnings.push(`artPack ${pack.id} 缺少 license`);
    }
    if (!isNonEmptyString(pack.source)) {
      warnings.push(`artPack ${pack.id} 缺少 source`);
    }

    if (!pack.themes || typeof pack.themes !== "object") {
      warnings.push(`artPack ${pack.id} 缺少 themes`);
      continue;
    }

    for (const [themeId, themeConfig] of Object.entries(pack.themes)) {
      if (!themeConfig || typeof themeConfig !== "object") {
        warnings.push(`artPack ${pack.id}/${themeId} 配置非法`);
        continue;
      }

      if (themeId !== "default" && !isSceneThemeId(themeId)) {
        warnings.push(`artPack ${pack.id} 引用未知 sceneTheme：${themeId}`);
      }

      if (themeConfig.renderer !== "procedural" && themeConfig.renderer !== "sprite") {
        warnings.push(`artPack ${pack.id}/${themeId} renderer 非法：${themeConfig.renderer}`);
      }
    }
  }
}

function validateSceneThemes(warnings) {
  for (const theme of Object.values(sceneThemes)) {
    if (!theme || !isNonEmptyString(theme.id)) {
      warnings.push("sceneThemes 存在非法主题项");
      continue;
    }

    if (!isNonEmptyString(theme.name)) {
      warnings.push(`sceneTheme ${theme.id} 缺少 name`);
    }
    if (!isNonEmptyString(theme.mood)) {
      warnings.push(`sceneTheme ${theme.id} 缺少 mood`);
    }
    if (!isNonEmptyString(theme.hudHint)) {
      warnings.push(`sceneTheme ${theme.id} 缺少 hudHint`);
    }
    if (theme.musicProfileId !== undefined && !isAmbientMusicProfileId(theme.musicProfileId)) {
      warnings.push(`sceneTheme ${theme.id} musicProfileId 非法：${theme.musicProfileId}`);
    }
  }
}

function validateNodeScenes(warnings) {
  if (!Array.isArray(nodeScenes)) {
    warnings.push("nodeScenes 必须是数组");
    return;
  }

  const sceneNodeIds = new Set();
  for (const scene of nodeScenes) {
    if (!scene || typeof scene !== "object") {
      warnings.push("nodeScenes 存在非法项");
      continue;
    }

    if (!isNonEmptyString(scene.nodeId)) {
      warnings.push("nodeScene 缺少 nodeId");
      continue;
    }
    if (sceneNodeIds.has(scene.nodeId)) {
      warnings.push(`重复 nodeScene：${scene.nodeId}`);
    }
    sceneNodeIds.add(scene.nodeId);

    const node = getNodeById(scene.nodeId);
    if (!node) {
      warnings.push(`nodeScene 引用未知地点：${scene.nodeId}`);
      continue;
    }

    if (scene.themeId !== undefined && !isSceneThemeId(scene.themeId)) {
      warnings.push(`nodeScene ${scene.nodeId} themeId 非法：${scene.themeId}`);
    } else {
      const theme = getSceneTheme(scene.themeId);
      if (theme.musicProfileId !== undefined && !isAmbientMusicProfileId(theme.musicProfileId)) {
        warnings.push(`nodeScene ${scene.nodeId} 对应主题 musicProfileId 非法：${theme.musicProfileId}`);
      }
    }

    if (!scene.size || !Number.isFinite(scene.size.width) || !Number.isFinite(scene.size.height)) {
      warnings.push(`nodeScene ${scene.nodeId} 缺少合法 size`);
      continue;
    }
    if (scene.size.width <= 0 || scene.size.height <= 0) {
      warnings.push(`nodeScene ${scene.nodeId} size 必须为正数`);
    }

    if (!scene.spawn || !Number.isFinite(scene.spawn.x) || !Number.isFinite(scene.spawn.y)) {
      warnings.push(`nodeScene ${scene.nodeId} 缺少合法 spawn`);
    } else if (!inSceneBounds(scene.spawn.x, scene.spawn.y, scene.size)) {
      warnings.push(`nodeScene ${scene.nodeId} spawn 超出场景范围`);
    }

    if (!Array.isArray(scene.obstacles)) {
      warnings.push(`nodeScene ${scene.nodeId} obstacles 必须是数组`);
    } else {
      for (const obstacle of scene.obstacles) {
        if (!isRect(obstacle)) {
          warnings.push(`nodeScene ${scene.nodeId} 存在非法障碍物`);
          continue;
        }
        if (!inSceneRectBounds(obstacle, scene.size)) {
          warnings.push(`nodeScene ${scene.nodeId} 障碍物越界：${obstacle.id || "unknown"}`);
        }
        if (obstacle.visualKey !== undefined && !isNonEmptyString(obstacle.visualKey)) {
          warnings.push(`nodeScene ${scene.nodeId} obstacle.visualKey 非法：${obstacle.id || "unknown"}`);
        }
      }
    }

    if (!Array.isArray(scene.exits)) {
      warnings.push(`nodeScene ${scene.nodeId} exits 必须是数组`);
    } else {
      for (const exit of scene.exits) {
        if (!isRect(exit) || !isNonEmptyString(exit.toNodeId)) {
          warnings.push(`nodeScene ${scene.nodeId} 存在非法出口配置`);
          continue;
        }
        if (!getNodeById(exit.toNodeId)) {
          warnings.push(`nodeScene ${scene.nodeId} 出口引用未知地点：${exit.toNodeId}`);
        } else if (!getAdjacentNodeIds(scene.nodeId).includes(exit.toNodeId)) {
          warnings.push(`nodeScene ${scene.nodeId} 出口未连接到相邻地点：${exit.toNodeId}`);
        }
        if (!inSceneRectBounds(exit, scene.size)) {
          warnings.push(`nodeScene ${scene.nodeId} 出口越界：${exit.id || exit.toNodeId}`);
        }
        if (exit.visualKey !== undefined && !isNonEmptyString(exit.visualKey)) {
          warnings.push(`nodeScene ${scene.nodeId} exit.visualKey 非法：${exit.id || exit.toNodeId}`);
        }
      }
    }

    if (!scene.npcAnchors || typeof scene.npcAnchors !== "object") {
      warnings.push(`nodeScene ${scene.nodeId} 缺少 npcAnchors`);
    } else {
      for (const [npcId, anchor] of Object.entries(scene.npcAnchors)) {
        if (!getNpcById(npcId)) {
          warnings.push(`nodeScene ${scene.nodeId} 锚点引用未知NPC：${npcId}`);
          continue;
        }
        if (!anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) {
          warnings.push(`nodeScene ${scene.nodeId} NPC 锚点非法：${npcId}`);
          continue;
        }
        if (!inSceneBounds(anchor.x, anchor.y, scene.size)) {
          warnings.push(`nodeScene ${scene.nodeId} NPC 锚点越界：${npcId}`);
        }
      }
    }

    if (scene.pois !== undefined) {
      if (!Array.isArray(scene.pois)) {
        warnings.push(`nodeScene ${scene.nodeId} pois 必须是数组`);
      } else {
        for (const poi of scene.pois) {
          if (!poi || !isNonEmptyString(poi.id) || !Number.isFinite(poi.x) || !Number.isFinite(poi.y)) {
            warnings.push(`nodeScene ${scene.nodeId} 存在非法 poi`);
            continue;
          }
          if (!inSceneBounds(poi.x, poi.y, scene.size)) {
            warnings.push(`nodeScene ${scene.nodeId} poi 越界：${poi.id}`);
          }
          if (poi.radius !== undefined && (!Number.isFinite(poi.radius) || poi.radius <= 0)) {
            warnings.push(`nodeScene ${scene.nodeId} poi.radius 非法：${poi.id}`);
          }
          if (poi.timeCost !== undefined && (!Number.isFinite(poi.timeCost) || poi.timeCost <= 0)) {
            warnings.push(`nodeScene ${scene.nodeId} poi.timeCost 非法：${poi.id}`);
          }
          if (poi.visualKey !== undefined && !isNonEmptyString(poi.visualKey)) {
            warnings.push(`nodeScene ${scene.nodeId} poi.visualKey 非法：${poi.id}`);
          }
        }
      }
    }
  }
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

    if (node.sceneBackdrop) {
      if (!isNonEmptyString(node.sceneBackdrop.image)) {
        warnings.push(`地点 ${node.id} 的 sceneBackdrop.image 缺失`);
      }
      if (node.sceneBackdrop.position && !isNonEmptyString(node.sceneBackdrop.position)) {
        warnings.push(`地点 ${node.id} 的 sceneBackdrop.position 非法`);
      }
      if (node.sceneBackdrop.size && !isNonEmptyString(node.sceneBackdrop.size)) {
        warnings.push(`地点 ${node.id} 的 sceneBackdrop.size 非法`);
      }
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

function validateNpcMartialLoadouts(warnings) {
  for (const npcId of Object.keys(npcMartialLoadoutOverrides || {})) {
    if (!getNpcById(npcId)) {
      warnings.push(`武学配置引用未知 NPC：${npcId}`);
    }
  }

  for (const npc of npcs) {
    const loadout = getNpcMartialLoadout(npc.id);
    if (!loadout) {
      continue;
    }

    for (const slot of martialSlotOrder) {
      const skillId = loadout.slots[slot];
      const skill = getMartialById(skillId);
      if (!skill) {
        warnings.push(`NPC ${npc.id} 的 ${slot} 槽位武学不存在：${skillId}`);
        continue;
      }
      if (skill.slot !== slot) {
        warnings.push(`NPC ${npc.id} 的 ${slot} 槽位武学类型不匹配：${skillId}`);
      }
    }

    for (const [skillId, level] of Object.entries(loadout.skillLevels || {})) {
      if (!getMartialById(skillId)) {
        warnings.push(`NPC ${npc.id} 的武学等级配置引用未知武学：${skillId}`);
      }
      if (!Number.isFinite(level) || level <= 0) {
        warnings.push(`NPC ${npc.id} 的武学等级非法：${skillId}=${level}`);
      }
    }
  }
}

function validateCharacterModels(warnings) {
  for (const factionId of Object.keys(factionCharacterModelProfiles || {})) {
    if (!getFactionById(factionId)) {
      warnings.push(`人物建模 faction 配置引用未知阵营：${factionId}`);
    }
  }

  for (const npcId of Object.keys(npcCharacterModelOverrides || {})) {
    if (!getNpcById(npcId)) {
      warnings.push(`人物建模 NPC 覆写引用未知角色：${npcId}`);
    }
  }

  const roleProfiles = Array.isArray(roleCharacterModelProfiles) ? roleCharacterModelProfiles : [];
  for (const entry of roleProfiles) {
    if (!entry || !isNonEmptyString(entry.keyword) || !entry.profile || typeof entry.profile !== "object") {
      warnings.push("人物建模 roleCharacterModelProfiles 存在非法项");
    }
  }

  const tagProfiles = tagCharacterModelProfiles && typeof tagCharacterModelProfiles === "object" ? tagCharacterModelProfiles : null;
  if (!tagProfiles) {
    warnings.push("人物建模 tagCharacterModelProfiles 必须是对象");
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
          const hasEnemyId = isNonEmptyString(battle.enemyId);
          const hasNpcId = isNonEmptyString(battle.npcId);

          if (!hasEnemyId && !hasNpcId) {
            warnings.push(`事件 ${event.id} 战斗配置缺少 enemyId 或 npcId`);
          }
          if (hasEnemyId && !enemies[battle.enemyId]) {
            warnings.push(`事件 ${event.id} 战斗敌人不存在：${battle.enemyId}`);
          }
          if (hasNpcId && !getNpcById(battle.npcId)) {
            warnings.push(`事件 ${event.id} 战斗 NPC 不存在：${battle.npcId}`);
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

    for (const field of ["maxQi", "parry", "break", "crit"]) {
      if (enemy[field] !== undefined && (!Number.isFinite(enemy[field]) || enemy[field] <= 0)) {
        warnings.push(`敌人 ${enemyId} 的 ${field}（若存在）必须是正数`);
      }
    }

    if (!isStringArray(enemy.moves) || enemy.moves.length === 0) {
      warnings.push(`敌人 ${enemyId} 的 moves 必须是非空字符串数组`);
    }
  }
}

function validateNpcInteractionProfiles(warnings) {
  for (const npcId of Object.keys(npcInteractionProfiles || {})) {
    if (!getNpcById(npcId)) {
      warnings.push(`NPC 交互配置引用未知角色：${npcId}`);
      continue;
    }

    const profile = getNpcInteractionProfile(npcId);
    if (!profile) {
      continue;
    }

    for (const teachable of profile.teachableSkills || []) {
      if (!isNonEmptyString(teachable.skillId) || !getMartialById(teachable.skillId)) {
        warnings.push(`NPC ${npcId} teachableSkills 引用未知武学：${teachable.skillId}`);
      }
    }

    if (profile.steal?.enabled) {
      for (const loot of profile.steal.loot || []) {
        if (loot.type === "item" && !getItemById(loot.itemId)) {
          warnings.push(`NPC ${npcId} 行窃掉落引用未知物品：${loot.itemId}`);
        }
      }
    }

    if (profile.combat?.enabled) {
      if (!Number.isFinite(profile.combat.tier) || profile.combat.tier <= 0) {
        warnings.push(`NPC ${npcId} combat.tier 必须是正数`);
      }
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

function isRect(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    return false;
  }
  if (!Number.isFinite(value.width) || !Number.isFinite(value.height)) {
    return false;
  }
  return value.width > 0 && value.height > 0;
}

function inSceneBounds(x, y, size) {
  return x >= 0 && y >= 0 && x <= size.width && y <= size.height;
}

function inSceneRectBounds(rect, size) {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= size.width && rect.y + rect.height <= size.height;
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
