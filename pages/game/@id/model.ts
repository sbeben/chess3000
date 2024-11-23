import * as Game from "~/game/model";
import * as WsApi from "~/shared/ws";
import { createEffect, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { clientNavigateFx, redirectTo } from "~/shared/routing";

import { pageStarted } from "./+pageStarted";

// export const $gameKey = createStore("");
// export const $

export const gate = createGate();

sample({
  clock: pageStarted,
  fn: ({ data }) => ({
    gameKey: data.gameKey,
    playerId: data.playerId,
  }),
  target: spread({
    gameKey: Game.$key,
    playerId: Game.$selfId,
  }),
});

sample({
  clock: gate.open,
  source: { gameKey: Game.$key, playerId: Game.$selfId },
  fn: ({ gameKey, playerId }) => ({ data: { gameKey: gameKey!, playerId: playerId! } }),
  target: WsApi.initWebsocketFx,
});

//for game creator
sample({
  clock: WsApi.messageReceived,
  filter: ({ type }) => type === "created",
  fn: ({ type, data }) => {
    const { playerColor, value, time, link } = data as WsApi.WsServerDataDict["created"];
    return { type: "created" as const, playerColor, value, time, link };
  },
  target: spread({
    type: Game.$status,
    playerColor: Game.$color,
    value: Game.$value,
    time: Game.$time,
    link: Game.$inviteLink,
  }),
});

sample({
  clock: WsApi.messageReceived,
  filter: ({ type }) => type === "accepted",
  fn: () => "pick" as const,
  target: Game.$status,
});

//for second player
sample({
  clock: WsApi.messageReceived,
  filter: ({ type }) => type === "joined",
  fn: ({ type, data }) => {
    const { playerColor, value, time } = data as WsApi.WsServerDataDict["joined"];
    return { type: "pick" as const, playerColor, value, time };
  },
  target: spread({
    type: Game.$status,
    playerColor: Game.$color,
    value: Game.$value,
    time: Game.$time,
    // link: Game.$inviteLink,
  }),
});

// sample({
//   clock: WsApi.messageReceived,
//   filter: ({ type }) => type === "accepted",
//   fn: () => 'pick',
//   target: Game.$status
// });

sample({
  clock: Game.picked,
  source: Game.$positionObject,
  fn: (position) => WsApi.createMessage("confirm_pick", { position: position! }),
  target: WsApi.sendMessage,
});

sample({
  clock: WsApi.messageReceived,
  filter: ({ type }) => type === "start",
  fn: () => "game" as "game",
  target: Game.$status,
});

sample({
  clock: WsApi.messageReceived,
  filter: ({ type }) => type === "start",
  fn: ({ data }) => {
    const { fen } = data as WsApi.WsServerDataDict["start"];
    return fen;
  },
  target: [Game.$position, Game.$displayedPosition, Game.$$state.load],
});
