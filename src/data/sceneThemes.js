export const DEFAULT_SCENE_THEME_ID = "default";

export const sceneThemes = {
  default: {
    id: "default",
    name: "江湖场景",
    mood: "风声过处，草木皆有故事。",
    hudHint: "方向键移动，点击人物互动；点击观察点可耗时侦察。",
    musicProfileId: "jianghu_roam"
  },
  market: {
    id: "market",
    name: "长安市井",
    mood: "叫卖声、铜钱碰响与茶香混在一起，巷口人流始终不散。",
    hudHint: "人潮正盛：方向键穿行市集，点摊位人物与观察点收集江湖风声。",
    musicProfileId: "market_bustle"
  },
  magistrate_square: {
    id: "magistrate_square",
    name: "汴梁公廨",
    mood: "衙鼓时起，巡役往来，街巷里连耳语都带着公文味。",
    hudHint: "注意告示与巡防线：方向键移动，点人物周旋，点公廨设施打探线索。",
    musicProfileId: "magistrate_watch"
  },
  temple_courtyard: {
    id: "temple_courtyard",
    name: "少林禅院",
    mood: "晨钟暮鼓未歇，檀香与松风交叠，步子也不由放慢。",
    hudHint: "沿石阶与回廊移动，和僧众论武问道；观察香炉与钟架可推进时辰。",
    musicProfileId: "temple_zen"
  }
};

const sceneThemeIds = new Set(Object.keys(sceneThemes));

export function isSceneThemeId(themeId) {
  return isNonEmptyString(themeId) && sceneThemeIds.has(themeId);
}

export function normalizeSceneThemeId(themeId) {
  if (isSceneThemeId(themeId)) {
    return themeId;
  }
  return DEFAULT_SCENE_THEME_ID;
}

export function getSceneTheme(themeId) {
  return sceneThemes[normalizeSceneThemeId(themeId)];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
