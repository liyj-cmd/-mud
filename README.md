# 金庸武侠实时 MUD（Evennia MVP）

## 快速开始

```bash
make install
```

启动 Evennia：

```bash
make run
```

首次启动后创建账号，进入游戏。默认出生在「悦来客栈·大堂」。

## 验收步骤

1. 启动服务：
   ```bash
   make run
   ```
2. 另一终端使用 telnet 连接：
   ```bash
   telnet localhost 4000
   ```
3. 进入游戏后执行：
   - `startworld`（管理员）：启动 1 秒 tick 驱动。
   - `shichen`：显示当前 tick 与江湖时辰。
   - 观察：店小二每 3 tick 广播原地动作。
   - 观察：江湖客/丐帮弟子游走并说话。
   - tick=20 附近出现传闻广播。
   - tick=30 神秘剑客出现；tick=35 放话；tick=40 离开到城外小道。
4. 修改 `data/timeline.yaml` 后执行：
   - `reloadworld`：热加载生效（开发模式）。

## 数据与日志

- 数据目录：`data/` 与 `text/`
- 日志：`logs/world.log`（JSON Lines，记录 tick 与 action）
- 随机种子：`evennia_adapter.load_world_data(seed=...)` 可固定行为与文本选择

## 测试与质量

```bash
make lint
make type
make test
```

## 常见问题

- Evennia 未安装：请确保 Python 3.11+，并按官方文档初始化 Evennia 项目。
- 日志为空：确认 tick 驱动已启动（参见 `core/time.py`）。
