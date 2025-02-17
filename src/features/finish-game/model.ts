import { invoke } from "@withease/factories";
import { createEvent, createStore, sample } from "effector";
import { condition, not, or, spread } from "patronum";
import { moveReceived } from "~/game/commands";
import { $$state, $color, $status, time } from "~/game/model";
import { GAME_OVER_REASONS_MAP } from "~/game/parts/helpers";
import { $$setableStore, $$toggle } from "~/shared/utils/effector";
import { createMessage, messageReceived, sendMessage } from "~/shared/ws";

import { type WsServerDataDict } from "../../../common/contracts";

export const resignClicked = createEvent();
export const offerDrawClicked = createEvent();

export const [$isResignClicked, toggleResignClicked] = invoke($$toggle, false);
export const [$isOfferDrawClicked, toggleDrawClicked] = invoke($$toggle, false);

export const [$offeredDraw, setOfferedDraw] = invoke(() => $$setableStore(false));
export const $opponentOfferedDraw = createStore(false);

export const resign = createEvent();
export const offerDraw = createEvent();

export const acceptDraw = createEvent();
export const declineDraw = createEvent();

export const $gameOverReason = createStore<string | null>(null);

export const $shouldShowEndgameDialog = $status.map((s) => s === "finished");
export const closeEndgameDialogClicked = createEvent();

condition({
  source: resignClicked,
  if: $isResignClicked,
  then: resign,
  else: toggleResignClicked,
});

condition({
  source: offerDrawClicked,
  if: $isOfferDrawClicked,
  then: offerDraw,
  else: toggleDrawClicked,
});

sample({
  clock: resign,
  source: $color,
  fn: (color) => createMessage("resign", { color: color!, timestamp: Date.now() }),
  target: [sendMessage, $isResignClicked.reinit],
});

sample({
  clock: offerDraw,
  filter: or(not($offeredDraw), not($opponentOfferedDraw)),
  source: $color,
  fn: (color) => createMessage("draw_offer", { color: color!, timestamp: Date.now() }),
  target: [sendMessage, setOfferedDraw.prepend(() => true), $isOfferDrawClicked.reinit],
});

sample({
  clock: messageReceived,
  filter: ({ type }) => type === "draw_offer",
  fn: () => true,
  target: $opponentOfferedDraw,
});

sample({
  clock: declineDraw,
  fn: () => createMessage("draw_decline", { timestamp: Date.now() }),
  target: [sendMessage, $opponentOfferedDraw.reinit],
});

sample({
  clock: acceptDraw,
  fn: () => createMessage("draw_accept", { timestamp: Date.now() }),
  target: [sendMessage, $opponentOfferedDraw.reinit],
});

sample({
  clock: messageReceived,
  filter: ({ type }) => type === "draw_decline",
  target: [$opponentOfferedDraw.reinit],
});

sample({
  clock: moveReceived,
  target: [$isOfferDrawClicked.reinit, $isResignClicked.reinit, $opponentOfferedDraw.reinit, $offeredDraw.reinit],
});

sample({
  clock: messageReceived,
  filter: ({ type }) => type === "game_over",
  fn: ({ data }) => {
    const { result, reason } = data as WsServerDataDict["game_over"];
    return {
      status: "finished" as const,
      isOver: true,
      result,
      timers: { offset: 0 },
      reason: GAME_OVER_REASONS_MAP[reason],
    };
  },
  target: spread({
    status: $status,
    result: $$state.$result,
    isOver: $$state.$isOver,
    reason: $gameOverReason,
    timers: [time.black.stop, time.white.stop],
  }),
});

sample({
  clock: closeEndgameDialogClicked,
  fn: () => "analysis" as const,
  target: $status,
});
