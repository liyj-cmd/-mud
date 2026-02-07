export const items = {
  coarse_herb: {
    id: "coarse_herb",
    name: "粗制草药",
    type: "material",
    value: 6,
    description: "常见跌打草药，可作基础疗伤材料。"
  },
  secret_note: {
    id: "secret_note",
    name: "密信残页",
    type: "quest",
    value: 12,
    description: "字迹潦草，似乎记有暗号与接头地点。"
  },
  silver_ticket: {
    id: "silver_ticket",
    name: "银票",
    type: "currency",
    value: 30,
    description: "江南钱庄通兑银票。"
  },
  jade_token: {
    id: "jade_token",
    name: "门派玉符",
    type: "token",
    value: 28,
    description: "门派内部信物，象征一定信任。"
  },
  weapon_oil: {
    id: "weapon_oil",
    name: "养刃油",
    type: "utility",
    value: 10,
    description: "保养兵刃所用，防锈去腥。"
  },
  antidote_powder: {
    id: "antidote_powder",
    name: "解毒散",
    type: "medicine",
    value: 14,
    description: "可缓解常见毒砂与蛇毒侵体。"
  },
  fine_cloth: {
    id: "fine_cloth",
    name: "锦缎",
    type: "trade",
    value: 18,
    description: "苏杭名织，常用作馈赠与交易。"
  },
  iron_dart: {
    id: "iron_dart",
    name: "铁蒺藜",
    type: "weapon",
    value: 16,
    description: "小巧暗器，适合近身脱困。"
  },
  mountain_map: {
    id: "mountain_map",
    name: "山道手绘图",
    type: "quest",
    value: 20,
    description: "标注了几条避开巡岗的隐蔽山路。"
  },
  spirit_pill: {
    id: "spirit_pill",
    name: "养气丸",
    type: "medicine",
    value: 26,
    description: "能短时温养真气的丸药。"
  }
};

const itemById = new Map(Object.values(items).map((item) => [item.id, item]));

export function getItemById(itemId) {
  return itemById.get(itemId) || null;
}
