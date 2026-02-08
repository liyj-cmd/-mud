# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- 场景模式 UI 改为“主画面优先”布局：
  - 去掉固定右侧栏，探索/场景画面占据主舞台。
  - 江湖文字改为右下淡化浮层（短时耳报），完整日志沉淀到左下江湖册内。
  - 头部不再承载长条人物属性，角色状态整合到江湖册。
- `GameScene` 接入“美术包可切换”状态：
  - 存档 `ui` 新增 `selectedArtPackId`（旧档缺失自动回退 `procedural`）。
  - 场景渲染 payload 新增 `artPackId` 与 `assetLoader` 上下文，缺素材时单元素自动回退内置绘制。
- 探索渲染链路改为策略路由：
  - `src/ui/exploreCanvas.js` 仅负责选择渲染策略与素材预热，不再直接承载全部绘制细节。
  - 原手绘渲染迁移至 `proceduralRenderer`，新增 `spriteRenderer` 叠加式素材渲染。
- 三个试点 `nodeScenes` 补充 `visualKey` 语义键（障碍/出口/观察点），渲染层按语义读取素材而非硬编码 `id`。
- 世界数据校验扩展：
  - 新增 `artPacks` manifest 合法性检查。
  - 新增 `nodeScenes[*].obstacles/exits/pois[*].visualKey` 字段合法性检查。
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
- 武学系统重构为多属性模型：
  - 武学属性从攻/命/闪/格扩展到攻/命/闪/格/拆/破/暴/速/血/气。
  - 研习消耗改为按武学品质与当前等级动态计算。
  - 战斗回合改为“命中 -> 闪躲 -> 拆招/破招 -> 格挡 -> 暴击/伤害”流程，并加入真气消耗对招式威力的影响。
- 探索场景背景改为“地点优先，区域兜底”：
  - `mapNodes[*].sceneBackdrop` 可覆盖 `mapRegions[*].mapBackdrop`，支持门派/秘境独立背景。
- NPC 武学配置改为独立系统：
  - 不再在 `npcs.js` 内嵌人物武功字段。
  - 新增 `src/data/npcMartialLoadouts.js`，通过“门派模板 + 标签加成 + 人物覆写”分配武学槽位。
  - 对话与数据校验统一读取独立武学配置，角色与武功解耦。
- 人物交互系统扩展为独立层：
  - 新增 `src/data/npcInteractionProfiles.js` 与 `src/runtime/npcInteractionRuntime.js`，统一管理“请教武学/行窃/切磋”规则。
  - 新增 `src/systems/battleActorFactory.js`，支持 `battle.npcId`，将“敌人”与“可战斗 NPC”统一到同一战斗入口。
  - 场景交互面板新增 NPC 操作按钮（交谈/请教/顺手牵羊/切磋）。
- 新增探索场景试点（`market`）并保留旧地图交互：
  - 可在顶部按钮切换“场景模式: 开/关”，关闭时完全回退到旧版探索流程。
  - 场景模式下支持方向键移动、点击 NPC 互动、点击出口切换地点、点击观察点触发 5 分钟耗时。
  - 进出地点和 NPC 行为耗时继续复用原有时间推进、事件筛选与 NPC 日程系统。
- 场景模式 UI 美化升级：
  - 探索画布重绘为分层场景风格（天空/地面/摊位/光晕），NPC 与主角增加阴影、名牌与选中反馈。
  - 新增场景 HUD（地点标题 + 操作提示），并在场景模式中强化沉浸提示信息。
  - 场景模式按钮新增激活态样式，右侧交互区增加场景态视觉风格。
- 集市场景辨识度增强（`market`）：
  - 探索画布追加“市集特征”元素：街市屋檐、灯笼串、招幌、摊位招牌、货堆、行人剪影与石板街面纹理。
  - `stall_*` 与 `tea_table` 采用差异化绘制，形成“绸缎/药材/兵器/杂货/茶摊”视觉分区。
  - 场景说明与 HUD 提示增加市集氛围文案，使玩法提示与美术语义一致。
- `GameScene` 存档快照增加 `ui.sceneModeEnabled`，旧存档缺失该字段时默认关闭场景模式，保持兼容。
- 世界数据校验新增 `nodeScenes` 检查：覆盖 `nodeId`、出口连通性、NPC 锚点、POI/障碍越界与数值合法性。
- 场景化扩展到三个区域试点地点（长安 `market`、开封 `kaifeng_square`、少林 `monk_courtyard`）：
  - 三个地点均支持方向键移动、点击 NPC 互动、点击观察点耗时、点击出口旅行。
  - 场景渲染从单点特化升级为“主题驱动”（市井/公廨/禅院），保持数据驱动扩展路径。
