# AGENTS.md（项目级 AI 维护规则）

## 任务目标
将本项目持续演进为可长期更新的武侠开放世界，而不是一次性 demo。

## 你接手后必须做的第一件事
按顺序阅读：
1. `docs/START_HERE.md`
2. `docs/HANDOFF.md`
3. `docs/WORKFLOW.md`
4. `docs/ARCHITECTURE.md`
5. `docs/WORLD_DATA_SCHEMA.md`

## 你在编码前必须执行
首选：
```bash
./scripts/ai_preflight.sh
```

等价命令：
```bash
node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"
node --input-type=module -e "const { validateWorldData } = await import('./src/systems/worldValidation.js'); const warnings = validateWorldData(); console.log('warnings', warnings.length); if (warnings.length) { console.log(warnings.join('\\n')); process.exitCode = 1; }"
```

## 改动较大时额外执行
```bash
node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207
```

## 强约束
- 不要随意修改现有 ID（`regionId`/`nodeId`/`npcId`/`eventId`/`enemyId`）。
- 新增剧情、任务和系统改动优先走数据驱动。
- 改 schema 时必须更新 `docs/WORLD_DATA_SCHEMA.md`。
- 每轮任务完成必须更新：
  - `CHANGELOG.md`
  - `docs/HANDOFF.md`

## 交付格式要求
最终说明必须包含：
- 改动文件
- 行为变化
- 校验结果
- 下轮建议

## 推荐优先级
1. 保证可维护性和一致性
2. 再扩内容
3. 最后做细节打磨
