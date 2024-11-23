import type { Square } from "react-chessboard/dist/chessboard/types";

import { type Piece, values } from "./model";
import { SparePiece } from "./parts";

type Props = {
  color: "white" | "black";
  value: number;
  isKingActive: boolean;
};

export const PickPieces = ({ color, value, isKingActive }: Props) => {
  return (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column", width: "fit-content" }}>
      <h2>Remaining points: {value}</h2>
      {["K", "Q", "R", "B", "N", "P"].map((piece) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <div
            style={{
              width: "fit-conten",
              height: "fit-content",
              opacity: values[piece as keyof typeof values] > value || (piece === "K" && !isKingActive) ? 0.5 : 1,
              pointerEvents:
                values[piece as keyof typeof values] > value || (piece === "K" && !isKingActive) ? "none" : "auto",
            }}
          >
            <SparePiece
              width={40}
              piece={`${color[0]}${piece}` as Piece}
              dndId={"dndId" + piece + color}
              key={"key" + piece + color}
            />
          </div>
          <p> - </p>
          <p>{values[piece as keyof typeof values]}</p>
        </div>
      ))}
    </div>
  );
};
