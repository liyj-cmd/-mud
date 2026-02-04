from evennia import default_cmds

from commands.admin import CmdReloadWorld, CmdStartWorld
from commands.aliases import CmdKan, CmdShuo, CmdZou
from commands.default import CmdShichen, CmdStatus


class WuxiaCmdSet(default_cmds.CharacterCmdSet):
    def at_cmdset_creation(self):
        super().at_cmdset_creation()
        self.add(CmdShichen())
        self.add(CmdStatus())
        self.add(CmdKan())
        self.add(CmdZou())
        self.add(CmdShuo())
        self.add(CmdReloadWorld())
        self.add(CmdStartWorld())
