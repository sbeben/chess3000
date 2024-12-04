import * as Game from "~/game/model";
import { useGate, useUnit } from "effector-react";
import { EndgameDialog } from "~/features/finish-game/EndgameDialog";
import { SendInviteDialog } from "~/features/handle-invite/SendInviteDialog";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { FEN, sparePieceDropped } from "~/game/model";
import { Board, DnDProvider } from "~/game/parts";
import { GamePanel } from "~/widgets/game-panel/GamePanel";

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
    background: "rgba(255, 0, 0, 0.4)",
  },
};

export function Page() {
  const {
    pieceDrop,
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
    promotionSelect,
    scheduledPromotion,
    showPromotionDialog,
    //
    orientation,
  } = useUnit({
    pieceDrop: Game.pieceDropped,
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
    promotionSelect: Game.$$state.promotionPieceSelected,
    scheduledPromotion: Game.$$state.$scheduledPromotion,
    showPromotionDialog: Game.$$state.$shouldShowPromotion,
    //
    orientation: Game.$boardOrientation,
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
    }
    if (game.isCheck()) {
      const kingSquare = game
        .board()
        .flat()
        .find((square) => square?.type === "k" && square.color === game.turn())?.square;
      if (kingSquare) {
        styles[kingSquare] = {
          ...squareStyles.checkedKing,
          ...(styles[kingSquare] || {}),
        };
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
                pieceDrop({ from, to, piece });
                return true;
              }}
              isDraggablePiece={({ piece }) => piece[0]?.toLowerCase() === color![0]}
              //@ts-expect-error
              onSquareClick={(square, piece) => squareClicked({ square, piece: piece || null })}
              onPromotionPieceSelect={(pr, from, to) => {
                console.log({ pr, from, to });
                //@ts-expect-error
                promotionSelect(pr || null);
                return true;
              }}
              // getPositionObject={(p) => positionChanged(p)}
              boardWidth={400}
              showPromotionDialog={showPromotionDialog}
              promotionToSquare={!!scheduledPromotion ? scheduledPromotion.to || undefined : undefined}
              // onPromotionCheck={(_, __, piece) => {
              //   console.log({ promotionPiece: piece });

              //   return true;
              // }}
              boardOrientation={orientation}
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
          {status === "game" && <GamePanel />}
        </div>
      </DnDProvider>

      {status === "created" && <SendInviteDialog />}
      {status === "finished" && <EndgameDialog />}
    </div>
  );
}
