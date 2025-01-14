import { useMemo } from "react";

import classNames from "classnames";
import { clientOnly } from "vike-react/clientOnly";

export const DnDProvider = clientOnly(async () => {
  //const { HTML5Backend } = await import("react-dnd-html5-backend");
  const { MultiBackend } = await import("react-dnd-multi-backend");
  const { ChessboardDnDProvider } = await import("~/game/parts/chessboard/");
  const { HTML5toTouch } = await import("rdndmb-html5-to-touch");
  return function CombinedProvider({ children }) {
    return (
      <ChessboardDnDProvider backend={MultiBackend} options={HTML5toTouch}>
        {children}
      </ChessboardDnDProvider>
    );
  };
});
export const Board = clientOnly(async () => (await import("~/game/parts/chessboard/")).Chessboard);
export const SparePiece = clientOnly(async () => (await import("~/game/parts/chessboard/")).SparePiece);

export const Timer = ({ time }: { time: number }) => {
  const { h, m, s, ms } = useMemo(() => {
    const totalSeconds = Math.floor(time / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const ms = Math.floor((time % 1000) / 10); // Fixed milliseconds calculation

    return { h, m, s, ms };
  }, [time]);

  const textSizeStyles = classNames("text-sm sm:text-base md:text-lg xl:text-xl");

  return (
    <div className={`flex p-1 gap-0.5 items-center`}>
      {h > 0 && (
        <>
          <p className={`${textSizeStyles}`}>{h}</p>
          <p className={`${textSizeStyles}`}>:</p>
        </>
      )}
      <p className={`${textSizeStyles}`}>{m < 10 ? `0${m}` : m}</p>
      <p className={`${textSizeStyles}`}>:</p>
      <p className={`${textSizeStyles}`}>{s < 10 ? `0${s}` : s}</p>
      {h < 1 && m < 1 && s < 10 && (
        <>
          <p className={`${textSizeStyles}`}>:</p>
          <p className={`${classNames(textSizeStyles)}`}>{ms < 10 ? `0${ms}` : ms}</p>
        </>
      )}
    </div>
  );
};
