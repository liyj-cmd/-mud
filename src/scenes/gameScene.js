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
  getSkillTrainCost,
  getExpToNext,
  listPreparedSkills,
  getSkillLevel,
  ensurePlayerState
} from "../systems/progression.js";
import { createEventSystem } from "../systems/events.js";
import { applyEffectPack as applyPack } from "../systems/effectApplier.js";
import { createBattle, resolveBattleRound } from "../systems/combat.js";
import { resolveBattleTarget } from "../systems/battleActorFactory.js";
import { DEFAULT_TIME, advanceTime, formatGameTime } from "../systems/time.js";
import { createScheduleSystem } from "../systems/schedule.js";
import { validateWorldData } from "../systems/worldValidation.js";
import { createWorldStateService } from "../runtime/worldStateService.js";
import { createDialogueRuntime } from "../runtime/dialogueRuntime.js";
import { createQuestRuntime } from "../runtime/questRuntime.js";
import {
  getNpcInteractionOptions,
  attemptLearnFromNpc,
  attemptStealFromNpc,
  buildNpcChallengeConfig
} from "../runtime/npcInteractionRuntime.js";
import { drawBattleCanvas } from "../ui/battleCanvas.js";
import { getNodeSceneById, hasNodeScene } from "../data/nodeScenes.js";
import { drawExploreScene } from "../ui/exploreCanvas.js";
import { getSceneTheme, normalizeSceneThemeId } from "../data/sceneThemes.js";
import { createAmbientAudioDirector } from "../systems/ambientAudio.js";
import { DEFAULT_ART_PACK_ID, listArtPacks, resolveArtPack } from "../data/artPacks.js";
import { createSceneAssetLoader } from "../systems/sceneAssetLoader.js";

