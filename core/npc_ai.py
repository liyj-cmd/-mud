from __future__ import annotations

from typing import Any

from core.models import NPC, WorldAction, WorldState


DIRECTION_TEXT = {
    "east": "向东",
    "west": "向西",
    "north": "向北",
    "south": "向南",
    "up": "向上",
    "down": "向下",
}


def _pick_direction(world_state: WorldState, npc: NPC) -> tuple[str, str] | None:
    location = world_state.locations[npc.current_location_id]
    exits = list(location.exits.items())
    if not exits:
        return None
    direction, target_id = exits[world_state.random.randrange(len(exits))]
    target = world_state.locations[target_id]
    if npc.ai_profile.allowed_location_tags:
        if not any(tag in target.ambience_tags for tag in npc.ai_profile.allowed_location_tags):
            return None
    return direction, target_id


def update_npc(world_state: WorldState, npc: NPC, textgen: Any) -> list[WorldAction]:
    actions: list[WorldAction] = []
    if world_state.world_tick % npc.ai_profile.period_tick != 0:
        return actions
    if npc.ai_profile.behavior_state == "inn_service":
        idle_actions = world_state.lexicon["npc_idle_actions"]
        message = idle_actions[world_state.random.randrange(len(idle_actions))]
        actions.append(
            WorldAction(
                type="broadcast",
                actor_id=npc.id,
                location_id=npc.current_location_id,
                details={"message": message},
            )
        )
        return actions
    if world_state.random.random() < npc.speech_profile.talk_probability:
        template_key = npc.speech_profile.template_keys[
            world_state.random.randrange(len(npc.speech_profile.template_keys))
        ]
        context = {
            "npc": npc.name,
            "address": textgen._choose(world_state.lexicon["forms_of_address"]),
            "verb": textgen._choose(world_state.lexicon["action_verbs"]),
            "ambience": textgen._choose(world_state.lexicon["ambience_words"]),
        }
        message = textgen.render_say(template_key, context)
        actions.append(
            WorldAction(
                type="broadcast",
                actor_id=npc.id,
                location_id=npc.current_location_id,
                details={"message": message},
            )
        )
    if world_state.random.random() < npc.ai_profile.move_probability:
        move = _pick_direction(world_state, npc)
        if move:
            direction, target_id = move
            message = textgen.render_movement(npc.name, DIRECTION_TEXT[direction])
            actions.append(
                WorldAction(
                    type="npc_move",
                    actor_id=npc.id,
                    location_id=npc.current_location_id,
                    details={"to_location_id": target_id, "message": message},
                )
            )
    return actions
