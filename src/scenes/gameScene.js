import {
  mapEdges,
  mapRegions,
  regionEdges,
  getNodeById,
  getAdjacentNodeIds,
  getDirection,
  getNodeRegion,
  getConnectedRegionIds,
  getRegionById,
  getRegionNodes
} from "../data/map.js";
import { getRuntimeContent, getDefaultSlice } from "../content/index.js";
import {
  martialArts,
  slotLabels,
  getMartialById,
  computeSkillBonuses
} from "../data/martialArts.js";
import {
  computeDerivedStats,
  normalizeVitals,
  addExperience,
  trainSkill,
  getExpToNext,
  listPreparedSkills,
  getSkillLevel,
  ensurePlayerState
} from "../systems/progression.js";
import { createEventSystem } from "../systems/events.js";
import { applyEffectPack as applyPack } from "../systems/effectApplier.js";
import { createBattle, resolveBattleRound } from "../systems/combat.js";
import { DEFAULT_TIME, advanceTime, formatGameTime } from "../systems/time.js";
import { createScheduleSystem } from "../systems/schedule.js";
import { validateWorldData } from "../systems/worldValidation.js";
import { createWorldStateService } from "../runtime/worldStateService.js";
import { createDialogueRuntime } from "../runtime/dialogueRuntime.js";
import { createQuestRuntime } from "../runtime/questRuntime.js";
import { drawBattleCanvas } from "../ui/battleCanvas.js";

const AUTO_SAVE_EVERY_TICKS = 6;
const MAP_DEFAULT_OVERLAY = "radial-gradient(circle at 50% 35%, rgba(44, 58, 82, 0.08), rgba(8, 12, 18, 0.24) 72%)";
const content = getRuntimeContent();
const { npcs, events, enemies } = content;

export class GameScene {
  constructor({ dom, onSave }) {
    this.dom = dom;
    this.onSave = onSave;

    this.state = {
      player: null,
      time: { ...DEFAULT_TIME },
      eventHistory: {},
      logs: [],
      currentEvent: null,
      battle: null,
      lastBattle: null,
      tickCounter: 0,
      menuOpen: false,
      sheetType: null,
      worldmapOpen: false,
      worldmapFocusRegion: null,
      activeSliceId: content.defaultSliceId || null
    };

    this.worldState = createWorldStateService();
    this.questRuntime = createQuestRuntime({
      getPlayer: () => this.state.player,
      getTime: () => this.state.time
    });
    this.dialogueRuntime = createDialogueRuntime({
      eventDefs: events
    });

    this.worldDataWarnings = validateWorldData();
    if (this.worldDataWarnings.length > 0) {
      console.warn("[world-data] consistency warnings:", this.worldDataWarnings);
    }

    this.eventSystem = createEventSystem(events);
    this.scheduler = createScheduleSystem({
      npcDefs: npcs,
      onNpcMove: ({ npc, to, action, shichen }) => {
        const node = getNodeById(to);
        const place = node ? node.name : to;
        this.pushLog(`[${shichen}] ${npc.name}前往${place}，${action}。`, "system");
        this.render();
      }
    });

    this.battleTimer = null;
    this.didBind = false;
    this.rafId = null;
    this.resizeHandler = () => {
      if (this.state.player && !this.state.battle) {
        this.renderMap();
      }
    };
  }

  startNewGame({ name, alignment }) {
    const player = this.worldState.createPlayer({ name, alignment });

    this.state.player = ensurePlayerState(player);
    this.state.time = { ...DEFAULT_TIME };
    this.state.eventHistory = {};
    this.state.logs = [];
    this.state.currentEvent = null;
    this.state.battle = null;
    this.state.lastBattle = null;
    this.state.tickCounter = 0;
    this.state.menuOpen = false;
    this.state.sheetType = null;
    this.state.worldmapOpen = false;
    this.state.worldmapFocusRegion = null;
    this.state.activeSliceId = content.defaultSliceId || null;

    this.scheduler.bootstrap(this.state.time);
    normalizeVitals(this.state.player);
    this.pushLog(`${player.name}踏入江湖，立志走${alignment}之路。`, "good");
    this.pushLog("地图会始终以你当前位置为中心。", "system");
    this.pushLog("江湖时辰只会在你行动后推进。", "system");
    const slice = getDefaultSlice();
    if (slice) {
      this.pushLog(`当前可玩纵切片：${slice.name}。`, "system");
    }
    if (this.worldDataWarnings.length > 0) {
      this.pushLog(`检测到${this.worldDataWarnings.length}条世界数据告警，详见控制台。`, "bad");
    }

    this.bindDomEvents();
    this.startAnimationLoop();
    this.render();
    this.autoSave();
  }

