import { useUnit } from "effector-react";
import { resign as resignEvent } from "~/features/finish-game/model";
import { ConfirmPickButton } from "~/features/pick-pieces/ConfirmPickButton";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { ValueInfo } from "~/features/pick-pieces/ValueInfo";
import { GameHistory } from "~/features/view-game-history/GameHistory";
import { $$state, $boardOrientation, $boardSize, $color, $isKingOnBoard, $status, $value, time } from "~/game/model";
import { colors } from "~/shared/ui/colors";
import { Heading } from "~/shared/ui/components/Heading";
import { formatTimer } from "~/shared/utils/format";
import { useBreakpoint } from "~/shared/utils/useBreakpoints";

import { DrawButton } from "./DrawButton";
import { ResignButton } from "./ResignButton";
import { SwitchOrientationButton } from "./SwitchOrientationButton";

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
      bg-gray flex justify-between items-center px-2 md:px-3 py-2 md:py-3 w-full max-w-[600px]
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
    <div className="w-full h-full p-2 sm-p-4 lg-p-6 max-w-[600px] flex justify-center items-center">
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
        <div className={` h-full flex flex-col lg:flex-col-reverse lg:justify-between gap-2 items-center`}>
          <div className="flex items-center gap-2">
            <SwitchOrientationButton />
            <DrawButton />
            <ResignButton />
          </div>
          <GameHistory />
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
        <div className="flex flex-col h-full w-[300px] bg-white border border-gray rounded">
          <div
            className={`flex flex-col h-full ${
              (orientation === "white" && color === "white") || (orientation === "black" && color === "black")
                ? ""
                : "flex-col-reverse"
            }`}
          >
            <TimerPanel isOpponent={true} />

            <ControlPanel />

            {status === "pick" ? <ConfirmPickButton /> : <TimerPanel isOpponent={false} />}
          </div>
        </div>
      )}
    </div>
  );
};
