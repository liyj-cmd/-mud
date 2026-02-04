from __future__ import annotations

from pathlib import Path
from typing import Any

from core.world import load_world
from evennia_adapter.state import set_world_state


def load_world_data(seed: int = 42, dev_mode: bool = True) -> Any:
    world_state = load_world(Path("data"), seed=seed, dev_mode=dev_mode)
    set_world_state(world_state)
    return world_state


def ensure_rooms_exist(world_state: Any) -> None:
    try:
        from evennia import DefaultExit, create_object
        from typeclasses.rooms import Room
    except Exception:
        return
    rooms_by_id = {}
    for location in world_state.locations.values():
        existing = Room.objects.filter(
            db_attributes__db_key="world_id", db_attributes__db_value=location.id
        )
        if existing:
            room = existing[0]
        else:
            room = create_object(
                Room, key=location.name, location=None, attributes=[("world_id", location.id)]
            )
        room.db.desc = location.desc
        rooms_by_id[location.id] = room
    for location in world_state.locations.values():
        room = rooms_by_id.get(location.id)
        if not room:
            continue
        for direction, target_id in location.exits.items():
            target_room = rooms_by_id.get(target_id)
            if not target_room:
                continue
            existing_exit = DefaultExit.objects.filter(db_key=direction, db_location=room)
            if existing_exit:
                continue
            create_object(DefaultExit, key=direction, location=room, destination=target_room)


def ensure_npcs_exist(world_state: Any) -> None:
    try:
        from evennia import create_object
        from typeclasses.characters import Character
        from typeclasses.rooms import Room
    except Exception:
        return
    rooms_by_id = {
        room.db.world_id: room
        for room in Room.objects.filter(db_attributes__db_key="world_id")
    }
    for npc in world_state.npcs.values():
        if not Character.objects.filter(db_attributes__db_key="world_id", db_attributes__db_value=npc.id):
            location = rooms_by_id.get(npc.current_location_id)
            create_object(
                Character,
                key=npc.name,
                location=location,
                attributes=[
                    ("world_id", npc.id),
                    ("faction", npc.faction),
                    ("ai_profile", npc.ai_profile),
                    ("speech_profile", npc.speech_profile),
                    ("current_room_id", npc.current_location_id),
                ],
            )


def ensure_npc_exists(npc: Any) -> None:
    try:
        from evennia import create_object
        from typeclasses.characters import Character
    except Exception:
        return
    if Character.objects.filter(db_attributes__db_key="world_id", db_attributes__db_value=npc.id):
        return
    location = None
    try:
        from typeclasses.rooms import Room

        rooms = Room.objects.filter(
            db_attributes__db_key="world_id", db_attributes__db_value=npc.current_location_id
        )
        if rooms:
            location = rooms[0]
    except Exception:
        location = None
    create_object(
        Character,
        key=npc.name,
        location=location,
        attributes=[
            ("world_id", npc.id),
            ("faction", npc.faction),
            ("ai_profile", npc.ai_profile),
            ("speech_profile", npc.speech_profile),
            ("current_room_id", npc.current_location_id),
        ],
    )


def broadcast_to_room(room_id: str, message: str) -> None:
    try:
        from typeclasses.rooms import Room
    except Exception:
        return
    rooms = Room.objects.filter(db_attributes__db_key="world_id", db_attributes__db_value=room_id)
    for room in rooms:
        room.msg_contents(message)


def move_npc(npc_id: str, to_room_id: str) -> None:
    try:
        from typeclasses.characters import Character
        from typeclasses.rooms import Room
    except Exception:
        return
    npcs = Character.objects.filter(db_attributes__db_key="world_id", db_attributes__db_value=npc_id)
    rooms = Room.objects.filter(db_attributes__db_key="world_id", db_attributes__db_value=to_room_id)
    if not npcs or not rooms:
        return
    target = rooms[0]
    for npc in npcs:
        npc.move_to(target)
        npc.db.current_room_id = to_room_id


def apply_actions(actions: list[Any]) -> None:
    for action in actions:
        if action.type == "broadcast":
            broadcast_to_room(action.location_id, action.details["message"])
        elif action.type == "npc_move":
            move_npc(action.actor_id, action.details["to_location_id"])
            if "message" in action.details:
                broadcast_to_room(action.location_id, action.details["message"])
        elif action.type == "spawn_npc":
            ensure_npc_exists(action.details["npc"])
