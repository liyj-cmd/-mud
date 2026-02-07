import { npcs, getNpcById } from "./npcs.js";
import { getMartialById } from "./martialArts.js";

export const martialSlotOrder = Object.freeze(["fist", "weapon", "internal", "qinggong"]);

const DEFAULT_TEMPLATE = Object.freeze({
  realm: "江湖后学",
  baseSkillLevel: 1,
  bonusLevel: 0,
  slots: Object.freeze({
    fist: "luohan_quan",
    weapon: "qimen_duanjian",
    internal: "hunyuan_gong",
    qinggong: "caoshang_fei"
  }),
  skillLevels: Object.freeze({})
});

export const factionMartialTemplates = Object.freeze({
  neutral_wulin: {
    realm: "江湖散人",
    baseSkillLevel: 2,
    slots: {
      fist: "taizu_changquan",
      weapon: "qimen_duanjian",
      internal: "hunyuan_gong",
      qinggong: "caoshang_fei"
    }
  },
  huashan: {
    realm: "华山门人",
    baseSkillLevel: 3,
    slots: {
      fist: "taizu_changquan",
      weapon: "huashan_jian",
      internal: "zixia_gong",
      qinggong: "caoshang_fei"
    }
  },
  zhongnan_hermits: {
    realm: "终南隐修",
    baseSkillLevel: 3,
    slots: {
      fist: "kongming_quan",
      weapon: "qimen_duanjian",
      internal: "hunyuan_gong",
      qinggong: "caoshang_fei"
    }
  },
  gumu: {
    realm: "古墓门人",
    baseSkillLevel: 4,
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    }
  },
  shaolin: {
    realm: "少林弟子",
    baseSkillLevel: 4,
    slots: {
      fist: "luohan_quan",
      weapon: "qimen_duanjian",
      internal: "yijin_jing",
      qinggong: "caoshang_fei"
    }
  },
  wudang: {
    realm: "武当门人",
    baseSkillLevel: 4,
    slots: {
      fist: "taiji_quan",
      weapon: "taiji_jian",
      internal: "taiji_shengong",
      qinggong: "tiyun_zong"
    }
  },
  emei: {
    realm: "峨眉门人",
    baseSkillLevel: 4,
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "hunyuan_gong",
      qinggong: "tiyun_zong"
    }
  },
  imperial_court: {
    realm: "朝廷武职",
    baseSkillLevel: 3,
    slots: {
      fist: "taizu_changquan",
      weapon: "kuangfeng_dao",
      internal: "hunyuan_gong",
      qinggong: "caoshang_fei"
    }
  },
  xiangyang_guard: {
    realm: "边镇守军",
    baseSkillLevel: 4,
    slots: {
      fist: "taizu_changquan",
      weapon: "kuangfeng_dao",
      internal: "hunyuan_gong",
      qinggong: "shenxing_baibian"
    }
  },
  suzhou_merchants: {
    realm: "商会护卫",
    baseSkillLevel: 2,
    slots: {
      fist: "taizu_changquan",
      weapon: "qimen_duanjian",
      internal: "hunyuan_gong",
      qinggong: "caoshang_fei"
    }
  },
  jianghu_knights: {
    realm: "江湖名侠",
    baseSkillLevel: 4,
    slots: {
      fist: "kongming_quan",
      weapon: "huashan_jian",
      internal: "beiming_shengong",
      qinggong: "shenxing_baibian"
    }
  },
  dali_royal: {
    realm: "大理武臣",
    baseSkillLevel: 4,
    slots: {
      fist: "kongming_quan",
      weapon: "qimen_duanjian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    }
  },
  heimu_bandits: {
    realm: "山寨匪众",
    baseSkillLevel: 3,
    slots: {
      fist: "xiyang_zhang",
      weapon: "kuangfeng_dao",
      internal: "hunyuan_gong",
      qinggong: "shenxing_baibian"
    }
  },
  taohua_school: {
    realm: "桃花门人",
    baseSkillLevel: 4,
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    }
  },
  mingjiao: {
    realm: "明教教众",
    baseSkillLevel: 4,
    slots: {
      fist: "taiji_quan",
      weapon: "kuangfeng_dao",
      internal: "qiankun_danuoyi",
      qinggong: "shenxing_baibian"
    }
  },
  riyue_cult: {
    realm: "日月教众",
    baseSkillLevel: 4,
    slots: {
      fist: "xiyang_zhang",
      weapon: "bixie_jianfa",
      internal: "xixing_dafa",
      qinggong: "shenxing_baibian"
    }
  }
});

export const tagMartialTemplates = Object.freeze({
  mentor: { bonusLevel: 1 },
  leader: { bonusLevel: 1 },
  legend: { bonusLevel: 2 }
});

