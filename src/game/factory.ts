import { createFactory } from "@withease/factories";
import { Chess, type Color, type Move, type Piece, type Square } from "chess.js";
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import { condition, debug, not } from "patronum";

export type MoveEvent = { from: Square; to: Square; promotion?: string };

export const clone = (chess: Chess): Chess => {
  const copy = Object.create(Object.getPrototypeOf(chess));
  Object.assign(copy, chess);
  return copy;
};

export const createChess = createFactory(() => {
  const initialChess = new Chess();

  const $chess = createStore<Chess>(initialChess);
  const $playerColor = createStore<Color>("w");

  const $isOver = createStore(false);
  const $result = createStore<"white" | "black" | "draw" | null>(null);

  const move = createEvent<MoveEvent>();
  const undo = createEvent();
  const load = createEvent<{ fen: string; playerColor: Color }>();
  const reset = createEvent();

  const moved = createEvent<Move>();
  const opponentMoved = createEvent<{ move: Move }>();

  const squareClicked = createEvent<Square>();
  const pieceSelected = createEvent<Square | null>();
  const $selectedSquare = createStore<Square | null>(null);
  const $validMoves = createStore<Move[]>([]);

  const $isKingChecked = createStore<"w" | "b" | null>(null);

  const moveFx = attach({
    source: $chess,
    mapParams: (move: { from: Square; to: Square }, chess) => ({ chess, move }),
    effect: createEffect<{ chess: Chess; move: { from: Square; to: Square } }, { chess: Chess; move: Move | string }>(
      ({ chess, move }) => {
        const copy = clone(chess);
        console.log({ copy, move });
        const validMove = copy.move(move);
        return { chess: copy, move: validMove };
      },
    ),
  });

  const opponentMoveFx = attach({
    source: $chess,
    mapParams: (move: MoveEvent, chess) => ({ chess, move }),
    effect: createEffect<{ chess: Chess; move: MoveEvent }, { chess: Chess; move: Move | string }>(
      ({ chess, move }) => {
        const copy = clone(chess);
        console.log({ copy, move });
        const validMove = copy.move(move);
        return { chess: copy, move: validMove };
      },
    ),
  });

  const undoFx = attach({
    source: $chess,
    mapParams: (_, chess) => chess,
    effect: createEffect<Chess, Move | null>((chess) => chess.undo()),
  });

  const loadFx = attach({
    source: $chess,
    mapParams: (fen: string, chess) => ({ chess, fen }),
    effect: createEffect<{ chess: Chess; fen: string }, { chess: Chess }>(({ chess, fen }) => {
      const copy = clone(chess);
      copy.load(fen, { skipValidation: true });
      return { chess: copy };
    }),
  });

  const getValidMovesFx = attach({
    source: $chess,
    mapParams: (square: Square | null, chess) => ({ chess, square }),
    effect: createEffect<{ chess: Chess; square: Square | null }, Move[]>(({ chess, square }) => {
      if (!square) return [];
      return chess.moves({ verbose: true }).filter((move) => move.from === square);
    }),
  });

  const resetFx = attach({
    source: $chess,
    mapParams: (_, chess) => chess,
    effect: createEffect<Chess, Chess>(() => new Chess()),
  });

  // logic
  sample({
    clock: move,
    target: moveFx,
  });

  sample({
    clock: undo,
    target: undoFx,
  });

  sample({
    clock: load,
    fn: ({ fen }) => fen,
    target: loadFx,
  });
  sample({
    clock: load,
    fn: ({ playerColor }) => playerColor,
    target: $playerColor,
  });

  sample({
    clock: reset,
    target: resetFx,
  });

  sample({
    clock: opponentMoved,
    fn: ({ move }) => move,
    target: opponentMoveFx,
  });
  //

  sample({
    clock: loadFx.doneData,
    fn: ({ chess }) => chess,
    target: $chess,
  });

  sample({
    clock: [moveFx.doneData, opponentMoveFx.doneData],
    fn: ({ chess }) => chess,
    target: $chess,
  });

  sample({
    clock: moveFx.doneData,
    fn: ({ move }) => move as Move,
    target: moved,
  });
  //
  sample({
    clock: squareClicked,
    source: {
      playerColor: $playerColor,
      selectedSquare: $selectedSquare,
      chess: $chess,
    },
    fn: ({ selectedSquare, chess, playerColor }, clickedSquare) => {
      // If we click the same square twice, deselect it
      if (selectedSquare === clickedSquare) {
        return null;
      }

      // If we click a square with a piece of the current player's color, select it
      const piece = chess.get(clickedSquare);
      if (piece && piece.color === chess.turn() && piece.color === playerColor) {
        return clickedSquare;
      }

      return null;
    },
    target: pieceSelected,
  });

  sample({
    clock: pieceSelected,
    target: $selectedSquare,
  });

  sample({
    clock: $selectedSquare.updates,
    filter: Boolean,
    target: getValidMovesFx,
  });

  sample({
    clock: getValidMovesFx.doneData,
    target: $validMoves,
  });

  sample({
    clock: [moveFx.finally, sample({ clock: $selectedSquare.updates, filter: (v) => !v })],
    target: $validMoves.reinit,
  });

  const $fen = $chess.map((chess) => chess.fen());
  const $turn = $chess.map((chess) => chess.turn());
  const $inCheck = $chess.map((chess) => chess.isCheck());
  const $inCheckmate = $chess.map((chess) => chess.isCheckmate());
  const $inStalemate = $chess.map((chess) => chess.isStalemate());
  const $inDraw = $chess.map((chess) => chess.isDraw());
  const $insufficientMaterial = $chess.map((chess) => chess.isInsufficientMaterial());
  const $inThreefoldRepetition = $chess.map((chess) => chess.isThreefoldRepetition());
  // const $gameOver = $chess.map((chess) => chess.isGameOver());
  const $history = $chess.map((chess) => chess.history());

  debug(
    squareClicked,
    $selectedSquare,
    $validMoves,
    // load,
    // loadFx,
    // move,
    // moveFx,
    // $chess,
    // $fen,
    // $turn,
    // $inCheck,
    // $inCheckmate,
    // $inStalemate,
    // $inDraw,
    // $insufficientMaterial,
    // $inThreefoldRepetition,
    // $gameOver,
    // $history,
    // moved,
  );
  return {
    // Events for triggering actions
    move: move,
    undo: undo,
    load: load,
    reset: reset,
    //
    opponentMoved,
    //
    moved,
    // Stores for chess data
    $playerColor,
    $chess,
    $isOver,
    $result,
    $fen,
    $turn,
    $inCheck,
    $inCheckmate,
    $inStalemate,
    $inDraw,
    $insufficientMaterial,
    $inThreefoldRepetition,
    $history,

    //
    squareClicked,

    $selectedSquare,
    $validMoves,
  };
});
