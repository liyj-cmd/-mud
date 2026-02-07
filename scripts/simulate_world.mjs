#!/usr/bin/env node
import { getRuntimeContent } from "../src/content/index.js";
import { createInitialPlayer, computeDerivedStats, addExperience, normalizeVitals, ensurePlayerState } from "../src/systems/progression.js";
import { createEventSystem } from "../src/systems/events.js";
import { createScheduleSystem } from "../src/systems/schedule.js";
import { DEFAULT_TIME, advanceTime } from "../src/systems/time.js";
import { createBattle, resolveBattleRound } from "../src/systems/combat.js";
import { applyEffectPack } from "../src/systems/effectApplier.js";
import { createDialogueRuntime } from "../src/runtime/dialogueRuntime.js";
import { createQuestRuntime } from "../src/runtime/questRuntime.js";
import { getAdjacentNodeIds } from "../src/data/map.js";
import { resolveBattleTarget } from "../src/systems/battleActorFactory.js";

const args = parseArgs(process.argv.slice(2));
const runs = args.runs ?? 50;
const steps = args.steps ?? 300;
const seed = args.seed ?? 20260207;

const rng = createSeededRng(seed);
const originalRandom = Math.random;
Math.random = () => rng.nextFloat();

try {
  const summary = simulate({ runs, steps, rng });
  printSummary(summary, { runs, steps, seed });
} finally {
  Math.random = originalRandom;
}

function simulate({ runs, steps, rng }) {
  const content = getRuntimeContent();
  const eventSystem = createEventSystem(content.events);
  const dialogueRuntime = createDialogueRuntime({ eventDefs: content.events });

  const aggregate = {
    levels: [],
    gold: [],
    potential: [],
    victories: 0,
    defeats: 0,
    battles: 0,
    eventsResolved: 0,
    questCompletions: 0
  };

  for (let run = 0; run < runs; run += 1) {
    const player = ensurePlayerState(
      createInitialPlayer({
        name: `sim_${run + 1}`,
        alignment: rng.nextFloat() < 0.5 ? "侠义" : "诡道"
      })
    );

    const state = {
      player,
      time: { ...DEFAULT_TIME },
      eventHistory: {}
    };

    const scheduler = createScheduleSystem({
      npcDefs: content.npcs,
      onNpcMove: () => {}
    });
    scheduler.bootstrap(state.time);

    const questRuntime = createQuestRuntime({
      getPlayer: () => state.player,
      getTime: () => state.time
    });

    for (let step = 0; step < steps; step += 1) {
      runOneStep({
        state,
        scheduler,
        eventSystem,
        dialogueRuntime,
        enemies: content.enemies,
        questRuntime,
        aggregate,
        rng
      });
    }

    aggregate.levels.push(state.player.level);
    aggregate.gold.push(state.player.gold);
    aggregate.potential.push(state.player.potential);

    for (const value of Object.values(state.player.questStates)) {
      if (value === "completed") {
        aggregate.questCompletions += 1;
      }
    }
  }

  return aggregate;
}

function runOneStep({ state, scheduler, eventSystem, dialogueRuntime, enemies, questRuntime, aggregate, rng }) {
  const actionRoll = rng.nextFloat();

  if (actionRoll < 0.35) {
    tryMove(state, rng);
    advanceWithSchedule(state, scheduler, 20);
  } else if (actionRoll < 0.55) {
    state.player.hp += 24;
    state.player.qi += 16;
    normalizeVitals(state.player);
    advanceWithSchedule(state, scheduler, 60);
  } else if (actionRoll < 0.75) {
    tryTalk(state, scheduler, dialogueRuntime, eventSystem, questRuntime, aggregate);
    advanceWithSchedule(state, scheduler, 10);
  } else {
    advanceWithSchedule(state, scheduler, 20);
  }

  const force = actionRoll >= 0.75;
  const event = eventSystem.pickEvent(state, scheduler);
  if (!event) {
    return;
  }

  if (!force && rng.nextFloat() >= 0.72) {
    return;
  }

  const choice = pickRandom(event.choices, rng);
  const result = eventSystem.resolveChoice({
    event,
    choiceId: choice.id,
    state,
    onLog: () => {},
    startBattle: (battleConfig) => {
      aggregate.battles += 1;
      const outcome = simulateBattle({ player: state.player, battleConfig, enemies, questRuntime, time: state.time });
      if (outcome === "player") {
        aggregate.victories += 1;
      } else if (outcome === "enemy") {
        aggregate.defeats += 1;
      }
    }
  });

  if (result.ok) {
    aggregate.eventsResolved += 1;
  }
}

