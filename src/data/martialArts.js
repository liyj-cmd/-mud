export const slotLabels = {
  fist: "拳脚",
  weapon: "兵器",
  internal: "内功",
  qinggong: "轻功"
};

export const martialArts = [
  {
    id: "luohan_quan",
    name: "罗汉拳",
    slot: "fist",
    quality: "凡",
    description: "架势方正，重在稳打稳扎。",
    baseBonuses: { attack: 6, hit: 4, dodge: 0, block: 2, hp: 0, qi: 0 },
    growth: { attack: 1.2, hit: 0.8, dodge: 0.1, block: 0.3, hp: 0, qi: 0 },
    moves: ["黑虎掏心", "罗汉撞钟", "金刚伏魔"]
  },
  {
    id: "taizu_changquan",
    name: "太祖长拳",
    slot: "fist",
    quality: "良",
    description: "拳势开阖，擅长追击破绽。",
    baseBonuses: { attack: 8, hit: 5, dodge: 1, block: 1, hp: 0, qi: 0 },
    growth: { attack: 1.5, hit: 1, dodge: 0.2, block: 0.2, hp: 0, qi: 0 },
    moves: ["连环三进", "太祖擒龙", "崩山断石"]
  },
  {
    id: "huashan_jian",
    name: "华山剑法",
    slot: "weapon",
    quality: "良",
    description: "以快破稳，剑路轻灵。",
    baseBonuses: { attack: 10, hit: 8, dodge: 1, block: 0, hp: 0, qi: 0 },
    growth: { attack: 1.4, hit: 1.1, dodge: 0.2, block: 0, hp: 0, qi: 0 },
    moves: ["白虹贯日", "金雁横空", "清风十三式"]
  },
  {
    id: "kuangfeng_dao",
    name: "狂风刀法",
    slot: "weapon",
    quality: "奇",
    description: "重斩连压，易破对手招架。",
    baseBonuses: { attack: 13, hit: 4, dodge: 0, block: 0, hp: 0, qi: 0 },
    growth: { attack: 1.8, hit: 0.7, dodge: 0.1, block: 0, hp: 0, qi: 0 },
    moves: ["回风斩", "断岳开碑", "斜月沉沙"]
  },
  {
    id: "zixia_gong",
    name: "紫霞功",
    slot: "internal",
    quality: "奇",
    description: "真气绵长，守中带发。",
    baseBonuses: { attack: 4, hit: 0, dodge: 0, block: 6, hp: 16, qi: 22 },
    growth: { attack: 0.6, hit: 0.2, dodge: 0.1, block: 1.3, hp: 2, qi: 3 },
    moves: ["紫气东来", "混元护体", "霞光返照"]
  },
  {
    id: "hunyuan_gong",
    name: "混元功",
    slot: "internal",
    quality: "良",
    description: "内息沉稳，能缓解受创。",
    baseBonuses: { attack: 2, hit: 0, dodge: 1, block: 5, hp: 20, qi: 14 },
    growth: { attack: 0.5, hit: 0.2, dodge: 0.4, block: 1.1, hp: 2.5, qi: 2 },
    moves: ["归元守一", "缠丝化劲", "沉壁回春"]
  },
  {
    id: "tiyun_zong",
    name: "梯云纵",
    slot: "qinggong",
    quality: "奇",
    description: "借力腾挪，身法飘忽。",
    baseBonuses: { attack: 0, hit: 3, dodge: 10, block: 0, hp: 0, qi: 8 },
    growth: { attack: 0, hit: 0.6, dodge: 1.8, block: 0, hp: 0, qi: 1 },
    moves: ["鹞子翻身", "飞云踏月", "回风拂柳"]
  },
  {
    id: "caoshang_fei",
    name: "草上飞",
    slot: "qinggong",
    quality: "凡",
    description: "脚下轻快，适合缠斗游走。",
    baseBonuses: { attack: 0, hit: 2, dodge: 6, block: 0, hp: 0, qi: 4 },
    growth: { attack: 0, hit: 0.4, dodge: 1.2, block: 0, hp: 0, qi: 0.8 },
    moves: ["燕掠平芜", "踏雪无痕", "雁行折返"]
  },
  {
    id: "xiyang_zhang",
    name: "夕阳掌",
    slot: "fist",
    quality: "奇",
    description: "掌势由缓入急，后劲甚足。",
    baseBonuses: { attack: 12, hit: 3, dodge: 0, block: 2, hp: 0, qi: 0 },
    growth: { attack: 1.7, hit: 0.6, dodge: 0.2, block: 0.4, hp: 0, qi: 0 },
    moves: ["斜照长河", "晚照孤鸿", "残阳落木"]
  },
  {
    id: "qimen_duanjian",
    name: "奇门短剑",
    slot: "weapon",
    quality: "凡",
    description: "短促迅疾，擅近身突袭。",
    baseBonuses: { attack: 7, hit: 9, dodge: 1, block: 0, hp: 0, qi: 0 },
    growth: { attack: 1.2, hit: 1.2, dodge: 0.2, block: 0, hp: 0, qi: 0 },
    moves: ["回首望月", "一线穿喉", "碎步连刺"]
  }
];

export const starterSkillIds = {
  fist: "luohan_quan",
  weapon: "qimen_duanjian",
  internal: "hunyuan_gong",
  qinggong: "caoshang_fei"
};

export function getMartialById(id) {
  return martialArts.find((item) => item.id === id) || null;
}

export function computeSkillBonuses(skill, level) {
  if (!skill) {
    return { attack: 0, hit: 0, dodge: 0, block: 0, hp: 0, qi: 0 };
  }

  const lv = Math.max(1, level);
  return {
    attack: Math.round(skill.baseBonuses.attack + skill.growth.attack * (lv - 1)),
    hit: Math.round(skill.baseBonuses.hit + skill.growth.hit * (lv - 1)),
    dodge: Math.round(skill.baseBonuses.dodge + skill.growth.dodge * (lv - 1)),
    block: Math.round(skill.baseBonuses.block + skill.growth.block * (lv - 1)),
    hp: Math.round(skill.baseBonuses.hp + skill.growth.hp * (lv - 1)),
    qi: Math.round(skill.baseBonuses.qi + skill.growth.qi * (lv - 1))
  };
}
