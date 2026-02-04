from evennia import Command

from core.time import ShichenConfig, shichen_text
from evennia_adapter import load_world_data
from evennia_adapter.state import get_world_state


class CmdShichen(Command):
    key = "shichen"
    aliases = ["time"]

    def func(self):
        try:
            world_state = get_world_state()
        except RuntimeError:
            world_state = load_world_data()
        shichen = shichen_text(world_state.world_tick, ShichenConfig())
        self.caller.msg(f"江湖刻漏：第{world_state.world_tick}转，{shichen}。")


class CmdStatus(Command):
    key = "status"

    def func(self):
        self.caller.msg("门派：未定；名望：未显；武学：未传。")
