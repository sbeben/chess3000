import type { Color, Move } from "chess.js";
import { createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { $value, picked } from "~/features/pick-pieces/model";
import "~/features/play-game/model";
import { $boardOrientation } from "~/features/switch-board-orientation/model";
import { gameCreated, gameJoined, gameStarted, opponentAccepted } from "~/game/commands";
import {
  $$state,
  $color,
  $displayedPosition,
  $initialPosition,
  $inviteLink,
  $key,
  $position,
  $positionObject,
  $selfId,
  $status,
  time,
} from "~/game/model";
import { $$resizeListener } from "~/shared/utils/effector";
import { createMessage, initWebsocketFx, sendMessage } from "~/shared/ws";

import { pageStarted } from "./+pageStarted";

export const gate = createGate();

sample({
  clock: pageStarted,
  fn: ({ data }) => ({
    gameKey: data.gameKey,
    playerId: data.playerId,
  }),
  target: spread({
    gameKey: $key,
    playerId: $selfId,
  }),
});

sample({
  clock: gate.open,
  target: $$resizeListener.init,
});

sample({
  clock: gate.close,
  target: $$resizeListener.cleanup,
});

sample({
  clock: gate.open,
  source: { gameKey: $key, playerId: $selfId },
  fn: ({ gameKey, playerId }) => ({ data: { gameKey: gameKey!, playerId: playerId! } }),
  target: initWebsocketFx,
});

//for game creator
sample({
  clock: gameCreated,
  target: spread({
    type: $status,
    playerColor: $color,
    value: $value,
    time: [time.black.$timer, time.white.$timer],
    increment: [time.black.$increment, time.white.$increment],
    link: $inviteLink,
    orientation: $boardOrientation,
  }),
});

sample({
  clock: opponentAccepted,
  fn: () => "pick" as const,
  target: $status,
});

//for second player
sample({
  clock: gameJoined,
  target: spread({
    type: $status,
    playerColor: $color,
    value: $value,
    time: [time.black.$timer, time.white.$timer],
    increment: [time.black.$increment, time.white.$increment],
    orientation: $boardOrientation,
    // link: $inviteLink,
  }),
});

//for both
sample({
  clock: picked,
  source: $positionObject,
  fn: (position) => createMessage("confirm_pick", { position: position! }),
  target: sendMessage,
});

sample({
  clock: gameStarted,
  source: $color,
  fn: (color, { fen }) => {
    const playerColor = (color === "white" ? "w" : "b") as Color;
    return { status: "game" as const, position: fen, load: { fen, playerColor } };
  },
  target: spread({
    status: $status,
    position: [$position, $displayedPosition, $initialPosition],
    load: $$state.load,
  }),
});
