import { attach, createEffect, createEvent, createStore, sample } from "effector";
import type { BoardPosition } from "~/types/game";

type WSMessage =
  | {
      type: "created";
      data: { playerColor: "black" | "white"; value: number; time: number; link: string };
    }
  | { type: "start"; data: { fen: string } };

// {
//   type: "created";
//   data: { link: string; playerColor: "black" | "white"; value: number; gameKey: string; playerId: string };
// };
//   | { type: "joined" }
// | { type: "accepted"; data: {} };
//   | { type: "moved"; data: { playerId: string; from: string; to: string; success: boolean } };

type WsServerEventType = "created" | "accepted" | "moved" | "start" | "finished";
type WsClientEventType = "create" | "join" | "ready" | "move" | "confirm_pick";
type WsClientDataDict = {
  // server
  create: {};
  join: {};
  ready: { fen: string };
  move: { square: string; piece: string; timestamp: number };
  confirm_pick: { position: BoardPosition };
  // move: { from: string; to: string };
};
export type WsServerDataDict = {
  // server
  start: { fen: string };
  finished: { result: "white" | "black" | "draw" };
  created: { playerColor: "black" | "white"; value: number; time: number; link: string };
  joined: {};
  accepted: {};
  moved: { playerId: string; from: string; to: string; success: boolean };
  started: {};
};

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
export const closed = createEvent();
const rawMessageReceived = createEvent<string>();
export const messageReceived = createEvent<WSMessage>();

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
const validateMessageFx = createEffect<string, WSMessage>((raw: string) => {
  //TODO validate
  const res = JSON.parse(raw);
  if (res.error) throw new Error(res.error);
  return res;
});

export const initWebsocketFx = createEffect<{ type: "create" | "join"; data: Record<string, any> }, WebSocket>(
  async ({ type, data }) => {
    //   if (!token) throw new Error("No token");
    //   const protocol = ["access_token", token];
    const link = `ws://${import.meta.env.PUBLIC_ENV__BASE_URL}${type === "create" ? "/create/35/white/5:00" : `/join/${data.roomId}/${data.playerId}`}`;
    const socket = new WebSocket(link);
    let loaded = false;

    socket.onopen = function (e) {
      opened();
      // console.log("[open] Connection established");
      // console.log("Sending to server");
    };
    socket.onmessage = function (event) {
      // const parsedData: WSEventReceived = JSON.parse(event.data)
      rawMessageReceived(event.data);
      // console.log(event.data)
    };
    socket.onclose = function (event) {
      // socket.close()
      closed();
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`, event);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log("socketClose", event);
        console.log("[close] Connection died");
      }
    };

    socket.onerror = function (error) {
      console.log("socketerr", error);
      closed();
      //console.log(`${error.message}`);
    };

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
// const decreaseRetries = createEvent()
// const $retries = createStore(3).on(decreaseRetries, (retries) => retries - 1)

// sample({
//   clock: delay({
//     source: merge([closed, initWebsocketFx.fail]),
//     timeout: 1500,
//   }),
//   filter: $retries.map((retries) => retries > 0),
//   source: $token,
//   target: [reconnectFx, decreaseRetries],
// })

// sample({
//   clock: reconnectFx.fail,
//   fn: () => true,
//   target: $socketConnectionFail,
// })

// sample({
//   clock: reconnectFx.done,
//   target: $socketConnectionFail.reinit,
// })

sample({
  clock: rawMessageReceived,
  target: validateMessageFx,
});

sample({
  clock: validateMessageFx.doneData,
  target: messageReceived,
});

// sample({
//   clock: close,
//   target: closeWsConnectionFx,
// })
