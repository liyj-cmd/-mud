import { getNpcById } from "./npcs.js";
import { getNpcMartialLoadout, listNpcSignatureSkills } from "./npcMartialLoadouts.js";

const DEFAULT_PROFILE = Object.freeze({
  teachableSkills: [],
  steal: {
    enabled: false,
    difficulty: 62,
    relationPenaltyOnFail: -8,
    reputationPenaltyOnFail: -2,
    loot: []
  },
  combat: {
    enabled: false,
    tier: 2,
    rewardScale: 1
  }
});

export const npcInteractionProfiles = Object.freeze({
  merchant_zhou: {
    steal: {
      enabled: true,
      difficulty: 58,
      relationPenaltyOnFail: -6,
      reputationPenaltyOnFail: -1,
      loot: [
        { type: "gold", min: 8, max: 20, weight: 3 },
        { type: "item", itemId: "fine_cloth", min: 1, max: 1, weight: 2 },
        { type: "item", itemId: "silver_ticket", min: 1, max: 1, weight: 1 }
      ]
    }
  },
  innkeeper_tong: {
    steal: {
      enabled: true,
      difficulty: 60,
      relationPenaltyOnFail: -7,
      reputationPenaltyOnFail: -1,
      loot: [
        { type: "gold", min: 6, max: 16, weight: 4 },
        { type: "item", itemId: "secret_note", min: 1, max: 1, weight: 1 }
      ]
    }
  },
  disciple_qing: {
    combat: { enabled: true, tier: 3, rewardScale: 0.9 }
  },
  ranger_hei: {
    combat: { enabled: true, tier: 4, rewardScale: 1.1 },
    steal: {
      enabled: true,
      difficulty: 65,
      relationPenaltyOnFail: -10,
      reputationPenaltyOnFail: -2,
      loot: [
        { type: "item", itemId: "mountain_map", min: 1, max: 1, weight: 2 },
        { type: "item", itemId: "iron_dart", min: 1, max: 2, weight: 3 },
        { type: "gold", min: 10, max: 22, weight: 2 }
      ]
    }
  },
  zhang_sanfeng: {
    teachableSkills: [
      { skillId: "taiji_quan", relationMin: 10, potentialCost: 26 },
      { skillId: "taiji_shengong", relationMin: 14, potentialCost: 34 },
      { skillId: "taiji_jian", relationMin: 12, potentialCost: 30 }
    ],
    combat: { enabled: true, tier: 9, rewardScale: 2 }
  },
  dugu_qiubai: {
    teachableSkills: [{ skillId: "dugu_jiujian", relationMin: 12, potentialCost: 40 }],
    combat: { enabled: true, tier: 10, rewardScale: 2.2 }
  },
  guo_jing: {
    teachableSkills: [
      { skillId: "xianglong_shibazhang", relationMin: 10, potentialCost: 34 },
      { skillId: "jiuyang_shengong", relationMin: 14, potentialCost: 40 }
    ],
    combat: { enabled: true, tier: 8, rewardScale: 1.8 }
  },
  huang_yaoshi: {
    teachableSkills: [
      { skillId: "lingbo_weibu", relationMin: 10, potentialCost: 28 },
      { skillId: "beiming_shengong", relationMin: 13, potentialCost: 36 }
    ],
    combat: { enabled: true, tier: 8, rewardScale: 1.8 }
  },
  zhang_wuji: {
    teachableSkills: [
      { skillId: "qiankun_danuoyi", relationMin: 12, potentialCost: 36 },
      { skillId: "jiuyang_shengong", relationMin: 10, potentialCost: 32 }
    ],
    combat: { enabled: true, tier: 8, rewardScale: 1.8 }
  },
  ren_woxing: {
    teachableSkills: [{ skillId: "xixing_dafa", relationMin: 11, potentialCost: 34 }],
    combat: { enabled: true, tier: 8, rewardScale: 1.9 },
    steal: {
      enabled: true,
      difficulty: 78,
      relationPenaltyOnFail: -16,
      reputationPenaltyOnFail: -4,
      loot: [
        { type: "item", itemId: "secret_note", min: 1, max: 1, weight: 2 },
        { type: "item", itemId: "jade_token", min: 1, max: 1, weight: 1 },
        { type: "gold", min: 18, max: 36, weight: 2 }
      ]
    }
  },
  dongfang_bubai: {
    teachableSkills: [{ skillId: "bixie_jianfa", relationMin: 12, potentialCost: 38 }],
    combat: { enabled: true, tier: 10, rewardScale: 2.2 }
  },
  duan_yu: {
    teachableSkills: [
      { skillId: "beiming_shengong", relationMin: 10, potentialCost: 30 },
      { skillId: "lingbo_weibu", relationMin: 8, potentialCost: 26 }
    ],
    combat: { enabled: true, tier: 7, rewardScale: 1.5 }
  }
});

export function getNpcInteractionProfile(npcId) {
  const npc = getNpcById(npcId);
  if (!npc) {
    return null;
  }

  const merged = deepClone(DEFAULT_PROFILE);

  if (Array.isArray(npc.tags)) {
    if (npc.tags.includes("mentor")) {
      const fallbackSkills = listNpcSignatureSkills(npcId).map((skillId) => ({
        skillId,
        relationMin: npc.tags.includes("legend") ? 14 : 9,
        potentialCost: npc.tags.includes("legend") ? 28 : 20
      }));
      merged.teachableSkills = dedupeTeachables([...merged.teachableSkills, ...fallbackSkills]);
    }

    if (npc.tags.includes("duel") || npc.tags.includes("guard") || npc.tags.includes("training")) {
      merged.combat.enabled = true;
      merged.combat.tier = Math.max(merged.combat.tier, npc.tags.includes("legend") ? 8 : 4);
    }

    if (npc.tags.includes("merchant") || npc.tags.includes("underworld") || npc.tags.includes("rumor")) {
      merged.steal.enabled = true;
      merged.steal.loot = [
        { type: "gold", min: 6, max: 16, weight: 4 },
        { type: "item", itemId: "coarse_herb", min: 1, max: 2, weight: 2 },
        { type: "item", itemId: "weapon_oil", min: 1, max: 1, weight: 1 }
      ];
    }
  }

  const override = npcInteractionProfiles[npcId];
  if (override) {
    mergeProfile(merged, override);
  }

  merged.teachableSkills = dedupeTeachables(merged.teachableSkills);
  return merged;
}

function mergeProfile(target, source) {
  if (!source || typeof source !== "object") {
    return;
  }

  if (Array.isArray(source.teachableSkills)) {
    target.teachableSkills = dedupeTeachables([...target.teachableSkills, ...source.teachableSkills]);
  }

  if (source.steal && typeof source.steal === "object") {
    target.steal = {
      ...target.steal,
      ...source.steal,
      loot: Array.isArray(source.steal.loot) ? source.steal.loot : target.steal.loot
    };
  }

  if (source.combat && typeof source.combat === "object") {
    target.combat = {
      ...target.combat,
      ...source.combat
    };
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dedupeTeachables(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    if (!item || typeof item.skillId !== "string") {
      continue;
    }
    if (seen.has(item.skillId)) {
      continue;
    }
    seen.add(item.skillId);
    out.push({
      skillId: item.skillId,
      relationMin: Number.isFinite(item.relationMin) ? Math.round(item.relationMin) : 0,
      potentialCost: Number.isFinite(item.potentialCost) ? Math.round(item.potentialCost) : 0
    });
  }
  return out;
}
