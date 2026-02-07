export const factions = [
  {
    id: "neutral_wulin",
    name: "江湖散人",
    description: "不依附正邪两道，重人情与利益。",
    defaultReputation: 0
  },
  {
    id: "huashan",
    name: "华山派",
    description: "重剑理与门规，偏好正面行止。",
    defaultReputation: 0
  },
  {
    id: "zhongnan_hermits",
    name: "终南隐修",
    description: "隐士与古观门徒，重机缘与清静。",
    defaultReputation: 0
  },
  {
    id: "gumu",
    name: "古墓门人",
    description: "寡言而重承诺，对外谨慎。",
    defaultReputation: 0
  },
  {
    id: "shaolin",
    name: "少林寺",
    description: "武林名门，重戒律与慈悲。",
    defaultReputation: 0
  },
  {
    id: "wudang",
    name: "武当派",
    description: "道门正宗，崇尚以静制动。",
    defaultReputation: 0
  },
  {
    id: "emei",
    name: "峨眉派",
    description: "清修入世并重，护民重义。",
    defaultReputation: 0
  },
  {
    id: "imperial_court",
    name: "朝廷差司",
    description: "重秩序与功劳，厌恶匪患。",
    defaultReputation: 0
  },
  {
    id: "xiangyang_guard",
    name: "襄阳守军",
    description: "常年守土，重实战与信誉。",
    defaultReputation: 0
  },
  {
    id: "suzhou_merchants",
    name: "江南商会",
    description: "擅经商与水路人脉，重契约。",
    defaultReputation: 0
  },
  {
    id: "jianghu_knights",
    name: "江湖游侠",
    description: "不受门规束缚，重个人承诺与名声。",
    defaultReputation: 0
  },
  {
    id: "dali_royal",
    name: "大理段氏",
    description: "重礼法与仁政，偏好稳健合作。",
    defaultReputation: 0
  },
  {
    id: "heimu_bandits",
    name: "黑木群盗",
    description: "盘踞山林，唯利是图。",
    defaultReputation: -5
  }
];

const factionById = new Map(factions.map((faction) => [faction.id, faction]));

export function getFactionById(factionId) {
  return factionById.get(factionId) || null;
}

export function clampReputation(value) {
  return Math.max(-100, Math.min(100, Math.round(value || 0)));
}

export function createInitialReputations(overrides = {}) {
  const reputations = {};

  for (const faction of factions) {
    const seed = typeof overrides[faction.id] === "number" ? overrides[faction.id] : faction.defaultReputation;
    reputations[faction.id] = clampReputation(seed);
  }

  for (const [factionId, value] of Object.entries(overrides)) {
    if (reputations[factionId] === undefined) {
      reputations[factionId] = clampReputation(value);
    }
  }

  return reputations;
}
