# 江湖原型（单机Web版）

这是一个单机可玩的金庸武侠网页MVP，核心闭环：探索 -> 事件 -> 战斗 -> 成长 -> 再探索。

## 更新日志

- 详见 `CHANGELOG.md`

## AI 接手入口

- 项目级规则：`AGENTS.md`
- 快速接手：`docs/START_HERE.md`
- 当前交接状态：`docs/HANDOFF.md`
- 工作流约束：`docs/WORKFLOW.md`
- 架构说明：`docs/ARCHITECTURE.md`
- 数据字段规范：`docs/WORLD_DATA_SCHEMA.md`
- 剧情总纲：`docs/STORY_BIBLE.md`
- 任务设计规范：`docs/QUEST_DESIGN.md`
- 分支叙事规范：`docs/NARRATIVE_BRANCHING.md`
- 文案风格：`docs/WRITING_STYLE.md`
- 内容路线图：`docs/CONTENT_BACKLOG.md`
- 架构决策记录：`docs/DECISION_LOG.md`
- 新窗口可直接粘贴提示词：`docs/AI_ONBOARDING_PROMPT.md`

## 单机说明

- 无账号系统
- 无联网对战
- 无后端依赖
- 进度仅保存在浏览器 `localStorage`

## 启动

在仓库根目录执行：

```bash
python3 -m http.server 4173
```

Codespaces 打开端口 `4173`，访问：

- `http://127.0.0.1:4173`
- 或 Codespaces Port 转发地址

## AI 工作流预检

在仓库根目录执行：

```bash
./scripts/ai_preflight.sh
```

## 平衡性仿真（可重复）

在仓库根目录执行：

```bash
node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207
```

## 30秒上手

1. 输入姓名并选择倾向（侠义/诡道）进入游戏。
2. 平时主界面只显示地图和底部江湖对话；点击相邻节点移动。
3. 左下角“江湖册”可展开操作（探查、调息、武学列表、准备武功、存档）。
4. 触发事件后，抉择按钮会出现在地图下方上下文区。
5. 遭遇敌人时自动切入战斗画面，战报逐招滚动到下方对话框。

## 时间轴 + NPC 自主行动复现

1. 开局后通过行动推进时间（如移动、探查、打坐、交谈、事件抉择、战斗回合、成功研习武学）。
2. 在地图不同地点观察“此地可见NPC”变化。
3. 查看底部日志，会出现如“[午时] 某NPC前往某地”的行为记录。
4. 于戌时（19:00-21:00）前往“华山大殿”，且岳掌门在场时对话，可触发“掌门密令”。
5. 接密令后夜间前往“黑木林”触发“夜探黑木寨”任务战。

## 小地图背景配置

- 每个分区的小地图背景在 `src/data/map.js` 的 `mapRegions[*].mapBackdrop` 中配置。
- 当前已内置 5 张分区背景图，素材目录为 `src/assets/map-backgrounds/`。
