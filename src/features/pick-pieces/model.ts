import { combine, createEvent, createStore, sample } from "effector";
import { equals, not, or } from "patronum";
import { $positionObject, $status, pieceDropped, positionChanged } from "~/game/model";
import { calculatePositionValue } from "~/game/parts/helpers";
import type { Piece, PieceDrop, Square } from "~/types/game";

export const sparePieceDropped = createEvent<{ piece: Piece; square: Square }>();
const pieceDroppedWhilePick = createEvent<PieceDrop>();
export const pieceDroppedOffBoard = createEvent<{ piece: Piece; square: Square }>();

export const picked = createEvent();
export const opponentPicked = createEvent();

export const $value = createStore(35);
export const $pickedValue = createStore(0);
export const $remainingPoints = combine([$value, $pickedValue], ([v, p]) => v - p);
const $isRemainingPointsNegative = $remainingPoints.map((p) => p < 0);
export const $isKingOnBoard = $positionObject.map((p) =>
  !p ? false : Object.values(p).filter((piece) => piece[1] === "K").length > 0,
);

export const $isPickConfirmed = createStore(false).on(picked, () => true);
export const $isOpponentPickConfirmed = createStore(false).on(opponentPicked, () => true);
export const $isConfirmDisabled = or(not($isKingOnBoard), $isRemainingPointsNegative, $isPickConfirmed);

sample({
  clock: sparePieceDropped,
  source: { position: $positionObject },
  // filter: ({ value }, { piece }) => value > 0 && getPieceValue(piece) <= value,
  fn: ({ position }, { piece, square }) => ({
    ...position,
    [square]: piece,
  }),
  target: positionChanged,
});

sample({
  clock: pieceDropped,
  filter: equals($status, "pick"),
  target: pieceDroppedWhilePick,
});

sample({
  clock: positionChanged,
  filter: equals($status, "pick"),
  fn: (position) => calculatePositionValue(position),
  target: $pickedValue,
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
