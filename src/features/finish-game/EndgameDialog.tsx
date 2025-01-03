import { useMemo } from "react";

import { useUnit } from "effector-react";
import { $$state } from "~/game/model";
import { clientNavigate } from "~/shared/routing";
import { Button } from "~/shared/ui/components/Button";
import { H } from "~/shared/ui/components/H";

export const EndgameDialog = () => {
  const { isOver, result, playerColor, navigate } = useUnit({
    isOver: $$state.$isOver,
    result: $$state.$result,
    playerColor: $$state.$playerColor,
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
      className="
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        p-4 
        bg-white 
        shadow-lg 
        rounded-lg 
        border-none
      "
    >
      <div className="flex flex-col items-center gap-2">
        <H variant="h3">{resultText}</H>

        <Button onClick={() => navigate("/")} variant="secondary">
          Exit
        </Button>
      </div>
    </dialog>
  );
};
