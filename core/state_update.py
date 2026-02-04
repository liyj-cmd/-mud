from __future__ import annotations

from core.models import NPC, WorldAction, WorldState


def apply_actions(world_state: WorldState, actions: list[WorldAction]) -> None:
    for action in actions:
        if action.type == "spawn_npc":
            npc: NPC = action.details["npc"]
            world_state.npcs[npc.id] = npc
        if action.type == "npc_move":
            npc_id = action.actor_id
            if npc_id and npc_id in world_state.npcs:
                world_state.npcs[npc_id].current_location_id = action.details["to_location_id"]
