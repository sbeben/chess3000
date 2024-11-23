import { clientOnly } from "vike-react/clientOnly";

export const DnDProvider = clientOnly(async () => (await import("react-chessboard")).ChessboardDnDProvider);
export const Board = clientOnly(async () => (await import("react-chessboard")).Chessboard);
export const SparePiece = clientOnly(async () => (await import("react-chessboard")).SparePiece);
