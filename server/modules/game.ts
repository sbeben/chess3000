import { type WebSocket } from "@fastify/websocket";

import { customToFen } from "../utils/chess.js";
import { WSMap, parse, send, validate } from "./ws.js";

interface CleanupOptions {
  gameKey: string;
  reason?: string;
  code?: number;
  notifyPlayers?: boolean;
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
        // send other player pick event
      }
    } else if (type === "move") {
      const { move, timestamp } = validate("move", data);

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
