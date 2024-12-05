import { useEffect, useLayoutEffect, useState } from "react";

import * as Game from "~/game/model";
import { useGate, useUnit } from "effector-react";
import { EndgameDialog } from "~/features/finish-game/EndgameDialog";
import { SendInviteDialog } from "~/features/handle-invite/SendInviteDialog";
import { PickPieces } from "~/features/pick-pieces/PickPieces";
import { FEN, sparePieceDropped } from "~/game/model";
import { Board, DnDProvider } from "~/game/parts";
import { colors } from "~/shared/ui/colors";
import { GamePanel } from "~/widgets/game-panel/GamePanel";

import { gate } from "./model";

interface CustomSquareStyles {
  [square: string]: React.CSSProperties;
}

const squareStyles = {
  selectedSquare: {
    backgroundColor: colors.green_yellow.DEFAULT,
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
    background: colors.red.DEFAULT,
  },
};

const isLightSquare = (square: string): boolean => {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]!) - 1;
  return (file + rank) % 2 === 0;
};

export function Page() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    validMoves,
    selectedSquare,
    squareClicked,
    promotionSelect,
    scheduledPromotion,
    showPromotionDialog,
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
    position: Game.$$state.$fen,
    game: Game.$$state.$chess,
    move: Game.$$state.move,
    squareClicked: Game.$$state.squareClicked,
    validMoves: Game.$$state.$validMoves,
    selectedSquare: Game.$$state.$selectedSquare,
    promotionSelect: Game.$$state.promotionPieceSelected,
    scheduledPromotion: Game.$$state.$scheduledPromotion,
    showPromotionDialog: Game.$$state.$shouldShowPromotion,
    orientation: Game.$boardOrientation,
  });

  useGate(gate);

  const getSquareStyles = (): CustomSquareStyles => {
    const styles: CustomSquareStyles = {};

    // for (let file = "a".charCodeAt(0); file <= "h".charCodeAt(0); file++) {
    //   for (let rank = 1; rank <= 8; rank++) {
    //     const square = `${String.fromCharCode(file)}${rank}`;
    //     styles[square] = {
    //       backgroundColor: isLightSquare(square) ? colors.white.DEFAULT : colors.blue.DEFAULT,
    //     };
    //   }
    // }

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

  const calculateBoardWidth = () => {
    if (!isMounted) return 400;
    const padding = 0; // 16px padding on each side
    const maxWidth = 600;
    return Math.min(windowWidth - padding, maxWidth);
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        paddingTop: "40px",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <DnDProvider>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: windowWidth <= 768 ? "flex-start" : "center",
            flexDirection: windowWidth <= 768 ? "column" : "row",
            gap: "16px",
            maxWidth: "864px",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "fit-content",
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
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
                //@ts-expect-error
                promotionSelect(pr || null);
                return true;
              }}
              boardWidth={calculateBoardWidth()}
              showPromotionDialog={showPromotionDialog}
              promotionToSquare={!!scheduledPromotion ? scheduledPromotion.to || undefined : undefined}
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
              customNotationStyle={{ color: colors.red.DEFAULT }}
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
          <div style={{ width: windowWidth <= 768 ? "100%" : "auto" }}>
            {status === "pick" && (
              <PickPieces color={color ?? "white"} value={value ?? 25} isKingActive={!isKingOnBoard} />
            )}
            {status === "game" && <GamePanel />}
          </div>
        </div>
      </DnDProvider>

      {status === "created" && <SendInviteDialog />}
      {status === "finished" && <EndgameDialog />}
    </div>
  );
}
