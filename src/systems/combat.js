import { getMartialById } from "../data/martialArts.js";

const OPENERS = {
  fist: ["沉肩进步", "拧腰换步", "错掌抢中", "转身贴近"],
  weapon: ["腕劲一抖", "斜步抢位", "刀光斜卷", "剑锋先至"],
  internal: ["真气一提", "丹田鼓荡", "内息走周天", "气沉百脉"],
  qinggong: ["足尖一点", "身影骤偏", "借势腾挪", "踏步穿隙"],
  default: ["身形一晃", "提气前压", "目光一凝", "发劲抢攻"]
};

const HITS = {
  fist: ["劲力透体", "拳风入骨", "掌劲震得对手后退半步"],
  weapon: ["锋芒直破招架", "兵刃擦出火星", "寒光破开护势"],
  internal: ["气劲层层逼入", "暗劲在经脉间炸开", "真气震得衣袍猎猎"],
  qinggong: ["身法回折后再补一击", "借位突进命中空门", "贴身一击后立刻抽身"],
  default: ["招式落点极准", "气势迫人", "对手仓促失守"]
};

const BREAK_LOGS = ["你这一式撕开了对手护势", "破招一线得手", "招劲穿透对手门户"];
const PARRY_LOGS = ["对手借劲卸力", "对方顺势化招", "来劲被对手圆转带开"];
const CRIT_LOGS = ["劲透要穴", "杀招正中空门", "攻势如雷霆贯体"];

const BATTLE_CONSTANTS = {
  minHit: 30,
  maxHit: 98,
  minDodge: 4,
  maxDodge: 45,
  minBlock: 4,
  maxBlock: 40,
  minCrit: 3,
  maxCrit: 60
};

export function createBattle({ enemy, player, derivedStats, onVictory, onDefeat }) {
  const playerMoves = collectPlayerMoves(player);
  const enemyMoves = collectEnemyMoves(enemy);
  const enemyStats = deriveEnemyCombatStats(enemy);

  return {
    id: `${enemy.id}_${Date.now()}`,
    round: 0,
    finished: false,
    winner: null,
    pendingActions: [],
    player: {
      name: player.name,
      maxHp: derivedStats.maxHp,
      hp: player.hp,
      maxQi: derivedStats.maxQi,
      qi: player.qi,
      attack: derivedStats.attack,
      hit: derivedStats.hit,
      dodge: derivedStats.dodge,
      block: derivedStats.block,
      parry: derivedStats.parry,
      break: derivedStats.break,
      crit: derivedStats.crit,
      speed: derivedStats.speed,
      moves: playerMoves.length > 0 ? playerMoves : [normalizeMove("平掌直进", "fist")]
    },
    enemy: {
      id: enemy.id,
      name: enemy.name,
      maxHp: enemy.maxHp,
      hp: enemy.maxHp,
      maxQi: enemyStats.maxQi,
      qi: enemyStats.maxQi,
      attack: enemyStats.attack,
      hit: enemyStats.hit,
      dodge: enemyStats.dodge,
      block: enemyStats.block,
      parry: enemyStats.parry,
      break: enemyStats.break,
      crit: enemyStats.crit,
      speed: enemyStats.speed,
      moves: enemyMoves
    },
    animation: {
      playerPose: "idle",
      enemyPose: "idle",
      flash: "none",
      strikeAt: 0,
      activeSide: null,
      result: null
    },
    rewards: {
      xp: enemy.xpReward,
      potential: enemy.potentialReward,
      gold: enemy.goldReward
    },
    onVictory: onVictory || null,
    onDefeat: onDefeat || null
  };
}

