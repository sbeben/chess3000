import { useUnit } from "effector-react";
import { $remainingPoints } from "~/game/model";

export const ValueInfo = () => {
  const value = useUnit($remainingPoints);
  return (
    <div className="flex gap-2 items-center">
      <h4 className="inline text-sm font-semibold sm:text-lg">Remaining points:</h4>
      <h4 className={`text-sm font-semibold sm:text-lg ${value >= 0 ? "text-black" : "text-red"}`}>{value}</h4>
    </div>
  );
};
