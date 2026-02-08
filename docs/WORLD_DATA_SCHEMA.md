# WORLD DATA SCHEMA

## 命名与 ID 规则
- 全部使用小写蛇形：`town_gate`, `master_yue`, `quest_secret_done`
- ID 一旦上线，不随意重命名。
- 若必须替换 ID：
  - 增加兼容映射
  - 更新所有引用
  - 记录到 `CHANGELOG.md` 和 `docs/HANDOFF.md`

## 地图（`src/data/map.js`）
### `mapRegions[]`
- `id` 区域唯一 ID
- `name` 区域名
- `x`, `y` 世界地图位置（0-100）
- `description` 区域说明
- `mapBackdrop` 背景配置：
  - `image`
  - `overlay`（可选）
  - `position`（可选）
  - `size`（可选）

### `mapNodes[]`
- `id` 地点唯一 ID
- `name`
- `type`（城镇/门派/野外/秘境等）
- `regionId` 所属区域
- `grid.col`, `grid.row` 小地图相对坐标
- `tags[]` 地点标签（用于事件条件）
- `description`
- `sceneBackdrop`（可选，地点级背景，优先级高于区域背景）：
  - `image`
  - `overlay`（可选）
  - `position`（可选）
  - `size`（可选）

### `mapEdges[]`
- `[fromNodeId, toNodeId]` 无向边
- 必须保证两端节点都存在

## 节点场景配置（`src/data/nodeScenes.js`）
### `nodeScenes[]`
- `nodeId`：绑定的地点 ID（必须存在于 `mapNodes`）
- `themeId`（可选）：场景主题 ID（见 `src/data/sceneThemes.js`，例如 `market` / `magistrate_square` / `temple_courtyard`）
- `size.width`, `size.height`：逻辑画布尺寸
- `spawn`：主角进入场景时的初始位置（`x`, `y`）
- `obstacles[]`：矩形阻挡体（`id`, `x`, `y`, `width`, `height`）
  - `visualKey`（可选）：场景美术语义键（例如 `stall.weapon`），供素材包渲染器读取
- `exits[]`：矩形出口区域
  - `id`, `label`
  - `toNodeId`：点击后前往的地点 ID
  - `x`, `y`, `width`, `height`
  - `visualKey`（可选）：出口语义键（例如 `exit.city_gate`）
- `npcAnchors`：NPC 场景锚点（键为 `npcId`，值为 `{ x, y }`）
- `pois[]`（可选）：观察点
  - `id`, `label`, `x`, `y`
  - `visualKey`（可选）：观察点语义键（例如 `poi.notice_board`）
  - `radius`（可选）
  - `timeCost`（可选，默认 5 分钟）
  - `logText`（可选）

### 场景接口
- `getNodeSceneById(nodeId)`：读取地点对应场景，不存在返回 `null`
- `hasNodeScene(nodeId)`：是否存在场景配置

## 场景主题（`src/data/sceneThemes.js`）
- `sceneThemes[themeId]`
  - `id`, `name`
  - `mood`：场景介绍文案（用于地图信息面板）
  - `hudHint`：场景 HUD 操作提示
  - `musicProfileId`（可选）：场景背景乐配置 ID（见 `src/data/ambientMusicProfiles.js`）
- `normalizeSceneThemeId(themeId)`：归一化主题 ID，非法值回落到 `default`
- `getSceneTheme(themeId)`：获取主题配置

## 美术包（`src/data/artPacks.js`）
- `artPack`
  - `id`, `name`, `version`, `license`, `source`
  - `themes[themeId]`
    - `renderer`：`procedural` 或 `sprite`
    - `sceneBackground`（可选）
    - `obstacleSprites` / `exitSprites` / `poiSprites`（可选，键为 `visualKey`）
  - `characters`（可选）：`playerToken` / `npcToken` / `selectedRing`
  - `ui`（可选）：HUD/册子素材与配色信息
- 接口
  - `DEFAULT_ART_PACK_ID`
  - `listArtPacks()`
  - `getArtPack(packId)`
  - `resolveArtPack(packId)`：非法值自动回退默认包

