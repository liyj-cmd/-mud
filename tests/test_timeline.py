from pathlib import Path

from core.data_loader import load_lexicon, load_npcs, load_timeline
from core.models import WorldState
from core.textgen import StyleGuide, TextGenerator
from core.timeline import handle_event


def test_timeline_sorted(tmp_path: Path) -> None:
    data = tmp_path / "timeline.yaml"
    data.write_text(
        "timeline:\n  - tick: 2\n    type: npc_move\n    payload: {}\n  - tick: 1\n    type: npc_move\n    payload: {}\n",
        encoding="utf-8",
    )
    events = load_timeline(data)
    assert [event.tick for event in events] == [1, 2]


def test_event_spawn_npc(tmp_path: Path) -> None:
    lexicon = load_lexicon(Path("text/lexicon.yaml"))
    npcs = load_npcs(Path("data/npcs.yaml"))
    world_state = WorldState(
        world_tick=0,
        locations={},
        npcs=npcs,
        timeline=[],
        lexicon=lexicon,
        rng_seed=1,
        random=__import__("random").Random(1),
        dev_mode=True,
    )
    style = StyleGuide.from_markdown(Path("text/style_guidelines.md"))
    textgen = TextGenerator(lexicon, world_state.random, style, True)
    event = {
        "type": "spawn_npc",
        "payload": {
            "npc_id": "mysterious_swordsman",
            "location_id": "inn_hall",
            "npc_def": {
                "name": "神秘剑客",
                "title": "背剑之人",
                "faction": "不明",
                "ai_profile": {
                    "behavior_state": "scripted",
                    "period_tick": 999,
                    "move_probability": 0.0,
                    "allowed_location_tags": ["inn"],
                },
                "speech_profile": {"talk_probability": 0.0, "template_keys": ["swordsman_line"]},
            },
        },
    }
    actions = handle_event(world_state, event, textgen)
    assert actions and actions[0].type == "spawn_npc"
