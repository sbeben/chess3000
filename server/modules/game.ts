import { type WebSocket } from "@fastify/websocket";
import { Chess } from "chess.js";

import type { GameOverReasons, WsServerDataDict } from "../../common/contracts.js";
import type { GameRoom } from "../types.js";
import { customToFen } from "../utils/chess.js";
import { Timer, parseTime } from "../utils/time.js";
import { WSMap, parse, send, validate } from "./ws.js";

interface CleanupOptions {
  gameKey: string;
  reason?: string;
  code?: number;
  notifyPlayers?: boolean;
}

/**
 * Creates a new game room with the specified parameters.
 *
 * @param {string} gameKey - The unique key for the game.
 * @param {string} playerId - The ID of the player creating the game.
 * @param {"black" | "white"} playerColor - The color assigned to the player.
 * @param {number} value - The value associated with the game.
 * @param {number | null} time - The initial time in seconds , or null if not specified.
 * @param {number | null} increment - The increment time in seconds, or null if not specified.
 * @returns {GameRoom} The created game room with initialized settings.
 */
export function createGameRoom({
  gameKey,
  playerId,
  playerColor,
  value,
  time,
  increment,
}: {
  gameKey: string;
  playerId: string;
  playerColor: "black" | "white" | "random";
  value: number;
  time: number;
  increment: number;
}): GameRoom {
  return {
    players: {
      [playerId]: {
        conn: null,
        color: playerColor === "random" ? (Math.random() > 0.5 ? "black" : "white") : playerColor,
        pick: null,
        timer: new Timer({ time: time * 1000, increment: increment * 1000 }),
      },
    },
    game: new Chess(),
    value,
    status: "created",
    time: {
      initial: time * 1000,
      increment: increment * 1000,
    },
    isDrawOffered: null,
    creatorColor: playerColor,
    syncTimeout: null,
  };
}

export function cleanupGame(gameKey: string) {
  const gameRoom = WSMap[gameKey];
  if (gameRoom) {
    clearTimeout(gameRoom.syncTimeout ?? undefined);
    Object.values(gameRoom.players).forEach((player) => {
      if (player.conn) {
        player.conn.close();
      }
      if (player.timer) {
        player.timer.cleanup();
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

        let incorrectPick = false;

        incorrectPick = game.isCheck() || game.isCheckmate() || game.isStalemate() || game.isInsufficientMaterial();

        if (!incorrectPick) {
          const blackToMoveFen = fen.replace(" w ", " b ");
          const tempGame = new Chess();
          tempGame.load(blackToMoveFen, { skipValidation: true });
          incorrectPick =
            tempGame.isCheck() || tempGame.isCheckmate() || tempGame.isStalemate() || tempGame.isInsufficientMaterial();
        }
        //TODO decide what to do if the pick is incorrect, also send the fen
        if (incorrectPick) {
          send(otherPlayer!.conn!, "game_over", { result: "draw", reason: "invalid_pick" });
          send(player!.conn!, "game_over", { result: "draw", reason: "invalid_pick" });
        } else {
          if (player.timer) {
            player.timer.setTimeoutCallback(() => {
              send(otherPlayer!.conn!, "game_over", {
                result: player.color === "white" ? "black" : "white",
                reason: "timeout",
              });
              send(player!.conn!, "game_over", {
                result: player.color === "white" ? "black" : "white",
                reason: "timeout",
              });
              cleanupGame(gameKey);
            });
          }

          if (otherPlayer.timer) {
            otherPlayer.timer.setTimeoutCallback(() => {
              send(otherPlayer!.conn!, "game_over", {
                result: otherPlayer.color === "white" ? "black" : "white",
                reason: "timeout",
              });
              send(player!.conn!, "game_over", {
                result: otherPlayer.color === "white" ? "black" : "white",
                reason: "timeout",
              });
              cleanupGame(gameKey);
            });
          }

          send(socket, "start", { fen });
          send(otherPlayer!.conn!, "start", { fen });

          gameRoom.syncTimeout = setInterval(() => {
            send(socket, "sync", {
              [player.color as "white"]: player.timer.getCurrentTime(),
              [otherPlayer.color as "black"]: otherPlayer.timer.getCurrentTime(),
              timestamp: Date.now(),
            });
            send(otherPlayer.conn!, "sync", {
              [player.color as "white"]: player.timer.getCurrentTime(),
              [otherPlayer.color as "black"]: otherPlayer.timer.getCurrentTime(),
              timestamp: Date.now(),
            });
          }, 2500);

          gameRoom.status = "game";
        }
      } else {
        // send "other player picked"event
      }
    } else if (type === "move") {
      const { move, timestamp } = validate("move", data);

      try {
        const isFirstMove = game.history().length === 0;
        const correctMove = game.move(move);

        if (game.isGameOver()) {
          let result: "white" | "black" | "draw" = game.isCheckmate()
            ? game.turn() === "w"
              ? "black"
              : "white"
            : "draw";

          const reason: GameOverReasons = game.isCheckmate()
            ? "checkmate"
            : game.isInsufficientMaterial()
              ? "insufficient_material"
              : game.isStalemate()
                ? "stalemate"
                : "threefold_repetition";

          send(otherPlayer.conn!, "move", { move: correctMove, timestamp: Date.now() });
          send(otherPlayer.conn!, "game_over", { result, reason });
          send(player.conn!, "game_over", { result, reason });

          cleanupGame(gameKey);
        } else {
          const moveData: WsServerDataDict["move"] = {
            move: correctMove,
            timestamp: 0,
          };
          if (!!player.timer) {
            if (!isFirstMove) {
              player.timer.stop({ offset: Date.now() - timestamp });
            }
          }
          if (!!otherPlayer.timer) {
            otherPlayer.timer.start({ offset: Date.now() - timestamp });
          }
          moveData.timestamp = Date.now();
          send(otherPlayer!.conn!, "move", moveData);
          if (gameRoom.isDrawOffered) {
            gameRoom.isDrawOffered = null;
          }
        }
      } catch (e) {
        //TODO send it to the player who moved instead and check why it got here when wove was made under pinned king
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
        send(otherPlayer.conn!, "game_over", { result: "draw", reason: "draw_agreement" });
        send(player.conn!, "game_over", { result: "draw", reason: "draw_agreement" });

        cleanupGame(gameKey);
      }
    } else if (type === "resign") {
      const { color, timestamp } = validate("resign", data);
      const result = color === "white" ? "black" : "white";
      send(otherPlayer.conn!, "game_over", { result, reason: "resignation" });
      send(player.conn!, "game_over", { result, reason: "resignation" });

      cleanupGame(gameKey);
    } else {
      console.log("Unknown message type:", type);
    }
  });
}
