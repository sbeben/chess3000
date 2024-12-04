import { useUnit } from "effector-react";
import {
  $isOfferDrawClicked,
  $opponentOfferedDraw,
  acceptDraw,
  declineDraw,
  offerDrawClicked,
} from "~/features/finish-game/model";
import { colors } from "~/shared/ui/colors";

export const DrawButton = () => {
  const { click, isDrawClicked, opponentOffered, accept, decline } = useUnit({
    click: offerDrawClicked,
    isDrawClicked: $isOfferDrawClicked,
    opponentOffered: $opponentOfferedDraw,
    accept: acceptDraw,
    decline: declineDraw,
  });
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center", minWidth: "40px" }}>
      {!opponentOffered ? (
        <button
          onClick={click}
          style={{
            padding: "8px",
            background: isDrawClicked ? colors.blue.DEFAULT : colors.white.DEFAULT,
            border: `1px solid ${colors.gray.DEFAULT}`,
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 9H16V11H8V9ZM8 13H16V15H8V13ZM8 5H16V7H8V5ZM4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21ZM4 5H20V19H4V5Z"
          fill="currentColor"
        />
      </svg> */}
          🫱🏿‍🫲🏻
        </button>
      ) : (
        <>
          <button onClick={() => accept()}>a</button>
          <button onClick={() => decline()}>d</button>
        </>
      )}
    </div>
  );
};
