import type { Chess } from "chess.js";
import type { BoardPosition, Piece } from "~/types/game";

import { GAME_OVER_REASONS } from "../../../common/contracts";

export const values = {
  P: 1,
  B: 3,
  N: 3,
  R: 5,
  Q: 9,
  K: 0,
};

export const FEN = {
  empty: "8/8/8/8/8/8/8/8 w - - 0 1",
  full: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
};

export const GAME_OVER_REASONS_MAP: { [key in (typeof GAME_OVER_REASONS)[number]]: string } = {
  timeout: "Time is out.",
  resignation: "Resignation.",
  stalemate: "Stalemate.",
  checkmate: "Checkmate.",
  threefold_repetition: "Threefold repetition.",
  insufficient_material: "Insufficient material.",
  draw_agreement: "Opponents agreed on a draw.",
  user_disconnected: "User disconnected.",
  invalid_pick: "Pick is incorrect and unplayable.",
};

export const clone = (chess: Chess): Chess => {
  const copy = Object.create(Object.getPrototypeOf(chess));
  Object.assign(copy, chess);
  return copy;
};

export const getPieceValue = (piece: Piece) => values[piece[1]! as keyof typeof values];

export const calculatePositionValue = (position: BoardPosition) => {
  let value = 0;
  for (const [square, piece] of Object.entries(position)) {
    value += getPieceValue(piece);
  }
  return value;
};
