from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    import yaml  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    from core import simple_yaml as yaml

from core.models import AIProfile, Location, NPC, SpeechProfile, TimelineEvent


class DataValidationError(ValueError):
    pass


def _require_fields(data: dict[str, Any], fields: list[str], label: str) -> None:
    missing = [field for field in fields if field not in data]
    if missing:
        raise DataValidationError(f"{label} missing fields: {missing}")


def load_locations(path: Path) -> dict[str, Location]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    locations = {}
    for entry in raw.get("locations", []):
        _require_fields(entry, ["id", "name", "desc", "exits", "ambience_tags"], "location")
        location = Location(
            id=str(entry["id"]),
            name=str(entry["name"]),
            desc=str(entry["desc"]),
            exits=dict(entry["exits"]),
            ambience_tags=list(entry["ambience_tags"]),
        )
        locations[location.id] = location
    return locations


def load_npcs(path: Path) -> dict[str, NPC]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    npcs: dict[str, NPC] = {}
    for entry in raw.get("npcs", []):
        _require_fields(
            entry,
            [
                "id",
                "name",
                "title",
                "faction",
                "home_location_id",
                "ai_profile",
                "speech_profile",
            ],
            "npc",
        )
        ai = entry["ai_profile"]
        speech = entry["speech_profile"]
        _require_fields(
            ai,
            ["behavior_state", "period_tick", "move_probability", "allowed_location_tags"],
            "ai_profile",
        )
        _require_fields(speech, ["talk_probability", "template_keys"], "speech_profile")
        npc = NPC(
            id=str(entry["id"]),
            name=str(entry["name"]),
            title=str(entry["title"]),
            faction=str(entry["faction"]),
            home_location_id=str(entry["home_location_id"]),
            ai_profile=AIProfile(
                behavior_state=str(ai["behavior_state"]),
                period_tick=int(ai["period_tick"]),
                move_probability=float(ai["move_probability"]),
                allowed_location_tags=list(ai["allowed_location_tags"]),
            ),
            speech_profile=SpeechProfile(
                talk_probability=float(speech["talk_probability"]),
                template_keys=list(speech["template_keys"]),
            ),
            current_location_id=str(entry["home_location_id"]),
        )
        npcs[npc.id] = npc
    return npcs


def load_timeline(path: Path) -> list[TimelineEvent]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    events: list[TimelineEvent] = []
    for entry in raw.get("timeline", []):
        _require_fields(entry, ["tick", "type", "payload"], "timeline_event")
        events.append(
            TimelineEvent(
                tick=int(entry["tick"]),
                type=str(entry["type"]),
                payload=dict(entry["payload"]),
            )
        )
    return sorted(events, key=lambda event: event.tick)


def load_lexicon(path: Path) -> dict[str, Any]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if "lexicon" not in raw:
        raise DataValidationError("lexicon missing root key")
    return dict(raw["lexicon"])
