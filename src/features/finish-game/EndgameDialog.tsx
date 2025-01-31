import { useMemo, useState } from "react";

import { useUnit } from "effector-react";
import { $$state } from "~/game/model";
import { clientNavigate } from "~/shared/routing";
import { Button } from "~/shared/ui/components/Button";
import { H } from "~/shared/ui/components/H";
import { P } from "~/shared/ui/components/P";

import { $gameOverReason, closeEndgameDialogClicked } from "./model";

export const EndgameDialog = () => {
  const { isOver, result, playerColor, navigate, reason, close } = useUnit({
    isOver: $$state.$isOver,
    result: $$state.$result,
    playerColor: $$state.$playerColor,
    navigate: clientNavigate,
    reason: $gameOverReason,
    close: closeEndgameDialogClicked,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <dialog
        open
        className="relative p-4 translate-y-[-10%] bg-white dark:bg-gray shadow-lg rounded-lg border-none max-w-md mx-4"
      >
        <div className="flex flex-col items-center gap-2">
          <H variant="h3">{resultText}</H>
          {!!reason && <P>{reason}</P>}
          <div className="flex gap-1">
            <Button onClick={() => close()} variant="white">
              Analyze game
            </Button>

            <Button onClick={() => navigate("/")} variant="secondary">
              Exit
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
