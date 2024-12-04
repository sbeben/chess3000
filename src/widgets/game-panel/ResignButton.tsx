import { useUnit } from "effector-react";
import { $isResignClicked, resignClicked } from "~/features/finish-game/model";
import { colors } from "~/shared/ui/colors";

export const ResignButton = () => {
  const { click, isResignClicked } = useUnit({ click: resignClicked, isResignClicked: $isResignClicked });
  return (
    <button
      onClick={() => click()}
      style={{
        padding: "8px",
        background: isResignClicked ? colors.red.DEFAULT : colors.white.DEFAULT,
        border: `1px solid ${colors.gray.DEFAULT}`,
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
          fill="currentColor"
        />
      </svg> */}
      🏳️
    </button>
  );
};
