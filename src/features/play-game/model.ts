import type { Move } from "chess.js";
import type { WsServerDataDict } from "common/ws";
import { sample } from "effector";
import { $$state } from "~/game/model";
import { createMessage, messageReceived, sendMessage } from "~/shared/ws";

export const moveReceived = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "move",
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
