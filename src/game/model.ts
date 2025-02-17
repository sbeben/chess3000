import { invoke } from "@withease/factories";
import { createEvent, createStore, restore, sample } from "effector";
import { $$resizeListener } from "~/shared/utils/effector";
import type { BoardPosition, PieceDrop } from "~/types/game";

import { createChess } from "./parts/game-factory";
import { FEN } from "./parts/helpers";
import { createTimer } from "./parts/timer-factory";

//meta info
export const $key = createStore<string | null>(null);
export const $selfId = createStore<string | null>(null);
export const $status = createStore<"created" | "pick_await" | "pick" | "game" | "finished" | "analysis">("created");
export const $inviteLink = createStore<string | null>(null);
//

export const $color = createStore<"black" | "white" | null>(null);
export const $opponentColor = $color.map((c) => (c ? (c === "black" ? "white" : "black") : null));

export const positionChanged = createEvent<BoardPosition>();
export const $positionObject = restore(positionChanged, null);

export const pieceDropped = createEvent<PieceDrop>();

export const $initialPosition = createStore<string>(FEN.empty);
export const $position = createStore<string | null>(null);
export const $displayedPosition = createStore<string | null>(null);

export const $boardSize = $$resizeListener.$width.map((w) => {
  const padding = 0;
  const maxWidth = 600;
  return Math.min(w - padding, maxWidth);
});

export const time = {
  white: invoke(createTimer),
  black: invoke(createTimer),
};

export const $$state = invoke(createChess);

sample({
  clock: $status.updates,
  filter: (status) => status === "game",
  fn: () => true,
  target: $$state.$isOngoing,
});

sample({
  clock: $status.updates,
  filter: (status) => status === "finished",
  fn: () => false,
  target: $$state.$isOngoing,
});
