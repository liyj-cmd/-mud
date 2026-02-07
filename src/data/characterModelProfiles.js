export const baseCharacterModelProfile = {
  silhouette: {
    height: 42,
    shoulderWidth: 16,
    hemWidth: 20,
    lineWidth: 2.2,
    headRadius: 8,
    shadowRadius: 17
  },
  palette: {
    line: "#17263a",
    skin: "#f0d8bb",
    robe: "#58779a",
    trim: "#d6bc8a",
    accent: "#9fd1ff",
    glow: "#f6d88f",
    nameplate: "#ddeeff"
  },
  motion: {
    bob: 1.2
  },
  hairStyle: "topknot",
  headwear: "none",
  accessory: "none",
  emblem: "none"
};

export const factionCharacterModelProfiles = {
  huashan: {
    palette: {
      robe: "#5d768f",
      trim: "#dcb98a"
    },
    accessory: "sword"
  },
  imperial_court: {
    palette: {
      robe: "#536783",
      trim: "#d7c18e",
      accent: "#afc8ea"
    },
    headwear: "official_cap"
  },
  suzhou_merchants: {
    palette: {
      robe: "#7f5f3f",
      trim: "#efca8f",
      accent: "#ffdda6"
    },
    headwear: "cap"
  },
  neutral_wulin: {
    palette: {
      robe: "#6f6076",
      trim: "#d6be92"
    }
  },
  shaolin: {
    palette: {
      robe: "#7d663f",
      trim: "#e6d5af",
      accent: "#f0ddb3",
      glow: "#f5dba0"
    },
    hairStyle: "bald",
    accessory: "beads",
    emblem: "lotus"
  },
  gumu: {
    palette: {
      robe: "#60728d",
      trim: "#d6dff0"
    },
    hairStyle: "long"
  },
  heimu_bandits: {
    palette: {
      robe: "#574540",
      trim: "#b99374",
      accent: "#dda184",
      glow: "#e89a79"
    },
    headwear: "hood"
  }
};

export const roleCharacterModelProfiles = [
  {
    keyword: "掌门",
    profile: {
      silhouette: {
        height: 44,
        hemWidth: 22
      },
      accessory: "sword",
      emblem: "crest"
    }
  },
  {
    keyword: "掌柜",
    profile: {
      headwear: "cap",
      accessory: "abacus"
    }
  },
  {
    keyword: "商贩",
    profile: {
      headwear: "straw_hat",
      accessory: "ledger"
    }
  },
  {
    keyword: "捕头",
    profile: {
      accessory: "spear",
      headwear: "official_cap"
    }
  },
  {
    keyword: "巡检",
    profile: {
      accessory: "scroll",
      headwear: "official_cap",
      emblem: "crest"
    }
  },
  {
    keyword: "首座",
    profile: {
      silhouette: {
        height: 45
      },
      accessory: "staff",
      emblem: "lotus"
    }
  },
  {
    keyword: "小僧",
    profile: {
      hairStyle: "bald",
      accessory: "lantern"
    }
  },
  {
    keyword: "道人",
    profile: {
      accessory: "whisk",
      headwear: "headband"
    }
  }
];

export const tagCharacterModelProfiles = {
  mentor: {
    silhouette: {
      height: 44
    },
    emblem: "crest"
  },
  leader: {
    accessory: "cloak"
  },
  guard: {
    accessory: "spear"
  },
  merchant: {
    headwear: "cap"
  },
  court: {
    headwear: "official_cap"
  },
  quest: {
    emblem: "badge"
  }
};

export const npcCharacterModelOverrides = {
  merchant_zhou: {
    headwear: "straw_hat",
    accessory: "ledger",
    palette: {
      robe: "#8e623e",
      trim: "#f0cf97"
    }
  },
  innkeeper_tong: {
    accessory: "abacus",
    headwear: "cap",
    palette: {
      robe: "#6e4f3c",
      trim: "#e8c695"
    }
  },
  constable_lei: {
    accessory: "spear",
    headwear: "official_cap",
    emblem: "badge",
    palette: {
      robe: "#485a72",
      trim: "#d6be8f"
    }
  },
  inspector_guo: {
    accessory: "scroll",
    headwear: "official_cap",
    emblem: "crest",
    silhouette: {
      height: 45,
      shoulderWidth: 17
    }
  },
  monk_jueyuan: {
    accessory: "staff",
    hairStyle: "bald",
    headwear: "none"
  },
  novice_hui: {
    accessory: "lantern",
    hairStyle: "bald"
  }
};

export const playerCharacterModelProfile = {
  silhouette: {
    height: 43,
    shoulderWidth: 17,
    hemWidth: 22,
    shadowRadius: 18
  },
  palette: {
    robe: "#b98f49",
    trim: "#f5dda0",
    accent: "#f8de7b",
    glow: "#f8df84",
    nameplate: "#ffe9b7"
  },
  accessory: "sword",
  emblem: "hero"
};
