import * as Game from "~/game/model";
import * as WSApi from "~/shared/ws";
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { clientNavigateFx } from "~/shared/routing";
import { $socket } from "~/shared/ws";

import { pageStarted } from "./+pageStarted";

export const gate = createGate();

export const navigateClicked = createEvent();

sample({
  clock: navigateClicked,
  fn: () => "/game/123",
  target: clientNavigateFx,
});

export const createGameClicked = createEvent();
export const sendMessage = createEvent<Record<string, string>>();

// const createGameFx = createEffect(async () => {
//   console.log(import.meta.env.PUBLIC_ENV__BASE_URL);
//   let loaded = false;

//   const ws = new WebSocket(`ws://${import.meta.env.PUBLIC_ENV__BASE_URL}/create/35/white/5:00`);
//   ws.onopen = () => {
//     console.log(`WebSocket connection established`);
//     ws.send("hello");
//   };
//   ws.onmessage = (event) => {
//     console.log("Message from server:", event.data);
//   };
//   const timeout = 30000; // 30 seconds timeout
//   const startTime = Date.now();

//   while (!loaded) {
//     if (Date.now() - startTime > timeout) {
//       throw new Error("WebSocket connection timeout");
//     }
//     loaded = ws.readyState === WebSocket.OPEN;
//     await new Promise((resolve) => setTimeout(resolve, 50));
//   }
//   return ws;
// });

const createGameFx = attach({ effect: WSApi.initWebsocketFx });

// const sendEffect = createEffect<{ socket: WebSocket | null; message: any }, void>(({ socket, message }) => {
//   if (!socket || socket.readyState === WebSocket.CLOSED) {
//     throw new Error("Socket closed");
//   } else {
//     socket.send(JSON.stringify(message));
//   }
// });

// const sendMessageFx = attach({
//   source: $socket,
//   effect: (socket, message: Record<string, string>) => sendEffect({ socket, message }),
// });

sample({
  clock: createGameClicked,
  source: { value: Game.$value, color: Game.$color, time: Game.$time },
  fn: (data) => WSApi.createMessage("create", data),
  target: createGameFx,
});

sample({
  clock: WSApi.messageReceived,
  filter: ({ type }) => type === "created",
  fn: ({ data }) => ({ playerId: data.playerId, gameKey: data.gameKey }),
  target: spread({ playerId: Game.$selfId, gameKey: Game.$key }),
});