## 场景背景乐（`src/data/ambientMusicProfiles.js` + `src/systems/ambientAudio.js`）
- `ambientMusicProfiles[profileId]`
  - `id`, `name`
  - `tempoBpm`：节拍速度
  - `targetGain`：目标音量（0~1）
  - `drone[]`（可选）：持续底音层（`freqHz`/`wave`/`gain`/`detuneCents`）
  - `wind`（可选）：环境噪声层（`gain`/`lowpassHz`/`wobbleHz`/`wobbleDepthHz`）
  - `pulse`（可选）：节奏层（`wave`/`freqHz`/`stepBeats`/`durationBeats`/`gain`/`pattern[]`）
  - `lead`（可选）：旋律层（`wave`/`stepBeats`/`durationBeats`/`gain`/`scaleHz[]`/`sequence[]`）
- `normalizeAmbientMusicProfileId(profileId)`：归一化背景乐 ID，非法值回落到默认
- `getAmbientMusicProfile(profileId)`：读取背景乐配置
- 运行时 `createAmbientAudioDirector`：负责自动切曲、淡入淡出、静音开关与浏览器音频解锁

## 人物建模（`src/data/characterModelProfiles.js` + `src/runtime/characterModelRuntime.js`）
### 数据配置
- `baseCharacterModelProfile`：人物基础骨架、配色、头饰、配件模板
- `factionCharacterModelProfiles[factionId]`：门派/阵营外观覆写
- `roleCharacterModelProfiles[]`：按 `role` 关键词应用建模覆写
- `tagCharacterModelProfiles[tag]`：按标签叠加建模特征
- `npcCharacterModelOverrides[npcId]`：特定 NPC 精细覆写
- `playerCharacterModelProfile`：主角默认建模模板

### 运行时接口
- `buildNpcCharacterModel(npc)`：按“基础 -> 阵营 -> 身份 -> 标签 -> 角色覆写”解析 NPC 模型
- `buildPlayerCharacterModel(player)`：解析主角模型（支持按阵营倾向调整配色）

## NPC（`src/data/npcs.js`）
### `npcs[]`
- `id`, `name`, `role`
- `factionId`
- `home`
- `tags[]`
- `affinityOnTalk`（每次交谈关系变化）
- `relationshipSeeds[]`
- `questHooks[]`
- `schedule[]`：`from`/`to`/`location`/`action`
- `talks[]`

## 武学（`src/data/martialArts.js`）
### `martialArts[]`
- `id`, `name`, `slot`, `quality`, `description`
- `baseBonuses` / `growth`：
  - `attack`, `hit`, `dodge`, `block`
  - `parry`（拆招）
  - `break`（破招）
  - `crit`（暴击倾向）
  - `speed`（节奏/先手）
  - `hp`, `qi`
- `moves[]`：支持字符串或结构化对象
  - `name`, `style`
  - `damageRate`, `hitBonus`, `dodgeBonus`, `blockBonus`
  - `parryBonus`, `breakBonus`, `critBonus`, `speedBonus`
  - `qiCost`, `tags[]`

### `starterSkillIds`
- `fist`, `weapon`, `internal`, `qinggong`

## NPC 武学配置（`src/data/npcMartialLoadouts.js`）
### 设计原则
- NPC 基础信息与武学配置解耦：`npcs.js` 只管人物身份与行为，不直接写武学列表。
- 新角色创建后，通过独立配置系统分配四槽武学。
- 支持“门派模板 + 标签加成 + NPC 覆写”组合，避免写死在角色主体数据里。

### 核心结构
- `factionMartialTemplates`：按 `factionId` 提供默认四槽武学模板。
- `tagMartialTemplates`：按标签（如 `mentor` / `legend`）提供等级加成规则。
- `npcMartialLoadoutOverrides`：对特定 NPC 进行精细覆写（如张三丰、独孤求败）。
- `getNpcMartialLoadout(npcId)`：返回最终解析后的配置：
  - `realm`
  - `slots.fist|weapon|internal|qinggong`
  - `skillLevels`
  - `extraSkills`（非当前槽位但已掌握）

