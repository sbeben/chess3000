import * as Game from "~/game/model";
import * as WsApi from "~/shared/ws";
import type { Color, Move } from "chess.js";
import { createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { $$mainResizeListener } from "~/shared/utils/effector";

import { type WsServerDataDict } from "../../../common/contracts";
import { pageStarted } from "./+pageStarted";

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
  target: $$mainResizeListener.init,
});

sample({
  clock: gate.close,
  target: $$mainResizeListener.cleanup,
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
    const { playerColor, value, time, link, increment } = data as WsServerDataDict["created"];
    return { type: "created" as const, playerColor, value, time, increment, link, orientation: playerColor };
  },
  target: spread({
    type: Game.$status,
    playerColor: Game.$color,
    value: Game.$value,
    time: [Game.time.black.$timer, Game.time.white.$timer],
    increment: [Game.time.black.$increment, Game.time.white.$increment],
    link: Game.$inviteLink,
    orientation: Game.$boardOrientation,
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
    const { playerColor, value, time, increment } = data as WsServerDataDict["joined"];
    return { type: "pick" as const, playerColor, value, time, increment, orientation: playerColor };
  },
  target: spread({
    type: Game.$status,
    playerColor: Game.$color,
    value: Game.$value,
    time: [Game.time.black.$timer, Game.time.white.$timer],
    increment: [Game.time.black.$increment, Game.time.white.$increment],
    orientation: Game.$boardOrientation,
    // link: Game.$inviteLink,
  }),
});

//for both
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
  source: Game.$color,
  filter: (_, { type }) => type === "start",
  fn: (color, { data }) => {
    const playerColor = (color === "white" ? "w" : "b") as Color;
    const { fen } = data as WsServerDataDict["start"];
    return { position: fen, load: { fen, playerColor } };
  },
  target: spread({
    position: [Game.$position, Game.$displayedPosition, Game.$initialPosition],
    load: Game.$$state.load,
  }),
});
