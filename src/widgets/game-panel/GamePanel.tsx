import { useUnit } from "effector-react";
import { ConfirmPickButton } from "~/features/pick-pieces/ConfirmPickButton";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { ValueInfo } from "~/features/pick-pieces/ValueInfo";
import { $isKingOnBoard, $value } from "~/features/pick-pieces/model";
import { SwitchOrientationButton } from "~/features/switch-board-orientation/SwitchOrientationButton";
import { $boardOrientation } from "~/features/switch-board-orientation/model";
import { GameHistory } from "~/features/view-game-history/GameHistory";
import { HistoryButtons } from "~/features/view-game-history/HistoryButtons";
import { $$state, $boardSize, $color, $status, time } from "~/game/model";
import { colors } from "~/shared/ui/colors";
import { Heading } from "~/shared/ui/components/Heading";
import { formatTimer } from "~/shared/utils/format";
import { useBreakpoint } from "~/shared/utils/useBreakpoints";

import { DrawButton } from "./DrawButton";
import { ResignButton } from "./ResignButton";

const TimerPanel = ({ isOpponent, isMobile }: { isOpponent: boolean; isMobile?: boolean }) => {
  const { color, turn, whiteTime, blackTime, status } = useUnit({
    color: $color,
    turn: $$state.$turn,
    whiteTime: time.white.$timer,
    blackTime: time.black.$timer,
    status: $status,
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
        <>
          <Heading variant="h4">
            {isOpponent ? `Opponent ${color === "white" ? "(black)" : "(white)"}` : `You (${color})`}
          </Heading>
          <div className="flex gap-1 h-full justify-end items-center">
            {!!color && turn === (isOpponent ? (color === "white" ? "b" : "w") : color[0]) && (
              <div
                className="w-5 h-5 flex justify-center items-center"
                style={{
                  background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
                }}
              >
                ♟️
              </div>
            )}
            <div>
              {isOpponent
                ? color === "white"
                  ? (formatTimer(blackTime) ?? "5:00")
                  : (formatTimer(whiteTime) ?? "5:00")
                : color === "white"
                  ? (formatTimer(whiteTime) ?? "5:00")
                  : (formatTimer(blackTime) ?? "5:00")}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
const ControlPanel = () => {
  const { status, color, value, isKingOnBoard, boardSize } = useUnit({
    status: $status,
    color: $color,
    value: $value,
    isKingOnBoard: $isKingOnBoard,
    boardSize: $boardSize,
  });
  return (
    <div className="w-full lg:h-full p-2 sm-p-4 lg-p-6 max-w-[600px]">
      {status === "pick" && (
        <div className=" h-full flex flex-row lg:flex-col gap-2">
          <PickPieces
            color={color ?? "white"}
            value={value ?? 25}
            isKingActive={!isKingOnBoard}
            boardWidth={boardSize}
          />
        </div>
      )}
      {status === "game" && (
        <div className={`h-full w-full flex flex-col lg:flex-col-reverse gap-2`}>
          <div className="flex justify-center items-center gap-0.5 sm:gap-1 md:gap-2">
            <HistoryButtons.ToFirst />
            <HistoryButtons.OneBack />
            <SwitchOrientationButton />
            <DrawButton />
            <ResignButton />
            <HistoryButtons.OneForward />
            <HistoryButtons.ToLast />
          </div>
          <div className="flex-1 overflow-auto">
            <GameHistory />
          </div>
        </div>
      )}
    </div>
  );
};
export const GamePanel = ({ children }: { children: React.ReactNode }) => {
  const { orientation, color, status } = useUnit({
    orientation: $boardOrientation,
    color: $color,
    status: $status,
  });

  const isDesktop = useBreakpoint("lg");

  return (
    <div className="flex flex-col lg:justify-center items-center lg:flex-row w-full h-full max-h-[600px] lg:gap-4">
      {/* Mobile: Top timer panel */}
      {!isDesktop && status !== "created" && (
        <div className="w-full flex justify-center">
          <TimerPanel isOpponent={true} isMobile={true} />
        </div>
      )}

      {/* Board */}
      <div className="w-full lg:w-auto">{children}</div>

      {/* Mobile: Bottom panels */}
      {!isDesktop && status !== "created" && (
        <div className="w-full flex flex-col items-center">
          {(status === "game" || status === "finished") && <TimerPanel isOpponent={false} isMobile={true} />}
          <ControlPanel />
        </div>
      )}

      {/* Desktop: Side panel */}
      {isDesktop && status !== "created" && (
        <div className="flex flex-col h-full max-h-[600px] w-[300px] bg-white border border-gray rounded">
          <div
            className={`flex flex-col h-full ${
              (orientation === "white" && color === "white") || (orientation === "black" && color === "black")
                ? ""
                : "flex-col-reverse"
            }`}
          >
            <TimerPanel isOpponent={true} />
            <div className="flex-1 overflow-hidden">
              <ControlPanel />
            </div>
            {status === "pick" ? <ConfirmPickButton /> : <TimerPanel isOpponent={false} />}
          </div>
        </div>
      )}
    </div>
  );
};
