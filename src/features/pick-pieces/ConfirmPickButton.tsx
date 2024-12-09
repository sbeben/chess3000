import classnames, { type Argument, type ArgumentArray, type Mapping } from "classnames";
import { useUnit } from "effector-react";
import { $isConfirmDisabled, $isPickConfirmed, picked } from "~/game/model";

export const ConfirmPickButton = ({ className }: { className?: classnames.Value }) => {
  const { confirm, isConfirmDisabled, isConfirmed } = useUnit({
    confirm: picked,
    isConfirmDisabled: $isConfirmDisabled,
    isConfirmed: $isPickConfirmed,
  });
  const style = classnames(
    className,
    "bg-blue w-full rounded p-1 md:p-2 lg:p-4 active:bg-blue-600 disabled:bg-blue-800 text-white lg:text-lg disabled:pointer-events-none disabled:cursor-not-allowed",
  );

  return (
    <button onClick={() => confirm()} disabled={isConfirmDisabled} className={style}>
      {isConfirmed ? "waiting" : "confirm"}
    </button>
  );
};
