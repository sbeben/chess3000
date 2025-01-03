import { useUnit } from "effector-react";
import { colors } from "~/shared/ui/colors";

import { switchOrientation } from "./model";

export const SwitchOrientationButton = () => {
  const change = useUnit(switchOrientation);
  return (
    <button
      onClick={() => change()}
      style={{
        padding: "8px",
        background: colors.white.DEFAULT,
        border: `1px solid ${colors.gray.DEFAULT}`,
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      🔄
    </button>
  );
};