export const npcMartialLoadoutOverrides = Object.freeze({
  zhang_sanfeng: {
    realm: "武当祖师",
    slots: {
      fist: "taiji_quan",
      weapon: "taiji_jian",
      internal: "taiji_shengong",
      qinggong: "tiyun_zong"
    },
    skillLevels: {
      taiji_quan: 10,
      taiji_jian: 10,
      taiji_shengong: 10,
      tiyun_zong: 9,
      jiuyang_shengong: 8
    },
    extraSkills: ["jiuyang_shengong"]
  },
  dugu_qiubai: {
    realm: "剑道宗师",
    slots: {
      fist: "kongming_quan",
      weapon: "dugu_jiujian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      dugu_jiujian: 10,
      beiming_shengong: 8,
      lingbo_weibu: 8,
      kongming_quan: 7
    }
  },
  guo_jing: {
    realm: "襄阳大侠",
    slots: {
      fist: "xianglong_shibazhang",
      weapon: "huashan_jian",
      internal: "jiuyang_shengong",
      qinggong: "shenxing_baibian"
    },
    skillLevels: {
      xianglong_shibazhang: 9,
      jiuyang_shengong: 9,
      shenxing_baibian: 7,
      huashan_jian: 6
    }
  },
  huang_rong: {
    realm: "机巧名宿",
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      kongming_quan: 8,
      taiji_jian: 7,
      beiming_shengong: 8,
      lingbo_weibu: 8
    }
  },
  yang_guo: {
    realm: "神雕大侠",
    slots: {
      fist: "xianglong_shibazhang",
      weapon: "dugu_jiujian",
      internal: "jiuyang_shengong",
      qinggong: "shenxing_baibian"
    },
    skillLevels: {
      dugu_jiujian: 9,
      xianglong_shibazhang: 8,
      jiuyang_shengong: 8,
      shenxing_baibian: 8
    }
  },
  xiaolongnv: {
    realm: "古墓传人",
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      kongming_quan: 8,
      taiji_jian: 8,
      beiming_shengong: 8,
      lingbo_weibu: 9
    }
  },
  huang_yaoshi: {
    realm: "桃花岛主",
    slots: {
      fist: "kongming_quan",
      weapon: "taiji_jian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      kongming_quan: 8,
      taiji_jian: 8,
      beiming_shengong: 8,
      lingbo_weibu: 8
    }
  },
  zhou_botong: {
    realm: "老顽童",
    slots: {
      fist: "kongming_quan",
      weapon: "qimen_duanjian",
      internal: "hunyuan_gong",
      qinggong: "shenxing_baibian"
    },
    skillLevels: {
      kongming_quan: 8,
      shenxing_baibian: 8,
      hunyuan_gong: 7
    }
  },
  ren_woxing: {
    realm: "日月教主",
    slots: {
      fist: "xiyang_zhang",
      weapon: "bixie_jianfa",
      internal: "xixing_dafa",
      qinggong: "shenxing_baibian"
    },
    skillLevels: {
      xiyang_zhang: 8,
      bixie_jianfa: 8,
      xixing_dafa: 9,
      shenxing_baibian: 7
    }
  },
  dongfang_bubai: {
    realm: "黑木崖主",
    slots: {
      fist: "xiyang_zhang",
      weapon: "bixie_jianfa",
      internal: "xixing_dafa",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      xiyang_zhang: 8,
      bixie_jianfa: 10,
      xixing_dafa: 8,
      lingbo_weibu: 9
    }
  },
  zhang_wuji: {
    realm: "明教教主",
    slots: {
      fist: "taiji_quan",
      weapon: "taiji_jian",
      internal: "qiankun_danuoyi",
      qinggong: "shenxing_baibian"
    },
    skillLevels: {
      taiji_quan: 8,
      taiji_jian: 7,
      qiankun_danuoyi: 9,
      shenxing_baibian: 7,
      jiuyang_shengong: 9
    },
    extraSkills: ["jiuyang_shengong"]
  },
  duan_yu: {
    realm: "大理世子",
    slots: {
      fist: "kongming_quan",
      weapon: "qimen_duanjian",
      internal: "beiming_shengong",
      qinggong: "lingbo_weibu"
    },
    skillLevels: {
      kongming_quan: 6,
      beiming_shengong: 9,
      lingbo_weibu: 9,
      shenxing_baibian: 7
    },
    extraSkills: ["shenxing_baibian"]
  }
});

const loadoutCache = new Map();

