# ARCHITECTURE

## 目标
支持“高频内容迭代 + 新 AI 快速接手 + 旧存档可读”。

## 当前模块
- 入口与场景
  - `src/main.js`
  - `src/scenes/gameScene.js`
- 内容注册层
  - `src/content/index.js`
  - `src/content/slices/chapter01.js`
- 数据层
  - `src/data/map.js`
  - `src/data/npcs.js`
  - `src/data/events.js`
  - `src/data/enemies.js`
  - `src/data/martialArts.js`
  - `src/data/factions.js`
- 系统层
  - `src/systems/events.js`
  - `src/systems/combat.js`
  - `src/systems/progression.js`
  - `src/systems/schedule.js`
  - `src/systems/time.js`
  - `src/systems/save.js`
  - `src/systems/saveMigrations.js`
  - `src/systems/effectApplier.js`
  - `src/systems/worldValidation.js`
- 运行时服务层
  - `src/runtime/worldStateService.js`
  - `src/runtime/questRuntime.js`
  - `src/runtime/dialogueRuntime.js`

## 核心状态（Game State）
`GameScene.state` 关键字段：
- `player`：角色状态（属性、武学、旗标、声望、关系、任务状态、世界时间线）
- `time`：第几天/小时/分钟
- `eventHistory`：一次性事件触发记录
- `currentEvent`：当前待决策事件
- `battle`：当前战斗实例
- `logs`：战报与叙事日志

## 流程
1. 玩家行动（移动/探查/交谈/选择）
2. 时间推进
3. NPC 日程更新
4. 事件系统按条件筛选并触发
5. 事件效果写入状态（含任务、关系、声望）
6. 如触发战斗，战斗回合自动结算并回写奖励

## 数据驱动原则
- 地图、角色、事件、敌人都应以数据定义为主。
- 系统层负责“解释数据”，不硬编码具体剧情。
- 仅在必要时使用特殊分支（例如关键剧情引导）。

## 向后兼容策略
- 尽量保持历史 ID 不变。
- `ensurePlayerState` 负责旧档字段补齐。
- `saveMigrations` 负责存档版本升级（当前版本 v2）。
- 新字段应有默认值，不依赖一次性迁移脚本。

## 已知技术债
- `GameScene` 已接入运行时服务，但渲染与交互仍在同一类中。
- 下一步建议将 `GameScene` 继续拆成：
  - `ExploreUIRenderer`
  - `BattleUIRenderer`
  - `InputActionRouter`
