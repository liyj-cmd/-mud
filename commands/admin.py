from evennia import Command

from evennia_adapter import ensure_npcs_exist, ensure_rooms_exist, load_world_data
from evennia_adapter.tick_service import start_world_ticker


class CmdReloadWorld(Command):
    key = "reloadworld"
    locks = "cmd:perm(Admin)"

    def func(self):
        world_state = load_world_data()
        ensure_rooms_exist(world_state)
        ensure_npcs_exist(world_state)
        self.caller.msg("江湖风云已重新铺陈。")


class CmdStartWorld(Command):
    key = "startworld"
    locks = "cmd:perm(Admin)"

    def func(self):
        world_state = load_world_data()
        ensure_rooms_exist(world_state)
        ensure_npcs_exist(world_state)
        start_world_ticker()
        self.caller.msg("江湖时辰已然转动。")
