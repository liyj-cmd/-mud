from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Location:
    id: str
    name: str
    desc: str
    ambience_tags: list[str]
    exits: dict[str, str]


@dataclass(frozen=True)
class AIProfile:
    behavior_state: str
    period_tick: int
    move_probability: float
    allowed_location_tags: list[str]


@dataclass(frozen=True)
class SpeechProfile:
    talk_probability: float
    template_keys: list[str]


@dataclass
class NPC:
    id: str
    name: str
    title: str
    faction: str
    home_location_id: str
    ai_profile: AIProfile
    speech_profile: SpeechProfile
    current_location_id: str


@dataclass(frozen=True)
class TimelineEvent:
    tick: int
    type: str
    payload: dict[str, Any]


@dataclass(frozen=True)
class WorldAction:
    type: str
    actor_id: str | None
    location_id: str | None
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class WorldState:
    world_tick: int
    locations: dict[str, Location]
    npcs: dict[str, NPC]
    timeline: list[TimelineEvent]
    lexicon: dict[str, Any]
    rng_seed: int
    random: Any
    dev_mode: bool = True
