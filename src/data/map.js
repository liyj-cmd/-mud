const directionLabels = {
  N: "北",
  S: "南",
  E: "东",
  W: "西",
  NE: "东北",
  NW: "西北",
  SE: "东南",
  SW: "西南"
};

const backdropUrl = (file) => new URL(`../assets/map-backgrounds/${file}`, import.meta.url).href;

const cityBackdrop = {
  image: backdropUrl("changan-city.svg"),
  overlay: "linear-gradient(180deg, rgba(11, 19, 30, 0.08), rgba(6, 10, 15, 0.3))",
  position: "center",
  size: "cover"
};

const mountainBackdrop = {
  image: backdropUrl("huashan-cliff.svg"),
  overlay: "linear-gradient(180deg, rgba(9, 16, 24, 0.08), rgba(6, 9, 14, 0.32))",
  position: "center",
  size: "cover"
};

const passBackdrop = {
  image: backdropUrl("zhongnan-pass.svg"),
  overlay: "linear-gradient(180deg, rgba(18, 20, 12, 0.06), rgba(8, 11, 9, 0.26))",
  position: "center",
  size: "cover"
};

const cavernBackdrop = {
  image: backdropUrl("gumu-cavern.svg"),
  overlay: "linear-gradient(180deg, rgba(13, 14, 18, 0.1), rgba(7, 8, 11, 0.36))",
  position: "center",
  size: "cover"
};

const forestBackdrop = {
  image: backdropUrl("heimu-forest.svg"),
  overlay: "linear-gradient(180deg, rgba(8, 17, 13, 0.1), rgba(4, 8, 6, 0.36))",
  position: "center",
  size: "cover"
};

const templeBackdrop = {
  image: backdropUrl("shaolin-temple.svg"),
  overlay: "linear-gradient(180deg, rgba(18, 20, 24, 0.1), rgba(8, 10, 14, 0.34))",
  position: "center",
  size: "cover"
};

const cloudBackdrop = {
  image: backdropUrl("wudang-cloud.svg"),
  overlay: "linear-gradient(180deg, rgba(12, 20, 24, 0.08), rgba(7, 11, 14, 0.32))",
  position: "center",
  size: "cover"
};

const summitBackdrop = {
  image: backdropUrl("taishan-sunrise.svg"),
  overlay: "linear-gradient(180deg, rgba(20, 17, 12, 0.08), rgba(8, 10, 13, 0.3))",
  position: "center",
  size: "cover"
};

const waterBackdrop = {
  image: backdropUrl("suzhou-water.svg"),
  overlay: "linear-gradient(180deg, rgba(8, 16, 25, 0.08), rgba(5, 10, 17, 0.3))",
  position: "center",
  size: "cover"
};

const emeiBackdrop = {
  image: backdropUrl("emei-golden-summit.svg"),
  overlay: "linear-gradient(180deg, rgba(16, 14, 22, 0.08), rgba(7, 8, 13, 0.3))",
  position: "center",
  size: "cover"
};

const daliBackdrop = {
  image: backdropUrl("dali-palace.svg"),
  overlay: "linear-gradient(180deg, rgba(16, 20, 24, 0.08), rgba(9, 12, 16, 0.3))",
  position: "center",
  size: "cover"
};

const islandBackdrop = {
  image: backdropUrl("taohua-island.svg"),
  overlay: "linear-gradient(180deg, rgba(8, 14, 18, 0.08), rgba(6, 11, 13, 0.3))",
  position: "center",
  size: "cover"
};

const cliffBackdrop = {
  image: backdropUrl("heimu-cliff.svg"),
  overlay: "linear-gradient(180deg, rgba(16, 10, 12, 0.08), rgba(10, 7, 9, 0.34))",
  position: "center",
  size: "cover"
};

const plateauBackdrop = {
  image: backdropUrl("kunlun-plateau.svg"),
  overlay: "linear-gradient(180deg, rgba(16, 19, 26, 0.08), rgba(8, 11, 16, 0.34))",
  position: "center",
  size: "cover"
};