export function resolveBattleRound(battle) {
  if (!battle || battle.finished) {
    return [];
  }

  const logs = [];

  if (battle.pendingActions.length === 0) {
    battle.round += 1;
    logs.push(`第${battle.round}回合`);

    const playerActsFirst =
      battle.player.speed + battle.player.qi * 0.015 + randomInt(0, 4) >=
      battle.enemy.speed + battle.enemy.qi * 0.015 + randomInt(0, 4);

    battle.pendingActions = playerActsFirst
      ? [
          { attackerSide: "player", defenderSide: "enemy" },
          { attackerSide: "enemy", defenderSide: "player" }
        ]
      : [
          { attackerSide: "enemy", defenderSide: "player" },
          { attackerSide: "player", defenderSide: "enemy" }
        ];
  }

  const action = battle.pendingActions.shift();
  if (!action) {
    return logs;
  }

  const attacker = battle[action.attackerSide];
  const defender = battle[action.defenderSide];
  if (attacker.hp <= 0 || defender.hp <= 0) {
    battle.pendingActions = [];
    finalizeBattle(battle, logs);
    return logs;
  }

  performStrike({
    attacker,
    defender,
    attackerTag: action.attackerSide === "player" ? "你" : battle.enemy.name,
    defenderTag: action.defenderSide === "player" ? "你" : battle.enemy.name,
    logs,
    battle,
    attackerSide: action.attackerSide
  });

  if (battle.player.hp <= 0 || battle.enemy.hp <= 0) {
    battle.pendingActions = [];
    finalizeBattle(battle, logs);
  }

  if (battle.pendingActions.length === 0 && !battle.finished) {
    battle.animation.playerPose = "idle";
    battle.animation.enemyPose = "idle";
    battle.animation.flash = "none";
  }

  return logs;
}

function performStrike({ attacker, defender, attackerTag, defenderTag, logs, battle, attackerSide }) {
  const move = randomPick(attacker.moves);
  const qiState = spendMoveQi(attacker, move, logs, attackerTag);
  logs.push(`${attackerTag}${describeMoveOpen(move)}，一式「${move.name}」直逼${defenderTag}。`);
  const moveSpeed = Number.isFinite(move.speedBonus) ? move.speedBonus : 0;

  const hitChance = clamp(
    attacker.hit + move.hitBonus + moveSpeed * 0.45 - defender.dodge * 0.66 - defender.speed * 0.14,
    BATTLE_CONSTANTS.minHit,
    BATTLE_CONSTANTS.maxHit
  );

  if (randomInt(1, 100) > hitChance) {
    recoverQi(defender, 1);
    logs.push(`${defenderTag}错步避实，招锋擦肩而过。`);
    setAnim(battle, attackerSide, "strike", "evade", "miss");
    return;
  }

  const dodgeChance = clamp(
    defender.dodge * 0.24 + defender.speed * 0.11 - attacker.hit * 0.08 - moveSpeed * 0.18 + move.dodgeBonus * 0.2,
    BATTLE_CONSTANTS.minDodge,
    BATTLE_CONSTANTS.maxDodge
  );
  if (randomInt(1, 100) <= dodgeChance) {
    recoverQi(defender, 1);
    logs.push(`${defenderTag}身法轻掠，惊险避开杀招。`);
    setAnim(battle, attackerSide, "strike", "evade", "dodge");
    return;
  }

  const breakScore = attacker.break + move.breakBonus + randomInt(0, 20);
  const parryScore = defender.parry + move.parryBonus * 0.15 + randomInt(0, 20);
  const breakMargin = breakScore - parryScore;

  let damageScale = qiState.damageScale;
  let resultTag = "hit";
  let appliedParry = false;
  let appliedBlock = false;

  if (breakMargin >= 8) {
    damageScale *= 1 + clamp(breakMargin / 45, 0.12, 0.48);
    resultTag = "guardbreak";
    logs.push(`${randomPick(BREAK_LOGS)}，${defenderTag}被迫硬接。`);
  } else if (breakMargin <= -10) {
    appliedParry = true;
    damageScale *= 0.45;
    resultTag = "parry";
    logs.push(`${defenderTag}${randomPick(PARRY_LOGS)}。`);

    const counterChance = clamp(defender.parry * 0.18 + defender.crit * 0.12, 8, 34);
    if (randomInt(1, 100) <= counterChance) {
      const counterDamage = Math.max(1, Math.round(defender.attack * randomFloat(0.28, 0.45)));
      attacker.hp = Math.max(0, attacker.hp - counterDamage);
      logs.push(`${defenderTag}借势反震，${attackerTag}反受${counterDamage}点伤害。`);
      resultTag = "counter";
    }
  } else if (breakMargin <= -2) {
    appliedParry = true;
    damageScale *= 0.72;
    logs.push(`${defenderTag}勉力拆招，攻势被卸去几分。`);
  }

  const blockChance = clamp(
    defender.block * 0.2 + (appliedParry ? 8 : 0) - (breakMargin >= 8 ? 10 : 0),
    BATTLE_CONSTANTS.minBlock,
    BATTLE_CONSTANTS.maxBlock
  );
  if (randomInt(1, 100) <= blockChance) {
    appliedBlock = true;
    damageScale *= 0.62;
  }

  const critChance = clamp(
    attacker.crit + move.critBonus + moveSpeed * 0.15 + (breakMargin >= 8 ? 6 : 0),
    BATTLE_CONSTANTS.minCrit,
    BATTLE_CONSTANTS.maxCrit
  );
  const critical = randomInt(1, 100) <= critChance;
  if (critical) {
    damageScale *= 1.42;
    logs.push(`这一击${randomPick(CRIT_LOGS)}。`);
    resultTag = "crit";
  }

  const baseDamage = attacker.attack * move.damageRate * randomFloat(0.82, 1.22);
  const finalDamage = Math.max(1, Math.round(baseDamage * damageScale));
  defender.hp = Math.max(0, defender.hp - finalDamage);
  recoverQi(defender, 1);

  if (appliedBlock) {
    logs.push(`${defenderTag}强行格挡，${describeImpact(move, true)}，仍受${finalDamage}点伤害。`);
    setAnim(battle, attackerSide, "strike", "block", resultTag === "hit" ? "block" : resultTag);
    return;
  }

  logs.push(`${describeImpact(move, false)}，命中${defenderTag}，造成${finalDamage}点伤害。`);
  setAnim(battle, attackerSide, "strike", critical ? "hit" : "hit", resultTag);
}