### 兼容要求
- 旧技能 ID 不可删除，新增技能仅追加。
- `computeSkillBonuses` 必须返回全套武学属性键，避免战斗层出现 `undefined`。

## 事件（`src/data/events.js`）
### 基本字段
- `id`, `title`, `description`
- `repeatable`
- `weight`
- `conditions`
- `choices[]`

### 条件（`conditions`）
支持：
- 地点/区域：`locations`, `regions`
- 标签：`locationTags`, `locationTagsAll`
- 时间：`minHour`, `maxHour`, `minDay`, `maxDay`
- NPC：`requiresNpc`, `requiresAnyNpc`, `requiresNpcTag`, `requiresNpcTagsAll`
- 对齐：`requiredAlignment`
- 玩家旗标：`requiredFlagsPresent`, `requiredFlagsAbsent`
- 世界旗标：`requiredWorldFlagsPresent`, `requiredWorldFlagsAbsent`
- 任务状态：`requiredQuestStates`, `blockedQuestStates`
- 声望：`requiredReputationMin`, `requiredReputationMax`
- 关系：`requiredRelationMin`, `requiredRelationMax`

### 效果（`effects`）
支持：
- 基础数值：`gold`, `hp`, `qi`, `exp`, `potential`, `morality`
- 旗标：`setFlags`, `removeFlags`, `setWorldFlags`
- 增益：`statGain`, `addSkill`
- 社会关系：`reputationDelta`, `relationDelta`
- 任务：`setQuestState`, `advanceQuest`
- 世界文本演进：`timelineNote`, `setChapter`
- 战斗：`battle`（含 `enemyId` 或 `npcId`，以及 `onVictory` / `onDefeat`）

## NPC 交互配置（`src/data/npcInteractionProfiles.js`）
### 核心结构
- `npcInteractionProfiles[npcId]`（可选覆写）
  - `teachableSkills[]`：可传授武学（`skillId`/`relationMin`/`potentialCost`）
  - `steal`：行窃规则（`enabled`/`difficulty`/惩罚/`loot[]`）
  - `combat`：切磋规则（`enabled`/`tier`/`rewardScale`）
- `getNpcInteractionProfile(npcId)`：合并默认规则与覆写后返回最终交互配置

## 物品（`src/data/items.js`）
- `items[itemId]`
  - `id`, `name`, `type`, `value`, `description`
- 由 NPC 行窃、后续交易/任务系统复用

## 阵营（`src/data/factions.js`）
- `id`, `name`, `description`, `defaultReputation`
- 声望范围约束：`-100 ~ 100`

## 敌人（`src/data/enemies.js`）
- 必填：`id`, `name`, `maxHp`, `attack`, `hit`, `dodge`, `block`, `speed`, `xpReward`, `potentialReward`, `goldReward`, `moves[]`
- 可选扩展：`maxQi`, `parry`, `break`, `crit`

## 玩家状态（`player`）
关键扩展字段：
- `reputations`
- `relationships`
- `questStates`
- `inventory`（物品数量映射）
- `world.chapter`
- `world.flags`
- `world.timeline[]`
- `knownNpcs[]`
- （运行中）战斗会消费并回写 `hp/qi`，并由派生属性驱动拆招/破招/暴击判定

## UI 状态（`save.ui`）
- `sceneModeEnabled`
- `musicMuted`
- `selectedArtPackId`（可选，缺失时回退到 `DEFAULT_ART_PACK_ID`）

## 一致性检查
- 使用 `src/systems/worldValidation.js`
- 每次改地图/NPC/事件后都必须执行校验
- 该校验已覆盖：
  - schema 结构检查（字段存在性/类型）
  - 数据引用检查（ID 是否存在）

## 存档版本
- 当前存档版本：`v2`
- 迁移入口：`src/systems/saveMigrations.js`
- 兼容策略：读取时自动迁移旧版（v1）并写回新版槽位