export const mapRegions = [
  {
    id: "changan",
    name: "长安城域",
    x: 18,
    y: 56,
    description: "帝都根脚，百业交会，江湖消息最杂。",
    mapBackdrop: cityBackdrop
  },
  {
    id: "luoyang",
    name: "洛阳旧都",
    x: 32,
    y: 46,
    description: "旧都文脉未衰，门阀、商路与江湖并存。",
    mapBackdrop: cityBackdrop
  },
  {
    id: "kaifeng",
    name: "汴梁府地",
    x: 48,
    y: 46,
    description: "漕运枢纽，官府势力与市井暗线盘根错节。",
    mapBackdrop: cityBackdrop
  },
  {
    id: "huashan",
    name: "华山派",
    x: 38,
    y: 36,
    description: "剑气森然，门规严整，群侠来往频繁。",
    mapBackdrop: mountainBackdrop
  },
  {
    id: "songshan",
    name: "嵩山中岳",
    x: 42,
    y: 30,
    description: "通衢要冲，各派访客与朝廷耳目并立。",
    mapBackdrop: passBackdrop
  },
  {
    id: "shaolin",
    name: "少林寺域",
    x: 34,
    y: 26,
    description: "钟声晨暮，武学渊薮，戒律森然。",
    mapBackdrop: templeBackdrop
  },
  {
    id: "zhongnan",
    name: "终南山脉",
    x: 54,
    y: 40,
    description: "古道险峻，隐士与游侠并行。",
    mapBackdrop: passBackdrop
  },
  {
    id: "gumu",
    name: "古墓地宫",
    x: 56,
    y: 56,
    description: "幽寒石道，秘卷与机关并存。",
    mapBackdrop: cavernBackdrop
  },
  {
    id: "heimu",
    name: "黑木林区",
    x: 70,
    y: 34,
    description: "群盗据险，夜风如刀，伏击频仍。",
    mapBackdrop: forestBackdrop
  },
  {
    id: "taishan",
    name: "泰山岱宗",
    x: 58,
    y: 24,
    description: "封禅旧址，剑客云集，晨练决斗不断。",
    mapBackdrop: summitBackdrop
  },
  {
    id: "wudang",
    name: "武当山域",
    x: 50,
    y: 68,
    description: "道门玄岳，重内外兼修，以柔克刚。",
    mapBackdrop: cloudBackdrop
  },
  {
    id: "xiangyang",
    name: "襄阳军镇",
    x: 62,
    y: 66,
    description: "边城重镇，守军、义士与商旅杂居。",
    mapBackdrop: cityBackdrop
  },
  {
    id: "suzhou",
    name: "苏杭水陆",
    x: 78,
    y: 58,
    description: "水巷绵密，商会势大，情报与财路并举。",
    mapBackdrop: waterBackdrop
  },
  {
    id: "hangzhou",
    name: "临安西湖",
    x: 88,
    y: 64,
    description: "湖山相映，雅集与暗交易并存。",
    mapBackdrop: waterBackdrop
  },
  {
    id: "emei",
    name: "峨眉山境",
    x: 28,
    y: 74,
    description: "山势陡绝，清修门人护民而行。",
    mapBackdrop: emeiBackdrop
  },
  {
    id: "dali",
    name: "大理王土",
    x: 14,
    y: 84,
    description: "高原古城，王府与民间武林并存。",
    mapBackdrop: daliBackdrop
  },
  {
    id: "heimuya",
    name: "黑木崖域",
    x: 78,
    y: 24,
    description: "绝壁险崖，日月教众出没无常。",
    mapBackdrop: cliffBackdrop
  },
  {
    id: "taohua",
    name: "桃花岛",
    x: 92,
    y: 56,
    description: "海岛桃林迷阵重重，奇人隐居其间。",
    mapBackdrop: islandBackdrop
  },
  {
    id: "kunlun",
    name: "昆仑光明顶",
    x: 12,
    y: 70,
    description: "雪岭高台遥接西域，明教旧坛藏有秘录。",
    mapBackdrop: plateauBackdrop
  }
];

// Backward-compatible alias used by scene modules.
export const regions = mapRegions;

export const regionEdges = [
  ["changan", "luoyang"],
  ["changan", "huashan"],
  ["luoyang", "kaifeng"],
  ["luoyang", "songshan"],
  ["kaifeng", "taishan"],
  ["kaifeng", "heimu"],
  ["kaifeng", "suzhou"],
  ["huashan", "songshan"],
  ["huashan", "zhongnan"],
  ["huashan", "gumu"],
  ["songshan", "shaolin"],
  ["songshan", "taishan"],
  ["songshan", "zhongnan"],
  ["zhongnan", "gumu"],
  ["zhongnan", "heimu"],
  ["zhongnan", "wudang"],
  ["gumu", "wudang"],
  ["heimu", "xiangyang"],
  ["wudang", "xiangyang"],
  ["xiangyang", "suzhou"],
  ["suzhou", "hangzhou"],
  ["wudang", "emei"],
  ["emei", "dali"],
  ["heimu", "heimuya"],
  ["taishan", "heimuya"],
  ["hangzhou", "taohua"],
  ["suzhou", "taohua"],
  ["dali", "kunlun"],
  ["emei", "kunlun"]
];