function collectPlayerMoves(player) {
  const pool = [];
  const preparedIds = Object.values(player.skills.prepared || {});

  for (const skillId of preparedIds) {
    const skill = getMartialById(skillId);
    if (!skill || !Array.isArray(skill.moves)) {
      continue;
    }

    for (const move of skill.moves) {
      pool.push(normalizeMove(move, skill.slot));
    }
  }

  return pool;
}

function collectEnemyMoves(enemy) {
  return (enemy.moves || []).map((move) => normalizeMove(move, inferEnemyStyle(move)));
}

function normalizeMove(move, style = "default") {
  if (typeof move === "string") {
    return {
      name: move,
      style,
      damageRate: 1,
      hitBonus: 0,
      dodgeBonus: 0,
      blockBonus: 0,
      parryBonus: 0,
      breakBonus: 0,
      critBonus: 0,
      speedBonus: 0,
      qiCost: 0,
      tags: []
    };
  }
  return {
    name: move.name || "无名式",
    style: move.style || style || "default",
    damageRate: Number.isFinite(move.damageRate) ? move.damageRate : 1,
    hitBonus: Number.isFinite(move.hitBonus) ? move.hitBonus : 0,
    dodgeBonus: Number.isFinite(move.dodgeBonus) ? move.dodgeBonus : 0,
    blockBonus: Number.isFinite(move.blockBonus) ? move.blockBonus : 0,
    parryBonus: Number.isFinite(move.parryBonus) ? move.parryBonus : 0,
    breakBonus: Number.isFinite(move.breakBonus) ? move.breakBonus : 0,
    critBonus: Number.isFinite(move.critBonus) ? move.critBonus : 0,
    speedBonus: Number.isFinite(move.speedBonus) ? move.speedBonus : 0,
    qiCost: Number.isFinite(move.qiCost) ? move.qiCost : 0,
    tags: Array.isArray(move.tags) ? move.tags : []
  };
}

