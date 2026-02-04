from evennia import Command


class CmdKan(Command):
    key = "kan"
    aliases = ["look"]

    def func(self):
        self.caller.execute_cmd("look")


class CmdZou(Command):
    key = "zou"
    aliases = ["go"]

    def func(self):
        if not self.args:
            self.caller.msg("你要往何处去？")
            return
        self.caller.execute_cmd(f"go {self.args}")


class CmdShuo(Command):
    key = "shuo"
    aliases = ["say"]

    def func(self):
        if not self.args:
            self.caller.msg("你要说些什么？")
            return
        self.caller.execute_cmd(f"say {self.args}")
