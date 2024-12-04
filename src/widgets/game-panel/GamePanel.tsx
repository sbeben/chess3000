import * as Game from "~/game/model";
import { useUnit } from "effector-react";
import { resign as resignEvent } from "~/features/finish-game/model";
import { colors } from "~/shared/ui/colors";
import { Heading } from "~/shared/ui/components/Heading";

import { DrawButton } from "./DrawButton";
import { ResignButton } from "./ResignButton";
import { SwitchOrientationButton } from "./SwitchOrientationButton";

export const GamePanel = () => {
  const { whiteTime, blackTime, orientation, currentMove, totalMoves, notation, backward, forward, color, turn } =
    useUnit({
      whiteTime: Game.time.$white,
      blackTime: Game.time.$black,
      currentMove: Game.$currentMove,
      totalMoves: Game.$totalMoves,
      notation: Game.$notation,
      orientation: Game.$boardOrientation,
      resign: resignEvent,
      offerDraw: Game.$$state.offerDraw,
      backward: Game.backward,
      forward: Game.forward,
      color: Game.$color,
      turn: Game.$$state.$turn,
    });

  return (
    <div
      style={{
        display: "flex",
        flexDirection:
          (orientation === "white" && color === "white") || (orientation === "black" && color === "black")
            ? "column"
            : "column-reverse",
        width: "100%",
        maxWidth: "400px",
        minWidth: "300px",
        maxHeight: "400px",
        height: "100%",
        backgroundColor: colors.white.DEFAULT,
        border: `1px solid ${colors.gray.DEFAULT}`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          background: colors.gray.DEFAULT,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px",
          height: "40px",
          width: "100%",
        }}
      >
        <Heading variant="h4">{`Opponent ${color === "white" ? "(black)" : "(white)"}`}</Heading>
        <div style={{ display: "flex", gap: "4px", height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
          {!!color && turn !== color[0] && (
            <div
              style={{
                width: "20px",
                height: "20px",
                background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              ♟️
            </div>
          )}

          <div>{color === "white" ? (blackTime ?? "5:00") : (whiteTime ?? "5:00")}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          maxHeight: "400px",
        }}
      >
        <div style={{ display: "flex", gap: "4px", width: "100%", justifyContent: "center" }}>
          <SwitchOrientationButton />
          <DrawButton />
          <ResignButton />
        </div>
        {/* <button
          onClick={backward}
          disabled={currentMove === 0}
          style={{
            padding: "8px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: currentMove === 0 ? 0.5 : 1,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H2V18H6V6ZM7 18L17 12L7 6V18Z" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={forward}
          disabled={currentMove === totalMoves}
          style={{
            padding: "8px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: currentMove === totalMoves ? 0.5 : 1,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 18H22V6H18V18ZM17 6L7 12L17 18V6Z" fill="currentColor" />
          </svg>
        </button> */}
      </div>
      <div
        style={{
          background: colors.gray.DEFAULT,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px",
          height: "40px",
          width: "100%",
        }}
      >
        <Heading variant="h4">{`You (${color})`}</Heading>
        <div style={{ display: "flex", gap: "4px", height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
          {!!color && turn === color[0] && (
            <div
              style={{
                width: "20px",
                height: "20px",
                background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              ♟️
            </div>
          )}
          <div>{color === "white" ? (whiteTime ?? "5:00") : (blackTime ?? "5:00")}</div>
        </div>
      </div>
      {/* <div style={{ marginTop: "8px", fontFamily: "monospace" }}>{notation}</div> */}
    </div>
  );
};
