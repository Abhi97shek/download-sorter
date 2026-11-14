import { useSyncExternalStore } from "react";

/**
 * One switch for the page's looping background motion (the hero field, the
 * demo window, the popup's drift). The choice lives on <html data-paused>
 * so plain scripts and React components read the same state.
 */
const EVENT = "motionpause";

export const isPaused = () => typeof document !== "undefined" && document.documentElement.dataset.paused === "true";

export function setPaused(paused: boolean) {
  if (paused) document.documentElement.dataset.paused = "true";
  else delete document.documentElement.dataset.paused;
  window.dispatchEvent(new Event(EVENT));
}

export function onPauseChange(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export const usePaused = () => useSyncExternalStore(onPauseChange, isPaused, () => false);
