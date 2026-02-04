from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from core.models import WorldAction


class WorldLogger:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def log_action(self, tick: int, action: WorldAction) -> None:
        record = {
            "tick": tick,
            "action_type": action.type,
            "actor_id": action.actor_id,
            "location_id": action.location_id,
            "details": action.details,
        }
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
