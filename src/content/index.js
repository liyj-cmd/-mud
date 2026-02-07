import * as map from "../data/map.js";
import { npcs } from "../data/npcs.js";
import { events } from "../data/events.js";
import { enemies } from "../data/enemies.js";
import { factions } from "../data/factions.js";
import { martialArts } from "../data/martialArts.js";
import { listNpcMartialLoadouts } from "../data/npcMartialLoadouts.js";
import { items } from "../data/items.js";
import { npcInteractionProfiles } from "../data/npcInteractionProfiles.js";
import { chapter01Slice } from "./slices/chapter01.js";

const contentRegistry = Object.freeze({
  map,
  npcs,
  events,
  enemies,
  factions,
  martialArts,
  npcMartialLoadouts: listNpcMartialLoadouts(),
  items,
  npcInteractionProfiles,
  slices: {
    chapter_01: chapter01Slice
  },
  defaultSliceId: chapter01Slice.id
});

export function getRuntimeContent() {
  return contentRegistry;
}

export function getDefaultSlice() {
  return contentRegistry.slices[contentRegistry.defaultSliceId] || null;
}
