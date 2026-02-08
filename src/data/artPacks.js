const demoAsset = (relativePath) => new URL(`../assets/artpacks/wuxia-demo/${relativePath}`, import.meta.url).href;

export const DEFAULT_ART_PACK_ID = "procedural";

const artPacks = {
  procedural: {
    id: "procedural",
    name: "内置写意线描",
    version: "1.0.0",
    license: "Built-in",
    source: "Project internal procedural renderer",
    themes: {
      default: { renderer: "procedural" },
      market: { renderer: "procedural" },
      magistrate_square: { renderer: "procedural" },
      temple_courtyard: { renderer: "procedural" }
    },
    characters: {
      mode: "procedural"
    },
    ui: {
      bookAccent: "#ffe5a6",
      logAccent: "#f5c67f"
    }
  },
  wuxia_pack_demo: {
    id: "wuxia_pack_demo",
    name: "武侠像素演示包",
    version: "0.1.0",
    license: "CC0 + Internal Demo Mix",
    source: "Local demo pack (replaceable by licensed packs)",
    themes: {
      default: {
        renderer: "sprite",
        sceneBackground: demoAsset("scenes/default-bg.svg"),
        obstacleSprites: {
          default: demoAsset("props/obstacle-default.svg")
        },
        exitSprites: {
          default: demoAsset("props/exit-default.svg")
        },
        poiSprites: {
          default: demoAsset("props/poi-default.svg")
        }
      },
      market: {
        renderer: "sprite",
        sceneBackground: demoAsset("scenes/market-bg.svg"),
        obstacleSprites: {
          "stall.cloth": demoAsset("props/stall-cloth.svg"),
          "stall.herb": demoAsset("props/stall-herb.svg"),
          "stall.weapon": demoAsset("props/stall-weapon.svg"),
          "stall.goods": demoAsset("props/stall-goods.svg"),
          "stall.tea_table": demoAsset("props/tea-table.svg"),
          default: demoAsset("props/obstacle-default.svg")
        },
        exitSprites: {
          "exit.city_gate": demoAsset("props/exit-city-gate.svg"),
          "exit.inn": demoAsset("props/exit-inn.svg"),
          "exit.wharf": demoAsset("props/exit-wharf.svg"),
          "exit.official_road": demoAsset("props/exit-road.svg"),
          "exit.market_street": demoAsset("props/exit-street.svg"),
          default: demoAsset("props/exit-default.svg")
        },
        poiSprites: {
          "poi.notice_board": demoAsset("props/poi-notice.svg"),
          "poi.tea_stall": demoAsset("props/poi-tea.svg"),
          default: demoAsset("props/poi-default.svg")
        }
      },
      magistrate_square: {
        renderer: "sprite",
        sceneBackground: demoAsset("scenes/magistrate-bg.svg"),
        obstacleSprites: {
          "obstacle.yamen_gate": demoAsset("props/yamen-gate.svg"),
          "obstacle.drum_tower": demoAsset("props/drum-tower.svg"),
          "obstacle.patrol_booth": demoAsset("props/patrol-booth.svg"),
          "obstacle.archive_cart": demoAsset("props/archive-cart.svg"),
          "obstacle.river_crates": demoAsset("props/river-crates.svg"),
          default: demoAsset("props/obstacle-default.svg")
        },
        exitSprites: {
          "exit.west_road": demoAsset("props/exit-road.svg"),
          "exit.yamen": demoAsset("props/exit-yamen.svg"),
          "exit.wharf": demoAsset("props/exit-wharf.svg"),
          "exit.archive": demoAsset("props/exit-archive.svg"),
          default: demoAsset("props/exit-default.svg")
        },
        poiSprites: {
          "poi.warrant_wall": demoAsset("props/poi-warrant.svg"),
          "poi.yamen_drum": demoAsset("props/poi-drum.svg"),
          "poi.river_manifest": demoAsset("props/poi-manifest.svg"),
          default: demoAsset("props/poi-default.svg")
        }
      },
      temple_courtyard: {
        renderer: "sprite",
        sceneBackground: demoAsset("scenes/temple-bg.svg"),
        obstacleSprites: {
          "obstacle.buddha_hall": demoAsset("props/buddha-hall.svg"),
          "obstacle.incense_cauldron": demoAsset("props/incense-cauldron.svg"),
          "obstacle.pine_cluster": demoAsset("props/pine-cluster.svg"),
          "obstacle.scripture_table": demoAsset("props/scripture-table.svg"),
          "obstacle.training_rack": demoAsset("props/training-rack.svg"),
          default: demoAsset("props/obstacle-default.svg")
        },
        exitSprites: {
          "exit.temple_gate": demoAsset("props/exit-temple-gate.svg"),
          "exit.sutra_pavilion": demoAsset("props/exit-sutra.svg"),
          "exit.wood_lane": demoAsset("props/exit-lane.svg"),
          default: demoAsset("props/exit-default.svg")
        },
        poiSprites: {
          "poi.bell_frame": demoAsset("props/poi-bell.svg"),
          "poi.incense_basin": demoAsset("props/poi-incense.svg"),
          "poi.meditation_mat": demoAsset("props/poi-meditation.svg"),
          default: demoAsset("props/poi-default.svg")
        }
      }
    },
    characters: {
      playerToken: demoAsset("characters/player.svg"),
      npcToken: demoAsset("characters/npc.svg"),
      selectedRing: demoAsset("characters/selected-ring.svg")
    },
    ui: {
      bookStamp: demoAsset("ui/book-stamp.svg"),
      bookAccent: "#ffdf9c",
      logAccent: "#f6c47b"
    }
  }
};

const artPackIds = Object.keys(artPacks);

export function listArtPacks() {
  return artPackIds.map((id) => artPacks[id]);
}

export function getArtPack(packId) {
  if (!isNonEmptyString(packId)) {
    return null;
  }
  return artPacks[packId] || null;
}

export function resolveArtPack(packId) {
  return getArtPack(packId) || artPacks[DEFAULT_ART_PACK_ID];
}

export function isArtPackId(packId) {
  return Boolean(getArtPack(packId));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