function tryMove(state, rng) {
  const neighbors = getAdjacentNodeIds(state.player.location);
  if (neighbors.length === 0) {
    return;
  }
  const to = pickRandom(neighbors, rng);
  state.player.location = to;
}

function tryTalk(state, scheduler, dialogueRuntime, eventSystem) {
  const npcsHere = scheduler.getNpcsAt(state.player.location);
  if (npcsHere.length === 0) {
    return;
  }
  const npc = npcsHere[Math.floor(Math.random() * npcsHere.length)];
  dialogueRuntime.interact({
    npc,
    state,
    canShowEvent: (event) => eventSystem.getAvailableEvents(state, scheduler).some((item) => item.id === event.id),
    adjustNpcRelation: (npcId, delta) => {
      const current = Number.isFinite(state.player.relationships[npcId]) ? state.player.relationships[npcId] : 0;
      state.player.relationships[npcId] = Math.max(-100, Math.min(100, Math.round(current + delta)));
    },
    adjustFactionReputation: (factionId, delta) => {
      const current = Number.isFinite(state.player.reputations[factionId]) ? state.player.reputations[factionId] : 0;
      state.player.reputations[factionId] = Math.max(-100, Math.min(100, Math.round(current + delta)));
    }
  });
}

function simulateBattle({ player, battleConfig, enemies, questRuntime, time }) {
  const enemy = resolveBattleTarget({ battleConfig, enemies });
  if (!enemy) {
    return null;
  }

  const derived = computeDerivedStats(player);
  const battle = createBattle({
    enemy,
    player,
    derivedStats: derived,
    onVictory: battleConfig.onVictory,
    onDefeat: battleConfig.onDefeat
  });

  let guard = 0;
  while (!battle.finished && guard < 220) {
    resolveBattleRound(battle);
    guard += 1;
  }

  player.hp = battle.player.hp;
  player.qi = battle.player.qi;
  normalizeVitals(player);

  if (battle.winner === "player") {
    addExperience(player, battle.rewards.xp);
    player.potential += battle.rewards.potential;
    player.gold += battle.rewards.gold;
    player.qi += 6;

    if (battle.onVictory) {
      applyEffectPack({
        effects: battle.onVictory,
        player,
        time,
        questRuntime
      });
    }
  } else if (battle.winner === "enemy") {
    const current = computeDerivedStats(player);
    player.hp = Math.max(1, Math.floor(current.maxHp * 0.35));
    player.qi = Math.max(4, player.qi - 12);

    if (battle.onDefeat) {
      applyEffectPack({
        effects: battle.onDefeat,
        player,
        time,
        questRuntime
      });
    }
  }

  normalizeVitals(player);
  return battle.winner;
}

function advanceWithSchedule(state, scheduler, minutes) {
  const oldHour = state.time.hour;
  state.time = advanceTime(state.time, minutes);
  normalizeVitals(state.player);
  if (oldHour !== state.time.hour) {
    scheduler.update(state.time);
  }
}

function pickRandom(list, rng) {
  return list[Math.floor(rng.nextFloat() * list.length)];
}

function createSeededRng(seed) {
  let value = (seed >>> 0) || 1;
  return {
    nextFloat() {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 0x100000000;
    }
  };
}

function parseArgs(rawArgs) {
  const out = {};
  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    if (token === "--runs") {
      out.runs = Number(rawArgs[i + 1]);
      i += 1;
    } else if (token === "--steps") {
      out.steps = Number(rawArgs[i + 1]);
      i += 1;
    } else if (token === "--seed") {
      out.seed = Number(rawArgs[i + 1]);
      i += 1;
    }
  }
  return out;
}

function printSummary(summary, config) {
  console.log(`[simulation] runs=${config.runs} steps=${config.steps} seed=${config.seed}`);
  console.log(`[simulation] avg-level=${avg(summary.levels).toFixed(2)} avg-gold=${avg(summary.gold).toFixed(2)} avg-potential=${avg(summary.potential).toFixed(2)}`);
  console.log(`[simulation] events=${summary.eventsResolved} battles=${summary.battles} wins=${summary.victories} losses=${summary.defeats}`);
  console.log(`[simulation] completed-quest-states=${summary.questCompletions}`);
}

function avg(list) {
  if (!list || list.length === 0) {
    return 0;
  }
  return list.reduce((sum, value) => sum + value, 0) / list.length;
}
