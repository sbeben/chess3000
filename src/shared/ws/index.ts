import type { Move } from "chess.js";
import { attach, createEffect, createEvent, createStore, sample, scopeBind } from "effector";
import type { BoardPosition } from "~/types/game";

import {
  WS_CLIENT_COMMANDS_SCHEMA_DICT,
  type WsClientDataDict,
  type WsServerDataDict,
} from "../../../common/contracts";
import { getWebSocketUrl } from "../utils/url";

type WsServerEventType = keyof WsServerDataDict;
type WsClientEventType = keyof WsClientDataDict;

type WsMessage = { type: WsServerEventType; data: WsServerDataDict[WsServerEventType] };

export function wsMessage<T extends WsServerEventType>(type: T, data?: WsServerDataDict[T]) {
  return { type, data: data! };
}

export function createMessage<T extends WsClientEventType>(type: T, data?: WsClientDataDict[T]) {
  return { type, data: data! };
}

//const wsConnectionFailed = createEvent()

export const sendMessage = createEvent<Record<string, string | object>>();
export const close = createEvent<number>();

export const opened = createEvent();
export const closed = createEvent<Event>();
const rawMessageReceived = createEvent<string>();
export const messageReceived = createEvent<WsMessage>();

export const $socket = createStore<WebSocket | null>(null);
export const $socketConnectionFail = createStore(false);
export const $isConnected = createStore(false)
  .on(opened, () => true)
  .on(closed, () => false);

// export const closeWsConnectionFx = createEffect<number, void>(async (code) => {
//   // console.log('here')
//   if (!!socket) {
//     let loaded = false
//     // console.log('here2')
//     // socket.onclose = () => {}
//     socket.close(code)
//     const timeout = 30000 // 30 seconds timeout
//     const startTime = Date.now()

//     while (!loaded) {
//       if (Date.now() - startTime > timeout) {
//         throw new Error('WebSocket connection timeout')
//       }
//       loaded = socket.readyState === WebSocket.CLOSED
//       await new Promise((resolve) => setTimeout(resolve, 50))
//     }
//   }
// })
const validateMessageFx = createEffect<string, WsMessage>((raw: string) => {
  //TODO validate
  const res = JSON.parse(raw);
  if (res.error) throw new Error(res.error);
  return res;
});

export const initWebsocketFx = createEffect<{ data: { gameKey: string; playerId: string } }, WebSocket>(
  async ({ data }) => {
    //   if (!token) throw new Error("No token");
    //   const protocol = ["access_token", token];
    const link = `${getWebSocketUrl(import.meta.env.PUBLIC_ENV__HOST || "http://0.0.0.0:4000")}connect/${data.gameKey}/${data.playerId}`;
    const socket = new WebSocket(link);
    let loaded = false;
    socket.addEventListener(
      "open",
      scopeBind(() => opened(), { safe: true }),
    );
    socket.addEventListener(
      "message",
      scopeBind((event) => rawMessageReceived(event.data), { safe: true }),
    );

    socket.addEventListener(
      "close",
      scopeBind((e) => closed(e), { safe: true }),
    );

    socket.addEventListener(
      "error",
      scopeBind((e) => closed(e), { safe: true }),
    );

    const timeout = 30000; // 30 seconds timeout
    const startTime = Date.now();

    while (!loaded) {
      if (Date.now() - startTime > timeout) {
        throw new Error("WebSocket connection timeout");
      }
      loaded = socket.readyState === WebSocket.OPEN;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return socket;
  },
);

export const reconnectFx = attach({ effect: initWebsocketFx });

const sendEffect = createEffect<{ socket: WebSocket | null; message: any }, void>(({ socket, message }) => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    throw new Error("Socket closed");
  } else {
    socket.send(JSON.stringify(message));
  }
});

const sendMessageFx = attach({
  source: $socket,
  effect: (socket, message: Record<string, string | object>) => sendEffect({ socket, message }),
});

sample({
  clock: initWebsocketFx.doneData,
  target: $socket,
});

sample({
  clock: sendMessage,
  target: sendMessageFx,
});

sample({
  clock: rawMessageReceived,
  target: validateMessageFx,
});

sample({
  clock: validateMessageFx.doneData,
  target: messageReceived,
});
