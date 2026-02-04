"""一个极简的武侠单机 MUD 原型。

特点：
- 单机、命令行玩法
- 时间轴：玩家每次行动都会推进时间，同时其他角色也会行动
"""
from __future__ import annotations

from dataclasses import dataclass, field
import random


@dataclass
class Room:
    name: str
    description: str
    exits: dict[str, str]


@dataclass
class Character:
    name: str
    hp: int
    location: str
    is_player: bool = False

    def is_alive(self) -> bool:
        return self.hp > 0


@dataclass
class World:
    rooms: dict[str, Room]
    characters: list[Character] = field(default_factory=list)
    time: int = 0

    def get_room(self, room_name: str) -> Room:
        return self.rooms[room_name]

    def characters_in_room(self, room_name: str) -> list[Character]:
        return [c for c in self.characters if c.location == room_name and c.is_alive()]


class Game:
    def __init__(self) -> None:
        self.world = World(rooms=self._create_rooms())
        self.player = Character(name="你", hp=20, location="村口", is_player=True)
        self.world.characters.append(self.player)
        self.world.characters.append(Character(name="山贼", hp=10, location="小树林"))
        self.world.characters.append(Character(name="路人", hp=8, location="山道"))

    def _create_rooms(self) -> dict[str, Room]:
        return {
            "村口": Room(
                name="村口",
                description="一条小路通向远处的山林，村里人来来往往。",
                exits={"north": "小树林"},
            ),
            "小树林": Room(
                name="小树林",
                description="树影婆娑，偶尔有风吹过。",
                exits={"south": "村口", "east": "山道"},
            ),
            "山道": Room(
                name="山道",
                description="崎岖的山道蜿蜒向上，远处有隐约的雾气。",
                exits={"west": "小树林"},
            ),
        }

    def start(self) -> None:
        print("欢迎来到武侠单机 MUD 原型。输入 help 查看指令。")
        self.describe_current_room()
        while True:
            command = input("\n> ").strip()
            if not command:
                continue
            if command in {"quit", "exit"}:
                print("江湖再会！")
                break
            self.handle_command(command)

    def handle_command(self, command: str) -> None:
        parts = command.split()
        verb = parts[0]
        args = parts[1:]

        if verb == "help":
            self.show_help()
            return
        if verb == "look":
            self.describe_current_room()
            return
        if verb == "status":
            self.show_status()
            return
        if verb == "go":
            if not args:
                print("你想往哪走？用法：go <方向>")
                return
            self.move_player(args[0])
            self.advance_time()
            return
        if verb == "wait":
            print("你停下来观察四周。")
            self.advance_time()
            return

        print("无法识别的指令。输入 help 查看指令。")

    def show_help(self) -> None:
        print("\n可用指令：")
        print("  look          查看当前场景")
        print("  go <方向>     移动，如 go north")
        print("  wait          原地等待")
        print("  status        查看状态")
        print("  help          显示帮助")
        print("  quit/exit     退出游戏")

    def show_status(self) -> None:
        print(f"时间：第 {self.world.time} 刻")
        print(f"生命：{self.player.hp}")
        print(f"位置：{self.player.location}")

    def describe_current_room(self) -> None:
        room = self.world.get_room(self.player.location)
        print(f"\n【{room.name}】")
        print(room.description)
        if room.exits:
            print("可走方向：" + "、".join(room.exits.keys()))
        others = [c for c in self.world.characters_in_room(room.name) if not c.is_player]
        if others:
            print("你看到：" + "、".join(c.name for c in others))

    def move_player(self, direction: str) -> None:
        room = self.world.get_room(self.player.location)
        target = room.exits.get(direction)
        if not target:
            print("这条路走不通。")
            return
        self.player.location = target
        self.describe_current_room()

    def advance_time(self) -> None:
        self.world.time += 1
        print(f"\n时间推进到第 {self.world.time} 刻，其他人物开始行动……")
        self.npc_actions()
        if not self.player.is_alive():
            print("你倒下了，江湖路到此为止。")
            raise SystemExit(0)

    def npc_actions(self) -> None:
        for npc in [c for c in self.world.characters if not c.is_player and c.is_alive()]:
            if npc.location == self.player.location:
                self.npc_attack(npc)
            else:
                self.npc_move(npc)

    def npc_attack(self, npc: Character) -> None:
        damage = random.randint(1, 4)
        self.player.hp -= damage
        print(f"{npc.name} 向你出手，造成 {damage} 点伤害！")
        if self.player.is_alive():
            print(f"你还剩 {self.player.hp} 点生命。")

    def npc_move(self, npc: Character) -> None:
        room = self.world.get_room(npc.location)
        if not room.exits:
            return
        direction = random.choice(list(room.exits.values()))
        npc.location = direction
        if npc.location == self.player.location:
            print(f"{npc.name} 走了过来，与你不期而遇！")


if __name__ == "__main__":
    Game().start()
