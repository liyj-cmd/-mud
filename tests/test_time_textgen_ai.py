from pathlib import Path

from core.data_loader import load_lexicon, load_locations, load_npcs
from core.models import WorldState
from core.npc_ai import update_npc
from core.textgen import StyleGuide, TextGenerator
from core.time import ShichenConfig, shichen_text


def test_shichen_conversion() -> None:
    config = ShichenConfig(ticks_per_ke=60, ke_per_shichen=8)
    assert shichen_text(0, config).startswith("子时")
    assert shichen_text(60, config).endswith("2刻")


def test_textgen_reproducible() -> None:
    lexicon = load_lexicon(Path("text/lexicon.yaml"))
    style = StyleGuide.from_markdown(Path("text/style_guidelines.md"))
    rng1 = __import__("random").Random(42)
    rng2 = __import__("random").Random(42)
    tg1 = TextGenerator(lexicon, rng1, style, True)
    tg2 = TextGenerator(lexicon, rng2, style, True)
    msg1 = tg1.render_rumor("rumor_blade_manual", {"rumor_opener": "听闻", "rumor_body": ""})
    msg2 = tg2.render_rumor("rumor_blade_manual", {"rumor_opener": "听闻", "rumor_body": ""})
    assert msg1 == msg2


def test_npc_ai_reproducible() -> None:
    lexicon = load_lexicon(Path("text/lexicon.yaml"))
    locations = load_locations(Path("data/locations.yaml"))
    npcs = load_npcs(Path("data/npcs.yaml"))
    world_state = WorldState(
        world_tick=5,
        locations=locations,
        npcs=npcs,
        timeline=[],
        lexicon=lexicon,
        rng_seed=7,
        random=__import__("random").Random(7),
        dev_mode=True,
    )
    style = StyleGuide.from_markdown(Path("text/style_guidelines.md"))
    textgen = TextGenerator(lexicon, world_state.random, style, True)
    npc = npcs["wanderer_guest"]
    actions_first = update_npc(world_state, npc, textgen)
    world_state.random = __import__("random").Random(7)
    textgen = TextGenerator(lexicon, world_state.random, style, True)
    actions_second = update_npc(world_state, npc, textgen)
    assert [action.type for action in actions_first] == [action.type for action in actions_second]
