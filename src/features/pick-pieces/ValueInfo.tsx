import { useUnit } from "effector-react";
import { H } from "~/shared/ui/components/H";

import { $remainingPoints } from "./model";

export const ValueInfo = () => {
  const value = useUnit($remainingPoints);
  return (
    <div className="flex gap-2 items-center">
      <H variant="h4" className="inline text-sm font-semibold sm:text-lg">
        Remaining points:
      </H>
      <H variant="h4" className={`text-sm font-semibold sm:text-lg ${value >= 0 ? "text-black" : "text-red"}`}>
        {value}
      </H>
    </div>
  );
};
