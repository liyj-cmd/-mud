from __future__ import annotations

from typing import Any

from core.models import AIProfile, NPC, SpeechProfile, WorldAction, WorldState


def events_at_tick(world_state: WorldState) -> list[dict[str, Any]]:
    return [
        {"type": event.type, "payload": event.payload}
        for event in world_state.timeline
        if event.tick == world_state.world_tick
    ]


def handle_event(world_state: WorldState, event: dict[str, Any], textgen: Any) -> list[WorldAction]:
    event_type = event["type"]
    payload = event["payload"]
    if event_type == "spawn_npc":
        npc_id = payload["npc_id"]
        location_id = payload["location_id"]
        if npc_id in world_state.npcs:
            npc = world_state.npcs[npc_id]
        else:
            npc_def = payload["npc_def"]
            ai_def = npc_def["ai_profile"]
            speech_def = npc_def["speech_profile"]
            npc = NPC(
                id=npc_id,
                name=str(npc_def["name"]),
                title=str(npc_def["title"]),
                faction=str(npc_def["faction"]),
                home_location_id=location_id,
                current_location_id=location_id,
                ai_profile=AIProfile(
                    behavior_state=str(ai_def["behavior_state"]),
                    period_tick=int(ai_def["period_tick"]),
                    move_probability=float(ai_def["move_probability"]),
                    allowed_location_tags=list(ai_def["allowed_location_tags"]),
                ),
                speech_profile=SpeechProfile(
                    talk_probability=float(speech_def["talk_probability"]),
                    template_keys=list(speech_def["template_keys"]),
                ),
            )
        npc.current_location_id = location_id
        world_state.npcs[npc_id] = npc
        return [
            WorldAction(
                type="spawn_npc",
                actor_id=npc_id,
                location_id=location_id,
                details={"npc": npc},
            )
        ]
    if event_type == "npc_say":
        npc_id = payload["npc_id"]
        template_key = payload["template_key"]
        npc = world_state.npcs[npc_id]
        context = {
            "npc": npc.name,
            "address": textgen._choose(world_state.lexicon["forms_of_address"]),
            "verb": textgen._choose(world_state.lexicon["action_verbs"]),
            "ambience": textgen._choose(world_state.lexicon["ambience_words"]),
        }
        message = textgen.render_say(template_key, context)
        return [
            WorldAction(
                type="broadcast",
                actor_id=npc_id,
                location_id=npc.current_location_id,
                details={"message": message},
            )
        ]
    if event_type == "npc_move":
        npc_id = payload["npc_id"]
        to_location = payload["to_location_id"]
        return [
            WorldAction(
                type="npc_move",
                actor_id=npc_id,
                location_id=world_state.npcs[npc_id].current_location_id,
                details={"to_location_id": to_location},
            )
        ]
    if event_type == "rumor_broadcast":
        rumor_key = payload["rumor_key"]
        message = textgen.render_rumor(
            rumor_key,
            {
                "rumor_opener": textgen._choose(world_state.lexicon["rumor_openers"]),
                "rumor_body": "",
            },
        )
        actions: list[WorldAction] = []
        for location_id in payload["location_ids"]:
            actions.append(
                WorldAction(
                    type="broadcast",
                    actor_id=None,
                    location_id=location_id,
                    details={"message": message},
                )
            )
        return actions
    return []
