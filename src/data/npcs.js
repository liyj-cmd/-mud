export const npcs = [
  {
    id: "master_yue",
    name: "岳掌门",
    role: "掌门",
    factionId: "huashan",
    home: "huashan_hall",
    tags: ["mentor", "sect", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "elder_ning", type: "ally", affinity: 35 },
      { targetId: "disciple_qing", type: "mentor", affinity: 42 },
      { targetId: "constable_lei", type: "cooperate", affinity: 8 }
    ],
    questHooks: [{ questId: "heimu_secret", role: "giver" }],
    schedule: [
      { from: 5, to: 7, location: "back_hill", action: "晨练观气" },
      { from: 7, to: 11, location: "huashan_hall", action: "开堂授艺" },
      { from: 11, to: 13, location: "cliff_hostel", action: "会客议事" },
      { from: 13, to: 19, location: "training_ground", action: "巡视弟子" },
      { from: 19, to: 21, location: "huashan_hall", action: "夜议江湖" },
      { from: 21, to: 24, location: "back_hill", action: "闭关吐纳" },
      { from: 0, to: 5, location: "back_hill", action: "闭关吐纳" }
    ],
    talks: [
      { when: "default", text: "江湖行走，先稳根基，再谈锋芒。" },
      { when: "night", text: "夜里山风急，行事务必留三分后手。" }
    ]
  },
  {
    id: "disciple_qing",
    name: "弟子阿青",
    role: "弟子",
    factionId: "huashan",
    home: "training_ground",
    tags: ["sect", "training", "guard"],
    affinityOnTalk: 1,
    relationshipSeeds: [{ targetId: "master_yue", type: "respect", affinity: 48 }],
    schedule: [
      { from: 5, to: 9, location: "training_ground", action: "晨功对练" },
      { from: 9, to: 13, location: "mountain_path", action: "山门巡查" },
      { from: 13, to: 18, location: "training_ground", action: "午后练拳" },
      { from: 18, to: 22, location: "town_gate", action: "外门值守" },
      { from: 22, to: 24, location: "inn", action: "夜宿客栈" },
      { from: 0, to: 5, location: "inn", action: "夜宿客栈" }
    ],
    talks: [
      { when: "default", text: "若要切磋，我随时奉陪。" },
      { when: "night", text: "天黑后林子里常有异动，别久留。" }
    ]
  },
  {
    id: "elder_ning",
    name: "宁女侠",
    role: "执剑长老",
    factionId: "huashan",
    home: "sword_gallery",
    tags: ["mentor", "sect", "weapon"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "master_yue", type: "ally", affinity: 40 },
      { targetId: "swordswoman_lin", type: "old_friend", affinity: 18 }
    ],
    schedule: [
      { from: 5, to: 8, location: "sword_gallery", action: "整谱磨剑" },
      { from: 8, to: 12, location: "training_ground", action: "传授剑式" },
      { from: 12, to: 15, location: "cliff_hostel", action: "会见门客" },
      { from: 15, to: 20, location: "sword_gallery", action: "研判剑理" },
      { from: 20, to: 24, location: "huashan_hall", action: "护殿巡夜" },
      { from: 0, to: 5, location: "huashan_hall", action: "护殿巡夜" }
    ],
    talks: [
      { when: "default", text: "剑先守心，再求破敌。" }
    ]
  },
  {
    id: "merchant_zhou",
    name: "商贩老周",
    role: "商贩",
    factionId: "suzhou_merchants",
    home: "market",
    tags: ["merchant", "rumor", "quest"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "ferryman_wu", type: "business", affinity: 30 },
      { targetId: "inspector_guo", type: "uneasy", affinity: -8 }
    ],
    schedule: [
      { from: 6, to: 10, location: "market", action: "摆摊叫卖" },
      { from: 10, to: 14, location: "kaifeng_square", action: "议价收货" },
      { from: 14, to: 18, location: "suzhou_market", action: "南货转手" },
      { from: 18, to: 22, location: "inn", action: "酒肆听风" },
      { from: 22, to: 24, location: "market", action: "清点货账" },
      { from: 0, to: 6, location: "market", action: "清点货账" }
    ],
    talks: [
      { when: "default", text: "消息有价，银两随缘。" },
      { when: "market_day", text: "今儿有批药材，手快者得。" }
    ]
  },
  {
    id: "innkeeper_tong",
    name: "佟掌柜",
    role: "掌柜",
    factionId: "neutral_wulin",
    home: "inn",
    tags: ["inn", "rumor", "merchant"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "merchant_zhou", type: "business", affinity: 22 },
      { targetId: "constable_lei", type: "cooperate", affinity: 10 }
    ],
    schedule: [
      { from: 5, to: 11, location: "inn", action: "备酒迎客" },
      { from: 11, to: 14, location: "market", action: "采买食材" },
      { from: 14, to: 20, location: "inn", action: "照看堂口" },
      { from: 20, to: 24, location: "imperial_street", action: "催账巡铺" },
      { from: 0, to: 5, location: "inn", action: "盘账守夜" }
    ],
    talks: [
      { when: "default", text: "住店喝酒都好说，惹事可不成。" }
    ]
  },
  {
    id: "constable_lei",
    name: "雷捕头",
    role: "捕头",
    factionId: "imperial_court",
    home: "kaifeng_yamen",
    tags: ["court", "guard", "quest"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "inspector_guo", type: "subordinate", affinity: 28 },
      { targetId: "ranger_hei", type: "rival", affinity: -24 }
    ],
    questHooks: [{ questId: "kaifeng_bounty", role: "sponsor" }],
    schedule: [
      { from: 5, to: 9, location: "kaifeng_yamen", action: "点卯布令" },
      { from: 9, to: 13, location: "kaifeng_square", action: "巡街缉盗" },
      { from: 13, to: 17, location: "bianhe_wharf", action: "查验舟货" },
      { from: 17, to: 21, location: "kaifeng_yamen", action: "审讯抄录" },
      { from: 21, to: 24, location: "royal_archive", action: "核对旧案" },
      { from: 0, to: 5, location: "royal_archive", action: "夜查旧卷" }
    ],
    talks: [
      { when: "default", text: "江湖人守规矩，我也好说话。" }
    ]
  },
  {
    id: "courier_shen",
    name: "沈驿使",
    role: "驿使",
    factionId: "imperial_court",
    home: "courier_station",
    tags: ["court", "travel", "messenger"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "constable_lei", type: "coworker", affinity: 16 },
      { targetId: "scholar_ouyang", type: "client", affinity: 8 }
    ],
    schedule: [
      { from: 5, to: 8, location: "courier_station", action: "分拣文书" },
      { from: 8, to: 11, location: "luoyang_gate", action: "交接急件" },
      { from: 11, to: 14, location: "kaifeng_yamen", action: "递送官牒" },
      { from: 14, to: 18, location: "suzhou_gate", action: "南线换马" },
      { from: 18, to: 22, location: "courier_station", action: "回站复命" },
      { from: 22, to: 24, location: "inn", action: "短暂歇脚" },
      { from: 0, to: 5, location: "inn", action: "短暂歇脚" }
    ],
    talks: [
      { when: "default", text: "急件在身，失礼莫怪。" }
    ]
  },
  {
    id: "daoist_qiu",
    name: "丘道长",
    role: "隐修道人",
    factionId: "zhongnan_hermits",
    home: "zhongnan_temple",
    tags: ["mentor", "sect", "healing"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "elder_song", type: "fellow", affinity: 18 },
      { targetId: "tomb_maiden_mo", type: "respect", affinity: 10 }
    ],
    schedule: [
      { from: 5, to: 9, location: "zhongnan_temple", action: "诵经炼气" },
      { from: 9, to: 12, location: "hermit_hut", action: "会客论道" },
      { from: 12, to: 16, location: "qinling_ridge", action: "巡山采药" },
      { from: 16, to: 20, location: "zhongnan_temple", action: "整理典籍" },
      { from: 20, to: 24, location: "hermit_hut", action: "夜观星象" },
      { from: 0, to: 5, location: "hermit_hut", action: "夜观星象" }
    ],
    talks: [
      { when: "default", text: "一口气沉得住，半个江湖都慢下来。" }
    ]
  },
  {
    id: "tomb_maiden_mo",
    name: "莫清影",
    role: "古墓门人",
    factionId: "gumu",
    home: "gumu_court",
    tags: ["sect", "secret", "mentor"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "daoist_qiu", type: "neutral", affinity: 4 },
      { targetId: "ranger_hei", type: "enemy", affinity: -22 }
    ],
    schedule: [
      { from: 5, to: 10, location: "gumu_court", action: "清理石阵" },
      { from: 10, to: 14, location: "hidden_cave", action: "查阅残卷" },
      { from: 14, to: 18, location: "cold_pool", action: "寒潭炼体" },
      { from: 18, to: 22, location: "gumu_gate", action: "守门巡视" },
      { from: 22, to: 24, location: "gumu_court", action: "静修" },
      { from: 0, to: 5, location: "gumu_court", action: "静修" }
    ],
    talks: [
      { when: "default", text: "古墓不迎俗客，但也不拒有缘人。" }
    ]
  },
  {
    id: "ranger_hei",
    name: "黑林游侠",
    role: "游侠",
    factionId: "neutral_wulin",
    home: "blackwood_forest",
    tags: ["forest", "guard", "hunter"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "constable_lei", type: "cooperate", affinity: 12 },
      { targetId: "bandit_fort_luo", type: "enemy", affinity: -35 }
    ],
    schedule: [
      { from: 5, to: 9, location: "blackwood_outpost", action: "查看陷阱" },
      { from: 9, to: 13, location: "blackwood_forest", action: "追踪匪迹" },
      { from: 13, to: 17, location: "raven_marsh", action: "封堵暗渠" },
      { from: 17, to: 21, location: "north_granary", action: "交接情报" },
      { from: 21, to: 24, location: "blackwood_forest", action: "夜巡林线" },
      { from: 0, to: 5, location: "blackwood_forest", action: "夜巡林线" }
    ],
    talks: [
      { when: "default", text: "林子里脚印不会骗人，贼总会露头。" }
    ]
  },
  {
    id: "bandit_fort_luo",
    name: "罗三刀",
    role: "寨中眼线",
    factionId: "heimu_bandits",
    home: "bandit_fort",
    tags: ["bandit", "underworld", "rumor"],
    affinityOnTalk: -1,
    relationshipSeeds: [
      { targetId: "ranger_hei", type: "enemy", affinity: -40 },
      { targetId: "merchant_zhou", type: "trade", affinity: 5 }
    ],
    schedule: [
      { from: 5, to: 10, location: "bandit_fort", action: "整备寨众" },
      { from: 10, to: 14, location: "raven_marsh", action: "搬运暗货" },
      { from: 14, to: 18, location: "blackwood_outpost", action: "踩点放哨" },
      { from: 18, to: 22, location: "inn", action: "探听风声" },
      { from: 22, to: 24, location: "bandit_fort", action: "回寨汇报" },
      { from: 0, to: 5, location: "bandit_fort", action: "回寨汇报" }
    ],
    talks: [
      { when: "default", text: "买卖不问来路，银子够就行。" }
    ]
  },
  {
    id: "monk_jueyuan",
    name: "觉远大师",
    role: "首座",
    factionId: "shaolin",
    home: "monk_courtyard",
    tags: ["mentor", "sect", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "novice_hui", type: "mentor", affinity: 44 },
      { targetId: "elder_song", type: "old_friend", affinity: 20 }
    ],
    schedule: [
      { from: 5, to: 8, location: "monk_courtyard", action: "早课点众" },
      { from: 8, to: 12, location: "wooden_lane", action: "督导闯关" },
      { from: 12, to: 15, location: "sutra_pavilion", action: "讲经释义" },
      { from: 15, to: 19, location: "shaolin_gate", action: "接见来客" },
      { from: 19, to: 24, location: "monk_courtyard", action: "晚课静坐" },
      { from: 0, to: 5, location: "monk_courtyard", action: "晚课静坐" }
    ],
    talks: [
      { when: "default", text: "心定则拳定，拳定则人定。" }
    ]
  },
  {
    id: "novice_hui",
    name: "慧行小僧",
    role: "小僧",
    factionId: "shaolin",
    home: "shaolin_gate",
    tags: ["sect", "training", "messenger"],
    affinityOnTalk: 1,
    relationshipSeeds: [{ targetId: "monk_jueyuan", type: "respect", affinity: 46 }],
    schedule: [
      { from: 5, to: 9, location: "shaolin_gate", action: "值守山门" },
      { from: 9, to: 13, location: "zen_tea_house", action: "迎送香客" },
      { from: 13, to: 18, location: "monk_courtyard", action: "练拳跑桩" },
      { from: 18, to: 22, location: "sutra_pavilion", action: "抄录经文" },
      { from: 22, to: 24, location: "shaolin_gate", action: "夜值山门" },
      { from: 0, to: 5, location: "shaolin_gate", action: "夜值山门" }
    ],
    talks: [
      { when: "default", text: "施主若入寺，请先净手净心。" }
    ]
  },
  {
    id: "inspector_guo",
    name: "郭司巡",
    role: "巡检使",
    factionId: "imperial_court",
    home: "kaifeng_yamen",
    tags: ["court", "quest", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "constable_lei", type: "superior", affinity: 26 },
      { targetId: "ferryman_wu", type: "suspicious", affinity: -12 }
    ],
    questHooks: [{ questId: "kaifeng_bounty", role: "giver" }],
    schedule: [
      { from: 6, to: 10, location: "kaifeng_yamen", action: "批示缉令" },
      { from: 10, to: 14, location: "royal_archive", action: "核对密档" },
      { from: 14, to: 18, location: "bianhe_wharf", action: "暗查漕运" },
      { from: 18, to: 22, location: "kaifeng_yamen", action: "审阅回报" },
      { from: 22, to: 24, location: "kaifeng_square", action: "便衣巡街" },
      { from: 0, to: 6, location: "kaifeng_square", action: "便衣巡街" }
    ],
    talks: [
      { when: "default", text: "江湖可纵横，但别越官法底线。" }
    ]
  },
  {
    id: "scholar_ouyang",
    name: "欧阳学士",
    role: "文士",
    factionId: "neutral_wulin",
    home: "luoyang_market",
    tags: ["intel", "court", "rumor"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "courier_shen", type: "client", affinity: 12 },
      { targetId: "inspector_guo", type: "acquaintance", affinity: 7 }
    ],
    schedule: [
      { from: 6, to: 10, location: "peony_manor", action: "讲学会文" },
      { from: 10, to: 14, location: "luoyang_market", action: "搜罗旧书" },
      { from: 14, to: 18, location: "royal_archive", action: "校订旧卷" },
      { from: 18, to: 22, location: "inn", action: "夜谈掌故" },
      { from: 22, to: 24, location: "peony_manor", action: "整理笔记" },
      { from: 0, to: 6, location: "peony_manor", action: "整理笔记" }
    ],
    talks: [
      { when: "default", text: "旧案里藏着新局，读懂一页就少走十里路。" }
    ]
  },
  {
    id: "elder_song",
    name: "宋道长",
    role: "长老",
    factionId: "wudang",
    home: "zixiao_hall",
    tags: ["mentor", "sect", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "daoist_qiu", type: "fellow", affinity: 20 },
      { targetId: "monk_jueyuan", type: "friend", affinity: 18 }
    ],
    schedule: [
      { from: 5, to: 9, location: "taihe_peak", action: "晨课吐纳" },
      { from: 9, to: 13, location: "zixiao_hall", action: "讲解心法" },
      { from: 13, to: 17, location: "cloud_stair", action: "巡看弟子" },
      { from: 17, to: 21, location: "wudang_gate", action: "会见来客" },
      { from: 21, to: 24, location: "zixiao_hall", action: "夜观剑谱" },
      { from: 0, to: 5, location: "zixiao_hall", action: "夜观剑谱" }
    ],
    talks: [
      { when: "default", text: "形可快，心不可急。" }
    ]
  },
  {
    id: "tactician_ye",
    name: "叶参军",
    role: "参军",
    factionId: "xiangyang_guard",
    home: "xiangyang_wall",
    tags: ["guard", "quest", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "constable_lei", type: "cooperate", affinity: 16 },
      { targetId: "ferryman_wu", type: "watch", affinity: -6 }
    ],
    schedule: [
      { from: 5, to: 9, location: "xiangyang_wall", action: "城防点验" },
      { from: 9, to: 13, location: "martial_square", action: "操练兵阵" },
      { from: 13, to: 17, location: "north_granary", action: "核验军需" },
      { from: 17, to: 21, location: "hanchuan_dock", action: "查验河道" },
      { from: 21, to: 24, location: "xiangyang_wall", action: "夜巡烽台" },
      { from: 0, to: 5, location: "xiangyang_wall", action: "夜巡烽台" }
    ],
    talks: [
      { when: "default", text: "守城之道，靠的是日复一日的不松懈。" }
    ]
  },
  {
    id: "ferryman_wu",
    name: "吴船头",
    role: "船头",
    factionId: "suzhou_merchants",
    home: "suzhou_dock",
    tags: ["merchant", "dock", "travel"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "merchant_zhou", type: "trade", affinity: 28 },
      { targetId: "inspector_guo", type: "uneasy", affinity: -12 }
    ],
    schedule: [
      { from: 5, to: 9, location: "suzhou_dock", action: "点验船队" },
      { from: 9, to: 13, location: "water_lane", action: "组织装船" },
      { from: 13, to: 17, location: "qiantang_port", action: "海货交割" },
      { from: 17, to: 21, location: "suzhou_market", action: "结算货款" },
      { from: 21, to: 24, location: "suzhou_dock", action: "守夜看船" },
      { from: 0, to: 5, location: "suzhou_dock", action: "守夜看船" }
    ],
    talks: [
      { when: "default", text: "水路讲的是潮汐，也讲信用。" }
    ]
  },
  {
    id: "swordswoman_lin",
    name: "林女侠",
    role: "游剑客",
    factionId: "jianghu_knights",
    home: "west_lake",
    tags: ["duel", "mentor", "wanderer"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "elder_ning", type: "friend", affinity: 18 },
      { targetId: "nun_jingxin", type: "respect", affinity: 14 }
    ],
    schedule: [
      { from: 5, to: 9, location: "west_lake", action: "晨练试剑" },
      { from: 9, to: 13, location: "leifeng_tower", action: "访古观碑" },
      { from: 13, to: 17, location: "suzhou_market", action: "采买兵装" },
      { from: 17, to: 21, location: "golden_summit", action: "邀战名手" },
      { from: 21, to: 24, location: "inn", action: "夜宿听闻" },
      { from: 0, to: 5, location: "inn", action: "夜宿听闻" }
    ],
    talks: [
      { when: "default", text: "江湖行剑，不只为胜负，也为问心。" }
    ]
  },
  {
    id: "nun_jingxin",
    name: "静心师太",
    role: "师太",
    factionId: "emei",
    home: "nunnery_hall",
    tags: ["mentor", "sect", "healing"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "swordswoman_lin", type: "ally", affinity: 12 },
      { targetId: "prince_duan", type: "acquaintance", affinity: 6 }
    ],
    schedule: [
      { from: 5, to: 9, location: "nunnery_hall", action: "晨课布施" },
      { from: 9, to: 13, location: "golden_summit", action: "讲经授艺" },
      { from: 13, to: 17, location: "monkey_valley", action: "巡护山道" },
      { from: 17, to: 21, location: "emei_path", action: "接引香客" },
      { from: 21, to: 24, location: "nunnery_hall", action: "夜课静修" },
      { from: 0, to: 5, location: "nunnery_hall", action: "夜课静修" }
    ],
    talks: [
      { when: "default", text: "行善不是示弱，而是自守本心。" }
    ]
  },
  {
    id: "prince_duan",
    name: "段公子",
    role: "王府使者",
    factionId: "dali_royal",
    home: "dali_palace",
    tags: ["court", "quest", "leader"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "healer_xue", type: "trusted", affinity: 22 },
      { targetId: "nun_jingxin", type: "respect", affinity: 10 }
    ],
    questHooks: [{ questId: "dali_medicine", role: "giver" }],
    schedule: [
      { from: 6, to: 10, location: "dali_palace", action: "处理政务" },
      { from: 10, to: 14, location: "dali_gate", action: "接见来使" },
      { from: 14, to: 18, location: "erhai_pier", action: "巡视湖防" },
      { from: 18, to: 22, location: "dali_palace", action: "召议文武" },
      { from: 22, to: 24, location: "dali_palace", action: "夜读奏报" },
      { from: 0, to: 6, location: "dali_palace", action: "夜读奏报" }
    ],
    talks: [
      { when: "default", text: "若肯相助，大理必铭记此情。" }
    ]
  },
  {
    id: "healer_xue",
    name: "薛医师",
    role: "医师",
    factionId: "dali_royal",
    home: "cangshan_trail",
    tags: ["healing", "herbs", "quest"],
    affinityOnTalk: 1,
    relationshipSeeds: [
      { targetId: "prince_duan", type: "serve", affinity: 30 },
      { targetId: "daoist_qiu", type: "exchange", affinity: 10 }
    ],
    schedule: [
      { from: 5, to: 9, location: "cangshan_trail", action: "采集药草" },
      { from: 9, to: 13, location: "dali_palace", action: "调配药方" },
      { from: 13, to: 17, location: "erhai_pier", action: "巡诊渔民" },
      { from: 17, to: 21, location: "cangshan_trail", action: "整理药篓" },
      { from: 21, to: 24, location: "dali_gate", action: "夜间问诊" },
      { from: 0, to: 5, location: "dali_gate", action: "夜间问诊" }
    ],
    talks: [
      { when: "default", text: "药救得了伤，也救得了心急。" }
    ]
  }
];

const npcById = new Map(npcs.map((npc) => [npc.id, npc]));

export function getNpcById(npcId) {
  return npcById.get(npcId) || null;
}

export function getNpcsByFaction(factionId) {
  return npcs.filter((npc) => npc.factionId === factionId);
}

export function getNpcRelationships(npcId) {
  const npc = getNpcById(npcId);
  return npc ? npc.relationshipSeeds || [] : [];
}