  loadFromSnapshot(snapshot) {
    if (!snapshot) {
      return false;
    }

    this.state.player = this.worldState.restorePlayer(snapshot.player);
    this.state.time = this.worldState.normalizeTime(snapshot.time);
    this.state.eventHistory = snapshot.eventHistory || {};
    this.state.logs = snapshot.logs || [];
    this.state.currentEvent = snapshot.currentEvent || null;
    this.state.battle = null;
    this.state.lastBattle = snapshot.lastBattle || null;
    this.state.tickCounter = 0;
    this.state.menuOpen = false;
    this.state.sheetType = null;
    this.state.worldmapOpen = false;
    this.state.worldmapFocusRegion = null;
    this.state.activeSliceId = snapshot.activeSliceId || content.defaultSliceId || null;

    this.scheduler.bootstrap(this.state.time);
    if (snapshot.schedulerState) {
      this.scheduler.hydrate(snapshot.schedulerState);
    } else {
      this.scheduler.update(this.state.time);
    }

    normalizeVitals(this.state.player);
    this.pushLog("旧档已载入，江湖依旧。", "system");

    this.bindDomEvents();
    this.startAnimationLoop();
    this.render();
    return true;
  }

  stop() {
    if (this.battleTimer) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getSerializableState() {
    if (!this.state.player) {
      return null;
    }

    return {
      player: this.state.player,
      time: this.state.time,
      eventHistory: this.state.eventHistory,
      logs: this.state.logs.slice(-200),
      currentEvent: this.state.currentEvent,
      lastBattle: this.state.lastBattle,
      schedulerState: this.scheduler.serialize(),
      activeSliceId: this.state.activeSliceId
    };
  }

  bindDomEvents() {
    if (this.didBind) {
      return;
    }
    this.didBind = true;

    this.dom.mapNodes.addEventListener("click", (event) => {
      const target = event.target.closest("button[data-node-id]");
      if (!target) {
        return;
      }
      this.travelTo(target.dataset.nodeId);
    });

    this.dom.baseActions.addEventListener("click", (event) => {
      const target = event.target.closest("button[data-action]");
      if (!target) {
        return;
      }
      this.handleAction(target.dataset.action, target.dataset);
    });

    this.dom.contextActions.addEventListener("click", (event) => {
      const target = event.target.closest("button[data-action]");
      if (!target) {
        return;
      }
      this.handleAction(target.dataset.action, target.dataset);
    });

    this.dom.sheetContent.addEventListener("click", (event) => {
      const target = event.target.closest("button[data-action]");
      if (!target) {
        return;
      }
      this.handleAction(target.dataset.action, target.dataset);
    });

    this.dom.btnSave.addEventListener("click", () => {
      this.autoSave(true);
    });

    this.dom.menuToggle.addEventListener("click", () => {
      this.state.menuOpen = !this.state.menuOpen;
      this.renderMenu();
    });

    this.dom.btnWorldmap.addEventListener("click", () => {
      this.openWorldmap();
    });

    this.dom.worldmapClose.addEventListener("click", () => {
      this.closeWorldmap();
    });

    this.dom.worldmapModal.addEventListener("click", (event) => {
      if (event.target === this.dom.worldmapModal) {
        this.closeWorldmap();
      }
    });

    this.dom.worldmapSvg.addEventListener("click", (event) => {
      const target = event.target.closest("[data-region-id]");
      if (!target) {
        return;
      }
      this.state.worldmapFocusRegion = target.dataset.regionId;
      this.renderWorldmap();
    });

    this.dom.sheetClose.addEventListener("click", () => {
      this.closeSheet();
    });

    this.dom.sheetModal.addEventListener("click", (event) => {
      if (event.target === this.dom.sheetModal) {
        this.closeSheet();
      }
    });

    window.addEventListener("resize", this.resizeHandler);
  }

  handleAction(action, data) {
    if (!this.state.player) {
      return;
    }

    if (action === "search") {
      if (this.state.battle) {
        this.pushLog("战斗中无法分神搜索。", "bad");
        return;
      }
      this.advanceClock(20);
      const found = this.tryTriggerEvent(true);
      if (!found) {
        this.pushLog("你在四周留心查探，未见异状。", "system");
      }
      this.render();
      return;
    }

    if (action === "rest") {
      if (this.state.battle) {
        this.pushLog("战斗未歇，无法打坐。", "bad");
        return;
      }
      this.advanceClock(60);
      this.state.player.hp += 28;
      this.state.player.qi += 20;
      normalizeVitals(this.state.player);
      this.pushLog("你就地打坐，调匀呼吸，气血渐复。", "good");
      this.render();
      return;
    }

    if (action === "move") {
      this.travelTo(data.nodeId);
      return;
    }

    if (action === "talk") {
      this.talkToNpc(data.npcId);
      return;
    }

    if (action === "event-choice") {
      this.selectEventChoice(data.choiceId);
      return;
    }

    if (action === "open-skills") {
      this.openSheet("skills");
      return;
    }

    if (action === "open-prepare") {
      this.openSheet("prepare");
      return;
    }

    if (action === "train-skill") {
      const result = trainSkill(this.state.player, data.skillId);
      if (!result.ok) {
        this.pushLog(result.reason, "bad");
      } else {
        const skill = getMartialById(data.skillId);
        this.pushLog(`${skill.name}精进至${result.newLevel}级（潜能-${result.cost}）。`, "good");
        this.advanceClock(30);
      }
      this.renderSheet();
      this.render();
      return;
    }

    if (action === "equip-skill") {
      this.equipSkill(data.slot, data.skillId);
      return;
    }

    if (action === "manual-save") {
      this.autoSave(true);
      return;
    }
  }

  openSheet(type) {
    if (this.state.battle) {
      this.pushLog("战斗中无法翻阅江湖册。", "bad");
      return;
    }

    this.state.sheetType = type;
    this.dom.sheetModal.classList.add("show");
    this.renderSheet();
  }

  closeSheet() {
    this.state.sheetType = null;
    this.dom.sheetModal.classList.remove("show");
  }

  openWorldmap() {
    if (!this.state.player) {
      return;
    }
    const region = getNodeRegion(this.state.player.location);
    this.state.worldmapOpen = true;
    this.state.worldmapFocusRegion = region ? region.id : null;
    this.dom.worldmapModal.classList.add("show");
    this.renderWorldmap();
  }

  closeWorldmap() {
    this.state.worldmapOpen = false;
    this.dom.worldmapModal.classList.remove("show");
  }

  renderSheet() {
    if (!this.state.sheetType || !this.state.player) {
      return;
    }

    if (this.state.sheetType === "skills") {
      this.dom.sheetTitle.textContent = "武学列表";
      this.renderSkillsSheet();
      return;
    }

    if (this.state.sheetType === "prepare") {
      this.dom.sheetTitle.textContent = "准备武功";
      this.renderPrepareSheet();
    }
  }

  renderSkillsSheet() {
    const player = this.state.player;
    const list = martialArts
      .filter((skill) => player.skills.owned[skill.id])
      .sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));

