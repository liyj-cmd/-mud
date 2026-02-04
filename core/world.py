from __future__ import annotations

import random
from pathlib import Path
from typing import Any

from core.data_loader import load_lexicon, load_locations, load_npcs, load_timeline
from core.models import WorldState


def load_world(data_dir: Path, seed: int, dev_mode: bool = True) -> WorldState:
    locations = load_locations(data_dir / "locations.yaml")
    npcs = load_npcs(data_dir / "npcs.yaml")
    timeline = load_timeline(data_dir / "timeline.yaml")
    lexicon = load_lexicon(data_dir / "lexicon.yaml")
    rng = random.Random(seed)
    return WorldState(
        world_tick=0,
        locations=locations,
        npcs=npcs,
        timeline=timeline,
        lexicon=lexicon,
        rng_seed=seed,
        random=rng,
        dev_mode=dev_mode,
    )
