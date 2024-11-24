import { invoke } from "@withease/factories";
import { Chess } from "chess.js";
import { createEvent, createStore, restore, sample } from "effector";
import { and, not } from "patronum";
import type { BoardPosition, Piece, Square } from "~/types/game";

import { createChess } from "./factory";

export const values = {
  P: 1,
  B: 3,
  N: 3,
  R: 5,
  Q: 9,
  K: 0,
};

export const getPieceValue = (piece: Piece) => values[piece[1]! as keyof typeof values];

export const FEN = { empty: "8/8/8/8/8/8/8/8 w - - 0 1" };

//invite stores
export const $inviteLink = createStore<string | null>("https://chaotenschach.com/");

//create stores
export const $time = createStore<number | null>(null);

//pick events
export const sparePieceDropped = createEvent<{ piece: Piece; square: Square }>();
export const pieceDroppedOffBoard = createEvent<{ piece: Piece; square: Square }>();
export const picked = createEvent();

//pick stores
export const $isKingOnBoard = createStore<boolean>(false);
export const $isConfirmDisabled = not($isKingOnBoard);

//game events
export const offerDraw = createEvent();
export const resign = createEvent();
export const switchOrientation = createEvent();
export const backward = createEvent();
export const forward = createEvent();

//game stores
export const $notation = createStore<string | null>(null);
export const $currentMove = createStore<number>(0);
export const $totalMoves = createStore<number>(0);

//common events and stores
export const positionChanged = createEvent<BoardPosition>();

export const $value = createStore(35);

export const $color = createStore<"black" | "white" | null>(null);

const $whiteTime = createStore<number | null>(null);
const $blackTime = createStore<number | null>(null);

export const time = {
  $white: $whiteTime,
  $black: $blackTime,
};

export const $key = createStore<string | null>(null);

export const $selfId = createStore<string | null>(null);

export const $status = createStore<"created" | "joined" | "pick" | "game" | null>("pick");

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
  clock: kingDroppedOff,
  filter: $isKingOnBoard,
  fn: () => false,
  target: $isKingOnBoard,
});

positionChanged.watch(console.log);
