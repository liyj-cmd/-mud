# 数据 Schema

## locations.yaml

```yaml
locations:
  - id: inn_hall
    name: "悦来客栈·大堂"
    desc: "..."
    ambience_tags: ["inn", "crowded"]
    exits:
      east: xiangyang_market
```

字段说明：
- `id`：唯一标识
- `name`：展示名称
- `desc`：武侠风格描述
- `ambience_tags`：环境标签
- `exits`：方向到地点 id

## npcs.yaml

```yaml
npcs:
  - id: waiter_xiaoer
    name: "店小二"
    title: "客栈伙计"
    faction: "悦来客栈"
    home_location_id: inn_hall
    ai_profile:
      behavior_state: "inn_service"
      period_tick: 3
      move_probability: 0.0
      allowed_location_tags: ["inn"]
    speech_profile:
      talk_probability: 0.2
      template_keys: ["waiter_greeting"]
```

## timeline.yaml

```yaml
timeline:
  - tick: 30
    type: "spawn_npc"
    payload:
      npc_id: "mysterious_swordsman"
      location_id: "inn_hall"
      npc_def:
        name: "神秘剑客"
        title: "背剑之人"
        faction: "不明"
        ai_profile: { ... }
        speech_profile: { ... }
```

支持事件：`spawn_npc`, `npc_say`, `npc_move`, `rumor_broadcast`。

## lexicon.yaml

```yaml
lexicon:
  forms_of_address: ["在下", "阁下"]
  movement_templates:
    - "{npc}提气疾行，{direction_text}而去。"
```

模板变量：`npc`, `direction_text`, `address`, `verb`, `ambience`, `rumor_opener`。
