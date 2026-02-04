from __future__ import annotations

from pathlib import Path

from core.logging import WorldLogger
from core.time import advance_tick
from evennia_adapter import apply_actions
from evennia_adapter.state import get_world_state


def _tick_callback() -> None:
    world_state = get_world_state()
    logger = WorldLogger(Path("logs/world.log"))
    actions = advance_tick(world_state, Path("text"), logger)
    apply_actions(actions)


def start_world_ticker() -> None:
    try:
        from evennia.utils.tickerhandler import TICKER_HANDLER
    except Exception:
        return
    TICKER_HANDLER.add(1, _tick_callback, persistent=True)
