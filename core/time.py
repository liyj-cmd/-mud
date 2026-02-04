from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from core.logging import WorldLogger
from core.npc_ai import update_npc
from core.textgen import StyleGuide, TextGenerator
from core.state_update import apply_actions
from core.timeline import events_at_tick, handle_event


@dataclass(frozen=True)
class ShichenConfig:
    ticks_per_ke: int = 60
    ke_per_shichen: int = 8


SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]


def shichen_text(world_tick: int, config: ShichenConfig) -> str:
    total_ke = world_tick // config.ticks_per_ke
    shichen_index = (total_ke // config.ke_per_shichen) % len(SHICHEN_NAMES)
    ke_index = total_ke % config.ke_per_shichen + 1
    return f"{SHICHEN_NAMES[shichen_index]}时{ke_index}刻"


def advance_tick(world_state: Any, data_dir: Path, logger: WorldLogger) -> list[Any]:
    style = StyleGuide.from_markdown(data_dir / "style_guidelines.md")
    textgen = TextGenerator(world_state.lexicon, world_state.random, style, world_state.dev_mode)
    actions = []
    for event in events_at_tick(world_state):
        actions.extend(handle_event(world_state, event, textgen))
    for npc in list(world_state.npcs.values()):
        actions.extend(update_npc(world_state, npc, textgen))
    apply_actions(world_state, actions)
    for action in actions:
        logger.log_action(world_state.world_tick, action)
    world_state.world_tick += 1
    return actions
