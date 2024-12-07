import { type WebSocket } from "@fastify/websocket";
import type { WSMapType } from "server/types";
import z from "zod";

import {
  WS_CLIENT_COMMANDS_SCHEMA_DICT,
  type WsClientDataDict,
  type WsServerDataDict,
} from "../../common/contracts.js";

export const WSMap: WSMapType = {};

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
