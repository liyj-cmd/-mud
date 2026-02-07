export const slotLabels = {
  fist: "拳脚",
  weapon: "兵器",
  internal: "内功",
  qinggong: "轻功"
};

export const martialStatLabels = {
  attack: "攻",
  hit: "命",
  dodge: "闪",
  block: "格",
  parry: "拆",
  break: "破",
  crit: "暴",
  speed: "速",
  hp: "血",
  qi: "气"
};

const MARTIAL_STAT_KEYS = Object.freeze([
  "attack",
  "hit",
  "dodge",
  "block",
  "parry",
  "break",
  "crit",
  "speed",
  "hp",
  "qi"
]);

const ZERO_BONUSES = Object.freeze(
  MARTIAL_STAT_KEYS.reduce((result, key) => {
    result[key] = 0;
    return result;
  }, {})
);

function createBonuses(raw = {}) {
  return MARTIAL_STAT_KEYS.reduce((result, key) => {
    result[key] = Number.isFinite(raw[key]) ? raw[key] : 0;
    return result;
  }, {});
}

function move(name, style, overrides = {}) {
  return {
    name,
    style,
    damageRate: Number.isFinite(overrides.damageRate) ? overrides.damageRate : 1,
    hitBonus: Number.isFinite(overrides.hitBonus) ? overrides.hitBonus : 0,
    dodgeBonus: Number.isFinite(overrides.dodgeBonus) ? overrides.dodgeBonus : 0,
    blockBonus: Number.isFinite(overrides.blockBonus) ? overrides.blockBonus : 0,
    parryBonus: Number.isFinite(overrides.parryBonus) ? overrides.parryBonus : 0,
    breakBonus: Number.isFinite(overrides.breakBonus) ? overrides.breakBonus : 0,
    critBonus: Number.isFinite(overrides.critBonus) ? overrides.critBonus : 0,
    speedBonus: Number.isFinite(overrides.speedBonus) ? overrides.speedBonus : 0,
    qiCost: Number.isFinite(overrides.qiCost) ? overrides.qiCost : 0,
    tags: Array.isArray(overrides.tags) ? overrides.tags : []
  };
}

