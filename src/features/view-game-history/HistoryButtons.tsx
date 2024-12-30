import { useUnit } from "effector-react";
import { $$state } from "~/game/model";

import { $currentHistoryMove, oneMoveBack, oneMoveForward, toFirstMove, toLastMove } from "./model";

export const HistoryButtons = {
  ToFirst: () => {
    const { onClick, currentMove } = useUnit({ onClick: toFirstMove, currentMove: $currentHistoryMove });
    return (
      <button
        onClick={() => onClick()}
        disabled={currentMove <= 1}
        className="px-2 py-1 bg-white rounded disabled:opacity-50"
      >
        ⏮️
      </button>
    );
  },
  OneBack: () => {
    const { onClick, currentMove } = useUnit({
      onClick: oneMoveBack,
      currentMove: $currentHistoryMove,
    });
    return (
      <button
        onClick={() => onClick()}
        disabled={currentMove <= 1}
        className="px-2 py-1 bg-white rounded disabled:opacity-50"
      >
        ⏪
      </button>
    );
  },
  OneForward: () => {
    const { onClick, currentMove, history } = useUnit({
      onClick: oneMoveForward,
      currentMove: $currentHistoryMove,
      history: $$state.$history,
    });
    return (
      <button
        onClick={() => onClick()}
        disabled={currentMove === history.length}
        className="px-2 py-1 bg-white rounded disabled:opacity-50"
      >
        ⏩
      </button>
    );
  },
  ToLast: () => {
    const { onClick, currentMove, history } = useUnit({
      onClick: toLastMove,
      currentMove: $currentHistoryMove,
      history: $$state.$history,
    });
    return (
      <button
        onClick={() => onClick()}
        disabled={currentMove === history.length}
        className="px-2 py-1 bg-white rounded disabled:opacity-50"
      >
        ⏭️
      </button>
    );
  },
};