- `GameScene` 场景文案与 HUD 改为读取 `sceneThemes`，不同场景主题可直接通过数据配置切换叙事语气与操作提示。
- 场景模式容器样式按 `data-scene-theme` 区分，公廨与禅院获得独立色调与 HUD 视觉。
- 世界数据校验新增：
  - `nodeScenes[*].themeId` 合法性检查。
  - 人物建模配置（阵营/角色标签/NPC 覆写）引用合法性检查。
- 探索画布角色渲染从统一火柴人升级为“人物建模驱动渲染”：
  - NPC 形象按阵营、身份、标签与个体覆写自动生成。
  - 主角形象支持按立场（侠义/诡道）差异化配色与徽记。
- 新增“场地特色背景乐”系统（Web Audio 程序生成）：
  - `GameScene` 会按场景主题 / 区域自动切换音乐风格（市井、公廨、禅院、行旅）。
  - 顶部状态栏新增 `背景乐` 开关，支持浏览器音频解锁前的“待激活”状态提示。
  - 存档 `ui` 字段新增 `musicMuted`，旧档缺失时默认按未静音处理，保持兼容。
- 世界数据校验新增背景乐配置合法性检查：
  - 校验 `sceneThemes[*].musicProfileId` 是否引用存在的音乐配置。
  - 校验 `nodeScenes[*].themeId` 对应主题的音乐配置是否有效。
- 江湖录（左下入口）交互回调：
  - 默认状态从“展开”改回“收起”，避免进入游戏后遮挡主舞台。
  - 保留事件/战斗期间的强制展开逻辑，确保关键操作不丢失。

### Added

- 新增本地美术包注册中心 `src/data/artPacks.js`：
  - 暴露 `DEFAULT_ART_PACK_ID`、`listArtPacks()`、`getArtPack(packId)`、`resolveArtPack(packId)`。
  - 内置 `procedural` 与 `wuxia_pack_demo` 两套包，支持 license/source 元数据登记。
- 新增场景素材加载器 `src/systems/sceneAssetLoader.js`（缓存、预热、失败标记）。
- 新增探索渲染模块拆分：
  - `src/ui/exploreRenderers/proceduralRenderer.js`
  - `src/ui/exploreRenderers/spriteRenderer.js`
- 新增演示素材目录 `src/assets/artpacks/wuxia-demo/`（场景背景、人物 token、道具与 UI 印记占位素材）。
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
- 新增经典武学与人物扩展内容：
  - 武学扩充到 24 门（新增太极拳、太极剑、太极神功、独孤九剑、降龙十八掌、九阳神功、乾坤大挪移、凌波微步等）。
  - 新增经典人物 12 名（含张三丰、独孤求败、郭靖、黄蓉、杨过、小龙女、任我行、东方不败、张无忌等）。
  - 新增事件 6 条（太极真传、孤峰问剑、桃花迷阵、降龙演武、光明顶试炼、黑木崖暗斗）。
- 新增物品数据 `src/data/items.js`，为偷窃/交易/任务扩展提供统一物品主数据。
- 新增地图扩展（参考群侠传常见版图）：
  - 区域扩展至 19 个：新增 `heimuya`、`taohua`、`kunlun`。
  - 地点扩展至 83 个：新增黑木崖、桃花岛、昆仑光明顶相关节点与连线。
- 新增门派/地点背景素材：
  - `src/assets/map-backgrounds/shaolin-temple.svg`
  - `src/assets/map-backgrounds/wudang-cloud.svg`
  - `src/assets/map-backgrounds/taishan-sunrise.svg`
  - `src/assets/map-backgrounds/suzhou-water.svg`
  - `src/assets/map-backgrounds/emei-golden-summit.svg`
  - `src/assets/map-backgrounds/dali-palace.svg`
  - `src/assets/map-backgrounds/taohua-island.svg`
  - `src/assets/map-backgrounds/heimu-cliff.svg`
  - `src/assets/map-backgrounds/kunlun-plateau.svg`
- 新增节点场景数据与渲染模块：
  - `src/data/nodeScenes.js`（首个地点场景 `market`）
  - `src/ui/exploreCanvas.js`（探索场景画布渲染）
- 新增场景主题模块 `src/data/sceneThemes.js`，统一管理场景主题元数据（名称/氛围文案/HUD 提示）。
- 新增人物建模模块：
  - `src/data/characterModelProfiles.js`（人物建模数据配置）
  - `src/runtime/characterModelRuntime.js`（人物模型解析运行时）
  - `src/ui/characterModelRenderer.js`（人物模型画布渲染器）
- 新增场景背景乐模块：
  - `src/data/ambientMusicProfiles.js`（背景乐配置）
  - `src/systems/ambientAudio.js`（Web Audio 淡入淡出与自动切曲）
