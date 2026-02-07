# HANDOFF（当前交接）

## 最后更新
- 日期：2026-02-07
- 维护目标：把 demo 变成可持续扩展的武侠世界框架

## 当前状态快照
- 地图：19 区域 / 83 地点 / 113 连线
- 角色：34 个 NPC
- 事件：26 个
- 敌人：17 个
- 武学：24 门（支持拆招/破招/暴击/速度等扩展属性）
- 新增系统：阵营声望、NPC 关系、任务状态、世界时间线、扩展武学战斗判定
- 交互能力：NPC 请教/偷窃/切磋已形成独立规则层（可扩展到抢夺/交易/招募）

## 已完成
- 地图大扩展并保留旧 ID 兼容。
- NPC 扩展并加入阵营、关系种子、任务挂钩。
- 事件条件扩展（区域/标签/任务/关系/声望等）。
- 事件效果扩展（任务推进、关系与声望变化、世界时间线记录）。
- 增加世界数据一致性校验。
- 增加内容注册层 `src/content/index.js`，支持纵切片配置（`chapter_01`）。
- 抽出运行时服务层：`WorldStateService` / `QuestRuntime` / `DialogueRuntime`。
- 引入统一效果执行器 `effectApplier`，战斗与事件共享状态变更逻辑。
- 存档升级到 v2，并加入自动迁移逻辑（兼容 v1）。
- 新增可复现实验脚本 `scripts/simulate_world.mjs` 用于平衡性回归。
- 武学系统扩展为多属性：
  - 武学数据支持 `parry`（拆招）、`break`（破招）、`crit`（暴击）、`speed`（节奏）等属性。
  - 战斗流程升级为“命中 -> 闪躲 -> 拆招/破招 -> 格挡 -> 暴击/伤害”。
  - 研习消耗改为按品质/等级动态计算。
- 新增经典地图与背景：
  - 区域新增 `heimuya`、`taohua`、`kunlun`，并接入对应节点与连线。
  - 地图背景支持地点级覆盖（`sceneBackdrop`）优先于区域背景（`mapBackdrop`）。
- 新增经典人物与绝学绑定：
  - 新增张三丰、独孤求败、郭靖、黄蓉、杨过、小龙女、任我行、东方不败、张无忌等人物。
  - 新增独立武学配置系统 `src/data/npcMartialLoadouts.js`，用“门派模板 + 标签加成 + 人物覆写”分配角色武功。
- 新增经典事件线：
  - 太极真传、孤峰问剑、桃花迷阵、降龙演武、光明圣火试炼、黑木崖暗斗。

## 当前重点风险
- `GameScene` 仍偏大，后续新增系统会继续膨胀。
- 任务主干仍在 `events.js`，`QuestRuntime` 目前主要承担状态写入，尚未形成完整任务编排器。
- 对话分支目前还偏轻，尚未形成系统化剧情对话树。
- 世界模拟战斗胜率偏高（本轮模拟 111 战仅 1 负），后续需继续做数值平衡。
- 新增高阶武学较多，但掉落/获取节奏尚未完全分层，可能导致中后期成长过快。

## 下一步优先级（建议）
1. 拆 `GameScene` 渲染层：分离 Explore/Battle/UI Router。
2. 建立 `src/content/quests/` 与 `QuestCompiler`，把关键任务从 `events.js` 解耦。
3. 增加“势力态势日报”系统：按天改变世界事件权重。
4. 对话系统升级：支持基于关系/任务状态的多轮对话。

## 新 AI 接手时必须先做
1. 阅读 `docs/START_HERE.md` 和 `docs/WORKFLOW.md`。
2. 执行两条预检命令（scene import + worldValidation）。
3. 明确本轮目标并限制范围。

## 本轮若继续扩内容，建议选一个方向
- 方向 A：华山-开封-黑木主线增强
- 方向 B：大理-峨眉救援线增强
- 方向 C：少林-武当论武线增强

## 本文件更新要求
每次任务结束都追加：
- 做了什么
- 校验结果
- 剩余风险
- 下个 AI 的第一步建议

## 本轮追加（2026-02-07）
- 做了什么
  - 完成武学系统升级：扩展武学属性、战斗判定链路、动态研习成本。
  - 扩展金庸经典地图与人物，新增黑木崖/桃花岛/昆仑线内容及专属背景。
  - 新增 6 条高价值事件，打通“人物 -> 武学 -> 地图”的数据驱动链路。
  - 更新 `WORLD_DATA_SCHEMA`，补充 `sceneBackdrop`、NPC 独立武学配置、新武学模型字段。
- 校验结果
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功。
- 剩余风险
  - 胜率偏高、潜能增长偏快，需进一步做“敌人强度梯度 + 武学获取门槛”双调优。
  - `events.js` 已较长，后续应拆分为分区/门派事件模块。
- 下个 AI 的第一步建议
  - 先跑一次 `./scripts/ai_preflight.sh`，再以模拟数据为基线做战斗平衡回调（优先压低中后期胜率）。

