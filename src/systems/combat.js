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

export function createBattle({ enemy, player, derivedStats, onVictory, onDefeat }) {
  const playerMoves = collectPlayerMoves(player);
  const enemyMoves = collectEnemyMoves(enemy);

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
      attack: derivedStats.attack,
      hit: derivedStats.hit,
      dodge: derivedStats.dodge,
      block: derivedStats.block,
      speed: derivedStats.speed,
      moves: playerMoves.length > 0 ? playerMoves : [normalizeMove("平掌直进", "fist")]
    },
    enemy: {
      id: enemy.id,
      name: enemy.name,
      maxHp: enemy.maxHp,
      hp: enemy.maxHp,
      attack: enemy.attack,
      hit: enemy.hit,
      dodge: enemy.dodge,
      block: enemy.block,
      speed: enemy.speed,
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
      battle.player.speed + randomInt(0, 4) >= battle.enemy.speed + randomInt(0, 4);

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
  logs.push(`${attackerTag}${describeMoveOpen(move)}，一式「${move.name}」直逼${defenderTag}。`);

  const hitChance = clamp(attacker.hit - defender.dodge * 0.35, 38, 96);
  const roll = randomInt(1, 100);

  if (roll > hitChance) {
    logs.push(`${defenderTag}及时错步，险险避过这一招。`);
    setAnim(battle, attackerSide, "strike", "evade", "miss");
    return;
  }

  const dodgeChance = clamp(defender.dodge * 0.22, 5, 30);
  const blockChance = clamp(defender.block * 0.2, 6, 28);
  const defenseRoll = randomInt(1, 100);

  if (defenseRoll <= dodgeChance) {
    logs.push(`${defenderTag}身法回旋，衣角擦过劲风，竟全身而退。`);
    setAnim(battle, attackerSide, "strike", "evade", "dodge");
    return;
  }

  const baseDamage = attacker.attack * randomFloat(0.82, 1.2);

  if (defenseRoll <= dodgeChance + blockChance) {
    const blockDamage = Math.max(1, Math.round(baseDamage * 0.55));
    defender.hp = Math.max(0, defender.hp - blockDamage);
    logs.push(`${defenderTag}强行招架，${describeImpact(move, true)}，仍受${blockDamage}点伤害。`);
    setAnim(battle, attackerSide, "strike", "block", "block");
    return;
  }

  const finalDamage = Math.max(1, Math.round(baseDamage));
  defender.hp = Math.max(0, defender.hp - finalDamage);
  logs.push(`${describeImpact(move, false)}，命中${defenderTag}，造成${finalDamage}点伤害。`);
  setAnim(battle, attackerSide, "strike", "hit", "hit");
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
    return { name: move, style };
  }
  return {
    name: move.name || "无名式",
    style: move.style || style || "default"
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
