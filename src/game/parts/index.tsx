import { clientOnly } from "vike-react/clientOnly";

export const DnDProvider = clientOnly(async () => {
  //const { HTML5Backend } = await import("react-dnd-html5-backend");
  const { MultiBackend } = await import("react-dnd-multi-backend");
  const { ChessboardDnDProvider } = await import("react-chessboard");
  const { HTML5toTouch } = await import("rdndmb-html5-to-touch");
  return function CombinedProvider({ children }) {
    return (
      <ChessboardDnDProvider backend={MultiBackend} options={HTML5toTouch}>
        {children}
      </ChessboardDnDProvider>
    );
  };
});
export const Board = clientOnly(async () => (await import("react-chessboard")).Chessboard);
export const SparePiece = clientOnly(async () => (await import("react-chessboard")).SparePiece);
