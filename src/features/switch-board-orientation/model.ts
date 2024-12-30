import { combine, createEvent, createStore, sample } from "effector";
import { $color } from "~/game/model";

export const switchOrientation = createEvent();
export const $boardOrientation = createStore<"white" | "black">("white");
export const $isBoardOrientationOriginal = combine($boardOrientation, $color, (orientation, color) => {
  if (!color) return true;
  return (orientation === "white" && color === "white") || (orientation === "black" && color === "black");
});

sample({
  clock: switchOrientation,
  source: $boardOrientation,
  fn: (boardOrientation) => (boardOrientation === "white" ? "black" : "white"),
  target: $boardOrientation,
});
