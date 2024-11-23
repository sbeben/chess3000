import { createFactory } from "@withease/factories";
import { Chess, type Move, type Square } from "chess.js";
import { createEffect, createEvent, createStore, sample } from "effector";

export const createChess = createFactory(() => {
  const initialChess = new Chess();

  // Create a store for the chess instance
  const $chess = createStore<Chess>(initialChess);

  // Create events for updating the chess state
  const moveEvent = createEvent<string | Move>();
  const undoEvent = createEvent();
  const loadEvent = createEvent<string>();
  const resetEvent = createEvent();

  // Create effects for chess methods
  const moveEffect = createEffect(({ chess, move }: { chess: Chess; move: string | Move }) => {
    const result = chess.move(move);
    return !!result; // Return true if the move was successful
  });

  const undoEffect = createEffect((chess: Chess) => {
    return chess.undo();
  });

  const loadEffect = createEffect(({ chess, fen }: { chess: Chess; fen: string }) => {
    return chess.load(fen);
  });

  const resetEffect = createEffect(() => {
    return new Chess(); // Only create a new instance on reset
  });

  // Connect events to effects using sample
  sample({
    clock: moveEvent,
    source: $chess,
    fn: (chess, move) => ({ chess, move }),
    target: moveEffect,
  });

  sample({
    clock: undoEvent,
    source: $chess,
    target: undoEffect,
  });

  sample({
    clock: loadEvent,
    source: $chess,
    fn: (chess, fen) => ({ chess, fen }),
    target: loadEffect,
  });

  sample({
    clock: resetEvent,
    target: resetEffect,
  });

  // Update the chess store based on effect results
  $chess
    .on(moveEffect.done, (chess, { result }) => {
      if (result) return chess; // The move was already applied in the effect
      return chess; // Return unchanged if move was invalid
    })
    .on(undoEffect.done, (chess) => chess) // The undo was already applied in the effect
    .on(loadEffect.done, (chess) => chess) // The new position was already loaded in the effect
    .on(resetEffect.done, (_, { result }) => result); // Use the new instance created by resetEffect

  // Create derived stores for chess data
  const $fen = $chess.map((chess) => chess.fen());
  const $turn = $chess.map((chess) => chess.turn());
  const $inCheck = $chess.map((chess) => chess.isCheck());
  const $inCheckmate = $chess.map((chess) => chess.isCheckmate());
  const $inStalemate = $chess.map((chess) => chess.isStalemate());
  const $inDraw = $chess.map((chess) => chess.isDraw());
  const $insufficientMaterial = $chess.map((chess) => chess.isInsufficientMaterial());
  const $inThreefoldRepetition = $chess.map((chess) => chess.isThreefoldRepetition());
  const $gameOver = $chess.map((chess) => chess.isGameOver());
  const $history = $chess.map((chess) => chess.history());

  // Additional helper method
  const getPossibleMovesEffect = createEffect(({ chess, square }: { chess: Chess; square: Square }) => {
    return chess.moves({ square });
  });

  const getPossibleMoves = createEvent<Square>();
  sample({
    clock: getPossibleMoves,
    source: $chess,
    fn: (chess, square) => ({ chess, square }),
    target: getPossibleMovesEffect,
  });

  return {
    // Events for triggering actions
    move: moveEvent,
    undo: undoEvent,
    load: loadEvent,
    reset: resetEvent,
    // Stores for chess data
    $chess,
    $fen,
    $turn,
    $inCheck,
    $inCheckmate,
    $inStalemate,
    $inDraw,
    $insufficientMaterial,
    $inThreefoldRepetition,
    $gameOver,
    $history,

    // Helper method
    getPossibleMoves,
  };
});
