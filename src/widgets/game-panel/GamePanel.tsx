import * as Game from "~/game/model";
import { useUnit } from "effector-react";
import { resign as resignEvent } from "~/features/finish-game/model";
import { colors } from "~/shared/ui/colors";
import { Heading } from "~/shared/ui/components/Heading";

import { DrawButton } from "./DrawButton";
import { ResignButton } from "./ResignButton";

export const GamePanel = () => {
  const { whiteTime, blackTime, currentMove, totalMoves, notation, switchOrientation, backward, forward, color } =
    useUnit({
      whiteTime: Game.time.$white,
      blackTime: Game.time.$black,
      currentMove: Game.$currentMove,
      totalMoves: Game.$totalMoves,
      notation: Game.$notation,
      switchOrientation: Game.switchOrientation,
      resign: resignEvent,
      offerDraw: Game.$$state.offerDraw,
      backward: Game.backward,
      forward: Game.forward,
      color: Game.$color,
    });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
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
        <div>{color === "white" ? (blackTime ?? "5:00") : (whiteTime ?? "5:00")}</div>
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
        {/* <button
          onClick={switchOrientation}
          style={{
            padding: "8px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17.01V10H14V17.01H11L15 21L19 17.01H16ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="currentColor" />
          </svg>
        </button> */}
        <div style={{ display: "flex", gap: "4px", width: "100%", justifyContent: "center" }}>
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
        <div>{color === "white" ? (whiteTime ?? "5:00") : (blackTime ?? "5:00")}</div>
      </div>
      {/* <div style={{ marginTop: "8px", fontFamily: "monospace" }}>{notation}</div> */}
    </div>
  );
};
