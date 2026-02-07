# WORKFLOW（AI 协作工作流）

## 目标
让任意新 AI 在一个新窗口中稳定接手，不遗漏关键步骤。

## 标准流程
1. 阅读
- `docs/START_HERE.md`
- `docs/HANDOFF.md`
- 本次任务相关文档

2. 预检
- 运行 `./scripts/ai_preflight.sh`
- 若脚本失败，先修复再继续开发

3. 实施
- 优先数据驱动改造
- 尽量不改历史 ID
- 必要时保持旧档兼容

4. 验证
- 再跑一次检查
- 记录是否有告警
- 若改动涉及事件/战斗/成长平衡，执行：
  - `node scripts/simulate_world.mjs --runs 20 --steps 200 --seed 20260207`
  - 对比关键指标（平均等级、战斗胜率、任务完成态）

5. 交接
- 更新 `docs/HANDOFF.md`
- 更新 `CHANGELOG.md`
- 若改了 schema，更新 `docs/WORLD_DATA_SCHEMA.md`

## 每次任务的交付格式（建议）
- 本次目标
- 改动文件列表
- 关键行为变化
- 校验结果
- 下一步建议

## 禁止事项
- 不做无记录的结构性重命名
- 不跳过 `HANDOFF` 更新
- 不提交未验证的数据引用变更

## 任务粒度建议
- 每次只做一个“主目标 + 一个配套目标”。
- 若任务很大，拆为多轮并在 `HANDOFF` 记录阶段进展。

## 新窗口推荐开场语
可直接使用 `docs/AI_ONBOARDING_PROMPT.md` 作为首条消息模板。
