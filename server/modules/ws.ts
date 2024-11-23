import { type WebSocket } from "@fastify/websocket";
import type { Chess } from "chess.js";
import z from "zod";
import type { BoardPosition, Piece, Square } from "~/types/game";

export type InferZodMap<T extends abstract new (...args: any) => any> = {
  [k in keyof Partial<InstanceType<T>>]?: unknown;
};
type WSMapType = Record<
  string,
  {
    players: { [id: string]: { conn: WebSocket | null; color: "white" | "black"; pick: BoardPosition | null } };
    game: Chess;
    value: number;
    status: "created" | "waiting" | "accepted" | "pick" | "game" | "finished";
    turn: "white";
    time: {
      initial: number;
      white: number;
      black: number;
    };
  }
>;
export const WSMap: WSMapType = {};

type WsServerEventType = "created" | "accepted" | "start" | "moved" | "finished";
type WsClientEventType = "confirm_pick" | "move" | "resign";
type WsServerDataDict = {
  // server
  finished: { result: "white" | "black" | "draw" };
  created: { playerColor: "black" | "white"; value: number; time: number; link: string }; //{ link: string; playerColor: "black" | "white"; value: number; gameKey: string; playerId: string };
  // joined: {};
  start: { fen: string };
  accepted: {};
  // move: { from: string; to: string };
  moved: { playerId: string; from: string; to: string; success: boolean };
};

export function send<T extends WsServerEventType>(socket: WebSocket, type: T, data?: WsServerDataDict[T]) {
  socket.send(JSON.stringify({ type, data }));
}

type WsClientDataDict = {
  confirm_pick: { position: BoardPosition };
  move: { piece: string; square: string; timestamp: number };
  resign: { timestamp: number };
};

export const wsSchemaDict: Record<WsClientEventType, z.Schema> = {
  confirm_pick: z.object({ position: z.record(z.string()) }).strict(),
  move: z.object({ piece: z.string(), square: z.string(), timestamp: z.number() }).strict(),
  resign: z.object({ timestamp: z.number() }).strict(),
};

export function parse(message: string) {
  const data = JSON.parse(message);
  return z
    .object({ type: z.enum(Object.keys(wsSchemaDict) as [WsClientEventType]), data: z.record(z.unknown()) })
    .strict()
    .parse(data);
}

export function validate<T extends WsClientEventType, K>(type: T, data: K) {
  return wsSchemaDict[type].parse(data) as WsClientDataDict[T];
}

export function handleClientCommands(socket: WebSocket) {
  socket.on("message", (message) => {});
}
