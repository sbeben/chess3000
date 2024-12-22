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
      {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 17.01V10H14V17.01H11L15 21L19 17.01H16ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="currentColor" />
      </svg> */}
      🔄
    </button>
  );
};
