//@ts-nocheck

export const FEN = { empty: "8/8/8/8/8/8/8/8 w - - 0 1" };

type ChessPosition = { [key: string]: string };

export function customToFen(position: ChessPosition): string {
  // Initialize an empty 8x8 board
  const board: string[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(""));

  // Map file letters to column indices
  const fileToCol: { [key: string]: number } = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };

  // Place pieces on the board
  for (const [square, piece] of Object.entries(position)) {
    const file = square[0];
    const rank = parseInt(square[1]);
    const col = fileToCol[file];
    const row = 8 - rank;
    board[row][col] = piece;
  }

  // Check if kings are present and add them if not
  const whiteKingPresent = board.some((row) => row.includes("wK"));
  const blackKingPresent = board.some((row) => row.includes("bK"));

  if (!whiteKingPresent) addKing(board, "w");
  if (!blackKingPresent) addKing(board, "b");

  // Convert board to FEN
  let fen = "";
  for (const row of board) {
    let empty = 0;
    for (const square of row) {
      if (square === "") {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty.toString();
          empty = 0;
        }
        fen += pieceToFen(square);
      }
    }
    if (empty > 0) {
      fen += empty.toString();
    }
    fen += "/";
  }

  // Remove trailing slash and add other FEN components
  fen = fen.slice(0, -1) + " w KQkq - 0 1";

  return fen;
}

function addKing(board: string[][], color: "w" | "b"): void {
  const side = color === "w" ? [6, 7] : [0, 1];
  const emptySquares: [number, number][] = [];

  for (const row of side) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === "") {
        emptySquares.push([row, col]);
      }
    }
  }

  if (emptySquares.length > 0) {
    const [row, col] = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    board[row][col] = color + "K";
  }
}

function pieceToFen(piece: string): string {
  const [color, type] = piece.split("");
  return color === "w" ? type.toUpperCase() : type.toLowerCase();
}

// Example usage
const position: ChessPosition = { f1: "wB", f2: "wN", d1: "wK", f4: "wQ", e3: "wQ" };
const fen = customToFen(position);
console.log(fen);
