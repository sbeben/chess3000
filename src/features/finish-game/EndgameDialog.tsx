import { useMemo } from "react";

import * as Game from "~/game/model";
import { useUnit } from "effector-react";
import { clientNavigate } from "~/shared/routing";

export const EndgameDialog = () => {
  const { isOver, result, playerColor, navigate } = useUnit({
    isOver: Game.$$state.$isOver,
    result: Game.$$state.$result,
    playerColor: Game.$$state.$playerColor,
    navigate: clientNavigate,
  });

  if (!isOver || !result) return null;

  const resultText = useMemo(() => {
    if (result === "black") {
      return playerColor === "b" ? "You won!" : "You lost";
    } else if (result === "white") {
      return playerColor === "w" ? "You won!" : "You lost";
    } else {
      return "Draw";
    }
  }, [isOver]);

  return (
    <dialog
      open
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        padding: "16px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        border: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <h3>{resultText}</h3>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px",
            borderRadius: "0 4px 4px 0",
            border: "1px solid #ccc",
            borderLeft: "none",
            background: "white",
            cursor: "pointer",
          }}
        >
          Exit
        </button>
      </div>
    </dialog>
  );
};
