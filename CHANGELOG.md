# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- 世界数据从“小型原型”扩展为“可持续增长”结构：
  - 地图扩展为 16 个区域、80+ 条连线与 60+ 小地点，并保留旧地点 ID 兼容存档。
  - NPC 扩展到多阵营多关系网络，新增关系种子、阵营归属、任务挂钩与标签字段。
- 事件系统新增区域/地点标签/任务状态/声望/关系等条件判断能力。
- 引入内容注册层与纵切片配置：
  - 新增 `src/content/index.js` 统一向运行时提供地图/NPC/事件/敌人数据。
  - 新增 `src/content/slices/chapter01.js` 作为 30-60 分钟可玩纵切片锚点。
- 玩家状态新增可演进字段并做旧档兼容：
  - 新增阵营声望、NPC 关系、任务状态、世界章节与时间线记录。
  - 读取旧存档时自动补齐缺失字段，避免版本升级后坏档。
- 战斗结算效果支持更丰富的任务与关系变化：
  - 支持任务状态写入、旗标移除、声望变动、关系变动、世界时间线记录等。
- 场景层开始解耦运行时职责：
  - 新增 `WorldStateService`、`QuestRuntime`、`DialogueRuntime`。
  - `GameScene` 对话与效果处理已接入这些服务。
- 存档系统升级为版本化迁移：
  - 新增 `saveMigrations`，自动兼容并升级旧版存档（v1 -> v2）。
- 世界校验升级为“schema + 引用”双校验，拦截字段结构错误与坏引用。
- 时间推进机制改为“行动驱动”：
  - 移除按现实秒自动推进游戏时间。
  - 仅在行动后推进时辰（如移动、探查、打坐、交谈、事件选择、战斗回合、成功研习武学）。
- 研习武学（成功）现在会推进 30 分钟游戏时间。
- UI 视觉主题整体提亮，并增加层次质感（面板、按钮、日志、弹窗、世界地图样式统一升级）。
- 小地图背景遮罩进一步减弱，分区背景图显示更明显。

### Added

- 新增项目级 AI 维护约束文件 `AGENTS.md`（定义新 AI 接手顺序与强制动作）。
- 新增 `docs/` 文档体系（架构、数据字段、剧情总纲、任务规范、分支规范、交接与流程等）。
- 新增新窗口可直接使用的提示模板 `docs/AI_ONBOARDING_PROMPT.md`。
- 新增 AI 预检脚本 `scripts/ai_preflight.sh`，统一执行模块导入与世界数据一致性检查。
- 新增平衡性仿真脚本 `scripts/simulate_world.mjs`（支持固定 seed 的可重复模拟回归）。

## [2026-02-07]

### Fixed

- 修复小地图节点与连线在移动时出现视觉错位的问题（移除节点位置过渡动画并统一图层尺寸）。
- 修复任务事件在跨地图后仍残留的问题：当前事件在移动或时机变化失效后会自动清除。

### Changed

- 小地图支持按分区切换背景图：在 `src/data/map.js` 的 `mapRegions[*].mapBackdrop` 配置即可生效。

### Added

- 新增阵营数据 `src/data/factions.js`（阵营定义、声望初始化与约束）。
- 新增世界数据完整性校验 `src/systems/worldValidation.js`，启动时会进行一致性检查并输出告警。
- 新增大量地点事件与任务链（开封缉盗、大理求药、峨眉赈粮、泰山论锋等）。
- 新增分区背景素材：
  - `src/assets/map-backgrounds/changan-city.svg`
  - `src/assets/map-backgrounds/huashan-cliff.svg`
  - `src/assets/map-backgrounds/zhongnan-pass.svg`
  - `src/assets/map-backgrounds/gumu-cavern.svg`
  - `src/assets/map-backgrounds/heimu-forest.svg`
- 新增本更新日志文件 `CHANGELOG.md`。