## 本轮追加（2026-02-07 / 回合2）
- 做了什么
  - 按“武功独立系统”重构：移除 `npcs.js` 内嵌武学绑定，新增 `src/data/npcMartialLoadouts.js`。
  - 新系统支持角色创建后按槽位配置武学（拳脚/兵器/内功/轻功），并支持门派模板与人物覆写。
  - 新增 `taiji_shengong`（太极神功），张三丰已配置为：内功=太极神功、轻功=梯云纵。
  - 对话与校验改为读取独立武学配置，不再依赖角色主体字段。
- 校验结果
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功。
- 剩余风险
  - NPC 武学配置目前主要用于识别与扩展，尚未完全接入 NPC 主动战斗 AI。
- 下个 AI 的第一步建议
  - 在现有独立配置基础上，把 NPC 战斗敌人实例也接入同一套武学槽位推导逻辑。

## 本轮追加（2026-02-07 / 回合3）
- 做了什么
  - 新增 `src/data/npcInteractionProfiles.js` + `src/runtime/npcInteractionRuntime.js`，把 NPC 交互抽成独立系统。
  - 新增 `src/systems/battleActorFactory.js`，支持 `battle.npcId`，并将 NPC 动态生成为战斗对象。
  - `GameScene` 新增可见操作：与 NPC 交谈 / 请教武学 / 顺手牵羊 / 发起切磋。
  - 新增 `src/data/items.js`，为偷窃掉落与未来交易系统提供基础数据结构。
  - 事件示例已支持 NPC 战斗目标（`sparring_challenge` 改为 `npcId: disciple_qing`）。
- 校验结果
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功。
- 剩余风险
  - 当前“偷窃”仅实现基础成功/失败与掉落，尚无守卫追缉与赃物系统。
  - NPC 切磋奖励仍是通用公式，后续可按人物个性细化战斗奖励与对白。
- 下个 AI 的第一步建议
  - 先把 `items` 接入商店/交易，再补“抢夺/赃物清洗/守卫缉拿”闭环。

## 本轮追加（2026-02-07 / 回合4）
- 做了什么
  - 完成长安集市（`market`）场景化首个垂直切片：新增 `src/data/nodeScenes.js`，定义场景尺寸、障碍、出口、NPC 锚点与观察点。
  - 新增探索场景渲染模块 `src/ui/exploreCanvas.js`，支持场景层、出口提示、NPC/主角火柴人、选中高亮。
  - `index.html` / `src/main.js` 接入场景模式开关与探索画布，顶部新增 `场景模式: 开/关`。
  - `GameScene` 接入场景模式路由与交互：
    - 场景模式开启且地点存在 `nodeScene` 时，探索区改为可移动场景。
    - 支持方向键移动（带障碍碰撞）、点击 NPC 选中并复用既有交谈/请教/偷窃/切磋。
    - 支持点击观察点触发日志与 `+5` 分钟耗时；点击出口复用 `travelTo`（`+20` 分钟）。
  - 存档快照增加 `ui.sceneModeEnabled`，旧档缺省时自动按 `false` 回退，保持兼容。
  - `worldValidation` 新增 `validateNodeScenes`，覆盖场景数据结构、引用和边界合法性检查。
  - 更新 `docs/WORLD_DATA_SCHEMA.md`，补充 `nodeScenes` schema 与接口说明。
- 校验结果
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
  - `node --input-type=module -e "const m=await import('./src/data/nodeScenes.js'); console.log('scene-market', !!m.getNodeSceneById('market'))"`：输出 `scene-market true`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功（`events=1022 battles=107 wins=107 losses=0`）。
- 剩余风险
  - `GameScene` 体量进一步增加，建议下一轮继续拆分为场景输入、场景渲染、交互动作路由三个子模块。
  - 目前只覆盖 `market` 单点场景，其他地点开启场景模式仍会回退到旧地图视图。
  - 场景内点击目标依赖固定锚点，后续需增加“无锚点 NPC 回退布局”策略。
- 下个 AI 的第一步建议
  - 先在浏览器手工验证 `town_gate -> market` 场景流，再扩第二个地点（建议 `inn`）并抽通用场景模板生成器。

## 本轮追加（2026-02-07 / 回合5）
- 做了什么
  - 对场景模式 UI 做了专项美化，保持现有玩法逻辑不变：
    - 重绘 `src/ui/exploreCanvas.js`，提升场景层次（天空/地面/摊位/出口/观察点），并增加角色阴影、名牌、选中光圈与轻微动态起伏。
    - 在 `index.html` 新增场景 HUD（`scene-hud`），并由 `GameScene` 在场景模式下动态显示地点标题和操作提示。
    - 优化 `src/styles.css` 场景态视觉：场景模式按钮激活样式、场景画布滤镜、地图容器光影增强、右侧交互区场景风格化。
  - `GameScene` 增加 UI 细节联动：
    - `renderSceneModeButton` 增加激活态 class 切换。
    - 场景态渲染时显示 HUD，地图/战斗态自动隐藏 HUD。
    - 场景交互面板增加专用样式 class，和普通探索态分离。
