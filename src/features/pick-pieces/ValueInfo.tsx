import { useUnit } from "effector-react";
import { $value } from "~/game/model";

export const ValueInfo = () => {
  const value = useUnit($value);
  return <h4 className="text-sm font-semibold sm:text-lg">Remaining points: {value}</h4>;
};
