import { useEffect, useState } from "react";

import * as Game from "~/game/model";
import { useGate, useUnit } from "effector-react";
import { clientOnly } from "vike-react/clientOnly";
import { PickPieces } from "~/game/PickPieces";
import { FEN, sparePieceDropped } from "~/game/model";
import { Board, DnDProvider } from "~/game/parts";
import { Link } from "~/shared/routing";

import { gate } from "./model";

const InviteDialog = () => {
  const { inviteLink } = useUnit({
    inviteLink: Game.$inviteLink,
  });
  if (!inviteLink) return null;
  return (
    <dialog
      open
      style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "16px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        border: "none",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>Send link to invite a competitor</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={inviteLink}
          readOnly
          style={{
            padding: "8px",
            borderRadius: "4px 0 0 4px",
            border: "1px solid #ccc",
            flexGrow: 1,
          }}
        />
        <button
          onClick={() => navigator.clipboard.writeText(inviteLink)}
          style={{
            padding: "8px",
            borderRadius: "0 4px 4px 0",
            border: "1px solid #ccc",
            borderLeft: "none",
            background: "white",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 0H6C4.9 0 4 0.9 4 2V10C4 11.1 4.9 12 6 12H13C14.1 12 15 11.1 15 10V2C15 0.9 14.1 0 13 0ZM13 10H6V2H13V10ZM2 4H0V14C0 15.1 0.9 16 2 16H12V14H2V4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </dialog>
  );
};

const GamePanel = () => {
  const {
    whiteTime,
    blackTime,
    currentMove,
    totalMoves,
    notation,
    switchOrientation,
    resign,
    offerDraw,
    backward,
    forward,
  } = useUnit({
    whiteTime: Game.time.$white,
    blackTime: Game.time.$black,
    currentMove: Game.$currentMove,
    totalMoves: Game.$totalMoves,
    notation: Game.$notation,
    switchOrientation: Game.switchOrientation,
    resign: Game.resign,
    offerDraw: Game.offerDraw,
    backward: Game.backward,
    forward: Game.forward,
  });

  const [isOfferDrawClicked, setIsOfferDrawClicked] = useState(false);
  const [isResignClicked, setIsResignClicked] = useState(false);

  const handleResign = () => {
    if (isResignClicked) {
      resign();
    } else {
      setIsResignClicked(true);
    }
  };

  const handleOfferDraw = () => {
    if (isOfferDrawClicked) {
      offerDraw();
    } else {
      setIsOfferDrawClicked(true);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOfferDrawClicked) {
      timer = setTimeout(() => {
        setIsOfferDrawClicked(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isOfferDrawClicked]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResignClicked) {
      timer = setTimeout(() => {
        setIsResignClicked(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isResignClicked]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{whiteTime ?? "5:00"}</div>
        <div>{blackTime ?? "5:00"}</div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
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
        </button>
        <button
          onClick={handleResign}
          style={{
            padding: "8px",
            background: isResignClicked ? "red" : "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          onClick={handleOfferDraw}
          style={{
            padding: "8px",
            background: isOfferDrawClicked ? "yellow" : "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 9H16V11H8V9ZM8 13H16V15H8V13ZM8 5H16V7H8V5ZM4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21ZM4 5H20V19H4V5Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
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
        </button>
      </div>
      <div style={{ marginTop: "8px", fontFamily: "monospace" }}>{notation}</div>
    </div>
  );
};

export function Page() {
  const { sparePieceDrop, value, color, isKingOnBoard, pieceDroppedOff, status, position, positionChanged } = useUnit({
    sparePieceDrop: sparePieceDropped,
    pieceDroppedOff: Game.pieceDroppedOffBoard,
    value: Game.$value,
    color: Game.$color,
    isKingOnBoard: Game.$isKingOnBoard,
    status: Game.$status,
    position: Game.$position,
    positionChanged: Game.positionChanged,
  });
  useGate(gate);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <DnDProvider>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Board
            id="ManualBoardEditor"
            position={position ?? FEN.empty}
            getPositionObject={(p) => positionChanged(p)}
            boardWidth={400}
            showPromotionDialog={true}
            boardOrientation={color ?? "white"}
            showBoardNotation={true}
            dropOffBoardAction={status === "pick" ? "trash" : "snapback"}
            onSparePieceDrop={(piece, square) => {
              let canDrop = true;
              if (
                (piece[1] === "K" && isKingOnBoard) ||
                ((color ?? "white") === "white" && !["1", "2", "3", "4"].includes(square[1]!)) ||
                ((color ?? "white") === "black" && !["5", "6", "7", "8"].includes(square[1]!))
              ) {
                canDrop = false;
              }
              if (canDrop) sparePieceDrop({ piece, square });
              return canDrop;
            }}
            onPieceDropOffBoard={(square, piece) => pieceDroppedOff({ piece, square })}
          />
          {status === "pick" && (
            <PickPieces color={color ?? "white"} value={value ?? 25} isKingActive={!isKingOnBoard} />
          )}
        </div>
      </DnDProvider>
      {status === "game" && <GamePanel />}
      {status === "created" && <InviteDialog />}
    </div>
  );
}
