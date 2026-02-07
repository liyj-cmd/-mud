export const events = [
  {
    id: "beggar_alms",
    title: "破衣老丐",
    description: "一名老丐拦路讨食，目光却极亮。",
    repeatable: true,
    weight: 12,
    conditions: {
      locations: ["town_gate", "market"],
      minHour: 6,
      maxHour: 20
    },
    choices: [
      {
        id: "donate",
        label: "施舍三文",
        outcomes: [
          {
            chance: 0.75,
            text: "老丐点头，指你一处运气诀窍。",
            effects: { gold: -3, potential: 12, morality: 1 }
          },
          {
            chance: 0.25,
            text: "老丐趁你不备摸走了两文钱。",
            effects: { gold: -2, potential: 4 }
          }
        ]
      },
      {
        id: "ignore",
        label: "漠然离开",
        outcomes: [
          {
            chance: 1,
            text: "你不作停留，心中微有波澜。",
            effects: { morality: -1 }
          }
        ]
      }
    ]
  },
  {
    id: "market_herbs",
    title: "药摊讨价",
    description: "摊上新到一批跌打药，商贩老周笑而不语。",
    repeatable: true,
    weight: 10,
    conditions: {
      locations: ["market", "suzhou_market"],
      requiresNpc: "merchant_zhou",
      minHour: 6,
      maxHour: 18
    },
    choices: [
      {
        id: "buy",
        label: "买药疗伤",
        outcomes: [
          {
            chance: 1,
            text: "药力温和，筋骨舒展。",
            effects: { gold: -6, hp: 22, potential: 5 }
          }
        ]
      },
      {
        id: "haggle",
        label: "压价砍单",
        outcomes: [
          {
            chance: 0.45,
            text: "你言辞锋利，老周让价。",
            effects: {
              gold: -3,
              hp: 16,
              potential: 8,
              statGain: { insight: 1 },
              relationDelta: { merchant_zhou: 2 }
            }
          },
          {
            chance: 0.55,
            text: "你被识破心思，反遭哄抬。",
            effects: { gold: -8, hp: 10, relationDelta: { merchant_zhou: -2 } }
          }
        ]
      }
    ]
  },
  {
    id: "injured_knight",
    title: "负伤侠客",
    description: "山道旁一名侠客受伤倒地，佩刀仍在。",
    repeatable: true,
    weight: 8,
    conditions: {
      locationTags: ["mountain"],
      minHour: 5,
      maxHour: 19
    },
    choices: [
      {
        id: "rescue",
        label: "扶他下山",
        outcomes: [
          {
            chance: 1,
            text: "你将人送至客栈，获其谢礼。",
            effects: { exp: 24, potential: 15, gold: 6, morality: 2, reputationDelta: { neutral_wulin: 2 } }
          }
        ]
      },
      {
        id: "search",
        label: "搜其行囊",
        outcomes: [
          {
            chance: 0.5,
            text: "你得了碎银，却背上一点心债。",
            effects: { gold: 18, morality: -2 }
          },
          {
            chance: 0.5,
            text: "伤者突然反击，你仓促受创。",
            effects: { hp: -18, gold: 8, morality: -2 }
          }
        ]
      }
    ]
  },
  {
    id: "forest_ambush",
    title: "林间伏兵",
    description: "黑木林里脚步骤急，几名飞贼围将上来。",
    repeatable: true,
    weight: 9,
    conditions: {
      locations: ["blackwood_forest", "mountain_path", "raven_marsh"],
      minHour: 6,
      maxHour: 22
    },
    choices: [
      {
        id: "fight",
        label: "迎战",
        outcomes: [
          {
            chance: 1,
            text: "你提气迎敌。",
            effects: {
              battle: {
                enemyId: "bandit_scout"
              }
            }
          }
        ]
      },
      {
        id: "evade",
        label: "施展轻功脱身",
        outcomes: [
          {
            chance: 0.6,
            text: "你借树影连跳，甩开追兵。",
            effects: { exp: 12, potential: 8, statGain: { agility: 1 } }
          },
          {
            chance: 0.4,
            text: "你脱身不及，被划伤手臂。",
            effects: { hp: -14, exp: 8 }
          }
        ]
      }
    ]
  },
  {
    id: "sparring_challenge",
    title: "演武切磋",
    description: "弟子阿青拱手邀你过招。",
    repeatable: true,
    weight: 9,
    conditions: {
      locations: ["training_ground"],
      requiresNpc: "disciple_qing",
      minHour: 5,
      maxHour: 19
    },
    choices: [
      {
        id: "accept",
        label: "以武会友",
        outcomes: [
          {
            chance: 1,
            text: "双方点到为止。",
            effects: {
              battle: {
                npcId: "disciple_qing"
              }
            }
          }
        ]
      },
      {
        id: "observe",
        label: "旁观体悟",
        outcomes: [
          {
            chance: 1,
            text: "你观其步法，心有所悟。",
            effects: { potential: 20, statGain: { insight: 1 }, relationDelta: { disciple_qing: 2 } }
          }
        ]
      }
    ]
  },
  {
    id: "hidden_manual",
    title: "残卷石函",
    description: "古墓石函内藏有残卷，字迹晦涩。",
    repeatable: true,
    weight: 7,
    conditions: {
      locations: ["hidden_cave"]
    },
    choices: [
      {
        id: "study",
        label: "静心参悟",
        outcomes: [
          {
            chance: 0.5,
            text: "你悟到几式夕阳掌要诀。",
            effects: { potential: 18, addSkill: "xiyang_zhang", statGain: { insight: 1 } }
          },
          {
            chance: 0.5,
            text: "你未尽其意，但真气稍有增长。",
            effects: { potential: 10, qi: 12 }
          }
        ]
      },
      {
        id: "force_open",
        label: "强行破函",
        outcomes: [
          {
            chance: 0.4,
            text: "你砸开石函，得了旧银与短剑谱。",
            effects: { gold: 26, addSkill: "qimen_duanjian", statGain: { bone: 1 } }
          },
          {
            chance: 0.6,
            text: "机关回震，你胸口一闷。",
            effects: { hp: -22, potential: 6 }
          }
        ]
      }
    ]
  },
  {
    id: "night_assassin",
    title: "夜巷寒光",
    description: "夜色里一道寒芒斜刺而来。",
    repeatable: true,
    weight: 8,
    conditions: {
      locations: ["town_gate", "inn", "blackwood_forest", "water_lane"],
      minHour: 19,
      maxHour: 5
    },
    choices: [
      {
        id: "counter",
        label: "反手迎击",
        outcomes: [
          {
            chance: 1,
            text: "你与刺客短兵相接。",
            effects: {
              battle: {
                enemyId: "night_assassin"
              }
            }
          }
        ]
      },
      {
        id: "flee",
        label: "借暗巷遁走",
        outcomes: [
          {
            chance: 0.55,
            text: "你甩开追踪，却遗落些许财物。",
            effects: { gold: -10, statGain: { agility: 1 } }
          },
          {
            chance: 0.45,
            text: "你遁走迟了半拍，被划伤后背。",
            effects: { hp: -20, gold: -6 }
          }
        ]
      }
    ]
  },
  {
    id: "inn_rumor",
    title: "酒肆传闻",
    description: "客栈里有人低声谈及黑木寨异动。",
    repeatable: true,
    weight: 11,
    conditions: {
      locationTags: ["inn"],
      minHour: 16,
      maxHour: 24
    },
    choices: [
      {
        id: "buy_info",
        label: "买下线报",
        outcomes: [
          {
            chance: 1,
            text: "你掌握到寨主行踪，心里有底。",
            effects: {
              gold: -4,
              potential: 14,
              setFlags: { knows_forest_route: true },
              timelineNote: "在酒肆买到黑木寨夜路线报"
            }
          }
        ]
      },
      {
        id: "drink",
        label: "继续听曲",
        outcomes: [
          {
            chance: 1,
            text: "你放松片刻，精神回稳。",
            effects: { hp: 10, qi: 8 }
          }
        ]
      }
    ]
  },
  {
    id: "master_secret_order",
    title: "掌门密令",
    description: "岳掌门压低声音：戌时黑木林有匪首会面，可敢一探？",
    repeatable: false,
    weight: 100,
    conditions: {
      locations: ["huashan_hall"],
      requiresNpc: "master_yue",
      minHour: 19,
      maxHour: 21,
      requiredFlagsAbsent: ["quest_secret_taken", "quest_secret_done"]
    },
    choices: [
      {
        id: "accept",
        label: "领命前往",
        outcomes: [
          {
            chance: 1,
            text: "你接下密令，掌门让你今夜便去。",
            effects: {
              potential: 20,
              exp: 20,
              setFlags: { quest_secret_taken: true },
              relationDelta: { master_yue: 3 }
            }
          }
        ]
      },
      {
        id: "decline",
        label: "暂不涉险",
        outcomes: [
          {
            chance: 1,
            text: "掌门点头，让你再历练几日。",
            effects: { potential: 6 }
          }
        ]
      }
    ]
  },
  {
    id: "secret_order_assault",
    title: "夜探黑木寨",
    description: "你按密令潜入林中，寨主已在火堆旁等候。",
    repeatable: false,
    weight: 120,
    conditions: {
      locations: ["blackwood_forest", "bandit_fort"],
      minHour: 19,
      maxHour: 3,
      requiredFlagsPresent: ["quest_secret_taken"],
      requiredFlagsAbsent: ["quest_secret_done"]
    },
    choices: [
      {
        id: "strike",
        label: "突袭寨主",
        outcomes: [
          {
            chance: 1,
            text: "你身形一纵，刀光骤起。",
            effects: {
              battle: {
                enemyId: "forest_overlord",
                onVictory: {
                  potential: 30,
                  exp: 42,
                  gold: 26,
                  setFlags: { quest_secret_done: true, quest_secret_taken: false },
                  addSkill: "zixia_gong",
                  reputationDelta: {
                    huashan: 8,
                    heimu_bandits: -12,
                    imperial_court: 4
                  }
                },
                onDefeat: {
                  setFlags: { quest_secret_taken: false },
                  reputationDelta: { huashan: -4 }
                }
              }
            }
          }
        ]
      },
      {
        id: "retreat",
        label: "先行撤离",
        outcomes: [
          {
            chance: 1,
            text: "你决定先保全性命，另择时机。",
            effects: { potential: 6 }
          }
        ]
      }
    ]
  },

  {
    id: "kaifeng_bounty_notice",
    title: "开封缉盗榜",
    description: "巡检司张贴新榜：缉拿水路私枭，重赏银两。",
    repeatable: false,
    weight: 95,
    conditions: {
      locations: ["kaifeng_yamen"],
      requiresNpc: "inspector_guo",
      minHour: 7,
      maxHour: 19,
      blockedQuestStates: {
        kaifeng_bounty: ["accepted", "reported", "completed", "failed"]
      }
    },
    choices: [
      {
        id: "accept",
        label: "揭榜领令",
        outcomes: [
          {
            chance: 1,
            text: "郭司巡将暗号牌交给你，命你先摸清暗港。",
            effects: {
              setQuestState: { kaifeng_bounty: "accepted" },
              setFlags: { bounty_token: true },
              exp: 16,
              potential: 16,
              reputationDelta: { imperial_court: 4 },
              relationDelta: { inspector_guo: 3 },
              timelineNote: "接下开封缉盗任务"
            }
          }
        ]
      },
      {
        id: "refuse",
        label: "暂不接榜",
        outcomes: [
          {
            chance: 1,
            text: "你抱拳辞过，司巡神色微冷。",
            effects: { potential: 5, relationDelta: { inspector_guo: -2 } }
          }
        ]
      }
    ]
  },
  {
    id: "smuggler_hideout_raid",
    title: "暗港私枭",
    description: "你追到一处暗港，私枭已在分赃。",
    repeatable: false,
    weight: 130,
    conditions: {
      locationTagsAll: ["bandit", "dock"],
      minHour: 18,
      maxHour: 5,
      requiredQuestStates: {
        kaifeng_bounty: ["accepted", "reported"]
      },
      blockedQuestStates: {
        kaifeng_bounty: ["completed", "failed"]
      }
    },
    choices: [
      {
        id: "raid",
        label: "当场突袭",
        outcomes: [
          {
            chance: 1,
            text: "你破开暗仓，首领拔刀迎战。",
            effects: {
              battle: {
                enemyId: "lake_pirate_leader",
                onVictory: {
                  setQuestState: { kaifeng_bounty: "completed" },
                  removeFlags: ["bounty_token"],
                  reputationDelta: {
                    imperial_court: 10,
                    suzhou_merchants: 4,
                    heimu_bandits: -8
                  },
                  relationDelta: { inspector_guo: 4 },
                  exp: 36,
                  potential: 28,
                  gold: 34,
                  timelineNote: "剿灭暗港私枭，缉盗任务完成"
                },
                onDefeat: {
                  setQuestState: { kaifeng_bounty: "failed" },
                  removeFlags: ["bounty_token"],
                  reputationDelta: { imperial_court: -8 },
                  relationDelta: { inspector_guo: -4 }
                }
              }
            }
          }
        ]
      },
      {
        id: "scout",
        label: "先记下暗线",
        outcomes: [
          {
            chance: 1,
            text: "你按捺杀意，记下船号和接头暗语。",
            effects: {
              setQuestState: { kaifeng_bounty: "reported" },
              potential: 10,
              statGain: { insight: 1 },
              reputationDelta: { imperial_court: 2 },
              timelineNote: "掌握暗港私枭线索并上报"
            }
          }
        ]
      }
    ]
  },
  {
    id: "shaolin_bell_trial",
    title: "晨钟试武",
    description: "钟声甫落，武僧邀你过一遍木人巷规矩。",
    repeatable: true,
    weight: 8,
    conditions: {
      regions: ["shaolin", "songshan"],
      requiresNpcTag: "mentor",
      minHour: 5,
      maxHour: 11
    },
    choices: [
      {
        id: "meditate",
        label: "静坐听钟",
        outcomes: [
          {
            chance: 1,
            text: "你随钟息调息，心神宁定。",
            effects: {
              potential: 16,
              qi: 14,
              statGain: { insight: 1 },
              reputationDelta: { shaolin: 2 },
              relationDelta: { monk_jueyuan: 2 }
            }
          }
        ]
      },
      {
        id: "challenge",
        label: "入巷试手",
        outcomes: [
          {
            chance: 1,
            text: "你踏入木人巷，叛寺武僧突然现身阻拦。",
            effects: {
              battle: {
                enemyId: "shaolin_renegade",
                onVictory: {
                  potential: 20,
                  exp: 22,
                  reputationDelta: { shaolin: 4 },
                  relationDelta: { monk_jueyuan: 3 }
                },
                onDefeat: {
                  reputationDelta: { shaolin: -2 }
                }
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: "wudang_cloud_discourse",
    title: "云台论剑",
    description: "宋道长在峰顶演示借力化劲，邀你试解其中机巧。",
    repeatable: true,
    weight: 9,
    conditions: {
      locations: ["zixiao_hall", "taihe_peak"],
      requiresNpc: "elder_song",
      minHour: 6,
      maxHour: 12
    },
    choices: [
      {
        id: "listen",
        label: "聆听心法",
        outcomes: [
          {
            chance: 1,
            text: "你随其呼吸节律行气，身法愈发轻灵。",
            effects: {
              potential: 14,
              qi: 12,
              statGain: { agility: 1 },
              reputationDelta: { wudang: 3 },
              relationDelta: { elder_song: 2 }
            }
          }
        ]
      },
      {
        id: "seek_secret",
        label: "求授一式",
        outcomes: [
          {
            chance: 0.35,
            text: "宋道长见你用心，破例传你一段轻功提气诀。",
            effects: {
              addSkill: "tiyun_zong",
              potential: 10,
              relationDelta: { elder_song: 3 },
              reputationDelta: { wudang: 2 }
            }
          },
          {
            chance: 0.65,
            text: "道长笑而不答，只让你先去磨基础。",
            effects: { potential: 8 }
          }
        ]
      }
    ]
  },
  {
    id: "suzhou_silk_gamble",
    title: "绸行押货",
    description: "商会急需押一批高价绸缎，押对可获厚利。",
    repeatable: true,
    weight: 10,
    conditions: {
      locations: ["suzhou_market", "water_lane"],
      minHour: 8,
      maxHour: 18
    },
    choices: [
      {
        id: "invest",
        label: "投银押货",
        outcomes: [
          {
            chance: 0.45,
            text: "行情大涨，你顺利分得红利。",
            effects: {
              gold: 24,
              potential: 10,
              reputationDelta: { suzhou_merchants: 3 },
              relationDelta: { ferryman_wu: 2 }
            }
          },
          {
            chance: 0.55,
            text: "货船误期，银票折损。",
            effects: {
              gold: -14,
              potential: 6,
              reputationDelta: { suzhou_merchants: -1 }
            }
          }
        ]
      },
      {
        id: "escort",
        label: "亲自护货",
        outcomes: [
          {
            chance: 1,
            text: "你随船夜行，逼退几拨小贼。",
            effects: {
              exp: 18,
              potential: 14,
              reputationDelta: { suzhou_merchants: 4 },
              relationDelta: { ferryman_wu: 3 }
            }
          }
        ]
      }
    ]
  },
  {
    id: "dali_envoy_request",
    title: "大理求药",
    description: "段公子请你协助寻一味苍山寒草，以救边寨疫患。",
    repeatable: false,
    weight: 90,
    conditions: {
      locations: ["dali_palace"],
      requiresNpc: "prince_duan",
      minHour: 9,
      maxHour: 18,
      blockedQuestStates: {
        dali_medicine: ["accepted", "completed", "failed"]
      }
    },
    choices: [
      {
        id: "accept",
        label: "慨然应下",
        outcomes: [
          {
            chance: 1,
            text: "段公子递来山图和药篓，拜托你即刻动身。",
            effects: {
              setQuestState: { dali_medicine: "accepted" },
              reputationDelta: { dali_royal: 5 },
              relationDelta: { prince_duan: 3, healer_xue: 1 },
              potential: 16,
              timelineNote: "接下大理寻药之托"
            }
          }
        ]
      },
      {
        id: "decline",
        label: "婉言推辞",
        outcomes: [
          {
            chance: 1,
            text: "段公子轻叹，表示理解。",
            effects: { relationDelta: { prince_duan: -2 }, potential: 4 }
          }
        ]
      }
    ]
  },
  {
    id: "cangshan_herb_hunt",
    title: "苍山采药",
    description: "山雾渐沉，药草只在短暂时刻露叶。",
    repeatable: false,
    weight: 110,
    conditions: {
      locations: ["cangshan_trail", "monkey_valley"],
      requiredQuestStates: {
        dali_medicine: "accepted"
      },
      blockedQuestStates: {
        dali_medicine: ["completed", "failed"]
      },
      minHour: 5,
      maxHour: 17
    },
    choices: [
      {
        id: "careful_pick",
        label: "按图细采",
        outcomes: [
          {
            chance: 0.72,
            text: "你依地势寻得寒草，药性完好。",
            effects: {
              setQuestState: { dali_medicine: "completed" },
              reputationDelta: { dali_royal: 8, emei: 2 },
              relationDelta: { healer_xue: 4, prince_duan: 3 },
              exp: 28,
              potential: 24,
              timelineNote: "采得苍山寒草并送回大理"
            }
          },
          {
            chance: 0.28,
            text: "山雨骤至，你只采到半数药材。",
            effects: {
              setQuestState: { dali_medicine: "failed" },
              hp: -16,
              potential: 8,
              reputationDelta: { dali_royal: -3 }
            }
          }
        ]
      },
      {
        id: "force_route",
        label: "冒险抄近路",
        outcomes: [
          {
            chance: 0.45,
            text: "你穿险崖而过，虽狼狈却及时采得药材。",
            effects: {
              setQuestState: { dali_medicine: "completed" },
              hp: -10,
              exp: 32,
              potential: 20,
              reputationDelta: { dali_royal: 6 }
            }
          },
          {
            chance: 0.55,
            text: "碎石滚落，你负伤失手，药篓尽毁。",
            effects: {
              setQuestState: { dali_medicine: "failed" },
              hp: -24,
              reputationDelta: { dali_royal: -4 }
            }
          }
        ]
      }
    ]
  },
  {
    id: "taishan_sword_duel",
    title: "岱顶论锋",
    description: "绝壁剑客邀你拂晓一战，只论剑意不论门第。",
    repeatable: true,
    weight: 8,
    conditions: {
      regions: ["taishan"],
      minHour: 5,
      maxHour: 13
    },
    choices: [
      {
        id: "duel",
        label: "应战",
        outcomes: [
          {
            chance: 1,
            text: "你与剑客踏云换位，杀招频出。",
            effects: {
              battle: {
                enemyId: "mountain_swordsman",
                onVictory: {
                  exp: 26,
                  potential: 22,
                  reputationDelta: { neutral_wulin: 4 }
                }
              }
            }
          }
        ]
      },
      {
        id: "watch",
        label: "旁观悟招",
        outcomes: [
          {
            chance: 1,
            text: "你不急出手，先记下其换气节奏。",
            effects: { potential: 16, statGain: { insight: 1 } }
          }
        ]
      }
    ]
  },
  {
    id: "emei_relief_caravan",
    title: "峨眉赈粮",
    description: "静心师太请求你护送一批赈粮前往襄阳。",
    repeatable: true,
    weight: 7,
    conditions: {
      locations: ["nunnery_hall", "xiangyang_wall"],
      requiresAnyNpc: ["nun_jingxin", "tactician_ye"],
      requiredReputationMin: {
        emei: 0
      },
      minHour: 7,
      maxHour: 20
    },
    choices: [
      {
        id: "escort",
        label: "护送赈粮",
        outcomes: [
          {
            chance: 1,
            text: "你沿途压住宵小，粮车顺利入城。",
            effects: {
              exp: 20,
              potential: 16,
              reputationDelta: { emei: 4, xiangyang_guard: 3 },
              relationDelta: { nun_jingxin: 2, tactician_ye: 2 }
            }
          }
        ]
      },
      {
        id: "donate",
        label: "捐银助粮",
        outcomes: [
          {
            chance: 1,
            text: "你解囊相助，师太合十致谢。",
            effects: { gold: -12, potential: 12, reputationDelta: { emei: 3 }, morality: 2 }
          }
        ]
      }
    ]
  },
  {
    id: "blackmarket_poison_trade",
    title: "黑市毒货",
    description: "暗渠中有人兜售奇毒，买家需先交投名。",
    repeatable: true,
    weight: 6,
    conditions: {
      locationTags: ["underworld", "smuggle"],
      minHour: 19,
      maxHour: 3,
      requiredReputationMin: {
        heimu_bandits: 0
      }
    },
    choices: [
      {
        id: "deal",
        label: "掏银交易",
        outcomes: [
          {
            chance: 0.6,
            text: "你换到一批暗器毒囊，黑市开始认你。",
            effects: {
              gold: -14,
              potential: 18,
              reputationDelta: { heimu_bandits: 4, imperial_court: -2 }
            }
          },
          {
            chance: 0.4,
            text: "对方翻脸黑吃黑，你仓促迎敌。",
            effects: {
              battle: {
                enemyId: "poison_trader",
                onVictory: {
                  gold: 12,
                  reputationDelta: { heimu_bandits: 2 }
                }
              }
            }
          }
        ]
      },
      {
        id: "seize",
        label: "反手缉拿",
        outcomes: [
          {
            chance: 1,
            text: "你当场掀桌，毒商拔针迎战。",
            effects: {
              battle: {
                enemyId: "poison_trader",
                onVictory: {
                  exp: 24,
                  potential: 14,
                  reputationDelta: { imperial_court: 5, heimu_bandits: -6 }
                }
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: "wudang_taiji_transmission",
    title: "太极真传",
    description: "张三丰缓缓起势，问你可愿舍快求圆，先守后发。",
    repeatable: false,
    weight: 140,
    conditions: {
      locations: ["zixiao_hall", "taihe_peak"],
      requiresNpc: "zhang_sanfeng",
      requiredRelationMin: {
        zhang_sanfeng: 6
      },
      requiredFlagsAbsent: ["taiji_legacy_done"],
      minHour: 6,
      maxHour: 13
    },
    choices: [
      {
        id: "accept",
        label: "叩首求教",
        outcomes: [
          {
            chance: 0.7,
            text: "张真人点头传你拳意，叮嘱先养心再伤敌。",
            effects: {
              addSkill: "taiji_quan",
              potential: 24,
              relationDelta: { zhang_sanfeng: 4 },
              reputationDelta: { wudang: 8 },
              setFlags: { taiji_legacy_done: true },
              timelineNote: "获授武当太极拳真传"
            }
          },
          {
            chance: 0.3,
            text: "你悟得剑势流转之理，剑意较拳意更为贴合。",
            effects: {
              addSkill: "taiji_jian",
              potential: 22,
              relationDelta: { zhang_sanfeng: 3 },
              reputationDelta: { wudang: 6 },
              setFlags: { taiji_legacy_done: true },
              timelineNote: "于武当领悟太极剑理"
            }
          }
        ]
      },
      {
        id: "decline",
        label: "先去磨基",
        outcomes: [
          {
            chance: 1,
            text: "张真人含笑不语，只让你再观云一日。",
            effects: { potential: 10, relationDelta: { zhang_sanfeng: 1 } }
          }
        ]
      }
    ]
  },
  {
    id: "dugu_reef_trial",
    title: "孤峰问剑",
    description: "独孤求败立于礁石，冷声道：想学，先证明你能破我影剑。",
    repeatable: false,
    weight: 150,
    conditions: {
      locations: ["trial_reef"],
      requiresNpc: "dugu_qiubai",
      requiredRelationMin: {
        dugu_qiubai: 5
      },
      requiredFlagsAbsent: ["dugu_trial_done"],
      minHour: 5,
      maxHour: 19
    },
    choices: [
      {
        id: "duel",
        label: "拔剑应试",
        outcomes: [
          {
            chance: 1,
            text: "你凝神迎敌，礁上剑影骤起。",
            effects: {
              battle: {
                enemyId: "sword_specter",
                onVictory: {
                  addSkill: "dugu_jiujian",
                  exp: 56,
                  potential: 46,
                  relationDelta: { dugu_qiubai: 6 },
                  reputationDelta: { jianghu_knights: 8 },
                  setFlags: { dugu_trial_done: true },
                  timelineNote: "礁上问剑得独孤九剑真意"
                },
                onDefeat: {
                  relationDelta: { dugu_qiubai: -2 },
                  potential: 8
                }
              }
            }
          }
        ]
      },
      {
        id: "observe",
        label: "静观剑路",
        outcomes: [
          {
            chance: 1,
            text: "你未急于出手，先将其换劲节律记在心中。",
            effects: { potential: 20, relationDelta: { dugu_qiubai: 2 }, statGain: { insight: 1 } }
          }
        ]
      }
    ]
  },
  {
    id: "taohua_formation_lesson",
    title: "桃花迷阵",
    description: "桃林花雨迷眼，阵势暗合奇门八卦。",
    repeatable: true,
    weight: 10,
    conditions: {
      locations: ["taohua_villa", "peach_blossom_woods"],
      requiresAnyNpc: ["huang_yaoshi", "zhou_botong"],
      minHour: 7,
      maxHour: 20
    },
    choices: [
      {
        id: "break_array",
        label: "入阵破局",
        outcomes: [
          {
            chance: 1,
            text: "阵眼转动，你踏错半步便被守阵人截住。",
            effects: {
              battle: {
                enemyId: "taohua_guardian",
                onVictory: {
                  potential: 26,
                  exp: 28,
                  reputationDelta: { taohua_school: 5 },
                  relationDelta: { huang_yaoshi: 2, zhou_botong: 2 }
                }
              }
            }
          }
        ]
      },
      {
        id: "learn_step",
        label: "记步悟理",
        outcomes: [
          {
            chance: 0.35,
            text: "你循步法往复，竟悟得一门奇异身法。",
            effects: {
              addSkill: "lingbo_weibu",
              potential: 16,
              relationDelta: { huang_yaoshi: 2 },
              reputationDelta: { taohua_school: 3 }
            }
          },
          {
            chance: 0.65,
            text: "你虽未悟绝艺，却摸清了桃阵的进退门路。",
            effects: { potential: 14, statGain: { insight: 1 }, relationDelta: { zhou_botong: 1 } }
          }
        ]
      }
    ]
  },
  {
    id: "xiangyang_dragon_discourse",
    title: "降龙演武",
    description: "郭靖在校场示掌，掌风沉雄如雷。",
    repeatable: false,
    weight: 125,
    conditions: {
      locations: ["xiangyang_wall", "martial_square"],
      requiresNpc: "guo_jing",
      requiredRelationMin: {
        guo_jing: 5
      },
      requiredFlagsAbsent: ["xianglong_taught"],
      minHour: 8,
      maxHour: 18
    },
    choices: [
      {
        id: "learn",
        label: "请教掌法",
        outcomes: [
          {
            chance: 1,
            text: "郭靖让你先稳马步，再一掌一掌拆解劲路。",
            effects: {
              addSkill: "xianglong_shibazhang",
              potential: 28,
              exp: 24,
              relationDelta: { guo_jing: 4, huang_rong: 2 },
              reputationDelta: { xiangyang_guard: 6 },
              setFlags: { xianglong_taught: true },
              timelineNote: "在襄阳校场得郭靖指点降龙掌"
            }
          }
        ]
      },
      {
        id: "patrol",
        label: "先随军巡防",
        outcomes: [
          {
            chance: 1,
            text: "你随郭靖巡城一周，见识到守军日常艰辛。",
            effects: { exp: 18, potential: 14, relationDelta: { guo_jing: 2 }, reputationDelta: { xiangyang_guard: 3 } }
          }
        ]
      }
    ]
  },
  {
    id: "bright_peak_secret_art",
    title: "光明圣火试炼",
    description: "张无忌命护法与你过招：若能守心破势，便可阅挪移秘卷。",
    repeatable: false,
    weight: 130,
    conditions: {
      locations: ["bright_peak", "mingjiao_altar"],
      requiresNpc: "zhang_wuji",
      requiredRelationMin: {
        zhang_wuji: 4
      },
      requiredReputationMin: {
        mingjiao: 2
      },
      requiredFlagsAbsent: ["qiankun_secret_done"],
      minHour: 9,
      maxHour: 22
    },
    choices: [
      {
        id: "trial",
        label: "接受试炼",
        outcomes: [
          {
            chance: 1,
            text: "圣火高燃，护法起手便以大挪移借力压来。",
            effects: {
              battle: {
                enemyId: "mingjiao_champion",
                onVictory: {
                  addSkill: "qiankun_danuoyi",
                  exp: 48,
                  potential: 38,
                  relationDelta: { zhang_wuji: 4 },
                  reputationDelta: { mingjiao: 10 },
                  setFlags: { qiankun_secret_done: true },
                  timelineNote: "通过光明顶试炼获乾坤大挪移"
                },
                onDefeat: {
                  potential: 10,
                  relationDelta: { zhang_wuji: -1 }
                }
              }
            }
          }
        ]
      },
      {
        id: "meditate",
        label: "静坐观火",
        outcomes: [
          {
            chance: 1,
            text: "你未贸然争胜，先以九阳运息稳固根基。",
            effects: { qi: 20, potential: 16, relationDelta: { zhang_wuji: 1 } }
          }
        ]
      }
    ]
  },
  {
    id: "heimuya_power_struggle",
    title: "黑木崖暗斗",
    description: "崖上权争骤起，任我行与东方不败旧部火并在即。",
    repeatable: true,
    weight: 9,
    conditions: {
      locations: ["heimu_cliff", "riyue_hall", "abyss_path"],
      requiresAnyNpc: ["ren_woxing", "dongfang_bubai"],
      minHour: 18,
      maxHour: 4
    },
    choices: [
      {
        id: "join_fight",
        label: "卷入厮杀",
        outcomes: [
          {
            chance: 1,
            text: "崖顶火把摇曳，日月长老率众向你逼来。",
            effects: {
              battle: {
                enemyId: "riyue_elder",
                onVictory: {
                  exp: 42,
                  potential: 30,
                  reputationDelta: { riyue_cult: 6, imperial_court: -2 },
                  relationDelta: { ren_woxing: 2, dongfang_bubai: 1 }
                },
                onDefeat: {
                  reputationDelta: { riyue_cult: -3 }
                }
              }
            }
          }
        ]
      },
      {
        id: "absorb",
        label: "趁乱夺功",
        outcomes: [
          {
            chance: 0.28,
            text: "你逆运真气，竟从散乱掌劲中悟出吞吸法门。",
            effects: { addSkill: "xixing_dafa", potential: 18, reputationDelta: { riyue_cult: 4 } }
          },
          {
            chance: 0.72,
            text: "你强行运功险些走火，幸而及时收势。",
            effects: { hp: -20, qi: -16, potential: 10 }
          }
        ]
      }
    ]
  }
];
