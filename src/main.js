import { GameScene } from "./scenes/gameScene.js";
import { saveGame, loadGame, clearSave, hasSave } from "./systems/save.js";

const dom = {
  playerSummary: document.querySelector("#player-summary"),
  timeSummary: document.querySelector("#time-summary"),
  explorePanel: document.querySelector("#explore-panel"),
  battlePanel: document.querySelector("#battle-panel"),
  mapWrapper: document.querySelector("#map-wrapper"),
  exploreCanvas: document.querySelector("#explore-canvas"),
  sceneHud: document.querySelector("#scene-hud"),
  sceneHudTitle: document.querySelector("#scene-hud-title"),
  sceneHudHint: document.querySelector("#scene-hud-hint"),
  mapNodes: document.querySelector("#map-nodes"),
  mapLines: document.querySelector("#map-lines"),
  mapInfo: document.querySelector("#map-info"),
  baseActions: document.querySelector("#base-actions"),
  contextActions: document.querySelector("#context-actions"),
  battleStatus: document.querySelector("#battle-status"),
  battleHpBars: document.querySelector("#battle-hp-bars"),
  battleCanvas: document.querySelector("#battle-canvas"),
  logList: document.querySelector("#log-list"),
  btnSceneMode: document.querySelector("#btn-scene-mode"),
  btnSave: document.querySelector("#btn-save"),
  btnNewGame: document.querySelector("#btn-new-game"),
  btnWorldmap: document.querySelector("#btn-worldmap"),
  worldmapModal: document.querySelector("#worldmap-modal"),
  worldmapClose: document.querySelector("#worldmap-close"),
  worldmapSvg: document.querySelector("#worldmap-svg"),
  worldmapDetail: document.querySelector("#worldmap-detail"),
  menuToggle: document.querySelector("#menu-toggle"),
  sheetModal: document.querySelector("#sheet-modal"),
  sheetTitle: document.querySelector("#sheet-title"),
  sheetContent: document.querySelector("#sheet-content"),
  sheetClose: document.querySelector("#sheet-close"),
  modal: document.querySelector("#character-modal"),
  inputName: document.querySelector("#input-name"),
  btnStart: document.querySelector("#btn-start"),
  saveActions: document.querySelector("#save-actions")
};

const scene = new GameScene({
  dom,
  onSave: (state) => saveGame(state)
});

function closeModal() {
  dom.modal.classList.remove("show");
}

function openModal() {
  dom.modal.classList.add("show");
}

function selectedAlignment() {
  const radio = document.querySelector('input[name="alignment"]:checked');
  return radio ? radio.value : "侠义";
}

function showSaveActions() {
  if (!hasSave()) {
    dom.saveActions.innerHTML = "";
    return;
  }

  dom.saveActions.innerHTML = [
    `<button id="btn-load-save" class="secondary-btn">读取旧档</button>`,
    `<button id="btn-delete-save" class="secondary-btn">删除旧档</button>`
  ].join("");

  const btnLoad = document.querySelector("#btn-load-save");
  const btnDelete = document.querySelector("#btn-delete-save");

  btnLoad.addEventListener("click", () => {
    const snapshot = loadGame();
    if (snapshot && snapshot.game) {
      const ok = scene.loadFromSnapshot(snapshot.game);
      if (ok) {
        closeModal();
      }
    }
  });

  btnDelete.addEventListener("click", () => {
    clearSave();
    showSaveActions();
  });
}

function startFromInput() {
  const name = dom.inputName.value.trim() || "无名客";
  const alignment = selectedAlignment();
  scene.stop();
  scene.startNewGame({ name, alignment });
  closeModal();
}

dom.btnStart.addEventListener("click", startFromInput);
dom.inputName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    startFromInput();
  }
});

dom.btnNewGame.addEventListener("click", () => {
  scene.stop();
  showSaveActions();
  openModal();
});

window.addEventListener("beforeunload", () => {
  scene.stop();
  const snapshot = scene.getSerializableState();
  if (snapshot) {
    saveGame(snapshot);
  }
});

showSaveActions();
openModal();
