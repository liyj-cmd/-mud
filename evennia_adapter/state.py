from __future__ import annotations

from typing import Any

_WORLD_STATE: Any | None = None


def set_world_state(state: Any) -> None:
    global _WORLD_STATE
    _WORLD_STATE = state


def get_world_state() -> Any:
    if _WORLD_STATE is None:
        raise RuntimeError("world_state not initialized")
    return _WORLD_STATE
