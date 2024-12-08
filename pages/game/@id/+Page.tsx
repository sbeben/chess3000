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

    // Set base colors first
    for (let file = "a".charCodeAt(0); file <= "h".charCodeAt(0); file++) {
      for (let rank = 1; rank <= 8; rank++) {
        const square = `${String.fromCharCode(file)}${rank}`;
        const baseColor = isLightSquare(square) ? colors.white.DEFAULT : colors.blue.DEFAULT;
        styles[square] = {
          background: baseColor, // Changed from backgroundColor to background
        };
      }
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        background: colors.green_yellow.DEFAULT,
      };

      validMoves.forEach((move) => {
        const baseColor = isLightSquare(move.to) ? colors.white.DEFAULT : colors.blue.DEFAULT;
        styles[move.to] = {
          ...styles[move.to],
          background: game.get(move.to)
            ? `radial-gradient(circle, rgba(255,0,0,.1) 25%, transparent 25%), ${baseColor}`
            : `radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%), ${baseColor}`,
          cursor: "pointer",
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
          ...styles[kingSquare],
          background: colors.red.DEFAULT,
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
    <div className="h-full w-full pt-1 sm:2 md:pt-8 lg:pt-10 ">
      <DnDProvider>
        <GamePanel boardWidth={calculateBoardWidth()}>
          <div className="flex items-center justify-center md:justify-center flex-col md:flex-row gap-4 w-full">
            <div className="relative h-fit w-fit max-w-full">
              <Board
                id="ManualBoardEditor"
                position={
                  ["created", "pick"].includes(status) ? (pregamePosition ?? FEN.empty) : (position ?? FEN.empty)
                }
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
              {status === "pick" && <div className="absolute top-0 left-0 w-full h-1/2 bg-gray opacity-70" />}
            </div>
          </div>
        </GamePanel>
      </DnDProvider>
      {status === "created" && <SendInviteDialog />}
      {status === "finished" && <EndgameDialog />}
    </div>
  );
}
