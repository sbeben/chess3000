import { invoke } from "@withease/factories";
import type { Move } from "chess.js";
import { createEvent, sample, scopeBind } from "effector";
import { type WsClientEventType, createMessage, messageReceived, sendMessage } from "~/shared/ws";

import type { WsClientDataDict, WsServerDataDict } from "../../common/contracts";

//input
export const moveReceived = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "move",
  fn: ({ data }) => {
    const { move, timestamp } = data as WsServerDataDict["move"];
    return { move: move as Move, timestamp };
  },
});

export const gameCreated = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "created",
  fn: ({ type, data }) => {
    const { playerColor, value, time, link, increment } = data as WsServerDataDict["created"];
    return { type: "created" as const, playerColor, value, time, increment, link, orientation: playerColor };
  },
});

export const opponentAccepted = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "accepted",
});

export const gameJoined = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "joined",
  fn: ({ type, data }) => {
    const { playerColor, value, time, increment } = data as WsServerDataDict["joined"];
    return { type: "pick" as const, playerColor, value, time, increment, orientation: playerColor };
  },
});

export const gameStarted = sample({
  clock: messageReceived,
  filter: ({ type }) => type === "start",
  fn: ({ data }) => {
    const { fen } = data as WsServerDataDict["start"];
    return { fen };
  },
});

//output

// export const sendCommand = <T extends WsClientEventType>({ type, data }: { type: T; data?: WsClientDataDict[T] }) => {
//   const bound = scopeBind(sendMessage, { safe: true });
//   bound({ type, data });
// };
