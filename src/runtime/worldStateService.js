import { getFactionById, clampReputation } from "../data/factions.js";
import { getNpcById } from "../data/npcs.js";
import { createInitialPlayer, ensurePlayerState } from "../systems/progression.js";
import { DEFAULT_TIME } from "../systems/time.js";

export function createWorldStateService() {
  return {
    createPlayer({ name, alignment }) {
      return ensurePlayerState(createInitialPlayer({ name, alignment }));
    },
    restorePlayer(player) {
      return ensurePlayerState(player);
    },
    normalizeTime(timeState) {
      if (!timeState || typeof timeState !== "object") {
        return { ...DEFAULT_TIME };
      }
      const day = Number.isFinite(timeState.day) ? Math.max(1, Math.round(timeState.day)) : DEFAULT_TIME.day;
      const hour = Number.isFinite(timeState.hour) ? clamp(Math.round(timeState.hour), 0, 23) : DEFAULT_TIME.hour;
      const minute = Number.isFinite(timeState.minute) ? clamp(Math.round(timeState.minute), 0, 59) : DEFAULT_TIME.minute;
      return { day, hour, minute };
    },
    adjustNpcRelation(player, npcId, delta) {
      if (!player || !Number.isFinite(delta)) {
        return null;
      }
      const current = Number.isFinite(player.relationships[npcId]) ? player.relationships[npcId] : 0;
      const next = clamp(Math.round(current + delta), -100, 100);
      player.relationships[npcId] = next;
      const npc = getNpcById(npcId);
      return {
        npcId,
        npcName: npc ? npc.name : npcId,
        delta,
        value: next
      };
    },
    adjustFactionReputation(player, factionId, delta) {
      if (!player || !Number.isFinite(delta)) {
        return null;
      }
      const current = Number.isFinite(player.reputations[factionId]) ? player.reputations[factionId] : 0;
      const next = clampReputation(current + delta);
      player.reputations[factionId] = next;
      const faction = getFactionById(factionId);
      return {
        factionId,
        factionName: faction ? faction.name : factionId,
        delta,
        value: next
      };
    }
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
