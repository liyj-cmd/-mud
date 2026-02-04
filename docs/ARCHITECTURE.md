# 架构说明

## 模块边界

- `core/`：纯业务核心，不依赖 Evennia，仅使用标准库与 PyYAML。
  - tick 管理、timeline 解析、NPC AI、文本生成、随机数注入、日志结构。
- `evennia_adapter/`：把核心 `WorldAction` 映射为 Evennia 对象操作。
- `typeclasses/` 与 `commands/`：薄封装，仅调用 adapter 与 core。

## 设计原则

- 数据驱动：地点/NPC/剧情/词库在 `data/` 与 `text/`。
- 可复现：固定 seed 与 timeline，NPC 行为与文本选择可重现。
- 可测试：核心逻辑纯函数化，可脱离 Evennia 单测。
- 禁用词策略：`text/style_guidelines.md` 中列出禁用词，开发模式会告警。

## 扩展指南

### 新增房间
1. 编辑 `data/locations.yaml` 添加条目。
2. 重载数据：`reloadworld`。

### 新增 NPC
1. 在 `data/npcs.yaml` 新增条目。
2. 必要时扩展 `text/lexicon.yaml` 模板。
3. `reloadworld` 生效。

### 新增 timeline 事件
1. 在 `data/timeline.yaml` 添加事件。
2. 如需新类型，扩展 `core/timeline.py`。

### 新增模板
1. 修改 `text/lexicon.yaml`。
2. 确保模板变量与 `core/textgen.py` 一致。
