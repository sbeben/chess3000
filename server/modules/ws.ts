import { type WebSocket } from "@fastify/websocket";
import type { WSMapType } from "server/types";
import z from "zod";

export const WSMap: WSMapType = {};

export const WS_SERVER_COMMANDS_SCHEMA_DICT = z.object({
  created: z
    .object({
      playerColor: z.enum(["black", "white"]),
      value: z.number(),
      time: z.number(),
      link: z.string(),
    })
    .strict(),
  start: z
    .object({
      fen: z.string(),
    })
    .strict(),
  accepted: z.object({}).strict(),
  joined: z
    .object({
      playerColor: z.enum(["black", "white"]),
      value: z.number(),
      time: z.number(),
    })
    .strict(),
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
  game_over: z
    .object({
      result: z.enum(["white", "black", "draw"]),
    })
    .strict(),
});

export const WS_CLIENT_COMMANDS_SCHEMA_DICT = z.object({
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

type WsServerDataDict = z.infer<typeof WS_SERVER_COMMANDS_SCHEMA_DICT>;
type WsClientDataDict = z.infer<typeof WS_CLIENT_COMMANDS_SCHEMA_DICT>;

export function parse(message: string) {
  const data = JSON.parse(message);
  return z
    .object({
      type: z.enum(Object.keys(WS_CLIENT_COMMANDS_SCHEMA_DICT.shape) as [keyof WsClientDataDict]),
      data: z.record(z.unknown()),
    })
    .strict()
    .parse(data);
}

export function validate<T extends keyof WsClientDataDict, K>(type: T, data: K) {
  return WS_CLIENT_COMMANDS_SCHEMA_DICT.shape[type].parse(data) as WsClientDataDict[T];
}

export function send<T extends keyof WsServerDataDict>(socket: WebSocket, type: T, data?: WsServerDataDict[T]) {
  socket.send(JSON.stringify({ type, data }));
}
