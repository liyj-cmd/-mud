import { getShichenLabel, isHourInRange } from "./time.js";

function findCurrentSlot(schedule, hour) {
  return schedule.find((slot) => isHourInRange(hour, slot.from, slot.to)) || null;
}

export function createScheduleSystem({ npcDefs, onNpcMove }) {
  const npcState = {};

  function applyTime(timeState, { initial = false } = {}) {
    for (const npc of npcDefs) {
      const slot = findCurrentSlot(npc.schedule, timeState.hour);
      if (!slot) {
        continue;
      }

      const prev = npcState[npc.id];
      const next = {
        location: slot.location,
        action: slot.action,
        hourFrom: slot.from,
        hourTo: slot.to
      };

      npcState[npc.id] = next;

      if (!initial && (!prev || prev.location !== next.location || prev.action !== next.action)) {
        onNpcMove({
          npc,
          from: prev ? prev.location : npc.home,
          to: next.location,
          action: next.action,
          shichen: getShichenLabel(timeState.hour)
        });
      }
    }
  }

  return {
    bootstrap(timeState) {
      applyTime(timeState, { initial: true });
    },
    update(timeState) {
      applyTime(timeState, { initial: false });
    },
    getNpcState(npcId) {
      return npcState[npcId] || null;
    },
    getNpcsAt(locationId) {
      return npcDefs.filter((npc) => {
        const state = npcState[npc.id];
        return state && state.location === locationId;
      });
    },
    serialize() {
      return JSON.parse(JSON.stringify(npcState));
    },
    hydrate(serialized) {
      if (!serialized || typeof serialized !== "object") {
        return;
      }
      for (const npc of npcDefs) {
        const saved = serialized[npc.id];
        if (saved) {
          npcState[npc.id] = saved;
        }
      }
    }
  };
}
