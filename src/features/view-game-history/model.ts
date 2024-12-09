import { Chess } from "chess.js";
import { createEvent, createStore, sample } from "effector";
import { $$state, $displayedPosition, $initialPosition } from "~/game/model";

// Events
export const goToMove = createEvent<number>();
export const oneMoveBack = createEvent();
export const oneMoveForward = createEvent();
export const toFirstMove = createEvent();
export const toLastMove = createEvent();

// Stores
export const $isViewingHistory = createStore(false);
export const $currentHistoryMove = createStore(0);

// Get total moves from game history
const $totalMoves = $$state.$history.map((history) => history.length);

// Handle one move back
sample({
  clock: oneMoveBack,
  source: $currentHistoryMove,
  filter: (current) => current > 0,
  fn: (current) => current - 1,
  target: goToMove,
});

// Handle one move forward
sample({
  clock: oneMoveForward,
  source: {
    current: $currentHistoryMove,
    total: $totalMoves,
  },
  filter: ({ current, total }) => current < total,
  fn: ({ current }) => current + 1,
  target: goToMove,
});

// Handle to first move
sample({
  clock: toFirstMove,
  fn: () => 0,
  target: goToMove,
});

// Handle to last move
sample({
  clock: toLastMove,
  source: $totalMoves,
  fn: (total) => total,
  target: goToMove,
});

// Handle direct move navigation
sample({
  clock: goToMove,
  source: $totalMoves,
  filter: (total, moveNum) => moveNum >= 0 && moveNum <= total,
  fn: (_, moveNum) => moveNum,
  target: $currentHistoryMove,
});

// Update isViewingHistory flag
sample({
  clock: $currentHistoryMove,
  source: $totalMoves,
  fn: (total, current) => current < total,
  target: $isViewingHistory,
});

// Update displayed position based on current move
sample({
  clock: $currentHistoryMove,
  source: { currentChess: $$state.$chess, initialPosition: $initialPosition },
  filter: $isViewingHistory,
  fn: ({ currentChess, initialPosition }, moveNum) => {
    // Reset to initial position
    const newChess = new Chess();
    newChess.load(initialPosition, { skipValidation: true });
    const moves = currentChess.history();

    for (let i = 0; i < moveNum; i++) {
      newChess.move(moves[i]!);
    }
    return newChess.fen();
  },
  target: $displayedPosition,
});

sample({
  clock: [$totalMoves.updates, goToMove],
  source: $currentHistoryMove,
  filter: (currentMove, newTotal) => newTotal - currentMove === 1,
  fn: (_, newTotal) => newTotal,
  target: $currentHistoryMove,
});
