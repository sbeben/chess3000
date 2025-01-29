import { type WebSocket } from "@fastify/websocket";
import type { Chess } from "chess.js";
import "fastify";

import { Timer } from "./utils/time";

export type GameRoom = {
  players: {
    [id: string]: {
      conn: WebSocket | null;
      color: "white" | "black";
      pick: BoardPosition | null;
      timer: Timer;
    };
  };
  game: Chess;
  value: number;
  status: "created" | "waiting" | "accepted" | "pick" | "game" | "finished";
  time: {
    initial: number;
    increment: number;
  };
  isDrawOffered: "black" | "white" | null;
  creatorColor: "black" | "white" | "random";
  syncTimeout: NodeJS.Timeout | null;
};

export type WSMapType = Record<string, GameRoom>;

export type Square =
  | "a8"
  | "b8"
  | "c8"
  | "d8"
  | "e8"
  | "f8"
  | "g8"
  | "h8"
  | "a7"
  | "b7"
  | "c7"
  | "d7"
  | "e7"
  | "f7"
  | "g7"
  | "h7"
  | "a6"
  | "b6"
  | "c6"
  | "d6"
  | "e6"
  | "f6"
  | "g6"
  | "h6"
  | "a5"
  | "b5"
  | "c5"
  | "d5"
  | "e5"
  | "f5"
  | "g5"
  | "h5"
  | "a4"
  | "b4"
  | "c4"
  | "d4"
  | "e4"
  | "f4"
  | "g4"
  | "h4"
  | "a3"
  | "b3"
  | "c3"
  | "d3"
  | "e3"
  | "f3"
  | "g3"
  | "h3"
  | "a2"
  | "b2"
  | "c2"
  | "d2"
  | "e2"
  | "f2"
  | "g2"
  | "h2"
  | "a1"
  | "b1"
  | "c1"
  | "d1"
  | "e1"
  | "f1"
  | "g1"
  | "h1";
export type Piece = "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";
export type BoardPosition = {
  [square in Square]?: Piece;
};
declare module "fastify" {
  interface FastifyRequest {
    serverData?: Record<string, any>;
  }
}
