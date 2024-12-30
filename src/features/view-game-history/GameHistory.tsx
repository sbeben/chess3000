import { useUnit } from "effector-react";
import { $$state } from "~/game/model";

import {
  $currentHistoryMove,
  $isViewingHistory,
  goToMove,
  oneMoveBack,
  oneMoveForward,
  toFirstMove,
  toLastMove,
} from "./model";

export const GameHistory = () => {
  const { history, currentMove, isViewingHistory, toFirst, toLast, oneBack, oneForward, goTo } = useUnit({
    toFirst: toFirstMove,
    toLast: toLastMove,
    oneBack: oneMoveBack,
    oneForward: oneMoveForward,
    goTo: goToMove,
    history: $$state.$history,
    currentMove: $currentHistoryMove,
    isViewingHistory: $isViewingHistory,
  });

  const movesPaired = history.reduce((acc: { white: string; black?: string }[], move, index) => {
    const pairIndex = Math.floor(index / 2);

    if (index % 2 === 0) {
      acc.push({ white: move });
    } else if (acc[pairIndex]) {
      acc[pairIndex].black = move;
    }

    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full lg:h-full">
      <div
        className="
        w-full
        lg:h-full
        overflow-x-scroll
        overflow-y-scroll
        touch-pan-x"
      >
        <div className="flex lg:flex-col gap-2 min-w-max">
          {movesPaired.length > 0 &&
            movesPaired.map((pair, index) => (
              <div key={index} className="flex items-center shrink-0">
                <span className="text-gray w-[20px]">{index + 1}.</span>
                <button
                  onClick={() => goToMove(index * 2 + 1)}
                  className={`px-2 py-1 rounded ${
                    currentMove === index * 2 + 1 && currentMove === history.length
                      ? "bg-blue-700 pointer-events-none"
                      : currentMove === index * 2 + 1
                        ? "bg-blue text-white"
                        : "bg-white hover:bg-gray-700"
                  }`}
                >
                  {pair.white}
                </button>
                {pair.black && (
                  <button
                    onClick={() => goToMove(index * 2 + 2)}
                    className={`px-2 py-1 rounded ${
                      currentMove === history.length && currentMove === index * 2 + 2
                        ? "bg-blue-700 pointer-events-none"
                        : currentMove === index * 2 + 2
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-700"
                    }`}
                  >
                    {pair.black}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {isViewingHistory && (
        <div className="text-center text-sm text-gray-500">
          Viewing move {currentMove} of {history.length}
        </div>
      )}
    </div>
  );
};
