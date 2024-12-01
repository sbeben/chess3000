import { useEffect, useMemo, useState } from "react";

import * as Game from "~/game/model";
import { useGate, useUnit } from "effector-react";
import { clientOnly } from "vike-react/clientOnly";
import { EndgameDialog } from "~/features/finish-game/EndgameDialog";
import { SendInviteDialog } from "~/features/handle-invite/SendInviteDialog";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { FEN, sparePieceDropped } from "~/game/model";
import { Board, DnDProvider } from "~/game/parts";
import { Link, clientNavigate } from "~/shared/routing";

import { gate } from "./model";

interface CustomSquareStyles {
  [square: string]: React.CSSProperties;
}

const squareStyles = {
  selectedSquare: {
    backgroundColor: "rgba(255, 255, 0, 0.4)",
  },
  validMove: {
    background: `radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)`,
    cursor: "pointer",
  },
  captureMove: {
    background: `radial-gradient(circle, rgba(255,0,0,.1) 25%, transparent 25%)`,
    cursor: "pointer",
  },
  checkedKing: {
    background: `radial-gradient(circle, 'rgba(255, 0, 0, 0.4)' 75%)`,
  },
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
    resign: Game.$$state.resign,
    offerDraw: Game.$$state.offerDraw,
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
  const {
    sparePieceDrop,
    value,
    color,
    isKingOnBoard,
    pieceDroppedOff,
    status,
    position,
    positionChanged,
    pregamePosition,
    game,
    move,
    //
    validMoves,
    selectedSquare,
    squareClicked,
  } = useUnit({
    sparePieceDrop: sparePieceDropped,
    pieceDroppedOff: Game.pieceDroppedOffBoard,
    value: Game.$value,
    color: Game.$color,
    isKingOnBoard: Game.$isKingOnBoard,
    status: Game.$status,
    positionChanged: Game.positionChanged,
    pregamePosition: Game.$positionObject,
    //
    position: Game.$$state.$fen,
    game: Game.$$state.$chess,
    move: Game.$$state.move,
    //
    squareClicked: Game.$$state.squareClicked,
    validMoves: Game.$$state.$validMoves,
    selectedSquare: Game.$$state.$selectedSquare,
  });
  useGate(gate);
  const getSquareStyles = (): CustomSquareStyles => {
    const styles: CustomSquareStyles = {};

    if (selectedSquare) {
      styles[selectedSquare] = squareStyles.selectedSquare;

      validMoves.forEach((move) => {
        styles[move.to] = {
          ...(game.get(move.to) ? squareStyles.captureMove : squareStyles.validMove),
        };
      });

      if (game.isCheck()) {
        console.log("here");
        const kingSquare = game
          .board()
          .flat()
          .find((square) => square?.type === "k" && square.color === game.turn())?.square;
        console.log("kingSquareFound", kingSquare);
        if (kingSquare) {
          styles[kingSquare] = {
            ...squareStyles.checkedKing,
            ...(styles[kingSquare] || {}),
          };
        }
      }
    }

    return styles;
  };
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
          <div style={{ position: "relative", height: "fit-content", width: "fit-content" }}>
            <Board
              id="ManualBoardEditor"
              position={["created", "pick"].includes(status) ? (pregamePosition ?? FEN.empty) : (position ?? FEN.empty)}
              onPieceDrop={(from, to, piece) => {
                console.log("herrreee");
                if (status === "pick") {
                  const { [from]: piece, ...rest } = pregamePosition!;
                  positionChanged({ ...rest, [to]: piece });
                } else {
                  move({ from, to, promotion: piece[1]?.toLowerCase() });
                }
                return true;
              }}
              isDraggablePiece={({ piece }) => piece[0]?.toLowerCase() === color![0]}
              onSquareClick={(square) => squareClicked(square)}
              // getPositionObject={(p) => positionChanged(p)}
              boardWidth={400}
              showPromotionDialog={true}
              boardOrientation={color ?? "white"}
              showBoardNotation={true}
              dropOffBoardAction={status === "pick" ? "trash" : "snapback"}
              onSparePieceDrop={(piece, square) => {
                console.log("sparePPP");
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
              customSquareStyles={getSquareStyles()}
            />
            {status === "pick" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                }}
              />
            )}
          </div>
          {status === "pick" && (
            <PickPieces color={color ?? "white"} value={value ?? 25} isKingActive={!isKingOnBoard} />
          )}
        </div>
      </DnDProvider>
      {status === "game" && <GamePanel />}
      {status === "created" && <SendInviteDialog />}
      {status === "finished" && <EndgameDialog />}
    </div>
  );
}
