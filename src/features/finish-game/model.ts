import { invoke } from "@withease/factories";
import type { WsServerDataDict } from "common/ws";
import { createEvent, createStore, sample } from "effector";
import { condition, not, or, spread } from "patronum";
import { $$state, $color, $status } from "~/game/model";
import { $$setableStore, $$toggle } from "~/shared/utils/effector";
import { createMessage, messageReceived, sendMessage } from "~/shared/ws";

import { moveReceived } from "../play-game/model";

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
    const { result } = data as WsServerDataDict["game_over"];
    return { status: "finished" as const, isOver: true, result };
  },
  target: spread({
    status: $status,
    result: $$state.$result,
    isOver: $$state.$isOver,
  }),
});
