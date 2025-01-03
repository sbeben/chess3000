import { SparePiece } from "~/game/parts";
import { values } from "~/game/parts/helpers";
import { P } from "~/shared/ui/components/P";
import type { Piece } from "~/types/game";

type Props = {
  color: "white" | "black";
  value: number;
  isKingActive: boolean;
  boardWidth: number;
};

export const PickPieces = ({ color, value, isKingActive, boardWidth }: Props) => {
  return ["K", "Q", "R", "B", "N", "P"].map((piece, i) => (
    <div key={`${piece}_${i}`} className="flex flex-col md:flex-row items-center gap-[2px]">
      <div
        style={{
          width: "fit-content",
          height: "fit-content",
          opacity: values[piece as keyof typeof values] > value || (piece === "K" && !isKingActive) ? 0.5 : 1,
          pointerEvents:
            values[piece as keyof typeof values] > value || (piece === "K" && !isKingActive) ? "none" : "auto",
        }}
      >
        <SparePiece
          width={boardWidth / 10}
          piece={`${color[0]}${piece}` as Piece}
          dndId="ManualBoardEditor"
          key={"key" + piece + color}
        />
      </div>
      <P className="hidden md:block"> - </P>
      <P>{values[piece as keyof typeof values]}</P>
    </div>
  ));
};
