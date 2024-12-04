import { type WebSocket } from "@fastify/websocket";
import { Chess } from "chess.js";

import type { GameRoom } from "../types.js";
import { customToFen } from "../utils/chess.js";
import { parseTime } from "../utils/time.js";
import { WSMap, parse, send, validate } from "./ws.js";

interface CleanupOptions {
  gameKey: string;
  reason?: string;
  code?: number;
  notifyPlayers?: boolean;
}

export function createGameRoom({
  gameKey,
  playerId,
  playerColor,
  value,
  time,
}: {
  gameKey: string;
  playerId: string;
  playerColor: "black" | "white";
  value: number;
  time: string;
}): GameRoom {
  return {
    players: { [playerId]: { conn: null, color: playerColor, pick: null } },
    game: new Chess(),
    value,
    status: "created",
    turn: "white",
    time: { white: parseTime(time), black: parseTime(time), initial: parseTime(time) },
    isDrawOffered: null,
  };
}

export function cleanupGame(gameKey: string) {
  const gameRoom = WSMap[gameKey];
  if (gameRoom) {
    Object.values(gameRoom.players).forEach((player) => {
      if (player.conn) {
        player.conn.close();
      }
    });
    delete WSMap[gameKey];
  }
}

type CreateGameCommandsParams = {
  gameKey: string;

  playerId: string;
  socket: WebSocket;
};

export function createGameCommands({ socket, gameKey, playerId }: CreateGameCommandsParams) {
  const gameRoom = WSMap[gameKey];

  if (!gameRoom) {
    socket.close();
    throw new Error("Connection not found");
    return;
  }

  const game = gameRoom.game;

  socket.on("message", (message) => {
    const { type, data } = parse(message.toString());
    if (!type) {
      socket.close();
      return;
    }

    const player = gameRoom.players[playerId]!;
    const otherPlayerId = Object.keys(gameRoom.players).filter((pId) => pId !== playerId)[0]!;
    const otherPlayer = gameRoom.players[otherPlayerId]!;

    if (type === "confirm_pick") {
      const { position } = validate("confirm_pick", data);
      player.pick = position;

      if (!!otherPlayer?.pick) {
        const fen = customToFen({ ...position, ...otherPlayer.pick });
        game.load(fen, { skipValidation: true });
        if (game.isCheck() || game.isCheckmate() || game.isStalemate() || game.isInsufficientMaterial()) {
          send(otherPlayer!.conn!, "game_over", { result: "draw" });
          send(player!.conn!, "game_over", { result: "draw" });
        } else {
          send(socket, "start", { fen });
          send(otherPlayer!.conn!, "start", { fen });

          gameRoom.status = "game";
        }
      } else {
        // send "other player picked"event
      }
    } else if (type === "move") {
      const { move, timestamp } = validate("move", data);

      try {
        const correctMove = game.move(move);

        if (game.isGameOver()) {
          let result: "white" | "black" | "draw" = game.isCheckmate()
            ? game.turn() === "w"
              ? "black"
              : "white"
            : "draw";

          send(otherPlayer.conn!, "move", { move: correctMove, timestamp: Date.now() });
          send(otherPlayer.conn!, "game_over", { result });
          send(player.conn!, "game_over", { result });

          cleanupGame(gameKey);
        } else {
          send(otherPlayer!.conn!, "move", {
            move: correctMove,
            timestamp: Date.now(),
          });
          if (gameRoom.isDrawOffered) {
            gameRoom.isDrawOffered = null;
          }
        }
      } catch (e) {
        send(otherPlayer.conn!, "error", { message: (e as Error).message });
      }
    } else if (type === "draw_offer") {
      const { color, timestamp } = validate("draw_offer", data);

      if (!gameRoom.isDrawOffered) {
        gameRoom.isDrawOffered = color;

        send(otherPlayer.conn!, "draw_offer", { color, timestamp });
      }
    } else if (type === "draw_decline") {
      const { timestamp } = validate("draw_decline", data);

      if (gameRoom.isDrawOffered) {
        gameRoom.isDrawOffered = null;
        send(otherPlayer.conn!, "draw_decline", { timestamp });
      }
    } else if (type === "draw_accept") {
      const { timestamp } = validate("draw_accept", data);

      if (gameRoom.isDrawOffered) {
        send(otherPlayer.conn!, "game_over", { result: "draw" });
        send(player.conn!, "game_over", { result: "draw" });

        cleanupGame(gameKey);
      }
    } else if (type === "resign") {
      const { color, timestamp } = validate("resign", data);
      const result = color === "white" ? "black" : "white";
      send(otherPlayer.conn!, "game_over", { result });
      send(player.conn!, "game_over", { result });

      cleanupGame(gameKey);
    } else {
      console.log("Unknown message type:", type);
    }
  });
}