- 校验结果
  - `node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"`：通过，`scene-ok`。
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功（`events=1022 battles=107 wins=107 losses=0`）。
- 剩余风险
  - 场景画布美化依赖手工绘制，后续若扩到多地点，建议抽“场景主题参数”减少重复绘图代码。
  - 场景 HUD 目前仅文本提示，后续可加入小地图罗盘与交互热键提示图标。
- 下个 AI 的第一步建议
  - 先做浏览器手工体验回归（桌面+移动宽度），确认文本可读性与点击热区，再推进 `inn` 场景复用模板。

## 本轮追加（2026-02-07 / 回合6）
- 做了什么
  - 按“市集辨识度”目标重做 `market` 场景画布表现（`src/ui/exploreCanvas.js`）：
    - 新增市集街景层：屋檐块面、灯笼串、招幌、行人剪影、石板街纹理。
    - 障碍物改为摊位语义化绘制：`stall_*` 对应不同摊棚风格与招牌（绸缎/药材/兵器/杂货），`tea_table` 增加茶具与蒸汽。
    - 观察点 `notice_board` / `tea_stall` 改为具象物件绘制，不再是纯圆形提示点。
  - 调整场景态视觉色调（`src/styles.css`）：从冷蓝偏移到暖色市井气氛，强化“场景模式”与普通地图的观感差异。
  - `GameScene` 场景信息文案补充“市集氛围”描述，HUD 提示改为市井语境（`src/scenes/gameScene.js`）。
- 校验结果
  - `node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"`：通过，`scene-ok`。
  - `./scripts/ai_preflight.sh`：通过，`warnings 0`。
- 剩余风险
  - 目前集市细节由画布代码内置，后续若扩多地点，建议把“装饰层”改为数据驱动配置，避免渲染文件持续膨胀。
  - 未引入音效层，场景沉浸感仍主要依赖视觉与文本。
- 下个 AI 的第一步建议
  - 先做一次真机视觉验收（含低分辨率窗口），再决定是否追加“场景音效 + 昼夜色温”增强包。

## 本轮追加（2026-02-07 / 回合7）
- 做了什么
  - 完成“三大区域”场景替换试点落地：`market`（长安）、`kaifeng_square`（开封）、`monk_courtyard`（少林）。
  - `src/data/nodeScenes.js` 扩展为三场景配置，并新增 `themeId`（`market` / `magistrate_square` / `temple_courtyard`）。
  - 新增 `src/data/sceneThemes.js`，将场景氛围文案与 HUD 提示从 `GameScene` 逻辑中抽离为数据配置。
  - 建立“人物建模模块”并接入场景渲染链路：
    - `src/data/characterModelProfiles.js`：门派/身份/标签/NPC 覆写建模配置。
    - `src/runtime/characterModelRuntime.js`：人物模型解析（含主角立场配色分支与 NPC 稳定化外观变体）。
    - `src/ui/characterModelRenderer.js`：人物模型画布渲染器（头饰/配件/徽记/名牌/光晕）。
  - `src/ui/exploreCanvas.js` 重构为主题化渲染：市井、公廨、禅院三套地表与装饰层，并改为调用人物建模渲染。
  - `src/scenes/gameScene.js` 场景信息与 HUD 改为读取 `sceneThemes`，同时输出 `data-scene-theme` 给样式层。
  - `src/styles.css` 增加公廨/禅院主题样式分支（边框、阴影、HUD 色调）。
  - `src/systems/worldValidation.js` 增加 `themeId` 合法性和人物建模配置引用校验。
  - 更新 `docs/WORLD_DATA_SCHEMA.md` 与 `CHANGELOG.md`，补齐 schema 与变更记录。
- 校验结果
  - `node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"`：通过，`scene-ok`。
  - `node --input-type=module -e "const { validateWorldData } = await import('./src/systems/worldValidation.js'); const warnings = validateWorldData(); console.log('warnings', warnings.length);"`：通过，`warnings 0`。
  - `node --input-type=module -e "const m=await import('./src/data/nodeScenes.js'); console.log('scene-market', !!m.getNodeSceneById('market')); console.log('scene-kaifeng', !!m.getNodeSceneById('kaifeng_square')); console.log('scene-shaolin', !!m.getNodeSceneById('monk_courtyard'));"`：输出均为 `true`。
  - `./scripts/ai_preflight.sh`：通过，`scene-ok` / `warnings 0`。
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`：执行成功（`events=1022 battles=107 wins=107 losses=0`）。
- 剩余风险
  - 三套场景主题已抽离但仍在同一 `exploreCanvas` 文件，继续扩点会再次拉高文件体积，建议下一轮按主题拆分渲染子模块。
  - 人物建模当前以 2D 画布风格化为主，尚未接入动作状态机（待机/移动/受击）。
  - 场景内 NPC 仍依赖固定锚点，未实现“动态避障 + 局部巡逻”。
- 下个 AI 的第一步建议
  - 先做浏览器手工验收路径：`town_gate -> market`、`kaifeng_west_road -> kaifeng_square`、`shaolin_gate -> monk_courtyard`，确认三主题渲染、人物建模差异和交互热区无回归，再决定是否拆分 `exploreCanvas`。