function inferEnemyStyle(moveName) {
  if (!moveName) {
    return "default";
  }
  const name = String(moveName);
  if (name.includes("刀") || name.includes("剑") || name.includes("刃") || name.includes("棍")) {
    return "weapon";
  }
  if (name.includes("步") || name.includes("身") || name.includes("掠") || name.includes("翻")) {
    return "qinggong";
  }
  if (name.includes("气") || name.includes("脉") || name.includes("劲")) {
    return "internal";
  }
  return "fist";
}

function describeMoveOpen(move) {
  const options = OPENERS[move.style] || OPENERS.default;
  return randomPick(options);
}

function describeImpact(move, blocked) {
  const options = HITS[move.style] || HITS.default;
  const phrase = randomPick(options);
  return blocked ? `${phrase}被卸去大半` : phrase;
}

function finalizeBattle(battle, logs) {
  battle.finished = true;
  if (battle.enemy.hp <= 0) {
    battle.winner = "player";
    logs.push(`你一鼓作气，终将${battle.enemy.name}击败。`);
  } else {
    battle.winner = "enemy";
    logs.push(`${battle.enemy.name}抢住上风，你力竭倒地。`);
  }
  battle.animation.playerPose = "idle";
  battle.animation.enemyPose = "idle";
  battle.animation.flash = "none";
  battle.animation.activeSide = null;
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setAnim(battle, attackerSide, attackerPose, defenderPose, result) {
  if (attackerSide === "player") {
    battle.animation.playerPose = attackerPose;
    battle.animation.enemyPose = defenderPose;
    battle.animation.flash = "right";
  } else {
    battle.animation.playerPose = defenderPose;
    battle.animation.enemyPose = attackerPose;
    battle.animation.flash = "left";
  }

  battle.animation.activeSide = attackerSide;
  battle.animation.result = result;
  battle.animation.strikeAt = Date.now();
}

function spendMoveQi(attacker, move, logs, attackerTag) {
  const cost = Number.isFinite(move.qiCost) ? move.qiCost : 0;
  if (!Number.isFinite(attacker.qi)) {
    attacker.qi = attacker.maxQi || 0;
  }

  if (cost < 0) {
    attacker.qi = clamp(attacker.qi + Math.abs(cost), 0, attacker.maxQi || attacker.qi);
    return { damageScale: 1 };
  }

  if (attacker.qi >= cost) {
    attacker.qi = clamp(attacker.qi - cost, 0, attacker.maxQi || attacker.qi);
    return { damageScale: 1 };
  }

  if (cost > 0) {
    logs.push(`${attackerTag}真气不足，招式威力打了折扣。`);
  }
  return { damageScale: 0.82 };
}

function recoverQi(combatant, amount = 1) {
  if (!Number.isFinite(combatant.qi) || !Number.isFinite(combatant.maxQi)) {
    return;
  }
  combatant.qi = clamp(combatant.qi + amount, 0, combatant.maxQi);
}

function deriveEnemyCombatStats(enemy) {
  const attack = numberOr(enemy.attack, 16);
  const hit = numberOr(enemy.hit, 68);
  const dodge = numberOr(enemy.dodge, 12);
  const block = numberOr(enemy.block, 10);
  const speed = numberOr(enemy.speed, 12);
  return {
    attack,
    hit,
    dodge,
    block,
    speed,
    parry: numberOr(enemy.parry, Math.round(block * 0.8 + dodge * 0.25)),
    break: numberOr(enemy.break, Math.round(attack * 0.56 + hit * 0.16)),
    crit: numberOr(enemy.crit, Math.round(4 + speed * 0.18)),
    maxQi: numberOr(enemy.maxQi, Math.round(enemy.maxHp * 0.55 + attack * 0.4))
  };
}

function numberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
