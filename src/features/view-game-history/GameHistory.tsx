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
  console.log({
    currentMove,
    history,
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => toFirst()}
          disabled={currentMove <= 1}
          className="px-2 py-1 bg-white rounded disabled:opacity-50"
        >
          ⏮️
        </button>
        <button
          onClick={() => oneBack()}
          disabled={currentMove <= 1}
          className="px-2 py-1 bg-white rounded disabled:opacity-50"
        >
          ⏪
        </button>
        <button
          onClick={() => oneForward()}
          disabled={currentMove === history.length}
          className="px-2 py-1 bg-white rounded disabled:opacity-50"
        >
          ⏩
        </button>
        <button
          onClick={() => toLast()}
          disabled={currentMove === history.length}
          className="px-2 py-1 bg-white rounded disabled:opacity-50"
        >
          ⏭️
        </button>
      </div>

      <div
        className={`
        overflow-y-auto max-h-40
        flex flex-wrap lg:flex-col`}
      >
        {movesPaired.length > 0 &&
          movesPaired.map((pair, index) => (
            <div key={index} className="flex gap-4 lg:mr-0 lg:w-full items-center">
              <span className="min-w-[2ch] text-gray">{index + 1}.</span>
              <button
                onClick={() => goToMove(index * 2 + 1)}
                className={`px-2 py-1 rounded ${currentMove === index * 2 + 1 && currentMove === history.length ? "bg-blue-700 pointer-events-none" : currentMove === index * 2 + 1 ? "bg-blue text-white" : "bg-white hover:bg-gray-700"}`}
              >
                {pair.white}
              </button>
              {pair.black && (
                <button
                  onClick={() => goToMove(index * 2 + 2)}
                  className={`px-2 py-1 rounded ${currentMove === history.length && currentMove === index * 2 + 2 ? "bg-blue-700 pointer-events-none" : currentMove === index * 2 + 2 ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-700"}`}
                >
                  {pair.black}
                </button>
              )}
            </div>
          ))}
      </div>

      {isViewingHistory && (
        <div className="text-center text-sm text-gray-500">
          Viewing move {currentMove} of {history.length}
        </div>
      )}
    </div>
  );
};
