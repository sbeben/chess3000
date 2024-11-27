import { type WebSocket } from "@fastify/websocket";
import type { Chess, Move } from "chess.js";
import type { WSMapType } from "server/types";
import z from "zod";

export type InferZodMap<T extends abstract new (...args: any) => any> = {
  [k in keyof Partial<InstanceType<T>>]?: unknown;
};

export const WSMap: WSMapType = {};

type WsServerEventType = "created" | "accepted" | "joined" | "start" | "move" | "game_over";
type WsClientEventType = "confirm_pick" | "move" | "resign" | "draw_offer" | "draw_decline" | "draw_accept";
type WsServerDataDict = {
  // server

  created: { playerColor: "black" | "white"; value: number; time: number; link: string }; //this event receives game creator
  // joined: {};
  start: { fen: string };
  accepted: {}; // this event receives game creator when second player joined;
  joined: { playerColor: "black" | "white"; value: number; time: number }; // this event receives second player when he joined;
  // move: { from: string; to: string };
  move: { move: Move; timestamp: number };
  game_over: { result: "white" | "black" | "draw" };
};

export function send<T extends WsServerEventType>(socket: WebSocket, type: T, data?: WsServerDataDict[T]) {
  socket.send(JSON.stringify({ type, data }));
}

// type WsClientDataDict = {
//   confirm_pick: { position: BoardPosition };
//   move: { move: Move; timestamp: number };
//   resign: { timestamp: number };
// };

export const wsSchemaDict = z.object({
  confirm_pick: z.object({ position: z.record(z.string()) }).strict(),
  // opponent_picked: z.object({ timestamp: z.number() }).strict(),
  move: z
    .object({
      move: z.object({
        from: z.string(),
        to: z.string(),
        promotion: z.string().optional(),
      }),
      timestamp: z.number(),
    })
    .strict(),
  resign: z.object({ color: z.string(), timestamp: z.number() }).strict(),
  draw_offer: z.object({ color: z.string(), timestamp: z.number() }).strict(),
  draw_decline: z.object({ timestamp: z.number() }).strict(),
  draw_accept: z.object({ timestamp: z.number() }).strict(),
});

type WsClientDataDict = z.infer<typeof wsSchemaDict>;

export function parse(message: string) {
  const data = JSON.parse(message);
  return z
    .object({ type: z.enum(Object.keys(wsSchemaDict.shape) as [keyof WsClientDataDict]), data: z.record(z.unknown()) })
    .strict()
    .parse(data);
}

export function validate<T extends keyof WsClientDataDict, K>(type: T, data: K) {
  return wsSchemaDict.shape[type].parse(data) as WsClientDataDict[T];
}

export function handleClientCommands(socket: WebSocket) {
  socket.on("message", (message) => {});
}
