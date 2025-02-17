import { sample } from "effector";
import { equals, not } from "patronum";
import { moveReceived } from "~/game/commands";
import { $$state, $status, pieceDropped, time } from "~/game/model";
import { createMessage, sendMessage } from "~/shared/ws";
import type { PieceDrop } from "~/types/game";

sample({
  clock: pieceDropped,
  filter: equals($status, "game"),
  target: $$state.move.prepend(
    //
    ({ piece, from, to }: PieceDrop) => ({ from, to, promotion: piece[1]?.toLowerCase() }),
  ),
});

sample({
  clock: $$state.moved,
  fn: (move) => createMessage("move", { move: move!, timestamp: Date.now() }),
  target: sendMessage,
});

sample({
  clock: $$state.moved,
  filter: equals($$state.$playerColor, "w"),
  fn: () => ({ offset: 0 }),
  target: [time.white.stop, time.black.start],
});

sample({
  clock: $$state.moved,
  filter: equals($$state.$playerColor, "b"),
  fn: () => ({ offset: 0 }),
  target: [time.black.stop, time.white.start],
});

sample({
  clock: moveReceived,
  target: $$state.opponentMoved,
});

sample({
  clock: moveReceived,
  filter: equals($$state.$playerColor, "w"),
  fn: ({ timestamp }) => ({ offset: Date.now() - timestamp }),
  target: [time.white.start, time.black.stop],
});

sample({
  clock: moveReceived,
  filter: equals($$state.$playerColor, "b"),
  fn: ({ timestamp }) => ({ offset: Date.now() - timestamp }),
  target: [time.black.start, time.white.stop],
});

//needs improvement
// sample({
//   clock: timeSync,
//   source: { currWhite: time.white.$timer, currBlack: time.black.$timer },
//   fn: ({ currWhite, currBlack }, { diff, white, black }) => ({
//     white: Math.min(currWhite, white + diff),
//     black: Math.min(currBlack, black + diff),
//     log: { currWhite, servWhite: white + diff, currBlack, servBlack: black + diff },
//   }),
//   target: spread({
//     white: time.white.$timer,
//     black: time.black.$timer,
//     log: logFx,
//   }),
// });
