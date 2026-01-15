import { loadState, saveState } from "../persistence/storage.js";

export function initStore() {
  let state = loadState();
  return {
    getState: () => state,
    setState: (next) => {
      state = next;
      saveState(state);
    },
    update: (fn) => {
      const next = structuredClone(state);
      fn(next);
      state = next;
      saveState(state);
    }
  };
}

