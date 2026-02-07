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
- `mapBackdrop` 背景配置

### `mapNodes[]`
- `id` 地点唯一 ID
- `name`
- `type`（城镇/门派/野外/秘境等）
- `regionId` 所属区域
- `grid.col`, `grid.row` 小地图相对坐标
- `tags[]` 地点标签（用于事件条件）
- `description`

### `mapEdges[]`
- `[fromNodeId, toNodeId]` 无向边
- 必须保证两端节点都存在

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
- 战斗：`battle`（含 `onVictory` / `onDefeat`）

## 阵营（`src/data/factions.js`）
- `id`, `name`, `description`, `defaultReputation`
- 声望范围约束：`-100 ~ 100`

## 玩家状态（`player`）
关键扩展字段：
- `reputations`
- `relationships`
- `questStates`
- `world.chapter`
- `world.flags`
- `world.timeline[]`
- `knownNpcs[]`

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
