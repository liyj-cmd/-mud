export const nodeScenes = [
  {
    nodeId: "market",
    themeId: "market",
    size: { width: 960, height: 540 },
    spawn: { x: 500, y: 458 },
    obstacles: [
      { id: "stall_north_west", visualKey: "stall.cloth", x: 136, y: 114, width: 170, height: 74 },
      { id: "stall_north_mid", visualKey: "stall.herb", x: 362, y: 118, width: 188, height: 72 },
      { id: "stall_north_east", visualKey: "stall.weapon", x: 642, y: 116, width: 172, height: 74 },
      { id: "stall_center", visualKey: "stall.goods", x: 432, y: 254, width: 170, height: 78 },
      { id: "tea_table", visualKey: "stall.tea_table", x: 228, y: 304, width: 104, height: 62 }
    ],
    exits: [
      { id: "to_town_gate", visualKey: "exit.city_gate", label: "东门", toNodeId: "town_gate", x: 10, y: 218, width: 58, height: 112 },
      { id: "to_inn", visualKey: "exit.inn", label: "客栈", toNodeId: "inn", x: 788, y: 10, width: 126, height: 56 },
      { id: "to_river_dock", visualKey: "exit.wharf", label: "渡口", toNodeId: "river_dock", x: 778, y: 472, width: 152, height: 58 },
      { id: "to_road_post", visualKey: "exit.official_road", label: "官道", toNodeId: "road_post", x: 900, y: 198, width: 52, height: 116 },
      { id: "to_imperial_street", visualKey: "exit.market_street", label: "长街", toNodeId: "imperial_street", x: 242, y: 8, width: 142, height: 54 }
    ],
    npcAnchors: {
      merchant_zhou: { x: 486, y: 216 },
      innkeeper_tong: { x: 742, y: 332 }
    },
    pois: [
      {
        id: "notice_board",
        visualKey: "poi.notice_board",
        label: "告示牌",
        x: 128,
        y: 156,
        radius: 30,
        timeCost: 5,
        logText: "你驻足告示牌前，细读新贴的缉捕榜与江湖悬赏。"
      },
      {
        id: "tea_stall",
        visualKey: "poi.tea_stall",
        label: "茶摊",
        x: 270,
        y: 366,
        radius: 32,
        timeCost: 5,
        logText: "你在茶摊旁听了几句闲话，捉到些风声。"
      }
    ]
  },
  {
    nodeId: "kaifeng_square",
    themeId: "magistrate_square",
    size: { width: 960, height: 540 },
    spawn: { x: 472, y: 458 },
    obstacles: [
      { id: "yamen_gate", visualKey: "obstacle.yamen_gate", x: 354, y: 80, width: 252, height: 112 },
      { id: "drum_tower", visualKey: "obstacle.drum_tower", x: 152, y: 150, width: 126, height: 116 },
      { id: "patrol_booth", visualKey: "obstacle.patrol_booth", x: 458, y: 278, width: 136, height: 94 },
      { id: "archive_cart", visualKey: "obstacle.archive_cart", x: 640, y: 314, width: 146, height: 84 },
      { id: "river_crates", visualKey: "obstacle.river_crates", x: 752, y: 412, width: 142, height: 74 }
    ],
    exits: [
      {
        id: "to_kaifeng_west_road",
        visualKey: "exit.west_road",
        label: "西路",
        toNodeId: "kaifeng_west_road",
        x: 12,
        y: 218,
        width: 58,
        height: 118
      },
      {
        id: "to_kaifeng_yamen",
        visualKey: "exit.yamen",
        label: "府衙",
        toNodeId: "kaifeng_yamen",
        x: 414,
        y: 8,
        width: 132,
        height: 56
      },
      {
        id: "to_bianhe_wharf",
        visualKey: "exit.wharf",
        label: "汴河",
        toNodeId: "bianhe_wharf",
        x: 718,
        y: 474,
        width: 170,
        height: 54
      },
      {
        id: "to_royal_archive",
        visualKey: "exit.archive",
        label: "档库",
        toNodeId: "royal_archive",
        x: 888,
        y: 168,
        width: 58,
        height: 118
      }
    ],
    npcAnchors: {
      merchant_zhou: { x: 314, y: 336 },
      constable_lei: { x: 522, y: 226 },
      inspector_guo: { x: 668, y: 206 }
    },
    pois: [
      {
        id: "warrant_wall",
        visualKey: "poi.warrant_wall",
        label: "缉令墙",
        x: 236,
        y: 214,
        radius: 30,
        timeCost: 5,
        logText: "你在缉令墙前逐条比对画像，官府追索的线索越发清晰。"
      },
      {
        id: "yamen_drum",
        visualKey: "poi.yamen_drum",
        label: "鸣冤鼓",
        x: 542,
        y: 170,
        radius: 28,
        timeCost: 5,
        logText: "你驻足衙鼓旁，听见差役低声议论昨夜案情。"
      },
      {
        id: "river_manifest",
        visualKey: "poi.river_manifest",
        label: "漕运簿册",
        x: 812,
        y: 418,
        radius: 30,
        timeCost: 5,
        logText: "你翻看货签与船牌，汴河来往的暗线逐渐浮出水面。"
      }
    ]
  },
  {
    nodeId: "monk_courtyard",
    themeId: "temple_courtyard",
    size: { width: 960, height: 540 },
    spawn: { x: 482, y: 458 },
    obstacles: [
      { id: "buddha_hall", visualKey: "obstacle.buddha_hall", x: 360, y: 74, width: 238, height: 108 },
      { id: "incense_cauldron", visualKey: "obstacle.incense_cauldron", x: 452, y: 246, width: 74, height: 78 },
      { id: "pine_north_west", visualKey: "obstacle.pine_cluster", x: 154, y: 138, width: 92, height: 122 },
      { id: "pine_north_east", visualKey: "obstacle.pine_cluster", x: 708, y: 134, width: 92, height: 126 },
      { id: "scripture_table", visualKey: "obstacle.scripture_table", x: 292, y: 328, width: 122, height: 74 },
      { id: "training_rack", visualKey: "obstacle.training_rack", x: 646, y: 332, width: 128, height: 72 }
    ],
    exits: [
      {
        id: "to_shaolin_gate",
        visualKey: "exit.temple_gate",
        label: "山门",
        toNodeId: "shaolin_gate",
        x: 12,
        y: 218,
        width: 58,
        height: 118
      },
      {
        id: "to_sutra_pavilion",
        visualKey: "exit.sutra_pavilion",
        label: "藏经阁",
        toNodeId: "sutra_pavilion",
        x: 406,
        y: 8,
        width: 148,
        height: 56
      },
      {
        id: "to_wooden_lane",
        visualKey: "exit.wood_lane",
        label: "木人巷",
        toNodeId: "wooden_lane",
        x: 890,
        y: 214,
        width: 58,
        height: 122
      }
    ],
    npcAnchors: {
      monk_jueyuan: { x: 478, y: 214 },
      novice_hui: { x: 620, y: 312 }
    },
    pois: [
      {
        id: "bell_frame",
        visualKey: "poi.bell_frame",
        label: "钟架",
        x: 188,
        y: 238,
        radius: 30,
        timeCost: 5,
        logText: "你轻触钟槌，沉钟余韵在院内回荡，心神渐定。"
      },
      {
        id: "incense_basin",
        visualKey: "poi.incense_basin",
        label: "香炉",
        x: 488,
        y: 288,
        radius: 28,
        timeCost: 5,
        logText: "你在香炉前驻足片刻，鼻端檀香淡淡，思绪随之收束。"
      },
      {
        id: "meditation_mat",
        visualKey: "poi.meditation_mat",
        label: "蒲团",
        x: 354,
        y: 394,
        radius: 26,
        timeCost: 5,
        logText: "你在蒲团旁观摩僧众吐纳，呼吸节律也慢慢合拍。"
      }
    ]
  }
];

const sceneByNodeId = new Map(nodeScenes.map((scene) => [scene.nodeId, scene]));

export function getNodeSceneById(nodeId) {
  return sceneByNodeId.get(nodeId) || null;
}

export function hasNodeScene(nodeId) {
  return sceneByNodeId.has(nodeId);
}
