import { ensurePlayerState } from "../systems/progression.js";

export function createDialogueRuntime({ eventDefs }) {
  const specialEvents = {
    masterSecretOrder: eventDefs.find((event) => event.id === "master_secret_order") || null
  };

  return {
    interact({ npc, state, canShowEvent, adjustNpcRelation, adjustFactionReputation }) {
      const logs = [];
      if (!npc || !state?.player || !state?.time) {
        return { ok: false, message: "无效的对话上下文", logs, line: "", triggerEventId: null };
      }

      const player = ensurePlayerState(state.player);
      const time = state.time;

      if (!player.knownNpcs.includes(npc.id)) {
        player.knownNpcs.push(npc.id);
        logs.push(`你记住了${npc.name}的名号。`);
      }

      if (npc.affinityOnTalk && adjustNpcRelation) {
        adjustNpcRelation(npc.id, npc.affinityOnTalk, { log: false });
      }

      if (npc.factionId && adjustFactionReputation) {
        adjustFactionReputation(npc.factionId, 1, { log: false });
      }

      if (npc.id === "merchant_zhou" && time.hour >= 6 && time.hour < 14) {
        player.potential += 2;
        logs.push("你从商贩口中听得些门道，潜能+2。");
      }

      let triggerEventId = null;
      if (
        npc.id === "master_yue" &&
        specialEvents.masterSecretOrder &&
        typeof canShowEvent === "function" &&
        canShowEvent(specialEvents.masterSecretOrder)
      ) {
        triggerEventId = specialEvents.masterSecretOrder.id;
        logs.push("掌门递来一封密令，已在右侧出现抉择。");
      }

      const line = pickNpcTalk(npc, player, time);

      return {
        ok: true,
        logs,
        line,
        triggerEventId
      };
    }
  };
}

function pickNpcTalk(npc, player, time) {
  if (npc.id === "master_yue") {
    if (
      player.location === "huashan_hall" &&
      time.hour >= 19 &&
      time.hour < 21 &&
      !player.flags.quest_secret_done
    ) {
      return "戌时江风最急，胆大者方敢夜探黑木林。";
    }
  }

  if (npc.id === "disciple_qing") {
    if (time.hour >= 19 || time.hour < 5) {
      return "夜里林中脚步杂乱，你最好结伴而行。";
    }
  }

  if (npc.id === "merchant_zhou") {
    if (time.hour >= 6 && time.hour < 14) {
      return "午前行情最稳，你若要货可趁早。";
    }
  }

  return npc.talks?.[0]?.text || "江湖路远，自珍重。";
}
