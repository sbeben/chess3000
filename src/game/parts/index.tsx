import { clientOnly } from "vike-react/clientOnly";

export const DnDProvider = clientOnly(async () => {
  const { HTML5Backend } = await import("react-dnd-html5-backend");
  const { ChessboardDnDProvider } = await import("react-chessboard");

  return function CombinedProvider({ children }) {
    return <ChessboardDnDProvider backend={HTML5Backend}>{children}</ChessboardDnDProvider>;
  };
});
export const Board = clientOnly(async () => (await import("react-chessboard")).Chessboard);
export const SparePiece = clientOnly(async () => (await import("react-chessboard")).SparePiece);
