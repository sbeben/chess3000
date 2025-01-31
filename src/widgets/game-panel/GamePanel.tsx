import { useUnit } from "effector-react";
import { ConfirmPickButton } from "~/features/pick-pieces/ConfirmPickButton";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { ValueInfo } from "~/features/pick-pieces/ValueInfo";
import { $isKingOnBoard, $value } from "~/features/pick-pieces/model";
import { SwitchOrientationButton } from "~/features/switch-board-orientation/SwitchOrientationButton";
import { $isBoardOrientationOriginal } from "~/features/switch-board-orientation/model";
import { GameHistory } from "~/features/view-game-history/GameHistory";
import { HistoryButtons } from "~/features/view-game-history/HistoryButtons";
import { $$state, $boardSize, $color, $opponentColor, $status, time } from "~/game/model";
import { Timer } from "~/game/parts";
import { Link } from "~/shared/routing";
import { colors } from "~/shared/ui/colors";
import { H } from "~/shared/ui/components/H";
import { P } from "~/shared/ui/components/P";
import { useBreakpoint } from "~/shared/utils/useBreakpoints";

import { DrawButton } from "./DrawButton";
import { ResignButton } from "./ResignButton";

const TimerPanel = ({ isOpponent, isMobile }: { isOpponent: boolean; isMobile?: boolean }) => {
  const { color, opponentColor, turn, status } = useUnit({
    color: $color,
    opponentColor: $opponentColor,
    turn: $$state.$turn,
    status: $status,
  });

  const timers = useUnit({
    white: time.white.$timer,
    black: time.black.$timer,
  });

  return (
    <div
      className={`
      flex justify-between items-center px-2 md:px-3 pb-2 pt-1 md:py-3 w-full max-w-[600px] lg:bg-gray
        ${isMobile && isOpponent ? "rounded-t" : ""}
        ${isMobile && !isOpponent ? "rounded-b" : ""}
      `}
    >
      {status === "pick" ? (
        <>
          <ValueInfo />
          {isMobile && <ConfirmPickButton className="max-w-[100px]" />}
        </>
      ) : (
        !!color &&
        !!opponentColor && (
          <>
            <H variant="h4">{isOpponent ? `Opponent ${opponentColor}` : `You (${color})`}</H>
            <div className="flex gap-1 h-full justify-end items-center">
              {turn === (isOpponent ? opponentColor[0] : color[0]) && (
                <div
                  className="w-5 h-5 flex justify-center items-center"
                  style={{
                    background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
                  }}
                >
                  ♟️
                </div>
              )}
              <Timer time={timers[isOpponent ? opponentColor : color]} />
            </div>
          </>
        )
      )}
    </div>
  );
};
const ControlPanel = () => {
  const { status, color, value, isKingOnBoard, boardSize, result } = useUnit({
    status: $status,
    color: $color,
    value: $value,
    isKingOnBoard: $isKingOnBoard,
    boardSize: $boardSize,
    result: $$state.$result,
  });
  return (
    <div className="w-full lg:h-full px-2 tall:p-2 sm:p-4 lg:p-6 max-w-[600px]">
      {status === "pick" && (
        <div className=" h-full flex flex-row lg:flex-col justify-center items-center gap-2">
          <PickPieces
            color={color ?? "white"}
            value={value ?? 25}
            isKingActive={!isKingOnBoard}
            boardWidth={boardSize}
          />
        </div>
      )}
      {["analysis", "game", "finished"].includes(status) && (
        <div className={`h-full w-full flex flex-col lg:flex-col-reverse gap-2`}>
          <div className="flex justify-center items-center gap-0.5 sm:gap-1 md:gap-2">
            <HistoryButtons.ToFirst />
            <HistoryButtons.OneBack />
            {status === "game" && (
              <>
                <SwitchOrientationButton />
                <DrawButton />
                <ResignButton />
              </>
            )}
            <HistoryButtons.OneForward />
            <HistoryButtons.ToLast />
          </div>
          {status === "analysis" && result && (
            <P secondary className="text-gray w-full text-center">
              {`Game over. ${result === "draw" ? "Draw." : result.charAt(0).toUpperCase() + result.slice(1) + " won."} `}
              <Link href="/">
                <u>Play again</u>
              </Link>
            </P>
          )}
          <div className="flex-1 overflow-auto">
            <GameHistory />
          </div>
        </div>
      )}
    </div>
  );
};
export const GamePanel = ({ children }: { children: React.ReactNode }) => {
  const { isOriginalOrientation, status } = useUnit({
    isOriginalOrientation: $isBoardOrientationOriginal,
    status: $status,
  });

  const isDesktop = useBreakpoint("lg");

  return (
    <div className="flex flex-col lg:justify-center items-center lg:flex-row w-full h-full max-h-[600px] lg:gap-4">
      {/* Mobile: Top timer panel */}
      {!isDesktop && status !== "created" && (
        <div className="w-full flex justify-center">
          <TimerPanel isOpponent={isOriginalOrientation} isMobile={true} />
        </div>
      )}

      {/* Board */}
      <div className="w-full lg:w-auto">{children}</div>

      {/* Mobile: Bottom panels */}
      {!isDesktop && status !== "created" && (
        <div className="w-full flex flex-col items-center">
          {(status === "game" || status === "finished") && (
            <TimerPanel isOpponent={!isOriginalOrientation} isMobile={true} />
          )}
          <ControlPanel />
        </div>
      )}

      {/* Desktop: Side panel */}
      {isDesktop && status !== "created" && (
        <div className="flex flex-col h-full max-h-[600px] w-[300px] bg-white border border-gray rounded">
          <TimerPanel isOpponent={isOriginalOrientation} />
          <div className="flex-1 overflow-hidden">
            <ControlPanel />
          </div>
          {status === "pick" ? <ConfirmPickButton /> : <TimerPanel isOpponent={!isOriginalOrientation} />}
        </div>
      )}
    </div>
  );
};
