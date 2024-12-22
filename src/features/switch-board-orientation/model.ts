import { createEvent, createStore, sample } from "effector";

export const switchOrientation = createEvent();
export const $boardOrientation = createStore<"white" | "black">("white");

sample({
  clock: switchOrientation,
  source: $boardOrientation,
  fn: (boardOrientation) => (boardOrientation === "white" ? "black" : "white"),
  target: $boardOrientation,
});