export const mapNodes = [
  {
    id: "town_gate",
    name: "长安东门",
    type: "城镇",
    regionId: "changan",
    grid: { col: 0, row: 0 },
    tags: ["city", "road", "gate"],
    description: "城门旗影翻动，来往皆是江湖客。"
  },
  {
    id: "market",
    name: "长安集市",
    type: "城镇",
    regionId: "changan",
    grid: { col: 1, row: 0 },
    tags: ["city", "market", "rumor"],
    description: "叫卖与耳语并起，买卖也是情报。"
  },
  {
    id: "inn",
    name: "同福客栈",
    type: "城镇",
    regionId: "changan",
    grid: { col: 1, row: -1 },
    tags: ["city", "inn", "rumor"],
    description: "酒肆灯火不熄，最易听见秘闻。"
  },
  {
    id: "river_dock",
    name: "渭水渡口",
    type: "城镇",
    regionId: "changan",
    grid: { col: 1, row: 1 },
    tags: ["city", "dock", "travel"],
    description: "舟楫往来，南北客商在此歇脚。"
  },
  {
    id: "road_post",
    name: "华阴官道",
    type: "野外",
    regionId: "changan",
    grid: { col: 2, row: 0 },
    tags: ["road", "travel", "patrol"],
    description: "官道笔直向东，马蹄声昼夜不绝。"
  },
  {
    id: "imperial_street",
    name: "东市长街",
    type: "城镇",
    regionId: "changan",
    grid: { col: 0, row: -1 },
    tags: ["city", "market", "court"],
    description: "官商并行，行馆与钱庄鳞次栉比。"
  },
  {
    id: "west_ward",
    name: "西坊旧巷",
    type: "城镇",
    regionId: "changan",
    grid: { col: -1, row: 0 },
    tags: ["city", "rumor", "underworld"],
    description: "巷陌曲折，旧人旧事都藏在灯影之后。"
  },
  {
    id: "courier_station",
    name: "驿站马厩",
    type: "城镇",
    regionId: "changan",
    grid: { col: 2, row: 1 },
    tags: ["travel", "horse", "court"],
    description: "军马与快马都在此歇蹄，文书日夜流转。"
  },

  {
    id: "luoyang_gate",
    name: "洛阳西关",
    type: "城镇",
    regionId: "luoyang",
    grid: { col: 3, row: 0 },
    tags: ["city", "gate", "road"],
    description: "关道宽阔，商旅车马络绎不绝。"
  },
  {
    id: "luoyang_market",
    name: "洛阳花市",
    type: "城镇",
    regionId: "luoyang",
    grid: { col: 4, row: 0 },
    tags: ["city", "market", "rumor"],
    description: "花香掩不住刀气，豪客最爱在此会面。"
  },
  {
    id: "peony_manor",
    name: "牡丹别院",
    type: "城镇",
    regionId: "luoyang",
    grid: { col: 4, row: -1 },
    tags: ["city", "manor", "duel"],
    description: "庭院深深，常有名士与剑客雅集。"
  },
  {
    id: "tianjin_bridge",
    name: "天津古桥",
    type: "城镇",
    regionId: "luoyang",
    grid: { col: 4, row: 1 },
    tags: ["city", "dock", "road"],
    description: "桥上行人匆匆，桥下小舟暗度。"
  },
  {
    id: "magistrate_office",
    name: "洛阳府衙",
    type: "城镇",
    regionId: "luoyang",
    grid: { col: 5, row: 0 },
    tags: ["city", "court", "quest"],
    description: "案牍如山，缉捕榜文日更夜换。"
  },

  {
    id: "kaifeng_west_road",
    name: "汴梁西路",
    type: "城镇",
    regionId: "kaifeng",
    grid: { col: 6, row: 0 },
    tags: ["city", "road", "travel"],
    description: "车辙深深，南北货船都在此转陆。"
  },
  {
    id: "kaifeng_square",
    name: "汴梁市廛",
    type: "城镇",
    regionId: "kaifeng",
    grid: { col: 7, row: 0 },
    tags: ["city", "market", "rumor"],
    description: "茶楼戏台环列，朝野消息都能买到。"
  },
  {
    id: "kaifeng_yamen",
    name: "开封府衙",
    type: "城镇",
    regionId: "kaifeng",
    grid: { col: 7, row: -1 },
    tags: ["city", "court", "quest"],
    description: "缉捕牌照高悬，案卷牵动江湖命数。"
  },
  {
    id: "bianhe_wharf",
    name: "汴河码头",
    type: "城镇",
    regionId: "kaifeng",
    grid: { col: 7, row: 1 },
    tags: ["city", "dock", "smuggle"],
    description: "日间漕船如织，夜里暗仓更忙。"
  },
  {
    id: "royal_archive",
    name: "秘档书库",
    type: "城镇",
    regionId: "kaifeng",
    grid: { col: 8, row: 0 },
    tags: ["city", "court", "intel"],
    description: "旧案密卷封存其内，能开者寥寥。"
  },

  {
    id: "huashan_hall",
    name: "华山大殿",
    type: "门派",
    regionId: "huashan",
    grid: { col: 3, row: -2 },
    tags: ["sect", "hall", "mentor"],
    description: "掌门议事处，弟子出入皆正衣冠。",
    sceneBackdrop: mountainBackdrop
  },
  {
    id: "training_ground",
    name: "华山演武坪",
    type: "门派",
    regionId: "huashan",
    grid: { col: 3, row: -1 },
    tags: ["sect", "training", "duel"],
    description: "木桩与青砖间，拳脚声终日不绝。"
  },
  {
    id: "back_hill",
    name: "华山后崖",
    type: "门派",
    regionId: "huashan",
    grid: { col: 2, row: -3 },
    tags: ["sect", "mountain", "secluded"],
    description: "松涛掩壁，适合晨练与密谈。"
  },
  {
    id: "sword_gallery",
    name: "剑壁长廊",
    type: "门派",
    regionId: "huashan",
    grid: { col: 4, row: -2 },
    tags: ["sect", "training", "weapon"],
    description: "石壁刻满旧招式，后学常来临摹。",
    sceneBackdrop: mountainBackdrop
  },
  {
    id: "cliff_hostel",
    name: "栈道客舍",
    type: "门派",
    regionId: "huashan",
    grid: { col: 4, row: -1 },
    tags: ["inn", "mountain", "travel"],
    description: "栈道旁一处客舍，过山客都在此补给。"
  },

  {
    id: "songshan_pass",
    name: "嵩岳关",
    type: "野外",
    regionId: "songshan",
    grid: { col: 5, row: -2 },
    tags: ["mountain", "road", "patrol"],
    description: "关隘扼守南北要道，旗号林立。"
  },
  {
    id: "zhongyue_square",
    name: "中岳坪",
    type: "野外",
    regionId: "songshan",
    grid: { col: 6, row: -2 },
    tags: ["mountain", "duel", "training"],
    description: "平地开阔，江湖比武常在此立帖。"
  },
  {
    id: "zen_tea_house",
    name: "山门茶寮",
    type: "野外",
    regionId: "songshan",
    grid: { col: 6, row: -1 },
    tags: ["inn", "rumor", "mountain"],
    description: "过客歇脚听风，许多恩怨都从一杯茶起。"
  },

  {
    id: "shaolin_gate",
    name: "少林山门",
    type: "门派",
    regionId: "shaolin",
    grid: { col: 6, row: -3 },
    tags: ["sect", "gate", "mentor"],
    description: "古木掩映，晨钟刚歇，僧众整队进出。",
    sceneBackdrop: templeBackdrop
  },
  {
    id: "monk_courtyard",
    name: "罗汉院",
    type: "门派",
    regionId: "shaolin",
    grid: { col: 7, row: -3 },
    tags: ["sect", "training", "mentor"],
    description: "木人桩列阵，拳风起落不息。",
    sceneBackdrop: templeBackdrop
  },
  {
    id: "sutra_pavilion",
    name: "藏经阁",
    type: "门派",
    regionId: "shaolin",
    grid: { col: 7, row: -4 },
    tags: ["sect", "intel", "quest"],
    description: "经卷浩繁，武学典籍与戒律并存。",
    sceneBackdrop: templeBackdrop
  },
  {
    id: "wooden_lane",
    name: "木人巷",
    type: "门派",
    regionId: "shaolin",
    grid: { col: 8, row: -3 },
    tags: ["sect", "training", "trial"],
    description: "机关层层，入者需以真功闯关。"
  },

  {
    id: "mountain_path",
    name: "终南山道",
    type: "野外",
    regionId: "zhongnan",
    grid: { col: 5, row: -1 },
    tags: ["mountain", "road", "ambush"],
    description: "古道蜿蜒，往来多是刀口讨生计之人。"
  },
  {
    id: "zhongnan_temple",
    name: "终南古观",
    type: "门派",
    regionId: "zhongnan",
    grid: { col: 6, row: -2 },
    tags: ["sect", "mentor", "mountain"],
    description: "旧观残钟犹在，晨昏有道人往来。"
  },
  {
    id: "qinling_ridge",
    name: "秦岭脊道",
    type: "野外",
    regionId: "zhongnan",
    grid: { col: 6, row: -1 },
    tags: ["mountain", "road", "patrol"],
    description: "山脊风烈，远近路况一览无余。"
  },
  {
    id: "hermit_hut",
    name: "隐士草庐",
    type: "野外",
    regionId: "zhongnan",
    grid: { col: 6, row: 0 },
    tags: ["mountain", "secluded", "mentor"],
    description: "草庐孤立溪畔，偶有高人现身讲道。"
  },

  {
    id: "gumu_gate",
    name: "古墓石门",
    type: "秘境",
    regionId: "gumu",
    grid: { col: 5, row: 1 },
    tags: ["cave", "secret", "quest"],
    description: "石门半掩，冷雾沿阶而下。"
  },
  {
    id: "gumu_court",
    name: "古墓前庭",
    type: "秘境",
    regionId: "gumu",
    grid: { col: 6, row: 1 },
    tags: ["cave", "secret", "training"],
    description: "断碑与石阶错落，回音极轻。"
  },
  {
    id: "hidden_cave",
    name: "幽暗古墓",
    type: "秘境",
    regionId: "gumu",
    grid: { col: 7, row: 1 },
    tags: ["cave", "secret", "trial"],
    description: "碑纹残缺，石函暗藏旧卷。"
  },
  {
    id: "cold_pool",
    name: "寒玉水潭",
    type: "秘境",
    regionId: "gumu",
    grid: { col: 6, row: 2 },
    tags: ["cave", "healing", "secret"],
    description: "潭水刺骨却可淬体，常人难久留。"
  },

  {
    id: "blackwood_forest",
    name: "黑木林深处",
    type: "野外",
    regionId: "heimu",
    grid: { col: 8, row: -1 },
    tags: ["forest", "bandit", "ambush"],
    description: "风声似哭，夜里最易见寒光。",
    sceneBackdrop: forestBackdrop
  },
  {
    id: "blackwood_outpost",
    name: "黑木哨卡",
    type: "野外",
    regionId: "heimu",
    grid: { col: 8, row: 0 },
    tags: ["forest", "bandit", "patrol"],
    description: "木栅重重，守卡者昼夜换岗。"
  },
  {
    id: "bandit_fort",
    name: "黑风寨",
    type: "野外",
    regionId: "heimu",
    grid: { col: 9, row: -1 },
    tags: ["forest", "bandit", "quest"],
    description: "寨门铁链高悬，火把终夜不灭。",
    sceneBackdrop: cliffBackdrop
  },
  {
    id: "raven_marsh",
    name: "乌鸦沼",
    type: "野外",
    regionId: "heimu",
    grid: { col: 9, row: 0 },
    tags: ["forest", "bandit", "dock"],
    description: "泥泽难行，暗道却能通向水路。"
  },

  {
    id: "taishan_road",
    name: "岱庙古道",
    type: "野外",
    regionId: "taishan",
    grid: { col: 8, row: -2 },
    tags: ["mountain", "road", "duel"],
    description: "石阶盘山而上，晨练剑客极多。"
  },
  {
    id: "jade_peak",
    name: "玉皇顶",
    type: "野外",
    regionId: "taishan",
    grid: { col: 9, row: -3 },
    tags: ["mountain", "duel", "trial"],
    description: "云海翻涌，高手常在拂晓约斗。",
    sceneBackdrop: summitBackdrop
  },
  {
    id: "sealing_platform",
    name: "封禅台",
    type: "野外",
    regionId: "taishan",
    grid: { col: 9, row: -2 },
    tags: ["mountain", "history", "intel"],
    description: "残碑林立，旧事与新局交织。"
  },
  {
    id: "taoist_shrine",
    name: "碧霞祠",
    type: "野外",
    regionId: "taishan",
    grid: { col: 8, row: -3 },
    tags: ["mountain", "healing", "mentor"],
    description: "香火不绝，行脚道人于此暂住。"
  },

  {
    id: "wudang_gate",
    name: "武当山门",
    type: "门派",
    regionId: "wudang",
    grid: { col: 6, row: 3 },
    tags: ["sect", "gate", "mentor"],
    description: "石阶百转，门人往来井然有序。",
    sceneBackdrop: cloudBackdrop
  },
  {
    id: "zixiao_hall",
    name: "紫霄宫",
    type: "门派",
    regionId: "wudang",
    grid: { col: 7, row: 3 },
    tags: ["sect", "hall", "mentor"],
    description: "宫观肃穆，晨课钟声回荡山谷。",
    sceneBackdrop: cloudBackdrop
  },
  {
    id: "taihe_peak",
    name: "太和峰",
    type: "门派",
    regionId: "wudang",
    grid: { col: 7, row: 2 },
    tags: ["sect", "mountain", "training"],
    description: "云海翻卷，最宜参悟身法与心法。",
    sceneBackdrop: cloudBackdrop
  },
  {
    id: "cloud_stair",
    name: "云梯石阶",
    type: "门派",
    regionId: "wudang",
    grid: { col: 6, row: 2 },
    tags: ["sect", "mountain", "road"],
    description: "石阶蜿蜒上接主峰，下连山外古道。"
  },

  {
    id: "xiangyang_wall",
    name: "襄阳城楼",
    type: "城镇",
    regionId: "xiangyang",
    grid: { col: 8, row: 3 },
    tags: ["city", "guard", "quest"],
    description: "城楼甲士轮岗，烽火台日夜警戒。"
  },
  {
    id: "martial_square",
    name: "演武校场",
    type: "城镇",
    regionId: "xiangyang",
    grid: { col: 9, row: 3 },
    tags: ["city", "training", "guard"],
    description: "军中比武与民间擂台常在此并行。"
  },
  {
    id: "hanchuan_dock",
    name: "汉川渡",
    type: "城镇",
    regionId: "xiangyang",
    grid: { col: 9, row: 2 },
    tags: ["city", "dock", "travel"],
    description: "官船、商舟与私桨混行，最易遇见旧识。"
  },
  {
    id: "north_granary",
    name: "北仓营",
    type: "城镇",
    regionId: "xiangyang",
    grid: { col: 8, row: 2 },
    tags: ["city", "guard", "supply"],
    description: "军粮囤积之地，暗中也常有走私线索。"
  },

  {
    id: "suzhou_gate",
    name: "苏州外埠",
    type: "城镇",
    regionId: "suzhou",
    grid: { col: 10, row: 2 },
    tags: ["city", "gate", "travel"],
    description: "水陆汇合，货栈林立，客流不绝。"
  },
  {
    id: "suzhou_market",
    name: "苏州商街",
    type: "城镇",
    regionId: "suzhou",
    grid: { col: 11, row: 2 },
    tags: ["city", "market", "commerce"],
    description: "绸缎香料琳琅，价码背后皆是人情。"
  },
  {
    id: "suzhou_dock",
    name: "枫桥码头",
    type: "城镇",
    regionId: "suzhou",
    grid: { col: 11, row: 3 },
    tags: ["city", "dock", "smuggle"],
    description: "夜里橹声不断，货箱进出难辨真伪。",
    sceneBackdrop: waterBackdrop
  },
  {
    id: "murong_manor",
    name: "燕子坞外院",
    type: "城镇",
    regionId: "suzhou",
    grid: { col: 10, row: 1 },
    tags: ["city", "manor", "duel"],
    description: "水榭回廊深处，常有名门子弟论武。"
  },
  {
    id: "water_lane",
    name: "水巷暗渠",
    type: "城镇",
    regionId: "suzhou",
    grid: { col: 12, row: 2 },
    tags: ["city", "dock", "underworld"],
    description: "窄渠纵横，暗桨可避过官巡视线。",
    sceneBackdrop: waterBackdrop
  },

  {
    id: "hangzhou_gate",
    name: "临安北门",
    type: "城镇",
    regionId: "hangzhou",
    grid: { col: 12, row: 3 },
    tags: ["city", "gate", "travel"],
    description: "商队排队入城，茶肆叫卖此起彼伏。"
  },
  {
    id: "west_lake",
    name: "西湖苏堤",
    type: "城镇",
    regionId: "hangzhou",
    grid: { col: 13, row: 3 },
    tags: ["city", "rumor", "duel"],
    description: "游人如织，文士与侠客同席而谈。",
    sceneBackdrop: waterBackdrop
  },
  {
    id: "leifeng_tower",
    name: "雷峰塔下",
    type: "城镇",
    regionId: "hangzhou",
    grid: { col: 13, row: 2 },
    tags: ["city", "history", "quest"],
    description: "古塔斜影下，旧传说总能引来新麻烦。"
  },
  {
    id: "qiantang_port",
    name: "钱塘港",
    type: "城镇",
    regionId: "hangzhou",
    grid: { col: 12, row: 4 },
    tags: ["city", "dock", "commerce"],
    description: "海潮昼夜翻涌，远洋货船在此靠岸。"
  },

  {
    id: "emei_path",
    name: "峨眉山径",
    type: "门派",
    regionId: "emei",
    grid: { col: 4, row: 4 },
    tags: ["mountain", "road", "sect"],
    description: "山径盘旋，云雾中隐有梵音。"
  },
  {
    id: "golden_summit",
    name: "金顶",
    type: "门派",
    regionId: "emei",
    grid: { col: 5, row: 4 },
    tags: ["mountain", "sect", "training"],
    description: "日照金顶，常有高手静观云海悟招。",
    sceneBackdrop: emeiBackdrop
  },
  {
    id: "nunnery_hall",
    name: "清音阁",
    type: "门派",
    regionId: "emei",
    grid: { col: 5, row: 5 },
    tags: ["sect", "mentor", "healing"],
    description: "香烟缭绕，门人多以济世为念。",
    sceneBackdrop: emeiBackdrop
  },
  {
    id: "monkey_valley",
    name: "猿啸谷",
    type: "门派",
    regionId: "emei",
    grid: { col: 4, row: 5 },
    tags: ["mountain", "forest", "ambush"],
    description: "峡谷回响不绝，暗道通往多处山路。"
  },

  {
    id: "dali_gate",
    name: "大理南门",
    type: "城镇",
    regionId: "dali",
    grid: { col: 2, row: 5 },
    tags: ["city", "gate", "travel"],
    description: "白石城门映着苍山雪线，商旅安稳。"
  },
  {
    id: "dali_palace",
    name: "段氏王府",
    type: "城镇",
    regionId: "dali",
    grid: { col: 3, row: 5 },
    tags: ["city", "court", "quest"],
    description: "王府礼仪森严，来客多需引荐。",
    sceneBackdrop: daliBackdrop
  },
  {
    id: "erhai_pier",
    name: "洱海渡口",
    type: "城镇",
    regionId: "dali",
    grid: { col: 2, row: 6 },
    tags: ["city", "dock", "travel"],
    description: "湖面舟影绵延，渔火夜照长堤。",
    sceneBackdrop: waterBackdrop
  },
  {
    id: "cangshan_trail",
    name: "苍山栈道",
    type: "城镇",
    regionId: "dali",
    grid: { col: 3, row: 6 },
    tags: ["mountain", "road", "herbs"],
    description: "高坡险栈之间，奇草异花随季节生灭。"
  },

  {
    id: "heimu_cliff",
    name: "黑木绝崖",
    type: "秘境",
    regionId: "heimuya",
    grid: { col: 10, row: -2 },
    tags: ["cliff", "cult", "secret"],
    description: "崖壁风号如泣，铁索桥连向教坛深处。",
    sceneBackdrop: cliffBackdrop
  },
  {
    id: "riyue_hall",
    name: "日月总坛",
    type: "门派",
    regionId: "heimuya",
    grid: { col: 11, row: -2 },
    tags: ["sect", "cult", "hall", "mentor"],
    description: "旌旗猎猎，坛中弟子来往森严。",
    sceneBackdrop: cliffBackdrop
  },
  {
    id: "hanging_bridge",
    name: "悬索危桥",
    type: "秘境",
    regionId: "heimuya",
    grid: { col: 10, row: -3 },
    tags: ["cliff", "road", "trial"],
    description: "木板窄桥横跨深壑，一步踏错便是绝境。",
    sceneBackdrop: cliffBackdrop
  },
  {
    id: "abyss_path",
    name: "断魂崖道",
    type: "秘境",
    regionId: "heimuya",
    grid: { col: 11, row: -3 },
    tags: ["cliff", "secret", "trial"],
    description: "崖道蜿蜒向下，尽头常有高手潜修。",
    sceneBackdrop: cliffBackdrop
  },

  {
    id: "taohua_pier",
    name: "桃花港",
    type: "城镇",
    regionId: "taohua",
    grid: { col: 14, row: 2 },
    tags: ["island", "dock", "travel"],
    description: "海浪拍岸，渔舟穿梭于桃林外海。",
    sceneBackdrop: waterBackdrop
  },
  {
    id: "taohua_villa",
    name: "桃花庄",
    type: "门派",
    regionId: "taohua",
    grid: { col: 15, row: 2 },
    tags: ["island", "sect", "mentor"],
    description: "庄前落英缤纷，阵法机关暗藏其间。",
    sceneBackdrop: islandBackdrop
  },
  {
    id: "peach_blossom_woods",
    name: "落英林",
    type: "秘境",
    regionId: "taohua",
    grid: { col: 15, row: 1 },
    tags: ["island", "forest", "trial"],
    description: "桃林迷踪，行差一步便会原地兜转。",
    sceneBackdrop: islandBackdrop
  },
  {
    id: "trial_reef",
    name: "试剑礁",
    type: "秘境",
    regionId: "taohua",
    grid: { col: 16, row: 2 },
    tags: ["island", "duel", "trial"],
    description: "海潮冲刷礁岩，历代高手曾在此论剑。",
    sceneBackdrop: islandBackdrop
  },

  {
    id: "kunlun_pass",
    name: "昆仑古驿",
    type: "野外",
    regionId: "kunlun",
    grid: { col: 1, row: 4 },
    tags: ["mountain", "road", "travel"],
    description: "雪风扑面，古驿连通西域与中原。",
    sceneBackdrop: plateauBackdrop
  },
  {
    id: "bright_peak",
    name: "光明顶",
    type: "门派",
    regionId: "kunlun",
    grid: { col: 0, row: 3 },
    tags: ["mountain", "sect", "duel"],
    description: "峭壁绝巅云海翻涌，历代群雄在此争锋。",
    sceneBackdrop: plateauBackdrop
  },
  {
    id: "mingjiao_altar",
    name: "明教圣坛",
    type: "门派",
    regionId: "kunlun",
    grid: { col: 1, row: 3 },
    tags: ["sect", "cult", "mentor"],
    description: "圣火长明，坛中典籍记载诸多奇功。",
    sceneBackdrop: plateauBackdrop
  },
  {
    id: "glacier_valley",
    name: "冰川幽谷",
    type: "秘境",
    regionId: "kunlun",
    grid: { col: 0, row: 4 },
    tags: ["mountain", "secret", "trial"],
    description: "寒雾封谷，奇功残卷与异兽同栖。",
    sceneBackdrop: plateauBackdrop
  }
];

