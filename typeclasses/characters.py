from evennia import DefaultCharacter

from commands.cmdset import WuxiaCmdSet


class Character(DefaultCharacter):
    def at_cmdset_get(self, **kwargs):
        super().at_cmdset_get(**kwargs)
        self.cmdset.add_default(WuxiaCmdSet, permanent=True)
