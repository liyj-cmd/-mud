import { ensurePlayerState } from "../systems/progression.js";

export function createQuestRuntime({ getPlayer, getTime }) {
  function player() {
    const current = getPlayer();
    return current ? ensurePlayerState(current) : null;
  }

  return {
    getState(questId) {
      const p = player();
      if (!p || !questId) {
        return undefined;
      }
      return p.questStates[questId];
    },
    setState(questId, stateValue) {
      const p = player();
      if (!p || !questId) {
        return null;
      }
      p.questStates[questId] = stateValue;
      return p.questStates[questId];
    },
    advanceState(questId, step) {
      const p = player();
      if (!p || !questId) {
        return null;
      }

      if (Number.isFinite(step)) {
        const current = Number.isFinite(p.questStates[questId]) ? p.questStates[questId] : 0;
        p.questStates[questId] = current + step;
      } else {
        p.questStates[questId] = step;
      }

      return p.questStates[questId];
    },
    setChapter(chapterId) {
      const p = player();
      if (!p || typeof chapterId !== "string" || chapterId.length === 0) {
        return false;
      }
      p.world.chapter = chapterId;
      return true;
    },
    addTimeline(note) {
      const p = player();
      if (!p || typeof note !== "string" || note.length === 0) {
        return false;
      }
      const time = getTime();
      p.world.timeline.push({
        day: time?.day ?? 1,
        hour: time?.hour ?? 0,
        minute: time?.minute ?? 0,
        note
      });
      if (p.world.timeline.length > 120) {
        p.world.timeline = p.world.timeline.slice(-120);
      }
      return true;
    }
  };
}