export const mapEdges = [
  ["town_gate", "market"],
  ["market", "inn"],
  ["market", "river_dock"],
  ["market", "road_post"],
  ["town_gate", "west_ward"],
  ["inn", "imperial_street"],
  ["market", "imperial_street"],
  ["river_dock", "courier_station"],
  ["road_post", "courier_station"],
  ["road_post", "luoyang_gate"],
  ["courier_station", "luoyang_gate"],
  ["road_post", "training_ground"],

  ["luoyang_gate", "luoyang_market"],
  ["luoyang_market", "peony_manor"],
  ["luoyang_market", "tianjin_bridge"],
  ["luoyang_market", "magistrate_office"],
  ["magistrate_office", "kaifeng_west_road"],
  ["tianjin_bridge", "bianhe_wharf"],

  ["kaifeng_west_road", "kaifeng_square"],
  ["kaifeng_square", "kaifeng_yamen"],
  ["kaifeng_square", "bianhe_wharf"],
  ["kaifeng_square", "royal_archive"],
  ["royal_archive", "suzhou_gate"],
  ["kaifeng_yamen", "taishan_road"],
  ["kaifeng_west_road", "blackwood_outpost"],

  ["training_ground", "huashan_hall"],
  ["huashan_hall", "back_hill"],
  ["huashan_hall", "sword_gallery"],
  ["training_ground", "cliff_hostel"],
  ["sword_gallery", "cliff_hostel"],
  ["sword_gallery", "songshan_pass"],
  ["training_ground", "mountain_path"],

  ["songshan_pass", "zhongyue_square"],
  ["zhongyue_square", "zen_tea_house"],
  ["zen_tea_house", "peony_manor"],
  ["zen_tea_house", "zhongnan_temple"],
  ["songshan_pass", "shaolin_gate"],
  ["zhongyue_square", "taishan_road"],

  ["shaolin_gate", "monk_courtyard"],
  ["monk_courtyard", "sutra_pavilion"],
  ["monk_courtyard", "wooden_lane"],
  ["wooden_lane", "taoist_shrine"],

  ["mountain_path", "qinling_ridge"],
  ["mountain_path", "zhongnan_temple"],
  ["qinling_ridge", "hermit_hut"],
  ["qinling_ridge", "blackwood_forest"],
  ["mountain_path", "gumu_gate"],
  ["hermit_hut", "cloud_stair"],
  ["zhongnan_temple", "songshan_pass"],

  ["gumu_gate", "gumu_court"],
  ["gumu_court", "hidden_cave"],
  ["gumu_court", "cold_pool"],
  ["cold_pool", "cloud_stair"],

  ["blackwood_forest", "blackwood_outpost"],
  ["blackwood_forest", "bandit_fort"],
  ["blackwood_outpost", "raven_marsh"],
  ["bandit_fort", "raven_marsh"],
  ["raven_marsh", "hanchuan_dock"],

  ["taishan_road", "sealing_platform"],
  ["taishan_road", "taoist_shrine"],
  ["taoist_shrine", "jade_peak"],
  ["sealing_platform", "jade_peak"],
  ["sealing_platform", "bandit_fort"],

  ["cloud_stair", "wudang_gate"],
  ["wudang_gate", "zixiao_hall"],
  ["zixiao_hall", "taihe_peak"],
  ["cloud_stair", "taihe_peak"],
  ["wudang_gate", "xiangyang_wall"],
  ["wudang_gate", "monkey_valley"],

  ["xiangyang_wall", "martial_square"],
  ["xiangyang_wall", "north_granary"],
  ["martial_square", "hanchuan_dock"],
  ["north_granary", "hanchuan_dock"],
  ["martial_square", "suzhou_gate"],

  ["suzhou_gate", "suzhou_market"],
  ["suzhou_market", "suzhou_dock"],
  ["suzhou_market", "murong_manor"],
  ["suzhou_market", "water_lane"],
  ["suzhou_dock", "qiantang_port"],
  ["water_lane", "hangzhou_gate"],

  ["hangzhou_gate", "west_lake"],
  ["hangzhou_gate", "leifeng_tower"],
  ["hangzhou_gate", "qiantang_port"],
  ["west_lake", "leifeng_tower"],

  ["monkey_valley", "emei_path"],
  ["emei_path", "golden_summit"],
  ["golden_summit", "nunnery_hall"],
  ["monkey_valley", "nunnery_hall"],
  ["emei_path", "dali_gate"],
  ["nunnery_hall", "cangshan_trail"],

  ["dali_gate", "dali_palace"],
  ["dali_gate", "erhai_pier"],
  ["dali_palace", "cangshan_trail"],
  ["erhai_pier", "cangshan_trail"],

  ["bandit_fort", "heimu_cliff"],
  ["blackwood_forest", "heimu_cliff"],
  ["heimu_cliff", "riyue_hall"],
  ["heimu_cliff", "hanging_bridge"],
  ["hanging_bridge", "abyss_path"],
  ["riyue_hall", "abyss_path"],
  ["hanging_bridge", "jade_peak"],

  ["qiantang_port", "taohua_pier"],
  ["taohua_pier", "taohua_villa"],
  ["taohua_villa", "peach_blossom_woods"],
  ["taohua_villa", "trial_reef"],
  ["peach_blossom_woods", "trial_reef"],

  ["cangshan_trail", "kunlun_pass"],
  ["monkey_valley", "kunlun_pass"],
  ["kunlun_pass", "bright_peak"],
  ["kunlun_pass", "mingjiao_altar"],
  ["bright_peak", "mingjiao_altar"],
  ["bright_peak", "glacier_valley"],
  ["mingjiao_altar", "glacier_valley"]
];