const AUTO_SAVE_EVERY_TICKS = 6;
const MAP_DEFAULT_OVERLAY = "radial-gradient(circle at 50% 35%, rgba(44, 58, 82, 0.08), rgba(8, 12, 18, 0.24) 72%)";
const SCENE_MOVE_SPEED = 200;
const SCENE_PLAYER_RADIUS = 12;
const LOG_OVERLAY_WINDOW_MS = 28000;
const LOG_OVERLAY_MAX_ITEMS = 8;
const REGION_MUSIC_PROFILE_BY_ID = {
  changan: "market_bustle",
  kaifeng: "magistrate_watch",
  shaolin: "temple_zen",
  wudang: "temple_zen",
  emei: "temple_zen",
  suzhou: "market_bustle"
};
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
      activeSliceId: content.defaultSliceId || null,
      sceneModeEnabled: false,
      musicMuted: false,
      selectedArtPackId: DEFAULT_ART_PACK_ID,
      scenePlayerPos: null,
      sceneSelectedNpcId: null,
      sceneInput: {
        up: false,
        down: false,
        left: false,
        right: false
      }
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
    this.lastFrameTime = 0;
    this.artPackOptions = listArtPacks();
    this.sceneAssetLoader = createSceneAssetLoader({
      onAssetReady: () => {
        if (this.isSceneModeActive()) {
          this.renderSceneCanvas();
        }
      }
    });
    this.ambientAudio = createAmbientAudioDirector({
      onStateChange: () => this.renderMusicButton()
    });
    this.ambientUnlockHandler = () => {
      this.tryUnlockAmbientAudio();
    };
    this.sceneKeyDownHandler = (event) => this.handleSceneKey(event, true);
    this.sceneKeyUpHandler = (event) => this.handleSceneKey(event, false);
    this.resizeHandler = () => {
      if (this.state.player && !this.state.battle) {
        if (this.isSceneModeActive()) {
          this.renderSceneCanvas();
        } else {
          this.renderMap();
        }
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
    this.state.sceneModeEnabled = false;
    this.state.musicMuted = false;
    this.state.selectedArtPackId = DEFAULT_ART_PACK_ID;
    this.state.scenePlayerPos = null;
    this.state.sceneSelectedNpcId = null;
    this.resetSceneInput();

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
    this.pushLog("可切换场景模式，在指定地点以角色行走方式互动。", "system");

    this.bindDomEvents();
    this.attachSceneKeyListeners();
    this.attachAmbientUnlockListeners();
    this.startAnimationLoop();
    this.render();
    this.tryUnlockAmbientAudio();
    this.autoSave();
  }

  loadFromSnapshot(snapshot) {
    if (!snapshot) {
      return false;
    }

    this.state.player = this.worldState.restorePlayer(snapshot.player);
    this.state.time = this.worldState.normalizeTime(snapshot.time);
    this.state.eventHistory = snapshot.eventHistory || {};
    this.state.logs = normalizeLogEntries(snapshot.logs);
    this.state.currentEvent = snapshot.currentEvent || null;
    this.state.battle = null;
    this.state.lastBattle = snapshot.lastBattle || null;
    this.state.tickCounter = 0;
    this.state.menuOpen = false;
    this.state.sheetType = null;
    this.state.worldmapOpen = false;
    this.state.worldmapFocusRegion = null;
    this.state.activeSliceId = snapshot.activeSliceId || content.defaultSliceId || null;
    this.state.sceneModeEnabled = Boolean(snapshot.ui && snapshot.ui.sceneModeEnabled);
    this.state.musicMuted = Boolean(snapshot.ui && snapshot.ui.musicMuted);
    this.state.selectedArtPackId = resolveArtPack(snapshot.ui && snapshot.ui.selectedArtPackId).id;
    this.state.scenePlayerPos = null;
    this.state.sceneSelectedNpcId = null;
    this.resetSceneInput();

    this.scheduler.bootstrap(this.state.time);
    if (snapshot.schedulerState) {
      this.scheduler.hydrate(snapshot.schedulerState);
    } else {
      this.scheduler.update(this.state.time);
    }

    normalizeVitals(this.state.player);
    this.syncSceneStateForLocation();
    this.pushLog("旧档已载入，江湖依旧。", "system");

    this.bindDomEvents();
    this.attachSceneKeyListeners();
    this.attachAmbientUnlockListeners();
    this.startAnimationLoop();
    this.render();
    this.tryUnlockAmbientAudio();
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
    this.lastFrameTime = 0;
    this.resetSceneInput();
    this.detachAmbientUnlockListeners();
    this.ambientAudio.stop();
    window.removeEventListener("keydown", this.sceneKeyDownHandler);
    window.removeEventListener("keyup", this.sceneKeyUpHandler);
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
      activeSliceId: this.state.activeSliceId,
      ui: {
        sceneModeEnabled: Boolean(this.state.sceneModeEnabled),
        musicMuted: Boolean(this.state.musicMuted),
        selectedArtPackId: this.state.selectedArtPackId
      }
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

    this.dom.btnSceneMode.addEventListener("click", () => {
      this.toggleSceneMode();
    });

    if (this.dom.btnMusic) {
      this.dom.btnMusic.addEventListener("click", () => {
        this.toggleMusicMuted();
      });
    }

    if (this.dom.artPackSelect) {
      this.dom.artPackSelect.addEventListener("change", () => {
        this.handleArtPackChange(this.dom.artPackSelect.value);
      });
    }

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

    this.dom.exploreCanvas.addEventListener("click", (event) => {
      this.handleSceneCanvasClick(event);
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

    if (action === "scene-select-npc") {
      this.state.sceneSelectedNpcId = data.npcId || null;
      this.renderContextActions();
      this.renderSceneCanvas();
      return;
    }

    if (action === "scene-observe-poi") {
      this.observeScenePoi(data.poiId);
      return;
    }

    if (action === "talk") {
      this.talkToNpc(data.npcId);
      return;
    }

    if (action === "learn-npc-skill") {
      this.learnFromNpc(data.npcId);
      return;
    }

    if (action === "steal-npc-item") {
      this.stealFromNpc(data.npcId);
      return;
    }

    if (action === "challenge-npc") {
      this.challengeNpc(data.npcId);
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
      this.pushLog("战斗中无法翻阅江湖录。", "bad");
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
        const trainCost = getSkillTrainCost(skill, level);
        return [
          `<div class="skill-row">`,
          `<div>`,
          `<strong>${skill.name}</strong> <span class="small">[${slotLabels[skill.slot]} | ${skill.quality}]</span><br/>`,
          `<span class="small">${skill.description}</span><br/>`,
          `<span class="small">等级 ${level} · 攻${bonus.attack} 命${bonus.hit} 闪${bonus.dodge} 格${bonus.block} 拆${bonus.parry} 破${bonus.break} 暴${bonus.crit} 速${bonus.speed}</span>`,
          `</div>`,
          `<div><button class="skill-btn" data-action="train-skill" data-skill-id="${skill.id}">研习(${trainCost}潜能)</button></div>`,
          `</div>`
        ].join("");
      })
      .join("");

    this.dom.sheetContent.innerHTML = [
      `<div class="sheet-section"><div class="small">武学等级将同时影响攻防、拆招、破招、暴击与身法节奏。</div></div>`,
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
    this.syncSceneStateForLocation();
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

  learnFromNpc(npcId) {
    if (this.state.battle) {
      this.pushLog("战斗中无暇请教。", "bad");
      return;
    }

    const here = this.scheduler.getNpcsAt(this.state.player.location);
    const npc = here.find((item) => item.id === npcId);
    if (!npc) {
      this.pushLog("此地未见此人。", "bad");
      return;
    }

    const result = attemptLearnFromNpc({
      npc,
      state: this.state,
      adjustNpcRelation: (id, delta) => this.adjustNpcRelation(id, delta, { log: false }),
      adjustFactionReputation: (id, delta) => this.adjustFactionReputation(id, delta, { log: false })
    });

    for (const line of result.logs) {
      this.pushLog(line, result.ok ? "good" : "bad");
    }

    if (result.ok) {
      this.advanceClock(25);
    }
    this.render();
  }

  stealFromNpc(npcId) {
    if (this.state.battle) {
      this.pushLog("战斗中无法行窃。", "bad");
      return;
    }

    const here = this.scheduler.getNpcsAt(this.state.player.location);
    const npc = here.find((item) => item.id === npcId);
    if (!npc) {
      this.pushLog("此地未见此人。", "bad");
      return;
    }

    const result = attemptStealFromNpc({
      npc,
      state: this.state,
      adjustNpcRelation: (id, delta) => this.adjustNpcRelation(id, delta, { log: false }),
      adjustFactionReputation: (id, delta) => this.adjustFactionReputation(id, delta, { log: false })
    });

    for (const line of result.logs) {
      this.pushLog(line, result.ok ? "system" : "bad");
    }

    this.advanceClock(10);
    this.render();
  }

  challengeNpc(npcId) {
    if (this.state.battle) {
      this.pushLog("先解决眼前战斗。", "bad");
      return;
    }

    const here = this.scheduler.getNpcsAt(this.state.player.location);
    const npc = here.find((item) => item.id === npcId);
    if (!npc) {
      this.pushLog("此地未见此人。", "bad");
      return;
    }

    const challenge = buildNpcChallengeConfig({ npc });
    if (!challenge.ok) {
      this.pushLog(challenge.message || "对方无意出手。", "bad");
      this.render();
      return;
    }

    this.pushLog(`你向${npc.name}提出切磋。`, "system");
    this.startBattle(challenge.battleConfig);
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
    const enemy = resolveBattleTarget({ battleConfig, enemies });
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
    this.state.player.qi = battle.player.qi;
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
    const createdAt = Date.now();
    this.state.logs.push({
      id: `${createdAt}-${this.state.logs.length}`,
      time: label,
      message,
      type,
      createdAt
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
    this.renderJianghuBook();
    this.renderLogs();
    this.renderLogOverlay();
    this.renderMenu();
    this.renderSheet();
    this.renderWorldmap();
    this.syncAmbientMusic();
  }

  renderTopBar() {
    const player = this.state.player;
    const location = getNodeById(player.location);
    const pack = resolveArtPack(this.state.selectedArtPackId);

    if (this.dom.topStatus) {
      this.dom.topStatus.textContent = `${player.name} · ${player.alignment} · 素材:${pack.name}`;
    }
    this.dom.timeSummary.textContent = `${formatGameTime(this.state.time)} · ${location ? location.name : "未知地点"}`;
    this.renderSceneModeButton();
    this.renderMusicButton();
  }

  renderJianghuBook() {
    if (!this.state.player || !this.dom.bookSummary) {
      return;
    }

    const player = this.state.player;
    const derived = computeDerivedStats(player);
    normalizeVitals(player);
    const location = getNodeById(player.location);
    const prepared = listPreparedSkills(player);
    const preparedText = Object.keys(prepared)
      .map((slot) => {
        const item = prepared[slot];
        const name = item && item.skill ? item.skill.name : "未备";
        const level = item ? item.level : 0;
        return `${slotLabels[slot]} ${name}(${level})`;
      })
      .join(" / ");

    this.dom.bookSummary.innerHTML = [
      `<div class="book-badges"><span class="badge">${player.name}</span><span class="badge">${player.alignment}</span><span class="badge">境界${player.level}</span></div>`,
      `<div class="small">时辰：${formatGameTime(this.state.time)} · 地点：${location ? location.name : "未知"}</div>`,
      `<div class="small">血 ${player.hp}/${derived.maxHp} · 气 ${player.qi}/${derived.maxQi} · 银 ${player.gold} · 经 ${player.exp}/${getExpToNext(player.level)} · 潜 ${player.potential}</div>`,
      `<div class="small">根 ${player.stats.bone} 身 ${player.stats.agility} 悟 ${player.stats.insight} · 拆 ${derived.parry} 破 ${derived.break} 暴 ${derived.crit}</div>`,
      `<div class="small">当前武学：${preparedText}</div>`
    ].join("");

    this.renderArtPackSelector();
  }

  renderArtPackSelector() {
    if (!this.dom.artPackSelect) {
      return;
    }

    const currentIds = Array.from(this.dom.artPackSelect.options || []).map((item) => item.value);
    const optionIds = this.artPackOptions.map((item) => item.id);
    const needRebuild =
      currentIds.length !== optionIds.length ||
      currentIds.some((id, index) => id !== optionIds[index]);

    if (needRebuild) {
      this.dom.artPackSelect.innerHTML = this.artPackOptions
        .map((pack) => `<option value="${pack.id}">${pack.name}</option>`)
        .join("");
    }

    this.dom.artPackSelect.value = this.state.selectedArtPackId;
  }

  handleArtPackChange(packId) {
    if (!this.state.player) {
      return;
    }

    const nextPackId = resolveArtPack(packId).id;
    if (nextPackId === this.state.selectedArtPackId) {
      return;
    }

    this.state.selectedArtPackId = nextPackId;
    const pack = resolveArtPack(nextPackId);
    this.pushLog(`已切换美术包：${pack.name}。缺失素材将回退为内置绘制。`, "system");
    if (this.isSceneModeActive()) {
      this.renderSceneCanvas();
    }
    this.render();
    this.autoSave();
  }

  renderPanels() {
    const inBattle = Boolean(this.state.battle);
    this.dom.explorePanel.classList.toggle("hidden", inBattle);
    this.dom.battlePanel.classList.toggle("hidden", !inBattle);
    if (this.dom.app) {
      this.dom.app.classList.toggle("scene-dominant", this.isSceneModeActive() && !inBattle);
      this.dom.app.classList.toggle("battle-mode", inBattle);
    }

    if (inBattle) {
      this.dom.mapWrapper.classList.remove("scene-mode");
      this.dom.mapWrapper.dataset.sceneTheme = "";
      this.setSceneHud({ visible: false });
      this.renderBattlePanel();
      this.renderBattleContextActions();
      return;
    }

    if (this.isSceneModeActive()) {
      this.renderScenePanel();
    } else {
      this.renderMap();
    }
    this.renderContextActions();
  }

  renderMap() {
    this.dom.mapWrapper.classList.remove("scene-mode");
    this.dom.mapWrapper.dataset.sceneTheme = "";
    this.setSceneHud({ visible: false });
    const player = this.state.player;
    const neighbors = getAdjacentNodeIds(player.location);
    const currentNode = getNodeById(player.location);
    if (!currentNode) {
      return;
    }
    const currentRegion = getNodeRegion(currentNode.id);
    this.applyRegionBackdrop(currentNode, currentRegion);
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

  renderScenePanel() {
    const player = this.state.player;
    const currentNode = getNodeById(player.location);
    if (!currentNode) {
      return;
    }
    const currentRegion = getNodeRegion(currentNode.id);
    this.applyRegionBackdrop(currentNode, currentRegion);
    this.dom.mapWrapper.classList.add("scene-mode");

    const scene = this.getActiveNodeScene();
    if (!scene) {
      this.renderMap();
      return;
    }
    const sceneTheme = getSceneTheme(scene.themeId);
    this.dom.mapWrapper.dataset.sceneTheme = normalizeSceneThemeId(scene.themeId);

    if (!this.state.scenePlayerPos) {
      this.state.scenePlayerPos = { ...scene.spawn };
    }

    const sceneNpcs = this.getSceneNpcs(scene);
    const npcText = sceneNpcs.length ? sceneNpcs.map((item) => item.name).join("、") : "此刻无人停留。";
    const exitsText = (scene.exits || []).map((item) => item.label).join("、");
    this.dom.mapInfo.innerHTML = [
      `${currentNode.name}（场景模式 / ${currentRegion ? currentRegion.name : "无名区域"}）`,
      `<br/>${currentNode.description}`,
      `<br/>${sceneTheme.mood}`,
      `<br/>在场人物：${npcText}`,
      `<br/>出口：${exitsText || "无"} · 方向键移动，点击人物/观察点/出口。`
    ].join("");
    this.setSceneHud({
      visible: true,
      title: `${currentNode.name} · ${sceneTheme.name}`,
      hint: sceneTheme.hudHint
    });

    this.renderSceneCanvas(scene, sceneNpcs);
  }

  renderSceneCanvas(scene = this.getActiveNodeScene(), sceneNpcs = null) {
    if (!scene || !this.dom.exploreCanvas) {
      return;
    }

    if (this.dom.exploreCanvas.width !== scene.size.width) {
      this.dom.exploreCanvas.width = scene.size.width;
    }
    if (this.dom.exploreCanvas.height !== scene.size.height) {
      this.dom.exploreCanvas.height = scene.size.height;
    }

    if (!this.state.scenePlayerPos) {
      this.state.scenePlayerPos = { ...scene.spawn };
    }
    this.state.scenePlayerPos = this.clampScenePoint(scene, this.state.scenePlayerPos);

    const npcs = sceneNpcs || this.getSceneNpcs(scene);
    if (this.state.sceneSelectedNpcId && !npcs.some((npc) => npc.id === this.state.sceneSelectedNpcId)) {
      this.state.sceneSelectedNpcId = null;
    }

    drawExploreScene(this.dom.exploreCanvas, {
      scene,
      playerPos: this.state.scenePlayerPos,
      player: this.state.player,
      npcs,
      selectedNpcId: this.state.sceneSelectedNpcId,
      now: performance.now(),
      artPackId: this.state.selectedArtPackId,
      assetLoader: this.sceneAssetLoader
    });
  }

  applyRegionBackdrop(node, region) {
    if (!this.dom.mapWrapper) {
      return;
    }
    const backdrop = (node && node.sceneBackdrop) || (region && region.mapBackdrop) || null;

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
    this.dom.mapWrapper.dataset.nodeId = node ? node.id : "";
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
    this.dom.contextActions.classList.remove("scene-context");
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

    if (this.isSceneModeActive()) {
      this.renderSceneContextActions();
      return;
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
              const actions = [`<button class="secondary-btn" data-action="talk" data-npc-id="${npc.id}">与${npc.name}交谈（${state ? state.action : ""}）</button>`];
              const options = getNpcInteractionOptions({ npc, player });
              if (options.canLearn) {
                actions.push(`<button class="secondary-btn" data-action="learn-npc-skill" data-npc-id="${npc.id}">向${npc.name}请教</button>`);
              }
              if (options.canSteal) {
                actions.push(`<button class="secondary-btn" data-action="steal-npc-item" data-npc-id="${npc.id}">顺手牵羊·${npc.name}</button>`);
              }
              if (options.canChallenge) {
                actions.push(`<button class="secondary-btn" data-action="challenge-npc" data-npc-id="${npc.id}">切磋·${npc.name}</button>`);
              }
              return actions.join("");
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

  renderSceneContextActions() {
    this.dom.contextActions.classList.add("scene-context");
    const scene = this.getActiveNodeScene();
    if (!scene) {
      this.dom.contextActions.innerHTML = `<span class="small">当前地点暂无场景化数据。</span>`;
      return;
    }

    const sceneNpcs = this.getSceneNpcs(scene);
    const selectedNpc = sceneNpcs.find((item) => item.id === this.state.sceneSelectedNpcId) || null;
    const poiButtons = (scene.pois || [])
      .map(
        (poi) =>
          `<button class="secondary-btn" data-action="scene-observe-poi" data-poi-id="${poi.id}">观察·${poi.label}</button>`
      )
      .join("");

    if (!selectedNpc) {
      const npcList = sceneNpcs
        .map((npc) => `<button class="secondary-btn" data-action="scene-select-npc" data-npc-id="${npc.id}">查看·${npc.name}</button>`)
        .join("");
      this.dom.contextActions.innerHTML = [
        `<strong class="scene-context-head">场景互动</strong><br/>`,
        `<span class="small">方向键移动，点击人物或下方按钮可切换目标。</span>`,
        `<div class="inline-row scene-context-row">${npcList || `<span class="small">此地暂无可交互人物。</span>`}</div>`,
        `<div class="inline-row scene-context-row">${poiButtons || ""}</div>`
      ].join("");
      return;
    }

    const schedulerState = this.scheduler.getNpcState(selectedNpc.id);
    const options = getNpcInteractionOptions({ npc: selectedNpc, player: this.state.player });
    const actions = [
      `<button class="secondary-btn" data-action="talk" data-npc-id="${selectedNpc.id}">与${selectedNpc.name}交谈（${schedulerState ? schedulerState.action : "驻留"}）</button>`
    ];
    if (options.canLearn) {
      actions.push(`<button class="secondary-btn" data-action="learn-npc-skill" data-npc-id="${selectedNpc.id}">向${selectedNpc.name}请教</button>`);
    }
    if (options.canSteal) {
      actions.push(`<button class="secondary-btn" data-action="steal-npc-item" data-npc-id="${selectedNpc.id}">顺手牵羊·${selectedNpc.name}</button>`);
    }
    if (options.canChallenge) {
      actions.push(`<button class="secondary-btn" data-action="challenge-npc" data-npc-id="${selectedNpc.id}">切磋·${selectedNpc.name}</button>`);
    }

    this.dom.contextActions.innerHTML = [
      `<strong class="scene-context-head">当前目标：${selectedNpc.name}</strong><br/>`,
      `<span class="small">点击出口可离开本场景。人物互动耗时沿用江湖规则。</span>`,
      `<div class="inline-row scene-context-row">${actions.join("")}</div>`,
      `<div class="inline-row scene-context-row">${poiButtons || ""}</div>`
    ].join("");
  }

  renderBattleContextActions() {
    this.dom.contextActions.classList.remove("scene-context");
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
      `<div class="hp"><strong>${battle.player.name}</strong><div>${battle.player.hp}/${battle.player.maxHp} · 气${battle.player.qi}/${battle.player.maxQi}</div><div class="bar"><span style="width:${playerHpPct}%"></span></div></div>`,
      `<div class="hp enemy"><strong>${battle.enemy.name}</strong><div>${battle.enemy.hp}/${battle.enemy.maxHp} · 气${battle.enemy.qi}/${battle.enemy.maxQi}</div><div class="bar"><span style="width:${enemyHpPct}%"></span></div></div>`
    ].join("");

    drawBattleCanvas(this.dom.battleCanvas, battle);
  }

  startAnimationLoop() {
    if (this.rafId) {
      return;
    }

    const loop = (now) => {
      const delta = this.lastFrameTime > 0 ? Math.min(64, now - this.lastFrameTime) : 16;
      this.lastFrameTime = now;

      if (this.isSceneModeActive()) {
        this.stepSceneMovement(delta);
      }

      if (this.state.battle && !this.dom.battlePanel.classList.contains("hidden")) {
        drawBattleCanvas(this.dom.battleCanvas, this.state.battle);
      }
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  renderSceneModeButton() {
    if (!this.dom.btnSceneMode) {
      return;
    }
    this.dom.btnSceneMode.textContent = `场景模式: ${this.state.sceneModeEnabled ? "开" : "关"}`;
    this.dom.btnSceneMode.classList.toggle("active", this.state.sceneModeEnabled);
  }

  renderMusicButton() {
    if (!this.dom.btnMusic) {
      return;
    }

    const audioState = this.ambientAudio.getState();
    if (!audioState.supported) {
      this.dom.btnMusic.disabled = true;
      this.dom.btnMusic.textContent = "背景乐: 不支持";
      this.dom.btnMusic.classList.remove("active");
      this.dom.btnMusic.classList.add("muted");
      return;
    }

    const waitingUnlock = !this.state.musicMuted && !audioState.ready;
    this.dom.btnMusic.disabled = false;
    this.dom.btnMusic.textContent = waitingUnlock
      ? "背景乐: 待激活"
      : `背景乐: ${this.state.musicMuted ? "关" : "开"}`;
    this.dom.btnMusic.classList.toggle("active", !this.state.musicMuted && audioState.ready);
    this.dom.btnMusic.classList.toggle("muted", this.state.musicMuted || waitingUnlock);
    this.dom.btnMusic.title = audioState.profileName || "";
  }

  setSceneHud({ visible, title = "", hint = "" }) {
    if (!this.dom.sceneHud || !this.dom.sceneHudTitle || !this.dom.sceneHudHint) {
      return;
    }
    this.dom.sceneHud.classList.toggle("hidden", !visible);
    if (!visible) {
      return;
    }
    this.dom.sceneHudTitle.textContent = title;
    this.dom.sceneHudHint.textContent = hint;
  }

  attachSceneKeyListeners() {
    window.removeEventListener("keydown", this.sceneKeyDownHandler);
    window.removeEventListener("keyup", this.sceneKeyUpHandler);
    window.addEventListener("keydown", this.sceneKeyDownHandler);
    window.addEventListener("keyup", this.sceneKeyUpHandler);
  }

  attachAmbientUnlockListeners() {
    window.removeEventListener("pointerdown", this.ambientUnlockHandler);
    window.removeEventListener("keydown", this.ambientUnlockHandler);
    window.addEventListener("pointerdown", this.ambientUnlockHandler, { passive: true });
    window.addEventListener("keydown", this.ambientUnlockHandler);
  }

  detachAmbientUnlockListeners() {
    window.removeEventListener("pointerdown", this.ambientUnlockHandler);
    window.removeEventListener("keydown", this.ambientUnlockHandler);
  }

  resetSceneInput() {
    this.state.sceneInput.up = false;
    this.state.sceneInput.down = false;
    this.state.sceneInput.left = false;
    this.state.sceneInput.right = false;
  }

  toggleSceneMode() {
    if (!this.state.player) {
      return;
    }
    if (this.state.battle) {
      this.pushLog("战斗中无法切换场景模式。", "bad");
      return;
    }

    this.state.sceneModeEnabled = !this.state.sceneModeEnabled;
    this.syncSceneStateForLocation();

    if (this.state.sceneModeEnabled) {
      if (hasNodeScene(this.state.player.location)) {
        this.pushLog("已开启场景模式。可用方向键移动并点击人物互动。", "system");
      } else {
        this.pushLog("已开启场景模式。当前地点暂无场景数据，仍使用地图模式。", "system");
      }
    } else {
      this.pushLog("已关闭场景模式。", "system");
    }

    this.render();
  }

  toggleMusicMuted() {
    if (!this.state.player) {
      return;
    }

    this.state.musicMuted = !this.state.musicMuted;
    if (!this.state.musicMuted) {
      this.pushLog("背景乐已开启。若仍无声，请先点按一次页面。", "system");
      this.tryUnlockAmbientAudio();
    } else {
      this.pushLog("背景乐已关闭。", "system");
    }

    this.syncAmbientMusic();
    this.renderMusicButton();
    this.autoSave();
  }

  resolveAmbientMusicProfileId() {
    if (!this.state.player) {
      return getSceneTheme().musicProfileId;
    }

    const scene = this.getActiveNodeScene();
    if (scene) {
      const theme = getSceneTheme(scene.themeId);
      if (theme.musicProfileId) {
        return theme.musicProfileId;
      }
    }

    const currentNode = getNodeById(this.state.player.location);
    const region = currentNode ? getNodeRegion(currentNode.id) : null;
    if (region && REGION_MUSIC_PROFILE_BY_ID[region.id]) {
      return REGION_MUSIC_PROFILE_BY_ID[region.id];
    }

    return getSceneTheme().musicProfileId;
  }

  syncAmbientMusic() {
    if (!this.state.player) {
      return;
    }

    this.ambientAudio.setMuted(this.state.musicMuted);
    this.ambientAudio.setProfile(this.resolveAmbientMusicProfileId());
  }

  async tryUnlockAmbientAudio() {
    if (!this.state.player || this.state.musicMuted) {
      return false;
    }

    try {
      const unlocked = await this.ambientAudio.unlock();
      if (unlocked) {
        this.detachAmbientUnlockListeners();
        this.syncAmbientMusic();
        this.renderMusicButton();
      }
      return unlocked;
    } catch {
      return false;
    }
  }

  syncSceneStateForLocation() {
    if (!this.state.player || !this.state.sceneModeEnabled) {
      this.state.scenePlayerPos = null;
      this.state.sceneSelectedNpcId = null;
      this.resetSceneInput();
      return;
    }

    const scene = getNodeSceneById(this.state.player.location);
    if (!scene) {
      this.state.scenePlayerPos = null;
      this.state.sceneSelectedNpcId = null;
      this.resetSceneInput();
      return;
    }

    this.state.scenePlayerPos = this.clampScenePoint(scene, { ...scene.spawn });
    this.state.sceneSelectedNpcId = null;
    this.resetSceneInput();
  }

  isSceneModeActive() {
    return Boolean(this.getActiveNodeScene()) && !this.state.battle;
  }

  getActiveNodeScene() {
    if (!this.state.player || !this.state.sceneModeEnabled) {
      return null;
    }
    return getNodeSceneById(this.state.player.location);
  }

  handleSceneKey(event, pressed) {
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right"
    };
    const inputKey = keyMap[event.key];
    if (!inputKey) {
      return;
    }

    if (!this.isSceneModeActive()) {
      if (!pressed) {
        this.state.sceneInput[inputKey] = false;
      }
      return;
    }

    event.preventDefault();
    this.state.sceneInput[inputKey] = pressed;
  }

  stepSceneMovement(deltaMs) {
    const scene = this.getActiveNodeScene();
    if (!scene || !this.state.scenePlayerPos) {
      return;
    }

    const moveX = (this.state.sceneInput.right ? 1 : 0) - (this.state.sceneInput.left ? 1 : 0);
    const moveY = (this.state.sceneInput.down ? 1 : 0) - (this.state.sceneInput.up ? 1 : 0);
    if (moveX === 0 && moveY === 0) {
      return;
    }

    const length = Math.hypot(moveX, moveY) || 1;
    const distance = (SCENE_MOVE_SPEED * deltaMs) / 1000;
    const target = {
      x: this.state.scenePlayerPos.x + (moveX / length) * distance,
      y: this.state.scenePlayerPos.y + (moveY / length) * distance
    };

    const next = this.resolveSceneMove(scene, this.state.scenePlayerPos, target);
    if (next.x !== this.state.scenePlayerPos.x || next.y !== this.state.scenePlayerPos.y) {
      this.state.scenePlayerPos = next;
      this.renderSceneCanvas(scene);
    }
  }

  resolveSceneMove(scene, start, target) {
    const attempt = this.clampScenePoint(scene, target);
    if (!this.isSceneBlocked(scene, attempt)) {
      return attempt;
    }

    const xOnly = this.clampScenePoint(scene, { x: attempt.x, y: start.y });
    const yOnly = this.clampScenePoint(scene, { x: start.x, y: attempt.y });
    const canX = !this.isSceneBlocked(scene, xOnly);
    const canY = !this.isSceneBlocked(scene, yOnly);

    if (canX && canY) {
      const dx = Math.abs(xOnly.x - start.x);
      const dy = Math.abs(yOnly.y - start.y);
      return dx >= dy ? xOnly : yOnly;
    }
    if (canX) {
      return xOnly;
    }
    if (canY) {
      return yOnly;
    }
    return start;
  }

  clampScenePoint(scene, point, radius = SCENE_PLAYER_RADIUS) {
    return {
      x: clamp(point.x, radius, scene.size.width - radius),
      y: clamp(point.y, radius, scene.size.height - radius)
    };
  }

  isSceneBlocked(scene, point, radius = SCENE_PLAYER_RADIUS) {
    for (const obstacle of scene.obstacles || []) {
      if (
        point.x + radius > obstacle.x &&
        point.x - radius < obstacle.x + obstacle.width &&
        point.y + radius > obstacle.y &&
        point.y - radius < obstacle.y + obstacle.height
      ) {
        return true;
      }
    }
    return false;
  }

  getSceneNpcs(scene) {
    if (!scene || !this.state.player) {
      return [];
    }
    const anchors = scene.npcAnchors || {};
    return this.scheduler
      .getNpcsAt(this.state.player.location)
      .map((npc) => {
        const anchor = anchors[npc.id];
        if (!anchor) {
          return null;
        }
        return {
          ...npc,
          position: { x: anchor.x, y: anchor.y }
        };
      })
      .filter(Boolean);
  }

  handleSceneCanvasClick(event) {
    const scene = this.getActiveNodeScene();
    if (!scene || !this.dom.exploreCanvas) {
      return;
    }

    const rect = this.dom.exploreCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * scene.size.width;
    const y = ((event.clientY - rect.top) / rect.height) * scene.size.height;

    const sceneNpcs = this.getSceneNpcs(scene);
    const npcHit = sceneNpcs.find((npc) => distance(npc.position, { x, y }) <= 28);
    if (npcHit) {
      this.state.sceneSelectedNpcId = npcHit.id;
      this.renderContextActions();
      this.renderSceneCanvas(scene, sceneNpcs);
      return;
    }

    const poiHit = (scene.pois || []).find((poi) => {
      const radius = Number.isFinite(poi.radius) ? poi.radius : 26;
      return distance({ x: poi.x, y: poi.y }, { x, y }) <= radius;
    });
    if (poiHit) {
      this.observeScenePoi(poiHit.id);
      return;
    }

    const exitHit = (scene.exits || []).find(
      (exit) => x >= exit.x && x <= exit.x + exit.width && y >= exit.y && y <= exit.y + exit.height
    );
    if (exitHit) {
      this.travelTo(exitHit.toNodeId);
      return;
    }

    if (this.state.sceneSelectedNpcId) {
      this.state.sceneSelectedNpcId = null;
      this.renderContextActions();
      this.renderSceneCanvas(scene, sceneNpcs);
    }
  }

  observeScenePoi(poiId) {
    const scene = this.getActiveNodeScene();
    if (!scene) {
      return;
    }
    const poi = (scene.pois || []).find((item) => item.id === poiId);
    if (!poi) {
      return;
    }

    const minutes = Number.isFinite(poi.timeCost) && poi.timeCost > 0 ? Math.round(poi.timeCost) : 5;
    const text = poi.logText || `你观察了${poi.label || "场景细节"}。`;
    this.state.sceneSelectedNpcId = null;
    this.pushLog(text, "system");
    this.advanceClock(minutes);
    this.render();
  }

  renderMenu() {
    const forcedOpen = Boolean(this.state.currentEvent || this.state.battle);
    const isOpen = forcedOpen || this.state.menuOpen;
    if (this.dom.bookContent) {
      this.dom.bookContent.classList.toggle("hidden", !isOpen);
    }
    if (this.dom.jianghuBook) {
      this.dom.jianghuBook.classList.toggle("expanded", isOpen);
    }
    this.dom.menuToggle.textContent = isOpen ? "收起江湖录" : "江湖录";
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
    if (!this.dom.logList) {
      return;
    }

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

  renderLogOverlay() {
    if (!this.dom.logOverlayList) {
      return;
    }

    const now = Date.now();
    const visible = this.state.logs
      .slice(-LOG_OVERLAY_MAX_ITEMS)
      .filter((item) => !item.createdAt || now - item.createdAt <= LOG_OVERLAY_WINDOW_MS)
      .map((item, index, list) => {
        const age = item.createdAt ? now - item.createdAt : 0;
        const fade = item.createdAt
          ? clamp(1 - age / LOG_OVERLAY_WINDOW_MS, 0.16, 1)
          : clamp(0.72 - (list.length - index - 1) * 0.08, 0.2, 0.75);
        const className = item.type ? `log-${item.type}` : "";
        return `<div class=\"overlay-log-item ${className}\" style=\"opacity:${fade.toFixed(2)}\"><span class=\"log-time\">[${item.time}]</span> ${item.message}</div>`;
      })
      .join("");

    this.dom.logOverlayList.innerHTML = visible || `<div class=\"overlay-log-item small\">暂无新消息</div>`;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeLogEntries(rawLogs) {
  if (!Array.isArray(rawLogs)) {
    return [];
  }

  const now = Date.now();
  const baseStep = 1200;
  return rawLogs
    .filter((item) => item && typeof item.message === "string")
    .map((item, index) => {
      const createdAt = Number.isFinite(item.createdAt)
        ? item.createdAt
        : now - (rawLogs.length - index) * baseStep;
      return {
        id: typeof item.id === "string" ? item.id : `${createdAt}-${index}`,
        time: typeof item.time === "string" ? item.time : "",
        message: item.message,
        type: typeof item.type === "string" ? item.type : "system",
        createdAt
      };
    });
}