export const martialArts = [
  {
    id: "luohan_quan",
    name: "罗汉拳",
    slot: "fist",
    quality: "凡",
    style: "shaolin",
    description: "架势方正，先守后发，适合作为拳脚根基。",
    baseBonuses: createBonuses({ attack: 7, hit: 4, block: 2, parry: 2 }),
    growth: createBonuses({ attack: 1.2, hit: 0.8, block: 0.4, parry: 0.4 }),
    moves: [
      move("黑虎掏心", "fist", { damageRate: 1.08 }),
      move("罗汉撞钟", "fist", { breakBonus: 4, qiCost: 4 }),
      move("金刚伏魔", "fist", { blockBonus: 5, parryBonus: 4, qiCost: 5, tags: ["defense"] })
    ]
  },
  {
    id: "taizu_changquan",
    name: "太祖长拳",
    slot: "fist",
    quality: "良",
    style: "orthodox",
    description: "拳势开阖，节奏明快，擅长压迫对手出招。",
    baseBonuses: createBonuses({ attack: 10, hit: 6, dodge: 1, parry: 2, break: 3 }),
    growth: createBonuses({ attack: 1.6, hit: 1, dodge: 0.2, parry: 0.4, break: 0.6 }),
    moves: [
      move("连环三进", "fist", { speedBonus: 2 }),
      move("太祖擒龙", "fist", { breakBonus: 6, qiCost: 5, tags: ["pressure"] }),
      move("崩山断石", "fist", { damageRate: 1.16, qiCost: 6 })
    ]
  },
  {
    id: "xiyang_zhang",
    name: "夕阳掌",
    slot: "fist",
    quality: "奇",
    style: "sunset",
    description: "掌势先缓后急，后劲极重，破防能力出众。",
    baseBonuses: createBonuses({ attack: 13, hit: 4, block: 2, break: 5 }),
    growth: createBonuses({ attack: 1.8, hit: 0.8, block: 0.3, break: 1 }),
    moves: [
      move("斜照长河", "fist", { damageRate: 1.1, breakBonus: 4 }),
      move("晚照孤鸿", "fist", { critBonus: 4, qiCost: 7 }),
      move("残阳落木", "fist", { damageRate: 1.26, breakBonus: 7, qiCost: 10, tags: ["heavy"] })
    ]
  },
  {
    id: "taiji_quan",
    name: "太极拳",
    slot: "fist",
    quality: "绝",
    style: "wudang",
    description: "以静制动，以柔化刚，拆招与反击俱佳。",
    baseBonuses: createBonuses({ attack: 12, hit: 8, dodge: 4, block: 6, parry: 12, break: 4, crit: 2 }),
    growth: createBonuses({ attack: 1.4, hit: 1.3, dodge: 0.7, block: 1, parry: 1.8, break: 0.6, crit: 0.3 }),
    moves: [
      move("揽雀尾", "fist", { parryBonus: 10, blockBonus: 6, qiCost: 6, tags: ["counter"] }),
      move("单鞭", "fist", { breakBonus: 6, hitBonus: 5, qiCost: 7 }),
      move("野马分鬃", "fist", { damageRate: 1.15, parryBonus: 8, critBonus: 5, qiCost: 9, tags: ["counter"] })
    ]
  },
  {
    id: "xianglong_shibazhang",
    name: "降龙十八掌",
    slot: "fist",
    quality: "绝",
    style: "beggar",
    description: "刚猛无俦，讲究以势压人，破招与杀伤极高。",
    baseBonuses: createBonuses({ attack: 18, hit: 7, block: 2, break: 11, crit: 5 }),
    growth: createBonuses({ attack: 2, hit: 1, block: 0.2, break: 1.8, crit: 0.7 }),
    moves: [
      move("亢龙有悔", "fist", { damageRate: 1.3, breakBonus: 7, qiCost: 10, tags: ["heavy"] }),
      move("见龙在田", "fist", { hitBonus: 8, breakBonus: 6, qiCost: 8 }),
      move("神龙摆尾", "fist", { damageRate: 1.2, critBonus: 10, qiCost: 11, tags: ["finisher"] })
    ]
  },
  {
    id: "kongming_quan",
    name: "空明拳",
    slot: "fist",
    quality: "奇",
    style: "quanzhen",
    description: "虚中见实，出手含而不露，拆招和闪避均衡。",
    baseBonuses: createBonuses({ attack: 9, hit: 7, dodge: 4, parry: 6, break: 2 }),
    growth: createBonuses({ attack: 1.2, hit: 1, dodge: 0.8, parry: 1, break: 0.5 }),
    moves: [
      move("空谷回音", "fist", { dodgeBonus: 8, qiCost: 5 }),
      move("无相生有", "fist", { hitBonus: 6, parryBonus: 5, qiCost: 6, tags: ["counter"] }),
      move("虚实两忘", "fist", { damageRate: 1.12, breakBonus: 4, qiCost: 8 })
    ]
  },
  {
    id: "qimen_duanjian",
    name: "奇门短剑",
    slot: "weapon",
    quality: "凡",
    style: "dagger",
    description: "短促迅疾，贴身搏杀能力出色。",
    baseBonuses: createBonuses({ attack: 8, hit: 10, dodge: 1, crit: 2, speed: 1 }),
    growth: createBonuses({ attack: 1.2, hit: 1.3, dodge: 0.2, crit: 0.3, speed: 0.2 }),
    moves: [
      move("回首望月", "weapon", { speedBonus: 3 }),
      move("一线穿喉", "weapon", { hitBonus: 8, critBonus: 6, qiCost: 5, tags: ["pierce"] }),
      move("碎步连刺", "weapon", { damageRate: 1.12, speedBonus: 4, qiCost: 6 })
    ]
  },
  {
    id: "huashan_jian",
    name: "华山剑法",
    slot: "weapon",
    quality: "良",
    style: "huashan",
    description: "剑走轻灵，擅长连贯压制与准确破绽打击。",
    baseBonuses: createBonuses({ attack: 11, hit: 9, dodge: 1, parry: 2, break: 3, speed: 1 }),
    growth: createBonuses({ attack: 1.5, hit: 1.2, dodge: 0.2, parry: 0.4, break: 0.6, speed: 0.2 }),
    moves: [
      move("白虹贯日", "weapon", { hitBonus: 6 }),
      move("金雁横空", "weapon", { dodgeBonus: 5, speedBonus: 4, qiCost: 5 }),
      move("清风十三式", "weapon", { damageRate: 1.18, breakBonus: 4, qiCost: 7 })
    ]
  },
  {
    id: "kuangfeng_dao",
    name: "狂风刀法",
    slot: "weapon",
    quality: "奇",
    style: "blade",
    description: "刀势连绵，重在破势压招，容错高但耗气偏大。",
    baseBonuses: createBonuses({ attack: 15, hit: 5, block: 1, break: 7, crit: 2 }),
    growth: createBonuses({ attack: 1.9, hit: 0.8, block: 0.3, break: 1.2, crit: 0.4 }),
    moves: [
      move("回风斩", "weapon", { damageRate: 1.14, breakBonus: 5, qiCost: 6 }),
      move("断岳开碑", "weapon", { damageRate: 1.22, breakBonus: 8, qiCost: 8, tags: ["heavy"] }),
      move("斜月沉沙", "weapon", { critBonus: 7, qiCost: 9, tags: ["finisher"] })
    ]
  },
  {
    id: "taiji_jian",
    name: "太极剑",
    slot: "weapon",
    quality: "绝",
    style: "wudang",
    description: "剑意圆融，拆招与招架能力冠绝同侪。",
    baseBonuses: createBonuses({ attack: 13, hit: 10, dodge: 4, block: 5, parry: 11, break: 4, crit: 2, speed: 1 }),
    growth: createBonuses({ attack: 1.5, hit: 1.4, dodge: 0.6, block: 0.8, parry: 1.8, break: 0.6, crit: 0.3, speed: 0.3 }),
    moves: [
      move("三环套月", "weapon", { parryBonus: 8, blockBonus: 6, qiCost: 6, tags: ["counter"] }),
      move("燕回朝阳", "weapon", { hitBonus: 7, dodgeBonus: 6, qiCost: 7 }),
      move("太极如意", "weapon", { damageRate: 1.16, parryBonus: 10, critBonus: 4, qiCost: 9, tags: ["counter"] })
    ]
  },
  {
    id: "dugu_jiujian",
    name: "独孤九剑",
    slot: "weapon",
    quality: "神",
    style: "dugu",
    description: "无招胜有招，专破天下诸般招式，拆招破招皆极强。",
    baseBonuses: createBonuses({ attack: 16, hit: 13, dodge: 5, parry: 12, break: 15, crit: 8, speed: 3 }),
    growth: createBonuses({ attack: 1.9, hit: 1.8, dodge: 0.8, parry: 2, break: 2.2, crit: 1, speed: 0.5 }),
    moves: [
      move("总诀式", "weapon", { hitBonus: 10, breakBonus: 12, qiCost: 8 }),
      move("破剑式", "weapon", { breakBonus: 14, critBonus: 5, qiCost: 10, tags: ["pierce"] }),
      move("破气式", "weapon", { damageRate: 1.3, breakBonus: 12, critBonus: 12, qiCost: 13, tags: ["finisher"] })
    ]
  },
  {
    id: "bixie_jianfa",
    name: "辟邪剑法",
    slot: "weapon",
    quality: "绝",
    style: "evil",
    description: "以极快身法抢先，杀伤凶狠但防御较薄。",
    baseBonuses: createBonuses({ attack: 14, hit: 12, dodge: 6, break: 6, crit: 9, speed: 4 }),
    growth: createBonuses({ attack: 1.7, hit: 1.6, dodge: 0.9, break: 0.9, crit: 1.2, speed: 0.7 }),
    moves: [
      move("绣针渡血", "weapon", { hitBonus: 9, speedBonus: 6, qiCost: 7 }),
      move("鬼魅追魂", "weapon", { damageRate: 1.18, critBonus: 12, qiCost: 10 }),
      move("辟邪回风", "weapon", { damageRate: 1.22, dodgeBonus: 8, critBonus: 9, qiCost: 11, tags: ["finisher"] })
    ]
  },
  {
    id: "hunyuan_gong",
    name: "混元功",
    slot: "internal",
    quality: "良",
    style: "orthodox",
    description: "内息沉稳，护体兼顾回复，适合持久战。",
    baseBonuses: createBonuses({ attack: 2, dodge: 1, block: 6, parry: 3, hp: 22, qi: 18 }),
    growth: createBonuses({ attack: 0.5, dodge: 0.3, block: 1.2, parry: 0.6, hp: 2.6, qi: 2.5 }),
    moves: [
      move("归元守一", "internal", { blockBonus: 8, qiCost: 0, tags: ["defense"] }),
      move("缠丝化劲", "internal", { parryBonus: 7, qiCost: 0, tags: ["counter"] }),
      move("沉壁回春", "internal", { damageRate: 0.9, blockBonus: 10, qiCost: -4, tags: ["recover"] })
    ]
  },
  {
    id: "zixia_gong",
    name: "紫霞功",
    slot: "internal",
    quality: "奇",
    style: "huashan",
    description: "真气绵密，内守外发，攻守转换极快。",
    baseBonuses: createBonuses({ attack: 5, hit: 2, block: 7, parry: 5, break: 2, hp: 18, qi: 26 }),
    growth: createBonuses({ attack: 0.8, hit: 0.4, block: 1.4, parry: 0.9, break: 0.4, hp: 2.2, qi: 3.4 }),
    moves: [
      move("紫气东来", "internal", { hitBonus: 5, qiCost: 0 }),
      move("混元护体", "internal", { blockBonus: 12, parryBonus: 6, qiCost: 0, tags: ["defense"] }),
      move("霞光返照", "internal", { damageRate: 1.08, breakBonus: 5, qiCost: 4 })
    ]
  },
  {
    id: "taiji_shengong",
    name: "太极神功",
    slot: "internal",
    quality: "绝",
    style: "wudang",
    description: "阴阳并济，柔中带刚，擅长化劲与借力反制。",
    baseBonuses: createBonuses({ attack: 6, hit: 3, dodge: 3, block: 9, parry: 10, break: 4, hp: 28, qi: 34 }),
    growth: createBonuses({ attack: 0.9, hit: 0.5, dodge: 0.5, block: 1.4, parry: 1.7, break: 0.7, hp: 2.8, qi: 3.6 }),
    moves: [
      move("太虚混元", "internal", { blockBonus: 12, parryBonus: 8, qiCost: 0, tags: ["defense"] }),
      move("阴阳流转", "internal", { parryBonus: 12, breakBonus: 6, qiCost: 3, tags: ["counter"] }),
      move("以柔克刚", "internal", { damageRate: 1.14, parryBonus: 10, critBonus: 4, qiCost: 5, tags: ["counter"] })
    ]
  },
  {
    id: "jiuyang_shengong",
    name: "九阳神功",
    slot: "internal",
    quality: "神",
    style: "shaolin",
    description: "阳刚内力浩瀚无匹，气血与破招能力全面提升。",
    baseBonuses: createBonuses({ attack: 9, hit: 4, block: 8, parry: 7, break: 8, hp: 40, qi: 40 }),
    growth: createBonuses({ attack: 1.1, hit: 0.6, block: 1.4, parry: 1.2, break: 1.2, hp: 3.6, qi: 4 }),
    moves: [
      move("九阳鼓荡", "internal", { breakBonus: 8, qiCost: 0 }),
      move("纯阳护体", "internal", { blockBonus: 14, parryBonus: 8, qiCost: 0, tags: ["defense"] }),
      move("阳极生罡", "internal", { damageRate: 1.2, breakBonus: 10, qiCost: 6 })
    ]
  },
  {
    id: "yijin_jing",
    name: "易筋经",
    slot: "internal",
    quality: "绝",
    style: "shaolin",
    description: "洗髓伐脉，真气贯通，防守稳定且恢复力强。",
    baseBonuses: createBonuses({ attack: 4, hit: 2, dodge: 2, block: 10, parry: 8, hp: 34, qi: 32 }),
    growth: createBonuses({ attack: 0.7, hit: 0.3, dodge: 0.5, block: 1.6, parry: 1.2, hp: 3.2, qi: 3.4 }),
    moves: [
      move("易筋洗髓", "internal", { blockBonus: 14, qiCost: 0, tags: ["defense"] }),
      move("经脉逆行", "internal", { parryBonus: 10, qiCost: 0, tags: ["counter"] }),
      move("金身不坏", "internal", { blockBonus: 16, parryBonus: 10, qiCost: 3, tags: ["defense"] })
    ]
  },
  {
    id: "beiming_shengong",
    name: "北冥神功",
    slot: "internal",
    quality: "绝",
    style: "xiaoyao",
    description: "以内纳外，绵柔化劲，擅长消耗战与反制。",
    baseBonuses: createBonuses({ attack: 6, hit: 3, dodge: 3, parry: 7, break: 5, hp: 20, qi: 36 }),
    growth: createBonuses({ attack: 0.9, hit: 0.5, dodge: 0.6, parry: 1.3, break: 0.9, hp: 2.2, qi: 3.6 }),
    moves: [
      move("北冥回潮", "internal", { parryBonus: 11, qiCost: -5, tags: ["recover"] }),
      move("海纳百川", "internal", { blockBonus: 8, breakBonus: 6, qiCost: -3 }),
      move("归墟吞浪", "internal", { damageRate: 1.12, critBonus: 6, qiCost: 5, tags: ["counter"] })
    ]
  },
  {
    id: "qiankun_danuoyi",
    name: "乾坤大挪移",
    slot: "internal",
    quality: "神",
    style: "mingjiao",
    description: "借力挪劲，拆招与破招并重，极擅反制群攻。",
    baseBonuses: createBonuses({ attack: 8, hit: 5, dodge: 4, block: 7, parry: 12, break: 10, qi: 30 }),
    growth: createBonuses({ attack: 1, hit: 0.7, dodge: 0.7, block: 1.1, parry: 1.9, break: 1.7, qi: 3.2 }),
    moves: [
      move("移花接木", "internal", { parryBonus: 12, qiCost: 4, tags: ["counter"] }),
      move("乾坤借势", "internal", { breakBonus: 9, qiCost: 5 }),
      move("大挪移", "internal", { damageRate: 1.2, parryBonus: 10, breakBonus: 10, qiCost: 8, tags: ["counter"] })
    ]
  },
  {
    id: "xixing_dafa",
    name: "吸星大法",
    slot: "internal",
    quality: "绝",
    style: "riyue",
    description: "霸道吞吸，攻势强横，偏向高风险快攻。",
    baseBonuses: createBonuses({ attack: 10, hit: 4, break: 9, crit: 4, hp: 16, qi: 28 }),
    growth: createBonuses({ attack: 1.3, hit: 0.5, break: 1.5, crit: 0.8, hp: 1.8, qi: 3.2 }),
    moves: [
      move("夺元", "internal", { breakBonus: 8, qiCost: 2 }),
      move("噬气", "internal", { damageRate: 1.16, critBonus: 7, qiCost: 6 }),
      move("吸星震脉", "internal", { damageRate: 1.22, breakBonus: 10, critBonus: 8, qiCost: 9, tags: ["heavy"] })
    ]
  },
  {
    id: "caoshang_fei",
    name: "草上飞",
    slot: "qinggong",
    quality: "凡",
    style: "light",
    description: "轻灵实用，初入江湖者常用的基础身法。",
    baseBonuses: createBonuses({ hit: 2, dodge: 8, parry: 1, speed: 2, qi: 5 }),
    growth: createBonuses({ hit: 0.4, dodge: 1.2, parry: 0.3, speed: 0.4, qi: 0.8 }),
    moves: [
      move("燕掠平芜", "qinggong", { dodgeBonus: 9 }),
      move("踏雪无痕", "qinggong", { speedBonus: 8, qiCost: 3 }),
      move("雁行折返", "qinggong", { dodgeBonus: 7, parryBonus: 4, qiCost: 4 })
    ]
  },
  {
    id: "tiyun_zong",
    name: "梯云纵",
    slot: "qinggong",
    quality: "奇",
    style: "wudang",
    description: "借力腾挪，轻身过招时能顺势化解来招。",
    baseBonuses: createBonuses({ hit: 4, dodge: 12, parry: 4, speed: 4, qi: 10 }),
    growth: createBonuses({ hit: 0.6, dodge: 1.9, parry: 0.7, speed: 0.7, qi: 1.2 }),
    moves: [
      move("鹞子翻身", "qinggong", { dodgeBonus: 12, qiCost: 4 }),
      move("飞云踏月", "qinggong", { speedBonus: 10, qiCost: 4 }),
      move("回风拂柳", "qinggong", { dodgeBonus: 8, parryBonus: 5, qiCost: 5, tags: ["counter"] })
    ]
  },
  {
    id: "lingbo_weibu",
    name: "凌波微步",
    slot: "qinggong",
    quality: "神",
    style: "xiaoyao",
    description: "步法飘逸莫测，几乎不与敌锋正面对抗。",
    baseBonuses: createBonuses({ hit: 6, dodge: 18, parry: 6, crit: 3, speed: 8, qi: 16 }),
    growth: createBonuses({ hit: 0.8, dodge: 2.1, parry: 1, crit: 0.4, speed: 1, qi: 1.8 }),
    moves: [
      move("罗袜生尘", "qinggong", { dodgeBonus: 15, speedBonus: 8, qiCost: 5 }),
      move("洛神回步", "qinggong", { dodgeBonus: 12, parryBonus: 7, qiCost: 5, tags: ["counter"] }),
      move("凌波渡影", "qinggong", { hitBonus: 8, critBonus: 7, speedBonus: 10, qiCost: 7 })
    ]
  },
  {
    id: "shenxing_baibian",
    name: "神行百变",
    slot: "qinggong",
    quality: "奇",
    style: "jianghu",
    description: "行踪飘忽，擅长拉扯与抢节奏。",
    baseBonuses: createBonuses({ hit: 4, dodge: 11, parry: 3, break: 2, speed: 6, qi: 8 }),
    growth: createBonuses({ hit: 0.6, dodge: 1.5, parry: 0.5, break: 0.4, speed: 0.9, qi: 1 }),
    moves: [
      move("回身挪影", "qinggong", { dodgeBonus: 9, speedBonus: 6, qiCost: 3 }),
      move("折燕追风", "qinggong", { hitBonus: 7, speedBonus: 5, qiCost: 4 }),
      move("百变惊鸿", "qinggong", { dodgeBonus: 10, critBonus: 4, qiCost: 6 })
    ]
  }
];

export const starterSkillIds = {
  fist: "luohan_quan",
  weapon: "qimen_duanjian",
  internal: "hunyuan_gong",
  qinggong: "caoshang_fei"
};

const martialById = new Map(martialArts.map((item) => [item.id, item]));

export function getMartialById(id) {
  return martialById.get(id) || null;
}

export function computeSkillBonuses(skill, level) {
  if (!skill) {
    return { ...ZERO_BONUSES };
  }

  const lv = Math.max(1, Number.isFinite(level) ? level : 1);
  const base = createBonuses(skill.baseBonuses);
  const growth = createBonuses(skill.growth);

  return MARTIAL_STAT_KEYS.reduce((result, key) => {
    result[key] = Math.round(base[key] + growth[key] * (lv - 1));
    return result;
  }, {});
}
