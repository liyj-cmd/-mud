# START HERE（新 AI 5 分钟接手）

## 1. 你在维护什么
这是一个单机 Web 武侠 RPG 原型，核心闭环：
- 探索地图
- 触发事件
- 进入战斗
- 获取成长
- 继续探索

当前目标不是“做完一个短 demo”，而是把它演进为可长期更新的金庸群侠式开放武侠文本世界。

## 2. 先读这些文件（按顺序）
1. `docs/HANDOFF.md`
2. `docs/WORKFLOW.md`
3. `docs/ARCHITECTURE.md`
4. `docs/WORLD_DATA_SCHEMA.md`
5. `docs/STORY_BIBLE.md`
6. `docs/QUEST_DESIGN.md`
7. `docs/NARRATIVE_BRANCHING.md`

## 3. 先跑预检
首选：
```bash
./scripts/ai_preflight.sh
```

等价命令：
```bash
node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"
```

```bash
node --input-type=module -e "const { validateWorldData } = await import('./src/systems/worldValidation.js'); const warnings = validateWorldData(); console.log('warnings', warnings.length); if (warnings.length) { console.log(warnings.join('\\n')); process.exitCode = 1; }"
```

## 4. 你应该优先做的改动类型
- 内容扩展：新增地点、角色、事件、任务线。
- 规则扩展：新增事件条件、关系与声望逻辑。
- 工程性改造：提高可维护性（拆模块、校验、兼容旧存档）。

## 5. 关键新架构入口
- 内容注册层：`src/content/index.js`
- 运行时服务：`src/runtime/worldStateService.js`、`src/runtime/questRuntime.js`、`src/runtime/dialogueRuntime.js`
- 统一效果执行：`src/systems/effectApplier.js`
- 存档迁移：`src/systems/saveMigrations.js`

## 6. 不要做的事
- 不要随意改已有 ID（`nodeId`/`eventId`/`npcId`/`enemyId`/`regionId`）。
- 不要跳过 `docs/HANDOFF.md` 更新。
- 不要只改数据不做一致性检查。

## 7. 完成任务时必须更新
- `CHANGELOG.md`
- `docs/HANDOFF.md`
- 如有 schema 变化，更新 `docs/WORLD_DATA_SCHEMA.md`
