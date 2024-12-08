import { invoke } from "@withease/factories";
import { Chess } from "chess.js";
import { createEvent, createStore, restore, sample } from "effector";
import { and, condition, debug, equals, not, or } from "patronum";
import type { BoardPosition, Piece, Square } from "~/types/game";

import { createChess, createTimer } from "./factory";

type PieceDrop = { piece: Piece; from: Square; to: Square };

export const values = {
  P: 1,
  B: 3,
  N: 3,
  R: 5,
  Q: 9,
  K: 0,
};

export const getPieceValue = (piece: Piece) => values[piece[1]! as keyof typeof values];

export const FEN = {
  empty: "8/8/8/8/8/8/8/8 w - - 0 1",
  full: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
};

//invite stores
export const $inviteLink = createStore<string | null>(null);

//create stores
// export const $time = createStore<number | null>(null);

//pick events
export const sparePieceDropped = createEvent<{ piece: Piece; square: Square }>();
const pieceDroppedWhilePick = createEvent<PieceDrop>();
export const pieceDroppedOffBoard = createEvent<{ piece: Piece; square: Square }>();

export const picked = createEvent();
export const opponentPicked = createEvent();

//pick stores
export const $isKingOnBoard = createStore<boolean>(false);
export const $isPickConfirmed = createStore(false).on(picked, () => true);
export const $isOpponentPickConfirmed = createStore(false).on(opponentPicked, () => true);
export const $isConfirmDisabled = or(not($isKingOnBoard), $isPickConfirmed);

//game events

export const backward = createEvent();
export const forward = createEvent();

//game stores
export const $notation = createStore<string | null>(null);
export const $currentMove = createStore<number>(0);
export const $totalMoves = createStore<number>(0);

//common events and stores
export const pieceDropped = createEvent<PieceDrop>();
export const positionChanged = createEvent<BoardPosition>();

export const $value = createStore(35);

export const $color = createStore<"black" | "white" | null>(null);

export const switchOrientation = createEvent();
export const $boardOrientation = createStore<"white" | "black">("white");

const $$whiteTime = invoke(createTimer);
const $$blackTime = invoke(createTimer);

export const time = {
  white: $$whiteTime,
  black: $$blackTime,
};

export const $key = createStore<string | null>(null);

export const $selfId = createStore<string | null>(null);

export const $status = createStore<"created" | "pick_await" | "pick" | "game" | "finished">("created");

export const $position = createStore<string | null>(null);
export const $displayedPosition = createStore<string | null>(null);
export const $positionObject = restore(positionChanged, null);

export const $$state = invoke(createChess);

const kingDropped = sample({
  clock: sparePieceDropped,
  filter: ({ piece }) => getPieceValue(piece) === 0,
});

const kingDroppedOff = sample({
  clock: pieceDroppedOffBoard,
  filter: ({ piece }) => getPieceValue(piece) === 0,
});

const sparePieceDroppedOnKing = sample({
  clock: sparePieceDropped,
  source: $positionObject,
  filter: (position, { square }) => !!position && !!position[square] && getPieceValue(position[square]) === 0,
});

//when dropped on occupied square
sample({
  clock: sparePieceDropped,
  source: { value: $value, position: $positionObject },
  filter: ({ position }, { square }) => !!position && !!position[square],
  fn: ({ value, position }, { square }) => value + getPieceValue(position![square]!),
  target: $value,
});

//when dropped on empty square
sample({
  clock: sparePieceDropped,
  source: $value,
  filter: (value, { piece }) => value > 0 && getPieceValue(piece) <= value,
  fn: (value, { piece, square }) => {
    return value - getPieceValue(piece);
  },
  target: $value,
});

sample({
  clock: sparePieceDropped,
  source: { value: $value, position: $positionObject },
  filter: ({ value }, { piece }) => value > 0 && getPieceValue(piece) <= value,
  fn: ({ position }, { piece, square }) => ({
    ...position,
    [square]: piece,
  }),
  target: positionChanged,
});

sample({
  clock: kingDropped,
  filter: not($isKingOnBoard),
  fn: () => true,
  target: $isKingOnBoard,
});

sample({
  clock: pieceDroppedOffBoard,
  source: $value,
  fn: (value, { piece }) => value + getPieceValue(piece),
  target: $value,
});

sample({
  clock: pieceDroppedOffBoard,
  source: $positionObject,
  fn: (position, { piece, square }) => {
    const { [square]: p, ...rest } = position!;
    return rest;
  },
  target: positionChanged,
});

sample({
  clock: [kingDroppedOff, sparePieceDroppedOnKing],
  filter: $isKingOnBoard,
  fn: () => false,
  target: $isKingOnBoard,
});

condition({
  source: pieceDropped,
  if: equals($status, "pick"),
  then: pieceDroppedWhilePick,
  else: $$state.move.prepend(({ piece, from, to }: PieceDrop) => ({ from, to, promotion: piece[1]?.toLowerCase() })),
});

sample({
  clock: pieceDroppedWhilePick,
  source: $positionObject,
  filter: (position, { to }) => Boolean(position?.[to]),
  fn: (position, { to }) => ({ piece: position![to]!, square: to }),
  target: pieceDroppedOffBoard,
});

sample({
  clock: pieceDroppedWhilePick,
  source: $positionObject,
  fn: (position, { from, to }) => {
    const { [from]: p, ...rest } = position!;
    return {
      ...rest,
      [to]: p,
    };
  },
  target: positionChanged,
});

sample({
  clock: switchOrientation,
  source: $boardOrientation,
  fn: (boardOrientation) => (boardOrientation === "white" ? "black" : "white"),
  target: $boardOrientation,
});

sample({
  clock: $status.updates,
  filter: (status) => status === "game",
  fn: () => true,
  target: $$state.$isStarted,
});

sample({
  clock: $status.updates,
  filter: (status) => status === "finished",
  fn: () => false,
  target: $$state.$isStarted,
});

$positionObject.updates.watch(console.log);