const nodeById = new Map(mapNodes.map((node) => [node.id, node]));
const regionById = new Map(mapRegions.map((region) => [region.id, region]));

const adjacencyByNode = new Map();
for (const node of mapNodes) {
  adjacencyByNode.set(node.id, []);
}
for (const [a, b] of mapEdges) {
  if (adjacencyByNode.has(a)) {
    adjacencyByNode.get(a).push(b);
  }
  if (adjacencyByNode.has(b)) {
    adjacencyByNode.get(b).push(a);
  }
}

const connectedRegionById = new Map();
for (const region of mapRegions) {
  connectedRegionById.set(region.id, []);
}
for (const [a, b] of regionEdges) {
  if (connectedRegionById.has(a)) {
    connectedRegionById.get(a).push(b);
  }
  if (connectedRegionById.has(b)) {
    connectedRegionById.get(b).push(a);
  }
}

export function getNodeById(nodeId) {
  return nodeById.get(nodeId) || null;
}

export function getAdjacentNodeIds(nodeId) {
  return adjacencyByNode.has(nodeId) ? [...adjacencyByNode.get(nodeId)] : [];
}

export function getDirection(fromId, toId) {
  const from = getNodeById(fromId);
  const to = getNodeById(toId);
  if (!from || !to) {
    return "";
  }

  const dx = to.grid.col - from.grid.col;
  const dy = to.grid.row - from.grid.row;

  let key = "";
  if (dy < 0) key += "N";
  if (dy > 0) key += "S";
  if (dx > 0) key += "E";
  if (dx < 0) key += "W";

  return directionLabels[key] || "";
}

export function getRegionById(regionId) {
  return regionById.get(regionId) || null;
}

export function getRegionNodes(regionId) {
  return mapNodes.filter((node) => node.regionId === regionId);
}

export function getConnectedRegionIds(regionId) {
  return connectedRegionById.has(regionId) ? [...connectedRegionById.get(regionId)] : [];
}

export function getNodeRegion(nodeId) {
  const node = getNodeById(nodeId);
  if (!node) {
    return null;
  }
  return getRegionById(node.regionId);
}

export function getNodesByTag(tag) {
  return mapNodes.filter((node) => Array.isArray(node.tags) && node.tags.includes(tag));
}

// Backward-compatible alias used by scene modules.
export function getRegionOfNode(nodeId) {
  return getNodeRegion(nodeId);
}