    const rows = list
      .map((skill) => {
        const level = player.skills.owned[skill.id];
        const bonus = computeSkillBonuses(skill, level);
        return [
          `<div class="skill-row">`,
          `<div>`,
          `<strong>${skill.name}</strong> <span class="small">[${slotLabels[skill.slot]} | ${skill.quality}]</span><br/>`,
          `<span class="small">${skill.description}</span><br/>`,
          `<span class="small">等级 ${level} · 攻${bonus.attack} 命${bonus.hit} 闪${bonus.dodge} 格${bonus.block}</span>`,
          `</div>`,
          `<div><button class="skill-btn" data-action="train-skill" data-skill-id="${skill.id}">研习(12潜能)</button></div>`,
          `</div>`
        ].join("");
      })
      .join("");

    this.dom.sheetContent.innerHTML = [
      `<div class="sheet-section"><div class="small">武学等级会实质改变命中、伤害、闪避与格挡。</div></div>`,
      rows || `<div class="small">暂无武学</div>`
    ].join("");
  }

  renderPrepareSheet() {
    const player = this.state.player;

    const rows = Object.keys(slotLabels)
      .map((slot) => {
        const currentId = player.skills.prepared[slot];
        const current = getMartialById(currentId);
        const candidates = martialArts.filter(
          (skill) => skill.slot === slot && player.skills.owned[skill.id]
        );

        const options = candidates
          .map((skill) => {
            const level = getSkillLevel(player, skill.id);
            const selected = skill.id === currentId;
            return `<button class="secondary-btn" data-action="equip-skill" data-slot="${slot}" data-skill-id="${skill.id}">${selected ? "已备" : "配置"} ${skill.name}(${level})</button>`;
          })
          .join("");

        return [
          `<div class="slot-row">`,
          `<strong>${slotLabels[slot]}</strong>：${current ? `${current.name}（${getSkillLevel(player, current.id)}级）` : "未配置"}`,
          `<div class="inline-row">${options}</div>`,
          `</div>`
        ].join("");
      })
      .join("");

    this.dom.sheetContent.innerHTML = [
      `<div class="sheet-section"><div class="small">四个槽位共同决定战斗表现。</div></div>`,
      rows
    ].join("");
  }

  travelTo(nodeId) {
    const player = this.state.player;
    if (!player) {
      return;
    }

    if (this.state.battle) {
      this.pushLog("交战中不可移动。", "bad");
      return;
    }

    if (nodeId === player.location) {
      return;
    }

    const neighbors = getAdjacentNodeIds(player.location);
    if (!neighbors.includes(nodeId)) {
      this.pushLog("此路不通，需循连线前行。", "bad");
      return;
    }

    const fromNode = getNodeById(player.location);
    const toNode = getNodeById(nodeId);
    const direction = getDirection(fromNode.id, toNode.id);

    player.location = nodeId;
    this.clearInvalidCurrentEvent({
      logIfCleared: true,
      reason: "你离开事发之地，原先的际遇已散。"
    });
    if (this.state.worldmapOpen) {
      const region = getNodeRegion(nodeId);
      this.state.worldmapFocusRegion = region ? region.id : null;
    }
    this.pushLog(`你向${direction || "前方"}离开${fromNode.name}，抵达${toNode.name}。`, "system");
    this.advanceClock(20);
    this.tryTriggerEvent(false);
    this.render();
  }

  talkToNpc(npcId) {
    if (this.state.battle) {
      this.pushLog("战斗中无人应答。", "bad");
      return;
    }

    const here = this.scheduler.getNpcsAt(this.state.player.location);
    const npc = here.find((item) => item.id === npcId);
    if (!npc) {
      this.pushLog("此地未见此人。", "bad");
      return;
    }

    const interaction = this.dialogueRuntime.interact({
      npc,
      state: this.state,
      canShowEvent: (event) => this.canShowEvent(event),
      adjustNpcRelation: (id, delta, options) => this.adjustNpcRelation(id, delta, options),
      adjustFactionReputation: (id, delta, options) => this.adjustFactionReputation(id, delta, options)
    });

    if (!interaction.ok) {
      this.pushLog(interaction.message || "对话失败。", "bad");
      return;
    }

    for (const line of interaction.logs) {
      const type = line.includes("潜能+") ? "good" : "system";
      this.pushLog(line, type);
    }

    this.pushLog(`${npc.name}：${interaction.line}`, "system");

    if (interaction.triggerEventId) {
      this.state.currentEvent = interaction.triggerEventId;
    }

    this.advanceClock(10);
    this.render();
  }

  tryTriggerEvent(force) {
    if (this.state.currentEvent || this.state.battle) {
      return false;
    }

    const event = this.eventSystem.pickEvent(this.state, this.scheduler);
    if (!event) {
      return false;
    }

    const shouldTrigger = force || Math.random() < 0.72;
    if (!shouldTrigger) {
      return false;
    }

    this.state.currentEvent = event.id;
    this.pushLog(`触发事件：${event.title}`, "system");
    return true;
  }

  canShowEvent(event) {
    const available = this.eventSystem.getAvailableEvents(this.state, this.scheduler);
    return available.some((item) => item.id === event.id);
  }

  clearInvalidCurrentEvent({ logIfCleared = false, reason = "时机已过，眼前事件悄然散去。" } = {}) {
    if (!this.state.currentEvent || this.state.battle) {
      return false;
    }

    const event = events.find((item) => item.id === this.state.currentEvent);
    if (!event) {
      this.state.currentEvent = null;
      return true;
    }

    if (this.canShowEvent(event)) {
      return false;
    }

    this.state.currentEvent = null;
    if (logIfCleared) {
      this.pushLog(reason, "system");
    }
    return true;
  }

  selectEventChoice(choiceId) {
    if (!this.state.currentEvent) {
      this.pushLog("当前无可处理事件。", "bad");
      return;
    }

    if (this.state.battle) {
      this.pushLog("先解决眼前战斗。", "bad");
      return;
    }

    const event = events.find((item) => item.id === this.state.currentEvent);
    if (!event) {
      this.state.currentEvent = null;
      this.render();
      return;
    }

    const result = this.eventSystem.resolveChoice({
      event,
      choiceId,
      state: this.state,
      onLog: (message, type) => this.pushLog(message, type || "good"),
      startBattle: (battleConfig) => this.startBattle(battleConfig)
    });

    if (!result.ok) {
      this.pushLog(result.message || "事件处理失败", "bad");
      this.render();
      return;
    }

    for (const line of result.logs) {
      this.pushLog(line, "system");
    }

    if (!this.state.battle) {
      this.state.currentEvent = null;
      this.advanceClock(10);
    }

    this.render();
  }

  startBattle(battleConfig) {
    const enemy = enemies[battleConfig.enemyId];
    if (!enemy) {
      this.pushLog("战斗对象不存在。", "bad");
      return;
    }

    const derived = computeDerivedStats(this.state.player);
    const battle = createBattle({
      enemy,
      player: this.state.player,
      derivedStats: derived,
      onVictory: battleConfig.onVictory,
      onDefeat: battleConfig.onDefeat
    });

    this.state.battle = battle;
    this.state.menuOpen = false;
    this.closeSheet();
    this.pushLog(`你与${enemy.name}狭路相逢，杀机骤起。`, "battle");

    if (this.battleTimer) {
      clearInterval(this.battleTimer);
    }

    this.battleTimer = setInterval(() => {
      this.stepBattle();
    }, 650);

    this.render();
  }

  stepBattle() {
    const battle = this.state.battle;
    if (!battle) {
      return;
    }

    const logs = resolveBattleRound(battle);
    for (const line of logs) {
      this.pushLog(line, "battle");
    }

    this.state.player.hp = battle.player.hp;
    normalizeVitals(this.state.player);
    this.advanceClock(10, { passive: true });

    if (battle.finished) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
      this.finishBattle(battle);
    }

    this.render();
  }

  finishBattle(battle) {
    this.state.lastBattle = battle;
    this.state.battle = null;
    this.state.currentEvent = null;

    if (battle.winner === "player") {
      this.applyReward("exp", battle.rewards.xp);
      this.applyReward("potential", battle.rewards.potential);
      this.applyReward("gold", battle.rewards.gold);
      this.state.player.qi += 6;

      if (battle.onVictory) {
        this.applyEffectPack(battle.onVictory);
      }

      this.pushLog("你收势而立，战斗胜利。", "good");
    } else {
      const derived = computeDerivedStats(this.state.player);
      this.state.player.hp = Math.max(1, Math.floor(derived.maxHp * 0.35));
      this.state.player.qi = Math.max(4, this.state.player.qi - 12);
      if (battle.onDefeat) {
        this.applyEffectPack(battle.onDefeat);
      }
      this.pushLog("你负伤后退，暂避锋芒。", "bad");
    }

    normalizeVitals(this.state.player);
    this.advanceClock(10, { passive: true });
    this.autoSave();
  }

  applyReward(type, value) {
    if (!value || value <= 0) {
      return;
    }

    if (type === "exp") {
      addExperience(this.state.player, value, (message, levelType) => this.pushLog(message, levelType || "good"));
      this.pushLog(`经验 +${value}`, "good");
      return;
    }

    if (type === "potential") {
      this.state.player.potential += value;
      this.pushLog(`潜能 +${value}`, "good");
      return;
    }

    if (type === "gold") {
      this.state.player.gold += value;
      this.pushLog(`银两 +${value}`, "good");
    }
  }

  applyEffectPack(pack) {
    if (!pack) {
      return;
    }
    const result = applyPack({
      effects: pack,
      player: this.state.player,
      time: this.state.time,
      questRuntime: this.questRuntime,
      onExperience: (amount) => {
        this.applyReward("exp", amount);
        return true;
      }
    });

    for (const line of result.logs) {
      this.pushLog(line, "system");
    }
  }

  equipSkill(slot, skillId) {
    const skill = getMartialById(skillId);
    if (!skill) {
      return;
    }

    if (skill.slot !== slot) {
      this.pushLog("武学槽位不匹配。", "bad");
      return;
    }

    if (!this.state.player.skills.owned[skillId]) {
      this.pushLog("尚未习得该武学。", "bad");
      return;
    }

    this.state.player.skills.prepared[slot] = skillId;
    normalizeVitals(this.state.player);
    this.pushLog(`已将${skill.name}配置到${slotLabels[slot]}。`, "system");
    this.renderSheet();
    this.render();
  }

  advanceClock(minutes, options = {}) {
    if (!this.state.player) {
      return;
    }

    const oldHour = this.state.time.hour;
    this.state.time = advanceTime(this.state.time, minutes);

    if (options.passive) {
      this.state.player.hp += 1;
      this.state.player.qi += 1;
    }
    normalizeVitals(this.state.player);

    if (oldHour !== this.state.time.hour) {
      this.scheduler.update(this.state.time);
    }
    this.clearInvalidCurrentEvent({
      logIfCleared: true
    });

    this.state.tickCounter += 1;
    if (this.state.tickCounter % AUTO_SAVE_EVERY_TICKS === 0) {
      this.autoSave();
    }
  }

  pushLog(message, type = "system") {
    const label = formatGameTime(this.state.time);
    this.state.logs.push({
      time: label,
      message,
      type
    });

    if (this.state.logs.length > 250) {
      this.state.logs = this.state.logs.slice(-250);
    }
  }

  autoSave(manual = false) {
    if (!this.onSave || !this.state.player) {
      return;
    }

    const ok = this.onSave(this.getSerializableState());
    if (manual) {
      this.pushLog(ok ? "存档完成。" : "存档失败。", ok ? "good" : "bad");
      this.render();
    }
  }

  render() {
    if (!this.state.player) {
      return;
    }

    this.renderTopBar();
    this.renderPanels();
    this.renderLogs();
    this.renderMenu();
    this.renderSheet();
    this.renderWorldmap();
  }

  renderTopBar() {
    const player = this.state.player;
    const derived = computeDerivedStats(player);
    normalizeVitals(player);
    const location = getNodeById(player.location);

    this.dom.playerSummary.innerHTML = [
      `<span class="badge">${player.name}</span>`,
      `<span class="badge">${player.alignment}</span>`,
      `<span class="badge">境界${player.level}</span>`,
      `血 ${player.hp}/${derived.maxHp} · 气 ${player.qi}/${derived.maxQi} · 银 ${player.gold} · 经 ${player.exp}/${getExpToNext(player.level)} · 潜 ${player.potential} · 根 ${player.stats.bone} 身 ${player.stats.agility} 悟 ${player.stats.insight}`
    ].join(" | ");

    this.dom.timeSummary.textContent = `${formatGameTime(this.state.time)} · ${location ? location.name : "未知地点"}`;
  }

  renderPanels() {
    const inBattle = Boolean(this.state.battle);
    this.dom.explorePanel.classList.toggle("hidden", inBattle);
    this.dom.battlePanel.classList.toggle("hidden", !inBattle);

    if (inBattle) {
      this.renderBattlePanel();
      this.renderBattleContextActions();
      return;
    }

    this.renderMap();
    this.renderContextActions();
  }

  renderMap() {
    const player = this.state.player;
    const neighbors = getAdjacentNodeIds(player.location);
    const currentNode = getNodeById(player.location);
    if (!currentNode) {
      return;
    }
    const currentRegion = getNodeRegion(currentNode.id);
    this.applyRegionBackdrop(currentRegion);
    const visibleNodeIds = this.collectVisibleNodes(player.location, 2);
    const centers = {};

    this.dom.mapNodes.innerHTML = "";
    this.dom.mapLines.setAttribute("viewBox", "0 0 100 100");

    for (const nodeId of visibleNodeIds) {
      const node = getNodeById(nodeId);
      if (!node) {
        continue;
      }
      const center = this.getRelativeMapPosition(currentNode, node);
      if (!center) {
        continue;
      }
      centers[node.id] = center;

      const button = document.createElement("button");
      button.className = "map-node";
      button.dataset.nodeId = node.id;
      button.style.left = `${center.x}%`;
      button.style.top = `${center.y}%`;
      button.textContent = `${node.name}`;

      if (node.id === player.location) {
        button.classList.add("current");
      } else if (!neighbors.includes(node.id)) {
        button.classList.add("locked");
      }

      this.dom.mapNodes.appendChild(button);
    }
    const currentButton = this.dom.mapNodes.querySelector(`button[data-node-id="${player.location}"]`);
    if (currentButton) {
      this.dom.mapNodes.appendChild(currentButton);
    }

    const lines = mapEdges
      .map(([a, b]) => {
        const from = centers[a];
        const to = centers[b];
        if (!from || !to) {
          return "";
        }
        const isActive = a === player.location || b === player.location;
        return `<line class="map-edge${isActive ? " active" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />`;
      })
      .join("");

    this.dom.mapLines.innerHTML = lines;

    const node = getNodeById(player.location);
    const hereNpcs = this.scheduler.getNpcsAt(player.location);
    const npcText =
      hereNpcs.length === 0
        ? "此地暂无人影。"
        : `此地可见：${hereNpcs.map((item) => item.name).join("、")}`;

    const neighborsWithDir = neighbors
      .map((id) => `${getDirection(node.id, id) || "邻"}·${getNodeById(id).name}`)
      .join("、");

    this.dom.mapInfo.innerHTML = [
      `${node.name}（${node.type} / ${currentRegion ? currentRegion.name : "无名区域"}）`,
      `<br/>${node.description}`,
      `<br/>${npcText}`,
      `<br/>可行方位：${neighborsWithDir || "无"}`
    ].join("");
  }

  applyRegionBackdrop(region) {
    if (!this.dom.mapWrapper) {
      return;
    }
    const backdrop = region && region.mapBackdrop ? region.mapBackdrop : null;

    this.dom.mapWrapper.style.setProperty(
      "--map-region-image",
      backdrop && backdrop.image ? `url("${backdrop.image}")` : "none"
    );
    this.dom.mapWrapper.style.setProperty(
      "--map-region-overlay",
      backdrop && backdrop.overlay ? backdrop.overlay : MAP_DEFAULT_OVERLAY
    );
    this.dom.mapWrapper.style.setProperty(
      "--map-region-position",
      backdrop && backdrop.position ? backdrop.position : "center"
    );
    this.dom.mapWrapper.style.setProperty(
      "--map-region-size",
      backdrop && backdrop.size ? backdrop.size : "cover"
    );
    this.dom.mapWrapper.dataset.regionId = region ? region.id : "";
  }

  collectVisibleNodes(centerId, maxDepth = 2) {
    const visited = new Set([centerId]);
    const queue = [{ id: centerId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.depth >= maxDepth) {
        continue;
      }
      for (const nextId of getAdjacentNodeIds(current.id)) {
        if (visited.has(nextId)) {
          continue;
        }
        visited.add(nextId);
        queue.push({ id: nextId, depth: current.depth + 1 });
      }
    }

    const ids = Array.from(visited);
    ids.sort((a, b) => {
      const na = getNodeById(a);
      const nb = getNodeById(b);
      if (!na || !nb) {
        return a.localeCompare(b);
      }
      return na.grid.row - nb.grid.row || na.grid.col - nb.grid.col;
    });
    return ids;
  }

  getRelativeMapPosition(centerNode, targetNode) {
    if (!centerNode || !targetNode) {
      return null;
    }
    const spacingX = 16;
    const spacingY = 14;
    const dx = targetNode.grid.col - centerNode.grid.col;
    const dy = targetNode.grid.row - centerNode.grid.row;
    const x = 50 + dx * spacingX;
    const y = 50 + dy * spacingY;

    if (x < 8 || x > 92 || y < 10 || y > 90) {
      return null;
    }

    return {
      x: x.toFixed(2),
      y: y.toFixed(2)
    };
  }

  renderContextActions() {
    const player = this.state.player;
    const location = player.location;
    const neighbors = getAdjacentNodeIds(location);
    const npcsHere = this.scheduler.getNpcsAt(location);
    this.clearInvalidCurrentEvent();

    if (this.state.currentEvent) {
      const event = events.find((item) => item.id === this.state.currentEvent);
      if (!event) {
        this.state.currentEvent = null;
      } else {
        const choices = event.choices
          .map(
            (choice) =>
              `<button class="action-btn" data-action="event-choice" data-choice-id="${choice.id}">${choice.label}</button>`
          )
          .join("");

        this.dom.contextActions.innerHTML = [
          `<strong>事件：${event.title}</strong><br/>`,
          `<span class="small">${event.description}</span>`,
          `<div class="inline-row" style="margin-top:6px;">${choices}</div>`
        ].join("");
        return;
      }
    }

    const moveButtons = neighbors
      .map((id) => {
        const dir = getDirection(location, id);
        const node = getNodeById(id);
        return `<button class="action-btn" data-action="move" data-node-id="${id}">${dir || "邻"}行·${node.name}</button>`;
      })
      .join("");

    const npcButtons =
      npcsHere.length === 0
        ? `<span class="small">此地无人可谈。</span>`
        : npcsHere
            .map((npc) => {
              const state = this.scheduler.getNpcState(npc.id);
              return `<button class="secondary-btn" data-action="talk" data-npc-id="${npc.id}">与${npc.name}交谈（${state ? state.action : ""}）</button>`;
            })
            .join("");

    const prepared = listPreparedSkills(player);

    this.dom.contextActions.innerHTML = [
      `<div class="inline-row">${moveButtons}</div>`,
      `<div class="inline-row" style="margin-top:6px;">${npcButtons}</div>`,
      `<div class="small" style="margin-top:7px;">当前武学：${Object.keys(prepared)
        .map((slot) => {
          const item = prepared[slot];
          const name = item && item.skill ? item.skill.name : "未备";
          const level = item ? item.level : 0;
          return `${slotLabels[slot]}-${name}(${level})`;
        })
        .join(" / ")}</div>`
    ].join("");
  }

  renderBattleContextActions() {
    this.dom.contextActions.innerHTML = [
      `<strong>战斗中</strong><br/>`,
      `<span class="small">当前为自动回合，请观察战报与招式演出。</span>`
    ].join("");
  }

  renderBattlePanel() {
    const battle = this.state.battle;
    if (!battle) {
      return;
    }

    const playerHpPct = Math.max(0, Math.round((battle.player.hp / battle.player.maxHp) * 100));
    const enemyHpPct = Math.max(0, Math.round((battle.enemy.hp / battle.enemy.maxHp) * 100));

    this.dom.battleStatus.innerHTML = [
      `<strong>战斗进行中 · 第${battle.round || 1}回合</strong>`,
      `<br/><span class="small">招招见生死，式式有来历。</span>`
    ].join("");

    this.dom.battleHpBars.innerHTML = [
      `<div class="hp"><strong>${battle.player.name}</strong><div>${battle.player.hp}/${battle.player.maxHp}</div><div class="bar"><span style="width:${playerHpPct}%"></span></div></div>`,
      `<div class="hp enemy"><strong>${battle.enemy.name}</strong><div>${battle.enemy.hp}/${battle.enemy.maxHp}</div><div class="bar"><span style="width:${enemyHpPct}%"></span></div></div>`
    ].join("");

    drawBattleCanvas(this.dom.battleCanvas, battle);
  }

  startAnimationLoop() {
    if (this.rafId) {
      return;
    }

    const loop = () => {
      if (this.state.battle && !this.dom.battlePanel.classList.contains("hidden")) {
        drawBattleCanvas(this.dom.battleCanvas, this.state.battle);
      }
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  renderMenu() {
    this.dom.baseActions.classList.toggle("hidden", !this.state.menuOpen);
    this.dom.menuToggle.textContent = this.state.menuOpen ? "收起" : "江湖册";
  }

  renderWorldmap() {
    if (!this.state.worldmapOpen || !this.state.player) {
      return;
    }

    const currentRegion = getNodeRegion(this.state.player.location);
    if (!this.state.worldmapFocusRegion) {
      this.state.worldmapFocusRegion = currentRegion ? currentRegion.id : mapRegions[0]?.id || null;
    }
    const focusRegion = getRegionById(this.state.worldmapFocusRegion);
    const activeRegion = focusRegion || currentRegion || mapRegions[0] || null;
    if (!activeRegion) {
      this.dom.worldmapSvg.innerHTML = "";
      this.dom.worldmapDetail.innerHTML = "暂无分区数据。";
      return;
    }
    this.state.worldmapFocusRegion = activeRegion.id;
    this.dom.worldmapSvg.setAttribute("viewBox", "0 0 100 100");
    const connected = getConnectedRegionIds(activeRegion.id);

    const edgeHtml = regionEdges
      .map(([a, b]) => {
        const ra = getRegionById(a);
        const rb = getRegionById(b);
        if (!ra || !rb) {
          return "";
        }
        return `<line class="edge" x1="${ra.x}" y1="${ra.y}" x2="${rb.x}" y2="${rb.y}" />`;
      })
      .join("");

    const regionHtml = mapRegions
      .map((region) => {
        const isCurrent = currentRegion && region.id === currentRegion.id;
        const isFocus = region.id === activeRegion.id;
        const classes = ["region"];
        if (isCurrent) {
          classes.push("current");
        }
        if (isFocus) {
          classes.push("focus");
        }
        return [
          `<g data-region-id="${region.id}" style="cursor:pointer;">`,
          `<rect class="${classes.join(" ")}" x="${region.x - 8}" y="${region.y - 4}" width="16" height="8" rx="1.8" />`,
          `<text class="label" x="${region.x}" y="${region.y + 0.8}" text-anchor="middle">${region.name}</text>`,
          `</g>`
        ].join("");
      })
      .join("");

    this.dom.worldmapSvg.innerHTML = `${edgeHtml}${regionHtml}`;
    const localNodes = getRegionNodes(activeRegion.id).sort(
      (a, b) => a.grid.row - b.grid.row || a.grid.col - b.grid.col
    );

    this.dom.worldmapDetail.innerHTML = [
      `<strong>查看小地图：${activeRegion.name}</strong>`,
      `<br/><span class="small">${activeRegion.description}</span>`,
      `<br/><span class="small">${currentRegion && currentRegion.id === activeRegion.id ? "你当前就在此区。" : `你当前位于 ${currentRegion ? currentRegion.name : "未知区域"}。`}</span>`,
      `<br/><br/><strong>本区小地点</strong>`,
      `<br/>${localNodes.map((node) => (node.id === this.state.player.location ? `【${node.name}】` : node.name)).join("、") || "暂无"}`,
      `<br/><br/><strong>相邻小地图</strong>`,
      `<br/>${connected.map((id) => getRegionById(id)?.name).filter(Boolean).join("、") || "无"}`,
      `<br/><br/><span class="small">点击左侧区域块可切换查看。</span>`
    ].join("");
  }

  renderLogs() {
    const html = this.state.logs
      .slice(-150)
      .map((item) => {
        const className = item.type ? `log-${item.type}` : "";
        return `<div class="log-item ${className}"><span class="log-time">[${item.time}]</span> ${item.message}</div>`;
      })
      .join("");

    this.dom.logList.innerHTML = html;
    this.dom.logList.scrollTop = this.dom.logList.scrollHeight;
  }

  adjustNpcRelation(npcId, delta, { log = true } = {}) {
    const changed = this.worldState.adjustNpcRelation(this.state.player, npcId, delta);
    if (!changed) {
      return;
    }
    if (log) {
      this.pushLog(`与${changed.npcName}关系 ${changed.delta > 0 ? `+${changed.delta}` : changed.delta}`, "system");
    }
  }

  adjustFactionReputation(factionId, delta, { log = false } = {}) {
    const changed = this.worldState.adjustFactionReputation(this.state.player, factionId, delta);
    if (!changed) {
      return;
    }
    if (log) {
      this.pushLog(
        `${changed.factionName}声望 ${changed.delta > 0 ? `+${changed.delta}` : changed.delta}`,
        changed.delta > 0 ? "good" : "bad"
      );
    }
  }

  statLabel(key) {
    if (key === "bone") {
      return "根骨";
    }
    if (key === "agility") {
      return "身法";
    }
    if (key === "insight") {
      return "悟性";
    }
    return key;
  }
}