export function buildCharacterMartialLoadout({ factionId, tags = [], override = null }) {
  const loadout = createEmptyLoadout();

  mergeLoadout(loadout, DEFAULT_TEMPLATE);

  if (factionId && factionMartialTemplates[factionId]) {
    mergeLoadout(loadout, factionMartialTemplates[factionId]);
  }

  for (const tag of tags) {
    if (tagMartialTemplates[tag]) {
      mergeLoadout(loadout, tagMartialTemplates[tag]);
    }
  }

  if (override && typeof override === "object") {
    mergeLoadout(loadout, override);
  }

  normalizeLoadout(loadout);
  applyDerivedSkillLevels(loadout);
  return freezeLoadout(loadout);
}

export function getNpcMartialLoadout(npcId) {
  if (!npcId) {
    return null;
  }

  if (loadoutCache.has(npcId)) {
    return loadoutCache.get(npcId);
  }

  const npc = getNpcById(npcId);
  if (!npc) {
    return null;
  }

  const loadout = buildCharacterMartialLoadout({
    factionId: npc.factionId,
    tags: npc.tags || [],
    override: npcMartialLoadoutOverrides[npcId]
  });

  loadoutCache.set(npcId, loadout);
  return loadout;
}

export function listNpcSignatureSkills(npcId) {
  const loadout = getNpcMartialLoadout(npcId);
  if (!loadout) {
    return [];
  }
  return Array.from(
    new Set(
      martialSlotOrder
        .map((slot) => loadout.slots[slot])
        .filter((skillId) => typeof skillId === "string" && skillId.length > 0)
    )
  );
}

export function listNpcMartialLoadouts() {
  const result = {};
  for (const npc of npcs) {
    const loadout = getNpcMartialLoadout(npc.id);
    if (loadout) {
      result[npc.id] = loadout;
    }
  }
  return result;
}

function createEmptyLoadout() {
  return {
    realm: "江湖后学",
    baseSkillLevel: 1,
    bonusLevel: 0,
    slots: {
      fist: null,
      weapon: null,
      internal: null,
      qinggong: null
    },
    skillLevels: {},
    extraSkills: []
  };
}

function mergeLoadout(target, source) {
  if (!source || typeof source !== "object") {
    return;
  }

  if (typeof source.realm === "string" && source.realm.length > 0) {
    target.realm = source.realm;
  }

  if (Number.isFinite(source.baseSkillLevel)) {
    target.baseSkillLevel = Math.max(target.baseSkillLevel, Math.round(source.baseSkillLevel));
  }

  if (Number.isFinite(source.bonusLevel)) {
    target.bonusLevel += Math.round(source.bonusLevel);
  }

  if (source.slots && typeof source.slots === "object") {
    for (const slot of martialSlotOrder) {
      if (typeof source.slots[slot] === "string" && source.slots[slot].length > 0) {
        target.slots[slot] = source.slots[slot];
      }
    }
  }

  if (source.skillLevels && typeof source.skillLevels === "object") {
    for (const [skillId, level] of Object.entries(source.skillLevels)) {
      if (!Number.isFinite(level)) {
        continue;
      }
      target.skillLevels[skillId] = Math.max(1, Math.round(level));
    }
  }

  if (Array.isArray(source.extraSkills)) {
    for (const skillId of source.extraSkills) {
      if (typeof skillId === "string" && skillId.length > 0) {
        target.extraSkills.push(skillId);
      }
    }
  }
}

function normalizeLoadout(loadout) {
  for (const slot of martialSlotOrder) {
    const skillId = loadout.slots[slot];
    const skill = skillId ? getMartialById(skillId) : null;
    if (!skill || skill.slot !== slot) {
      loadout.slots[slot] = DEFAULT_TEMPLATE.slots[slot] || null;
    }
  }

  loadout.extraSkills = Array.from(new Set(loadout.extraSkills));
}

function applyDerivedSkillLevels(loadout) {
  const baseline = Math.max(1, loadout.baseSkillLevel + loadout.bonusLevel);

  for (const slot of martialSlotOrder) {
    const skillId = loadout.slots[slot];
    if (!skillId) {
      continue;
    }
    const current = Number.isFinite(loadout.skillLevels[skillId]) ? loadout.skillLevels[skillId] : 0;
    loadout.skillLevels[skillId] = Math.max(current, baseline);
  }

  for (const skillId of loadout.extraSkills) {
    if (!getMartialById(skillId)) {
      continue;
    }
    const current = Number.isFinite(loadout.skillLevels[skillId]) ? loadout.skillLevels[skillId] : 0;
    loadout.skillLevels[skillId] = Math.max(current, Math.max(1, baseline - 1));
  }
}

function freezeLoadout(loadout) {
  return Object.freeze({
    realm: loadout.realm,
    slots: Object.freeze({ ...loadout.slots }),
    skillLevels: Object.freeze({ ...loadout.skillLevels }),
    extraSkills: Object.freeze([...loadout.extraSkills])
  });
}
