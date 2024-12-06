import type { Move } from "chess.js";
import type { WsServerDataDict } from "common/ws";
import { sample } from "effector";
import { equals } from "patronum";
import { $$state, time } from "~/game/model";
import { createMessage, messageReceived, sendMessage } from "~/shared/ws";

export const moveReceived = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "move",
});

sample({
  clock: $$state.moved,
  filter: equals($$state.$playerColor, "w"),
  target: time.white.stop.prepend(() => ({ offset: 0 })),
});

sample({
  clock: $$state.moved,
  filter: equals($$state.$playerColor, "b"),
  target: time.black.stop.prepend(() => ({ offset: 0 })),
});

sample({
  clock: $$state.moved,
  fn: (move) => createMessage("move", { move: move!, timestamp: Date.now() }),
  target: sendMessage,
});

sample({
  clock: moveReceived,
  fn: ({ data }) => {
    const { move, timestamp } = data as WsServerDataDict["move"];
    return { move: move as Move };
  },
  target: $$state.opponentMoved,
});

sample({
  clock: moveReceived,
  filter: equals($$state.$playerColor, "w"),
  fn: ({ data }) => {
    const { move, timestamp } = data as WsServerDataDict["move"];
    return { offset: Date.now() - timestamp };
  },
  target: [time.white.start, time.black.stop],
});

sample({
  clock: moveReceived,
  filter: equals($$state.$playerColor, "b"),
  fn: ({ data }) => {
    const { move, timestamp } = data as WsServerDataDict["move"];
    return { offset: Date.now() - timestamp };
  },
  target: [time.black.start, time.white.stop],
});
